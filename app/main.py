from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db import get_db  
from app.routes.auth import router as auth_router
from app.routes.geofence import router as geofence_router
from app.routes.notification import router as notification_router
from app.routes.delay_report import router as delay_report_router
from app.routes.user import router as user_router
from app.routes.trips import router as trips_router
from app.routes.driver_location import router as driver_location_router
from app.routes.reports import router as reports_router

app = FastAPI(
    title="Driver Logistics App Backend",
    description="Backend service for managing driver logistics.",
    version="1.1.0",
)

# CORS configuration
origins = ["http://localhost:3000", "http://localhost",
           "https://your-production-domain.com"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(geofence_router, prefix="/geofence", tags=["Geofence"])
app.include_router(notification_router,
                   prefix="/notifications", tags=["Notifications"])
app.include_router(delay_report_router,
                   prefix="/delay-report", tags=["Delay Reports"])
app.include_router(trips_router, prefix="/trips", tags=["Trips"])
app.include_router(driver_location_router,
                   prefix="/driver-location", tags=["Driver Location"])
app.include_router(user_router, prefix="/users", tags=["Users"])
app.include_router(reports_router, prefix="/reports", tags=["Reports"])


@app.get("/")
def root():
    return {"message": "Welcome to the Driver Logistics App Backend!"}
