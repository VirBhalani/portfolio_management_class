const axios = require('axios');

const ALPHA_VANTAGE_API_KEY = 'R6CUSRW9HOVVHL24';
const RISK_THRESHOLD_GOLD = 0.30; // 30% threshold for gold allocation

async function fetchStockPrice(symbol) {
    try {
        const response = await axios.get(
            `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
        );
        if (response.data['Global Quote']) {
            return parseFloat(response.data['Global Quote']['05. price']);
        }
        throw new Error('Invalid response from Alpha Vantage');
    } catch (error) {
        console.error(`Error fetching stock price for ${symbol}:`, error.message);
        throw error;
    }
}

function calculatePortfolioAllocation(portfolio) {
    const total = portfolio.investments.reduce((sum, inv) => sum + (inv.quantity * inv.currentPrice), 0);
    
    // Calculate allocations by type
    const allocations = {
        STOCK: 0,
        BOND: 0,
        GOLD: 0
    };

    portfolio.investments.forEach(inv => {
        const value = inv.quantity * inv.currentPrice;
        allocations[inv.type] = (allocations[inv.type] || 0) + (value / total * 100);
    });

    // Only check for gold allocation risk
    const riskAlerts = [];
    if (allocations.GOLD > RISK_THRESHOLD_GOLD * 100) {
        riskAlerts.push({
            type: 'WARNING',
            message: `Warning: Gold allocation (${allocations.GOLD.toFixed(2)}%) exceeds 30% threshold`
        });
    }

    return {
        total,
        allocations,
        riskAlerts
    };
}

async function updatePortfolioPrices(portfolio) {
    for (let investment of portfolio.investments) {
        try {
            if (investment.type === 'STOCK') {
                investment.currentPrice = await fetchStockPrice(investment.symbol);
            }
            // For GOLD and BONDS, we'll keep the current price as is
            // In a real application, you'd want to fetch real-time prices for these as well
        } catch (error) {
            console.error(`Error updating price for ${investment.symbol}:`, error.message);
        }
    }
    return portfolio;
}

module.exports = {
    calculatePortfolioAllocation,
    updatePortfolioPrices,
    fetchStockPrice
};