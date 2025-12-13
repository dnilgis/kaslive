"""
API Routes for KASLIVE v2.0
All public and authenticated endpoints are defined here.
"""

from flask import Blueprint, jsonify, request
import logging

from backend.services.kaspa_service import KaspaService
from backend.services.price_service import PriceService
from backend.services.whale_service import WhaleService
from backend.services.krc20_service import KRC20Service
from backend.utils.cache import cached

logger = logging.getLogger(__name__)

api_bp = Blueprint('api', __name__)

# Initialize services
kaspa_service = KaspaService()
price_service = PriceService()
whale_service = WhaleService()
krc20_service = KRC20Service()

# The rate limiter is now initialized globally in app.py

# Helper function for consistent API responses
def api_response(data, status=200):
    """Generates a consistent successful JSON response."""
    return jsonify({
        'success': True,
        'data': data
    }), status

# Helper function for handling service failures without fallback data
def handle_service_failure(e, error_message, status=503):
    """Logs error and returns a structured failure response."""
    logger.error(f"Service error ({error_message}): {str(e)}")
    # IMPORTANT: Returning 503 Service Unavailable or 500 Internal Server Error
    # instead of mock/fallback data as requested by the user.
    return jsonify({
        'success': False,
        'error': error_message
    }), status


@api_bp.route('/price', methods=['GET'])
@cached(ttl=15, key_prefix="price")
def get_current_price():
    """Get current KAS price and market data."""
    try:
        price_data = price_service.get_current_price()
        if price_data is None:
             # Treat None from service as a recoverable failure
            return handle_service_failure(None, 'Price data currently unavailable from upstream API.', 503)

        return api_response(price_data)
    except Exception as e:
        return handle_service_failure(e, 'Failed to fetch price data')


@api_bp.route('/price/history', methods=['GET'])
@cached(ttl=300, key_prefix="price_history")
def get_price_history():
    """Get historical price data."""
    try:
        timeframe = request.args.get('timeframe', '1D')
        limit = min(int(request.args.get('limit', 100)), 1000)
        
        history = price_service.get_price_history(timeframe, limit)
        
        if not history:
            return handle_service_failure(None, 'Historical price data currently unavailable.', 503)

        return api_response({
            'timeframe': timeframe,
            'prices': history
        })
    except Exception as e:
        return handle_service_failure(e, 'Failed to fetch price history')


@api_bp.route('/network/stats', methods=['GET'])
@cached(ttl=30, key_prefix="network_stats")
def get_network_stats():
    """Get current network statistics (hashrate, difficulty, supply)."""
    try:
        stats = kaspa_service.get_network_stats()
        if stats is None:
            return handle_service_failure(None, 'Network statistics API unavailable.', 503)
        return api_response(stats)
    except Exception as e:
        return handle_service_failure(e, 'Failed to fetch network stats')


@api_bp.route('/network/health', methods=['GET'])
@cached(ttl=60, key_prefix="network_health")
def get_network_health():
    """Calculate and get network health score and metrics."""
    try:
        health = kaspa_service.calculate_network_health()
        if health is None:
            return handle_service_failure(None, 'Cannot calculate network health (dependent APIs failed).', 503)
        return api_response(health)
    except Exception as e:
        return handle_service_failure(e, 'Failed to calculate network health')


@api_bp.route('/whales/top', methods=['GET'])
@cached(ttl=300, key_prefix="top_whales")
def get_top_whales():
    """Get top whale addresses."""
    try:
        limit = min(int(request.args.get('limit', 10)), 100)
        whales = whale_service.get_top_whales(limit)
        
        return api_response({
            'whales': whales,
            'count': len(whales)
        })
    except Exception as e:
        return handle_service_failure(e, 'Failed to fetch whale data')


@api_bp.route('/whales/alerts', methods=['GET'])
@cached(ttl=60, key_prefix="whale_alerts")
def get_whale_alerts():
    """Get recent whale movement alerts."""
    try:
        limit = min(int(request.args.get('limit', 10)), 50)
        alerts = whale_service.get_recent_alerts(limit)
        
        return api_response({
            'alerts': alerts,
            'count': len(alerts)
        })
    except Exception as e:
        return handle_service_failure(e, 'Failed to fetch whale alerts')


@api_bp.route('/wallet/<address>', methods=['GET'])
@cached(ttl=30, key_prefix="wallet_data")
def get_wallet_balance(address):
    """Get wallet balance and transaction count."""
    try:
        if not kaspa_service.is_valid_address(address):
            return jsonify({
                'success': False,
                'error': 'Invalid Kaspa address'
            }), 400
        
        wallet_data = kaspa_service.get_wallet_data(address)
        if wallet_data is None:
            return handle_service_failure(None, f'Could not retrieve data for address: {address}', 404)

        return api_response(wallet_data)
    except Exception as e:
        return handle_service_failure(e, 'Failed to fetch wallet data')


@api_bp.route('/krc20/tokens', methods=['GET'])
@cached(ttl=3600, key_prefix="krc20_tokens")
def get_krc20_tokens():
    """Get KRC-20 token list and stats."""
    try:
        tokens = krc20_service.get_token_list()
        
        return api_response({
            'tokens': tokens,
            'count': len(tokens)
        })
    except Exception as e:
        return handle_service_failure(e, 'Failed to fetch KRC-20 tokens')


@api_bp.route('/blockdag/metrics', methods=['GET'])
@cached(ttl=60, key_prefix="blockdag_metrics")
def get_blockdag_metrics():
    """Get BlockDAG metrics (tips, blue score, BPS)."""
    try:
        metrics = kaspa_service.get_blockdag_metrics()
        if metrics is None:
            return handle_service_failure(None, 'BlockDAG metrics API unavailable.', 503)
        return api_response(metrics)
    except Exception as e:
        return handle_service_failure(e, 'Failed to fetch BlockDAG metrics')


@api_bp.route('/mining/calculate', methods=['POST'])
@cached(ttl=60, key_prefix="mining_calc")
def calculate_mining():
    """Calculate mining profitability based on user input and current network data."""
    try:
        data = request.get_json()
        
        # Ensure all necessary inputs are present and valid
        hashrate = float(data.get('hashrate'))  # GH/s
        power = float(data.get('power'))  # Watts (Removed for simplification in service logic)
        electricity_cost = float(data.get('electricity_cost'))  # $/kWh
        
        calculation = kaspa_service.calculate_mining_profitability(
            hashrate, electricity_cost
        )

        if calculation is None:
            return handle_service_failure(None, 'Network data required for calculation is unavailable.', 503)
        
        return api_response(calculation)
    except (ValueError, TypeError) as e:
        return jsonify({
            'success': False,
            'error': 'Invalid input parameters (hashrate, electricity_cost must be numbers).'
        }), 400
    except Exception as e:
        return handle_service_failure(e, 'Failed to calculate mining profitability')
