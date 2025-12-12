"""
API Routes for KASLIVE v2.0
Main endpoints for data retrieval
"""

from flask import Blueprint, jsonify, request
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import logging

from backend.services.kaspa_service import KaspaService
from backend.services.price_service import PriceService
from backend.services.whale_service import WhaleService
from backend.services.krc20_service import KRC20Service

logger = logging.getLogger(__name__)

api_bp = Blueprint('api', __name__)
limiter = Limiter(key_func=get_remote_address)

# Initialize services
kaspa_service = KaspaService()
price_service = PriceService()
whale_service = WhaleService()
krc20_service = KRC20Service()


@api_bp.route('/price', methods=['GET'])
@limiter.limit("60 per minute")
def get_price():
    """Get current KAS price"""
    try:
        price_data = price_service.get_current_price()
        return jsonify({
            'success': True,
            'data': price_data
        }), 200
    except Exception as e:
        logger.error(f"Error fetching price: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch price data'
        }), 500


@api_bp.route('/price/history', methods=['GET'])
@limiter.limit("30 per minute")
def get_price_history():
    """Get historical price data"""
    try:
        timeframe = request.args.get('timeframe', '1D')  # 1H, 4H, 1D, 1W, 1M
        limit = min(int(request.args.get('limit', 100)), 1000)
        
        history = price_service.get_price_history(timeframe, limit)
        
        return jsonify({
            'success': True,
            'data': {
                'timeframe': timeframe,
                'prices': history
            }
        }), 200
    except Exception as e:
        logger.error(f"Error fetching price history: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch price history'
        }), 500


@api_bp.route('/network/stats', methods=['GET'])
@limiter.limit("60 per minute")
def get_network_stats():
    """Get current network statistics"""
    try:
        stats = kaspa_service.get_network_stats()
        return jsonify({
            'success': True,
            'data': stats
        }), 200
    except Exception as e:
        logger.error(f"Error fetching network stats: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch network stats'
        }), 500


@api_bp.route('/network/health', methods=['GET'])
@limiter.limit("30 per minute")
def get_network_health():
    """Get network health score and metrics"""
    try:
        health = kaspa_service.calculate_network_health()
        return jsonify({
            'success': True,
            'data': health
        }), 200
    except Exception as e:
        logger.error(f"Error calculating network health: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to calculate network health'
        }), 500


@api_bp.route('/whales/top', methods=['GET'])
@limiter.limit("30 per minute")
def get_top_whales():
    """Get top whale addresses"""
    try:
        limit = min(int(request.args.get('limit', 10)), 100)
        whales = whale_service.get_top_whales(limit)
        
        return jsonify({
            'success': True,
            'data': {
                'whales': whales,
                'count': len(whales)
            }
        }), 200
    except Exception as e:
        logger.error(f"Error fetching whales: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch whale data'
        }), 500


@api_bp.route('/whales/alerts', methods=['GET'])
@limiter.limit("30 per minute")
def get_whale_alerts():
    """Get recent whale movement alerts"""
    try:
        limit = min(int(request.args.get('limit', 10)), 50)
        alerts = whale_service.get_recent_alerts(limit)
        
        return jsonify({
            'success': True,
            'data': {
                'alerts': alerts,
                'count': len(alerts)
            }
        }), 200
    except Exception as e:
        logger.error(f"Error fetching whale alerts: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch whale alerts'
        }), 500


@api_bp.route('/wallet/<address>', methods=['GET'])
@limiter.limit("60 per minute")
def get_wallet_balance(address):
    """Get wallet balance and transactions"""
    try:
        if not kaspa_service.is_valid_address(address):
            return jsonify({
                'success': False,
                'error': 'Invalid Kaspa address'
            }), 400
        
        wallet_data = kaspa_service.get_wallet_data(address)
        
        return jsonify({
            'success': True,
            'data': wallet_data
        }), 200
    except Exception as e:
        logger.error(f"Error fetching wallet data: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch wallet data'
        }), 500


@api_bp.route('/krc20/tokens', methods=['GET'])
@limiter.limit("30 per minute")
def get_krc20_tokens():
    """Get KRC-20 token list and stats"""
    try:
        tokens = krc20_service.get_all_tokens()
        
        return jsonify({
            'success': True,
            'data': {
                'tokens': tokens,
                'count': len(tokens)
            }
        }), 200
    except Exception as e:
        logger.error(f"Error fetching KRC-20 tokens: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch KRC-20 tokens'
        }), 500


@api_bp.route('/krc20/token/<symbol>', methods=['GET'])
@limiter.limit("60 per minute")
def get_krc20_token(symbol):
    """Get detailed info for a specific KRC-20 token"""
    try:
        token = krc20_service.get_token_details(symbol.upper())
        
        if not token:
            return jsonify({
                'success': False,
                'error': 'Token not found'
            }), 404
        
        return jsonify({
            'success': True,
            'data': token
        }), 200
    except Exception as e:
        logger.error(f"Error fetching token details: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch token details'
        }), 500


@api_bp.route('/blockdag/metrics', methods=['GET'])
@limiter.limit("60 per minute")
def get_blockdag_metrics():
    """Get BlockDAG metrics"""
    try:
        metrics = kaspa_service.get_blockdag_metrics()
        
        return jsonify({
            'success': True,
            'data': metrics
        }), 200
    except Exception as e:
        logger.error(f"Error fetching BlockDAG metrics: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch BlockDAG metrics'
        }), 500


@api_bp.route('/mining/calculate', methods=['POST'])
@limiter.limit("30 per minute")
def calculate_mining():
    """Calculate mining profitability"""
    try:
        data = request.get_json()
        
        hashrate = float(data.get('hashrate', 100))  # GH/s
        power = float(data.get('power', 3000))  # Watts
        electricity_cost = float(data.get('electricity_cost', 0.12))  # $/kWh
        
        calculation = kaspa_service.calculate_mining_profitability(
            hashrate, power, electricity_cost
        )
        
        return jsonify({
            'success': True,
            'data': calculation
        }), 200
    except ValueError as e:
        return jsonify({
            'success': False,
            'error': 'Invalid input parameters'
        }), 400
    except Exception as e:
        logger.error(f"Error calculating mining: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to calculate mining profitability'
        }), 500


@api_bp.route('/transactions/recent', methods=['GET'])
@limiter.limit("60 per minute")
def get_recent_transactions():
    """Get recent network transactions"""
    try:
        limit = min(int(request.args.get('limit', 20)), 100)
        transactions = kaspa_service.get_recent_transactions(limit)
        
        return jsonify({
            'success': True,
            'data': {
                'transactions': transactions,
                'count': len(transactions)
            }
        }), 200
    except Exception as e:
        logger.error(f"Error fetching transactions: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch transactions'
        }), 500


# Error handlers
@api_bp.errorhandler(400)
def bad_request(error):
    return jsonify({
        'success': False,
        'error': 'Bad request'
    }), 400


@api_bp.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'error': 'Resource not found'
    }), 404


@api_bp.errorhandler(429)
def rate_limit_exceeded(error):
    return jsonify({
        'success': False,
        'error': 'Rate limit exceeded'
    }), 429


@api_bp.errorhandler(500)
def internal_server_error(error):
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500
