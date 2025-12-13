import requests

class KRC20Service:
    def __init__(self):
        self.kasplex_api = "https://api.kasplex.org/v1"
        
    def get_token_list(self):
        """
        Get KRC-20 tokens from Kasplex API
        Returns None for fields that aren't available (not fake zeros)
        """
        try:
            response = requests.get(
                f"{self.kasplex_api}/krc20/tokenlist",
                timeout=10
            )
            
            if response.status_code != 200:
                print(f"Kasplex API error: {response.status_code}")
                return []
            
            data = response.json()
            
            if data.get('message') != 'successful':
                print("Kasplex API did not return successful")
                return []
            
            result = data.get('result', [])
            if not result:
                return []
            
            tokens = []
            for token in result[:10]:
                tokens.append({
                    'symbol': token.get('tick', 'UNKNOWN'),
                    'name': token.get('tick', 'Unknown Token'),
                    'price': None,  # Not available from Kasplex API
                    'change_24h': None,  # Not available from Kasplex API
                    'volume_24h': None,  # Not available from Kasplex API
                    'market_cap': None,  # Not available from Kasplex API
                    'holders': token.get('holderTotal', 0)
                })
            
            return tokens
            
        except Exception as e:
            print(f"Error fetching KRC-20 tokens: {e}")
            return []
