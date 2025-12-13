// Configuration for APIs
const API_ENDPOINTS = {
    price: 'https://api.coingecko.com/api/v3/simple/price?ids=kaspa&vs_currencies=usd&include_24hr_change=true',
    // Kaspa Official API endpoints
    supply: 'https://api.kaspa.org/info/coinsupply',
    hashrate: 'https://api.kaspa.org/info/hashrate',
    reward: 'https://api.kaspa.org/info/blockreward'
};

// Main function to fetch and update all data
async function updateDashboard() {
    try {
        await Promise.all([
            fetchPrice(),
            fetchNetworkStats()
        ]);
    } catch (error) {
        console.error("Error updating dashboard:", error);
    }
}

// 1. Fetch Price from CoinGecko
async function fetchPrice() {
    try {
        const response = await fetch(API_ENDPOINTS.price);
        const data = await response.json();
        
        const price = data.kaspa.usd;
        const change = data.kaspa.usd_24h_change;

        // Update DOM
        document.getElementById('price-display').innerText = `$${price.toFixed(4)}`;
        
        // Colorize the percentage change (Green if up, Red if down)
        const changeElement = document.getElementById('price-change');
        changeElement.innerText = `${change.toFixed(2)}% (24h)`;
        changeElement.style.color = change >= 0 ? '#4ade80' : '#f87171';

    } catch (error) {
        console.error("Price fetch failed", error);
    }
}

// 2. Fetch Network Stats from Kaspa API
async function fetchNetworkStats() {
    try {
        // Fetch Supply
        const supplyRes = await fetch(API_ENDPOINTS.supply);
        const supplyData = await supplyRes.json();
        const circulating = Math.round(supplyData.circulatingSupply);
        document.getElementById('supply-display').innerText = circulating.toLocaleString() + ' KAS';

        // Fetch Hashrate
        const hashRes = await fetch(API_ENDPOINTS.hashrate);
        const hashData = await hashRes.json();
        // Convert to Petahash (PH/s) or Exahash (EH/s) roughly
        const hashratePH = (hashData.hashrate / 1000).toFixed(2); 
        document.getElementById('hashrate-display').innerText = `${hashratePH} PH/s`;

        // Fetch Block Reward
        const rewardRes = await fetch(API_ENDPOINTS.reward);
        const rewardData = await rewardRes.json();
        document.getElementById('reward-display').innerText = `${rewardData.blockreward.toFixed(2)} KAS`;

    } catch (error) {
        console.error("Network stats failed", error);
    }
}

// Run immediately on load
updateDashboard();

// Refresh every 30 seconds
setInterval(updateDashboard, 30000);
