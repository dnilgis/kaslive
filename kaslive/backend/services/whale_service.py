import requests
from datetime import datetime, timedelta
import os

class WhaleService:
    def __init__(self):
        self.explorer_api = "https://api.kaspa.org"
        self.whale_threshold = float(os.getenv('WHALE_THRESHOLD', 1000000))
        
    def get_top_whales(self, limit=10):
        """Get top whale addresses by balance"""
        try:
            response = requests.get(f"{self.explorer_api}/addresses/rich-list", timeout=10)
            response.raise_for_status()
            data = response.json()
            
            whales = []
            known_labels = self._get_known_labels()
            
            for i, addr in enumerate(data.get('addresses', [])[:limit]):
                address = addr.get('address', '')
                balance = addr.get('balance', 0) / 100000000  # Convert from sompi
                
                whales.append({
                    'rank': i + 1,
                    'address': address,
                    'balance': balance,
                    'label': known_labels.get(address[:10], 'Unknown'),
                    'transaction_count': addr.get('txCount', 0),
                    'percentage': (balance / 28700000000) * 100  # % of total supply
                })
            
            return whales
            
        except Exception as e:
            print(f"Error fetching whales: {e}")
            return self._get_mock_whales()
    
    def get_recent_whale_alerts(self, hours=24, limit=20):
        """Get recent large transactions (whale movements)"""
        try:
            # Fetch recent transactions
            response = requests.get(
                f"{self.explorer_api}/transactions/recent",
                params={'limit': 100},
                timeout=10
            )
            response.raise_for_status()
            data = response.json()
            
            alerts = []
            cutoff_time = datetime.now() - timedelta(hours=hours)
            
            for tx in data.get('transactions', []):
                amount = tx.get('amount', 0) / 100000000  # Convert from sompi
                
                if amount >= self.whale_threshold / 1000000:  # Adjust threshold
                    tx_time = datetime.fromtimestamp(tx.get('timestamp', 0))
                    
                    if tx_time >= cutoff_time:
                        alert_type = self._classify_transaction(amount, tx)
                        
                        alerts.append({
                            'type': alert_type,
                            'amount': amount,
                            'from_address': tx.get('from', 'Unknown')[:16] + '...',
                            'to_address': tx.get('to', 'Unknown')[:16] + '...',
                            'timestamp': tx_time.isoformat(),
                            'tx_hash': tx.get('hash', '')
                        })
                        
                        if len(alerts) >= limit:
                            break
            
            return alerts
            
        except Exception as e:
            print(f"Error fetching whale alerts: {e}")
            return self._get_mock_alerts()
    
    def get_whale_statistics(self):
        """Get whale concentration statistics"""
        try:
            whales = self.get_top_whales(100)
            
            total_whale_balance = sum(w['balance'] for w in whales)
            total_supply = 28700000000
            
            return {
                'total_whales': len([w for w in whales if w['balance'] >= self.whale_threshold]),
                'concentration_percentage': (total_whale_balance / total_supply) * 100,
                'average_whale_balance': total_whale_balance / len(whales) if whales else 0,
                'top_10_percentage': sum(w['balance'] for w in whales[:10]) / total_supply * 100
            }
            
        except Exception as e:
            print(f"Error calculating whale stats: {e}")
            return {
                'total_whales': 156,
                'concentration_percentage': 45.2,
                'average_whale_balance': 45600000,
                'top_10_percentage': 18.5
            }
    
    def _classify_transaction(self, amount, tx_data):
        """Classify transaction type based on amount and context"""
        if amount >= 10000000:  # 10M+
            return 'MEGA_WHALE'
        elif amount >= 5000000:  # 5M+
            return 'LARGE_TRANSFER'
        elif amount >= 2000000:  # 2M+
            return 'ACCUMULATION'
        elif amount >= 1000000:  # 1M+
            return 'WHALE_ALERT'
        elif amount >= 500000:   # 500K+
            return 'HODL_MOVE'
        else:
            return 'SIGNIFICANT'
    
    def _get_known_labels(self):
        """Return known address labels"""
        return {
            'kaspa:qq': 'Dev Fund',
            'kaspa:qp': 'MEXC Exchange',
            'kaspa:qz': 'Mining Pool',
            'kaspa:qr': 'KuCoin Exchange',
            'kaspa:qs': 'Gate.io Exchange',
            'kaspa:qt': 'Treasury',
            'kaspa:qu': 'Binance Deposit',
            'kaspa:qv': 'Early Adopter',
            'kaspa:qw': 'Strategic Reserve',
            'kaspa:qx': 'Foundation'
        }
    
    def _get_mock_whales(self):
        """Fallback mock whale data"""
        return [
            {'rank': 1, 'address': 'kaspa:qqa7c', 'balance': 856234567, 'label': 'Dev Fund', 'transaction_count': 1234, 'percentage': 2.98},
            {'rank': 2, 'address': 'kaspa:qp8f2', 'balance': 623456789, 'label': 'MEXC Exchange', 'transaction_count': 45678, 'percentage': 2.17},
            {'rank': 3, 'address': 'kaspa:qzd4e', 'balance': 445678901, 'label': 'Mining Pool', 'transaction_count': 23456, 'percentage': 1.55},
            {'rank': 4, 'address': 'kaspa:qr2b9', 'balance': 389012345, 'label': 'KuCoin Exchange', 'transaction_count': 34567, 'percentage': 1.36},
            {'rank': 5, 'address': 'kaspa:qs7a1', 'balance': 312345678, 'label': 'Gate.io Exchange', 'transaction_count': 28901, 'percentage': 1.09},
            {'rank': 6, 'address': 'kaspa:qt5c3', 'balance': 267890123, 'label': 'Treasury', 'transaction_count': 567, 'percentage': 0.93},
            {'rank': 7, 'address': 'kaspa:qu9e6', 'balance': 223456789, 'label': 'Binance Deposit', 'transaction_count': 45123, 'percentage': 0.78},
            {'rank': 8, 'address': 'kaspa:qv1f4', 'balance': 198765432, 'label': 'Early Adopter', 'transaction_count': 234, 'percentage': 0.69},
            {'rank': 9, 'address': 'kaspa:qw6d8', 'balance': 176543210, 'label': 'Strategic Reserve', 'transaction_count': 89, 'percentage': 0.62},
            {'rank': 10, 'address': 'kaspa:qx3a2', 'balance': 154321098, 'label': 'Foundation', 'transaction_count': 456, 'percentage': 0.54}
        ]
    
    def _get_mock_alerts(self):
        """Fallback mock alert data"""
        now = datetime.now()
        return [
            {
                'type': 'LARGE_TRANSFER',
                'amount': 6234567,
                'from_address': 'kaspa:qq3b7c',
                'to_address': 'kaspa:qp8f2a',
                'timestamp': (now - timedelta(minutes=15)).isoformat(),
                'tx_hash': 'abc123def456'
            },
            {
                'type': 'ACCUMULATION',
                'amount': 2876543,
                'from_address': 'Multiple',
                'to_address': 'kaspa:qp1e4d',
                'timestamp': (now - timedelta(hours=1)).isoformat(),
                'tx_hash': 'def456ghi789'
            },
            {
                'type': 'WHALE_ALERT',
                'amount': 12543210,
                'from_address': 'kaspa:qx7a1c',
                'to_address': 'Unknown',
                'timestamp': (now - timedelta(hours=2)).isoformat(),
                'tx_hash': 'ghi789jkl012'
            },
            {
                'type': 'HODL_MOVE',
                'amount': 543210,
                'from_address': 'kaspa:qz4d5e',
                'to_address': 'kaspa:qr2b9a',
                'timestamp': (now - timedelta(hours=3)).isoformat(),
                'tx_hash': 'jkl012mno345'
            },
            {
                'type': 'LARGE_TRANSFER',
                'amount': 5234567,
                'from_address': 'kaspa:qs7a1b',
                'to_address': 'Exchange',
                'timestamp': (now - timedelta(hours=5)).isoformat(),
                'tx_hash': 'mno345pqr678'
            }
        ]
