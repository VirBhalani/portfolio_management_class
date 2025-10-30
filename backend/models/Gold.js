const mongoose = require('mongoose');
const Investment = require('./Investment');

const goldSchema = new mongoose.Schema({
  purity: {
    type: String,
    required: true
  },
  weight: {
    type: Number,
    required: true
  },
  goldType: {
    type: String,
    required: true,
    enum: ['PHYSICAL', 'ETF', 'SOVEREIGN']
  },
  storageLocation: {
    type: String,
    required: true
  }
});

// Methods
goldSchema.methods.calculateStorageCost = function() {
  const baseStorageCost = 0.5; // 0.5% per annum
  return (this.getCurrentValue() * baseStorageCost) / 100;
};

goldSchema.methods.getPurityValue = function() {
  const purityToKarat = {
    '24K': 1,
    '22K': 0.916,
    '18K': 0.75,
    '14K': 0.585
  };
  return (purityToKarat[this.purity] || 1) * this.getCurrentValue();
};

goldSchema.methods.getMarketTrend = function() {
  return {
    purity: this.purity,
    weight: this.weight,
    currentValue: this.getCurrentValue(),
    pricePerGram: this.currentPrice,
    type: this.goldType
  };
};

const Gold = Investment.discriminator('GOLD', goldSchema);

module.exports = Gold;