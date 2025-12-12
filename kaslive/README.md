# KASLIVE v2.0 // Advanced Kaspa Network Intelligence

<div align="center">

![KASLIVE Banner](docs/banner.png)

**Real-time Kaspa blockchain monitoring, whale tracking, and network analytics platform**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.9+](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/downloads/)
[![Docker](https://img.shields.io/badge/docker-ready-brightgreen.svg)](https://www.docker.com/)

[Live Demo](https://kaslive.com) • [Documentation](docs/README.md) • [API Docs](docs/API.md)

</div>

## 🚀 Features

### Core Features
- 📈 **Real-time Price Charts** - Interactive multi-timeframe price tracking
- 🐋 **Whale Sonar** - Track top holders and large transactions
- 🚨 **Whale Alerts** - Real-time notifications for large movements
- 💼 **Portfolio Tracker** - Monitor multiple wallet addresses
- 💚 **Network Health Score** - AI-powered network analysis
- ⛏️ **Mining Calculator** - Profitability estimates with real-time data
- ⚡ **KRC-20 Terminal** - Live token tracking and analytics
- 🌐 **BlockDAG Visualizer** - Real-time block creation visualization

### Premium Features 💎
- Custom whale alert thresholds
- Unlimited portfolio tracking
- Historical data exports
- API access
- Email/SMS/Telegram notifications
- Advanced analytics dashboard

## 📋 Prerequisites

- Python 3.9+
- Node.js 16+ (optional, for frontend build tools)
- Docker & Docker Compose (recommended)
- PostgreSQL 13+ (or use Docker)
- Redis (for caching)

## 🛠️ Quick Start

### Using Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/kaslive-v2.git
cd kaslive-v2

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
nano .env

# Start with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f
```

Access the application at `http://localhost:5000`

### Manual Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/kaslive-v2.git
cd kaslive-v2

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
nano .env

# Initialize database
python scripts/init_db.py

# Run the application
python backend/app.py
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Application
FLASK_ENV=production
SECRET_KEY=your-secret-key-here
PORT=5000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/kaslive
REDIS_URL=redis://localhost:6379/0

# Kaspa API
KASPA_API_URL=https://api.kaspa.org
KASPA_EXPLORER_API=https://explorer.kaspa.org/api

# Price Data
COINGECKO_API_KEY=your-api-key
EXCHANGE_API_KEYS={"mexc": "key", "kucoin": "key"}

# Features
ENABLE_WHALE_ALERTS=true
WHALE_THRESHOLD=1000000
ENABLE_EMAIL_ALERTS=true
ENABLE_SMS_ALERTS=false

# Email (SendGrid)
SENDGRID_API_KEY=your-sendgrid-key
FROM_EMAIL=alerts@kaslive.com

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
TWILIO_PHONE_NUMBER=+1234567890

# Telegram
TELEGRAM_BOT_TOKEN=your-bot-token

# Monitoring
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=INFO
```

## 📁 Project Structure

```
kaslive-v2/
├── frontend/                   # Frontend assets
│   ├── static/
│   │   ├── css/               # Stylesheets
│   │   ├── js/                # JavaScript files
│   │   └── img/               # Images
│   └── templates/             # HTML templates
│       └── index.html
├── backend/                   # Python backend
│   ├── api/                   # API endpoints
│   │   ├── __init__.py
│   │   ├── routes.py
│   │   ├── whales.py
│   │   ├── portfolio.py
│   │   └── krc20.py
│   ├── models/                # Database models
│   │   ├── __init__.py
│   │   ├── wallet.py
│   │   └── alert.py
│   ├── services/              # Business logic
│   │   ├── __init__.py
│   │   ├── kaspa_service.py
│   │   ├── price_service.py
│   │   ├── whale_service.py
│   │   └── alert_service.py
│   ├── utils/                 # Utilities
│   │   ├── __init__.py
│   │   ├── cache.py
│   │   └── helpers.py
│   ├── app.py                 # Application entry point
│   └── config.py              # Configuration
├── config/                    # Configuration files
│   ├── nginx.conf
│   └── gunicorn.conf.py
├── scripts/                   # Utility scripts
│   ├── init_db.py
│   ├── migrate.py
│   └── seed_data.py
├── tests/                     # Test files
│   ├── test_api.py
│   └── test_services.py
├── .github/
│   └── workflows/
│       ├── ci.yml             # CI/CD pipeline
│       └── deploy.yml
├── docs/                      # Documentation
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── CONTRIBUTING.md
├── .env.example               # Example environment file
├── .gitignore
├── docker-compose.yml         # Docker Compose config
├── Dockerfile                 # Docker image
├── requirements.txt           # Python dependencies
├── README.md
└── LICENSE
```

## 🔌 API Documentation

### Public Endpoints

```bash
# Get current KAS price
GET /api/v1/price

# Get network stats
GET /api/v1/network/stats

# Get top whales
GET /api/v1/whales/top?limit=10

# Get KRC-20 tokens
GET /api/v1/krc20/tokens

# Get wallet balance
GET /api/v1/wallet/{address}

# Get BlockDAG metrics
GET /api/v1/blockdag/metrics
```

### Premium Endpoints (Requires API Key)

```bash
# Create whale alert
POST /api/v1/alerts/whale

# Track portfolio
POST /api/v1/portfolio/track

# Get historical data
GET /api/v1/history/price?from=timestamp&to=timestamp
```

See [API Documentation](docs/API.md) for complete details.

## 🧪 Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=backend tests/

# Run specific test
pytest tests/test_api.py -v
```

## 🚢 Deployment

### Docker Deployment

```bash
# Build image
docker build -t kaslive-v2:latest .

# Run container
docker run -d -p 5000:5000 --env-file .env kaslive-v2:latest
```

### Production Deployment (AWS/DigitalOcean/Heroku)

See [Deployment Guide](docs/DEPLOYMENT.md) for platform-specific instructions.

### Kubernetes

```bash
# Apply Kubernetes configs
kubectl apply -f k8s/
```

## 📊 Monitoring

- **Application Logs**: Check `logs/` directory
- **Health Check**: `GET /health`
- **Metrics**: `GET /metrics` (Prometheus format)
- **Sentry**: Error tracking and monitoring

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](docs/CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Kaspa Network for the amazing blockchain
- CoinGecko for price data
- Chart.js for beautiful charts
- The Kaspa community

## 📧 Contact

**dnilgis** - [dnilgis@gmail.com](mailto:dnilgis@gmail.com)

Project Link: [https://github.com/yourusername/kaslive-v2](https://github.com/yourusername/kaslive-v2)

---

<div align="center">
Built with 💙 for Kaspa Believers
</div>
