# KASLIVE v2.0 - API Documentation

Base URL: `https://api.kaslive.com/api/v1`

## Authentication

Most public endpoints don't require authentication. Premium endpoints require an API key.

### API Key Authentication

Include your API key in the request header:

```
Authorization: Bearer YOUR_API_KEY
```

## Rate Limiting

- Public endpoints: 60 requests per minute
- Authenticated endpoints: 300 requests per minute

Rate limit headers are included in all responses:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Time when the limit resets (Unix timestamp)

## Response Format

All responses follow this structure:

```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2024-12-12T10:30:00Z"
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## Endpoints

### Price Data

#### Get Current Price

```http
GET /price
```

**Response:**
```json
{
  "success": true,
  "data": {
    "price": 0.0478,
    "change_24h": -0.54,
    "volume_24h": 28240000,
    "market_cap": 1280000000,
    "high_24h": 0.0492,
    "low_24h": 0.0465,
    "ath": 0.1842,
    "ath_date": "2023-11-21",
    "timestamp": "2024-12-12T10:30:00Z"
  }
}
```

#### Get Price History

```http
GET /price/history?timeframe=1D&limit=100
```

**Parameters:**
- `timeframe` (string): One of `1H`, `4H`, `1D`, `1W`, `1M`, `ALL`
- `limit` (integer): Number of data points (max: 1000)

**Response:**
```json
{
  "success": true,
  "data": {
    "timeframe": "1D",
    "prices": [
      {
        "timestamp": 1702310400000,
        "price": 0.0478,
        "volume": 1250000
      }
    ]
  }
}
```

### Network Data

#### Get Network Statistics

```http
GET /network/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "blocks_per_second": 1.0,
    "hashrate": 945000000000000,
    "hashrate_formatted": "945 PH/s",
    "supply": 27100000000,
    "supply_formatted": "27.1B KAS",
    "nodes": 620,
    "transactions_per_minute": 3200,
    "orphan_rate": 0.05,
    "block_count": 4500000,
    "timestamp": "2024-12-12T10:30:00Z"
  }
}
```

#### Get Network Health

```http
GET /network/health
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overall_score": 90,
    "decentralization": "EXCELLENT",
    "security": "EXCELLENT",
    "speed": "EXCELLENT",
    "stability": "GOOD",
    "timestamp": "2024-12-12T10:30:00Z"
  }
}
```

### Whale Tracking

#### Get Top Whales

```http
GET /whales/top?limit=10
```

**Parameters:**
- `limit` (integer): Number of whales to return (max: 100)

**Response:**
```json
{
  "success": true,
  "data": {
    "whales": [
      {
        "rank": 1,
        "address": "kaspa:qz3fa7b2c...",
        "label": "Dev Fund",
        "balance": 1250000000,
        "balance_formatted": "1.25B KAS",
        "percentage_of_supply": 4.61,
        "last_transaction": "2024-12-12T10:28:00Z",
        "transaction_count": 1247
      }
    ],
    "count": 10
  }
}
```

#### Get Whale Alerts

```http
GET /whales/alerts?limit=10
```

**Parameters:**
- `limit` (integer): Number of alerts (max: 50)

**Response:**
```json
{
  "success": true,
  "data": {
    "alerts": [
      {
        "id": "alert_1",
        "type": "🐋 LARGE TRANSFER",
        "amount": 5200000,
        "amount_formatted": "5.2M KAS",
        "from_address": "kaspa:qx3...",
        "from_label": "Dev Fund",
        "to_address": "kaspa:qy7...",
        "to_label": "Exchange",
        "timestamp": "2024-12-12T10:30:00Z",
        "time_ago": "Just now",
        "tx_hash": "0x123...",
        "usd_value": 248560
      }
    ],
    "count": 10
  }
}
```

### Wallet Operations

#### Get Wallet Data

```http
GET /wallet/{address}
```

**Parameters:**
- `address` (string): Kaspa wallet address (kaspa:...)

**Response:**
```json
{
  "success": true,
  "data": {
    "address": "kaspa:qz3fa7b2c...",
    "balance": 125000.50,
    "balance_usd": 5975.02,
    "transaction_count": 1247,
    "last_transaction": "2024-12-12T08:30:00Z",
    "received": 1500000.00,
    "sent": 1375000.00,
    "timestamp": "2024-12-12T10:30:00Z"
  }
}
```

### KRC-20 Tokens

#### Get All Tokens

```http
GET /krc20/tokens
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tokens": [
      {
        "symbol": "NACHO",
        "name": "Nacho the Kat",
        "tvl": 4460000,
        "tvl_formatted": "$4.46M",
        "volume_24h": 115400,
        "volume_24h_formatted": "$115.4K",
        "change_24h": -4.70,
        "liquidity_providers": 2100,
        "holders": 8500,
        "price": 0.0245,
        "momentum": "🔥",
        "verified": true
      }
    ],
    "count": 8
  }
}
```

#### Get Token Details

```http
GET /krc20/token/{symbol}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "symbol": "NACHO",
    "name": "Nacho the Kat",
    "price": 0.0245,
    "tvl": 4460000,
    "volume_24h": 115400,
    "change_24h": -4.70,
    "holders": 8500,
    "price_history": [...],
    "top_holders": [...],
    "recent_transactions": [...]
  }
}
```

### BlockDAG

#### Get BlockDAG Metrics

```http
GET /blockdag/metrics
```

**Response:**
```json
{
  "success": true,
  "data": {
    "block_count": 4500000,
    "blocks_per_second": 1.0,
    "dag_tips": 3,
    "tip_hash": "0x4f7a2b3c...",
    "average_confirmation_time": 3.2,
    "pending_transactions": 1452,
    "orphan_blocks": 245,
    "orphan_rate": 0.05,
    "timestamp": "2024-12-12T10:30:00Z"
  }
}
```

### Mining

#### Calculate Mining Profitability

```http
POST /mining/calculate
```

**Request Body:**
```json
{
  "hashrate": 100,
  "power": 3000,
  "electricity_cost": 0.12
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "kas_per_day": 142.50,
    "daily_revenue": 6.81,
    "daily_electricity_cost": 8.64,
    "daily_profit": -1.83,
    "monthly_profit": -54.90,
    "yearly_profit": -667.95,
    "roi_days": 0,
    "timestamp": "2024-12-12T10:30:00Z"
  }
}
```

### Transactions

#### Get Recent Transactions

```http
GET /transactions/recent?limit=20
```

**Parameters:**
- `limit` (integer): Number of transactions (max: 100)

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "hash": "0x123...",
        "from": "kaspa:qq...",
        "to": "kaspa:qz...",
        "amount": 1250.75,
        "type": "send",
        "timestamp": "2024-12-12T10:30:00Z",
        "confirmations": 10
      }
    ],
    "count": 20
  }
}
```

## WebSocket API

For real-time updates, connect to our WebSocket endpoint:

```
wss://api.kaslive.com/ws
```

### Subscribe to Price Updates

```json
{
  "action": "subscribe",
  "channel": "price"
}
```

### Subscribe to Whale Alerts

```json
{
  "action": "subscribe",
  "channel": "whale_alerts"
}
```

### Subscribe to Transactions

```json
{
  "action": "subscribe",
  "channel": "transactions"
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `INVALID_REQUEST` | Invalid request format |
| `INVALID_ADDRESS` | Invalid Kaspa address |
| `NOT_FOUND` | Resource not found |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `UNAUTHORIZED` | Invalid or missing API key |
| `INTERNAL_ERROR` | Server error |

## Examples

### Python

```python
import requests

# Get current price
response = requests.get('https://api.kaslive.com/api/v1/price')
data = response.json()
print(f"KAS Price: ${data['data']['price']}")

# Get top whales
response = requests.get('https://api.kaslive.com/api/v1/whales/top?limit=5')
whales = response.json()['data']['whales']
for whale in whales:
    print(f"{whale['rank']}. {whale['label']}: {whale['balance_formatted']}")
```

### JavaScript

```javascript
// Get current price
fetch('https://api.kaslive.com/api/v1/price')
  .then(response => response.json())
  .then(data => {
    console.log(`KAS Price: $${data.data.price}`);
  });

// Get wallet balance
const address = 'kaspa:qz3fa7b2c...';
fetch(`https://api.kaslive.com/api/v1/wallet/${address}`)
  .then(response => response.json())
  .then(data => {
    console.log(`Balance: ${data.data.balance} KAS`);
  });
```

### cURL

```bash
# Get network stats
curl https://api.kaslive.com/api/v1/network/stats

# Get whale alerts
curl https://api.kaslive.com/api/v1/whales/alerts?limit=10

# Calculate mining profitability
curl -X POST https://api.kaslive.com/api/v1/mining/calculate \
  -H "Content-Type: application/json" \
  -d '{"hashrate":100,"power":3000,"electricity_cost":0.12}'
```

## Support

For API support:
- Email: api@kaslive.com
- GitHub Issues: https://github.com/yourusername/kaslive-v2/issues
- Discord: https://discord.gg/kaslive
