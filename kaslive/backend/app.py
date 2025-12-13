from flask import Flask, render_template, jsonify
from flask_cors import CORS
import requests
from datetime import datetime, timedelta
import os

# Support backend/frontend folder structure
app = Flask(__name__, 
            template_folder='../frontend/templates',
            static_folder='../frontend/static')
CORS(app)

# API Configuration
COINGECKO_API = "https://api.coingecko.com/api/v3"
KASPA_API = "https://api.kaspa.org"

# Fallback data when APIs fail
FALLBACK_DATA = {
    'price': 0.0465,
    'market_cap': 1230000000,
    'volume_24h': 45000000,
    'change_24h': -2.05,
    'hashrate': 49.86,
    'dag_score': 42583921,
    'mempool_size': 150,
    'block_rate': 1.00,
    'active_nodes': 20000
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/price')
def get_price():
    """Get current KAS price and market data - FAST"""
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
            timeout=3  # Reduced from 10 to 3 seconds
        )
        data = response.json()
        
        return jsonify({
            'price': data['kaspa']['usd'],
            'market_cap': data['kaspa']['usd_market_cap'],
            'volume_24h': data['kaspa']['usd_24h_vol'],
            'change_24h': data['kaspa']['usd_24h_change']
        })
    except:
        # Return fallback data immediately
        return jsonify({
            'price': FALLBACK_DATA['price'],
            'market_cap': FALLBACK_DATA['market_cap'],
            'volume_24h': FALLBACK_DATA['volume_24h'],
            'change_24h': FALLBACK_DATA['change_24h']
        })

@app.route('/api/chart/<timeframe>')
def get_chart_data(timeframe):
    """Get price chart data - FAST"""
    try:
        days_map = {'1H': 1, '4H': 1, '1D': 7, '1W': 30, '1M': 90, 'ALL': 365}
        days = days_map.get(timeframe, 7)
        
        response = requests.get(
            f"{COINGECKO_API}/coins/kaspa/market_chart",
            params={'vs_currency': 'usd', 'days': days},
            timeout=3
        )
        data = response.json()
        
        prices = data.get('prices', [])
        price_values = [p[1] for p in prices]
        
        high_24h = max(price_values[-24:]) if len(price_values) >= 24 else max(price_values) if price_values else 0.05
        low_24h = min(price_values[-24:]) if len(price_values) >= 24 else min(price_values) if price_values else 0.04
        
        return jsonify({
            'prices': prices,
            'high_24h': high_24h,
            'low_24h': low_24h,
            'timeframe': timeframe
        })
    except:
        # Generate simple fallback chart data
        now = datetime.now()
        prices = [[int((now - timedelta(hours=i)).timestamp() * 1000), 0.0465 + (i % 10) * 0.0001] for i in range(24, 0, -1)]
        return jsonify({
            'prices': prices,
            'high_24h': 0.0512,
            'low_24h': 0.0443,
            'timeframe': timeframe
        })

@app.route('/api/network')
def get_network_stats():
    """Get Kaspa network statistics - FAST"""
    try:
        response = requests.get(f"{KASPA_API}/info/network", timeout=3)
        network_data = response.json()
        
        difficulty = float(network_data.get('difficulty', 0))
        bps = float(network_data.get('blockRate', 1))
        hashrate = (difficulty * 2 * bps) / 1e15
        
        dag_response = requests.get(f"{KASPA_API}/info/blockdag", timeout=2)
        dag_data = dag_response.json() if dag_response.status_code == 200 else {}
        
        return jsonify({
            'hashrate': round(hashrate, 2),
            'difficulty': difficulty,
            'block_rate': bps,
            'dag_score': dag_data.get('tipHeight', network_data.get('virtualDaaScore', 0)),
            'mempool_size': network_data.get('mempoolSize', 0),
            'circulating_supply': 26500000000
        })
    except:
        return jsonify({
            'hashrate': FALLBACK_DATA['hashrate'],
            'difficulty': 1000000000000,
            'block_rate': FALLBACK_DATA['block_rate'],
            'dag_score': FALLBACK_DATA['dag_score'],
            'mempool_size': FALLBACK_DATA['mempool_size'],
            'circulating_supply': 26500000000
        })

@app.route('/api/nodes')
def get_active_nodes():
    """Get active node count - FAST"""
    try:
        response = requests.get(
            "https://raw.githubusercontent.com/tmrlvi/kaspa-crawler/main/data/nodes.json",
            timeout=2
        )
        
        if response.status_code == 200:
            nodes_data = response.json()
            active_nodes = len([n for n in nodes_data if n.get('active', False)])
            return jsonify({
                'active_nodes': active_nodes,
                'total_discovered': len(nodes_data),
                'source': 'kaspa-crawler'
            })
    except:
        pass
    
    return jsonify({
        'active_nodes': FALLBACK_DATA['active_nodes'],
        'total_discovered': 25000,
        'source': 'estimated'
    })

@app.route('/api/comparison')
def get_comparison():
    """Get comparison data for KAS, BTC, ETH - FAST"""
    try:
        response = requests.get(
            f"{COINGECKO_API}/simple/price",
            params={
                'ids': 'kaspa,bitcoin,ethereum',
                'vs_currencies': 'usd',
                'include_market_cap': 'true'
            },
            timeout=3
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
    except:
        return jsonify({
            'kaspa': {
                'price': 0.0465,
                'market_cap': 1230000000,
                'tps': 10,
                'block_time': '1 second',
                'finality': '~10 seconds',
                'consensus': 'GHOSTDAG (PoW)',
                'tx_fee': 0.0001
            },
            'bitcoin': {
                'price': 95000,
                'market_cap': 1900000000000,
                'tps': 7,
                'block_time': '10 minutes',
                'finality': '~60 minutes',
                'consensus': 'Nakamoto (PoW)',
                'tx_fee': 2.50
            },
            'ethereum': {
                'price': 3500,
                'market_cap': 420000000000,
                'tps': 15,
                'block_time': '12 seconds',
                'finality': '~15 minutes',
                'consensus': 'Casper (PoS)',
                'tx_fee': 1.20
            }
        })

@app.route('/api/whale-alerts')
def get_whale_alerts():
    """Get recent large transactions - FAST"""
    try:
        response = requests.get(
            f"{KASPA_API}/transactions/search", 
            params={'limit': 20}, 
            timeout=2
        )
        
        if response.status_code == 200:
            txs = response.json()
            whale_threshold = 100000
            whale_alerts = []
            
            for tx in txs[:10]:
                amount = tx.get('outputs', [{}])[0].get('amount', 0) / 1e8
                if amount >= whale_threshold:
                    whale_alerts.append({
                        'hash': tx.get('transaction_id', '')[:16] + '...',
                        'amount': round(amount, 2),
                        'from': tx.get('inputs', [{}])[0].get('previous_outpoint_address', 'Unknown')[:12] + '...',
                        'to': tx.get('outputs', [{}])[0].get('script_public_key_address', 'Unknown')[:12] + '...',
                        'timestamp': tx.get('block_time', datetime.now().isoformat())
                    })
            
            return jsonify({'alerts': whale_alerts})
    except:
        pass
    
    # Fallback: empty alerts
    return jsonify({'alerts': []})

@app.route('/api/top-addresses')
def get_top_addresses():
    """Get top 100 addresses - FAST"""
    try:
        response = requests.get(
            "https://api.kaspa.org/addresses/rich-list", 
            params={'limit': 100}, 
            timeout=3
        )
        
        if response.status_code == 200:
            addresses = response.json()
            
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
    except:
        pass
    
    # Fallback: generate sample addresses
    sample_addresses = []
    for i in range(10):
        balance = 15000000 - (i * 1000000)
        sample_addresses.append({
            'address': f'kaspa:qp{i}...example',
            'balance': balance * 1e8,
            'badge': '🐋 Mega Whale' if balance >= 10000000 else '🦈 Whale'
        })
    
    return jsonify({'addresses': sample_addresses})

@app.route('/api/krc20-tokens')
def get_krc20_tokens():
    """Get KRC-20 token list - FAST"""
    # Use fallback data (KRC-20 APIs are often unavailable)
    fallback_tokens = [
        {
            'symbol': 'NACHO',
            'name': 'Nacho the Kat',
            'total_supply': 1000000000,
            'holders': 5247
        },
        {
            'symbol': 'KAS20',
            'name': 'Kaspa Token',
            'total_supply': 500000000,
            'holders': 3142
        },
        {
            'symbol': 'KASPIANO',
            'name': 'Kaspiano',
            'total_supply': 100000000,
            'holders': 1823
        },
        {
            'symbol': 'KSPR',
            'name': 'Kasper',
            'total_supply': 750000000,
            'holders': 2456
        }
    ]
    
    try:
        response = requests.get(
            "https://raw.githubusercontent.com/kaspagang/krc20-token-list/main/tokens.json",
            timeout=2
        )
        
        if response.status_code == 200:
            tokens = response.json()
            return jsonify({'tokens': tokens})
    except:
        pass
    
    return jsonify({'tokens': fallback_tokens})

@app.route('/api/blockdag')
def get_blockdag_data():
    """Get BlockDAG visualization data - FAST"""
    try:
        response = requests.get(f"{KASPA_API}/info/blockdag", timeout=2)
        dag_data = response.json()
        
        blocks_response = requests.get(
            f"{KASPA_API}/blocks",
            params={'limit': 20},
            timeout=2
        )
        
        blocks = blocks_response.json() if blocks_response.status_code == 200 else []
        
        return jsonify({
            'tip_height': dag_data.get('tipHeight', 42583921),
            'blocks': blocks[:20],
            'blue_score': dag_data.get('blueScore', 42583920)
        })
    except:
        return jsonify({
            'tip_height': 42583921,
            'blocks': [{'hash': f'block_{i}'} for i in range(20)],
            'blue_score': 42583920
        })

@app.route('/api/network-health')
def get_network_health():
    """Get network health metrics - FAST"""
    try:
        network_resp = requests.get(f"{KASPA_API}/info/network", timeout=2)
        network_data = network_resp.json()
        
        mempool_size = network_data.get('mempoolSize', 150)
        block_rate = network_data.get('blockRate', 1.0)
        
        mempool_health = min(100, max(0, 100 - (mempool_size / 1000)))
        bps_health = min(100, (block_rate / 1.0) * 100)
        
        overall_health = (mempool_health + bps_health) / 2
        
        if overall_health >= 90:
            status = 'Excellent'
        elif overall_health >= 70:
            status = 'Good'
        else:
            status = 'Fair'
        
        return jsonify({
            'overall_score': round(overall_health, 1),
            'status': status,
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
            }
        })
    except:
        return jsonify({
            'overall_score': 95.0,
            'status': 'Excellent',
            'metrics': {
                'mempool_health': {
                    'score': 98.5,
                    'description': 'Transaction queue efficiency',
                    'value': 150
                },
                'block_rate_health': {
                    'score': 92.0,
                    'description': 'Block production rate',
                    'value': 1.0
                }
            }
        })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
