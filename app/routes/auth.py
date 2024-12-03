from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
import requests
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
from app.db import get_db
from app import models, schemas
from app.models import User
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

load_dotenv()

CLERK_API_KEY = os.getenv("CLERK_API_KEY")
CLERK_FRONTEND_API = os.getenv("CLERK_FRONTEND_API")

SECRET_KEY = os.getenv("SECRET_KEY", "mysecret")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

router = APIRouter()

# OAuth2 password bearer for token handling
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Define the role-based access

def role_required(role: str):
    def role_checker(user: User = Depends(get_current_user)):
        if user.role != role:
            raise HTTPException(
                status_code=403, detail="You do not have the necessary permissions"
            )
        return user
    return role_checker


class OTPRequest(BaseModel):
    phone_number: str


class OTPVerificationRequest(BaseModel):
    phone_number: str
    otp: str


class Token(BaseModel):
    access_token: str
    token_type: str


class UserInDB(models.User):
    hashed_password: str


@router.post("/send-otp/")
async def send_otp(request: OTPRequest):
    """
    Endpoint to send OTP to the user's phone number using Clerk API.
    """
    url = "https://api.clerk.dev/v1/otp/send"
    headers = {
        "Authorization": f"Bearer {CLERK_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "phone_number": request.phone_number,
        "channel": "sms",  # You can change this to "whatsapp" if required
    }

    response = requests.post(url, headers=headers, json=payload)

    if response.status_code != 200:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to send OTP: {
                response.json().get('message', 'Unknown error')}",
        )

    return {"message": "OTP sent successfully", "phone_number": request.phone_number}


@router.post("/verify-otp/")
async def verify_otp(request: OTPVerificationRequest):
    """
    Endpoint to verify OTP using Clerk API.
    """
    url = "https://api.clerk.dev/v1/otp/verify"
    headers = {
        "Authorization": f"Bearer {CLERK_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "phone_number": request.phone_number,
        "otp": request.otp,
    }

    response = requests.post(url, headers=headers, json=payload)

    if response.status_code != 200:
        raise HTTPException(
            status_code=400,
            detail=f"OTP verification failed: {
                response.json().get('message', 'Invalid OTP')}",
        )

    user_data = response.json()
    return {
        "message": "OTP verified successfully",
        "user_id": user_data.get("id"),
        "phone_number": request.phone_number,
    }


@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: schemas.UserCreate, db: Session = Depends(get_db)):
    """
    Generate access token for the user after successful login (OTP verified).
    """
    # Authenticate user from database (Check Clerk API integration)
    user = db.query(models.User).filter(
        models.User.phone_number == form_data.phone_number).first()

    if not user:
        raise HTTPException(
            status_code=400,
            detail="Incorrect username or password",
        )

    # Create JWT token for session management
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.phone_number}, expires_delta=access_token_expires)

    return {"access_token": access_token, "token_type": "bearer"}


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    """
    Generate JWT token using Clerk verified data (sub = phone_number).
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """
    Get the current user based on JWT token
    """
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
        if user is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    return user


@router.get("/public-key/")
def get_public_key():
    """
    Endpoint to return Clerk's frontend API key for client-side integration.
    """
    if not CLERK_FRONTEND_API:
        raise HTTPException(
            status_code=500, detail="Clerk Frontend API Key is not configured"
        )
    return {"frontend_api": CLERK_FRONTEND_API}
