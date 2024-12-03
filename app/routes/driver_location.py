from fastapi import APIRouter, HTTPException, Depends, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from datetime import datetime
from app.db import get_db
from app.models import DriverLocation, User, Geofence, Trip
from app.schemas import DriverLocationCreate, DriverLocationResponse
from app.utils import calculate_distance, send_flash_notification
from fastapi.security import OAuth2PasswordBearer

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

active_connections = []  # WebSocket connection pool


@router.websocket("/ws/driver/{user_id}")
async def websocket_driver(websocket: WebSocket, user_id: int):
    """
    WebSocket connection for real-time updates of the driver's location.
    """
    await websocket.accept()
    active_connections.append(websocket)

    try:
        while True:
            # Keep the connection alive and handle incoming messages
            data = await websocket.receive_text()
            print(f"Message from driver {user_id}: {data}")
    except WebSocketDisconnect:
        # Remove disconnected driver from active connections
        active_connections.remove(websocket)
        print(f"Driver {user_id} disconnected.")


@router.post("/location/", response_model=DriverLocationResponse)
async def update_driver_location(
    location_data: DriverLocationCreate, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)
):
    """
    Update or create the current location for a driver and check for geofence violations and time limits.
    """
    # Fetch the user and ensure they are a driver
    user = db.query(User).filter(User.id == location_data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not user.is_driver:
        raise HTTPException(status_code=403, detail="User is not a driver")

    # Update the driver's location or create a new record
    location = db.query(DriverLocation).filter(
        DriverLocation.user_id == location_data.user_id).first()
    if location:
        location.latitude = location_data.latitude
        location.longitude = location_data.longitude
        location.updated_at = datetime.utcnow()
    else:
        location = DriverLocation(
            user_id=location_data.user_id,
            latitude=location_data.latitude,
            longitude=location_data.longitude,
        )
        db.add(location)

    # Check for geofence violations and time-based limits
    geofences = db.query(Geofence).all()
    for geofence in geofences:
        distance_to_geofence = calculate_distance(
            location.latitude, location.longitude, geofence.latitude, geofence.longitude
        )

        if distance_to_geofence > geofence.radius:
            # Geofence violation: outside the allowed radius
            send_flash_notification(
                user.player_id,  # Assuming the user has a `player_id` for notifications
                "Geofence Violation",
                "You are out of the geofence area. Please return within the allowed radius."
            )
            raise HTTPException(
                status_code=400,
                detail=f"Driver is out of the geofence radius: {
                    geofence.name}",
            )

        # Time-based geofence check (if applicable)
        trip = db.query(Trip).filter(
            Trip.driver_id == location_data.user_id, Trip.status == "In-Route").first()
        if trip:
            geofence_time_limit = geofence.time_limit_minutes
            time_elapsed = (datetime.utcnow() -
                            trip.start_time).total_seconds() / 60  # in minutes

            if time_elapsed > geofence_time_limit:
                # Time limit exceeded for geofence
                send_flash_notification(
                    user.player_id,
                    "Geofence Time Limit Exceeded",
                    f"You've exceeded the time limit for the geofence: {
                        geofence.name}. Please complete the required distance."
                )
                raise HTTPException(
                    status_code=400,
                    detail=f"Driver exceeded time limit for geofence {
                        geofence.name}.",
                )

    db.commit()
    db.refresh(location)
    return location


@router.get("/location/{user_id}/", response_model=DriverLocationResponse)
async def get_driver_location(user_id: int, db: Session = Depends(get_db)):
    """
    Retrieve the current location of a driver.
    """
    location = db.query(DriverLocation).filter(
        DriverLocation.user_id == user_id).first()
    if not location:
        raise HTTPException(
            status_code=404, detail="Driver location not found")

    return location
