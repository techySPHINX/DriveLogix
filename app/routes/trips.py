from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app import models, schemas
from app.db import get_db
from app.routes.auth import role_required
from app.utils import (
    check_geofence, calculate_distance, send_flash_notification,
    get_best_route_from_api
)
from app.models import DelayReport, Trip
from typing import List

router = APIRouter()


@router.post("/")
async def create_trip(
    trip: schemas.TripCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(role_required("admin"))
):
    """Create a new trip and assign it to a vehicle."""
    vehicle = db.query(models.Vehicle).filter(
        models.Vehicle.id == trip.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    new_trip = models.Trip(**trip.dict(), status="In-Route")
    db.add(new_trip)
    db.commit()
    db.refresh(new_trip)

    # Add intermediate destinations if provided
    if trip.intermediate_destinations:
        for sequence, destination in enumerate(trip.intermediate_destinations, start=1):
            intermediate = models.IntermediateDestination(
                trip_id=new_trip.id, destination=destination, sequence=sequence
            )
            db.add(intermediate)
        db.commit()

    return {"message": "Trip created successfully", "trip_id": new_trip.id}


@router.get("/{vehicle_id}")
async def get_trips(vehicle_id: int, db: Session = Depends(get_db)):
    """Retrieve all trips assigned to a specific vehicle."""
    trips = db.query(models.Trip).filter(
        models.Trip.vehicle_id == vehicle_id).all()
    if not trips:
        raise HTTPException(
            status_code=404, detail="No trips found for this vehicle")
    return trips


@router.patch("/{trip_id}/status")
async def update_trip_status(
    trip_id: int, status: str, db: Session = Depends(get_db),
    user: models.User = Depends(role_required("admin"))
):
    """Update the status of a trip (e.g., In-Route, Delivered, Delayed)."""
    trip = db.query(models.Trip).filter(models.Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    trip.status = status
    trip.updated_at = datetime.utcnow()
    db.commit()

    return {"message": f"Trip status updated to {status}"}


@router.post("/{trip_id}/vote")
async def vote_trip(
    trip_id: int, vote: str, db: Session = Depends(get_db),
    user: models.User = Depends(role_required("driver"))
):
    """Allow drivers to upvote or downvote trip performance."""
    trip = db.query(models.Trip).filter(models.Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    if vote == "upvote":
        trip.upvotes += 1
    elif vote == "downvote":
        trip.downvotes += 1
    else:
        raise HTTPException(status_code=400, detail="Invalid vote type")

    db.commit()
    return {"message": f"Trip {vote}d successfully"}


@router.put("/{trip_id}/add-intermediate-destination/")
async def add_intermediate_destination(
    trip_id: int, destination: str, sequence: int,
    db: Session = Depends(get_db), user: models.User = Depends(role_required("admin"))
):
    """Admin can add an intermediate destination to an existing trip."""
    trip = db.query(models.Trip).filter(models.Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    intermediate = models.IntermediateDestination(
        trip_id=trip_id, destination=destination, sequence=sequence
    )
    db.add(intermediate)
    db.commit()
    db.refresh(intermediate)

    return {"message": "Intermediate destination added successfully", "destination": intermediate}


@router.get("/{trip_id}/intermediate_destinations")
async def get_intermediate_destinations(
    trip_id: int, db: Session = Depends(get_db), user: models.User = Depends(role_required("driver"))
):
    """Get intermediate destinations for a specific trip."""
    trip = db.query(models.Trip).filter(models.Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    intermediate_destinations = db.query(models.IntermediateDestination).filter(
        models.IntermediateDestination.trip_id == trip_id
    ).order_by(models.IntermediateDestination.sequence).all()

    if not intermediate_destinations:
        raise HTTPException(
            status_code=404, detail="No intermediate destinations found for this trip")

    return intermediate_destinations


@router.put("/{trip_id}/update-vehicle-tonnage/")
async def update_vehicle_tonnage(
    trip_id: int, tonnage: float, db: Session = Depends(get_db),
    user: models.User = Depends(role_required("admin", "driver"))
):
    """Admin and driver can update the vehicle's tonnage for the trip."""
    trip = db.query(models.Trip).filter(models.Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    vehicle = db.query(models.Vehicle).filter(
        models.Vehicle.id == trip.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    vehicle.remaining_tonnage -= tonnage
    trip.tonnage = tonnage
    db.commit()

    return {"message": f"Vehicle tonnage updated, remaining tonnage: {vehicle.remaining_tonnage}"}


@router.post("/{trip_id}/check-geofence/")
async def check_trip_geofence(
    trip_id: int, driver_location: schemas.DriverLocationUpdate, db: Session = Depends(get_db)
):
    """Check if the driver has crossed the geofence boundary and notify the relevant admin to review the delay report."""
    # Fetch the trip based on the provided trip_id
    trip = db.query(models.Trip).filter(models.Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    # Retrieve the associated geofences for the trip
    geofences = db.query(models.Geofence).all()
    violation_found = False
    relevant_admins = set()  # Use a set to avoid duplicate admin notifications

    for geofence in geofences:
        # Check if the driver crossed the geofence boundary
        if check_geofence(driver_location.lat, driver_location.lng, geofence):
            elapsed_time = datetime.utcnow() - driver_location.timestamp
            if elapsed_time.total_seconds() > geofence.allowed_time_to_cross * 60:
                violation_found = True

                # Send notification to the driver to fill the delay report
                send_flash_notification(
                    trip.driver_id,
                    f"Geofence violation detected. Please fill out a delay report for 'Route Deviation'.",
                    db
                )

                # Optionally, create a "default" delay report with a default message
                delay_report = DelayReport(
                    driver_id=trip.driver_id,
                    trip_id=trip.id,
                    reason="Route Deviation",
                    custom_message="This is an auto-generated message. Please fill out the report with more details."
                )
                db.add(delay_report)
                db.commit()

                # Find the admin who created the geofence or is related to the trip
                # Option 1: Admin who created the geofence (assuming a `created_by` field in Geofence model)
                if geofence.created_by:  # Assuming `created_by` field links geofence to the admin
                    relevant_admins.add(geofence.created_by)

                # Option 2: Admin related to the trip (assuming the trip has an associated admin, e.g., `trip.admin_id`)
                if trip.admin_id:  # Assuming `admin_id` exists in the Trip model
                    relevant_admins.add(trip.admin_id)

                break  # Exit loop once a violation is detected

    if violation_found:
        # Notify relevant admins about the violation and delay report
        for admin_id in relevant_admins:
            send_flash_notification(
                admin_id,
                f"Driver {trip.driver.name} has crossed a geofence boundary and missed the crossing time limit for Trip {
                    trip_id}. Please review the delay report.",
                db
            )

        return {"message": "Geofence check completed. Driver notified to fill the delay report and admins notified."}

    return {"message": "No geofence violations detected."}



@router.get("/find-nearby-drivers/{trip_id}", response_model=List[schemas.DriverLocationResponse])
async def find_nearby_drivers(
    trip_id: int, db: Session = Depends(get_db), user: models.User = Depends(role_required("admin"))
):
    """Find drivers within a given radius of the trip destination and sort them by distance."""
    # Fetch the trip details
    trip = db.query(models.Trip).filter(models.Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    destination_lat, destination_lng = trip.destination_lat, trip.destination_lng
    required_capacity = trip.required_capacity

    # Fetch all drivers who meet the required capacity
    available_drivers = db.query(models.User, models.DriverLocation).join(
        models.DriverLocation, models.DriverLocation.user_id == models.User.id
    ).filter(
        models.User.is_driver == True,
        models.User.vehicle_capacity >= required_capacity
    ).all()

    # Calculate distance for each driver and create a list
    driver_list = [
        {
            "driver_id": user.id,
            "driver_name": user.name,
            "vehicle_capacity": user.vehicle_capacity,
            "vehicle_type": user.vehicle_type,
            "distance_to_trip": calculate_distance(location.latitude, location.longitude, destination_lat, destination_lng)
        }
        for user, location in available_drivers
    ]

    # Sort the drivers by distance in ascending order
    sorted_drivers = sorted(driver_list, key=lambda d: d["distance_to_trip"])

    if not sorted_drivers:
        raise HTTPException(
            status_code=404, detail="No drivers found with sufficient capacity")

    return sorted_drivers


@router.post("/assign-trip/{driver_id}/{trip_id}", response_model=schemas.TripAssignResponse)
async def assign_trip_to_driver(
    driver_id: int, trip_id: int, db: Session = Depends(get_db), user: models.User = Depends(role_required("admin"))
):
    """Assign a trip to a driver, including best route suggestions."""
    trip = db.query(models.Trip).filter(models.Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    driver = db.query(models.User).filter(models.User.id ==
                                          driver_id, models.User.is_driver == True).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")

    if driver.vehicle_capacity < trip.required_capacity:
        raise HTTPException(
            status_code=400, detail="Driver's vehicle capacity is insufficient for this trip")

    existing_trip = db.query(models.Trip).filter(
        models.Trip.driver_id == driver_id, models.Trip.status == "In-Route"
    ).first()
    if existing_trip:
        raise HTTPException(
            status_code=400, detail="Driver already assigned to another trip")

    best_route = get_best_route_from_api(
        start_location=trip.source,
        end_location=trip.destination,
        waypoints=trip.intermediate_destinations
    )
    if not best_route:
        raise HTTPException(
            status_code=404, detail="Best route could not be determined")

    # Assign the trip
    trip.driver_id = driver_id
    trip.route_details = best_route
    trip.status = "Assigned"
    db.commit()

    # Send notification
    send_flash_notification(
        driver.id,
        f"You have been assigned to trip {
            trip_id}. Check the app for route details.",
        db
    )

    return {"message": f"Trip {trip_id} successfully assigned to driver {driver_id}", "route_details": best_route}


@router.get("/route/{trip_id}")
async def get_trip_route(
    trip_id: int, db: Session = Depends(get_db), user: models.User = Depends(role_required("driver"))
):
    """Get the assigned route for a specific trip."""
    trip = db.query(models.Trip).filter(models.Trip.id ==
                                        trip_id, models.Trip.driver_id == user.id).first()
    if not trip:
        raise HTTPException(
            status_code=404, detail="Trip not found or not assigned to the driver")

    if not trip.route_details:
        raise HTTPException(
            status_code=400, detail="No route assigned for this trip")

    return {"route_details": trip.route_details}


@router.put("/update_trip_status/{trip_id}")
def update_trip_status(
    trip_id: int,
    status: str,
    db: Session = Depends(get_db)
):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()

    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    # If the status is 'Delayed', create a delay report
    if status.lower() == "delayed":
        delay_report = DelayReport(
            trip_id=trip.id,
            driver_id=trip.driver_id,
            reason="Trip delay",
            custom_message="Trip status marked as delayed"
        )
        db.add(delay_report)
        db.commit()

    trip.status = status
    db.commit()

    return {"msg": "Trip status updated"}
