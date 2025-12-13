const API = {
    price: 'https://api.coingecko.com/api/v3/simple/price?ids=kaspa&vs_currencies=usd&include_24hr_change=true',
    history: 'https://api.coingecko.com/api/v3/coins/kaspa/market_chart?vs_currency=usd&days=7',
    hashrate: 'https://api.kaspa.org/info/hashrate',
    blocks: 'https://api.kaspa.org/blocks?limit=50' // Get 50 to have good stats
};

let lastBlockHash = '';
let chartInstance = null;

// --- 1. HEX DECODER (Fixes the "Unknown Miner" issue) ---
function hexToText(hex) {
    try {
        let str = '';
        for (let i = 0; i < hex.length; i += 2) {
            str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
        }
        // Filter out weird characters if decode fails or yields garbage
        return str.replace(/[^\x20-\x7E]/g, '') || 'Unknown Miner';
    } catch (e) { return 'Unknown Miner'; }
}

async function init() {
    initParticles(); // Start the visual background
    await updateDashboard();
    setInterval(updateDashboard, 3000); // Fast update cycle (3s)
}

async function updateDashboard() {
    // A. FETCH PRICE
    try {
        const pRes = await fetch(API.price);
        const pData = await pRes.json();
        const price = pData.kaspa.usd;
        document.getElementById('price-display').innerText = `$${price.toFixed(4)}`;
        
        const change = pData.kaspa.usd_24h_change;
        const cEl = document.getElementById('price-change');
        cEl.innerText = `${change.toFixed(2)}%`;
        cEl.style.color = change >= 0 ? '#00ff9d' : '#ff0055';
    } catch(e) {}

    // B. FETCH HASHRATE
    try {
        const hRes = await fetch(API.hashrate);
        const hData = await hRes.json();
        document.getElementById('hashrate-display').innerText = `${(hData.hashrate/1000).toFixed(2)} PH/s`;
    } catch(e) {}

    // C. FETCH BLOCKS & INTELLIGENCE
    try {
        const bRes = await fetch(API.blocks);
        const blocks = await bRes.json();
        
        // 1. Check for New Block (Heartbeat)
        const latest = blocks[0];
        if (latest.verboseData.hash !== lastBlockHash) {
            lastBlockHash = latest.verboseData.hash;
            triggerHeartbeat(); // FLASH SCREEN
            analyzeBlock(latest); // Check for whales
        }

        // 2. Calculate TPS (Transactions Per Second)
        // Sum TXs from last 50 blocks / 50 seconds (approx)
        let totalTx = 0;
        let minerMap = {};
        
        blocks.forEach(block => {
            // Count TX
            totalTx += block.transactions ? block.transactions.length : 0;

            // Parse Miner (Hex Decode)
            // Kaspa puts miner info in 'extraData' or 'minerData' usually in Hex
            let minerName = "Unknown Pool";
            if (block.verboseData.isChainBlock) {
                 // Try to decode payload if available, else use hash fragment
                 // Note: Public API structure varies, this is a robust fallback:
                 const rawPayload = block.verboseData.minerData || "";
                 const decoded = hexToText(rawPayload);
                 if (decoded.length > 2) minerName = decoded;
                 else minerName = "Pool-" + block.verboseData.hash.substring(0, 6);
            }
            minerMap[minerName] = (minerMap[minerName] || 0) + 1;
        });

        const tps = totalTx / blocks.length; // Avg per block (1 block = 1 sec approx)
        document.getElementById('tps-display').innerText = tps.toFixed(2);

        // 3. Update Miner List
        const minerList = document.getElementById('miner-list');
        minerList.innerHTML = '';
        Object.entries(minerMap)
            .sort((a,b) => b[1] - a[1])
            .slice(0, 10)
            .forEach(([name, count]) => {
                const div = document.createElement('div');
                div.className = 'list-item';
                div.innerHTML = `<span>${name}</span> <span>${count}</span>`;
                minerList.appendChild(div);
            });

    } catch(e) { console.log(e); }

    if(!chartInstance) loadChart();
}

// --- VISUAL FX ---
function triggerHeartbeat() {
    const flash = document.getElementById('flash-overlay');
    flash.style.opacity = '1';
    setTimeout(() => { flash.style.opacity = '0'; }, 300);
}

function analyzeBlock(block) {
    const txCount = block.transactions ? block.transactions.length : 0;
    const log = document.getElementById('whale-log');
    
    // Create Log Entry
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    const time = new Date(block.timestamp).toLocaleTimeString([], {hour12:false});
    
    if (txCount > 5) { // WHALE THRESHOLD
        entry.innerHTML = `<span class="log-alert">[ALERT]</span> ${time} :: Heavy Block Detected :: ${txCount} TXs`;
        document.getElementById('sonar-msg').innerText = `ANOMALY: ${txCount} TXs`;
        document.getElementById('sonar-msg').style.color = '#ff0055';
    } else {
        entry.innerHTML = `[INFO] ${time} :: Block Found :: ${txCount} TXs`;
        document.getElementById('sonar-msg').innerText = "SCANNING...";
        document.getElementById('sonar-msg').style.color = '#00ff9d';
    }
    
    log.prepend(entry);
    if(log.children.length > 20) log.lastChild.remove();
}

// --- CHART ---
async function loadChart() {
    try {
        const r = await fetch(API.history);
        const d = await r.json();
        const prices = d.prices.map(x=>x[1]);
        const ctx = document.getElementById('priceChart').getContext('2d');
        
        // Cyberpunk Gradient
        let grad = ctx.createLinearGradient(0,0,0,300);
        grad.addColorStop(0, 'rgba(0, 255, 157, 0.5)');
        grad.addColorStop(1, 'rgba(0, 255, 157, 0)');

        chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: prices.map(x=>''),
                datasets: [{
                    data: prices,
                    borderColor: '#00ff9d',
                    backgroundColor: grad,
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: {display:false} },
                scales: { x:{display:false}, y:{display:false} }
            }
        });
    } catch(e){}
}

// --- PARTICLES BACKGROUND (The "Alive" Feeling) ---
function initParticles() {
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    let particles = [];
    for(let i=0; i<50; i++) {
        particles.push({
            x: Math.random()*canvas.width,
            y: Math.random()*canvas.height,
            vx: (Math.random()-0.5)*1,
            vy: (Math.random()-0.5)*1,
            size: Math.random()*2
        });
    }

    function animate() {
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle = '#00ff9d';
        ctx.beginPath();
        
        particles.forEach(p => {
            p.x += p.vx; p.y += p.vy;
            if(p.x<0 || p.x>canvas.width) p.vx*=-1;
            if(p.y<0 || p.y>canvas.height) p.vy*=-1;
            
            ctx.moveTo(p.x, p.y);
            ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
        });
        ctx.fill();
        
        // Connect lines
        ctx.strokeStyle = 'rgba(0, 255, 157, 0.1)';
        ctx.beginPath();
        for(let i=0; i<particles.length; i++) {
            for(let j=i; j<particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if(dist < 150) {
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                }
            }
        }
        ctx.stroke();
        requestAnimationFrame(animate);
    }
    animate();
}

init();
