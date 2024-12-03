from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from app import schemas
from app import models
from app.routes.auth import role_required
from sqlalchemy.orm import Session
from app.db import get_db
from app.models import Geofence
from app.schemas import GeofenceCreate, GeofenceResponse
from app.utils import create_geofence as external_create_geofence
import asyncio

router = APIRouter()
scheduled_tasks = {}


@router.post("/create-geofence/", response_model=schemas.GeofenceResponse)
@role_required("admin")
async def create_geofence(
    geofence_data: schemas.GeofenceCreate, db: Session = Depends(get_db)
):
    """
    Create a new geofence with time limit and radius, automatically regenerating after its interval.
    """
    if geofence_data.radius <= 0:
        raise HTTPException(
            status_code=400, detail="Radius must be greater than 0.")
    if geofence_data.time_limit_minutes <= 0:
        raise HTTPException(
            status_code=400, detail="Time limit must be greater than 0.")

    new_geofence = models.Geofence(
        latitude=geofence_data.latitude,
        longitude=geofence_data.longitude,
        radius=geofence_data.radius,
        time_limit_minutes=geofence_data.time_limit_minutes,
        name=f"Geofence_{geofence_data.latitude}_{
            geofence_data.longitude}_{datetime.now().isoformat()}",
    )
    db.add(new_geofence)
    db.commit()
    db.refresh(new_geofence)

    # Create geofence in external system (external logic)
    try:
        external_create_geofence(
            geofence_data.latitude,
            geofence_data.longitude,
            geofence_data.radius,
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to create geofence in external system: {str(e)}",
        )

    # Schedule regeneration task
    asyncio.create_task(schedule_geofence_regeneration(
        new_geofence.id, geofence_data.time_limit_minutes, db))

    return new_geofence




@router.get("/get-geofences/", response_model=list[GeofenceResponse])
async def get_geofences(db: Session = Depends(get_db)):
    """
    Retrieve all geofences in the system for management.
    """
    geofences = db.query(Geofence).all()
    if not geofences:
        raise HTTPException(status_code=404, detail="No geofences found")
    return geofences


async def schedule_geofence_regeneration(geofence_id: int, time_limit_minutes: int, db: Session):
    """
    Regenerate the geofence after the specified time limit.
    """
    # Wait for the specified duration
    await asyncio.sleep(time_limit_minutes * 60)

    # Fetch the existing geofence details
    existing_geofence = db.query(models.Geofence).filter(
        models.Geofence.id == geofence_id).first()
    if not existing_geofence:
        return  # Geofence might have been deleted

    # Create a new geofence with the same details
    new_geofence = models.Geofence(
        latitude=existing_geofence.latitude,
        longitude=existing_geofence.longitude,
        radius=existing_geofence.radius,
        time_limit_minutes=existing_geofence.time_limit_minutes,
        name=f"Geofence_{existing_geofence.latitude}_{
            existing_geofence.longitude}_{datetime.now().isoformat()}",
    )
    db.add(new_geofence)
    db.commit()
    db.refresh(new_geofence)

    # Create the geofence in the external system
    try:
        external_create_geofence(
            new_geofence.latitude,
            new_geofence.longitude,
            new_geofence.radius,
        )
    except Exception as e:
        print(f"Failed to regenerate geofence in external system: {str(e)}")

    # Reschedule the regeneration task
    asyncio.create_task(schedule_geofence_regeneration(
        new_geofence.id, new_geofence.time_limit_minutes, db))
