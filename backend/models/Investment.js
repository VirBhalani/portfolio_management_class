const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
  investmentId: {
    type: String,
    required: true,
    unique: true
  },
  symbol: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  purchasePrice: {
    type: Number,
    required: true
  },
  currentPrice: {
    type: Number,
    required: true
  },
  purchaseDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  investmentType: {
    type: String,
    required: true,
    enum: ['STOCK', 'BOND', 'GOLD']
  }
}, {
  discriminatorKey: 'investmentType',
  timestamps: true
});

// Methods
investmentSchema.methods.calculateReturn = function() {
  return ((this.currentPrice - this.purchasePrice) / this.purchasePrice) * 100;
};

investmentSchema.methods.getCurrentValue = function() {
  return this.currentPrice * this.quantity;
};

investmentSchema.methods.getPerformanceMetrics = function() {
  return {
    totalReturn: this.calculateReturn(),
    currentValue: this.getCurrentValue(),
    profitLoss: (this.currentPrice - this.purchasePrice) * this.quantity
  };
};

const Investment = mongoose.model('Investment', investmentSchema);

module.exports = Investment;