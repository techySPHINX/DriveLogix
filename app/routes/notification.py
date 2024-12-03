from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException, Depends
from sqlalchemy.orm import Session
from app.db import get_db
from app.models import Notification, User
from app.utils import send_push_notification
from typing import List
from datetime import datetime

router = APIRouter()

# Active WebSocket connections indexed by user ID
active_connections: dict[int, WebSocket] = {}


@router.websocket("/ws/notifications/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    """Handle WebSocket connections for real-time notifications."""
    await websocket.accept()
    active_connections[user_id] = websocket
    print(f"User {user_id} connected to notifications WebSocket.")

    try:
        while True:
            await websocket.receive_text()  # Keep the connection alive
    except WebSocketDisconnect:
        active_connections.pop(user_id, None)
        print(f"User {user_id} disconnected from WebSocket.")


async def send_notification_to_clients(user_id: int, message: str, db: Session):
    """Send notifications to a specific user via WebSocket or push notification."""
    # Send WebSocket notification if the user is connected
    websocket = active_connections.get(user_id)
    if websocket:
        try:
            await websocket.send_text(message)
            print(f"WebSocket notification sent to user {user_id}: {message}")
        except Exception as e:
            print(f"Error sending WebSocket notification to user {
                  user_id}: {e}")
    else:
        # Fallback to push notification if WebSocket is not available
        user = db.query(User).filter(User.id == user_id).first()
        if user and user.push_notification_token:
            try:
                send_push_notification(
                    user.push_notification_token, "Notification", message)
                print(f"Push notification sent to user {user_id}: {message}")
            except Exception as e:
                print(f"Failed to send push notification to user {
                      user_id}: {e}")

    # Save the notification in the database for record-keeping
    notification = Notification(
        user_id=user_id,
        message=message,
        timestamp=datetime.utcnow()
    )
    db.add(notification)
    db.commit()
    print(f"Notification saved for user {user_id}.")


@router.post("/push-notifications/send")
async def send_push(title: str, message: str, player_id: str):
    """Manually send a push notification to a specific device using OneSignal."""
    try:
        send_push_notification(player_id, title, message)
        return {"message": "Push notification sent"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/notifications/{user_id}", response_model=List[Notification])
async def get_user_notifications(user_id: int, db: Session = Depends(get_db)):
    """Fetch all stored notifications for a specific user."""
    notifications = db.query(Notification).filter(
        Notification.user_id == user_id).all()
    if not notifications:
        raise HTTPException(
            status_code=404, detail="No notifications found for the user.")
    return notifications
