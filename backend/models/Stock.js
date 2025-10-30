const mongoose = require('mongoose');
const Investment = require('./Investment');

const stockSchema = new mongoose.Schema({
  sector: {
    type: String,
    required: true
  },
  marketCap: {
    type: String,
    required: true
  },
  dividendYield: {
    type: Number,
    default: 0
  },
  beta: {
    type: Number,
    required: true
  },
  pe_ratio: {
    type: Number,
    required: true
  }
});

// Methods
stockSchema.methods.getDividendIncome = function() {
  return (this.dividendYield / 100) * this.getCurrentValue();
};

stockSchema.methods.getBetaRisk = function() {
  return this.beta;
};

stockSchema.methods.getSectorAnalysis = function() {
  return {
    sector: this.sector,
    beta: this.beta,
    peRatio: this.pe_ratio,
    marketCapitalization: this.marketCap
  };
};

const Stock = Investment.discriminator('STOCK', stockSchema);

module.exports = Stock;