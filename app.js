// Configuration for APIs
const API_ENDPOINTS = {
    price: 'https://api.coingecko.com/api/v3/simple/price?ids=kaspa&vs_currencies=usd&include_24hr_change=true',
    history: 'https://api.coingecko.com/api/v3/coins/kaspa/market_chart?vs_currency=usd&days=7', // 7 Days History
    supply: 'https://api.kaspa.org/info/coinsupply',
    hashrate: 'https://api.kaspa.org/info/hashrate',
    reward: 'https://api.kaspa.org/info/blockreward'
};

let kasPriceChart = null; // Store chart instance

// Main function
async function updateDashboard() {
    try {
        await Promise.all([
            fetchPrice(),
            fetchNetworkStats(),
        ]);
        // We only need to load the chart once or less frequently
        if (!kasPriceChart) {
            await fetchAndRenderChart();
        }
    } catch (error) {
        console.error("Error updating dashboard:", error);
    }
}

// 1. Fetch Price
async function fetchPrice() {
    try {
        const response = await fetch(API_ENDPOINTS.price);
        const data = await response.json();
        const price = data.kaspa.usd;
        const change = data.kaspa.usd_24h_change;

        document.getElementById('price-display').innerText = `$${price.toFixed(4)}`;
        const changeElement = document.getElementById('price-change');
        changeElement.innerText = `${change.toFixed(2)}% (24h)`;
        changeElement.style.color = change >= 0 ? '#4ade80' : '#f87171';
    } catch (error) { console.error("Price fetch failed", error); }
}

// 2. Fetch Network Stats
async function fetchNetworkStats() {
    try {
        // Supply
        const supplyRes = await fetch(API_ENDPOINTS.supply);
        const supplyData = await supplyRes.json();
        const circulating = Math.round(supplyData.circulatingSupply);
        document.getElementById('supply-display').innerText = (circulating / 1000000000).toFixed(2) + ' B'; // Billions

        // Hashrate
        const hashRes = await fetch(API_ENDPOINTS.hashrate);
        const hashData = await hashRes.json();
        const hashratePH = (hashData.hashrate / 1000).toFixed(2); 
        document.getElementById('hashrate-display').innerText = `${hashratePH} PH/s`;

        // Reward
        const rewardRes = await fetch(API_ENDPOINTS.reward);
        const rewardData = await rewardRes.json();
        document.getElementById('reward-display').innerText = `${rewardData.blockreward.toFixed(2)} KAS`;

    } catch (error) { console.error("Network stats failed", error); }
}

// 3. Render Chart
async function fetchAndRenderChart() {
    try {
        const response = await fetch(API_ENDPOINTS.history);
        const data = await response.json();
        
        // Format data for Chart.js [timestamp, price]
        const prices = data.prices;
        const labels = prices.map(item => {
            let date = new Date(item[0]);
            return date.toLocaleDateString(); // Simple date format
        });
        const pricePoints = prices.map(item => item[1]);

        const ctx = document.getElementById('priceChart').getContext('2d');
        
        // Create Gradient for that "Cyber" look
        let gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(74, 222, 128, 0.5)'); // Green top
        gradient.addColorStop(1, 'rgba(74, 222, 128, 0.0)'); // Fade to transparent

        kasPriceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Price (USD)',
                    data: pricePoints,
                    borderColor: '#4ade80', // Matrix Green
                    backgroundColor: gradient,
                    borderWidth: 2,
                    pointRadius: 0, // Smooth line, no dots
                    fill: true,
                    tension: 0.4 // Smooth curves
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false } // Hide legend for cleaner look
                },
                scales: {
                    x: { 
                        display: false // Hide X-axis labels for "sparkline" look
                    },
                    y: {
                        ticks: { color: '#94a3b8' },
                        grid: { color: '#334155' }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index',
                },
            }
        });

    } catch (error) {
        console.error("Chart failed to load", error);
    }
}

// Init
updateDashboard();
setInterval(updateDashboard, 30000);
