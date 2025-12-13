"""
Configuration settings for KASLIVE v3.0 (Serverless Minimal Config)
This file only contains static API URLs and thresholds.
Database and Redis settings are irrelevant in this architecture.
"""

import os
from datetime import timedelta


class Config:
    """Base configuration"""
    
    # --- Serverless Configuration (No Flask/DB/Redis dependencies) ---
    
    # Kaspa API
    KASPA_API_URL = os.getenv('KASPA_API_URL', 'https://api.kaspa.org') # For core network stats
    KASPA_EXPLORER_API = os.getenv('KASPA_EXPLORER_API', 'https://explorer.kaspa.org/api') # For explorer data (wallets/txs/rich-list)
    KRC20_API_URL = os.getenv('KRC20_API_URL', 'https://api.kasplex.org/v1') # KRC-20 data endpoint
    
    # Price APIs
    COINGECKO_API_KEY = os.getenv('COINGECKO_API_KEY', '') # Premium API key
    COINGECKO_API_URL = 'https://api.coingecko.com/api/v3'
    
    # Whale Threshold
    WHALE_THRESHOLD = int(os.getenv('WHALE_THRESHOLD', 1000000))  # 1M KAS
    
    # Logging
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')


# Configuration dictionary (Simplified for direct use by services)
# We keep this structure simple as services pull directly from Config, not environment-aware Flask contexts.
config = {
    'default': Config
}
