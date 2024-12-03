from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from app.db import Base
from datetime import datetime


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    phone_number = Column(String, unique=True, nullable=True)
    password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    role = Column(String, default="driver")  
    vehicles = relationship("Vehicle", back_populates="driver")
    notifications = relationship("Notification", back_populates="driver")
    location = relationship(
        "DriverLocation", uselist=False, back_populates="driver")
    trips = relationship("Trip", back_populates="driver")
    delay_reports = relationship(
        "DelayReport", back_populates="driver")  # Added delay_reports


class Vehicle(Base):
    __tablename__ = "vehicles"
    id = Column(Integer, primary_key=True, index=True)
    vehicle_number = Column(String, unique=True, nullable=False)
    total_tonnage = Column(Float, nullable=False)
    remaining_tonnage = Column(Float, nullable=False)
    driver_id = Column(Integer, ForeignKey("users.id"))
    driver = relationship("User", back_populates="vehicles")
    # Added trips relationship
    trips = relationship("Trip", back_populates="vehicle")


class DriverLocation(Base):
    __tablename__ = "driver_locations"
    id = Column(Integer, primary_key=True, index=True)
    driver_id = Column(Integer, ForeignKey("users.id"))
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    driver = relationship("User", back_populates="location")


class Geofence(Base):
    __tablename__ = "geofences"
    id = Column(Integer, primary_key=True, index=True)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    radius = Column(Float, nullable=False)
    allowed_time_to_cross = Column(Integer, nullable=False)  # Time in minutes


class Trip(Base):
    __tablename__ = "trips"
    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"))
    driver_id = Column(Integer, ForeignKey("users.id"))
    source = Column(String, nullable=False)
    destination = Column(String, nullable=False)
    status = Column(String, default="In-Route")
    expected_arrival = Column(DateTime)
    next_halt = Column(String, nullable=True)
    safety_info = Column(String, nullable=True)
    tonnage = Column(Float, nullable=False)
    upvotes = Column(Integer, default=0)
    downvotes = Column(Integer, default=0)
    intermediate_destinations = relationship(
        "IntermediateDestination", back_populates="trip")
    vehicle = relationship("Vehicle", back_populates="trips")
    driver = relationship("User", back_populates="trips")
    delay_reports = relationship(
        "DelayReport", back_populates="trip")  # Added delay_reports


class IntermediateDestination(Base):
    __tablename__ = "intermediate_destinations"
    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"))
    destination = Column(String, nullable=False)
    sequence = Column(Integer, nullable=False)
    trip = relationship("Trip", back_populates="intermediate_destinations")


class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    driver_id = Column(Integer, ForeignKey("users.id"))
    message = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    driver = relationship("User", back_populates="notifications")


class DelayReport(Base):
    __tablename__ = "delay_reports"

    id = Column(Integer, primary_key=True, index=True)
    driver_id = Column(Integer, ForeignKey("users.id"))
    trip_id = Column(Integer, ForeignKey("trips.id"))
    reason = Column(String, nullable=False)
    custom_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    driver = relationship("User", back_populates="delay_reports")
    trip = relationship("Trip", back_populates="delay_reports")
