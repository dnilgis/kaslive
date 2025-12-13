const API = {
    price: 'https://api.coingecko.com/api/v3/simple/price?ids=kaspa&vs_currencies=usd&include_24hr_change=true',
    history: 'https://api.coingecko.com/api/v3/coins/kaspa/market_chart?vs_currency=usd&days=7',
    hashrate: 'https://api.kaspa.org/info/hashrate',
    blocks: 'https://api.kaspa.org/blocks?limit=20'
};

// --- VAN GOGH FLUID ENGINE ---
const canvas = document.getElementById('art-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
let hue = 0;

function initArt() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    for(let i=0; i<100; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: Math.random() * 2 - 1,
            vy: Math.random() * 2 - 1,
            size: Math.random() * 3 + 1
        });
    }
    animateArt();
}

function animateArt() {
    // Fading trail effect (Van Gogh Swirls)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    hue += 0.5;
    ctx.fillStyle = `hsl(${hue % 360}, 70%, 50%)`; // Dynamic Color

    particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        
        // Fluid noise movement
        p.vx += (Math.random() - 0.5) * 0.2;
        p.vy += (Math.random() - 0.5) * 0.2;

        // Bounce
        if(p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if(p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
    requestAnimationFrame(animateArt);
}

// --- DATA ENGINE ---
let lastHash = '';

async function updateData() {
    // 1. Price (Ye Style: Big Numbers)
    try {
        const r = await fetch(API.price);
        const d = await r.json();
        document.getElementById('price-display').innerText = `$${d.kaspa.usd}`;
        document.getElementById('price-change').innerText = `${d.kaspa.usd_24h_change.toFixed(2)}%`;
    } catch(e) {}

    // 2. Hashrate
    try {
        const h = await fetch(API.hashrate);
        const d = await h.json();
        document.getElementById('hashrate-display').innerText = `${(d.hashrate/1000).toFixed(2)} PH/S`;
    } catch(e) {}

    // 3. Blocks & Ticker
    try {
        const b = await fetch(API.blocks);
        const blocks = await b.json();
        const latest = blocks[0];
        
        // Heartbeat
        if(latest.verboseData.hash !== lastHash) {
            lastHash = latest.verboseData.hash;
            document.getElementById('last-hash').innerText = `LATEST HASH: ${lastHash.substring(0,20)}...`;
            
            // Add to Ticker Tape
            const ticker = document.getElementById('miner-ticker');
            const minerHex = latest.verboseData.minerData || "";
            let miner = "UNKNOWN_MINER";
            try { miner = hexToText(minerHex); } catch(e){}
            if(miner.length < 2) miner = "ANONYMOUS";
            
            ticker.innerHTML += ` // BLOCK FOUND BY [${miner}] // ${latest.transactions.length} TXS `;
        }
        
        // TPS Calc
        let totalTx = 0;
        blocks.forEach(b => totalTx += b.transactions.length);
        document.getElementById('tps-display').innerText = (totalTx / 20).toFixed(2);
        
    } catch(e) {}
}

function hexToText(hex) {
    let str = '';
    for (let i = 0; i < hex.length; i += 2) str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str.replace(/[^\x20-\x7E]/g, '');
}

// --- CHART ---
async function initChart() {
    const ctx = document.getElementById('priceChart').getContext('2d');
    const r = await fetch(API.history);
    const d = await r.json();
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: d.prices.map(x=>''),
            datasets: [{
                data: d.prices.map(x=>x[1]),
                borderColor: '#ffffff',
                borderWidth: 1,
                pointRadius: 0,
                tension: 0
            }]
        },
        options: { 
            responsive: true, maintainAspectRatio: false,
            scales: { x:{display:false}, y:{display:false} },
            plugins: { legend: {display:false} }
        }
    });
}

initArt();
initChart();
setInterval(updateData, 3000);
updateData();
