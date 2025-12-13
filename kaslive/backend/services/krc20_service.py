import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
import logging
from backend.config import Config

logger = logging.getLogger(__name__)

class KRC20Service:
    def __init__(self):
        # Using Kasplex as the assumed KRC-20 indexer
        self.kasplex_api = Config.KASPA_API_URL.replace('.org', 'plex.org') # Placeholder URL adjustment
        
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
            url = f"{self.kasplex_api}/v1/krc20/tokenlist"
            response = self.session.get(url, timeout=self.timeout)
            response.raise_for_status()
            
            data = response.json()
            
            if data.get('message') != 'successful':
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
                    # Note: Price, change, volume, mcap are usually from a separate DEX API,
                    # We leave them out until that API is integrated.
                })
            
            return tokens
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching KRC-20 tokens: {e}")
            return []
