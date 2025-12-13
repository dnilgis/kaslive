from flask import Flask, render_template, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import logging
import os

from .config import config
from .api.routes import api_bp
from .models.init import init_db # Import init_db for possible initialization logic

# --- Application Setup ---

# Determine configuration based on environment
config_name = os.getenv('FLASK_ENV', 'default')
app_config = config[config_name]

# Support backend/frontend folder structure
app = Flask(__name__, 
            template_folder='../frontend/templates',
            static_folder='../frontend/static')

# Load configuration
app.config.from_object(app_config)

# Initialize extensions
CORS(app, resources={r"/api/*": {"origins": app.config.get('CORS_ORIGINS')}})

# Initialize Rate Limiter using Redis as storage
limiter = Limiter(
    key_func=get_remote_address,
    app=app,
    storage_uri=app.config['RATELIMIT_STORAGE_URL'],
    strategy=app.config['RATELIMIT_STRATEGY']
)

# Register Blueprints
app.register_blueprint(api_bp, url_prefix='/api/v1')

# Set up logging
logging.basicConfig(level=app.config.get('LOG_LEVEL', 'INFO').upper())
logger = logging.getLogger(__name__)


# --- Routes ---

@app.route('/')
def index():
    """Serves the main application frontend."""
    return render_template('index.html')

@app.route('/health')
def health_check():
    """Simple health check endpoint for monitoring."""
    # Check if a database connection is successful (simple placeholder for now)
    # In a real app, this should check database and cache status
    try:
        import redis
        r = redis.from_url(app.config['REDIS_URL'])
        r.ping()
        db_status = "ok" # Assuming DB is checked externally or via a more complex method
        cache_status = "ok"
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        db_status = "error"
        cache_status = "error"

    return jsonify({
        'status': 'healthy',
        'database': db_status,
        'cache': cache_status,
        'timestamp': datetime.now().isoformat()
    })

# --- Error Handlers (Moved from routes.py to app.py for central handling) ---

@app.errorhandler(400)
def bad_request(error):
    return jsonify({'success': False, 'error': 'Bad Request'}), 400

@app.errorhandler(404)
def not_found(error):
    return jsonify({'success': False, 'error': 'Resource Not Found'}), 404

@app.errorhandler(429)
def rate_limit_exceeded(error):
    return jsonify({'success': False, 'error': 'Rate Limit Exceeded. Try again later.'}), 429

@app.errorhandler(500)
def internal_server_error(error):
    logger.error(f"Internal Server Error: {error}")
    return jsonify({'success': False, 'error': 'Internal Server Error'}), 500


if __name__ == '__main__':
    from datetime import datetime
    # This block is for local development only
    # In production (Gunicorn), the app is loaded directly
    
    # Initialize DB (can be moved to init_db.py script for production)
    # init_db()
    
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
