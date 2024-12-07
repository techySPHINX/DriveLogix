from fastapi import APIRouter, WebSocket, WebSocketDisconnect, BackgroundTasks
from sqlalchemy.orm import Session
from app.db import get_db
# Import the SQLAlchemy model
from app.models import Notification as NotificationModel
# Import the Pydantic schemas
from app.schemas import NotificationCreate, NotificationResponse
from app.utils import save_notification, send_flash_notification
from typing import Dict
import redis
import asyncio
import os

router = APIRouter()

# Redis configuration
REDIS_HOST = os.getenv("REDIS_HOST_NOTIFICATION")
REDIS_PORT = int(os.getenv("REDIS_PORT_NOTIFICATION"))
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD_NOTIFICATION")

redis_client = redis.Redis(
    host=REDIS_HOST, port=REDIS_PORT, password=REDIS_PASSWORD)

# Active WebSocket connections indexed by user ID
active_connections: Dict[int, WebSocket] = {}


@router.websocket("/ws/notifications/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    """Handle WebSocket connections for real-time notifications."""
    await websocket.accept()
    active_connections[user_id] = websocket
    print(f"User  {user_id} connected to notifications WebSocket.")

    try:
        while True:
            await websocket.receive_text()  # Keep the connection alive
    except WebSocketDisconnect:
        active_connections.pop(user_id, None)
        print(f"User  {user_id} disconnected from WebSocket.")


async def send_notification_to_clients(user_id: int, message: str):
    """Send notifications to a specific user via WebSocket or store in the database."""
    websocket = active_connections.get(user_id)
    if websocket:
        try:
            await websocket.send_text(message)
            print(f"WebSocket notification sent to user {user_id}: {message}")
        except Exception as e:
            print(f"Error sending WebSocket notification to user {
                  user_id}: {e}")
    else:
        # Save the notification in the Redis database
        save_notification(user_id, message)


@router.post("/notifications/send", response_model=NotificationResponse)
async def create_notification(notification: NotificationCreate, background_tasks: BackgroundTasks):
    """Create a notification and send it to the user."""
    # Create a Notification instance for the database
    notification_model = NotificationModel(
        driver_id=notification.driver_id,
        message=notification.message
    )

    # Here you would typically add the notification_model to the database session
    # and commit it, but for simplicity, we'll skip that part.

    background_tasks.add_task(
        send_notification_to_clients, notification.driver_id, notification.message)
    await publish_notification(notification.driver_id, notification.message)
    # Return the response model
    return NotificationResponse.from_orm(notification_model)


@router.post("/notifications/flash")
async def create_flash_notification(user_id: int, message: str, background_tasks: BackgroundTasks):
    """Create a flash notification and send it to the user."""
    background_tasks.add_task(
        send_flash_notification, user_id, message)
    await publish_flash_notification(user_id, message)
    return {"message": "Flash notification created and sent"}


async def publish_notification(user_id: int, message: str):
    """Publish notification to Redis for other services to consume."""
    redis_client.publish(f"user_notifications:{user_id}", message)


async def publish_flash_notification(user_id: int, message: str):
    """Publish flash notification to Redis for other services to consume."""
    redis_client.publish(f"user_flash_notifications:{user_id}", message)


async def redis_listener():
    """Listen for notifications on Redis and send them to connected WebSocket clients."""
    pubsub = redis_client.pubsub()
    pubsub.subscribe("user_notifications:*", "user_flash_notifications:*")
    for message in pubsub.listen():
        if message['type'] == 'message':
            channel = message['channel'].decode('utf-8')
            user_id = int(channel.split(":")[1])
            notification_message = message['data'].decode('utf-8')
            await send_notification_to_clients(user_id, notification_message)

# Start the Redis listener in the background


async def start_redis_listener():
    loop = asyncio.get_event_loop()
    loop.create_task(redis_listener())
