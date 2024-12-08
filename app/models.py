from sqlalchemy import (
    Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Text, Enum
)
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.db import Base

# Enums for user roles and trip status


class UserRole(enum.Enum):
    DRIVER = "driver"
    ADMIN = "admin"


class TripStatus(enum.Enum):
    PENDING = "Pending"
    ASSIGNED = "Assigned"
    IN_ROUTE = "In-Route"
    COMPLETED = "Completed"
    CANCELED = "Canceled"

# User model


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    phone_number = Column(String(15), unique=True, nullable=True)
    password = Column(String(128), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.DRIVER, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    # Relationships
    vehicles = relationship("Vehicle", back_populates="driver")
    location = relationship(
        "DriverLocation", uselist=False, back_populates="driver")
    delay_reports = relationship("DelayReport", back_populates="driver")
    notifications = relationship("Notification", back_populates="driver")
    trips_as_driver = relationship(
        "Trip", back_populates="driver", foreign_keys="Trip.driver_id")
    trips_as_admin = relationship(
        "Trip", back_populates="admin", foreign_keys="Trip.admin_id")

    def __repr__(self):
        return f"<User (id={self.id}, name={self.name}, email={self.email}, role={self.role})>"

# Vehicle model


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_number = Column(String(50), unique=True, nullable=False)
    total_tonnage = Column(Float, nullable=False)
    remaining_tonnage = Column(Float, nullable=False)
    driver_id = Column(Integer, ForeignKey(
        "users.id", ondelete="SET NULL"), nullable=True, index=True)

    driver = relationship("User", back_populates="vehicles")
    trips = relationship("Trip", back_populates="vehicle")

# DriverLocation model


class DriverLocation(Base):
    __tablename__ = "driver_locations"

    id = Column(Integer, primary_key=True, index=True)
    driver_id = Column(Integer, ForeignKey(
        "users.id", ondelete="CASCADE"), nullable=False, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    driver = relationship("User", back_populates="location")

# Geofence model


class Geofence(Base):
    __tablename__ = "geofences"

    id = Column(Integer, primary_key=True, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    radius = Column(Float, nullable=False)
    time_limit_minutes = Column(Integer, nullable=False)

# Trip model


class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey(
        "vehicles.id", ondelete="SET NULL"), nullable=True, index=True)
    driver_id = Column(Integer, ForeignKey(
        "users.id", ondelete="SET NULL"), nullable=True, index=True)
    admin_id = Column(Integer, ForeignKey(
        "users.id", ondelete="SET NULL"), nullable=True, index=True)
    source = Column(String(100), nullable=False)
    destination = Column(String(100), nullable=False)
    status = Column(Enum(TripStatus),
                    default=TripStatus.PENDING, nullable=False)
    expected_arrival = Column(DateTime, nullable=True)
    next_halt = Column(String, nullable=True)
    safety_info = Column(String, nullable=True)
    tonnage = Column(Float, nullable=False)
    upvotes = Column(Integer, default=0)
    downvotes = Column(Integer, default=0)

    vehicle = relationship("Vehicle", back_populates="trips")
    driver = relationship(
        "User", back_populates="trips_as_driver", foreign_keys=[driver_id])
    admin = relationship(
        "User", back_populates="trips_as_admin", foreign_keys=[admin_id])
    intermediate_destinations = relationship(
        "IntermediateDestination", back_populates="trip", cascade="all, delete")
    delay_reports = relationship(
        "DelayReport", back_populates="trip", cascade="all, delete")

# IntermediateDestination model


class IntermediateDestination(Base):
    __tablename__ = "intermediate_destinations"

    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey(
        "trips.id", ondelete="CASCADE"), nullable=False, index=True)
    destination = Column(String(100), nullable=False)
    sequence = Column(Integer, nullable=False)

    trip = relationship("Trip", back_populates="intermediate_destinations")

# Notification model


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    driver_id = Column(Integer, ForeignKey(
        "users.id", ondelete="CASCADE"), nullable=False, index=True)
    admin_id = Column(Integer, ForeignKey(
        "users.id", ondelete="CASCADE"), nullable=True, index=True)
    message = Column(String(255), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    is_read = Column(Boolean, default=False)

    driver = relationship("User", back_populates="notifications")
    admin = relationship("User")

# DelayReport model


class DelayReport(Base):
    __tablename__ = "delay_reports"

    id = Column(Integer, primary_key=True, index=True)
    driver_id = Column(Integer, ForeignKey(
        "users.id", ondelete="CASCADE"), nullable=False, index=True)
    trip_id = Column(Integer, ForeignKey(
        "trips.id", ondelete="CASCADE"), nullable=False, index=True)
    reason = Column(String(255), nullable=False)
    custom_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    driver = relationship("User", back_populates="delay_reports")
    trip = relationship("Trip", back_populates="delay_reports")
