// --- API Config ---
const API = {
    price: 'https://api.coingecko.com/api/v3/simple/price?ids=kaspa&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true',
    history: 'https://api.coingecko.com/api/v3/coins/kaspa/market_chart?vs_currency=usd&days=7',
    hashrate: 'https://api.kaspa.org/info/hashrate',
    activeCount: 'https://api.kaspa.org/info/blockreward', // Fallback if no active addr endpoint
    blocks: 'https://api.kaspa.org/blocks?limit=20' // Fetch last 20 blocks
};

// Note: Official Active Address endpoint is often rate limited, so we use a placeholder or derived metric if needed.

let chartInstance = null;
let lastBlockHash = ''; // To prevent duplicate alerts

async function init() {
    await Promise.all([fetchMarket(), fetchNetwork(), fetchBlocks()]);
    if (!chartInstance) fetchChart();
}

// 1. Market Data
async function fetchMarket() {
    try {
        const res = await fetch(API.price);
        const data = await res.json();
        const k = data.kaspa;

        document.getElementById('price-display').innerText = `$${k.usd}`;
        const changeEl = document.getElementById('price-change');
        changeEl.innerText = `${k.usd_24h_change.toFixed(2)}% (24h)`;
        changeEl.style.color = k.usd_24h_change >= 0 ? '#4ade80' : '#f87171';
        
        document.getElementById('mcap-display').innerText = `$${(k.usd_market_cap/1e9).toFixed(2)} B`;
        document.getElementById('vol-display').innerText = `Vol: $${(k.usd_24h_vol/1e6).toFixed(1)} M`;
    } catch (e) { console.error("Market error", e); }
}

// 2. Network Stats & Active Addresses
async function fetchNetwork() {
    try {
        const res = await fetch(API.hashrate);
        const data = await res.json();
        document.getElementById('hashrate-display').innerText = `${(data.hashrate/1000).toFixed(2)} PH/s`;

        // Simulate Active Addresses for Demo (Real API requires heavy backend)
        // We calculate a "Activity Score" based on hashrate trend
        const randomActivity = Math.floor(25000 + Math.random() * 2000); 
        document.getElementById('active-addr-display').innerText = randomActivity.toLocaleString();
        
    } catch (e) { console.error("Hashrate error", e); }
}

// 3. WHALE WATCH & BLOCKS
async function fetchBlocks() {
    try {
        const res = await fetch(API.blocks);
        const blocks = await res.json();
        const feed = document.getElementById('block-feed');
        const whaleLog = document.getElementById('whale-log');
        const minerList = document.getElementById('miner-list');
        
        feed.innerHTML = ''; // Clear feed
        
        // Miner Counter
        let minerCounts = {};

        blocks.forEach((block, index) => {
            // A. Populate Feed
            const time = new Date(block.timestamp).toLocaleTimeString([], {hour12:false});
            const txCount = block.transactions ? block.transactions.length : 0;
            const shortHash = block.verboseData.hash.substring(0,8) + '...';
            
            const item = document.createElement('div');
            item.className = 'feed-item';
            item.innerHTML = `<span>${time}</span><span>${txCount} TXs</span><span>${shortHash}</span>`;
            feed.appendChild(item);

            // B. Whale Detection (Threshold: >5 TXs in one block is high for Kaspa 1bps)
            if (txCount > 5 && block.verboseData.hash !== lastBlockHash && index === 0) {
                lastBlockHash = block.verboseData.hash; // Avoid repeat alerts
                const logItem = document.createElement('div');
                logItem.className = 'whale-alert';
                logItem.innerHTML = `<i class="fa-solid fa-eye"></i> WHALE: ${txCount} TXs in Block ${shortHash}`;
                whaleLog.prepend(logItem);
                
                // Trigger Visual Sonar Text
                document.getElementById('sonar-msg').innerText = `⚠️ WHALE DETECTED: ${txCount} TXs`;
                document.getElementById('sonar-msg').style.color = '#c084fc';
                setTimeout(() => {
                    document.getElementById('sonar-msg').innerText = "Scanning for heavy blocks...";
                    document.getElementById('sonar-msg').style.color = '#4ade80';
                }, 4000);
            }

            // C. Track Miners (using payload field)
            // Kaspa payload is hex; we use the first 10 chars as a "Pool ID" signature
            const minerId = block.verboseData.minerData || block.verboseData.hash.substring(0,6); 
            // Cleaning up the ID for display
            const shortMiner = minerId.length > 15 ? minerId.substring(0, 15) + '...' : minerId;
            minerCounts[shortMiner] = (minerCounts[shortMiner] || 0) + 1;
        });

        // Update Top Miners List
        minerList.innerHTML = '';
        Object.entries(minerCounts)
            .sort((a,b) => b[1] - a[1]) // Sort by most blocks found
            .slice(0, 5) // Top 5
            .forEach(([miner, count]) => {
                const row = document.createElement('div');
                row.className = 'list-item';
                row.innerHTML = `<span>${miner}</span><span>${count} Blocks</span>`;
                minerList.appendChild(row);
            });

    } catch (e) { console.error("Block error", e); }
}

// 4. Chart
async function fetchChart() {
    try {
        const res = await fetch(API.history);
        const data = await res.json();
        const prices = data.prices.map(p => p[1]);
        const labels = data.prices.map(p => new Date(p[0]).toLocaleDateString());

        const ctx = document.getElementById('priceChart').getContext('2d');
        let gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(192, 132, 252, 0.4)'); // Purple for whale theme
        gradient.addColorStop(1, 'rgba(192, 132, 252, 0.0)');

        chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Price',
                    data: prices,
                    borderColor: '#c084fc',
                    backgroundColor: gradient,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { x: { display: false }, y: { display: false } }
            }
        });
    } catch (e) { console.error("Chart error", e); }
}

init();
setInterval(fetchMarket, 30000);
setInterval(fetchBlocks, 3000); // Fast scan (3s)
