"""
KRC20 Service - Track KRC-20 tokens on Kaspa
"""

import logging
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import random

logger = logging.getLogger(__name__)


class KRC20Service:
    """Service for tracking KRC-20 tokens"""
    
    def __init__(self):
        self._token_cache = {}
    
    def get_all_tokens(self) -> List[Dict]:
        """Get all KRC-20 tokens with stats"""
        try:
            # Mock token data
            # TODO: Replace with actual KRC-20 API calls
            tokens = [
                {
                    'symbol': 'NACHO',
                    'name': 'Nacho the Kat',
                    'tvl': 4460000,
                    'tvl_formatted': '$4.46M',
                    'volume_24h': 115400,
                    'volume_24h_formatted': '$115.4K',
                    'change_24h': -4.70,
                    'liquidity_providers': 2100,
                    'holders': 8500,
                    'price': 0.0245,
                    'momentum': '🔥',
                    'contract_address': 'kaspa:qrnacho123456789...',
                    'verified': True
                },
                {
                    'symbol': 'KASPY',
                    'name': 'Kaspy Token',
                    'tvl': 1070000,
                    'tvl_formatted': '$1.07M',
                    'volume_24h': 25200,
                    'volume_24h_formatted': '$25.2K',
                    'change_24h': 2.65,
                    'liquidity_providers': 1800,
                    'holders': 5200,
                    'price': 0.0089,
                    'momentum': '📈',
                    'contract_address': 'kaspa:qrkaspy123456789...',
                    'verified': True
                },
                {
                    'symbol': 'KANGO',
                    'name': 'Kango',
                    'tvl': 776500,
                    'tvl_formatted': '$776.5K',
                    'volume_24h': 107800,
                    'volume_24h_formatted': '$107.8K',
                    'change_24h': -2.10,
                    'liquidity_providers': 900,
                    'holders': 3400,
                    'price': 0.0156,
                    'momentum': '⚡',
                    'contract_address': 'kaspa:qrkango123456789...',
                    'verified': True
                },
                {
                    'symbol': 'ZEAL',
                    'name': 'Zeal Token',
                    'tvl': 719600,
                    'tvl_formatted': '$719.6K',
                    'volume_24h': 55800,
                    'volume_24h_formatted': '$55.8K',
                    'change_24h': -2.24,
                    'liquidity_providers': 1100,
                    'holders': 4100,
                    'price': 0.0198,
                    'momentum': '💎',
                    'contract_address': 'kaspa:qrzeal123456789...',
                    'verified': True
                },
                {
                    'symbol': 'KASPER',
                    'name': 'Kasper Ghost',
                    'tvl': 473300,
                    'tvl_formatted': '$473.3K',
                    'volume_24h': 51700,
                    'volume_24h_formatted': '$51.7K',
                    'change_24h': -11.78,
                    'liquidity_providers': 500,
                    'holders': 2800,
                    'price': 0.0067,
                    'momentum': '📉',
                    'contract_address': 'kaspa:qrkasper123456789...',
                    'verified': True
                },
                {
                    'symbol': 'PWWAS',
                    'name': 'PWWAS',
                    'tvl': 363000,
                    'tvl_formatted': '$363.0K',
                    'volume_24h': 45700,
                    'volume_24h_formatted': '$45.7K',
                    'change_24h': 0.88,
                    'liquidity_providers': 700,
                    'holders': 1900,
                    'price': 0.0134,
                    'momentum': '🚀',
                    'contract_address': 'kaspa:qrpwwas123456789...',
                    'verified': True
                },
                {
                    'symbol': 'MINER',
                    'name': 'Miner Token',
                    'tvl': 210100,
                    'tvl_formatted': '$210.1K',
                    'volume_24h': 22100,
                    'volume_24h_formatted': '$22.1K',
                    'change_24h': -1.55,
                    'liquidity_providers': 400,
                    'holders': 1500,
                    'price': 0.0098,
                    'momentum': '⛏️',
                    'contract_address': 'kaspa:qrminer123456789...',
                    'verified': True
                },
                {
                    'symbol': 'KAPPY',
                    'name': 'Kappy Token',
                    'tvl': 189400,
                    'tvl_formatted': '$189.4K',
                    'volume_24h': 18900,
                    'volume_24h_formatted': '$18.9K',
                    'change_24h': 5.23,
                    'liquidity_providers': 300,
                    'holders': 1200,
                    'price': 0.0045,
                    'momentum': '🔥',
                    'contract_address': 'kaspa:qrkappy123456789...',
                    'verified': True
                }
            ]
            
            # Add timestamp
            for token in tokens:
                token['timestamp'] = datetime.utcnow().isoformat()
            
            return tokens
            
        except Exception as e:
            logger.error(f"Error fetching KRC-20 tokens: {str(e)}")
            raise
    
    def get_token_details(self, symbol: str) -> Optional[Dict]:
        """Get detailed information for a specific token"""
        try:
            tokens = self.get_all_tokens()
            
            for token in tokens:
                if token['symbol'].upper() == symbol.upper():
                    # Add additional details
                    token['price_history'] = self._get_token_price_history(symbol)
                    token['top_holders'] = self._get_token_top_holders(symbol)
                    token['recent_transactions'] = self._get_token_transactions(symbol)
                    return token
            
            return None
            
        except Exception as e:
            logger.error(f"Error fetching token details: {str(e)}")
            raise
    
    def get_trending_tokens(self, limit: int = 5) -> List[Dict]:
        """Get trending KRC-20 tokens based on volume and momentum"""
        try:
            tokens = self.get_all_tokens()
            
            # Sort by volume_24h
            sorted_tokens = sorted(tokens, key=lambda x: x['volume_24h'], reverse=True)
            
            return sorted_tokens[:limit]
            
        except Exception as e:
            logger.error(f"Error fetching trending tokens: {str(e)}")
            raise
    
    def get_token_analytics(self) -> Dict:
        """Get aggregated KRC-20 analytics"""
        try:
            tokens = self.get_all_tokens()
            
            total_tvl = sum(t['tvl'] for t in tokens)
            total_volume_24h = sum(t['volume_24h'] for t in tokens)
            total_holders = sum(t['holders'] for t in tokens)
            
            gainers = [t for t in tokens if t['change_24h'] > 0]
            losers = [t for t in tokens if t['change_24h'] < 0]
            
            return {
                'total_tokens': len(tokens),
                'total_tvl': total_tvl,
                'total_tvl_formatted': f"${total_tvl/1e6:.2f}M",
                'total_volume_24h': total_volume_24h,
                'total_volume_24h_formatted': f"${total_volume_24h/1e3:.1f}K",
                'total_holders': total_holders,
                'gainers_count': len(gainers),
                'losers_count': len(losers),
                'top_gainer': max(tokens, key=lambda x: x['change_24h']) if tokens else None,
                'top_loser': min(tokens, key=lambda x: x['change_24h']) if tokens else None,
                'highest_volume': max(tokens, key=lambda x: x['volume_24h']) if tokens else None,
                'timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error calculating token analytics: {str(e)}")
            raise
    
    def _get_token_price_history(self, symbol: str) -> List[Dict]:
        """Get price history for a token"""
        # Mock price history
        history = []
        base_price = random.uniform(0.01, 0.05)
        
        for i in range(24):
            timestamp = datetime.utcnow() - timedelta(hours=23-i)
            price = base_price + random.uniform(-0.005, 0.005)
            
            history.append({
                'timestamp': timestamp.isoformat(),
                'price': round(price, 6),
                'volume': random.randint(1000, 10000)
            })
        
        return history
    
    def _get_token_top_holders(self, symbol: str) -> List[Dict]:
        """Get top holders for a token"""
        # Mock top holders
        holders = []
        
        for i in range(10):
            holders.append({
                'rank': i + 1,
                'address': f"kaspa:qr{symbol.lower()}{i:056x}",
                'balance': random.randint(100000, 10000000),
                'percentage': round(random.uniform(0.5, 15.0), 2)
            })
        
        return holders
    
    def _get_token_transactions(self, symbol: str) -> List[Dict]:
        """Get recent transactions for a token"""
        # Mock transactions
        transactions = []
        
        for i in range(10):
            transactions.append({
                'hash': f"0x{random.getrandbits(256):064x}",
                'from': f"kaspa:qr{i:062x}",
                'to': f"kaspa:qs{i:062x}",
                'amount': random.randint(100, 50000),
                'timestamp': (datetime.utcnow() - timedelta(minutes=i*15)).isoformat(),
                'type': random.choice(['swap', 'transfer', 'add_liquidity', 'remove_liquidity'])
            })
        
        return transactions
