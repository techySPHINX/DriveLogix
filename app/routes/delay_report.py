from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.models import DelayReport, Trip, User
from app.schemas import DelayReportCreate, DelayReportResponse
from app.routes.auth import role_required
from app.utils import send_flash_notification

router = APIRouter()

# Route to create a delay report


@router.post("/create", response_model=DelayReportResponse)
async def create_delay_report(
    delay_report: DelayReportCreate,
    db: Session = Depends(get_db),
    user: User = Depends(role_required("driver"))
):
    """
    Create a delay report filled out by the driver.
    The report contains predefined reasons and a custom message.
    """
    try:
        # Check if the driver has an active trip
        active_trip = db.query(Trip).filter(
            Trip.driver_id == user.id, Trip.status == "In-Route"
        ).first()

        if not active_trip:
            raise HTTPException(
                status_code=404,
                detail="Driver does not have an active trip in the 'In-Route' status."
            )

        # Create the delay report
        report = DelayReport(
            driver_id=user.id,
            trip_id=active_trip.id,
            reason=delay_report.reason,
            custom_message=delay_report.custom_message
        )

        db.add(report)
        db.commit()
        db.refresh(report)

        # Send flash notifications
        send_flash_notification(
            user.id,
            f"Delay Report submitted: {delay_report.reason}",
            db
        )

        # Optionally notify admins
        admin_users = db.query(User).filter(User.role == "admin").all()
        for admin in admin_users:
            send_flash_notification(
                admin.id,
                f"Driver {user.name} submitted a Delay Report: {
                    delay_report.reason}",
                db
            )

        return report

    except Exception as e:
        db.rollback()  # Ensure transaction rollback on error
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while creating the delay report: {
                str(e)}"
        )
# Route to get delay reports by driver ID


@router.get("/delay_reports/{driver_id}")
def get_delay_reports(driver_id: int, db: Session = Depends(get_db)):
    """
    Retrieve all delay reports for a specific driver.
    """
    delay_reports = db.query(DelayReport).filter(
        DelayReport.driver_id == driver_id).all()

    if not delay_reports:
        raise HTTPException(
            status_code=404, detail="No delay reports found for this driver")

    return delay_reports
