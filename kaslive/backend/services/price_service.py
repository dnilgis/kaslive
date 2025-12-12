import requests
from datetime import datetime, timedelta
import os

class PriceService:
    def __init__(self):
        self.coingecko_api = "https://api.coingecko.com/api/v3"
        self.api_key = os.getenv('COINGECKO_API_KEY', '')
        
    def get_current_price(self):
        """Get current KAS price from CoinGecko"""
        try:
            url = f"{self.coingecko_api}/simple/price"
            params = {
                'ids': 'kaspa',
                'vs_currencies': 'usd',
                'include_24hr_change': 'true',
                'include_24hr_vol': 'true',
                'include_market_cap': 'true'
            }
            
            if self.api_key:
                params['x_cg_demo_api_key'] = self.api_key
                
            response = requests.get(url, params=params, timeout=10)
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
        except Exception as e:
            print(f"Error fetching price: {e}")
            
        # Fallback to mock data if API fails
        return {
            'price': 0.0842,
            'change_24h': -0.84,
            'volume_24h': 28240000,
            'market_cap': 1288000000,
            'timestamp': datetime.now().isoformat()
        }
    
    def get_price_history(self, timeframe='1D'):
        """Get historical price data"""
        try:
            # Map timeframes to days
            days_map = {
                '1H': 0.042,  # 1 hour
                '4H': 0.167,  # 4 hours
                '1D': 1,
                '1W': 7,
                '1M': 30,
                'ALL': 'max'
            }
            
            days = days_map.get(timeframe, 1)
            
            url = f"{self.coingecko_api}/coins/kaspa/market_chart"
            params = {
                'vs_currency': 'usd',
                'days': days
            }
            
            if self.api_key:
                params['x_cg_demo_api_key'] = self.api_key
                
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            if 'prices' in data:
                return [
                    {
                        'timestamp': datetime.fromtimestamp(p[0]/1000).isoformat(),
                        'price': p[1]
                    }
                    for p in data['prices']
                ]
        except Exception as e:
            print(f"Error fetching price history: {e}")
            
        # Fallback to mock data
        return self._generate_mock_history(timeframe)
    
    def _generate_mock_history(self, timeframe):
        """Generate mock price history as fallback"""
        import random
        now = datetime.now()
        hours_map = {'1H': 1, '4H': 4, '1D': 24, '1W': 168, '1M': 720, 'ALL': 8760}
        hours = hours_map.get(timeframe, 24)
        
        base_price = 0.0842
        data = []
        
        for i in range(100):
            time = now - timedelta(hours=hours * (100-i)/100)
            price = base_price * (1 + random.uniform(-0.05, 0.05))
            data.append({
                'timestamp': time.isoformat(),
                'price': price
            })
            
        return data
