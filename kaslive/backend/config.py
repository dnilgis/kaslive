"""
Configuration settings for KASLIVE v2.0
"""

import os
from datetime import timedelta


class Config:
    """Base configuration"""
    
    # Flask
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    FLASK_ENV = os.getenv('FLASK_ENV', 'production')
    
    # Database
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///kaslive.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = False
    
    # Redis
    REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
    
    # Cache
    CACHE_TYPE = 'redis'
    CACHE_REDIS_URL = REDIS_URL
    CACHE_DEFAULT_TIMEOUT = 300
    
    # Rate Limiting
    RATELIMIT_STORAGE_URL = REDIS_URL
    RATELIMIT_STRATEGY = 'fixed-window'
    
    # Kaspa API
    KASPA_API_URL = os.getenv('KASPA_API_URL', 'https://api.kaspa.org')
    KASPA_EXPLORER_API = os.getenv('KASPA_EXPLORER_API', 'https://explorer.kaspa.org/api')
    KASPA_RPC_URL = os.getenv('KASPA_RPC_URL', 'http://localhost:16110')
    
    # Price APIs
    COINGECKO_API_KEY = os.getenv('COINGECKO_API_KEY', '')
    COINGECKO_API_URL = 'https://api.coingecko.com/api/v3'
    
    # Exchange APIs
    MEXC_API_KEY = os.getenv('MEXC_API_KEY', '')
    MEXC_API_SECRET = os.getenv('MEXC_API_SECRET', '')
    KUCOIN_API_KEY = os.getenv('KUCOIN_API_KEY', '')
    KUCOIN_API_SECRET = os.getenv('KUCOIN_API_SECRET', '')
    
    # Features
    ENABLE_WHALE_ALERTS = os.getenv('ENABLE_WHALE_ALERTS', 'true').lower() == 'true'
    WHALE_THRESHOLD = int(os.getenv('WHALE_THRESHOLD', 1000000))  # 1M KAS
    ENABLE_EMAIL_ALERTS = os.getenv('ENABLE_EMAIL_ALERTS', 'false').lower() == 'true'
    ENABLE_SMS_ALERTS = os.getenv('ENABLE_SMS_ALERTS', 'false').lower() == 'true'
    ENABLE_TELEGRAM_ALERTS = os.getenv('ENABLE_TELEGRAM_ALERTS', 'false').lower() == 'true'
    
    # Email (SendGrid)
    SENDGRID_API_KEY = os.getenv('SENDGRID_API_KEY', '')
    FROM_EMAIL = os.getenv('FROM_EMAIL', 'alerts@kaslive.com')
    
    # SMS (Twilio)
    TWILIO_ACCOUNT_SID = os.getenv('TWILIO_ACCOUNT_SID', '')
    TWILIO_AUTH_TOKEN = os.getenv('TWILIO_AUTH_TOKEN', '')
    TWILIO_PHONE_NUMBER = os.getenv('TWILIO_PHONE_NUMBER', '')
    
    # Telegram
    TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN', '')
    
    # Monitoring
    SENTRY_DSN = os.getenv('SENTRY_DSN', '')
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    
    # Security
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', SECRET_KEY)
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    
    # CORS
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', '*').split(',')
    
    # Update intervals (seconds)
    PRICE_UPDATE_INTERVAL = 5
    WHALE_CHECK_INTERVAL = 30
    NETWORK_STATS_INTERVAL = 60
    KRC20_UPDATE_INTERVAL = 120
    
    # Pagination
    DEFAULT_PAGE_SIZE = 20
    MAX_PAGE_SIZE = 100
    
    # Mining Calculator Defaults
    DEFAULT_NETWORK_HASHRATE = 945000  # PH/s
    DEFAULT_BLOCK_REWARD = 179  # KAS
    BLOCKS_PER_DAY = 86400  # 1 block per second


class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    TESTING = False
    SQLALCHEMY_ECHO = True


class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False


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
