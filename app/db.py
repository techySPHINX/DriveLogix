# app/db.py
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Load the database URL from environment variables or hardcode it for testing
DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql://user:password@localhost/dbname")

# Create the synchronous engine
engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for declarative models
Base = declarative_base()

# Dependency to get a synchronous session


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
