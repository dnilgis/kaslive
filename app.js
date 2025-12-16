/* ==========================================
   KASLIVE - REFACTORED & OPTIMIZED
   ========================================== */

/* --- API ENDPOINTS --- */
const API = {
    // Kaspa Official API
    kaspa: {
        base: 'https://api.kaspa.org',
        blocks: 'https://api.kaspa.org/blocks?limit=10&includeTransactions=false',
        hashrate: 'https://api.kaspa.org/info/hashrate',
        blueScore: 'https://api.kaspa.org/info/virtual-selected-parent-blue-score',
        addressBalance: (addr) => `https://api.kaspa.org/addresses/${addr}/balance`
    },
    // CoinGecko
    coingecko: {
        markets: 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,kaspa,pax-gold,kinesis-silver',
        global: 'https://api.coingecko.com/api/v3/global'
    },
    // Kasplex
    kasplex: {
        tokenList: 'https://api.kasplex.org/v1/krc20/tokenlist'
    },
    // Node count
    nodes: 'https://raw.githubusercontent.com/tmrlvi/kaspa-crawler/master/data/nodes.json'
};

/* --- CONSTANTS --- */
const TOTAL_SUPPLY = 28700000000;
const POLL_INTERVALS = {
    marketData: 20000,      // 20s - CoinGecko updates frequently
    blocks: 10000,          // 10s - Good balance for 10 BPS
    balanceScan: 5000,      // 5s - Check one address every 5s
    krc20: 60000           // 60s - Token list doesn't change often
};

/* --- STATE --- */
const state = {
    whaleData: [],
    krcTokens: [],
    currentKasPrice: 0.0462,
    currentBlueScore: 95000000,
    apiStatus: {
        coingecko: false,
        kaspa: false,
        kasplex: false
    },
    language: 'EN'
};

/* --- DICTIONARY --- */
const DICT = {
    EN: {
        crypto: "CRYPTO RATIOS",
        dominance: "BTC DOMINANCE",
        relStrength: "RELATIVE STRENGTH",
        rwa: "REAL WORLD ASSETS",
        gold: "GOLD",
        silver: "SILVER",
        chain: "CHAIN METRICS",
        netflow: "NET FLOW (24H)",
        heat: "HEAT INDEX",
        hash: "HASHRATE",
        nodes: "NODES",
        ledger: "LEVIATHAN LEDGER",
        krc: "KRC-20 MARKET",
        blocks: "LATEST BLOCKS"
    },
    ES: {
        crypto: "RATIOS CRIPTO",
        dominance: "DOMINIO BTC",
        relStrength: "FUERZA RELATIVA",
        rwa: "ACTIVOS REALES",
        gold: "ORO",
        silver: "PLATA",
        chain: "METRICAS CADENA",
        netflow: "FLUJO NETO",
        heat: "INDICE CALOR",
        hash: "TASA HASH",
        nodes: "NODOS",
        ledger: "LIBRO LEVIATAN",
        krc: "MERCADO KRC-20",
        blocks: "BLOQUES RECIENTES"
    },
    CN: {
        crypto: "加密比率",
        dominance: "比特币占比",
        relStrength: "相对强度",
        rwa: "现实资产",
        gold: "黄金",
        silver: "白银",
        chain: "链上指标",
        netflow: "净流量",
        heat: "热度指数",
        hash: "哈希率",
        nodes: "节点",
        ledger: "巨鲸账本",
        krc: "KRC-20 市场",
        blocks: "最新区块"
    },
    RU: {
        crypto: "КРИПТО КОЭФФ.",
        dominance: "ДОМИНИРОВАНИЕ BTC",
        relStrength: "ОТНОС. СИЛА",
        rwa: "РЕАЛЬНЫЕ АКТИВЫ",
        gold: "ЗОЛОТО",
        silver: "СЕРЕБРО",
        chain: "МЕТРИКИ СЕТИ",
        netflow: "ЧИСТЫЙ ПОТОК",
        heat: "ИНДЕКС ТЕПЛА",
        hash: "ХЕШРЕЙТ",
        nodes: "УЗЛЫ",
        ledger: "КНИГА КИТОВ",
        krc: "РЫНОК KRC-20",
        blocks: "ПОСЛЕДНИЕ БЛОКИ"
    }
};

/* --- WHALE ADDRESSES (TOP 36) --- */
const REAL_ADDRS = [
    { address: 'kaspa:qpz2vgvlxhmyhmt22h538pjzmvvd52nuut80y5zulgpvyerlskvvwm7n4uk5a', balance: 1255116588, tag: {name: 'Entity X', type:'tag-whale'} },
    { address: 'kaspa:qpzpfwcsqsxhxwup26r55fd0ghqlhyugz8cp6y3wxuddc02vcxtjg75pspnwz', balance: 985568863, tag: {name: 'MEXC', type:'tag-exchange'} },
    { address: 'kaspa:qrelgny7sr3vahq69yykxx36m65gvmhryxrlwngfzgu8xkdslum2yxjp3ap8m', balance: 801147068, tag: {name: 'Gate.io', type:'tag-exchange'} },
    { address: 'kaspa:qrvum29vk365g0zcd5gx3c7h829etfq2ytdmscjzw4zw04fjfnprcg9c3tges', balance: 797090765, tag: {name: 'Bybit', type:'tag-exchange'} },
    { address: 'kaspa:qzadxjufntvckxrvy76pyhvtkuu8lg5ryz252aglmhlyv27pxqplksshzuu9m', balance: 736762716, tag: {name: 'KuCoin', type:'tag-exchange'} },
    { address: 'kaspa:qzxrs8gxjgk2q84wlt3xfd057ntws73fptalhy84g85zqfu5lcemvpu04vj3w', balance: 544455877, tag: {name: 'Uphold', type:'tag-exchange'} },
    { address: 'kaspa:qpj2x2qfmvj4g6fn0xadv6hafdaqv4fwd3t4uvyw3walwfn50rzysa4lafpma', balance: 439916881, tag: {name: 'Kraken', type:'tag-exchange'} },
    { address: 'kaspa:qq2ka745yyj0760fkt3ax3t7hpyqret6pzaypag3afnd3fp8jpv4cmzpx8yrt', balance: 362213458, tag: null },
    { address: 'kaspa:qqfxn597v5c23td4asz99ky52sha8l2ypq8kmrsqxcu7skhdunncjgup0hdys', balance: 304244721, tag: null },
    { address: 'kaspa:qzpt2wp67seprjndmrzu58g4sgkknxp0y5g97y5leupj7ugffqhs6xgxdjwtf', balance: 221299845, tag: null },
    { address: 'kaspa:qr8k05f9n6xtrd0eex5lr6878mc5n7dgrtn8xv3frfvuxgfchx9077jtz5tsk', balance: 211500133, tag: null },
    { address: 'kaspa:qpap72xed702y4ahw537l3x63788nrh3ea5a0y06we236d5rth43wptqsv0ws', balance: 200000042, tag: null },
    { address: 'kaspa:qz06rpdaap56ktn3xf3w70g09s9dphrkmnks027lnshyqd6x5l8tzt8lcpp4k', balance: 165000002, tag: null },
    { address: 'kaspa:qqywx2wszmnrsu0mzgav85rdwvzangfpdj9j3ady9jpr7hu4u8c2wl9wqgd6j', balance: 164925044, tag: {name: 'Bitget', type:'tag-exchange'} },
    { address: 'kaspa:ppwn9mz7ht2p8w8mqtafvuw0sslqff7svk0e5j5vterutxwd3gmygnqdrppm5', balance: 141617404, tag: null },
    { address: 'kaspa:qr9fqcxp9xjprsm9sv7apy6qc0ja2p676m9gf9fkcww2qmaw4npxzllh7lrw0', balance: 122932722, tag: {name: 'Kraken', type:'tag-exchange'} },
    { address: 'kaspa:qq2hke25nvxsnnawzlym3nf6y38clrhdefph5xckeuyyzxwh99kavfu77grmg', balance: 118549973, tag: null },
    { address: 'kaspa:qpky2f87j7my5ph5taucutm74tfssz8l97m770rqdtnmzmece7r9gf3l2hpze', balance: 117860092, tag: null },
    { address: 'kaspa:qq6kjumc6l95hq005yz2gazrqev3pyfjvqefxef93wz6u2makfhmsrct65f6', balance: 96150181, tag: null },
    { address: 'kaspa:qr6pqdkru9fgwlm8yyqzp7cww9vj7auuq5vratzy4ev3luzj79t5ycvp8euuf', balance: 87010451, tag: {name: 'Kraken', type:'tag-exchange'} },
    { address: 'kaspa:qrtxzw8j3ydwna6spm7etj7x36dzj06h7q84hxn6ueapphfg8txazcycmnalc', balance: 86885319, tag: null },
    { address: 'kaspa:qzew5mu908h4gfw7qgvpux7hlkfqrjz06zazag8nmrykjz59479uqlm8n9q9q', balance: 83433662, tag: null },
    { address: 'kaspa:qqn98feqplp4nc92wgq7j7cy6cdnaugnzngeatps7swaxkw0s9e0c7rjjdrxf', balance: 78000099, tag: null },
    { address: 'kaspa:qp2sp0vvrwu4s8pw0j68muu2ta5qar5mehf8ehuvljw5zsrakk5cvx4gvqz7z', balance: 78000000, tag: null },
    { address: 'kaspa:qpu0zrz92y5m4s0vf8ml0tqrhc85l943t9efghexqd4rt09cfynjzw5rmfdws', balance: 75000001, tag: null },
    { address: 'kaspa:ppk66xua7nmq8elv3eglfet0xxcfuks835xdgsm5jlymjhazyu6h5ac62l4ey', balance: 70245300, tag: {name: 'DAGKnight Fund', type:'tag-dev'} },
    { address: 'kaspa:qzganetmrpwv88ea0pkma0xvgacw034l6jv9e9kvh0mup47ahqpc24la7yfmf', balance: 69790191, tag: null },
    { address: 'kaspa:pqtm55d2a456qws90g096cxnecc7msjmxr8n2ernwues8zfdamkl2kfmxr8gr', balance: 67770930, tag: {name: 'Rust Fund', type:'tag-dev'} },
    { address: 'kaspa:qrepacgj2flpflt8f7luh3ru4sykgt8d5k7s0sh4zlflk3glqpwjvq9kx7smk', balance: 67117624, tag: null },
    { address: 'kaspa:qpxg04pk29q9pf6uzakcxugdl3td6xkx875p24wkr3hjjgkh9gsp2p5m3akay', balance: 66936643, tag: null },
    { address: 'kaspa:qrjjnrk9vd9je8wnlqq9dz7fhmhurgjjed8n2pnzh5jwgjmef5pvzd4vf0lu7', balance: 66000001, tag: null },
    { address: 'kaspa:qypnwqfqltw6p8j8x7hj3w962l8a4ha5admykfs7z30fc07vydftmng942wwmmw', balance: 59444869, tag: null },
    { address: 'kaspa:qpkf9c9t2vhu7dt037rkmutyjcgg29hlwq25xnxgln6x5uq6ajtnucslxlk9a', balance: 55000003, tag: null },
    { address: 'kaspa:qyppcdqxpu3sw49k6xcj8wcqjd98lpvpc8cm30wfnj003ahlhjzkh0s67gjxuv', balance: 54245323, tag: null },
    { address: 'kaspa:qyp3ffdjvv6de6cg6jjgyhlg3mt3fngna2vzukdpzvwkaj5j3hctsyqecqf7dh3', balance: 54045329, tag: {name: 'MARA', type:'tag-mining'} },
    { address: 'kaspa:qr7vrlhgekw9efxgfq09ca3wqcxlslgxndcpk77pguu2usaa9aa27lhuunewj', balance: 27166983, tag: {name: 'Uphold', type:'tag-exchange'} }
];

/* ==========================================
   INITIALIZATION
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 KasLive Initializing...');
    
    // Initialize all systems
    initLedger();
    initKRC20();
    fetchMarketData();
    fetchHashrate();
    fetchNodeCount();
    startLiveBlocks();
    startLedgerScanner();
    
    // Setup polling intervals
    setInterval(fetchMarketData, POLL_INTERVALS.marketData);
    setInterval(fetchHashrate, 30000); // Every 30s
    setInterval(startLiveBlocks, POLL_INTERVALS.blocks);
    setInterval(fetchNodeCount, 120000); // Every 2 min
    
    console.log('✅ KasLive Online');
});

/* ==========================================
   UTILITY FUNCTIONS
   ========================================== */

function formatNum(num) {
    return new Intl.NumberFormat('en-US', {maximumFractionDigits: 0}).format(num);
}

function setAPIStatus(apiName, isOnline) {
    state.apiStatus[apiName] = isOnline;
    console.log(`${isOnline ? '✅' : '❌'} API ${apiName}: ${isOnline ? 'ONLINE' : 'OFFLINE'}`);
}

function showError(location, message) {
    const el = document.getElementById(location);
    if (el) {
        el.innerHTML = `<span style="color:#ff3333">${message}</span>`;
    }
}

/* ==========================================
   LANGUAGE SYSTEM
   ========================================== */

function cycleLanguage() {
    const langs = ['EN', 'ES', 'CN', 'RU'];
    let idx = langs.indexOf(state.language);
    idx = (idx + 1) % langs.length;
    state.language = langs[idx];
    document.getElementById('langToggle').innerText = `[${state.language}]`;
    applyLanguage();
}

function applyLanguage() {
    const d = DICT[state.language];
    const elements = {
        '.t-crypto': d.crypto,
        '.t-dominance': d.dominance,
        '.t-rel-strength': d.relStrength,
        '.t-rwa': d.rwa,
        '.t-gold': d.gold,
        '.t-silver': d.silver,
        '.t-chain': d.chain,
        '.t-netflow': d.netflow,
        '.t-heat': d.heat,
        '.t-hash': d.hash,
        '.t-nodes': d.nodes,
        '.t-ledger': d.ledger,
        '.t-krc': d.krc,
        '.t-blocks': d.blocks
    };
    
    Object.entries(elements).forEach(([selector, text]) => {
        const el = document.querySelector(selector);
        if (el) el.innerText = text;
    });
}

/* ==========================================
   LEDGER SYSTEM
   ========================================== */

function initLedger() {
    console.log('📊 Initializing Leviathan Ledger...');
    state.whaleData = [];
    
    REAL_ADDRS.forEach((data, i) => {
        const row = {
            ...data,
            rank: i + 1,
            lastTxDate: "Loading...",
            lastTxVal: "--",
            percent: ((data.balance / TOTAL_SUPPLY) * 100).toFixed(4)
        };
        state.whaleData.push(row);
        
        // Fetch real balance (staggered to avoid rate limits)
        setTimeout(() => fetchRealBalance(i, row.address), i * 500);
    });
    
    renderTable();
    updateTotal();
    document.getElementById('sourceLabel').innerHTML = 
        `<span style="color:var(--hex-green)">LIVE API</span>`;
}

async function fetchRealBalance(index, address) {
    try {
        const res = await fetch(API.kaspa.addressBalance(address));
        
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }
        
        const data = await res.json();
        
        if (data && data.balance) {
            const realBal = Math.floor(data.balance / 100000000);
            if (realBal > 0) {
                state.whaleData[index].balance = realBal;
                state.whaleData[index].lastTxDate = "Synced";
                state.whaleData[index].percent = ((realBal / TOTAL_SUPPLY) * 100).toFixed(4);
                updateRow(index);
                setAPIStatus('kaspa', true);
            }
        }
    } catch (e) {
        console.error(`Failed to fetch balance for address ${index}:`, e.message);
        state.whaleData[index].lastTxDate = "Offline";
        setAPIStatus('kaspa', false);
    }
}

function updateRow(index) {
    const row = document.querySelector(`#whaleTable tbody tr:nth-child(${index + 1})`);
    if (row && state.whaleData[index]) {
        const data = state.whaleData[index];
        row.cells[3].innerText = formatNum(data.balance);
        row.cells[3].classList.add('val-update');
        row.cells[4].innerText = data.lastTxDate;
        row.cells[4].style.color = data.lastTxDate === "Synced" ? "var(--hex-cyan)" : "#666";
        row.cells[6].innerText = data.percent + "%";
        
        setTimeout(() => row.cells[3].classList.remove('val-update'), 1000);
    }
    updateTotal();
}

function startLedgerScanner() {
    setInterval(() => {
        if (state.whaleData.length === 0) return;
        
        const idx = Math.floor(Math.random() * state.whaleData.length);
        const wallet = state.whaleData[idx];
        const row = document.querySelector(`#whaleTable tbody tr:nth-child(${idx + 1})`);
        
        if (row) {
            row.classList.add('scanning');
            setTimeout(() => row.classList.remove('scanning'), 400);
            fetchRealBalance(idx, wallet.address);
        }
    }, POLL_INTERVALS.balanceScan);
}

function updateTotal() {
    const total = state.whaleData.reduce((acc, curr) => acc + curr.balance, 0);
    const el = document.getElementById('totalTracked');
    if (el) {
        el.innerText = `TOTAL TRACKED: ${(total / 1000000000).toFixed(2)}B KAS`;
    }
}

function renderTable() {
    const tableBody = document.getElementById('tableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    state.whaleData.forEach(row => {
        const tr = document.createElement('tr');
        
        let tagHtml = `<span style="opacity:0.3">-</span>`;
        if (row.tag) {
            tagHtml = `<span class="tag-pill ${row.tag.type}">${row.tag.name}</span>`;
        }
        
        const shortAddr = row.address.substring(0, 10) + '...' + 
                         row.address.substring(row.address.length - 8);
        const explorerLink = `https://explorer.kaspa.org/addresses/${row.address}`;
        
        tr.innerHTML = `
            <td style="color:var(--hex-dim)">${row.rank}</td>
            <td style="font-family:monospace; opacity:0.9;">
                <a href="${explorerLink}" target="_blank" class="addr-link" 
                   title="${row.address}">${shortAddr}</a>
            </td>
            <td>${tagHtml}</td>
            <td class="balance-col mono-num">${formatNum(row.balance)}</td>
            <td class="mono-num" style="font-size:0.75rem; color:#aaa;">${row.lastTxDate}</td>
            <td class="mono-num" style="font-size:0.75rem;">${row.lastTxVal}</td>
            <td class="percent-col mono-num" style="text-align:right">${row.percent}%</td>
        `;
        
        tableBody.appendChild(tr);
    });
}

/* ==========================================
   MARKET DATA
   ========================================== */

async function fetchMarketData() {
    try {
        const [marketsRes, globalRes] = await Promise.all([
            fetch(API.coingecko.markets),
            fetch(API.coingecko.global)
        ]);
        
        if (!marketsRes.ok || !globalRes.ok) {
            throw new Error('CoinGecko API failed');
        }
        
        const markets = await marketsRes.json();
        const global = await globalRes.json();
        
        if (!markets || markets.length < 3) {
            throw new Error('Invalid market data');
        }
        
        const btc = markets.find(c => c.id === 'bitcoin');
        const eth = markets.find(c => c.id === 'ethereum');
        const kas = markets.find(c => c.id === 'kaspa');
        const gold = markets.find(c => c.id === 'pax-gold');
        const silver = markets.find(c => c.id === 'kinesis-silver');
        
        if (!btc || !eth || !kas) {
            throw new Error('Missing required coin data');
        }
        
        state.currentKasPrice = kas.current_price;
        
        // Update price display
        updatePriceDisplay(kas);
        
        // Update dominance
        if (global && global.data) {
            const dom = global.data.market_cap_percentage.btc;
            const domEl = document.getElementById('btcDom');
            if (domEl) domEl.innerText = dom.toFixed(1) + "%";
        }
        
        // Update BTC/ETH prices
        updateCryptoPrices(btc, eth);
        
        // Update commodities
        updateCommodityPrices(gold, silver);
        
        // Update ratios
        updateRatios(kas, btc, eth);
        
        // Calculate heat index
        calculateHeatIndex(kas);
        
        setAPIStatus('coingecko', true);
        
    } catch (e) {
        console.error('❌ Market Data Fetch Failed:', e.message);
        setAPIStatus('coingecko', false);
        showError('mainPrice', 'API ERROR');
    }
}

function updatePriceDisplay(kas) {
    const priceEl = document.getElementById('mainPrice');
    if (!priceEl) return;
    
    const changeColor = kas.price_change_percentage_24h >= 0 ? 
        'var(--hex-green)' : 'var(--hex-alert)';
    
    priceEl.innerHTML = `$${kas.current_price.toFixed(4)} 
        <span id="percentChange" style="font-size:1rem; opacity:0.8; color:${changeColor}">
            ${kas.price_change_percentage_24h.toFixed(2)}%
        </span>`;
    
    const athEl = document.getElementById('athDisplay');
    if (athEl) {
        const date = new Date(kas.ath_date).toLocaleDateString();
        athEl.innerHTML = `ATH: $${kas.ath.toFixed(4)} 
            <span style="opacity:0.5">(${date})</span>`;
    }
}

function updateCryptoPrices(btc, eth) {
    const btcEl = document.getElementById('btcPrice');
    const ethEl = document.getElementById('ethPrice');
    
    if (btcEl) btcEl.innerText = '$' + btc.current_price.toLocaleString();
    if (ethEl) ethEl.innerText = '$' + eth.current_price.toLocaleString();
}

function updateCommodityPrices(gold, silver) {
    const goldEl = document.getElementById('goldPrice');
    const silverEl = document.getElementById('silverPrice');
    
    if (gold && goldEl) goldEl.innerText = '$' + gold.current_price.toLocaleString();
    if (silver && silverEl) silverEl.innerText = '$' + silver.current_price.toFixed(2);
}

function updateRatios(kas, btc, eth) {
    // BTC Ratio
    const sats = (kas.current_price / btc.current_price) * 100000000;
    const satEl = document.getElementById('ratioBtcVal');
    if (satEl) satEl.innerText = Math.floor(sats) + " sats";
    
    const btcBar = document.getElementById('ratioBtc');
    if (btcBar) btcBar.style.width = Math.min((sats / 100) * 100, 100) + '%';
    
    const lowRatioB = (kas.low_24h / btc.high_24h) * 100000000;
    const highRatioB = (kas.high_24h / btc.low_24h) * 100000000;
    const btcRange = document.getElementById('ratioBtcRange');
    if (btcRange) {
        btcRange.innerText = `24h: ${Math.floor(lowRatioB)} - ${Math.floor(highRatioB)} sats`;
    }
    
    // ETH Ratio
    const gwei = (kas.current_price / eth.current_price) * 1000000000;
    const gweiEl = document.getElementById('ratioEthVal');
    if (gweiEl) gweiEl.innerText = Math.floor(gwei).toLocaleString() + " gwei";
    
    const ethBar = document.getElementById('ratioEth');
    if (ethBar) ethBar.style.width = Math.min((gwei / 20000) * 100, 100) + '%';
    
    const lowRatioE = (kas.low_24h / eth.high_24h) * 1000000000;
    const highRatioE = (kas.high_24h / eth.low_24h) * 1000000000;
    const ethRange = document.getElementById('ratioEthRange');
    if (ethRange) {
        ethRange.innerText = `24h: ${Math.floor(lowRatioE).toLocaleString()} - ${Math.floor(highRatioE).toLocaleString()}`;
    }
    
    // Relative Strength
    const rel = kas.price_change_percentage_24h - btc.price_change_percentage_24h;
    const relEl = document.getElementById('relStrength');
    if (relEl) {
        relEl.innerText = (rel > 0 ? "+" : "") + rel.toFixed(2) + "%";
        relEl.style.color = rel >= 0 ? "var(--hex-green)" : "var(--hex-alert)";
    }
}

function calculateHeatIndex(kas) {
    // Price component (max 40 points)
    let pScore = (kas.price_change_percentage_24h + 10) * 2;
    pScore = Math.max(0, Math.min(40, pScore));
    
    // Volume component (max 30 points)
    let vScore = (kas.total_volume / 100000000) * 30;
    vScore = Math.max(0, Math.min(30, vScore));
    
    // Market cap change component (max 20 points)
    let mScore = 20;
    if (kas.market_cap_change_percentage_24h) {
        mScore = (kas.market_cap_change_percentage_24h + 5) * 2;
        mScore = Math.max(0, Math.min(20, mScore));
    }
    
    // Network activity (simulated, max 10 points)
    const nScore = Math.random() * 10;
    
    const total = Math.floor(pScore + vScore + mScore + nScore);
    
    const heatEl = document.getElementById('heatIndex');
    if (heatEl) heatEl.innerText = total;
    
    const heatBar = document.getElementById('heatBar');
    if (heatBar) {
        heatBar.style.width = total + '%';
        
        if (total > 80) heatBar.style.background = '#ff3333';
        else if (total > 50) heatBar.style.background = '#ffcc00';
        else heatBar.style.background = '#00ff41';
    }
}

/* ==========================================
   HASHRATE
   ========================================== */

async function fetchHashrate() {
    try {
        const res = await fetch(API.kaspa.hashrate);
        
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }
        
        const data = await res.json();
        
        if (data && data.hashrate) {
            const phps = (data.hashrate / 1e15).toFixed(1);
            
            // Find hashrate display element
            const hashEls = document.querySelectorAll('.metric-value');
            hashEls.forEach(el => {
                if (el.textContent.includes('PH/s')) {
                    el.innerText = phps + ' PH/s';
                }
            });
            
            console.log(`⛏️  Hashrate: ${phps} PH/s`);
        }
    } catch (e) {
        console.error('❌ Hashrate Fetch Failed:', e.message);
        // Keep fallback value
    }
}

/* ==========================================
   NODE COUNT
   ========================================== */

async function fetchNodeCount() {
    const el = document.getElementById('nodeCount');
    if (!el) return;
    
    try {
        const res = await fetch(API.nodes);
        
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }
        
        const data = await res.json();
        
        if (data && Array.isArray(data)) {
            el.innerText = data.length;
            console.log(`🌐 Nodes: ${data.length}`);
            return;
        }
        
        throw new Error('Invalid node data');
    } catch (e) {
        console.error('❌ Node Count Fetch Failed:', e.message);
        // Fallback estimate
        const base = 980;
        const flux = Math.floor(Math.random() * 30) - 15;
        el.innerText = (base + flux) + " (EST)";
    }
}

/* ==========================================
   BLOCKS FEED
   ========================================== */

async function startLiveBlocks() {
    try {
        // Fetch current blue score
        const infoRes = await fetch(API.kaspa.blueScore);
        if (infoRes.ok) {
            const infoData = await infoRes.json();
            if (infoData && infoData.blueScore) {
                state.currentBlueScore = parseInt(infoData.blueScore);
            }
        }
        
        // Fetch latest blocks
        const blocksRes = await fetch(API.kaspa.blocks);
        
        if (!blocksRes.ok) {
            throw new Error(`HTTP ${blocksRes.status}`);
        }
        
        const blocks = await blocksRes.json();
        
        if (blocks && Array.isArray(blocks) && blocks.length > 0) {
            processBlocks(blocks);
            setAPIStatus('kaspa', true);
            return;
        }
        
        throw new Error('Invalid blocks data');
    } catch (e) {
        console.error('❌ Blocks Fetch Failed:', e.message);
        setAPIStatus('kaspa', false);
        // Fallback: Generate estimated block
        generateFallbackBlock();
    }
}

function processBlocks(blocks) {
    const tape = document.getElementById('sonarTape');
    if (!tape) return;
    
    tape.innerHTML = '';
    
    blocks.forEach(b => {
        const date = new Date(parseInt(b.timestamp));
        const time = date.toLocaleTimeString();
        const link = `https://explorer.kaspa.org/blocks/${b.hash}`;
        
        const html = `
            <div class="sonar-entry block" onclick="window.open('${link}', '_blank')" 
                 style="cursor:pointer">
                <div>
                    <div style="font-weight:bold; color:var(--hex-purple)">
                        BLOCK #${b.blueScore}
                    </div>
                    <div style="font-size:0.6rem; opacity:0.7">
                        DAA: ${b.daaScore}
                    </div>
                </div>
                <div style="text-align:right">
                    <div>${time}</div>
                    <div style="font-size:0.6rem; opacity:0.5">
                        ${b.pruningPoint ? 'PRUNING' : 'VALID'}
                    </div>
                </div>
            </div>
        `;
        
        tape.insertAdjacentHTML('beforeend', html);
    });
    
    console.log(`🔗 Blocks updated: ${blocks.length} blocks`);
}

function generateFallbackBlock() {
    const tape = document.getElementById('sonarTape');
    if (!tape) return;
    
    const now = new Date();
    const time = now.toLocaleTimeString();
    const daa = Math.floor(state.currentBlueScore * 0.95);
    
    // Increment for visual flow
    state.currentBlueScore++;
    
    const html = `
        <div class="sonar-entry block">
            <div>
                <div style="font-weight:bold; color:var(--hex-purple)">
                    BLOCK #${state.currentBlueScore}
                </div>
                <div style="font-size:0.6rem; opacity:0.7">
                    DAA: ${daa}
                </div>
            </div>
            <div style="text-align:right">
                <div>${time}</div>
                <div style="font-size:0.6rem; opacity:0.5; color:var(--hex-warn)">
                    LIVE (EST)
                </div>
            </div>
        </div>
    `;
    
    tape.insertAdjacentHTML('afterbegin', html);
    
    // Keep only 20 blocks
    while (tape.children.length > 20) {
        tape.lastChild.remove();
    }
}

/* ==========================================
   KRC-20 TOKENS
   ========================================== */

async function initKRC20() {
    console.log('🪙 Fetching KRC-20 tokens...');
    
    try {
        const res = await fetch(API.kasplex.tokenList);
        
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }
        
        const data = await res.json();
        
        if (data && data.result) {
            renderKRC(data.result.slice(0, 20));
            setAPIStatus('kasplex', true);
            
            // Refresh periodically
            setTimeout(initKRC20, POLL_INTERVALS.krc20);
        } else {
            throw new Error('Invalid token data');
        }
    } catch (e) {
        console.error('❌ KRC-20 Fetch Failed:', e.message);
        setAPIStatus('kasplex', false);
        
        const list = document.getElementById('krcList');
        if (list) {
            list.innerHTML = `
                <div style="padding:20px; text-align:center; color:#666">
                    <div style="font-size:2rem; margin-bottom:10px">⚠️</div>
                    <div>KASPLEX API OFFLINE</div>
                    <div style="font-size:0.7rem; margin-top:5px; opacity:0.5">
                        Retrying in ${POLL_INTERVALS.krc20/1000}s
                    </div>
                </div>
            `;
        }
        
        // Retry after interval
        setTimeout(initKRC20, POLL_INTERVALS.krc20);
    }
}

function renderKRC(tokens) {
    const list = document.getElementById('krcList');
    if (!list) return;
    
    list.innerHTML = '';
    
    tokens.forEach(t => {
        if (!t.tick) return;
        
        const el = document.createElement('div');
        el.className = 'token-card';
        
        const max = parseInt(t.max || t.maxSupply || 1);
        const minted = parseInt(t.minted || t.totalMinted || 0);
        
        const pct = (minted / max * 100).toFixed(1);
        const isDone = pct >= 100 || t.state === 'finished';
        
        el.innerHTML = `
            <div class="tk-name">${t.tick}</div>
            <div class="tk-supply">${pct}% MINTED</div>
            <div class="tk-status ${isDone ? 'status-done' : 'status-minting'}">
                ${isDone ? 'TRADING' : 'MINTING'}
            </div>
        `;
        
        list.appendChild(el);
    });
    
    console.log(`🪙 KRC-20: ${tokens.length} tokens loaded`);
}

/* ==========================================
   EXPOSE TO WINDOW FOR HTML ONCLICK
   ========================================== */

window.cycleLanguage = cycleLanguage;
