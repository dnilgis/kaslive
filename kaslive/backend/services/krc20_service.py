import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
import logging
import sys
import os

# --- Path fix for deployment environment ---
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
# ------------------------------------------

from backend.config import Config

logger = logging.getLogger(__name__)

class KRC20Service:
    def __init__(self):
        # Using the dedicated KRC20 URL from Config
        self.kasplex_api = Config.KRC20_API_URL 
        
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
        
    def get_token_list(self):
        """
        Get KRC-20 tokens from Kasplex API.
        Returns an empty list if API fails.
        """
        try:
            # API endpoint is expected to be under the base URL already
            url = f"{self.kasplex_api}/krc20/tokenlist"
            response = self.session.get(url, timeout=self.timeout)
            response.raise_for_status()
            
            data = response.json()
            
            # Check for a specific 'successful' message or rely on status code
            if response.status_code != 200 or data.get('message') != 'successful':
                logger.warning(f"Kasplex API did not return successful: {data.get('message')}")
                return []
            
            result = data.get('result', [])
            
            tokens = []
            for token in result:
                tokens.append({
                    'symbol': token.get('tick', 'UNKNOWN'),
                    'name': token.get('tick', 'Unknown Token'),
                    'total_supply': token.get('supply', 0),
                    'holders': token.get('holderTotal', 0),
                    'verified': token.get('verified', False)
                })
            
            return tokens
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching KRC-20 tokens: {e}")
            return []
