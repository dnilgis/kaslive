/* ==========================================
   KASLIVE V13.0 - CORE LOGIC
   ========================================== */

/* --- API ENDPOINTS --- */
const API = {
    kaspa: {
        base: 'https://api.kaspa.org',
        blocks: 'https://api.kaspa.org/blocks?limit=10&includeTransactions=false',
        info: 'https://api.kaspa.org/info/virtual-selected-parent-blue-score',
        hashrateHistory: 'https://api.kaspa.org/info/hashrate/history',
        balance: (addr) => `https://api.kaspa.org/addresses/${addr}/balance`
    },
    coingecko: 'https://api.coingecko.com/api/v3',
    kasplex: 'https://api.kasplex.org/v1/krc20/tokenlist'
};

/* --- STATE --- */
const state = {
    whaleData: [],
    currentKasPrice: 0,
    language: 'EN'
};

/* --- TOP WALLETS (Hardcoded for stability, Balances fetched Live) --- */
const REAL_ADDRS = [
    { address: 'kaspa:qpzpfwcsqsxhxwup26r55fd0ghqlhyugz8cp6y3wxuddc02vcxtjg75pspnwz', tag: {name: 'MEXC', type:'tag-exchange'} },
    { address: 'kaspa:qpz2vgvlxhmyhmt22h538pjzmvvd52nuut80y5zulgpvyerlskvvwm7n4uk5a', tag: {name: 'Entity X', type:'tag-whale'} },
    { address: 'kaspa:qrelgny7sr3vahq69yykxx36m65gvmhryxrlwngfzgu8xkdslum2yxjp3ap8m', tag: {name: 'Gate.io', type:'tag-exchange'} },
    { address: 'kaspa:qrvum29vk365g0zcd5gx3c7h829etfq2ytdmscjzw4zw04fjfnprcg9c3tges', tag: {name: 'Bybit', type:'tag-exchange'} },
    { address: 'kaspa:qqywx2wszmnrsu0mzgav85rdwvzangfpdj9j3ady9jpr7hu4u8c2wl9wqgd6j', tag: {name: 'Bitget', type:'tag-exchange'} },
    { address: 'kaspa:qzadxjufntvckxrvy76pyhvtkuu8lg5ryz252aglmhlyv27pxqplksshzuu9m', tag: {name: 'KuCoin', type:'tag-exchange'} },
    { address: 'kaspa:qzxrs8gxjgk2q84wlt3xfd057ntws73fptalhy84g85zqfu5lcemvpu04vj3w', tag: {name: 'Uphold', type:'tag-exchange'} },
    { address: 'kaspa:qpj2x2qfmvj4g6fn0xadv6hafdaqv4fwd3t4uvyw3walwfn50rzysa4lafpma', tag: {name: 'Kraken', type:'tag-exchange'} },
    { address: 'kaspa:qq2ka745yyj0760fkt3ax3t7hpyqret6pzaypag3afnd3fp8jpv4cmzpx8yrt', tag: {name: 'Whale', type:'tag-whale'} },
    { address: 'kaspa:ppk66xua7nmq8elv3eglfet0xxcfuks835xdgsm5jlymjhazyu6h5ac62l4ey', tag: {name: 'Dev Fund', type:'tag-dev'} }
];

/* --- INITIALIZATION --- */
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 KasLive Initializing...');
    
    // 1. Start Systems
    initLedger();
    fetchMarketData();
    initKRC20();
    initCharts();
    startLiveBlocks();
    
    // 2. Set Intervals
    setInterval(fetchMarketData, 30000); // 30s Market
    setInterval(startLiveBlocks, 5000);  // 5s Blocks
    setInterval(scanRandomWallet, 3000); // Ledger Scanner
});

/* ==========================================
   MARKET DATA & RATIOS
   ========================================== */
async function fetchMarketData() {
    try {
        const ids = 'bitcoin,ethereum,kaspa,pax-gold,kinesis-silver';
        const url = `${API.coingecko}/coins/markets?vs_currency=usd&ids=${ids}`;
        const res = await fetch(url);
        const data = await res.json();
        
        if (!data || data.length < 3) return;

        const kas = data.find(c => c.id === 'kaspa');
        const btc = data.find(c => c.id === 'bitcoin');
        const eth = data.find(c => c.id === 'ethereum');
        const gold = data.find(c => c.id === 'pax-gold');
        const silver = data.find(c => c.id === 'kinesis-silver');

        state.currentKasPrice = kas.current_price;

        // Header Updates
        const pChange = kas.price_change_percentage_24h;
        const color = pChange >= 0 ? 'var(--hex-green)' : 'var(--hex-alert)';
        document.getElementById('mainPrice').innerHTML = 
            `$${kas.current_price.toFixed(4)} <span style="font-size:1rem; color:${color}">${pChange.toFixed(2)}%</span>`;
        
        document.getElementById('athDisplay').innerText = `ATH: $${kas.ath.toFixed(4)}`;
        document.getElementById('mcapChange').innerHTML = 
            `MCAP: <span style="color:${kas.market_cap_change_percentage_24h >= 0 ? 'var(--hex-green)':'var(--hex-alert)'}">${kas.market_cap_change_percentage_24h.toFixed(2)}% (24h)</span>`;

        // Update Ratios
        updateRatios(kas, btc, eth);
        
        // Commodities
        if(gold) document.getElementById('goldPrice').innerText = '$' + gold.current_price.toLocaleString();
        if(silver) document.getElementById('silverPrice').innerText = '$' + silver.current_price.toFixed(2);
        
        // Base Prices
        document.getElementById('btcPrice').innerText = '$' + btc.current_price.toLocaleString();
        document.getElementById('ethPrice').innerText = '$' + eth.current_price.toLocaleString();

    } catch (e) { console.error("Market fetch error", e); }
}

function updateRatios(kas, btc, eth) {
    const getOldPrice = (cur, pct) => cur / (1 + (pct / 100));
    
    const kasOld = getOldPrice(kas.current_price, kas.price_change_percentage_24h);
    const btcOld = getOldPrice(btc.current_price, btc.price_change_percentage_24h);
    const ethOld = getOldPrice(eth.current_price, eth.price_change_percentage_24h);

    // BTC Ratio
    const curSats = (kas.current_price / btc.current_price) * 1e8;
    const oldSats = (kasOld / btcOld) * 1e8;
    const satsChange = ((curSats - oldSats) / oldSats) * 100;
    
    document.getElementById('ratioBtcVal').innerHTML = 
        `${Math.floor(curSats)} sats <span style="font-size:0.7em; color:${satsChange>=0?'#ccff00':'#ff3333'}">(${satsChange>0?'+':''}${satsChange.toFixed(2)}%)</span>`;
    
    document.getElementById('ratioBtc').style.width = Math.min((curSats / 200) * 100, 100) + '%';
    
    // ETH Ratio
    const curGwei = (kas.current_price / eth.current_price) * 1e9;
    const oldGwei = (kasOld / ethOld) * 1e9;
    const gweiChange = ((curGwei - oldGwei) / oldGwei) * 100;

    document.getElementById('ratioEthVal').innerHTML = 
        `${Math.floor(curGwei).toLocaleString()} gwei <span style="font-size:0.7em; color:${gweiChange>=0?'#ccff00':'#ff3333'}">(${gweiChange>0?'+':''}${gweiChange.toFixed(2)}%)</span>`;
    
    document.getElementById('ratioEth').style.width = Math.min((curGwei / 60000) * 100, 100) + '%';
}

/* ==========================================
   CHARTS (Chart.js)
   ========================================== */
async function initCharts() {
    // 1. Hashrate Chart
    try {
        const res = await fetch(`${API.kaspa.hashrateHistory}?range=1y`);
        const data = await res.json();
        
        const labels = [];
        const values = [];
        data.forEach((p, i) => {
            if(i % 3 === 0) {
                labels.push(new Date(p.timestamp * 1000).toLocaleDateString());
                values.push(p.hashrate / 1000); // TH to PH
            }
        });

        const ctxH = document.getElementById('hashrateChart').getContext('2d');
        const grad = ctxH.createLinearGradient(0,0,0,200);
        grad.addColorStop(0, 'rgba(0,255,65,0.4)');
        grad.addColorStop(1, 'rgba(0,255,65,0)');

        new Chart(ctxH, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    data: values, borderColor:'#00ff41', backgroundColor: grad, 
                    fill:true, pointRadius:0, tension:0.4
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: {display:false} },
                scales: {
                    x: { display:false },
                    y: { grid: {color:'#111'}, ticks: {color:'#666'} }
                }
            }
        });
    } catch(e) { console.log("Hashrate chart failed"); }

    // 2. Performance Chart
    try {
        const ids = ['kaspa', 'bitcoin', 'ethereum', 'backed-cspx-core-s-p-500'];
        const colors = ['#00ff41', '#f7931a', '#627eea', '#fff'];
        
        const promises = ids.map(id => 
            fetch(`${API.coingecko}/coins/${id}/market_chart?vs_currency=usd&days=365`).then(r=>r.json())
        );
        const results = await Promise.all(promises);
        
        const datasets = results.map((res, i) => {
            if(!res.prices || !res.prices.length) return null;
            const start = res.prices[0][1];
            return {
                label: ids[i].toUpperCase(),
                data: res.prices.filter((_,x)=>x%5===0).map(p => ({x: p[0], y: ((p[1]-start)/start)*100})),
                borderColor: colors[i], borderWidth: i===0?2:1, pointRadius:0,
                borderDash: i===0 ? [] : [4,4]
            };
        }).filter(d=>d);

        const ctxP = document.getElementById('perfChart').getContext('2d');
        new Chart(ctxP, {
            type: 'line',
            data: { datasets },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: {labels:{color:'#888', boxWidth:10}} },
                scales: {
                    x: { type:'time', time:{unit:'month'}, grid:{display:false}, ticks:{color:'#444'} },
                    y: { type:'logarithmic', grid:{color:'#222'}, ticks:{color:'#666', callback:v=>v+'%'} }
                }
            }
        });
    } catch(e) { console.log("Perf chart failed"); }
}

/* ==========================================
   LEDGER SYSTEM
   ========================================== */
function initLedger() {
    state.whaleData = REAL_ADDRS.map((w, i) => ({
        ...w, rank: i+1, balance: 0, status: '...'
    }));
    renderTable();
    
    // Initial Fetch
    state.whaleData.forEach((w, i) => {
        setTimeout(() => fetchBalance(i), i * 200);
    });
}

async function fetchBalance(index) {
    const wallet = state.whaleData[index];
    try {
        const res = await fetch(API.kaspa.balance(wallet.address));
        const data = await res.json();
        if(data && data.balance) {
            state.whaleData[index].balance = Math.floor(data.balance / 1e8);
            state.whaleData[index].status = 'Synced';
            state.whaleData[index].percent = ((state.whaleData[index].balance / 28700000000)*100).toFixed(4);
            updateRow(index);
        }
    } catch(e) { console.log("Bal fetch fail"); }
}

function scanRandomWallet() {
    const i = Math.floor(Math.random() * state.whaleData.length);
    const row = document.querySelector(`#whaleTable tbody tr:nth-child(${i+1})`);
    if(row) {
        row.classList.add('scanning');
        setTimeout(() => row.classList.remove('scanning'), 500);
        fetchBalance(i);
    }
}

function renderTable() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';
    state.whaleData.forEach(w => {
        const tr = document.createElement('tr');
        const short = w.address.substr(0,10) + '...' + w.address.substr(-8);
        tr.innerHTML = `
            <td>${w.rank}</td>
            <td style="font-family:monospace"><a href="https://explorer.kaspa.org/addresses/${w.address}" target="_blank" style="color:inherit; text-decoration:none">${short}</a></td>
            <td><span class="tag-pill ${w.tag.type}">${w.tag.name}</span></td>
            <td class="mono-num">${w.balance.toLocaleString()}</td>
            <td style="color:var(--hex-cyan)">${w.status}</td>
            <td class="mono-num" style="text-align:right">${w.percent || 0}%</td>
        `;
        tbody.appendChild(tr);
    });
}

function updateRow(i) {
    const row = document.querySelector(`#whaleTable tbody tr:nth-child(${i+1})`);
    if(row) {
        const w = state.whaleData[i];
        row.cells[3].innerText = w.balance.toLocaleString();
        row.cells[3].style.color = '#fff';
        setTimeout(()=>row.cells[3].style.color='#ccc', 500);
        row.cells[5].innerText = w.percent + '%';
    }
}

/* ==========================================
   BLOCKS & KRC20
   ========================================== */
async function startLiveBlocks() {
    try {
        const res = await fetch(API.kaspa.blocks);
        const data = await res.json();
        const tape = document.getElementById('sonarTape');
        tape.innerHTML = '';
        data.forEach(b => {
            const time = new Date(parseInt(b.timestamp)).toLocaleTimeString();
            tape.innerHTML += `
                <div class="sonar-entry" onclick="window.open('https://explorer.kaspa.org/blocks/${b.hash}')">
                    <div>
                        <div style="font-weight:bold; color:var(--hex-purple)">BLOCK #${b.blueScore}</div>
                        <div style="font-size:0.6rem; opacity:0.7">DAA: ${b.daaScore}</div>
                    </div>
                    <div style="text-align:right; font-size:0.8rem">
                        <div>${time}</div>
                        <div style="opacity:0.5">${b.pruningPoint?'PRUNING':'VALID'}</div>
                    </div>
                </div>`;
        });
    } catch(e) {}
}

async function initKRC20() {
    try {
        const res = await fetch(API.kasplex);
        const data = await res.json();
        const list = document.getElementById('krcList');
        list.innerHTML = '';
        data.result.slice(0, 20).forEach(t => {
            const pct = (t.minted / t.max * 100).toFixed(1);
            list.innerHTML += `
                <div class="token-card">
                    <div style="font-weight:bold">${t.tick}</div>
                    <div style="text-align:right; color:#aaa; font-family:monospace">${pct}%</div>
                    <div style="text-align:right; color:${pct>=100?'var(--hex-blue)':'var(--hex-warn)'}">
                        ${pct>=100?'TRADING':'MINTING'}
                    </div>
                </div>`;
        });
    } catch(e) { document.getElementById('krcList').innerText = "KRC API OFFLINE"; }
}

/* UTILS */
window.cycleLanguage = () => { alert("Coming in v14"); };
