# KASLIVE v2.0 - Deployment Guide

## Prerequisites

- Server with at least 2GB RAM and 2 CPU cores
- Ubuntu 22.04 LTS (or similar Linux distribution)
- Domain name (optional but recommended)
- SSL certificate (optional but recommended for production)

## Quick Deployment with Docker

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose -y

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

### 2. Clone Repository

```bash
git clone https://github.com/yourusername/kaslive-v2.git
cd kaslive-v2
```

### 3. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit with your configuration
nano .env
```

**Important variables to set:**
- `SECRET_KEY` - Generate a secure random key
- `POSTGRES_PASSWORD` - Set a strong database password
- `KASPA_API_URL` - Kaspa API endpoint
- `COINGECKO_API_KEY` - Your CoinGecko API key
- Enable alert systems if needed

### 4. Start Services

```bash
# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f

# Initialize database
docker-compose exec web python scripts/init_db.py --seed
```

### 5. Verify Deployment

```bash
# Check health
curl http://localhost:5000/health

# Check API
curl http://localhost:5000/api/v1/price
```

Access your dashboard at: `http://your-server-ip:5000`

## Production Deployment

### With Nginx Reverse Proxy

1. **Install Nginx:**

```bash
sudo apt install nginx -y
```

2. **Configure Nginx:**

Create `/etc/nginx/sites-available/kaslive`:

```nginx
server {
    listen 80;
    server_name kaslive.com www.kaslive.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static {
        alias /opt/kaslive/frontend/static;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

3. **Enable site:**

```bash
sudo ln -s /etc/nginx/sites-available/kaslive /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

4. **SSL with Let's Encrypt:**

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d kaslive.com -d www.kaslive.com
```

### Environment-specific Configuration

Start with production profile:

```bash
docker-compose --profile production up -d
```

## Platform-Specific Deployments

### AWS EC2

1. **Launch EC2 Instance:**
   - AMI: Ubuntu 22.04 LTS
   - Instance Type: t3.medium (or larger)
   - Security Group: Open ports 22, 80, 443

2. **Deploy:**

```bash
ssh ubuntu@your-ec2-ip
# Follow Quick Deployment steps above
```

### DigitalOcean Droplet

1. **Create Droplet:**
   - OS: Ubuntu 22.04
   - Size: $12/month (2GB RAM)

2. **Deploy:**

```bash
ssh root@your-droplet-ip
# Follow Quick Deployment steps above
```

### Heroku

1. **Install Heroku CLI**

2. **Deploy:**

```bash
heroku create kaslive-v2
heroku addons:create heroku-postgresql:hobby-dev
heroku addons:create heroku-redis:hobby-dev
git push heroku main
heroku run python scripts/init_db.py --seed
```

### Kubernetes

1. **Create cluster:**

```bash
kubectl create namespace kaslive
```

2. **Apply configurations:**

```bash
kubectl apply -f k8s/
```

## Monitoring

### Health Checks

```bash
# Application health
curl http://localhost:5000/health

# Docker container status
docker-compose ps

# View logs
docker-compose logs -f web
docker-compose logs -f celery-worker
```

### Metrics

Access Prometheus metrics:
```bash
curl http://localhost:5000/metrics
```

## Backup

### Database Backup

```bash
# Backup
docker-compose exec postgres pg_dump -U kaslive kaslive > backup_$(date +%Y%m%d).sql

# Restore
docker-compose exec -T postgres psql -U kaslive kaslive < backup_20240101.sql
```

### Full Backup

```bash
# Create backup
tar -czf kaslive_backup_$(date +%Y%m%d).tar.gz \
    .env \
    postgres_data/ \
    redis_data/ \
    logs/

# Restore
tar -xzf kaslive_backup_20240101.tar.gz
```

## Scaling

### Horizontal Scaling

Update `docker-compose.yml`:

```yaml
web:
  deploy:
    replicas: 3
```

### Database Scaling

Use PostgreSQL replication or managed database:
- AWS RDS
- DigitalOcean Managed Databases
- Heroku Postgres

## Troubleshooting

### Port Already in Use

```bash
# Find process
sudo lsof -i :5000

# Kill process
sudo kill -9 <PID>
```

### Database Connection Issues

```bash
# Check database logs
docker-compose logs postgres

# Verify connection
docker-compose exec postgres psql -U kaslive -d kaslive -c "SELECT 1;"
```

### Redis Connection Issues

```bash
# Check Redis
docker-compose exec redis redis-cli ping
```

### High Memory Usage

```bash
# Check memory
free -h

# Restart services
docker-compose restart
```

## Security Checklist

- [ ] Change default `SECRET_KEY`
- [ ] Set strong `POSTGRES_PASSWORD`
- [ ] Enable SSL/HTTPS
- [ ] Configure firewall (ufw/iptables)
- [ ] Enable rate limiting
- [ ] Set up monitoring alerts
- [ ] Regular backups
- [ ] Update dependencies regularly
- [ ] Use environment variables for secrets
- [ ] Enable CORS only for your domain

## Performance Optimization

### Redis Configuration

```bash
# Increase max memory
docker-compose exec redis redis-cli CONFIG SET maxmemory 512mb
docker-compose exec redis redis-cli CONFIG SET maxmemory-policy allkeys-lru
```

### PostgreSQL Tuning

Update `docker-compose.yml`:

```yaml
postgres:
  command: postgres -c shared_buffers=256MB -c max_connections=200
```

### Nginx Caching

Add to nginx config:

```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=kaslive:10m max_size=1g;

location /api/v1/ {
    proxy_cache kaslive;
    proxy_cache_valid 200 5m;
    proxy_pass http://localhost:5000;
}
```

## Maintenance

### Update Application

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose build
docker-compose up -d

# Run migrations if needed
docker-compose exec web python scripts/migrate.py
```

### Clean Up

```bash
# Remove unused Docker resources
docker system prune -a --volumes

# Clear logs
truncate -s 0 logs/*.log
```

## Support

For issues and questions:
- GitHub Issues: https://github.com/yourusername/kaslive-v2/issues
- Email: dnilgis@gmail.com
- Documentation: https://docs.kaslive.com
