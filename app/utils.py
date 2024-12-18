from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from app import models
from sqlalchemy.orm import Session
from math import radians, sin, cos, sqrt, atan2
import os
import requests
from dotenv import load_dotenv

load_dotenv()
MAPMYINDIA_API_KEY = os.getenv("MAPMYINDIA_API_KEY")

SECRET_KEY = os.getenv("SECRET_KEY", "your_secret_key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# Function to hash a password

def get_password_hash(password):
    return pwd_context.hash(password)

# Function to create a JWT access token


def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now() + expires_delta
    else:
        expire = datetime.now() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def create_geofence(lat, lng, radius):
    url = f"https://apis.mapmyindia.com/advancedmaps/v1/{
        MAPMYINDIA_API_KEY}/geofence"
    payload = {
        "fenceName": f"Geofence_{lat}_{lng}",
        "centerLat": lat,
        "centerLng": lng,
        "radius": radius
    }
    headers = {"Content-Type": "application/json"}
    response = requests.post(url, json=payload, headers=headers)

    if response.status_code != 200:
        raise Exception(f"Error creating geofence: {response.text}")

    return response.json()

# Function to check if a point is within a geofence


def check_geofence(lat, lng, geofence_id):
    url = f"https://apis.mapmyindia.com/advancedmaps/v1/{
        MAPMYINDIA_API_KEY}/geofence/check"
    payload = {"lat": lat, "lng": lng, "geofenceId": geofence_id}
    response = requests.post(url, json=payload)

    if response.status_code != 200:
        raise Exception(f"Error checking geofence: {response.text}")

    return response.json()

# Function to save a notification to the database


def save_notification(user_id: int, message: str, db: Session):
    notification = models.Notification(
        user_id=user_id,
        message=message,
        timestamp=datetime.utcnow()
    )
    db.add(notification)
    db.commit()
    print(f"Notification saved for user {user_id}: {message}")

# Function to calculate the distance between two geographical points


def calculate_distance(lat1, lon1, lat2, lon2):
    R = 6371.0  # Earth radius in kilometers

    lat1_rad = radians(lat1)
    lon1_rad = radians(lon1)
    lat2_rad = radians(lat2)
    lon2_rad = radians(lon2)

    dlon = lon2_rad - lon1_rad
    dlat = lat2_rad - lat1_rad

    a = sin(dlat / 2)**2 + cos(lat1_rad) * cos(lat2_rad) * sin(dlon / 2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))

    distance = R * c  
    return distance


active_connections = {}


def save_flash_notification(user_id: int, message: str, db: Session):
    flash_notification = models.Notification(
        user_id=user_id,
        message=message,
        timestamp=datetime.utcnow()
    )
    db.add(flash_notification)
    db.commit()
    print(f"Flash notification saved for user {user_id}: {message}")


def get_best_route_from_api(start_location, end_location, waypoints=None):
    api_url = "https://example-mapping-api.com/route"  # Replace with your API endpoint
    params = {
        "start": start_location,
        "end": end_location,
        "waypoints": waypoints if waypoints else [],
        "traffic_model": "best_guess",
        "avoid": "tolls",
    }
    try:
        response = requests.get(api_url, params=params)
        response.raise_for_status()
        route_data = response.json()

        return {
            "distance": route_data["distance"],
            "duration": route_data["duration"],
            "path": route_data["path"],
        }
    except Exception as e:
        print(f"Error fetching route: {e}")
        return None


def notify_admin_of_delay_report(driver_id: int, delay_report: models.DelayReport, db: Session):
    admin = db.query(models.User).filter(models.User.role == "admin").first()
    if admin:
        message = f"Driver {driver_id} has submitted a delay report: {
            delay_report.reason}. Details: {delay_report.custom_message}"
        send_flash_notification(admin.id, message, db)


async def send_flash_notification(user_id: int, message: str, db: Session):
    websocket = active_connections.get(user_id)
    if websocket:
        try:
            await websocket.send_text(message)
            print(f"Flash WebSocket notification sent to user {
                  user_id}: {message}")
        except Exception as e:
            print(f"Error sending flash WebSocket notification to user {
                  user_id}: {e}")
    else:
        save_flash_notification(user_id, message, db)


def send_geofence_alert(driver_id: int, geofence: models.Geofence, db: Session):
    user = db.query(models.User).filter(models.User.id == driver_id).first()
    if user:
        message = f"Geofence breach detected near {
            geofence.latitude}, {geofence.longitude}. Please check."
        send_flash_notification(driver_id, message, db)
        notification = models.Notification(
            user_id=driver_id,
            message=message,
            timestamp=datetime.now()
        )
        db.add(notification)
        db.commit()


