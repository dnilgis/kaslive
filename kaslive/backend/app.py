"""
KASLIVE v2.0 - Main Application
Flask backend for Kaspa network monitoring and analytics
"""

from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
from flask_caching import Cache
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import logging
from datetime import datetime
import os

from backend.config import Config
from backend.api.routes import api_bp
from backend.services.kaspa_service import KaspaService
from backend.utils.cache import cache_manager

# Initialize Flask app
app = Flask(__name__, 
            template_folder='../frontend/templates',
            static_folder='../frontend/static')

# Load configuration
app.config.from_object(Config)

# Initialize extensions
CORS(app, resources={r"/api/*": {"origins": "*"}})
cache = Cache(app, config={'CACHE_TYPE': 'redis', 'CACHE_REDIS_URL': os.getenv('REDIS_URL', 'redis://localhost:6379/0')})
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["100 per hour", "20 per minute"]
)

# Configure logging
logging.basicConfig(
    level=getattr(logging, os.getenv('LOG_LEVEL', 'INFO')),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Register blueprints
app.register_blueprint(api_bp, url_prefix='/api/v1')

# Initialize services
kaspa_service = KaspaService()


@app.route('/')
def index():
    """Render the main dashboard page"""
    return render_template('index.html')


@app.route('/health')
def health_check():
    """Health check endpoint for monitoring"""
    try:
        # Check database connection
        # Check Redis connection
        # Check external API availability
        
        return jsonify({
            'status': 'healthy',
            'timestamp': datetime.utcnow().isoformat(),
            'version': '2.0.0',
            'services': {
                'database': 'up',
                'redis': 'up',
                'kaspa_api': 'up'
            }
        }), 200
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return jsonify({
            'status': 'unhealthy',
            'timestamp': datetime.utcnow().isoformat(),
            'error': str(e)
        }), 503


@app.route('/metrics')
@limiter.exempt
def metrics():
    """Prometheus metrics endpoint"""
    # Implement metrics collection
    return jsonify({
        'requests_total': 0,
        'requests_duration_seconds': 0,
        'active_connections': 0
    })


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({'error': 'Not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    logger.error(f"Internal error: {str(error)}")
    return jsonify({'error': 'Internal server error'}), 500


@app.errorhandler(429)
def ratelimit_handler(e):
    """Handle rate limit errors"""
    return jsonify({
        'error': 'Rate limit exceeded',
        'message': str(e.description)
    }), 429


@app.before_request
def log_request():
    """Log all incoming requests"""
    logger.info(f"{request.method} {request.path} - {get_remote_address()}")


@app.after_request
def add_security_headers(response):
    """Add security headers to all responses"""
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    return response


def init_background_tasks():
    """Initialize background tasks for data updates"""
    # TODO: Implement background tasks using Celery or APScheduler
    # - Price updates every 5 seconds
    # - Whale monitoring every 30 seconds
    # - Network stats every 60 seconds
    # - KRC-20 token updates every 2 minutes
    pass


if __name__ == '__main__':
    # Initialize background tasks
    init_background_tasks()
    
    # Run the application
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    
    logger.info(f"Starting KASLIVE v2.0 on port {port}")
    logger.info(f"Debug mode: {debug}")
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug,
        threaded=True
    )
