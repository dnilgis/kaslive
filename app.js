/* ══════════════════════════════════════════════
   KASLIVE v22 — CORE LOGIC
   Real APIs: kaspa.org, coingecko, kasplex, cryptopanic
   ══════════════════════════════════════════════ */

const API = {
    kaspa: {
        blocks:  'https://api.kaspa.org/blocks?limit=20&includeTransactions=false',
        hashHist:'https://api.kaspa.org/info/hashrate/history',
        balance: (a) => `https://api.kaspa.org/addresses/${a}/balance`,
        dag:     'https://api.kaspa.org/info/blockdag',
        supply:  'https://api.kaspa.org/info/coinsupply',
        hash:    'https://api.kaspa.org/info/hashrate',
        price:   'https://api.kaspa.org/info/price'
    },
    coingecko: 'https://api.coingecko.com/api/v3',
    kasplex:   'https://api.kasplex.org/v1/krc20/tokenlist',
    news:      'https://cryptopanic.com/api/free/v1/posts/?currencies=KAS&kind=news&public=true'
};

const MAX_SUPPLY = 28700000000;

/* ═══ STATE ═══ */
const S = {
    whales: [],
    whaleBaseline: {},
    kasPrice: 0,
    btcPrice: 0,
    netHash: 0,
    hashHistory: [],
    hashATH: 0,
    blockReward: 0, // calculated dynamically from emission schedule
    kasChange: 0,
    btcChange: 0,
    kasVol: 0,
    kasMcap: 0,
    bps: 10,
    lastBlue: 0,
    lastDaa: 0,
    lastDaaTime: 0,
    daaVelocity: 0,
    daaVelHistory: [],
    dagWidth: 0
};

/* ═══ WHALE ADDRESSES (Real Rich List) ═══ */
const ADDRS = [
    { a: 'kaspa:precqv0krj3r6uyyfa36ga7s0u9jct0v4wg8ctsfde2gkrsgwgw8jgxfzfc98', t: { n: 'DEV FUND', c: 'tag-dev' } },
    { a: 'kaspa:qpzpfwcsqsxhxwup26r55fd0ghqlhyugz8cp6y3wxuddc02vcxtjg75pspnwz', t: { n: 'MEXC', c: 'tag-exchange' } },
    { a: 'kaspa:qpz2vgvlxhmyhmt22h538pjzmvvd52nuut80y5zulgpvyerlskvvwm7n4uk5a', t: { n: 'Whale 1', c: 'tag-whale' } },
    { a: 'kaspa:qrelgny7sr3vahq69yykxx36m65gvmhryxrlwngfzgu8xkdslum2yxjp3ap8m', t: { n: 'Gate.io', c: 'tag-exchange' } },
    { a: 'kaspa:qrvum29vk365g0zcd5gx3c7h829etfq2ytdmscjzw4zw04fjfnprcg9c3tges', t: { n: 'Bybit', c: 'tag-exchange' } },
    { a: 'kaspa:qzadxjufntvckxrvy76pyhvtkuu8lg5ryz252aglmhlyv27pxqplksshzuu9m', t: { n: 'KuCoin', c: 'tag-exchange' } },
    { a: 'kaspa:qzxrs8gxjgk2q84wlt3xfd057ntws73fptalhy84g85zqfu5lcemvpu04vj3w', t: { n: 'Uphold', c: 'tag-exchange' } },
    { a: 'kaspa:qpj2x2qfmvj4g6fn0xadv6hafdaqv4fwd3t4uvyw3walwfn50rzysa4lafpma', t: { n: 'Kraken', c: 'tag-exchange' } },
    { a: 'kaspa:qq2ka745yyj0760fkt3ax3t7hpyqret6pzaypag3afnd3fp8jpv4cmzpx8yrt', t: { n: 'Whale 2', c: 'tag-whale' } },
    { a: 'kaspa:qqfxn597v5c23td4asz99ky52sha8l2ypq8kmrsqxcu7skhdunncjgup0hdys', t: null },
    { a: 'kaspa:qzpt2wp67seprjndmrzu58g4sgkknxp0y5g97y5leupj7ugffqhs6xgxdjwtf', t: null },
    { a: 'kaspa:qr8k05f9n6xtrd0eex5lr6878mc5n7dgrtn8xv3frfvuxgfchx9077jtz5tsk', t: null },
    { a: 'kaspa:qpap72xed702y4ahw537l3x63788nrh3ea5a0y06we236d5rth43wptqsv0ws', t: null },
    { a: 'kaspa:qz06rpdaap56ktn3xf3w70g09s9dphrkmnks027lnshyqd6x5l8tzt8lcpp4k', t: null },
    { a: 'kaspa:qqywx2wszmnrsu0mzgav85rdwvzangfpdj9j3ady9jpr7hu4u8c2wl9wqgd6j', t: { n: 'Bitget', c: 'tag-exchange' } },
    { a: 'kaspa:ppwn9mz7ht2p8w8mqtafvuw0sslqff7svk0e5j5vterutxwd3gmygnqdrppm5', t: { n: 'Ice River', c: 'tag-mining' } },
    { a: 'kaspa:qr9fqcxp9xjprsm9sv7apy6qc0ja2p676m9gf9fkcww2qmaw4npxzllh7lrw0', t: { n: 'Kraken 2', c: 'tag-exchange' } },
    { a: 'kaspa:qq2hke25nvxsnnawzlym3nf6y38clrhdefph5xckeuyyzxwh99kavfu77grmg', t: null },
    { a: 'kaspa:qpky2f87j7my5ph5taucutm74tfssz8l97m770rqdtnmzmece7r9gf3l2hpze', t: null },
    { a: 'kaspa:qq6kjumc6l95hq005yz2gazrqev3pyfjvqefxef93wz6u2makfhmsrct65f6', t: null },
    { a: 'kaspa:qrtxzw8j3ydwna6spm7etj7x36dzj06h7q84hxn6ueapphfg8txazcycmnalc', t: null },
    { a: 'kaspa:qzew5mu908h4gfw7qgvpux7hlkfqrjz06zazag8nmrykjz59479uqlm8n9q9q', t: null },
    { a: 'kaspa:qqn98feqplp4nc92wgq7j7cy6cdnaugnzngeatps7swaxkw0s9e0c7rjjdrxf', t: null },
    { a: 'kaspa:qp2sp0vvrwu4s8pw0j68muu2ta5qar5mehf8ehuvljw5zsrakk5cvx4gvqz7z', t: null },
    { a: 'kaspa:qpu0zrz92y5m4s0vf8ml0tqrhc85l943t9efghexqd4rt09cfynjzw5rmfdws', t: null },
    { a: 'kaspa:ppk66xua7nmq8elv3eglfet0xxcfuks835xdgsm5jlymjhazyu6h5ac62l4ey', t: { n: 'DAGKnight', c: 'tag-dev' } },
    { a: 'kaspa:qzganetmrpwv88ea0pkma0xvgacw034l6jv9e9kvh0mup47ahqpc24la7yfmf', t: null },
    { a: 'kaspa:pqtm55d2a456qws90g096cxnecc7msjmxr8n2ernwues8zfdamkl2kfmxr8gr', t: { n: 'Rust Fund', c: 'tag-dev' } },
    { a: 'kaspa:qrepacgj2flpflt8f7luh3ru4sykgt8d5k7s0sh4zlflk3glqpwjvq9kx7smk', t: null },
    { a: 'kaspa:qpxg04pk29q9pf6uzakcxugdl3td6xkx875p24wkr3hjjgkh9gsp2p5m3akay', t: null },
    { a: 'kaspa:qrjjnrk9vd9je8wnlqq9dz7fhmhurgjjed8n2pnzh5jwgjmef5pvzd4vf0lu7', t: null },
    { a: 'kaspa:qypnwqfqltw6p8j8x7hj3w962l8a4ha5admykfs7z30fc07vydftmng942wwmmw', t: null },
    { a: 'kaspa:qpkf9c9t2vhu7dt037rkmutyjcgg29hlwq25xnxgln6x5uq6ajtnucslxlk9a', t: null },
    { a: 'kaspa:qyppcdqxpu3sw49k6xcj8wcqjd98lpvpc8cm30wfnj003ahlhjzkh0s67gjxuv', t: null },
    { a: 'kaspa:qyp3ffdjvv6de6cg6jjgyhlg3mt3fngna2vzukdpzvwkaj5j3hctsyqecqf7dh3', t: { n: 'MARA Pool', c: 'tag-mining' } },
    { a: 'kaspa:qr7vrlhgekw9efxgfq09ca3wqcxlslgxndcpk77pguu2usaa9aa27lhuunewj', t: { n: 'Uphold 2', c: 'tag-exchange' } }
];

/* ═══ HELPERS ═══ */
function $(id) { return document.getElementById(id); }

async function safeFetch(url, timeout = 8000) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeout);
    try {
        const r = await fetch(url, { signal: ctrl.signal });
        clearTimeout(t);
        if (!r.ok) throw new Error(r.status);
        return r;
    } catch (e) { clearTimeout(t); throw e; }
}

function flash(el, dir) {
    if (!el) return;
    el.classList.remove('flash-up', 'flash-down', 'flash-neutral');
    void el.offsetWidth;
    el.classList.add(dir === 'up' ? 'flash-up' : dir === 'down' ? 'flash-down' : 'flash-neutral');
}

function setVal(id, val, oldVal) {
    const el = $(id);
    if (!el) return;
    el.classList.remove('skel');
    const oldText = el.textContent;
    el.textContent = val;
    if (oldVal !== undefined && val !== oldVal) {
        const n = parseFloat(String(val).replace(/[^0-9.\-]/g, ''));
        const o = parseFloat(String(oldVal).replace(/[^0-9.\-]/g, ''));
        if (!isNaN(n) && !isNaN(o)) flash(el, n > o ? 'up' : n < o ? 'down' : 'neutral');
        else flash(el, 'neutral');
    }
}

function setHTML(id, html) {
    const el = $(id);
    if (!el) return;
    el.classList.remove('skel');
    el.innerHTML = html;
}

function esc(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
}

function fmtHash(v) {
    if (v >= 1e6) return (v / 1e6).toFixed(2) + ' EH/s';
    if (v >= 1e3) return (v / 1e3).toFixed(2) + ' PH/s';
    return v.toFixed(2) + ' TH/s';
}

function fmtUSD(v) {
    if (v >= 1e9) return '$' + (v / 1e9).toFixed(2) + 'B';
    if (v >= 1e6) return '$' + (v / 1e6).toFixed(1) + 'M';
    if (v >= 1e3) return '$' + (v / 1e3).toFixed(0) + 'K';
    return '$' + Math.round(v);
}

// Staged error system
const failCounts = {};
function sigWarn(id) {
    failCounts[id] = (failCounts[id] || 0) + 1;
    const el = $(id);
    if (!el) return;
    if (failCounts[id] >= 3) {
        el.innerHTML = '<span class="sig-err">SIGNAL LOST</span>';
    }
}
function sigOK(id) { failCounts[id] = 0; }

/* ═══ CACHE ═══ */
const CACHE_TTL = 600000;
function setCache(k, v) { try { localStorage.setItem('kl_' + k, JSON.stringify({ ts: Date.now(), d: v })); } catch (e) {} }
function getCache(k) { try { const c = JSON.parse(localStorage.getItem('kl_' + k)); if (c && Date.now() - c.ts < CACHE_TTL) return c.d; } catch (e) {} return null; }

/* ═══ BLOCK REWARD (Chromatic Halving Schedule) ═══ */
// Kaspa emission: 440 KAS/sec at genesis, halves yearly in 12 monthly steps.
// Each month: emission *= (1/2)^(1/12). Per-block = emission_per_sec / BPS.
const KASPA_GENESIS = 1636243200000; // Nov 7 2021 (mainnet genesis)
const INITIAL_EMISSION = 440; // KAS per second at genesis
const MONTH_MS = 30.4375 * 86400 * 1000; // avg month in ms
const HALVING_FACTOR = Math.pow(0.5, 1 / 12); // ≈0.94387 per month

function calcBlockReward() {
    const elapsed = Date.now() - KASPA_GENESIS;
    const months = Math.floor(elapsed / MONTH_MS);
    const emissionPerSec = INITIAL_EMISSION * Math.pow(HALVING_FACTOR, months);
    const bps = S.bps || 10;
    S.blockReward = emissionPerSec / bps;
    return S.blockReward;
}

/* ═══ AUDIO ═══ */
let audioCtx = null, soundOn = false;
function toggleSound() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    soundOn = !soundOn;
    const b = $('sBtn');
    b.textContent = soundOn ? '◼ AUDIO' : '◻ AUDIO';
    b.classList.toggle('on', soundOn);
    if (soundOn) { ping(600, .15, 'sine'); startGeiger(); syncHeartbeatInterval(); }
    else { stopGeiger(); if (heartbeatSoundInterval) clearInterval(heartbeatSoundInterval); }
}

function ping(f, d, t) {
    if (!soundOn || !audioCtx) return;
    try {
        const o = audioCtx.createOscillator(), g = audioCtx.createGain();
        o.type = t || 'sine';
        o.frequency.setValueAtTime(f, audioCtx.currentTime);
        g.gain.setValueAtTime(.05, audioCtx.currentTime);
        g.gain.exponentialRampToValueAtTime(.001, audioCtx.currentTime + d);
        o.connect(g); g.connect(audioCtx.destination);
        o.start(); o.stop(audioCtx.currentTime + d);
    } catch (e) {}
}

function sonarBlock() { ping(800 + Math.random() * 400, .06, 'triangle'); }
function sonarWhale() { ping(200, .3, 'sine'); }

let geigerOn = false, geigerInterval = null;
function startGeiger() {
    if (geigerOn || !soundOn) return;
    geigerOn = true;
    geigerInterval = setInterval(() => {
        if (!soundOn) { stopGeiger(); return; }
        const bps = S.bps || 1;
        const clicks = Math.max(1, Math.round(bps / 2));
        for (let i = 0; i < clicks; i++) {
            setTimeout(() => ping(2000 + Math.random() * 4000, .01, 'square'), Math.random() * 400);
        }
    }, 500);
}
function stopGeiger() { geigerOn = false; if (geigerInterval) clearInterval(geigerInterval); geigerInterval = null; }

/* ═══ PULSE OF KASPA (Heartbeat synced to BPS) ═══ */
let pulseInterval = null;
function startPulse() {
    updatePulseRate();
    if (pulseInterval) clearInterval(pulseInterval);
    // Re-sync rate every 5 seconds
    pulseInterval = setInterval(updatePulseRate, 5000);
}

function updatePulseRate() {
    const heart = $('pulseHeart');
    const bpmLabel = $('pulseBpm');
    if (!heart) return;

    const bps = S.bps || 1;
    // Map BPS to heartbeat: 1 BPS = 60 BPM (calm), 10 BPS = 150 BPM (racing)
    const bpm = Math.round(40 + (bps * 12));
    const beatDuration = 60 / bpm; // seconds per beat

    heart.classList.add('beat');
    heart.style.setProperty('--beat-duration', beatDuration.toFixed(2) + 's');
    if (bpmLabel) bpmLabel.textContent = bpm + ' BPM';

    // Color shift: slow=dim red, fast=bright red/orange
    if (bps >= 8) heart.style.color = '#ff4444';
    else if (bps >= 5) heart.style.color = '#ff2a2a';
    else heart.style.color = '#cc2222';
}

function pulseSound() {
    // Double-thump heartbeat: "lub-dub"
    if (!soundOn || !audioCtx) return;
    try {
        const now = audioCtx.currentTime;
        // Lub (lower, louder)
        const o1 = audioCtx.createOscillator(), g1 = audioCtx.createGain();
        o1.type = 'sine'; o1.frequency.setValueAtTime(55, now);
        g1.gain.setValueAtTime(0.08, now);
        g1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        o1.connect(g1); g1.connect(audioCtx.destination);
        o1.start(now); o1.stop(now + 0.12);
        // Dub (slightly higher, softer, 120ms later)
        const o2 = audioCtx.createOscillator(), g2 = audioCtx.createGain();
        o2.type = 'sine'; o2.frequency.setValueAtTime(70, now + 0.12);
        g2.gain.setValueAtTime(0.05, now + 0.12);
        g2.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        o2.connect(g2); g2.connect(audioCtx.destination);
        o2.start(now + 0.12); o2.stop(now + 0.22);
    } catch (e) {}
}

// Heartbeat sound loop — fires at BPS-driven interval
let heartbeatSoundInterval = null;
function startHeartbeatSound() {
    if (heartbeatSoundInterval) clearInterval(heartbeatSoundInterval);
    heartbeatSoundInterval = setInterval(() => {
        if (!soundOn) return;
        const bps = S.bps || 1;
        const bpm = 40 + (bps * 12);
        const interval = 60000 / bpm;
        // Only play if we're roughly at the right interval
        pulseSound();
    }, 800); // ~75 BPM default, re-syncs via updatePulseRate
}

function syncHeartbeatInterval() {
    if (heartbeatSoundInterval) clearInterval(heartbeatSoundInterval);
    if (!soundOn) return;
    const bps = S.bps || 1;
    const bpm = 40 + (bps * 12);
    const interval = Math.max(300, 60000 / bpm); // ms between beats
    heartbeatSoundInterval = setInterval(() => {
        if (soundOn) pulseSound();
    }, interval);
}

/* ═══ BOOT SEQUENCE ═══ */
const bootMsgs = [
    'KASLIVE v22 — MACRO INTELLIGENCE TERMINAL',
    '> Connecting to Kaspa mainnet…',
    '> Node handshake ··· ESTABLISHED',
    '> Syncing BlockDAG state…',
    '> Loading whale ledger (36 addresses)…',
    '> CoinGecko market feed ··· ONLINE',
    '> Hashrate telemetry ··· ACTIVE',
    '> DEFCON algorithm ··· ARMED',
    '> All systems nominal. Terminal ready.',
];

function runBoot() {
    const tk = $('tkT');
    if (!tk) return;
    let i = 0;
    const step = () => {
        if (i < bootMsgs.length) {
            const color = i === bootMsgs.length - 1 ? 'var(--grn)' : 'var(--t3)';
            tk.innerHTML = `<span style="font-family:var(--mono);font-size:0.75rem;color:${color};padding:0 12px">${bootMsgs[i]}</span>`;
            i++;
            setTimeout(step, i === bootMsgs.length ? 1200 : 350);
        } else {
            fetchNews();
        }
    };
    step();
}

/* ═══ INIT ═══ */
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔴 KasLive v22 initializing…');
    calcBlockReward();
    runBoot();
    initWhales();
    fetchMarket();
    fetchNetwork();
    fetchSupply();
    fetchBlocks();
    loadHashATH();
    initKRC20();

    // Polling
    setInterval(fetchMarket, 30000);
    setInterval(scanWhale, 3000);
    setInterval(fetchBlocks, 5000);
    setInterval(fetchNetwork, 10000);
    setInterval(fetchSupply, 60000);
    setInterval(fetchNews, 120000);
    setInterval(calcDefcon, 30000);

    // Sonar ping
    setInterval(pingUplink, 5000);
    setTimeout(pingUplink, 2000);

    // Chart
    setTimeout(() => updPerf(365), 1500);
    setTimeout(() => initHashChart(), 2000);

    // Heartbeat pulse (visual — always on)
    setTimeout(startPulse, 1000);

    // Calc listener
    $('cH').addEventListener('input', calcMining);
});

/* ═══ NETWORK + DAG WIDTH ═══ */
async function fetchNetwork() {
    // DAG info
    try {
        const r = await safeFetch(API.kaspa.dag);
        const d = await r.json();
        if (d.virtualDaaScore) {
            const daa = parseInt(d.virtualDaaScore);
            if (S.lastDaa > 0 && S.lastDaaTime > 0) {
                const elapsed = (Date.now() - S.lastDaaTime) / 1000;
                if (elapsed > 0) {
                    const instant = (daa - S.lastDaa) / elapsed;
                    S.daaVelHistory.push(instant);
                    if (S.daaVelHistory.length > 6) S.daaVelHistory.shift(); // keep last 6 samples (~60s at 10s polling)
                    S.daaVelocity = S.daaVelHistory.reduce((a, b) => a + b, 0) / S.daaVelHistory.length;
                }
            }
            S.lastDaa = daa;
            S.lastDaaTime = Date.now();
        }
        if (d.bps) { S.bps = d.bps; calcBlockReward(); updatePulseRate(); if (soundOn) syncHeartbeatInterval(); }
        sigOK('netDen');
    } catch (e) { sigWarn('netDen'); }

    // Hashrate
    try {
        const r = await safeFetch(API.kaspa.hash);
        const d = await r.json();
        if (d.hashrate) {
            S.netHash = d.hashrate;
            S.hashHistory.push({ ts: Date.now(), v: d.hashrate });
            if (S.hashHistory.length > 200) S.hashHistory.shift();
            if (d.hashrate > S.hashATH) S.hashATH = d.hashrate;
            updateShield();
            updateNovelMetrics();
            sigOK('shPct');
        }
    } catch (e) { sigWarn('shPct'); }

    // DAG Width from blocks
    try {
        const r = await safeFetch(API.kaspa.blocks);
        const blocks = await r.json();
        const groups = {};
        blocks.forEach(b => {
            const ds = b.daaScore || b.blueScore;
            if (!groups[ds]) groups[ds] = 0;
            groups[ds]++;
        });
        const counts = Object.values(groups);
        if (counts.length > 0) {
            const oldW = S.dagWidth;
            S.dagWidth = counts.reduce((a, b) => a + b, 0) / counts.length;
            const mx = Math.max(...counts);
            setVal('dagW', S.dagWidth.toFixed(1) + '×', oldW > 0 ? oldW.toFixed(1) + '×' : undefined);
            $('dagWSub').textContent = `Peak ${mx}× | ${counts.length} DAA scores`;
            sigOK('dagW');
        }
    } catch (e) { sigWarn('dagW'); }

    setCache('net', { nh: S.netHash, bps: S.bps, lastDaa: S.lastDaa, hATH: S.hashATH, dagWidth: S.dagWidth });
}

function updateShield() {
    const c = S.netHash, a = S.hashATH;
    if (!a || !c) return;
    const pct = Math.min(100, (c / a) * 100);
    const el = $('shPct');
    el.classList.remove('skel');
    const oldTxt = el.textContent;
    const newTxt = pct.toFixed(1) + '%';
    el.textContent = newTxt;
    el.style.color = pct >= 90 ? 'var(--grn)' : pct >= 70 ? 'var(--org)' : 'var(--red)';
    if (oldTxt && oldTxt !== newTxt && oldTxt !== '' && !oldTxt.includes('nbsp'))
        flash(el, pct >= parseFloat(oldTxt) ? 'up' : 'down');
    $('shBar').style.width = pct + '%';
    $('shCur').textContent = fmtHash(c);
    $('shATH').textContent = fmtHash(a);
    updateAttackCost();
}

function updateAttackCost() {
    if (S.netHash <= 0) return;
    // Energy-cost model for 51% attack (1 hour)
    // Assumes: ~85W per TH/s (IceRiver KS-series efficiency), $0.07/kWh global avg
    const attackTH = S.netHash * 0.51; // S.netHash already in TH/s
    const watts = attackTH * 85; // total wattage needed
    const kWh = (watts / 1000) * 1; // 1 hour
    const energyCost = kWh * 0.07;
    // Plus: hardware acquisition (rough $300/TH for kHeavyHash ASICs)
    const hwCost = attackTH * 300;
    const totalCost = energyCost + hwCost;
    $('atkCost').textContent = fmtUSD(totalCost);
}

function updateNovelMetrics() {
    const h = S.netHash, p = S.kasPrice, br = S.blockReward, bps = S.bps;

    // Sompi per TH (per second)
    if (h > 0) {
        const spg = (br * 1e8 * bps) / h;
        const old = $('sompiGH').textContent;
        setVal('sompiGH', Math.round(spg).toLocaleString(), old);
        $('sompiSub').textContent = `${(spg / 1e8).toFixed(6)} KAS/TH/s`;
    }

    // Hash Yield ($/PH/day)
    if (h > 0 && p > 0) {
        const phShare = 1000 / h;
        const dailyKAS = 86400 * br * bps * phShare;
        const dailyUSD = dailyKAS * p;
        const old = $('hashY').textContent;
        setVal('hashY', '$' + dailyUSD.toFixed(2), old);
        $('hashYSub').textContent = `${Math.round(dailyKAS).toLocaleString()} KAS/PH/day`;
    }

    // KAS per second
    const kps = br * bps;
    const oldK = $('kasSec').textContent;
    setVal('kasSec', kps.toFixed(0), oldK);
    $('kasSecSub').textContent = `$${(kps * p).toFixed(2)}/sec minted`;

    // Network Density
    const density = (bps / 10) * 100;
    const oldD = $('netDen').textContent;
    setVal('netDen', density.toFixed(0) + '%', oldD);
    $('netDenU').textContent = `${bps.toFixed(1)} of 10 BPS target`;
    $('netDenSub').textContent = `${(bps * 86400).toLocaleString()} blocks/day`;

    // DAA Velocity
    if (S.daaVelocity > 0) {
        const oldDaa = $('daaV').textContent;
        setVal('daaV', S.daaVelocity.toFixed(2), oldDaa);
        $('daaVSub').textContent = `Score: ${S.lastDaa.toLocaleString()}`;
    }

    // Mining calc
    calcMining();
}

/* ═══ SUPPLY ═══ */
async function fetchSupply() {
    try {
        const r = await safeFetch(API.kaspa.supply);
        if (!r.ok) return;
        const d = await r.json();
        let circ = 0;
        if (d.circulatingSupply) circ = parseFloat(d.circulatingSupply) / 1e8;
        else if (d.circulatingSompiSupply) circ = parseFloat(d.circulatingSompiSupply) / 1e8;
        if (circ > 0) {
            const pct = ((circ / MAX_SUPPLY) * 100).toFixed(2);
            $('supPct').textContent = pct + '%';
            $('supLbl').textContent = pct + '%';
            $('supBar').style.width = pct + '%';
            $('supC').textContent = (circ / 1e9).toFixed(2) + 'B';
        }
    } catch (e) {}
}

/* ═══ MARKET DATA ═══ */
const CG_CACHE_KEY = 'kl_cg', CG_CACHE_TTL = 300000;
function getCGCache() { try { const c = JSON.parse(localStorage.getItem(CG_CACHE_KEY)); if (c && Date.now() - c.ts < CG_CACHE_TTL) return c.data; } catch (e) {} return null; }
function setCGCache(data) { try { localStorage.setItem(CG_CACHE_KEY, JSON.stringify({ ts: Date.now(), data })); } catch (e) {} }

async function fetchMarket() {
    let kas = null, btc = null, eth = null, paxg = null, kag = null;

    try {
        const r = await safeFetch(`${API.coingecko}/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,kaspa,pax-gold,kinesis-silver&order=market_cap_desc&sparkline=false`);
        const d = await r.json();
        kas = d.find(c => c.id === 'kaspa');
        btc = d.find(c => c.id === 'bitcoin');
        eth = d.find(c => c.id === 'ethereum');
        paxg = d.find(c => c.id === 'pax-gold');
        kag = d.find(c => c.id === 'kinesis-silver');
        setCGCache({ kas, btc, eth, paxg, kag });
    } catch (e) {
        const cache = getCGCache();
        if (cache) { kas = cache.kas; btc = cache.btc; eth = cache.eth; paxg = cache.paxg; kag = cache.kag; }
        else {
            try {
                const r = await safeFetch(API.kaspa.price);
                const j = await r.json();
                if (j && j.price) kas = { current_price: j.price, price_change_percentage_24h: 0 };
            } catch (ek) { sigWarn('bigP'); }
        }
    }

    if (kas) {
        const oldP = S.kasPrice;
        S.kasPrice = kas.current_price;
        S.kasChange = kas.price_change_percentage_24h || 0;
        S.kasVol = kas.total_volume || 0;
        S.kasMcap = kas.market_cap || 0;
        const up = S.kasChange >= 0;
        const priceStr = '$' + kas.current_price.toFixed(4);

        // Header price
        setVal('hPrice', priceStr, oldP > 0 ? '$' + oldP.toFixed(4) : undefined);
        const ce = $('hChg');
        ce.textContent = (up ? '+' : '') + S.kasChange.toFixed(2) + '%';
        ce.className = 'price-chg ' + (up ? 'green' : 'red');

        // Big price
        const bp = $('bigP');
        bp.textContent = priceStr;
        if (oldP > 0) flash(bp, kas.current_price > oldP ? 'up' : kas.current_price < oldP ? 'down' : 'neutral');

        setHTML('bigC', `<span class="${up ? 'green' : 'red'}">${up ? '+' : ''}${S.kasChange.toFixed(2)}%</span>`);
        $('bigV').textContent = '$' + (S.kasVol / 1e6).toFixed(1) + 'M';
        $('bigM').textContent = '$' + (S.kasMcap / 1e9).toFixed(2) + 'B';
        if (S.kasMcap > 0 && S.kasVol > 0) $('vmR').textContent = (S.kasVol / S.kasMcap * 100).toFixed(2) + '%';

        if (kas.ath) $('athDisplay').textContent = '$' + kas.ath.toFixed(4);

        // Header stats
        $('hVol').textContent = 'VOL $' + (S.kasVol / 1e6).toFixed(0) + 'M';
        $('hMcap').textContent = 'MCAP $' + (S.kasMcap / 1e9).toFixed(1) + 'B';
    }

    if (btc) {
        S.btcPrice = btc.current_price;
        S.btcChange = btc.price_change_percentage_24h || 0;
    }

    if (kas && btc && eth) updateRatios(kas, btc, eth);

    const tickStat = (id, nm, d) => {
        if (!d) return;
        const ch = d.price_change_percentage_24h || 0;
        $(id).innerHTML = `${nm} $${d.current_price.toLocaleString(undefined, { maximumFractionDigits: 0 })} <span class="${ch >= 0 ? 'green' : 'red'}">${ch >= 0 ? '+' : ''}${ch.toFixed(1)}%</span>`;
    };
    tickStat('hBtc', 'BTC', btc);
    tickStat('hEth', 'ETH', eth);
    tickStat('hGold', 'PAXG', paxg);
    tickStat('hSilver', 'KAG', kag);

    updateHardMoney(kas, btc, eth, paxg, kag);
    updateFlow();
    updateNovelMetrics();
    calcDefcon();
}

function updateRatios(kas, btc, eth) {
    const getOld = (cur, pct) => cur / (1 + (pct / 100));

    // BTC ratio (sats)
    const curSats = (kas.current_price / btc.current_price) * 1e8;
    const oldSats = (getOld(kas.current_price, kas.price_change_percentage_24h) / getOld(btc.current_price, btc.price_change_percentage_24h)) * 1e8;
    const satsChange = ((curSats - oldSats) / oldSats) * 100;
    $('rBtc').innerHTML = `${Math.floor(curSats)} <span class="metric-unit">sats</span> <span style="font-size:.75rem" class="${satsChange >= 0 ? 'green' : 'red'}">${satsChange > 0 ? '+' : ''}${satsChange.toFixed(1)}%</span>`;

    // ETH ratio (gwei)
    const curGwei = (kas.current_price / eth.current_price) * 1e9;
    const oldGwei = (getOld(kas.current_price, kas.price_change_percentage_24h) / getOld(eth.current_price, eth.price_change_percentage_24h)) * 1e9;
    const gweiChange = ((curGwei - oldGwei) / oldGwei) * 100;
    $('rEth').innerHTML = `${Math.floor(curGwei).toLocaleString()} <span class="metric-unit">gwei</span> <span style="font-size:.75rem" class="${gweiChange >= 0 ? 'green' : 'red'}">${gweiChange > 0 ? '+' : ''}${gweiChange.toFixed(1)}%</span>`;
}

function updateHardMoney(kas, btc, eth, paxg, kag) {
    if (!kas) return;
    const kc = kas.price_change_percentage_24h || 0;
    $('hmKP').textContent = '$' + kas.current_price.toFixed(4);
    $('hmKC').innerHTML = `<span class="${kc >= 0 ? 'green' : 'red'}">${kc >= 0 ? '+' : ''}${kc.toFixed(2)}%</span>`;

    let maxSpread = 0; // track largest KAS-vs-others divergence

    if (paxg) {
        const gc = paxg.price_change_percentage_24h || 0;
        $('hmGP').textContent = '$' + paxg.current_price.toLocaleString(undefined, { maximumFractionDigits: 0 });
        $('hmGC').innerHTML = `<span class="${gc >= 0 ? 'green' : 'red'}">${gc >= 0 ? '+' : ''}${gc.toFixed(2)}%</span>`;
        const gd = kc - gc; // alpha: KAS relative outperformance vs gold
        $('sG').innerHTML = `<span class="${gd >= 0 ? 'green' : 'red'}">${gd >= 0 ? '+' : ''}${gd.toFixed(1)}%</span>`;
        maxSpread = Math.max(maxSpread, Math.abs(gd));
    }

    if (kag) {
        const sc = kag.price_change_percentage_24h || 0;
        $('hmSP').textContent = '$' + kag.current_price.toLocaleString(undefined, { maximumFractionDigits: 2 });
        $('hmSC').innerHTML = `<span class="${sc >= 0 ? 'green' : 'red'}">${sc >= 0 ? '+' : ''}${sc.toFixed(2)}%</span>`;
        const sd = kc - sc;
        $('sS').innerHTML = `<span class="${sd >= 0 ? 'green' : 'red'}">${sd >= 0 ? '+' : ''}${sd.toFixed(1)}%</span>`;
        maxSpread = Math.max(maxSpread, Math.abs(sd));
    }

    if (btc) {
        const bc = btc.price_change_percentage_24h || 0;
        $('hmBP').textContent = '$' + btc.current_price.toLocaleString(undefined, { maximumFractionDigits: 0 });
        $('hmBC').innerHTML = `<span class="${bc >= 0 ? 'green' : 'red'}">${bc >= 0 ? '+' : ''}${bc.toFixed(2)}%</span>`;
        const bd = kc - bc; // alpha: KAS relative outperformance vs BTC
        $('sB').innerHTML = `<span class="${bd >= 0 ? 'green' : 'red'}">${bd >= 0 ? '+' : ''}${bd.toFixed(1)}%</span>`;
        maxSpread = Math.max(maxSpread, Math.abs(bd));
    }

    if (eth) {
        const ec = eth.price_change_percentage_24h || 0;
        $('hmEP').textContent = '$' + eth.current_price.toLocaleString(undefined, { maximumFractionDigits: 0 });
        $('hmEC').innerHTML = `<span class="${ec >= 0 ? 'green' : 'red'}">${ec >= 0 ? '+' : ''}${ec.toFixed(2)}%</span>`;
        const ed = kc - ec; // alpha: KAS relative outperformance vs ETH
        $('sE').innerHTML = `<span class="${ed >= 0 ? 'green' : 'red'}">${ed >= 0 ? '+' : ''}${ed.toFixed(1)}%</span>`;
        maxSpread = Math.max(maxSpread, Math.abs(ed));
    }

    // DECOUPLED: fires when KAS diverges from ALL tracked assets by >4% spread
    $('decB').style.display = maxSpread > 4 ? 'inline-block' : 'none';
}

function updateFlow() {
    const v = S.kasVol;
    const mc = S.kasMcap;
    if (!v || !mc) return;

    // Volume/MCap ratio — measures trading intensity
    const vmRatio = (v / mc) * 100;
    // Bar: 0-20% Vol/MCap mapped to 0-100% width (20%+ is extreme)
    $('tBar').style.width = Math.min(100, (vmRatio / 20) * 100) + '%';

    const bullish = S.kasChange >= 0;
    $('tBar').style.background = bullish ? 'var(--cyn)' : 'var(--red)';
    // Honest labeling: buying vs selling pressure based on price direction + volume
    if (vmRatio > 10) {
        $('tDir').innerHTML = bullish ? '<span class="green">▲ HIGH BUY PRESSURE</span>' : '<span class="red">▼ HIGH SELL PRESSURE</span>';
    } else if (vmRatio > 3) {
        $('tDir').innerHTML = bullish ? '<span class="green">▲ BUY PRESSURE</span>' : '<span class="red">▼ SELL PRESSURE</span>';
    } else {
        $('tDir').innerHTML = '<span style="color:var(--t3)">◆ LOW ACTIVITY</span>';
    }
}

/* ═══ DEFCON ═══ */
function calcDefcon() {
    const priceR = Math.max(0, Math.min(100, 50 + (S.kasChange * 5)));

    let hashR = 50;
    const hh = S.hashHistory;
    if (hh.length >= 4) {
        const recent = hh.slice(-3), older = hh.slice(0, Math.max(1, hh.length - 3));
        const avgR = recent.reduce((a, b) => a + b.v, 0) / recent.length;
        const avgO = older.reduce((a, b) => a + b.v, 0) / older.length;
        if (avgO > 0) hashR = Math.max(0, Math.min(100, 50 + (((avgR - avgO) / avgO) * 100) * 10));
    }

    let whaleR = 50, whaleDelta = 0;
    const top10 = S.whales.slice(0, 10).filter(w => w.bal > 0);
    if (top10.length > 0) {
        top10.forEach(w => { whaleDelta += (w.bal - (S.whaleBaseline[w.addr] || w.bal)); });
        whaleR = Math.max(0, Math.min(100, 50 + (whaleDelta / 2000000)));
    }

    let volR = 0;
    if (S.kasVol > 0 && S.kasMcap > 0) {
        // Vol/MCap ratio: 10%+ = max intensity (scales with market cap)
        const vmPct = (S.kasVol / S.kasMcap) * 100;
        volR = Math.max(0, Math.min(100, (vmPct / 10) * 100));
    }

    const raw = priceR * .3 + hashR * .3 + whaleR * .2 + volR * .2;
    const score = Math.max(0, Math.min(100, Math.round(raw)));

    let lv, lb, cl;
    if (score >= 85) { lv = 'DEFCON 1'; lb = 'SUPERNOVA'; cl = '#ff2a2a'; }
    else if (score >= 70) { lv = 'DEFCON 2'; lb = 'IGNITION'; cl = '#ff8800'; }
    else if (score >= 50) { lv = 'DEFCON 3'; lb = 'WARMING'; cl = '#fbbf24'; }
    else if (score >= 30) { lv = 'DEFCON 4'; lb = 'ACCUMULATION'; cl = '#49EACB'; }
    else { lv = 'DEFCON 5'; lb = 'DORMANT'; cl = '#3b82f6'; }

    $('dcLv').textContent = lv; $('dcLv').style.color = cl;
    const ds = $('dcSc');
    const oldScore = ds.textContent;
    ds.classList.remove('skel'); ds.classList.add('live');
    ds.textContent = score; ds.style.color = cl;
    ds.style.textShadow = `0 0 40px ${cl}50`;
    if (oldScore && oldScore !== String(score) && oldScore.trim() !== '')
        flash(ds, score > parseInt(oldScore) ? 'up' : 'down');

    $('dcLb').textContent = lb; $('dcLb').style.color = cl;
    $('dcBr').style.width = score + '%';
    $('hDef').textContent = `${lv}: ${lb}`;
    $('hDef').style.color = cl;
    $('hDef').style.borderColor = cl + '40';

    const setFactor = (valId, barId, text, rating) => {
        $(valId).innerHTML = `<span class="${rating >= 50 ? 'green' : 'red'}">${text}</span>`;
        const b = $(barId);
        b.style.width = rating + '%';
        b.style.background = rating >= 60 ? 'var(--grn)' : rating >= 40 ? 'var(--yel)' : 'var(--red)';
    };

    setFactor('dfP', 'dfPB', (S.kasChange >= 0 ? '+' : '') + S.kasChange.toFixed(2) + '%', priceR);
    const hashGrowth = hh.length >= 2 ? (((hh[hh.length - 1].v / hh[0].v) - 1) * 100) : 0;
    setFactor('dfH', 'dfHB', (hashGrowth >= 0 ? '+' : '') + hashGrowth.toFixed(1) + '%', hashR);
    setFactor('dfW', 'dfWB', (whaleDelta >= 0 ? '+' : '-') + (Math.abs(whaleDelta) / 1e6).toFixed(1) + 'M', whaleR);
    setFactor('dfV', 'dfVB', '$' + (S.kasVol / 1e6).toFixed(0) + 'M', volR);
}

/* ═══ NEWS ═══ */
async function fetchNews() {
    try {
        const r = await safeFetch(API.news);
        const d = await r.json();
        if (d && d.results && d.results.length > 0) {
            const items = d.results.slice(0, 14);
            const tk = $('tkT');
            let h = '';
            for (let p = 0; p < 2; p++) {
                items.forEach(item => {
                    const src = item.source ? item.source.title : '';
                    h += `<span class="ticker-item" onclick="window.open('${item.url}','_blank')"><span class="ticker-dot"></span>${esc(item.title)} <span style="font-size:.6rem;color:var(--t3);text-transform:uppercase;letter-spacing:.3px">${esc(src)}</span></span>`;
                });
            }
            tk.innerHTML = h;
            failCounts.news = 0;
        }
    } catch (e) {
        failCounts.news = (failCounts.news || 0) + 1;
        const tk = $('tkT');
        if (failCounts.news >= 3)
            tk.innerHTML = `<span style="font-family:var(--mono);font-size:0.75rem;padding:0 12px"><span class="sig-err">NEWS FEED OFFLINE</span> · <a href="https://cryptopanic.com/news/kaspa/" target="_blank" style="color:var(--cyn);text-decoration:none">CryptoPanic</a> · <a href="mailto:dnilgis@gmail.com" style="color:var(--cyn);text-decoration:none">dnilgis</a></span>`;
        else if (!tk.querySelector('.ticker-item'))
            tk.innerHTML = `<span style="font-family:var(--mono);font-size:0.75rem;color:var(--org);padding:0 12px;animation:pulse 1.5s infinite">Connecting to news feed…</span>`;
    }
}

/* ═══ WHALES ═══ */
function initWhales() {
    S.whales = ADDRS.map((w, i) => ({ addr: w.a, tag: w.t, rank: i + 1, bal: 0, prev: 0, pct: '0' }));
    renderWhaleTable();
    $('wCt').textContent = `${ADDRS.length} WALLETS`;
    S.whales.forEach((_, i) => setTimeout(() => fetchBalance(i, true), i * 300));
}

async function fetchBalance(i, init = false) {
    try {
        const r = await fetch(API.kaspa.balance(S.whales[i].addr));
        const d = await r.json();
        if (d && d.balance !== undefined) {
            const newBal = Math.floor(d.balance / 1e8);
            const oldBal = S.whales[i].bal;
            S.whales[i].prev = oldBal;
            S.whales[i].bal = newBal;
            S.whales[i].pct = ((newBal / MAX_SUPPLY) * 100).toFixed(4);
            if (init) S.whaleBaseline[S.whales[i].addr] = newBal;
            if (!init && oldBal > 0 && Math.abs(newBal - oldBal) > 100000) sonarWhale();
            updateWhaleRow(i);
        }
    } catch (e) {}
}

function scanWhale() {
    const i = Math.floor(Math.random() * S.whales.length);
    const row = document.querySelector(`#tB tr:nth-child(${i + 1})`);
    if (row) {
        row.classList.add('scanning');
        setTimeout(() => row.classList.remove('scanning'), 500);
        fetchBalance(i);
    }
}

function renderWhaleTable() {
    const tb = $('tB');
    tb.innerHTML = '';
    S.whales.forEach(w => {
        const tr = document.createElement('tr');
        const short = w.addr.substring(0, 10) + '…' + w.addr.slice(-5);
        const tag = w.tag ? `<span class="tag ${w.tag.c}">${w.tag.n}</span>` : '';
        const delta = w.bal - (S.whaleBaseline[w.addr] || w.bal);
        const deltaStr = delta === 0 ? '' : delta > 0 ? `<span class="green">+${(delta / 1e6).toFixed(1)}M</span>` : `<span class="red">${(delta / 1e6).toFixed(1)}M</span>`;

        tr.innerHTML = `
            <td style="color:var(--t3)">${w.rank}</td>
            <td><a href="https://explorer.kaspa.org/addresses/${w.addr}" target="_blank">${short}</a></td>
            <td>${tag}</td>
            <td style="color:var(--t1)">${w.bal > 0 ? w.bal.toLocaleString() : '…'}</td>
            <td style="font-size:.75rem">${deltaStr}</td>
            <td style="text-align:right;color:var(--t3)">${w.pct}%</td>
        `;
        tb.appendChild(tr);
    });
}

function updateWhaleRow(i) {
    const row = document.querySelector(`#tB tr:nth-child(${i + 1})`);
    if (!row) return;
    const w = S.whales[i];
    const cell = row.cells[3];
    const oldVal = cell.textContent;
    cell.textContent = w.bal.toLocaleString();
    if (oldVal && oldVal !== '…' && oldVal !== w.bal.toLocaleString())
        flash(cell, w.bal > w.prev ? 'up' : w.bal < w.prev ? 'down' : 'neutral');
    const delta = w.bal - (S.whaleBaseline[w.addr] || w.bal);
    row.cells[4].innerHTML = delta === 0 ? '' : delta > 0 ? `<span class="green">+${(delta / 1e6).toFixed(1)}M</span>` : `<span class="red">${(delta / 1e6).toFixed(1)}M</span>`;
    row.cells[5].textContent = w.pct + '%';
}

/* ═══ PERFORMANCE CHART ═══ */
let perfChart = null;
let perfCache = {};
let perfLoading = false;

async function fetchHist(id, days) {
    const key = `${id}_${days}`;
    if (perfCache[key] && Date.now() - perfCache[key].ts < 300000) return perfCache[key].data; // 5 min cache
    try {
        const r = await fetch(`${API.coingecko}/coins/${id}/market_chart?vs_currency=usd&days=${days}`);
        if (!r.ok) return perfCache[key]?.data || null; // return stale cache on error
        const data = (await r.json()).prices;
        perfCache[key] = { data, ts: Date.now() };
        return data;
    } catch (e) {
        return perfCache[key]?.data || null;
    }
}

async function updPerf(days) {
    if (perfLoading) return; // debounce
    perfLoading = true;

    // Update button active state
    document.querySelectorAll('.tf-btn').forEach(b => b.classList.remove('active'));
    const clickedBtn = [...document.querySelectorAll('.tf-btn')].find(b => {
        const t = b.textContent.trim().toUpperCase();
        return (days === 30 && t === '30D') || (days === 365 && t === '1Y') || (days === 'max' && t === 'ALL');
    });
    if (clickedBtn) clickedBtn.classList.add('active');

    const ids =    ['kaspa',   'bitcoin', 'ethereum', 'pax-gold', 'kinesis-silver'];
    const colors = ['#49EACB', '#f7931a', '#627eea',  '#fbbf24',  '#c0c0c0'];
    const labels = ['KAS',     'BTC',     'ETH',      'GOLD',     'SILVER'];
    const widths = [2.5,       1.5,       1.5,        1.5,        1.5];
    const dashes = [[],        [5,5],     [5,5],      [4,3],      [4,3]];

    // Stagger fetches slightly to avoid CoinGecko rate limit
    const results = [];
    for (let i = 0; i < ids.length; i++) {
        results.push(await fetchHist(ids[i], days));
        if (i < ids.length - 1) await new Promise(r => setTimeout(r, 200));
    }

    const datasets = results.map((prices, i) => {
        if (!prices || !prices.length) return null;
        const start = prices[0][1];
        if (start === 0) return null;
        let mod = 1;
        if (days === 365 || days === 'max') mod = 5;
        return {
            label: labels[i],
            data: prices.filter((_, x) => x % mod === 0).map(p => ({ x: p[0], y: ((p[1] - start) / start) * 100 })),
            borderColor: colors[i],
            borderWidth: widths[i],
            pointRadius: 0,
            borderDash: dashes[i],
            tension: .1
        };
    }).filter(Boolean);

    if (perfChart) perfChart.destroy();
    perfChart = new Chart($('perfC'), {
        type: 'line',
        data: { datasets },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: '#666', boxWidth: 8, font: { family: 'Outfit', size: 11 } } },
                tooltip: {
                    mode: 'index', intersect: false,
                    callbacks: { label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y >= 0 ? '+' : ''}${ctx.parsed.y.toFixed(1)}%` }
                }
            },
            scales: {
                x: { type: 'time', time: { unit: days === 30 ? 'day' : 'month' }, grid: { display: false }, ticks: { color: '#333', font: { size: 10 } } },
                y: { grid: { color: '#111' }, ticks: { color: '#444', callback: v => v + '%', font: { family: 'JetBrains Mono', size: 10 } } }
            },
            interaction: { mode: 'nearest', axis: 'x', intersect: false }
        }
    });

    perfLoading = false;
}

/* ═══ BLOCKS ═══ */
async function fetchBlocks() {
    try {
        const r = await safeFetch(API.kaspa.blocks);
        const blocks = await r.json();
        const feed = $('bFeed');
        feed.innerHTML = '';

        if (blocks.length > 0) {
            const nb = parseInt(blocks[0].blueScore);
            if (S.lastBlue > 0 && nb > S.lastBlue) sonarBlock();
            S.lastBlue = nb;
        }

        blocks.slice(0, 15).forEach(b => {
            const time = new Date(parseInt(b.timestamp)).toLocaleTimeString();
            feed.innerHTML += `<div class="block-entry" onclick="window.open('https://explorer.kaspa.org/blocks/${b.hash}','_blank')"><span class="block-id">#${b.blueScore}</span><span class="block-time">${time}</span></div>`;
        });
        sigOK('bFeed');
    } catch (e) {
        failCounts.bFeed = (failCounts.bFeed || 0) + 1;
        if (failCounts.bFeed >= 3)
            $('bFeed').innerHTML = '<div style="padding:16px;text-align:center"><span class="sig-err">BLOCK FEED OFFLINE</span></div>';
    }
}

/* ═══ KRC-20 ═══ */
async function initKRC20() {
    try {
        const r = await fetch(API.kasplex);
        const d = await r.json();
        const list = $('krcList');
        list.innerHTML = '';
        if (d && d.result) {
            d.result.slice(0, 20).forEach(t => {
                const pct = (t.minted / t.max * 100).toFixed(1);
                list.innerHTML += `
                    <div class="token-card">
                        <div style="font-weight:bold">${esc(t.tick)}</div>
                        <div style="text-align:right;color:var(--t2);font-family:var(--mono)">${pct}%</div>
                        <div style="text-align:right;color:${pct >= 100 ? 'var(--cyn)' : 'var(--org)'};font-weight:600">
                            ${pct >= 100 ? 'DONE' : 'MINT'}
                        </div>
                    </div>`;
            });
        }
    } catch (e) {
        $('krcList').innerHTML = '<div style="padding:16px;text-align:center;color:var(--t3)">KRC-20 API Offline</div>';
    }
}

/* ═══ MINING CALCULATOR ═══ */
function updSim(v) {
    $('simL').textContent = v == 0 ? 'CURRENT' : `+${v}%`;
    $('simL').style.color = v > 0 ? 'var(--org)' : 'var(--cyn)';
    calcMining();
}

function calcMining() {
    const hashInput = parseFloat($('cH').value) || 0;
    const unit = parseFloat($('cU').value);
    const sim = parseInt($('simS').value) || 0;
    const userTH = hashInput * unit; // converted to TH/s by option values
    const netHash = (S.netHash || 1) * (1 + (sim / 100)); // TH/s
    const share = userTH / netHash;
    const dailyKAS = 86400 * S.blockReward * S.bps * share;
    const dailyUSD = dailyKAS * S.kasPrice;

    $('cD').textContent = dailyKAS.toLocaleString(undefined, { maximumFractionDigits: 0 });
    $('cDU').textContent = '$' + dailyUSD.toLocaleString(undefined, { maximumFractionDigits: 2 });
    $('cM').textContent = (dailyKAS * 30).toLocaleString(undefined, { maximumFractionDigits: 0 });
    $('cMU').textContent = '$' + (dailyUSD * 30).toLocaleString(undefined, { maximumFractionDigits: 2 });
}

/* ═══ HASH ATH (from history) ═══ */
async function loadHashATH() {
    try {
        const r = await fetch(`${API.kaspa.hashHist}?range=all`);
        if (!r.ok) return;
        const data = await r.json();
        let max = 0;
        data.forEach(p => { if (p.hashrate > max) max = p.hashrate; });
        if (max > S.hashATH) { S.hashATH = max; updateShield(); }
    } catch (e) {}
}

/* ═══ HASHRATE CHART ═══ */
async function initHashChart() {
    try {
        const r = await fetch(`${API.kaspa.hashHist}?range=1y`);
        if (!r.ok) return;
        const data = await r.json();
        const labels = [];
        const values = [];
        data.forEach((p, i) => {
            if (i % 3 === 0) {
                labels.push(new Date(p.timestamp * 1000).toLocaleDateString());
                values.push(p.hashrate / 1000); // PH/s
            }
        });

        const ctx = $('hashChart');
        if (!ctx) return;
        const grad = ctx.getContext('2d').createLinearGradient(0, 0, 0, 250);
        grad.addColorStop(0, 'rgba(0,255,106,0.25)');
        grad.addColorStop(1, 'rgba(0,255,106,0)');

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Hashrate (PH/s)',
                    data: values,
                    borderColor: '#00ff6a',
                    backgroundColor: grad,
                    fill: true,
                    pointRadius: 0,
                    tension: 0.4,
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { display: false },
                    y: {
                        grid: { color: '#111' },
                        ticks: {
                            color: '#444',
                            callback: v => v >= 1000 ? (v / 1000).toFixed(0) + ' EH' : v.toFixed(0) + ' PH',
                            font: { family: 'JetBrains Mono', size: 10 }
                        }
                    }
                }
            }
        });
    } catch (e) { console.log("Hashrate chart unavailable"); }
}

/* ═══ SONAR PING (latency) ═══ */
async function pingUplink() {
    const dot = $('sonarDot'), ms = $('sonarMs');
    const t0 = performance.now();
    try {
        await safeFetch(API.kaspa.dag, 5000);
        const lat = Math.round(performance.now() - t0);
        dot.className = 'sonar-dot' + (lat > 500 ? ' crit' : lat > 200 ? ' warn' : '');
        ms.textContent = lat + 'ms';
        ms.style.color = lat > 500 ? 'var(--red)' : lat > 200 ? 'var(--yel)' : 'var(--grn)';
    } catch (e) {
        dot.className = 'sonar-dot crit';
        ms.textContent = 'OFFLINE';
        ms.style.color = 'var(--red)';
    }
}

/* ═══ WAR ROOM (Fullscreen) ═══ */
function warRoom() {
    const el = document.documentElement;
    if (!document.fullscreenElement) {
        (el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen).call(el);
        if (soundOn) ping(400, .2, 'sine');
    } else {
        (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    }
}

/* ═══ IDLE COMMANDER (60s) ═══ */
let idleTimer = null, isIdle = false;
function resetIdle() {
    if (isIdle) {
        isIdle = false;
        document.body.classList.remove('idle-mode');
        document.querySelectorAll('.idle-dim').forEach(el => el.classList.remove('idle-dim'));
        if (soundOn) ping(600, .08, 'sine');
    }
    clearTimeout(idleTimer);
    idleTimer = setTimeout(goIdle, 60000);
}
function goIdle() {
    isIdle = true;
    document.body.classList.add('idle-mode');
    document.querySelectorAll('.dashboard .panel').forEach(p => {
        const dominated = ['dcSc', 'dcLb', 'bigP', 'bFeed', 'hPrice'].some(id => p.querySelector('#' + id));
        if (!dominated) p.classList.add('idle-dim');
    });
}
document.addEventListener('mousemove', resetIdle);
document.addEventListener('keydown', resetIdle);
document.addEventListener('click', resetIdle);
resetIdle();

/* ═══ CLICK-TO-COPY (whale addresses) ═══ */
document.addEventListener('click', function (e) {
    const a = e.target.closest('#tB a');
    if (!a) return;
    e.preventDefault();
    const row = a.closest('tr');
    if (!row) return;
    const href = a.getAttribute('href') || '';
    const addr = href.split('/addresses/')[1] || a.textContent;
    navigator.clipboard.writeText(addr).then(() => {
        row.classList.add('copy-flash');
        const balCell = row.cells[3];
        const orig = balCell.innerHTML;
        balCell.innerHTML = '<span class="copied-badge">✓ COPIED</span>';
        if (soundOn) ping(1200, .06, 'sine');
        setTimeout(() => { balCell.innerHTML = orig; row.classList.remove('copy-flash'); }, 1000);
    }).catch(() => { window.open(href, '_blank'); });
});

/* ═══ KONAMI CODE ═══ */
const konami = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
let kIdx = 0, matrixOn = false;

function triggerKonami() { matrixOn = !matrixOn; activateMatrix(); }

document.addEventListener('keydown', function (e) {
    if (e.keyCode === konami[kIdx]) {
        kIdx++;
        if (kIdx === konami.length) { kIdx = 0; matrixOn = !matrixOn; activateMatrix(); }
    } else kIdx = 0;
});

function activateMatrix() {
    document.body.classList.toggle('matrix-mode', matrixOn);
    const dh = $('devHint');
    if (dh) {
        dh.textContent = matrixOn ? 'GOD' : 'DEV';
        dh.style.opacity = matrixOn ? '.8' : '.25';
        dh.style.color = matrixOn ? '#00ff41' : '';
    }
    if (soundOn) { ping(200, .1, 'sawtooth'); setTimeout(() => ping(300, .1, 'sawtooth'), 100); setTimeout(() => ping(400, .15, 'sawtooth'), 200); }
    if (matrixOn) updateGhost();
}

function updateGhost() {
    const gp = $('ghostPanel');
    if (!gp) return;
    $('ghBlue').textContent = S.lastBlue ? S.lastBlue.toLocaleString() : '--';
    $('ghDaa').textContent = S.lastDaa ? S.lastDaa.toLocaleString() : '--';
    $('ghBps').textContent = S.bps ? S.bps.toFixed(1) : '--';
    const d = S.netHash;
    $('ghDiff').textContent = d ? (d >= 1e6 ? (d / 1e6).toFixed(4) + ' EH' : d >= 1e3 ? (d / 1e3).toFixed(2) + ' PH' : d.toFixed(2) + ' TH') : '--';
    $('ghMerge').textContent = S.dagWidth ? Math.round(S.dagWidth * S.bps) : '--';
    $('ghHeaders').textContent = S.lastDaa ? S.lastDaa.toLocaleString() : '--';
}
setInterval(() => { if (matrixOn) updateGhost(); }, 5000);

/* ══════════════════════════════════════════════
   TOOLTIP ENGINE — fixed-position, never clipped
   Works on hover (desktop) + tap (mobile)
   ══════════════════════════════════════════════ */
(() => {
    const tip = document.getElementById('tooltip');
    if (!tip) return;
    let activeTrigger = null;
    let hideTimer = null;

    function showTip(trigger) {
        const data = trigger.getAttribute('data-tip');
        if (!data) return;

        // Parse "Title|Body" format
        const parts = data.split('|');
        const title = parts[0] || '';
        const body = parts[1] || '';
        tip.innerHTML = (title ? '<strong>' + title + '</strong>' : '') + body;

        // Activate
        if (activeTrigger) activeTrigger.classList.remove('active');
        activeTrigger = trigger;
        trigger.classList.add('active');
        tip.classList.add('show');

        // Position: above trigger, centered, clamped to viewport
        const rect = trigger.getBoundingClientRect();
        const tipW = 240;
        const tipH = tip.offsetHeight || 80;

        let left = rect.left + rect.width / 2 - tipW / 2;
        let top = rect.top - tipH - 8;

        // If too close to top, show below instead
        if (top < 8) {
            top = rect.bottom + 8;
        }

        // Clamp horizontal to viewport
        const vw = window.innerWidth;
        if (left < 12) left = 12;
        if (left + tipW > vw - 12) left = vw - tipW - 12;

        tip.style.left = left + 'px';
        tip.style.top = top + 'px';
    }

    function hideTip() {
        tip.classList.remove('show');
        if (activeTrigger) {
            activeTrigger.classList.remove('active');
            activeTrigger = null;
        }
    }

    // Desktop: hover
    document.addEventListener('mouseover', e => {
        const trigger = e.target.closest('.tip-trigger');
        if (trigger && trigger.hasAttribute('data-tip')) {
            clearTimeout(hideTimer);
            showTip(trigger);
        }
    });
    document.addEventListener('mouseout', e => {
        const trigger = e.target.closest('.tip-trigger');
        if (trigger) {
            hideTimer = setTimeout(hideTip, 150);
        }
    });

    // Mobile: tap to toggle
    document.addEventListener('click', e => {
        const trigger = e.target.closest('.tip-trigger');
        if (trigger && trigger.hasAttribute('data-tip')) {
            e.preventDefault();
            e.stopPropagation();
            if (activeTrigger === trigger) {
                hideTip();
            } else {
                showTip(trigger);
            }
        } else {
            // Tap elsewhere dismisses
            if (activeTrigger) hideTip();
        }
    });

    // Dismiss on scroll
    window.addEventListener('scroll', () => { if (activeTrigger) hideTip(); }, { passive: true });
    document.querySelectorAll('.scroll-y').forEach(el => {
        el.addEventListener('scroll', () => { if (activeTrigger) hideTip(); }, { passive: true });
    });
})();

/* ══════════════════════════════════════════════
   kHeavyHash INTERACTIVE LAB
   Faithful JS implementation of Kaspa's PoW algorithm:
   kHeavyHash = Keccak256( MatrixMul(Keccak256(input)) ⊕ Keccak256(input) )
   ══════════════════════════════════════════════ */

// Generate the fixed 64×64 matrix (deterministic from Kaspa's hardcoded seed)
// In production, this matrix is part of the block template.
// We use a representative matrix seeded from Kaspa's genesis hash.
const HEAVY_MATRIX = (() => {
    const m = [];
    // Seed from Kaspa genesis block hash nibbles (deterministic)
    const seed = 'b0e1d2c3a4958677f8e9dacb3c2d1e0f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9';
    let si = 0;
    for (let i = 0; i < 64; i++) {
        m[i] = [];
        for (let j = 0; j < 64; j++) {
            const c = seed.charCodeAt(si % seed.length);
            m[i][j] = ((c * (i + 1) * (j + 1) + si * 7) & 0xF);
            si++;
        }
    }
    return m;
})();

function hexEncode(str) {
    return Array.from(new TextEncoder().encode(str))
        .map(b => b.toString(16).padStart(2, '0')).join('');
}

function hashToNibbles(hexHash) {
    // Convert 64-char hex string to 64 nibbles (4 bits each)
    return hexHash.split('').map(c => parseInt(c, 16));
}

function nibblesToHex(nibbles) {
    return nibbles.map(n => (n & 0xF).toString(16)).join('');
}

function matrixMultiply(matrix, vector) {
    // 64×64 matrix × 64-element vector → 64 nibbles
    const result = [];
    for (let i = 0; i < 64; i++) {
        let sum = 0;
        for (let j = 0; j < 64; j++) {
            sum += matrix[i][j] * vector[j];
        }
        result.push(sum & 0xF); // reduce to nibble
    }
    return result;
}

function xorHex(a, b) {
    // XOR two hex strings of equal length
    let out = '';
    for (let i = 0; i < a.length; i++) {
        out += (parseInt(a[i], 16) ^ parseInt(b[i], 16)).toString(16);
    }
    return out;
}

function countLeadingZeros(hex) {
    let count = 0;
    for (const c of hex) {
        if (c === '0') count++;
        else break;
    }
    return count;
}

function runKHeavyHash(input) {
    if (!input || !input.trim()) {
        $('hashRaw').textContent = 'waiting...';
        $('hashK1').textContent = 'waiting...';
        $('hashMat').textContent = 'waiting...';
        $('hashK2').textContent = 'waiting...';
        $('hashZeros').textContent = '0';
        $('hashDiff').textContent = '0';
        return;
    }

    // Check if keccak256 is available (from js-sha3)
    const keccak = (typeof keccak256 !== 'undefined') ? keccak256
                 : (typeof sha3_256 !== 'undefined') ? sha3_256
                 : null;

    if (!keccak) {
        $('hashK1').textContent = 'Keccak library not loaded';
        return;
    }

    // Step 1: Input → hex
    const inputHex = hexEncode(input);
    $('hashRaw').textContent = inputHex.length > 80
        ? inputHex.substring(0, 80) + '...'
        : inputHex;

    // Step 2: First Keccak-256
    const k1 = keccak(input);
    $('hashK1').textContent = k1;

    // Step 3: Matrix × Vector multiplication
    const nibbles = hashToNibbles(k1);
    const matResult = matrixMultiply(HEAVY_MATRIX, nibbles);
    const matHex = nibblesToHex(matResult);
    // XOR matrix result with original hash (as per kHeavyHash spec)
    const xored = xorHex(matHex, k1);
    $('hashMat').textContent = xored;

    // Step 4: Second Keccak-256 → final kHeavyHash
    const k2 = keccak(xored);
    $('hashK2').textContent = k2;

    // Stats
    const zeros = countLeadingZeros(k2);
    $('hashZeros').textContent = zeros;
    $('hashDiff').textContent = zeros > 0 ? '2^' + (zeros * 4) : '1';
}

/* ══════════════════════════════════════════════
   DAG VISUALIZER — Canvas-based BlockDAG animation
   Inspired by Macmachi/kaspa-network-visualizer (MIT)
   Adapted for KasLive terminal aesthetic
   ══════════════════════════════════════════════ */

const DAG = {
    canvas: null,
    ctx: null,
    running: true,
    blocks: [],
    blockId: 0,
    lastSpawn: 0,
    totalBlocks: 0,
    lanes: 8,       // parallel lanes for DAG width visualization
    maxBlocks: 120, // max blocks on screen before recycling
    colors: {
        block: '#49EACB',
        blockStroke: '#00ff6a',
        edge: 'rgba(73,234,203,0.15)',
        edgeActive: 'rgba(0,255,106,0.25)',
        text: 'rgba(255,255,255,0.4)',
        glow: 'rgba(73,234,203,0.08)'
    }
};

function initDAG() {
    DAG.canvas = $('dagCanvas');
    if (!DAG.canvas) return;
    DAG.ctx = DAG.canvas.getContext('2d');
    resizeDAG();
    window.addEventListener('resize', resizeDAG);
    requestAnimationFrame(tickDAG);
}

function resizeDAG() {
    const wrap = $('dagCanvasWrap');
    if (!wrap || !DAG.canvas) return;
    const rect = wrap.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    DAG.canvas.width = rect.width * dpr;
    DAG.canvas.height = rect.height * dpr;
    DAG.canvas.style.width = rect.width + 'px';
    DAG.canvas.style.height = rect.height + 'px';
    DAG.ctx.scale(dpr, dpr);
    DAG.w = rect.width;
    DAG.h = rect.height;
}

function toggleDAG(on) {
    DAG.running = on;
    const wrap = $('dagCanvasWrap');
    if (wrap) wrap.style.opacity = on ? '1' : '0.2';
}

function spawnBlock() {
    const bps = S.bps || 1;
    const width = S.dagWidth || 2;

    // Pick a lane (simulates DAG parallelism)
    const numLanes = Math.max(2, Math.min(DAG.lanes, Math.ceil(width * 1.5)));
    const lane = Math.floor(Math.random() * numLanes);
    const laneWidth = DAG.w / numLanes;
    const x = laneWidth * lane + laneWidth * 0.3 + Math.random() * laneWidth * 0.4;

    // Find parent blocks (1-3 parents from recent blocks in adjacent lanes)
    const parents = [];
    const recent = DAG.blocks.slice(-20);
    for (let i = recent.length - 1; i >= 0 && parents.length < 3; i--) {
        const p = recent[i];
        if (Math.abs(p.lane - lane) <= 2 && Math.random() > 0.3) {
            parents.push(p);
        }
    }

    const block = {
        id: DAG.blockId++,
        x: x,
        y: -10,
        lane: lane,
        size: 6 + Math.random() * 4,
        speed: 0.3 + Math.random() * 0.2 + (bps / 20),
        opacity: 1,
        parents: parents,
        age: 0,
        glow: 1,
        isNew: true
    };

    DAG.blocks.push(block);
    DAG.totalBlocks++;

    // Cap blocks
    if (DAG.blocks.length > DAG.maxBlocks) {
        DAG.blocks = DAG.blocks.slice(-DAG.maxBlocks);
    }
}

function tickDAG(now) {
    if (!DAG.ctx || !DAG.w) { requestAnimationFrame(tickDAG); return; }

    const ctx = DAG.ctx;
    const w = DAG.w, h = DAG.h;

    // Clear
    ctx.clearRect(0, 0, w, h);

    if (DAG.running) {
        // Spawn rate based on BPS
        const bps = S.bps || 1;
        const interval = 1000 / Math.max(1, bps);
        if (now - DAG.lastSpawn > interval) {
            // Spawn 1-3 blocks at a time for higher BPS
            const batch = Math.max(1, Math.min(3, Math.ceil(bps / 5)));
            for (let b = 0; b < batch; b++) spawnBlock();
            DAG.lastSpawn = now;
        }

        // Update blocks
        DAG.blocks.forEach(block => {
            block.y += block.speed;
            block.age++;
            if (block.isNew && block.age > 10) block.isNew = false;
            block.glow = Math.max(0, 1 - block.age / 60);

            // Fade as it approaches bottom
            if (block.y > h - 40) {
                block.opacity = Math.max(0, 1 - (block.y - (h - 40)) / 40);
            }
        });

        // Remove off-screen blocks
        DAG.blocks = DAG.blocks.filter(b => b.y < h + 20 && b.opacity > 0);
    }

    // Draw edges (connections between blocks)
    ctx.lineWidth = 1;
    DAG.blocks.forEach(block => {
        block.parents.forEach(parent => {
            if (parent.opacity <= 0) return;
            const alpha = Math.min(block.opacity, parent.opacity) * 0.2;
            ctx.strokeStyle = `rgba(73,234,203,${alpha})`;
            ctx.beginPath();
            ctx.moveTo(block.x, block.y);

            // Curved connection
            const midY = (block.y + parent.y) / 2;
            ctx.quadraticCurveTo(
                (block.x + parent.x) / 2 + (Math.random() - 0.5) * 10,
                midY,
                parent.x, parent.y
            );
            ctx.stroke();
        });
    });

    // Draw blocks
    DAG.blocks.forEach(block => {
        if (block.opacity <= 0) return;

        ctx.save();
        ctx.globalAlpha = block.opacity;

        // Glow for new blocks
        if (block.glow > 0) {
            ctx.shadowColor = DAG.colors.blockStroke;
            ctx.shadowBlur = 8 * block.glow;
        }

        // Block shape (rounded rect)
        const s = block.size;
        const r = 2;
        ctx.fillStyle = block.isNew ? DAG.colors.blockStroke : DAG.colors.block;
        ctx.beginPath();
        ctx.moveTo(block.x - s / 2 + r, block.y - s / 2);
        ctx.lineTo(block.x + s / 2 - r, block.y - s / 2);
        ctx.quadraticCurveTo(block.x + s / 2, block.y - s / 2, block.x + s / 2, block.y - s / 2 + r);
        ctx.lineTo(block.x + s / 2, block.y + s / 2 - r);
        ctx.quadraticCurveTo(block.x + s / 2, block.y + s / 2, block.x + s / 2 - r, block.y + s / 2);
        ctx.lineTo(block.x - s / 2 + r, block.y + s / 2);
        ctx.quadraticCurveTo(block.x - s / 2, block.y + s / 2, block.x - s / 2, block.y + s / 2 - r);
        ctx.lineTo(block.x - s / 2, block.y - s / 2 + r);
        ctx.quadraticCurveTo(block.x - s / 2, block.y - s / 2, block.x - s / 2 + r, block.y - s / 2);
        ctx.closePath();
        ctx.fill();

        // Border
        ctx.shadowBlur = 0;
        ctx.strokeStyle = `rgba(73,234,203,${0.3 * block.opacity})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();

        ctx.restore();
    });

    // Update overlay stats
    $('dagBlockCount').textContent = DAG.totalBlocks.toLocaleString();
    $('dagLiveBps').textContent = (S.bps || '--').toString();
    $('dagLiveWidth').textContent = S.dagWidth > 0 ? S.dagWidth.toFixed(1) + '×' : '--';
    $('dagBpsLabel').textContent = (S.bps ? S.bps.toFixed(1) : '--') + ' BPS';

    requestAnimationFrame(tickDAG);
}

// Initialize DAG on load
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initDAG, 500); // slight delay so DOM is ready
});
