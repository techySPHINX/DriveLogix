import asyncio
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models
from app.models import UserRole, Geofence
from app import schemas
from app.schemas import GeofenceCreate, GeofenceResponse
from app.routes.auth import get_current_user
from app.db import get_db
from app.routes.auth import role_required
from datetime import datetime

router = APIRouter()


@router.post("/create-geofence/", response_model=GeofenceResponse, dependencies=[Depends(role_required(UserRole.ADMIN))])
async def create_geofence(geofence_data: GeofenceCreate, db: Session = Depends(get_db)):
    if geofence_data.radius <= 0:
        raise HTTPException(
            status_code=400, detail="Radius must be greater than 0.")
    if geofence_data.time_limit_minutes <= 0:
        raise HTTPException(
            status_code=400, detail="Time limit must be greater than 0.")

    new_geofence = Geofence(
        latitude=geofence_data.latitude,
        longitude=geofence_data.longitude,
        radius=geofence_data.radius,
        time_limit_minutes=geofence_data.time_limit_minutes,
        name=f"Geofence_{geofence_data.latitude}_{
            geofence_data.longitude}_{datetime.now().isoformat()}",
    )
    db.add(new_geofence)


@router.get("/get-geofences/", response_model=list[schemas.GeofenceResponse])
async def get_geofences(db: Session = Depends(get_db)):
    geofences = db.query(models.Geofence).all()
    if not geofences:
        raise HTTPException(status_code=404, detail="No geofences found")
    return geofences


async def schedule_geofence_regeneration(geofence_id: int, time_limit_minutes: int, db: Session):
    await asyncio.sleep(time_limit_minutes * 60)
    existing_geofence = db.query(models.Geofence).filter(
        models.Geofence.id == geofence_id).first()
    if not existing_geofence:
        return

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

    asyncio.create_task(schedule_geofence_regeneration(
        new_geofence.id, new_geofence.time_limit_minutes, db))
