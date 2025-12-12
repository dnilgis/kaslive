#!/bin/bash
# KASLIVE v2.0 - Quick Start Script

set -e

echo "=========================================="
echo "  KASLIVE v2.0 - Quick Start"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✅ .env file created. Please edit it with your configuration.${NC}"
    echo ""
    read -p "Do you want to edit .env now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        ${EDITOR:-nano} .env
    fi
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    echo "Please install Docker first: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed${NC}"
    echo "Please install Docker Compose first: https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${GREEN}✅ Docker and Docker Compose are installed${NC}"
echo ""

# Create necessary directories
echo "Creating directories..."
mkdir -p logs
mkdir -p ssl

# Build and start containers
echo ""
echo "Building Docker containers..."
docker-compose build

echo ""
echo "Starting services..."
docker-compose up -d

echo ""
echo "Waiting for services to be ready..."
sleep 10

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo -e "${GREEN}✅ Services are running${NC}"
else
    echo -e "${RED}❌ Services failed to start${NC}"
    echo "Check logs with: docker-compose logs"
    exit 1
fi

# Initialize database
echo ""
echo "Initializing database..."
docker-compose exec -T web python scripts/init_db.py --seed

# Health check
echo ""
echo "Running health check..."
sleep 5

HEALTH=$(curl -s http://localhost:5000/health | grep -o '"status":"healthy"' || echo "")
if [ -n "$HEALTH" ]; then
    echo -e "${GREEN}✅ Application is healthy${NC}"
else
    echo -e "${YELLOW}⚠️  Application might not be fully ready yet${NC}"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}🚀 KASLIVE v2.0 is ready!${NC}"
echo "=========================================="
echo ""
echo "Access the dashboard at: http://localhost:5000"
echo ""
echo "Useful commands:"
echo "  View logs:        docker-compose logs -f"
echo "  Stop services:    docker-compose down"
echo "  Restart:          docker-compose restart"
echo "  Check status:     docker-compose ps"
echo ""
echo "For more information, see: docs/DEPLOYMENT.md"
echo ""
