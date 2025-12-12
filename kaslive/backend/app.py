# NEW ENDPOINTS - Add after existing routes

@app.route('/api/v1/daa/info', methods=['GET'])
def get_daa_info():
    """Get DAA Score information"""
    try:
        service = KaspaService()
        data = service.get_daa_info()
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/v1/mempool/info', methods=['GET'])
def get_mempool_info():
    """Get mempool status"""
    try:
        service = KaspaService()
        data = service.get_mempool_info()
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/v1/network/bps', methods=['GET'])
def get_bps():
    """Get blocks per second"""
    try:
        service = KaspaService()
        data = service.get_blocks_per_second()
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/v1/comparison', methods=['GET'])
def get_comparison():
    """Compare Kaspa vs BTC vs ETH"""
    try:
        service = KaspaService()
        data = service.get_comparison_data()
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
