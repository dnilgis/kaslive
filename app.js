/* ==========================================
   KASLIVE V15.0 - CORE LOGIC
   ========================================== */

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

const state = {
    whaleData: [],
    currentKasPrice: 0
};

// COMPREHENSIVE HARDCODED RICH LIST (Known Entities & Whales)
const REAL_ADDRS = [
    { address: 'kaspa:precqv0krj3r6uyyfa36ga7s0u9jct0v4wg8ctsfde2gkrsgwgw8jgxfzfc98', tag: {name: 'DEV FUND', type:'tag-dev'} },
    { address: 'kaspa:qpzpfwcsqsxhxwup26r55fd0ghqlhyugz8cp6y3wxuddc02vcxtjg75pspnwz', tag: {name: 'MEXC', type:'tag-exchange'} },
    { address: 'kaspa:qpz2vgvlxhmyhmt22h538pjzmvvd52nuut80y5zulgpvyerlskvvwm7n4uk5a', tag: {name: 'Whale 1', type:'tag-whale'} },
    { address: 'kaspa:qrelgny7sr3vahq69yykxx36m65gvmhryxrlwngfzgu8xkdslum2yxjp3ap8m', tag: {name: 'Gate.io', type:'tag-exchange'} },
    { address: 'kaspa:qrvum29vk365g0zcd5gx3c7h829etfq2ytdmscjzw4zw04fjfnprcg9c3tges', tag: {name: 'Bybit', type:'tag-exchange'} },
    { address: 'kaspa:qzadxjufntvckxrvy76pyhvtkuu8lg5ryz252aglmhlyv27pxqplksshzuu9m', tag: {name: 'KuCoin', type:'tag-exchange'} },
    { address: 'kaspa:qzxrs8gxjgk2q84wlt3xfd057ntws73fptalhy84g85zqfu5lcemvpu04vj3w', tag: {name: 'Uphold', type:'tag-exchange'} },
    { address: 'kaspa:qpj2x2qfmvj4g6fn0xadv6hafdaqv4fwd3t4uvyw3walwfn50rzysa4lafpma', tag: {name: 'Kraken', type:'tag-exchange'} },
    { address: 'kaspa:qq2ka745yyj0760fkt3ax3t7hpyqret6pzaypag3afnd3fp8jpv4cmzpx8yrt', tag: {name: 'Whale 2', type:'tag-whale'} },
    { address: 'kaspa:qqfxn597v5c23td4asz99ky52sha8l2ypq8kmrsqxcu7skhdunncjgup0hdys', tag: null },
    { address: 'kaspa:qzpt2wp67seprjndmrzu58g4sgkknxp0y5g97y5leupj7ugffqhs6xgxdjwtf', tag: null },
    { address: 'kaspa:qr8k05f9n6xtrd0eex5lr6878mc5n7dgrtn8xv3frfvuxgfchx9077jtz5tsk', tag: null },
    { address: 'kaspa:qpap72xed702y4ahw537l3x63788nrh3ea5a0y06we236d5rth43wptqsv0ws', tag: null },
    { address: 'kaspa:qz06rpdaap56ktn3xf3w70g09s9dphrkmnks027lnshyqd6x5l8tzt8lcpp4k', tag: null },
    { address: 'kaspa:qqywx2wszmnrsu0mzgav85rdwvzangfpdj9j3ady9jpr7hu4u8c2wl9wqgd6j', tag: {name: 'Bitget', type:'tag-exchange'} },
    { address: 'kaspa:ppwn9mz7ht2p8w8mqtafvuw0sslqff7svk0e5j5vterutxwd3gmygnqdrppm5', tag: {name: 'Ice River', type:'tag-mining'} },
    { address: 'kaspa:qr9fqcxp9xjprsm9sv7apy6qc0ja2p676m9gf9fkcww2qmaw4npxzllh7lrw0', tag: {name: 'Kraken 2', type:'tag-exchange'} },
    { address: 'kaspa:qq2hke25nvxsnnawzlym3nf6y38clrhdefph5xckeuyyzxwh99kavfu77grmg', tag: null },
    { address: 'kaspa:qpky2f87j7my5ph5taucutm74tfssz8l97m770rqdtnmzmece7r9gf3l2hpze', tag: null },
    { address: 'kaspa:qq6kjumc6l95hq005yz2gazrqev3pyfjvqefxef93wz6u2makfhmsrct65f6', tag: null },
    { address: 'kaspa:qrtxzw8j3ydwna6spm7etj7x36dzj06h7q84hxn6ueapphfg8txazcycmnalc', tag: null },
    { address: 'kaspa:qzew5mu908h4gfw7qgvpux7hlkfqrjz06zazag8nmrykjz59479uqlm8n9q9q', tag: null },
    { address: 'kaspa:qqn98feqplp4nc92wgq7j7cy6cdnaugnzngeatps7swaxkw0s9e0c7rjjdrxf', tag: null },
    { address: 'kaspa:qp2sp0vvrwu4s8pw0j68muu2ta5qar5mehf8ehuvljw5zsrakk5cvx4gvqz7z', tag: null },
    { address: 'kaspa:qpu0zrz92y5m4s0vf8ml0tqrhc85l943t9efghexqd4rt09cfynjzw5rmfdws', tag: null },
    { address: 'kaspa:ppk66xua7nmq8elv3eglfet0xxcfuks835xdgsm5jlymjhazyu6h5ac62l4ey', tag: {name: 'DAGKnight', type:'tag-dev'} },
    { address: 'kaspa:qzganetmrpwv88ea0pkma0xvgacw034l6jv9e9kvh0mup47ahqpc24la7yfmf', tag: null },
    { address: 'kaspa:pqtm55d2a456qws90g096cxnecc7msjmxr8n2ernwues8zfdamkl2kfmxr8gr', tag: {name: 'Rust Fund', type:'tag-dev'} },
    { address: 'kaspa:qrepacgj2flpflt8f7luh3ru4sykgt8d5k7s0sh4zlflk3glqpwjvq9kx7smk', tag: null },
    { address: 'kaspa:qpxg04pk29q9pf6uzakcxugdl3td6xkx875p24wkr3hjjgkh9gsp2p5m3akay', tag: null },
    { address: 'kaspa:qrjjnrk9vd9je8wnlqq9dz7fhmhurgjjed8n2pnzh5jwgjmef5pvzd4vf0lu7', tag: null },
    { address: 'kaspa:qypnwqfqltw6p8j8x7hj3w962l8a4ha5admykfs7z30fc07vydftmng942wwmmw', tag: null },
    { address: 'kaspa:qpkf9c9t2vhu7dt037rkmutyjcgg29hlwq25xnxgln6x5uq6ajtnucslxlk9a', tag: null },
    { address: 'kaspa:qyppcdqxpu3sw49k6xcj8wcqjd98lpvpc8cm30wfnj003ahlhjzkh0s67gjxuv', tag: null },
    { address: 'kaspa:qyp3ffdjvv6de6cg6jjgyhlg3mt3fngna2vzukdpzvwkaj5j3hctsyqecqf7dh3', tag: {name: 'MARA Pool', type:'tag-mining'} },
    { address: 'kaspa:qr7vrlhgekw9efxgfq09ca3wqcxlslgxndcpk77pguu2usaa9aa27lhuunewj', tag: {name: 'Uphold 2', type:'tag-exchange'} }
];

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 KasLive Initializing...');
    
    // Init Systems
    initLedger();
    fetchMarketData();
    initKRC20();
    initCharts();
    startLiveBlocks();
    
    // Polling Intervals
    setInterval(fetchMarketData, 30000); 
    setInterval(startLiveBlocks, 5000);  
    setInterval(scanRandomWallet, 3000); 
});

/* --- MARKET & RATIOS --- */
async function fetchMarketData() {
    try {
        const ids = 'bitcoin,ethereum,kaspa,pax-gold,kinesis-silver';
        const url = `${API.coingecko}/coins/markets?vs_currency=usd&ids=${ids}`;
        const res = await fetch(url);
        const data = await res.json();
        
        if (!data || !Array.isArray(data) || data.length < 3) return;

        const kas = data.find(c => c.id === 'kaspa');
        const btc = data.find(c => c.id === 'bitcoin');
        const eth = data.find(c => c.id === 'ethereum');
        const gold = data.find(c => c.id === 'pax-gold');
        const silver = data.find(c => c.id === 'kinesis-silver');

        if(kas) {
            state.currentKasPrice = kas.current_price;
            const pChange = kas.price_change_percentage_24h;
            const color = pChange >= 0 ? 'var(--hex-green)' : 'var(--hex-alert)';
            
            document.getElementById('mainPrice').innerHTML = 
                `$${kas.current_price.toFixed(4)} <span style="font-size:0.6em; color:${color}">${pChange.toFixed(2)}%</span>`;
            
            document.getElementById('athDisplay').innerText = `ATH: $${kas.ath.toFixed(4)}`;
            
            // Safety check for MCAP
            const mcapChange = kas.market_cap_change_percentage_24h || 0;
            document.getElementById('mcapChange').innerHTML = 
                `MCAP: <span style="color:${mcapChange >= 0 ? 'var(--hex-green)':'var(--hex-alert)'}">${mcapChange.toFixed(2)}%</span>`;
        
            if(btc && eth) updateRatios(kas, btc, eth);
        }

        if(gold) document.getElementById('goldPrice').innerText = '$' + gold.current_price.toLocaleString();
        if(silver) document.getElementById('silverPrice').innerText = '$' + silver.current_price.toFixed(2);
        
        if(btc) document.getElementById('btcPrice').innerText = '$' + btc.current_price.toLocaleString();
        if(eth) document.getElementById('ethPrice').innerText = '$' + eth.current_price.toLocaleString();

    } catch (e) { console.error("Market fetch error", e); }
}

function updateRatios(kas, btc, eth) {
    const getOld = (cur, pct) => cur / (1 + (pct / 100));
    
    // BTC Calculation
    const curSats = (kas.current_price / btc.current_price) * 1e8;
    const oldSats = (getOld(kas.current_price, kas.price_change_percentage_24h) / getOld(btc.current_price, btc.price_change_percentage_24h)) * 1e8;
    const satsChange = ((curSats - oldSats) / oldSats) * 100;
    
    const btcEl = document.getElementById('ratioBtcVal');
    if(btcEl) btcEl.innerHTML = `${Math.floor(curSats)} sats <span style="font-size:0.8em; color:${satsChange>=0?'#ccff00':'#ff3333'}">(${satsChange>0?'+':''}${satsChange.toFixed(2)}%)</span>`;
    document.getElementById('ratioBtc').style.width = Math.min((curSats / 200) * 100, 100) + '%';
    
    // ETH Calculation
    const curGwei = (kas.current_price / eth.current_price) * 1e9;
    const oldGwei = (getOld(kas.current_price, kas.price_change_percentage_24h) / getOld(eth.current_price, eth.price_change_percentage_24h)) * 1e9;
    const gweiChange = ((curGwei - oldGwei) / oldGwei) * 100;

    const ethEl = document.getElementById('ratioEthVal');
    if(ethEl) ethEl.innerHTML = `${Math.floor(curGwei).toLocaleString()} gwei <span style="font-size:0.8em; color:${gweiChange>=0?'#ccff00':'#ff3333'}">(${gweiChange>0?'+':''}${gweiChange.toFixed(2)}%)</span>`;
    document.getElementById('ratioEth').style.width = Math.min((curGwei / 60000) * 100, 100) + '%';
}

/* --- CHARTS --- */
async function initCharts() {
    // 1. Hashrate Chart
    try {
        const res = await fetch(`${API.kaspa.hashrateHistory}?range=1y`);
        if(res.ok) {
            const data = await res.json();
            const labels = [];
            const values = [];
            data.forEach((p, i) => {
                if(i % 3 === 0) {
                    labels.push(new Date(p.timestamp * 1000).toLocaleDateString());
                    values.push(p.hashrate / 1000); // PH/s
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
                        label: 'Hashrate (PH/s)',
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
        }
    } catch(e) { console.log("Hashrate chart unavailable"); }

    // 2. Performance Chart
    try {
        const ids = ['kaspa', 'bitcoin', 'ethereum', 'backed-cspx-core-s-p-500'];
        const colors = ['#00ff41', '#f7931a', '#627eea', '#ffffff'];
        const labels = ['KAS', 'BTC', 'ETH', 'S&P'];
        
        const promises = ids.map(id => 
            fetch(`${API.coingecko}/coins/${id}/market_chart?vs_currency=usd&days=365`)
            .then(r => r.ok ? r.json() : null)
        );
        const results = await Promise.all(promises);
        
        const datasets = results.map((res, i) => {
            if(!res || !res.prices || !res.prices.length) return null;
            const start = res.prices[0][1];
            return {
                label: labels[i],
                data: res.prices.filter((_,x)=>x%7===0).map(p => ({x: p[0], y: ((p[1]-start)/start)*100})),
                borderColor: colors[i], borderWidth: i===0?3:1, pointRadius:0,
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
    } catch(e) { console.log("Perf chart unavailable"); }
}

/* --- LEDGER --- */
function initLedger() {
    state.whaleData = REAL_ADDRS.map((w, i) => ({ ...w, rank: i+1, balance: 0, status: '...' }));
    renderTable();
    // Update count
    document.getElementById('totalTracked').innerText = `TRACKING ${REAL_ADDRS.length} WALLETS`;
    // Staggered fetch
    state.whaleData.forEach((w, i) => {
        setTimeout(() => fetchBalance(i), i * 300);
    });
}

async function fetchBalance(index) {
    const wallet = state.whaleData[index];
    try {
        const res = await fetch(API.kaspa.balance(wallet.address));
        const data = await res.json();
        if(data && data.balance) {
            state.whaleData[index].balance = Math.floor(data.balance / 1e8);
            state.whaleData[index].status = 'Active';
            state.whaleData[index].percent = ((state.whaleData[index].balance / 28700000000)*100).toFixed(4);
            updateRow(index);
        }
    } catch(e) {}
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
        const short = w.address.substr(0,8) + '...' + w.address.substr(-6);
        const tag = w.tag ? `<span class="tag-pill ${w.tag.type}">${w.tag.name}</span>` : `<span style="opacity:0.2">-</span>`;
        
        tr.innerHTML = `
            <td>${w.rank}</td>
            <td style="font-family:monospace"><a href="https://explorer.kaspa.org/addresses/${w.address}" target="_blank" style="color:inherit; text-decoration:none">${short}</a></td>
            <td>${tag}</td>
            <td class="mono-num">${w.balance.toLocaleString()}</td>
            <td class="hide-mobile" style="color:var(--hex-cyan)">${w.status}</td>
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
        if(row.cells[4]) row.cells[4].innerText = w.status;
    }
}

/* --- FEED & BLOCKS --- */
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
                    <div style="text-align:right; font-size:0.7rem">
                        <div>${time}</div>
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
        if(data && data.result) {
            data.result.slice(0, 20).forEach(t => {
                const pct = (t.minted / t.max * 100).toFixed(1);
                list.innerHTML += `
                    <div class="token-card">
                        <div style="font-weight:bold">${t.tick}</div>
                        <div style="text-align:right; color:#aaa; font-family:monospace">${pct}%</div>
                        <div style="text-align:right; color:${pct>=100?'var(--hex-blue)':'var(--hex-warn)'}">
                            ${pct>=100?'DONE':'MINT'}
                        </div>
                    </div>`;
            });
        }
    } catch(e) { document.getElementById('krcList').innerText = "KRC API OFFLINE"; }
}
