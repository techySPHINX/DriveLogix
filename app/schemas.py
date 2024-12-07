from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime


class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone_number: Optional[str] = None
    is_active: Optional[bool] = True
    role: Optional[str] = "driver"


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: int

    class Config:
        orm_mode = True


class DriverReportSummary(BaseModel):
    driver_id: int
    driver_name: str
    total_reports: int


class UserUpdate(BaseModel):
    name: Optional[str]
    email: Optional[EmailStr]
    phone_number: Optional[str]

    class Config:
        orm_mode = True


class VehicleBase(BaseModel):
    vehicle_number: str
    total_tonnage: float
    remaining_tonnage: float


class VehicleCreate(VehicleBase):
    driver_id: int


class VehicleResponse(VehicleBase):
    id: int

    class Config:
        orm_mode = True


class DriverLocationBase(BaseModel):
    latitude: float
    longitude: float


class DriverLocationCreate(DriverLocationBase):
    user_id: int


class DriverLocationResponse(DriverLocationBase):
    id: int
    updated_at: datetime

    class Config:
        orm_mode = True


# New schema for updating driver location
class DriverLocationUpdate(BaseModel):
    latitude: Optional[float]  # Optional
    longitude: Optional[float]  # Optional


class DriverReportSummary(BaseModel):
    driver_id: int
    driver_name: str
    total_reports: int

class TripBase(BaseModel):
    source: str
    destination: str
    status: Optional[str] = "In-Route"
    expected_arrival: Optional[datetime] = None
    next_halt: Optional[str] = None
    safety_info: Optional[str] = None
    tonnage: float


class TripCreate(TripBase):
    vehicle_id: int
    driver_id: int
    # New field for intermediate destinations
    intermediate_destinations: Optional[List[str]] = None


class TripResponse(TripBase):
    id: int
    upvotes: int
    downvotes: int

    class Config:
        orm_mode = True


class NotificationBase(BaseModel):
    message: str


class NotificationCreate(NotificationBase):
    driver_id: int


class NotificationResponse(NotificationBase):
    id: int
    timestamp: datetime

    class Config:
        orm_mode = True


class DelayReportCreate(BaseModel):
    reason: str
    custom_message: Optional[str] = None


class DelayReportResponse(DelayReportCreate):
    id: int
    driver_id: int
    trip_id: int
    created_at: datetime

    class Config:
        orm_mode = True


class GeofenceBase(BaseModel):
    lat: float
    lng: float
    radius: float
    time_limit_minutes: int  # Added field for time limit


class GeofenceCreate(GeofenceBase):
    pass


class GeofenceResponse(GeofenceBase):
    id: int

    class Config:
        orm_mode = True


class TripAssignResponse(BaseModel):
    message: str
    # Assuming route details are returned as a string
    route_details: Optional[str]

    class Config:
        orm_mode = True


class IntermediateDestinationBase(BaseModel):
    destination: str
    sequence: int


class IntermediateDestinationCreate(IntermediateDestinationBase):
    trip_id: int


class IntermediateDestinationResponse(IntermediateDestinationBase):
    id: int

    class Config:
        orm_mode = True
