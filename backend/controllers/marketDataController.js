const axios = require('axios');

class MarketDataController {
  constructor() {
    this.apiKey = process.env.INDIAN_API_KEY;
    this.baseUrl = 'https://api.indianapi.in/v1';
    this.axios = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async getCurrentPrice(symbol) {
    try {
      const response = await this.axios.get(`/stocks/${symbol}/quote`);
      return response.data.lastPrice;
    } catch (error) {
      console.error('Error fetching current price:', error);
      throw error;
    }
  }

  async getHistoricalData(symbol, period) {
    try {
      const response = await this.axios.get(`/stocks/${symbol}/historical`, {
        params: { period }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching historical data:', error);
      throw error;
    }
  }

  async getMarketIndicators() {
    try {
      const response = await this.axios.get('/market/indicators');
      return response.data;
    } catch (error) {
      console.error('Error fetching market indicators:', error);
      throw error;
    }
  }

  async updatePrices(investments) {
    try {
      const updates = await Promise.all(
        investments.map(async (investment) => {
          if (investment.investmentType === 'STOCK') {
            const currentPrice = await this.getCurrentPrice(investment.symbol);
            investment.currentPrice = currentPrice;
            await investment.save();
            return {
              investmentId: investment.investmentId,
              symbol: investment.symbol,
              currentPrice,
              previousPrice: investment.currentPrice,
              changePercent: ((currentPrice - investment.purchasePrice) / investment.purchasePrice) * 100
            };
          }
          return null;
        })
      );

      return updates.filter(update => update !== null);
    } catch (error) {
      console.error('Error updating prices:', error);
      throw error;
    }
  }

  async getVolumeData(symbol) {
    try {
      const response = await this.axios.get(`/stocks/${symbol}/volume`);
      return response.data;
    } catch (error) {
      console.error('Error fetching volume data:', error);
      throw error;
    }
  }

  // Additional methods for bonds and gold prices can be added here
}

// Create a singleton instance
const marketDataController = new MarketDataController();

module.exports = marketDataController;