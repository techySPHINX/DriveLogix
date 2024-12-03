from app.routes.reports import router as reports_router
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.routes.auth import router as auth_router
from app.routes.geofence import router as geofence_router
from app.routes.notification import router as notification_router, websocket_endpoint
from app.routes.delay_report import router as delay_report_router
from app.routes.user import router as user_router
from app.routes.trips import router as trips_router
from app.routes.driver_location import router as driver_location_router
from app.routes.reports import router as reports_router
from app.db import Base, engine
from app.utils import send_flash_notification, get_db, create_geofence, check_geofence, send_push_notification, calculate_distance, get_best_route_from_api
from fastapi import Depends
from sqlalchemy.orm import Session
from app import models

# Initialize the database
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Driver Logistics App Backend",
    description="A backend service for managing driver logistics, geofencing, and driver-trip interactions in a transportation system.",
    version="1.1.0",  # Updated version to reflect new features
)

origins = [
    "http://localhost:3000",  # For local development
    "http://localhost",       # For local API testing
    "https://your-production-domain.com",  # Replace with your production domain
]

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
# Add WebSocket endpoint for real-time notifications
app.websocket("/ws/notifications")(websocket_endpoint)
app.include_router(reports_router, prefix="/reports", tags=["Reports"])

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    """
    Health check endpoint to verify the database and external services are reachable.
    """

    # Check Database Connection
    try:
        # Test the connection by querying a simple model, e.g., User
        db.query(models.User).first()
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Database connection failed: {str(e)}")

    # Check create_geofence function
    try:
        test_lat = 28.7041  # Example latitude (New Delhi)
        test_lng = 77.1025  # Example longitude (New Delhi)
        test_radius = 5  # Example radius in km
        geofence_response = create_geofence(test_lat, test_lng, test_radius)
        if not geofence_response.get("status") == "success":
            raise Exception("Geofence creation failed")
    except Exception as e:
        raise HTTPException(
            status_code=502, detail=f"Geofence creation failed: {str(e)}")

    # Check check_geofence function
    try:
        test_geofence_id = 1  # Assuming there's a valid geofence ID for testing
        geofence_check = check_geofence(test_lat, test_lng, test_geofence_id)
        if not geofence_check.get("status") == "success":
            raise Exception("Geofence check failed")
    except Exception as e:
        raise HTTPException(
            status_code=502, detail=f"Geofence check failed: {str(e)}")

    # Check OneSignal API (Push Notification)
    try:
        test_player_id = "test_player_id"  # This should be a valid OneSignal player ID
        test_title = "Test Notification"
        test_message = "Health check passed!"
        push_response = send_push_notification(
            test_player_id, test_title, test_message)
        if push_response.get("errors"):
            raise Exception(f"OneSignal push notification failed: {
                            push_response['errors']}")
    except Exception as e:
        raise HTTPException(
            status_code=502, detail=f"OneSignal API check failed: {str(e)}")

    # Check Distance Calculation
    try:
        # Validating the distance calculation utility with a known distance
        lat1, lon1 = 28.7041, 77.1025  # New Delhi coordinates
        lat2, lon2 = 19.0760, 72.8777  # Mumbai coordinates
        distance = calculate_distance(lat1, lon1, lat2, lon2)
        if distance <= 0:
            raise Exception("Distance calculation failed")
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Distance calculation check failed: {str(e)}")

    # Check send_flash_notification function
    try:
        # Use a test user ID and message
        test_user_id = 1  # Test user ID

        user = db.query(models.User).filter(models.User.id == test_user_id).first()

        if not user:
            raise HTTPException(
                status_code=404, detail="Test user not found for health check"
            )

        # Log or handle based on role
        if user.role == "driver":
            # Perform driver-specific health check (e.g., send flash notification)
            send_flash_notification(
                user.id, "Health check test notification for driver", db
            )
        elif user.role == "admin":
            # Perform admin-specific health check (e.g., ensure admin-related services are accessible)
            print("Health check: Admin user found.")
        else:
            # Handle other roles if applicable
            print(f"Health check: User with role {user.role} found.")
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Flash notification check failed: {str(e)}"
        )

    # Check get_best_route_from_api function
    try:
        start_location = {"lat": 28.7041, "lng": 77.1025}  # New Delhi
        end_location = {"lat": 19.0760, "lng": 72.8777}  # Mumbai
        route_response = get_best_route_from_api(start_location, end_location)
        if not route_response or route_response.get("distance") <= 0:
            raise Exception("Route fetching failed")
    except Exception as e:
        raise HTTPException(
            status_code=502, detail=f"Best route API check failed: {str(e)}")

    # Return health check passed message
    return {"status": "OK", "message": "All services are up and running!"}


@app.get("/")
def root():
    return {"message": "Welcome to the Driver Logistics App Backend!"}
