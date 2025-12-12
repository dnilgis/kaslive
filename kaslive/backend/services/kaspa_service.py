"""
Kaspa Service - Handles all Kaspa blockchain interactions
"""

import requests
import logging
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import re

from backend.config import Config

logger = logging.getLogger(__name__)


class KaspaService:
    """Service for interacting with Kaspa blockchain"""
    
    def __init__(self):
        self.api_url = Config.KASPA_API_URL
        self.explorer_api = Config.KASPA_EXPLORER_API
        self.rpc_url = Config.KASPA_RPC_URL
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'KASLIVE/2.0',
            'Accept': 'application/json'
        })
    
    def get_network_stats(self) -> Dict:
        """Get current network statistics"""
        try:
            # In production, these would be real API calls
            # For now, returning mock data structure
            stats = {
                'blocks_per_second': 1.0,
                'hashrate': 945000000000000,  # PH/s in hash/s
                'hashrate_formatted': '945 PH/s',
                'supply': 27100000000,  # Total supply in sompi
                'supply_formatted': '27.1B KAS',
                'nodes': 620,
                'transactions_per_minute': 3200,
                'orphan_rate': 0.05,
                'block_count': 4500000,
                'network_difficulty': 1.2e18,
                'timestamp': datetime.utcnow().isoformat()
            }
            
            # TODO: Implement actual API calls
            # response = self.session.get(f"{self.api_url}/info/network")
            # if response.status_code == 200:
            #     data = response.json()
            #     stats = self._parse_network_stats(data)
            
            return stats
            
        except Exception as e:
            logger.error(f"Error fetching network stats: {str(e)}")
            raise
    
    def calculate_network_health(self) -> Dict:
        """Calculate network health score based on various metrics"""
        try:
            stats = self.get_network_stats()
            
            # Calculate health metrics
            decentralization_score = self._calculate_decentralization_score(stats)
            security_score = self._calculate_security_score(stats)
            speed_score = self._calculate_speed_score(stats)
            stability_score = self._calculate_stability_score(stats)
            
            # Overall health score (weighted average)
            overall_score = int(
                decentralization_score * 0.3 +
                security_score * 0.3 +
                speed_score * 0.2 +
                stability_score * 0.2
            )
            
            return {
                'overall_score': overall_score,
                'decentralization': self._score_to_status(decentralization_score),
                'security': self._score_to_status(security_score),
                'speed': self._score_to_status(speed_score),
                'stability': self._score_to_status(stability_score),
                'timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error calculating network health: {str(e)}")
            raise
    
    def get_wallet_data(self, address: str) -> Dict:
        """Get wallet balance and transaction history"""
        try:
            if not self.is_valid_address(address):
                raise ValueError("Invalid Kaspa address")
            
            # Mock data structure
            wallet_data = {
                'address': address,
                'balance': 125000.50,
                'balance_usd': 5975.02,
                'transaction_count': 1247,
                'last_transaction': (datetime.utcnow() - timedelta(hours=2)).isoformat(),
                'received': 1500000.00,
                'sent': 1375000.00,
                'timestamp': datetime.utcnow().isoformat()
            }
            
            # TODO: Implement actual API call
            # response = self.session.get(f"{self.explorer_api}/address/{address}")
            
            return wallet_data
            
        except Exception as e:
            logger.error(f"Error fetching wallet data: {str(e)}")
            raise
    
    def get_blockdag_metrics(self) -> Dict:
        """Get BlockDAG specific metrics"""
        try:
            return {
                'block_count': 4500000,
                'blocks_per_second': 1.0,
                'dag_tips': 3,
                'tip_hash': '0x4f7a2b3c1d5e8f9a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4',
                'average_confirmation_time': 3.2,
                'pending_transactions': 1452,
                'orphan_blocks': 245,
                'orphan_rate': 0.05,
                'timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error fetching BlockDAG metrics: {str(e)}")
            raise
    
    def get_recent_transactions(self, limit: int = 20) -> List[Dict]:
        """Get recent network transactions"""
        try:
            # Mock transaction data
            transactions = []
            for i in range(limit):
                tx = {
                    'hash': f"0x{i:064x}",
                    'from': f"kaspa:qq{i:040x}",
                    'to': f"kaspa:qz{i:040x}",
                    'amount': round(1000 + (i * 100.5), 2),
                    'type': 'send' if i % 2 == 0 else 'receive',
                    'timestamp': (datetime.utcnow() - timedelta(seconds=i*30)).isoformat(),
                    'confirmations': 10 + i
                }
                transactions.append(tx)
            
            # TODO: Implement actual API call
            # response = self.session.get(f"{self.explorer_api}/transactions/recent?limit={limit}")
            
            return transactions
            
        except Exception as e:
            logger.error(f"Error fetching recent transactions: {str(e)}")
            raise
    
    def calculate_mining_profitability(
        self,
        hashrate_ghs: float,
        power_watts: float,
        electricity_cost_kwh: float
    ) -> Dict:
        """Calculate mining profitability"""
        try:
            from backend.services.price_service import PriceService
            price_service = PriceService()
            
            # Get current KAS price
            price_data = price_service.get_current_price()
            kas_price = price_data['price']
            
            # Network parameters
            network_hashrate_hs = Config.DEFAULT_NETWORK_HASHRATE * 1e15  # PH/s to H/s
            block_reward = Config.DEFAULT_BLOCK_REWARD
            blocks_per_day = Config.BLOCKS_PER_DAY
            
            # Convert hashrate to H/s
            user_hashrate_hs = hashrate_ghs * 1e9
            
            # Calculate share of network hashrate
            hashrate_share = user_hashrate_hs / network_hashrate_hs
            
            # Calculate KAS mined per day
            kas_per_day = hashrate_share * block_reward * blocks_per_day
            
            # Calculate revenue
            daily_revenue = kas_per_day * kas_price
            
            # Calculate electricity cost
            daily_power_kwh = (power_watts / 1000) * 24
            daily_electricity_cost = daily_power_kwh * electricity_cost_kwh
            
            # Calculate profit
            daily_profit = daily_revenue - daily_electricity_cost
            monthly_profit = daily_profit * 30
            yearly_profit = daily_profit * 365
            
            return {
                'kas_per_day': round(kas_per_day, 2),
                'daily_revenue': round(daily_revenue, 2),
                'daily_electricity_cost': round(daily_electricity_cost, 2),
                'daily_profit': round(daily_profit, 2),
                'monthly_profit': round(monthly_profit, 2),
                'yearly_profit': round(yearly_profit, 2),
                'roi_days': round(0 / daily_profit if daily_profit > 0 else 0, 0),  # Assuming hardware cost
                'timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error calculating mining profitability: {str(e)}")
            raise
    
    @staticmethod
    def is_valid_address(address: str) -> bool:
        """Validate Kaspa address format"""
        # Kaspa addresses start with 'kaspa:' and have specific format
        pattern = r'^kaspa:[a-z0-9]{61}$'
        return bool(re.match(pattern, address.lower()))
    
    def _calculate_decentralization_score(self, stats: Dict) -> int:
        """Calculate decentralization score based on node count and distribution"""
        nodes = stats.get('nodes', 0)
        # Score based on node count (620+ is excellent)
        if nodes >= 600:
            return 95
        elif nodes >= 400:
            return 85
        elif nodes >= 200:
            return 75
        else:
            return 60
    
    def _calculate_security_score(self, stats: Dict) -> int:
        """Calculate security score based on hashrate and network difficulty"""
        hashrate = stats.get('hashrate', 0)
        # Score based on hashrate (higher is better)
        if hashrate >= 900e12:  # 900 PH/s
            return 95
        elif hashrate >= 700e12:
            return 85
        elif hashrate >= 500e12:
            return 75
        else:
            return 65
    
    def _calculate_speed_score(self, stats: Dict) -> int:
        """Calculate speed score based on BPS and transaction throughput"""
        bps = stats.get('blocks_per_second', 0)
        tx_per_min = stats.get('transactions_per_minute', 0)
        
        # Kaspa's target is 1 BPS
        if bps >= 0.95 and tx_per_min >= 3000:
            return 95
        elif bps >= 0.8:
            return 85
        else:
            return 75
    
    def _calculate_stability_score(self, stats: Dict) -> int:
        """Calculate stability score based on orphan rate and network consistency"""
        orphan_rate = stats.get('orphan_rate', 0)
        
        # Lower orphan rate is better
        if orphan_rate <= 0.05:
            return 90
        elif orphan_rate <= 0.10:
            return 80
        elif orphan_rate <= 0.15:
            return 70
        else:
            return 60
    
    @staticmethod
    def _score_to_status(score: int) -> str:
        """Convert numeric score to status string"""
        if score >= 90:
            return "EXCELLENT"
        elif score >= 80:
            return "GOOD"
        elif score >= 70:
            return "FAIR"
        else:
            return "POOR"
