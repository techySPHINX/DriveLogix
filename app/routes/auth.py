from app.utils import verify_password, create_access_token
from twilio.rest import Client
import redis
from jose import JWTError, jwt
from app.models import User, UserRole
from app.db import get_db
from app import models
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from dotenv import load_dotenv
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import os
import random
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException, Depends, status

load_dotenv()
REDIS_HOST = os.getenv("REDIS_HOST")
REDIS_PORT = int(os.getenv("REDIS_PORT"))
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD")
ACCESS_TOKEN_EXPIRE_MINUTES = 30
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
redis_client = redis.Redis(
    host=REDIS_HOST, port=REDIS_PORT, password=REDIS_PASSWORD)

TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")

client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")

# Pydantic models


class OTPRequest(BaseModel):
    phone_number: str


class OTPVerificationRequest(BaseModel):
    phone_number: str
    otp: str


class Token(BaseModel):
    access_token: str
    token_type: str


@router.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Check client_id and client_secret
    if form_data.client_id != CLIENT_ID or form_data.client_secret != CLIENT_SECRET:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid client credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Authenticate user by email instead of username
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(
        data={"sub": user.phone_number, "role": user.role})
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/send-otp/")
async def send_otp(request: OTPRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone_number ==
                                 request.phone_number).first()
    if not user:
        raise HTTPException(status_code=404, detail="User  not found")

    otp = random.randint(100000, 999999)
    redis_client.hset(request.phone_number, mapping={
        "otp": otp,
        "expires_at": datetime.now().timestamp() + 300  # OTP valid for 5 minutes
    })

    if os.getenv("TWILIO_TEST_MODE", "false").lower() == "true":
        # Use Twilio's test phone numbers
        test_phone_numbers = [
            "+1234567890",
            "+1234567891",
            "+1234567892",
            "+1234567893",
            "+1234567894",
            "+1234567895",
        ]

        if request.phone_number not in test_phone_numbers:
            raise HTTPException(
                status_code=403, detail="Phone number not allowed in test mode")

        print(f"Test Mode: OTP for {request.phone_number} is {otp}")
        return {"message": "OTP sent successfully (test mode)", "phone_number": request.phone_number}
    else:
        message = f"Your OTP is {otp}"
        client.messages.create(
            body=message, from_=TWILIO_PHONE_NUMBER, to=request.phone_number)

        return {"message": "OTP sent successfully", "phone_number": request.phone_number}


@router.post("/verify-otp/")
async def verify_otp(request: OTPVerificationRequest):
    otp_data = redis_client.hgetall(request.phone_number)
    if not otp_data:
        raise HTTPException(status_code=400, detail="OTP not sent or expired")

    if datetime.now().timestamp() > int(otp_data[b"expires_at"]):
        redis_client.delete(request.phone_number)
        raise HTTPException(status_code=400, detail="OTP has expired")

    if otp_data[b"otp"] != request.otp.encode():
        raise HTTPException(status_code=400, detail="Invalid OTP")

    redis_client.delete(request.phone_number)

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": request.phone_number}, expires_delta=access_token_expires)

    return {"access_token": access_token, "token_type": "bearer"}


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        phone_number: str = payload.get("sub")
        role: str = payload.get("role")
        if phone_number is None or role is None:
            raise credentials_exception

        user = db.query(User).filter(User.phone_number == phone_number).first()
        if user is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    return user


def role_required(required_role: UserRole):
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user is None:
            raise HTTPException(
                status_code=401, detail="User  not authenticated")

        if not hasattr(current_user, 'role'):
            raise HTTPException(
                status_code=403, detail="User  does not have a role attribute")

        if current_user.role != required_role:
            raise HTTPException(
                status_code=403, detail="Operation not permitted")

        return current_user

    return role_checker


@router.get("/admin-only/")
async def admin_only_endpoint(current_user: User = Depends(role_required(UserRole.ADMIN))):
    return {"message": "Welcome, admin!"}


@router.get("/public-key/")
def get_public_key():
    return {"public_key": "dummy_public_key"}
