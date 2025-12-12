import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_caching import Cache
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from datetime import datetime

# Import services
from backend.services.price_service import PriceService
from backend.services.kaspa_service import KaspaService
from backend.services.whale_service import WhaleService
from backend.services.krc20_service import KRC20Service

# Import database models
from backend.models import init_db, get_db, Portfolio, WhaleAlert, UserPreference

# Initialize Flask app
app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['CACHE_TYPE'] = 'simple'
app.config['CACHE_DEFAULT_TIMEOUT'] = 300

# Initialize extensions
CORS(app)
cache = Cache(app)
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

# Initialize database
try:
    init_db()
    print("Database initialized successfully!")
except Exception as e:
    print(f"Database initialization error: {e}")

# Initialize services
price_service = PriceService()
kaspa_service = KaspaService()
whale_service = WhaleService()
krc20_service = KRC20Service()

# ============================================================================
# HEALTH CHECK
# ============================================================================

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '2.0.0'
    })

# ============================================================================
# PRICE ENDPOINTS
# ============================================================================

@app.route('/api/v1/price', methods=['GET'])
@limiter.limit("60 per minute")
@cache.cached(timeout=5)
def get_current_price():
    """Get current KAS price"""
    try:
        data = price_service.get_current_price()
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/v1/price/history', methods=['GET'])
@limiter.limit("30 per minute")
@cache.cached(timeout=60, query_string=True)
def get_price_history():
    """Get historical price data"""
    try:
        timeframe = request.args.get('timeframe', '1D')
        data = price_service.get_price_history(timeframe)
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============================================================================
# NETWORK ENDPOINTS
# ============================================================================

@app.route('/api/v1/network/stats', methods=['GET'])
@limiter.limit("60 per minute")
@cache.cached(timeout=10)
def get_network_stats():
    """Get network statistics"""
    try:
        data = kaspa_service.get_network_stats()
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/v1/network/health', methods=['GET'])
@limiter.limit("60 per minute")
@cache.cached(timeout=30)
def get_network_health():
    """Get network health score"""
    try:
        data = kaspa_service.get_network_health()
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============================================================================
# WHALE ENDPOINTS
# ============================================================================

@app.route('/api/v1/whales/top', methods=['GET'])
@limiter.limit("30 per minute")
@cache.cached(timeout=60, query_string=True)
def get_top_whales():
    """Get top whale addresses"""
    try:
        limit = request.args.get('limit', 10, type=int)
        data = whale_service.get_top_whales(limit)
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/v1/whales/alerts', methods=['GET'])
@limiter.limit("30 per minute")
@cache.cached(timeout=30, query_string=True)
def get_whale_alerts():
    """Get recent whale alerts"""
    try:
        hours = request.args.get('hours', 24, type=int)
        limit = request.args.get('limit', 20, type=int)
        data = whale_service.get_recent_whale_alerts(hours, limit)
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/v1/whales/statistics', methods=['GET'])
@limiter.limit("30 per minute")
@cache.cached(timeout=300)
def get_whale_statistics():
    """Get whale statistics"""
    try:
        data = whale_service.get_whale_statistics()
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============================================================================
# WALLET ENDPOINTS
# ============================================================================

@app.route('/api/v1/wallet/<address>', methods=['GET'])
@limiter.limit("30 per minute")
@cache.cached(timeout=30, query_string=True)
def get_wallet_info(address):
    """Get wallet information"""
    try:
        data = kaspa_service.get_wallet_info(address)
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============================================================================
# KRC-20 ENDPOINTS
# ============================================================================

@app.route('/api/v1/krc20/tokens', methods=['GET'])
@limiter.limit("60 per minute")
@cache.cached(timeout=120)
def get_krc20_tokens():
    """Get all KRC-20 tokens"""
    try:
        data = krc20_service.get_all_tokens()
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/v1/krc20/token/<symbol>', methods=['GET'])
@limiter.limit("30 per minute")
@cache.cached(timeout=120, query_string=True)
def get_krc20_token_details(symbol):
    """Get KRC-20 token details"""
    try:
        data = krc20_service.get_token_details(symbol.upper())
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/v1/krc20/trending', methods=['GET'])
@limiter.limit("30 per minute")
@cache.cached(timeout=120)
def get_trending_krc20():
    """Get trending KRC-20 tokens"""
    try:
        limit = request.args.get('limit', 5, type=int)
        data = krc20_service.get_trending_tokens(limit)
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/v1/krc20/analytics', methods=['GET'])
@limiter.limit("30 per minute")
@cache.cached(timeout=300)
def get_krc20_analytics():
    """Get KRC-20 ecosystem analytics"""
    try:
        data = krc20_service.get_krc20_analytics()
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# =======
