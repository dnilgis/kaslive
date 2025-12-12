"""
Whale Service - Track large holders and movements
"""

import logging
from typing import Dict, List
from datetime import datetime, timedelta
import random

from backend.config import Config

logger = logging.getLogger(__name__)


class WhaleService:
    """Service for tracking whale addresses and movements"""
    
    def __init__(self):
        self.whale_threshold = Config.WHALE_THRESHOLD
        # Cache for whale data
        self._whale_cache = []
        self._alerts_cache = []
    
    def get_top_whales(self, limit: int = 10) -> List[Dict]:
        """Get top whale addresses by balance"""
        try:
            # Mock whale data
            # TODO: Replace with actual blockchain queries
            whales = [
                {
                    'rank': 1,
                    'address': 'kaspa:qz3fa7b2c1d5e8f9a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4b7c',
                    'label': 'Dev Fund',
                    'balance': 1250000000,
                    'balance_formatted': '1.25B KAS',
                    'percentage_of_supply': 4.61,
                    'last_transaction': (datetime.utcnow() - timedelta(minutes=2)).isoformat(),
                    'transaction_count': 1247,
                    'total_received': 1350000000,
                    'total_sent': 100000000,
                    'tx_volume_24h': 125000000
                },
                {
                    'rank': 2,
                    'address': 'kaspa:qx7d1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a11',
                    'label': 'MEXC Exchange',
                    'balance': 350000000,
                    'balance_formatted': '350.00M KAS',
                    'percentage_of_supply': 1.29,
                    'last_transaction': (datetime.utcnow() - timedelta(minutes=5)).isoformat(),
                    'transaction_count': 8943,
                    'total_received': 5200000000,
                    'total_sent': 4850000000,
                    'tx_volume_24h': 2100000000
                },
                {
                    'rank': 3,
                    'address': 'kaspa:qp1c8e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e3b',
                    'label': 'Whale Alpha',
                    'balance': 210000000,
                    'balance_formatted': '210.00M KAS',
                    'percentage_of_supply': 0.77,
                    'last_transaction': (datetime.utcnow() - timedelta(minutes=12)).isoformat(),
                    'transaction_count': 534,
                    'total_received': 250000000,
                    'total_sent': 40000000,
                    'tx_volume_24h': 89000000
                },
                {
                    'rank': 4,
                    'address': 'kaspa:qz8f2g4h5j6k7m8n9p0q1r2s3t4u5v6w7x8y9z0a1b2c3d4e5f6g7h8j9k0m1n2g4',
                    'label': 'Accumulator',
                    'balance': 185500000,
                    'balance_formatted': '185.50M KAS',
                    'percentage_of_supply': 0.68,
                    'last_transaction': (datetime.utcnow() - timedelta(minutes=8)).isoformat(),
                    'transaction_count': 2156,
                    'total_received': 450000000,
                    'total_sent': 264500000,
                    'tx_volume_24h': 450000000
                },
                {
                    'rank': 5,
                    'address': 'kaspa:qr3a9k5h6j7m8n9p0q1r2s3t4u5v6w7x8y9z0a1b2c3d4e5f6g7h8j9k0m1n2p3k5h',
                    'label': 'Diamond Hands',
                    'balance': 172300000,
                    'balance_formatted': '172.30M KAS',
                    'percentage_of_supply': 0.64,
                    'last_transaction': (datetime.utcnow() - timedelta(hours=1)).isoformat(),
                    'transaction_count': 89,
                    'total_received': 175000000,
                    'total_sent': 2700000,
                    'tx_volume_24h': 12000000
                },
                {
                    'rank': 6,
                    'address': 'kaspa:qb6b4m9j7k8n9p0q1r2s3t4u5v6w7x8y9z0a1b2c3d4e5f6g7h8j9k0m1n2p3q4m9j',
                    'label': 'Early Miner',
                    'balance': 156800000,
                    'balance_formatted': '156.80M KAS',
                    'percentage_of_supply': 0.58,
                    'last_transaction': (datetime.utcnow() - timedelta(minutes=25)).isoformat(),
                    'transaction_count': 1843,
                    'total_received': 320000000,
                    'total_sent': 163200000,
                    'tx_volume_24h': 320000000
                },
                {
                    'rank': 7,
                    'address': 'kaspa:qu4w2k7n9p0q1r2s3t4u5v6w7x8y9z0a1b2c3d4e5f6g7h8j9k0m1n2p3q4r5s6p2k',
                    'label': 'Smart Trader',
                    'balance': 145200000,
                    'balance_formatted': '145.20M KAS',
                    'percentage_of_supply': 0.54,
                    'last_transaction': (datetime.utcnow() - timedelta(minutes=15)).isoformat(),
                    'transaction_count': 4521,
                    'total_received': 1800000000,
                    'total_sent': 1654800000,
                    'tx_volume_24h': 1800000000
                },
                {
                    'rank': 8,
                    'address': 'kaspa:qi9i9n7v8z0a1b2c3d4e5f6g7h8j9k0m1n2p3q4r5s6t7u8v9w0x1y2z3a4b5c6n7v',
                    'label': 'HODLer Pro',
                    'balance': 138900000,
                    'balance_formatted': '138.90M KAS',
                    'percentage_of_supply': 0.51,
                    'last_transaction': (datetime.utcnow() - timedelta(hours=3)).isoformat(),
                    'transaction_count': 156,
                    'total_received': 140000000,
                    'total_sent': 1100000,
                    'tx_volume_24h': 18000000
                },
                {
                    'rank': 9,
                    'address': 'kaspa:qw2x4c9k0m1n2p3q4r5s6t7u8v9w0x1y2z3a4b5c6d7e8f9g0h1j2k3m4n5p6q7x4c',
                    'label': 'Mining Pool',
                    'balance': 127500000,
                    'balance_formatted': '127.50M KAS',
                    'percentage_of_supply': 0.47,
                    'last_transaction': (datetime.utcnow() - timedelta(minutes=1)).isoformat(),
                    'transaction_count': 15234,
                    'total_received': 3200000000,
                    'total_sent': 3072500000,
                    'tx_volume_24h': 3200000000
                },
                {
                    'rank': 10,
                    'address': 'kaspa:qe5t7y9w0x1y2z3a4b5c6d7e8f9g0h1j2k3m4n5p6q7r8s9t0u1v2w3x4y5z6a7t7y',
                    'label': 'Mystery Whale',
                    'balance': 119300000,
                    'balance_formatted': '119.30M KAS',
                    'percentage_of_supply': 0.44,
                    'last_transaction': (datetime.utcnow() - timedelta(hours=6)).isoformat(),
                    'transaction_count': 342,
                    'total_received': 120000000,
                    'total_sent': 700000,
                    'tx_volume_24h': 5600000
                }
            ]
            
            return whales[:limit]
            
        except Exception as e:
            logger.error(f"Error fetching top whales: {str(e)}")
            raise
    
    def get_recent_alerts(self, limit: int = 10) -> List[Dict]:
        """Get recent whale movement alerts"""
        try:
            # Mock alert data
            # TODO: Replace with actual transaction monitoring
            alert_types = [
                '🐋 LARGE TRANSFER',
                '🔥 ACCUMULATION',
                '⚠️ WHALE ALERT',
                '💎 HODL MOVE',
                '🚨 MAJOR MOVE',
                '📤 EXCHANGE DEPOSIT',
                '📥 EXCHANGE WITHDRAWAL'
            ]
            
            alerts = []
            for i in range(limit):
                alert = {
                    'id': f"alert_{i}",
                    'type': random.choice(alert_types),
                    'amount': random.randint(1000000, 20000000),
                    'amount_formatted': f"{random.randint(1, 20)}.{random.randint(0, 9)}M KAS",
                    'from_address': f"kaspa:q{'x' if i % 2 == 0 else 'z'}{i:062x}",
                    'from_label': self._get_address_label(i, 'from'),
                    'to_address': f"kaspa:q{'y' if i % 2 == 0 else 'w'}{i:062x}",
                    'to_label': self._get_address_label(i, 'to'),
                    'timestamp': (datetime.utcnow() - timedelta(minutes=i*2)).isoformat(),
                    'time_ago': self._format_time_ago(i*2),
                    'tx_hash': f"0x{random.getrandbits(256):064x}",
                    'usd_value': random.randint(50000, 1000000)
                }
                alerts.append(alert)
            
            return alerts
            
        except Exception as e:
            logger.error(f"Error fetching whale alerts: {str(e)}")
            raise
    
    def track_whale_movements(self):
        """Background task to monitor whale movements"""
        # This would run as a background task (Celery/APScheduler)
        # and detect large transactions in real-time
        pass
    
    def get_whale_statistics(self) -> Dict:
        """Get aggregated whale statistics"""
        try:
            whales = self.get_top_whales(100)
            
            total_whale_balance = sum(w['balance'] for w in whales)
            total_supply = 27100000000  # 27.1B KAS
            whale_concentration = (total_whale_balance / total_supply) * 100
            
            return {
                'total_whales': len(whales),
                'total_whale_balance': total_whale_balance,
                'whale_concentration_percentage': round(whale_concentration, 2),
                'average_whale_balance': total_whale_balance // len(whales),
                'largest_whale_balance': whales[0]['balance'],
                'smallest_whale_balance': whales[-1]['balance'],
                'timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error calculating whale statistics: {str(e)}")
            raise
    
    @staticmethod
    def _get_address_label(index: int, direction: str) -> str:
        """Get mock label for address"""
        labels = {
            'from': ['Dev Fund', 'Exchange', 'Whale Alpha', 'Mining Pool', 'Unknown'],
            'to': ['Exchange', 'Cold Wallet', 'Unknown', 'Mining Pool', 'DeFi Contract']
        }
        return labels[direction][index % len(labels[direction])]
    
    @staticmethod
    def _format_time_ago(minutes: int) -> str:
        """Format time ago string"""
        if minutes == 0:
            return "Just now"
        elif minutes < 60:
            return f"{minutes}m ago"
        elif minutes < 1440:
            hours = minutes // 60
            return f"{hours}h ago"
        else:
            days = minutes // 1440
            return f"{days}d ago"
