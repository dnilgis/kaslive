from flask import Flask, jsonify, request
from flask_cors import CORS
from services.kaspa_service import KaspaService
from services.price_service import PriceService
from services.whale_service import WhaleService
from services.krc20_service import KRC20Service

# Create Flask app FIRST before using it
app = Flask(__name__)
CORS(app)

# Health check route
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'service': 'kaslive-api'})

# Price endpoints
@app.route('/api/v1/price', methods=['GET'])
def get_price():
    """Get current Kaspa price"""
    try:
        service = PriceService()
        data = service.get_current_price()
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/v1/price/history', methods=['GET'])
def get_price_history():
    """Get historical price data"""
    try:
        timeframe = request.args.get('timeframe', '1D')
        service = PriceService()
        data = service.get_price_history(timeframe)
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Network endpoints
@app.route('/api/v1/network/stats', methods=['GET'])
def get_network_stats():
    """Get network statistics"""
    try:
        service = KaspaService()
        data = service.get_network_stats()
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/v1/network/health', methods=['GET'])
def get_network_health():
    """Get network health score"""
    try:
        service = KaspaService()
        data = service.get_network_health()
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# NEW ENDPOINTS - DAA Info
@app.route('/api/v1/daa/info', methods=['GET'])
def get_daa_info():
    """Get DAA Score information"""
    try:
        service = KaspaService()
        data = service.get_daa_info()
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# NEW ENDPOINTS - Mempool
@app.route('/api/v1/mempool/info', methods=['GET'])
def get_mempool_info():
    """Get mempool status"""
    try:
        service = KaspaService()
        data = service.get_mempool_info()
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# NEW ENDPOINTS - BPS
@app.route('/api/v1/network/bps', methods=['GET'])
def get_bps():
    """Get blocks per second"""
    try:
        service = KaspaService()
        data = service.get_blocks_per_second()
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# NEW ENDPOINTS - Comparison
@app.route('/api/v1/comparison', methods=['GET'])
def get_comparison():
    """Compare Kaspa vs BTC vs ETH"""
    try:
        service = KaspaService()
        data = service.get_comparison_data()
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# NEW ENDPOINTS - BlockDAG Metrics
@app.route('/api/v1/blockdag/metrics', methods=['GET'])
def get_blockdag_metrics():
    """Get BlockDAG specific metrics"""
    try:
        service = KaspaService()
        data = service.get_blockdag_metrics()
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Whale endpoints
@app.route('/api/v1/whales/top', methods=['GET'])
def get_top_whales():
    """Get top whale addresses"""
    try:
        limit = int(request.args.get('limit', 10))
        service = WhaleService()
        data = service.get_top_whales(limit)
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/v1/whales/alerts', methods=['GET'])
def get_whale_alerts():
    """Get recent whale transaction alerts"""
    try:
        hours = int(request.args.get('hours', 24))
        limit = int(request.args.get('limit', 20))
        service = WhaleService()
        data = service.get_recent_alerts(hours, limit)
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# KRC-20 endpoints
@app.route('/api/v1/krc20/tokens', methods=['GET'])
def get_krc20_tokens():
    """Get KRC-20 token list"""
    try:
        service = KRC20Service()
        data = service.get_token_list()
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Wallet endpoints
@app.route('/api/v1/wallet/<address>', methods=['GET'])
def get_wallet_info(address):
    """Get wallet balance and info"""
    try:
        service = KaspaService()
        data = service.get_wallet_info(address)
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Mining endpoints
@app.route('/api/v1/mining/profitability', methods=['GET'])
def calculate_mining_profitability():
    """Calculate mining profitability"""
    try:
        hashrate = float(request.args.get('hashrate', 1000000000))
        electricity_cost = float(request.args.get('electricity_cost', 0.12))
        
        service = KaspaService()
        data = service.calculate_mining_profitability(hashrate, electricity_cost)
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 10000))
    app.run(host='0.0.0.0', port=port, debug=False)
