import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from datetime import datetime
import logging
import sys
import os

# --- Path fix for deployment environment ---
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
# ------------------------------------------

from backend.config import Config

logger = logging.getLogger(__name__)

class PriceService:
    def __init__(self):
        self.coingecko_api = Config.COINGECKO_API_URL
        self.api_key = Config.COINGECKO_API_KEY # Retrieved from Config
        
        # Configure robust HTTP session
        retry_strategy = Retry(
            total=3,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504],
            allowed_methods={"HEAD", "GET", "OPTIONS"}
        )
        adapter = HTTPAdapter(max_retries=retry_strategy)
        self.session = requests.Session()
        self.session.mount("https://", adapter)
        self.session.mount("http://", adapter)
        self.timeout = 10

    def get_current_price(self):
        """Get current KAS price from CoinGecko."""
        try:
            url = f"{self.coingecko_api}/simple/price"
            params = {
                'ids': 'kaspa',
                'vs_currencies': 'usd',
                'include_24hr_change': 'true',
                'include_24hr_vol': 'true',
                'include_market_cap': 'true'
            }
            
            # Add API key if available
            if self.api_key:
                params['x_cg_demo_api_key'] = self.api_key
                
            response = self.session.get(url, params=params, timeout=self.timeout)
            response.raise_for_status()
            data = response.json()
            
            if 'kaspa' in data:
                return {
                    'price': data['kaspa'].get('usd', 0),
                    'change_24h': data['kaspa'].get('usd_24h_change', 0),
                    'volume_24h': data['kaspa'].get('usd_24h_vol', 0),
                    'market_cap': data['kaspa'].get('usd_market_cap', 0),
                    'timestamp': datetime.now().isoformat()
                }
            
            logger.warning("CoinGecko price data is empty for Kaspa.")
            return None

        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching current price: {e}")
            return None # Return None instead of mock/fallback data
    
    def get_price_history(self, timeframe='1D', limit=None):
        """Get historical price data."""
        try:
            # Map timeframes to days for CoinGecko API
            days_map = {
                '1H': 1,  # Using 1 day for Coingecko for safety/granularity. 
                '4H': 1,  
                '1D': 7,
                '1W': 30,
                '1M': 90,
                'ALL': 'max'
            }
            
            # Resolve to days (defaulting to 7 days if unknown, or using max)
            days = days_map.get(timeframe, 7)
            if timeframe == 'ALL':
                days = 'max'
            elif timeframe in ['1H', '4H']:
                # For very short timeframes, use 1 day (Coingecko often only supports 1 day min)
                days = 1
            
            url = f"{self.coingecko_api}/coins/kaspa/market_chart"
            params = {
                'vs_currency': 'usd',
                'days': days
            }
            
            if self.api_key:
                params['x_cg_demo_api_key'] = self.api_key
                
            response = self.session.get(url, params=params, timeout=self.timeout)
            response.raise_for_status()
            data = response.json()
            
            if 'prices' in data:
                # Format and limit the data
                history = [
                    {
                        'timestamp': datetime.fromtimestamp(p[0]/1000).isoformat(),
                        'price': p[1]
                    }
                    for p in data['prices']
                ]
                # If a limit is specified, slice the data (from most recent)
                if limit and limit > 0:
                    return history[-limit:]
                return history
            
            logger.warning("CoinGecko history data is empty.")
            return []

        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching price history: {e}")
            return [] # Return empty list instead of mock/fallback data
