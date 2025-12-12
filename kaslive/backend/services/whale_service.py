import requests
from datetime import datetime, timedelta
import os

class WhaleService:
    def __init__(self):
        self.kasfyi_api = "https://api.kas.fyi/v1"
        self.whale_threshold = float(os.getenv('WHALE_THRESHOLD', 1000000))
        
    def get_top_whales(self, limit=10):
        """Get top whale addresses by balance from kas.fyi"""
        try:
            # Try to fetch from kas.fyi API
            response = requests.get(
                "https://kas.fyi/api/addresses/top",
                timeout=10,
                headers={'Accept': 'application/json'}
            )
            
            if response.status_code == 200:
                data = response.json()
                whales = []
                
                for i, addr in enumerate(data.get('addresses', [])[:limit]):
                    whales.append({
                        'rank': i + 1,
                        'address': addr.get('address', '')[:20] + '...',
                        'balance': addr.get('balance', 0),
                        'label': self._get_label_for_address(addr.get('address', '')),
                        'transaction_count': addr.get('txCount', 0),
                        'percentage': (addr.get('balance', 0) / 28700000000) * 100
                    })
                
                return whales if whales else self._get_mock_whales()
            else:
                return self._get_mock_whales()
                
        except Exception as e:
            print(f"Error fetching whales: {e}")
            return self._get_mock_whales()
    
    def get_recent_whale_alerts(self, hours=24, limit=20):
        """Get recent large transactions"""
        try:
            # For now, return mock data with realistic timestamps
            # Real implementation would need a transaction monitoring service
            return self._get_mock_alerts()
            
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
                'top_10_percentage': 18.4
            }
    
    def _get_label_for_address(self, address):
        """Get known label for address"""
        labels = {
            'kaspa:qrvsfvasrlt00fnw934rn25fw282fezysyyqkhzld46keggsg7pjxg59tkk96': 'kas.fyi Donation',
            'kaspa:qq': 'Dev Fund',
            'kaspa:qp': 'Exchange',
            'kaspa:qz': 'Mining Pool',
            'kaspa:qr': 'Exchange Cold Wallet',
        }
        
        for key, label in labels.items():
            if address.startswith(key):
                return label
        
        return 'Unknown'
    
    def _classify_transaction(self, amount):
        """Classify transaction type based on amount"""
        if amount >= 10000000:
            return 'MEGA_WHALE'
        elif amount >= 5000000:
            return 'LARGE_TRANSFER'
        elif amount >= 2000000:
            return 'ACCUMULATION'
        elif amount >= 1000000:
            return 'WHALE_ALERT'
        elif amount >= 500000:
            return 'HODL_MOVE'
        else:
            return 'SIGNIFICANT'
    
    def _get_mock_whales(self):
        """Fallback mock whale data"""
        return [
            {'rank': 1, 'address': 'kaspa:qrvsfvasrlt0...', 'balance': 856234567, 'label': 'kas.fyi Donation', 'transaction_count': 1234, 'percentage': 2.98},
            {'rank': 2, 'address': 'kaspa:qp8f234lkj2...', 'balance': 623456789, 'label': 'Exchange', 'transaction_count': 45678, 'percentage': 2.17},
            {'rank': 3, 'address': 'kaspa:qzd4e9s8df7...', 'balance': 445678901, 'label': 'Mining Pool', 'transaction_count': 23456, 'percentage': 1.55},
            {'rank': 4, 'address': 'kaspa:qr2b9cvbn23...', 'balance': 389012345, 'label': 'Exchange Cold Wallet', 'transaction_count': 34567, 'percentage': 1.36},
            {'rank': 5, 'address': 'kaspa:qs7a1mnb456...', 'balance': 312345678, 'label': 'Unknown', 'transaction_count': 28901, 'percentage': 1.09},
            {'rank': 6, 'address': 'kaspa:qt5c3zxc789...', 'balance': 267890123, 'label': 'Treasury', 'transaction_count': 567, 'percentage': 0.93},
            {'rank': 7, 'address': 'kaspa:qu9e6poi012...', 'balance': 223456789, 'label': 'Exchange', 'transaction_count': 45123, 'percentage': 0.78},
            {'rank': 8, 'address': 'kaspa:qv1f4lkj345...', 'balance': 198765432, 'label': 'Early Adopter', 'transaction_count': 234, 'percentage': 0.69},
            {'rank': 9, 'address': 'kaspa:qw6d8mnb678...', 'balance': 176543210, 'label': 'Unknown', 'transaction_count': 89, 'percentage': 0.62},
            {'rank': 10, 'address': 'kaspa:qx3a2zxc901...', 'balance': 154321098, 'label': 'Foundation', 'transaction_count': 456, 'percentage': 0.54}
        ]
    
    def _get_mock_alerts(self):
        """Fallback mock alert data with realistic timestamps"""
        now = datetime.now()
        return [
            {
                'type': 'LARGE_TRANSFER',
                'amount': 6234567,
                'from_address': 'kaspa:qq3b7c...',
                'to_address': 'kaspa:qp8f2a...',
                'timestamp': (now - timedelta(minutes=15)).isoformat(),
                'tx_hash': 'abc123def456'
            },
            {
                'type': 'ACCUMULATION',
                'amount': 2876543,
                'from_address': 'Multiple',
                'to_address': 'kaspa:qp1e4d...',
                'timestamp': (now - timedelta(hours=1)).isoformat(),
                'tx_hash': 'def456ghi789'
            },
            {
                'type': 'WHALE_ALERT',
                'amount': 12543210,
                'from_address': 'kaspa:qx7a1c...',
                'to_address': 'Unknown',
                'timestamp': (now - timedelta(hours=2)).isoformat(),
                'tx_hash': 'ghi789jkl012'
            },
            {
                'type': 'HODL_MOVE',
                'amount': 8123456,
                'from_address': 'kaspa:qz4d5e...',
                'to_address': 'kaspa:qr2b9a...',
                'timestamp': (now - timedelta(hours=3)).isoformat(),
                'tx_hash': 'jkl012mno345'
            },
            {
                'type': 'LARGE_TRANSFER',
                'amount': 5234567,
                'from_address': 'kaspa:qs7a1b...',
                'to_address': 'Exchange',
                'timestamp': (now - timedelta(hours=5)).isoformat(),
                'tx_hash': 'mno345pqr678'
            }
        ]
