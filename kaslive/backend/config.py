"""
Configuration settings for KASLIVE v2.1 (Cleaned and Simplified)
"""

import os
from datetime import timedelta


class Config:
    """Base configuration"""
    
    # Flask
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    FLASK_ENV = os.getenv('FLASK_ENV', 'production')
    
    # Database
    # NOTE: Fix for Render/Heroku PostgreSQL URL is in backend/models/init.py
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///kaslive.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = False
    
    # Redis (For Cache and Rate Limiting)
    REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
    CACHE_REDIS_URL = REDIS_URL
    RATELIMIT_STORAGE_URL = REDIS_URL
    
    # Cache & Rate Limiting Settings
    CACHE_TYPE = 'redis'
    CACHE_DEFAULT_TIMEOUT = 60 # Default TTL is 60 seconds (lower for real-time data)
    RATELIMIT_STRATEGY = 'fixed-window'
    
    # Kaspa API
    KASPA_API_URL = os.getenv('KASPA_API_URL', 'https://api.kaspa.org') # For core network stats
    KASPA_EXPLORER_API = os.getenv('KASPA_EXPLORER_API', 'https://explorer.kaspa.org/api') # For explorer data (wallets/txs/rich-list)
    KRC20_API_URL = os.getenv('KRC20_API_URL', 'https://api.kasplex.org/v1') # KRC-20 data endpoint
    
    # Price APIs
    COINGECKO_API_KEY = os.getenv('COINGECKO_API_KEY', '') # Premium API key
    COINGECKO_API_URL = 'https://api.coingecko.com/api/v3'
    
    # Exchange APIs (For future multi-exchange price aggregation)
    MEXC_API_KEY = os.getenv('MEXC_API_KEY', '')
    MEXC_API_SECRET = os.getenv('MEXC_API_SECRET', '')
    
    # Features & Alerting
    ENABLE_WHALE_ALERTS = os.getenv('ENABLE_WHALE_ALERTS', 'true').lower() == 'true'
    WHALE_THRESHOLD = int(os.getenv('WHALE_THRESHOLD', 1000000))  # 1M KAS
    
    # Removed unnecessary default mining calculator values as they must be dynamic
    
    # Email (SendGrid)
    SENDGRID_API_KEY = os.getenv('SENDGRID_API_KEY', '')
    FROM_EMAIL = os.getenv('FROM_EMAIL', 'alerts@kaslive.com')
    
    # Monitoring
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    
    # Security
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', SECRET_KEY)
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', '*').split(',')
    
    # Update intervals (seconds) - Hints for future Celery tasks
    PRICE_UPDATE_INTERVAL = 15
    NETWORK_STATS_INTERVAL = 30
    
    # Pagination
    DEFAULT_PAGE_SIZE = 20


class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    TESTING = False
    SQLALCHEMY_ECHO = False # Keep False unless debugging DB queries heavily
    LOG_LEVEL = 'DEBUG'


class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False
    LOG_LEVEL = 'INFO'


class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'


# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': ProductionConfig
}
