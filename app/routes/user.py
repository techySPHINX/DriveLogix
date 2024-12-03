from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.models import User
from app.schemas import UserResponse, UserUpdate
from app.routes.auth import role_required

router = APIRouter()


@router.get("/user/{user_id}", response_model=UserResponse)
async def get_user_info(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(role_required(["admin", "driver"]))
):
    """
    Retrieve user information including role, email, and activity status.
    Accessible by admin and the user themselves.
    """
    # Fetch user from the database
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Allow only admins or the user themselves to access their details
    if current_user.id != user_id and current_user.role != "admin":
        raise HTTPException(
            status_code=403, detail="Not authorized to access this information")

    return user


@router.patch("/user/{user_id}", response_model=UserResponse)
def update_user(user_id: int, user_update: UserUpdate, db: Session = Depends(get_db)):
    """
    Update user details.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    for key, value in user_update.dict(exclude_unset=True).items():
        setattr(user, key, value)

    db.commit()
    db.refresh(user)
    return user
