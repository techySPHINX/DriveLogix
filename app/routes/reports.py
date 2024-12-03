from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db import get_db
from app import models, schemas
from app.routes.auth import role_required

router = APIRouter()

@router.get("/driver-reports", response_model=list[schemas.DriverReportSummary])
async def get_driver_reports(
    db: Session = Depends(get_db),
    user: models.User = Depends(role_required("admin"))
):
    """
    Fetch a list of all drivers sorted by their number of delay reports (desc).
    """
    drivers_with_reports = (
        db.query(
            models.User.id.label("driver_id"),
            models.User.name.label("driver_name"),
            func.count(models.DelayReport.id).label("total_reports")
        )
        .join(models.DelayReport, models.User.id == models.DelayReport.driver_id, isouter=True)
        .filter(models.User.role == "driver")
        .group_by(models.User.id)
        .order_by(func.count(models.DelayReport.id).desc())
        .all()
    )

    return [
        {"driver_id": row.driver_id, "driver_name": row.driver_name,
            "total_reports": row.total_reports or 0}
        for row in drivers_with_reports
    ]
