import json
import logging
import sys
import os

# --- Path fix for deployment environment (Ensures imports work) ---
# This makes sure the parent directory is included for package resolution (e.g., 'backend.config')
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
# ------------------------------------------

# Local imports
# Note: These services contain their own internal path fixes as well for robustness.
from backend.services.kaspa_service import KaspaService
from backend.services.price_service import PriceService
from backend.services.whale_service import WhaleService
from backend.services.krc20_service import KRC20Service

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Global Service Instantiation (Done once per cold start)
kaspa_service = KaspaService()
price_service = PriceService()
whale_service = WhaleService()
krc20_service = KRC20Service()

# --- Common API Gateway Handler ---
def handler(event, context=None):
    """
    Main entry point for AWS Lambda or similar Serverless functions.
    Routes requests based on path and method.
    """
    
    # Simple routing based on the API path
    path = event.get('path', '/')
    method = event.get('httpMethod', 'GET')
    
    # Extract query parameters for GET requests
    query_params = event.get('queryStringParameters') or {}
    
    # Function to dispatch the request
    def dispatch_request(path, method, query_params, body):
        if method == 'GET':
            if path == '/api/v1/price':
                data = price_service.get_current_price()
                if data: return api_response(data)
            
            elif path == '/api/v1/network/stats':
                data = kaspa_service.get_network_stats()
                if data: return api_response(data)

            elif path == '/api/v1/price/history':
                timeframe = query_params.get('timeframe', '1D')
                data = price_service.get_price_history(timeframe)
                if data: return api_response({'timeframe': timeframe, 'prices': data})

            elif path == '/api/v1/whales/top':
                limit = int(query_params.get('limit', 10))
                data = whale_service.get_top_whales(limit)
                return api_response({'whales': data, 'count': len(data)})
            
            elif path == '/api/v1/network/health':
                data = kaspa_service.calculate_network_health()
                if data: return api_response(data)

            elif path == '/api/v1/blockdag/metrics':
                data = kaspa_service.get_blockdag_metrics()
                if data: return api_response(data)
                
            elif path == '/api/v1/krc20/tokens':
                data = krc20_service.get_token_list()
                return api_response({'tokens': data, 'count': len(data)})
            
            # Note: Comparison and nodes are integrated into existing calls or simplified for Serverless.

        if method == 'POST':
            if path == '/api/v1/mining/calculate':
                try:
                    body_data = json.loads(body)
                    hashrate = float(body_data.get('hashrate'))
                    electricity_cost = float(body_data.get('electricity_cost'))
                    
                    data = kaspa_service.calculate_mining_profitability(hashrate, electricity_cost)
                    if data: return api_response(data)
                except Exception as e:
                    logger.error(f"Mining calculation failed: {e}")
                    return error_response('Invalid input parameters or calculation failed.', 400)
        
        return error_response('Resource not found or unsupported method', 404)

    # Decode body if present and handle base64 encoding if needed by API Gateway
    body = event.get('body')
    if event.get('isBase64Encoded') and body:
        import base64
        body = base64.b64decode(body).decode('utf-8')

    try:
        response = dispatch_request(path, method, query_params, body)
    except Exception as e:
        logger.error(f"Internal execution error: {e}", exc_info=True)
        response = error_response('Internal Server Error in handler execution.', 500)
        
    return response

# --- Helper Functions for API Gateway Format ---
def api_response(data, status=200):
    """Formats a successful response for API Gateway/Lambda Proxy."""
    return {
        'statusCode': status,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*', # CORS for static frontend
        },
        'body': json.dumps({'success': True, 'data': data})
    }

def error_response(message, status=503):
    """Formats an error response for API Gateway/Lambda Proxy."""
    return {
        'statusCode': status,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        },
        'body': json.dumps({'success': False, 'error': message})
    }
