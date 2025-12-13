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

class WhaleService:
    def __init__(self):
        self.kaspa_api = Config.KASPA_API_URL
        self.explorer_api = Config.KASPA_EXPLORER_API
        self.whale_threshold = Config.WHALE_THRESHOLD # 1,000,000 KAS by default
        self.circulating_supply = 27100000000 # Estimated for calculation
        
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

    def get_top_whales(self, limit=10):
        """
        Get top whale addresses from the rich-list API.
        """
        try:
            # Assumes the explorer API has a rich-list endpoint
            url = f"{self.explorer_api}/addresses/rich-list"
            params = {'limit': limit}
            
            response = self.session.get(url, params=params, timeout=self.timeout)
            response.raise_for_status()
            
            addresses = response.json()
            whales = []
            
            for i, addr in enumerate(addresses, 1):
                balance_sompi = addr.get('balance', 0)
                balance_kas = balance_sompi / 100000000
                
                # Filter only addresses above the minimum whale threshold
                # Note: The rich list should inherently be ordered, but we filter here for safety.
                if balance_kas >= self.whale_threshold:
                    whales.append({
                        'rank': i,
                        'address': addr.get('address'),
                        'label': addr.get('label', 'Unknown'), # Labels must be injected or fetched separately
                        'balance': balance_kas,
                        'percentage': (balance_kas / self.circulating_supply) * 100,
                        'transaction_count': addr.get('transaction_count', 0)
                    })
            
            return whales
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching top whales: {e}")
            return [] # Return empty list instead of mock/fallback data
    
    def get_recent_alerts(self, limit=20):
        """
        Get recent whale alerts (large transactions) by querying the transaction API.
        """
        try:
            # Assumes an API endpoint for recent transactions
            url = f"{self.explorer_api}/transactions/recent"
            params = {'limit': limit}
            
            response = self.session.get(url, params=params, timeout=self.timeout)
            response.raise_for_status()
            txs = response.json()
            
            alerts = []
            
            for tx in txs:
                # Find the largest output amount (as a proxy for the transfer amount)
                largest_output = max(
                    [out.get('amount', 0) for out in tx.get('outputs', [])] or [0]
                )
                amount_kas = largest_output / 100000000
                
                if amount_kas >= self.whale_threshold:
                    alerts.append({
                        'id': tx.get('tx_id'),
                        'type': '🐋 LARGE TRANSFER',
                        'amount': round(amount_kas, 2),
                        'from_address': tx.get('inputs', [{}])[0].get('previous_outpoint_address', 'N/A'),
                        'to_address': tx.get('outputs', [{}])[0].get('script_public_key_address', 'N/A'),
                        'timestamp': tx.get('block_time', 'N/A'),
                        'usd_value': 0 # Needs price service injection if required
                    })
            
            return alerts

        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching whale alerts: {e}")
            return [] # Return empty list instead of mock/fallback data
