# KasLive: Kaspa Network Intelligence Terminal (v22)

![Status](https://img.shields.io/badge/status-live-green) ![Kaspa](https://img.shields.io/badge/network-Kaspa-teal) ![Version](https://img.shields.io/badge/version-v22-red)

**KasLive** is a professional-grade, zero-dependency dashboard for monitoring the Kaspa network in real-time.

## 🔴 Live at [kaslive.com](https://kaslive.com)

## Features

### Market Intelligence
- **Live Price** — Real-time KAS/USD with 24h change, volume, and market cap
- **Hard Money Correlation** — KAS vs Gold (PAXG), Bitcoin, and Ethereum with strength indicators
- **KAS/BTC & KAS/ETH Ratios** — True 24h pair performance tracking
- **Performance Chart** — KAS vs BTC vs ETH relative performance (30D / 1Y / ALL)
- **Hashrate Chart** — 1-year network hashrate history

### Live BlockDAG Visualizer
- **Real-time Canvas animation** — Blocks fall through parallel lanes with DAG edge connections
- **BPS-driven** — Block spawn rate tied to actual network Blocks Per Second
- **DAG Width visualization** — Lane count reflects measured parallelism
- **Toggle on/off** — Lightweight; can be disabled to save resources
- *Inspired by [Macmachi/kaspa-network-visualizer](https://github.com/Macmachi/kaspa-network-visualizer) (MIT)*

### Network Analytics
- **Supernova Index (DEFCON)** — Algorithmic composite score from price momentum, hashrate growth, whale accumulation, and volume intensity
- **Shield Integrity** — Current hashrate vs all-time-high with 51% attack cost estimation
- **DAG Width** — Real-time BlockDAG parallelism measurement
- **DAA Velocity** — Difficulty Adjustment Algorithm throughput
- **Network Density** — BPS utilization percentage
- **Emission Rate** — Live KAS minted per second

### Whale Tracking
- **36 Tracked Wallets** — Exchange hot wallets, dev funds, mining pools, and unknown whales
- **Live Balance Scanning** — Staggered polling with change detection
- **Click-to-Copy** — Click any address to copy to clipboard

### Mining Tools
- **Yield Engine** — Mining calculator with difficulty simulation slider
- **kHeavyHash Lab** — Interactive demo of Kaspa's PoW algorithm (Keccak₂₅₆ → Matrix×Vector → Keccak₂₅₆)
- **Hash Yield Index** — USD per Petahash per Day
- **Sompi per GH/s** — Mining reward density metric

### Additional Features
- **Live Block Feed** — Real-time block production with explorer links
- **KRC-20 Token Status** — Minting progress from Kasplex API
- **News Ticker** — CryptoPanic news feed with auto-scroll
- **Audio Mode** — Geiger counter block sounds and whale alerts
- **War Room** — Fullscreen immersive mode
- **Konami Code** — ↑↑↓↓←→←→BA for GhostDAG debug mode
- **Idle Commander** — 60-second screensaver with key panel dimming

## Data Sources

| Source | API | Data |
|--------|-----|------|
| Kaspa Network | `api.kaspa.org` | Blocks, hashrate, DAG, supply, balances |
| CoinGecko | `api.coingecko.com` | Market prices, charts, ATH |
| Kasplex | `api.kasplex.org` | KRC-20 token minting status |
| CryptoPanic | `cryptopanic.com` | News feed |

## Installation

```bash
git clone https://github.com/yourusername/kaslive.git
cd kaslive
# Open index.html in any browser — no build step required
open index.html
```

**No Node.js, no npm, no server required.** Pure HTML/CSS/JS.

## File Structure

```
├── index.html    # Dashboard layout
├── style.css     # All styles
├── app.js        # Core logic and API integrations
├── CNAME         # GitHub Pages custom domain
└── README.md     # This file
```

## Contact

Built by **dnilgis** — [dnilgis@gmail.com](mailto:dnilgis@gmail.com)
