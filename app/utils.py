import requests
from dotenv import load_dotenv
import os
from math import radians, sin, cos, sqrt, atan2
from sqlalchemy.orm import Session
from app import models
from datetime import datetime

load_dotenv()

ONESIGNAL_API_KEY = os.getenv("ONESIGNAL_API_KEY")
ONESIGNAL_APP_ID = os.getenv("ONESIGNAL_APP_ID")
MAPMYINDIA_API_KEY = os.getenv("MAPMYINDIA_API_KEY")


def create_geofence(lat, lng, radius):
    """
    Create a geofence using MapMyIndia API.
    """
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


def check_geofence(lat, lng, geofence_id):
    """
    Check if the given coordinates are inside a geofence.
    """
    url = f"https://apis.mapmyindia.com/advancedmaps/v1/{
        MAPMYINDIA_API_KEY}/geofence/check"
    payload = {"lat": lat, "lng": lng, "geofenceId": geofence_id}
    response = requests.post(url, json=payload)

    if response.status_code != 200:
        raise Exception(f"Error checking geofence: {response.text}")

    return response.json()


def send_push_notification(player_id: str, title: str, message: str):
    """
    Send a push notification to a user using OneSignal API.
    """
    url = "https://onesignal.com/api/v1/notifications"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Basic {ONESIGNAL_API_KEY}"
    }
    payload = {
        "app_id": ONESIGNAL_APP_ID,
        "include_player_ids": [player_id],
        "headings": {"en": title},
        "contents": {"en": message}
    }

    response = requests.post(url, headers=headers, json=payload)

    if response.status_code != 200:
        raise Exception(f"Error sending push notification: {response.text}")

    return response.json()


def calculate_distance(lat1, lon1, lat2, lon2):
    """
    Calculate the distance between two coordinates (lat, lon) using the Haversine formula.
    """
    R = 6371.0  # Earth radius in kilometers

    lat1_rad = radians(lat1)
    lon1_rad = radians(lon1)
    lat2_rad = radians(lat2)
    lon2_rad = radians(lon2)

    dlon = lon2_rad - lon1_rad
    dlat = lat2_rad - lat1_rad

    a = sin(dlat / 2)**2 + cos(lat1_rad) * cos(lat2_rad) * sin(dlon / 2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))

    distance = R * c  # Resulting distance in kilometers
    return distance

# Dictionary to store active WebSocket connections
active_connections = {}

# utils.py


def send_flash_notification(user_id: int, message: str, db: Session):
    """
    Send a flash notification to the user via WebSocket if connected.
    Fallback to storing the notification in the database if the user is offline.
    """
    if user_id in active_connections:
        websocket = active_connections[user_id]
        try:
            # Send real-time WebSocket notification
            websocket.send_text(message)
            print(f"Real-time notification sent to user {user_id}: {message}")
        except Exception as e:
            print(f"Failed to send WebSocket notification to user {
                  user_id}: {e}")
    else:
        # Store the notification in the database for offline users
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if user:
            notification = models.Notification(
                user_id=user_id,
                message=message,
                timestamp=datetime.utcnow()
            )
            db.add(notification)
            db.commit()
            print(f"Notification saved for user {user_id}: {message}")

    
    
def get_best_route_from_api(start_location, end_location, waypoints=None):
    """
    Fetch the best route from a mapping API.
    """
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
            # Could be a polyline or set of coordinates
            "path": route_data["path"],
        }
    except Exception as e:
        print(f"Error fetching route: {e}")
        return None


def notify_admin_of_delay_report(driver_id: int, delay_report: models.DelayReport, db: Session):
    """
    Notify admin when a delay report is created.
    """
    admin = db.query(models.User).filter(
        models.User.role == "admin").first()  # Adjust as needed
    if admin:
        message = f"Driver {driver_id} has submitted a delay report: {
            delay_report.reason}. Details: {delay_report.custom_message}"
        send_flash_notification(admin.id, message, db)
        

def send_geofence_alert(driver_id: int, geofence: models.Geofence, db: Session):
    """
    Send an alert if the driver breaches a geofence.
    """
    user = db.query(models.User).filter(models.User.id == driver_id).first()
    if user:
        message = f"Geofence breach detected near {
            geofence.lat}, {geofence.lng}. Please check."
        send_flash_notification(driver_id, message, db)
        notification = models.Notification(
            driver_id=driver_id,
            message=message,
            timestamp=datetime.utcnow()
        )
        db.add(notification)
        db.commit()
