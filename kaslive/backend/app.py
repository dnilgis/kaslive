from flask import Flask, render_template, jsonify
from flask_cors import CORS
import requests
from datetime import datetime, timedelta
import os
from collections import defaultdict

# Support backend/frontend folder structure
app = Flask(__name__, 
            template_folder='../frontend/templates',
            static_folder='../frontend/static')
CORS(app)

# API Configuration
COINGECKO_API = "https://api.coingecko.com/api/v3"
KASPA_API = "https://api.kaspa.org"
KASPA_EXPLORER = "https://api.kaspa.org"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/price')
def get_price():
    """Get current KAS price and market data"""
    try:
        response = requests.get(
            f"{COINGECKO_API}/simple/price",
            params={
                'ids': 'kaspa',
                'vs_currencies': 'usd',
                'include_market_cap': 'true',
                'include_24hr_vol': 'true',
                'include_24hr_change': 'true'
            },
            timeout=10
        )
        data = response.json()
        
        return jsonify({
            'price': data['kaspa']['usd'],
            'market_cap': data['kaspa']['usd_market_cap'],
            'volume_24h': data['kaspa']['usd_24h_vol'],
            'change_24h': data['kaspa']['usd_24h_change']
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/chart/<timeframe>')
def get_chart_data(timeframe):
    """Get price chart data with technical indicators"""
    try:
        days_map = {
            '1H': 1,
            '4H': 1,
            '1D': 7,
            '1W': 30,
            '1M': 90,
            'ALL': 365
        }
        days = days_map.get(timeframe, 7)
        
        response = requests.get(
            f"{COINGECKO_API}/coins/kaspa/market_chart",
            params={'vs_currency': 'usd', 'days': days},
            timeout=15
        )
        data = response.json()
        
        prices = data.get('prices', [])
        
        # Calculate high, low, and moving averages
        price_values = [p[1] for p in prices]
        
        if price_values:
            high_24h = max(price_values[-24:]) if len(price_values) >= 24 else max(price_values)
            low_24h = min(price_values[-24:]) if len(price_values) >= 24 else min(price_values)
            
            # Simple moving average
            sma_20 = []
            for i in range(len(price_values)):
                if i >= 19:
                    sma_20.append([prices[i][0], sum(price_values[i-19:i+1])/20])
                else:
                    sma_20.append([prices[i][0], None])
        else:
            high_24h = 0
            low_24h = 0
            sma_20 = []
        
        return jsonify({
            'prices': prices,
            'high_24h': high_24h,
            'low_24h': low_24h,
            'sma_20': sma_20,
            'timeframe': timeframe
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/network')
def get_network_stats():
    """Get Kaspa network statistics"""
    try:
        # Get network info
        response = requests.get(f"{KASPA_API}/info/network", timeout=10)
        network_data = response.json()
        
        # Calculate hashrate: difficulty * 2 * blocks_per_second
        difficulty = float(network_data.get('difficulty', 0))
        bps = float(network_data.get('blockRate', 1))
        hashrate = (difficulty * 2 * bps) / 1e15  # Convert to PH/s
        
        # Get DAG info
        dag_response = requests.get(f"{KASPA_API}/info/blockdag", timeout=10)
        dag_data = dag_response.json()
        
        return jsonify({
            'hashrate': round(hashrate, 2),
            'difficulty': difficulty,
            'block_rate': bps,
            'dag_score': dag_data.get('tipHeight', 0),
            'mempool_size': network_data.get('mempoolSize', 0),
            'circulating_supply': 26500000000  # Updated circulating supply
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/nodes')
def get_active_nodes():
    """Get active node count from kaspa-crawler data"""
    try:
        # Try to get from kaspa-crawler GitHub API
        response = requests.get(
            "https://raw.githubusercontent.com/tmrlvi/kaspa-crawler/main/data/nodes.json",
            timeout=10
        )
        
        if response.status_code == 200:
            nodes_data = response.json()
            active_nodes = len([n for n in nodes_data if n.get('active', False)])
            return jsonify({
                'active_nodes': active_nodes,
                'total_discovered': len(nodes_data),
                'source': 'kaspa-crawler'
            })
        else:
            # Fallback to estimation
            return jsonify({
                'active_nodes': 20000,
                'total_discovered': 25000,
                'source': 'estimated'
            })
    except Exception as e:
        # Fallback
        return jsonify({
            'active_nodes': 20000,
            'total_discovered': 25000,
            'source': 'estimated',
            'error': str(e)
        })

@app.route('/api/comparison')
def get_comparison():
    """Get comparison data for KAS, BTC, ETH"""
    try:
        response = requests.get(
            f"{COINGECKO_API}/simple/price",
            params={
                'ids': 'kaspa,bitcoin,ethereum',
                'vs_currencies': 'usd',
                'include_market_cap': 'true'
            },
            timeout=10
        )
        data = response.json()
        
        comparison = {
            'kaspa': {
                'price': data['kaspa']['usd'],
                'market_cap': data['kaspa']['usd_market_cap'],
                'tps': 10,
                'block_time': '1 second',
                'finality': '~10 seconds',
                'consensus': 'GHOSTDAG (PoW)',
                'tx_fee': 0.0001
            },
            'bitcoin': {
                'price': data['bitcoin']['usd'],
                'market_cap': data['bitcoin']['usd_market_cap'],
                'tps': 7,
                'block_time': '10 minutes',
                'finality': '~60 minutes',
                'consensus': 'Nakamoto (PoW)',
                'tx_fee': 2.50
            },
            'ethereum': {
                'price': data['ethereum']['usd'],
                'market_cap': data['ethereum']['usd_market_cap'],
                'tps': 15,
                'block_time': '12 seconds',
                'finality': '~15 minutes',
                'consensus': 'Casper (PoS)',
                'tx_fee': 1.20
            }
        }
        
        return jsonify(comparison)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/whale-alerts')
def get_whale_alerts():
    """Get recent large transactions (whale alerts)"""
    try:
        # Get recent blocks and transactions
        response = requests.get(f"{KASPA_EXPLORER}/transactions/search", 
                              params={'limit': 50}, timeout=10)
        
        if response.status_code == 200:
            txs = response.json()
            
            # Filter for large transactions (>100,000 KAS)
            whale_threshold = 100000
            whale_alerts = []
            
            for tx in txs:
                amount = tx.get('outputs', [{}])[0].get('amount', 0) / 1e8
                if amount >= whale_threshold:
                    whale_alerts.append({
                        'hash': tx.get('transaction_id', '')[:16] + '...',
                        'amount': round(amount, 2),
                        'from': tx.get('inputs', [{}])[0].get('previous_outpoint_address', 'Unknown')[:12] + '...',
                        'to': tx.get('outputs', [{}])[0].get('script_public_key_address', 'Unknown')[:12] + '...',
                        'timestamp': tx.get('block_time', datetime.now().isoformat())
                    })
            
            return jsonify({'alerts': whale_alerts[:10]})
        else:
            return jsonify({'alerts': []})
    except Exception as e:
        return jsonify({'alerts': [], 'error': str(e)})

@app.route('/api/top-addresses')
def get_top_addresses():
    """Get top 100 addresses from Kaspa explorer"""
    try:
        # Scrape from kaspa explorer API
        response = requests.get("https://api.kaspa.org/addresses/rich-list", 
                              params={'limit': 100}, timeout=15)
        
        if response.status_code == 200:
            addresses = response.json()
            
            # Add badges based on balance
            for addr in addresses:
                balance = addr.get('balance', 0) / 1e8
                if balance >= 10000000:
                    addr['badge'] = '🐋 Mega Whale'
                elif balance >= 1000000:
                    addr['badge'] = '🦈 Whale'
                elif balance >= 100000:
                    addr['badge'] = '🐬 Dolphin'
                else:
                    addr['badge'] = '🐟 Fish'
            
            return jsonify({'addresses': addresses})
        else:
            return jsonify({'addresses': []})
    except Exception as e:
        return jsonify({'addresses': [], 'error': str(e)})

@app.route('/api/krc20-tokens')
def get_krc20_tokens():
    """Get KRC-20 token list"""
    try:
        # Try to get from Kaspa token registry
        response = requests.get(
            "https://raw.githubusercontent.com/kaspagang/krc20-token-list/main/tokens.json",
            timeout=10
        )
        
        if response.status_code == 200:
            tokens = response.json()
            return jsonify({'tokens': tokens})
        else:
            # Fallback to known tokens
            fallback_tokens = [
                {
                    'symbol': 'NACHO',
                    'name': 'Nacho the Kat',
                    'total_supply': 1000000000,
                    'holders': 5000,
                    'contract': 'kaspa:...'
                },
                {
                    'symbol': 'KAS20',
                    'name': 'Kaspa Token',
                    'total_supply': 500000000,
                    'holders': 3000,
                    'contract': 'kaspa:...'
                }
            ]
            return jsonify({'tokens': fallback_tokens, 'source': 'fallback'})
    except Exception as e:
        return jsonify({'tokens': [], 'error': str(e)})

@app.route('/api/blockdag')
def get_blockdag_data():
    """Get BlockDAG visualization data"""
    try:
        response = requests.get(f"{KASPA_API}/info/blockdag", timeout=10)
        dag_data = response.json()
        
        # Get recent blocks for visualization
        blocks_response = requests.get(
            f"{KASPA_API}/blocks",
            params={'limit': 50},
            timeout=10
        )
        
        blocks = blocks_response.json() if blocks_response.status_code == 200 else []
        
        return jsonify({
            'tip_height': dag_data.get('tipHeight', 0),
            'blocks': blocks,
            'dag_score': dag_data.get('tipHeight', 0),
            'blue_score': dag_data.get('blueScore', 0)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/network-health')
def get_network_health():
    """Get network health metrics with explanations"""
    try:
        # Get various network metrics
        network_resp = requests.get(f"{KASPA_API}/info/network", timeout=10)
        network_data = network_resp.json()
        
        # Calculate health score based on multiple factors
        mempool_size = network_data.get('mempoolSize', 0)
        block_rate = network_data.get('blockRate', 1)
        
        # Health scoring
        mempool_health = min(100, max(0, 100 - (mempool_size / 1000)))
        bps_health = min(100, (block_rate / 1.0) * 100)
        
        overall_health = (mempool_health + bps_health) / 2
        
        if overall_health >= 90:
            status = 'Excellent'
            status_class = 'excellent'
        elif overall_health >= 70:
            status = 'Good'
            status_class = 'good'
        elif overall_health >= 50:
            status = 'Fair'
            status_class = 'fair'
        else:
            status = 'Poor'
            status_class = 'poor'
        
        return jsonify({
            'overall_score': round(overall_health, 1),
            'status': status,
            'status_class': status_class,
            'metrics': {
                'mempool_health': {
                    'score': round(mempool_health, 1),
                    'description': 'Transaction queue efficiency',
                    'value': mempool_size
                },
                'block_rate_health': {
                    'score': round(bps_health, 1),
                    'description': 'Block production rate',
                    'value': round(block_rate, 2)
                }
            },
            'explanation': 'Network health is calculated based on mempool size (lower is better) and block production rate (target: 1 BPS). Scores above 90 indicate excellent network conditions.'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
