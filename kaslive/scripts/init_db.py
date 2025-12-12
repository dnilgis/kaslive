#!/usr/bin/env python
"""
Initialize the database with tables and seed data
"""

import os
import sys

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.app import app
from backend.models import db
from backend.config import Config


def init_database():
    """Initialize the database"""
    print("Initializing database...")
    
    with app.app_context():
        try:
            # Create all tables
            db.create_all()
            print("✅ Database tables created successfully")
            
            # Create indexes for performance
            print("Creating indexes...")
            # Add any custom indexes here
            
            print("✅ Database initialization complete")
            
        except Exception as e:
            print(f"❌ Error initializing database: {str(e)}")
            sys.exit(1)


def seed_data():
    """Seed the database with initial data"""
    print("Seeding database...")
    
    with app.app_context():
        try:
            # Add any seed data here
            # Example:
            # from backend.models import User
            # admin = User(username='admin', email='admin@kaslive.com')
            # db.session.add(admin)
            # db.session.commit()
            
            print("✅ Database seeded successfully")
            
        except Exception as e:
            print(f"❌ Error seeding database: {str(e)}")
            db.session.rollback()
            sys.exit(1)


if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Initialize KASLIVE database')
    parser.add_argument('--seed', action='store_true', help='Seed the database with initial data')
    parser.add_argument('--drop', action='store_true', help='Drop all tables before creating')
    
    args = parser.parse_args()
    
    if args.drop:
        print("⚠️  Dropping all tables...")
        with app.app_context():
            db.drop_all()
        print("✅ All tables dropped")
    
    init_database()
    
    if args.seed:
        seed_data()
    
    print("\n🚀 Database ready!")
