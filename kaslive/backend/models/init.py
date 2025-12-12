from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session
import os

from .portfolio import Base, Portfolio, WhaleAlert, UserPreference

# Database connection
DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///kaslive.db')

# Fix for Render PostgreSQL URL
if DATABASE_URL.startswith('postgres://'):
    DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://', 1)

# Create engine
engine = create_engine(DATABASE_URL, echo=False)

# Create session factory
SessionLocal = scoped_session(sessionmaker(bind=engine))

def init_db():
    """Initialize database tables"""
    Base.metadata.create_all(engine)
    print("Database tables created!")

def get_db():
    """Get database session"""
    db = SessionLocal()
    try:
        return db
    finally:
        db.close()

# Export models
__all__ = ['Portfolio', 'WhaleAlert', 'UserPreference', 'init_db', 'get_db', 'SessionLocal']
