from fastapi import APIRouter, HTTPException, Depends
import redis
from sqlalchemy.orm import Session
from pydantic import BaseModel
import random
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
from app.db import get_db
from app import models, schemas
from app.models import User, UserRole
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from redis import Redis
from twilio.rest import Client

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "mysecret")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REDIS_HOST = os.getenv("REDIS_HOST")
REDIS_PORT = int(os.getenv("REDIS_PORT"))
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD")

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

redis_client = redis.Redis(
    host=REDIS_HOST, port=REDIS_PORT, password=REDIS_PASSWORD)

TWILIO_ACCOUNT_SID = "your_test_account_sid"
TWILIO_AUTH_TOKEN = "your_test_auth_token"
TWILIO_PHONE_NUMBER = "+15005550006"

client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)


class OTPRequest(BaseModel):
    phone_number: str


class OTPVerificationRequest(BaseModel):
    phone_number: str
    otp: str


class Token(BaseModel):
    access_token: str
    token_type: str


@router.post("/send-otp/")
async def send_otp(request: OTPRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(
        models.User.phone_number == request.phone_number).first()
    if not user:
        raise HTTPException(status_code=404, detail="User  not found")

    otp = random.randint(100000, 999999)
    redis.hmset(request.phone_number, {
                "otp": otp, "expires_at": datetime.utcnow().timestamp() + 300})

    message = f"Your OTP is {otp}"
    client.messages.create(
        body=message, from_=TWILIO_PHONE_NUMBER, to=request.phone_number)

    return {"message": "OTP sent successfully", "phone_number": request.phone_number}


@router.post("/verify-otp/")
async def verify_otp(request: OTPVerificationRequest):
    otp_data = redis.hgetall(request.phone_number)
    if not otp_data:
        raise HTTPException(status_code=400, detail="OTP not sent or expired")

    if datetime.utcnow().timestamp() > int(otp_data[b"expires_at"]):
        redis.delete(request.phone_number)
        raise HTTPException(status_code=400, detail="OTP has expired")

    if otp_data[b"otp"] != request.otp.encode():
        raise HTTPException(status_code=400, detail="Invalid OTP")

    redis.delete(request.phone_number)

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": request.phone_number}, expires_delta=access_token_expires)

    return {"access_token": access_token, "token_type": "bearer"}


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        phone_number: str = payload.get("sub")
        if phone_number is None:
            raise credentials_exception

        user = db.query(models.User).filter(
            models.User.phone_number == phone_number).first()
        print(f"Retrieved user: {user}")  # Debugging line

        if user is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    return user


def role_required(required_role: UserRole):
    def role_checker(current_user: User = Depends(get_current_user)):
        print(f"Current user: {current_user}")  # Debugging line

        # Check if the user is authenticated
        if current_user is None:
            raise HTTPException(
                status_code=401, detail="User  not authenticated")

        # Check if the user has a role attribute
        if not hasattr(current_user, 'role'):
            raise HTTPException(
                status_code=403, detail="User  does not have a role attribute")

        # Check if the user's role matches the required role
        if current_user.role != required_role:
            raise HTTPException(
                status_code=403, detail="Operation not permitted")

        return current_user  # Return the current user if all checks pass

    return role_checker


@router.get("/public-key/")
def get_public_key():
    return {"public_key": "dummy_public_key"}
