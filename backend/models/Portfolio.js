const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  portfolioId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  totalValue: {
    type: Number,
    default: 0
  },
  creationDate: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  targetAllocation: {
    type: Map,
    of: Number,
    default: new Map()
  },
  investments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Investment'
  }],
  performanceTracker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PerformanceTracker'
  }
}, {
  timestamps: true
});

// Methods
portfolioSchema.methods.addInvestment = async function(investment) {
  this.investments.push(investment._id);
  await this.save();
  await this.updateTotalValue();
};

portfolioSchema.methods.removeInvestment = async function(investmentId) {
  this.investments = this.investments.filter(id => id.toString() !== investmentId);
  await this.save();
  await this.updateTotalValue();
};

portfolioSchema.methods.calculateTotalReturn = async function() {
  await this.populate('investments');
  const initialValue = this.investments.reduce((total, inv) => 
    total + (inv.purchasePrice * inv.quantity), 0);
  const currentValue = this.investments.reduce((total, inv) => 
    total + (inv.currentPrice * inv.quantity), 0);
  return ((currentValue - initialValue) / initialValue) * 100;
};

portfolioSchema.methods.updateTotalValue = async function() {
  await this.populate('investments');
  this.totalValue = this.investments.reduce((total, inv) => 
    total + (inv.currentPrice * inv.quantity), 0);
  this.lastUpdated = new Date();
  await this.save();
};

portfolioSchema.methods.optimizePortfolio = async function() {
  // This will be implemented with the MLAnalyzer
  // For now, return current allocation
  return this.getAssetAllocation();
};

portfolioSchema.methods.rebalance = async function() {
  const currentAllocation = await this.getAssetAllocation();
  // Compare with target allocation and suggest trades
  // This will be enhanced with the MLAnalyzer
  return {
    currentAllocation,
    targetAllocation: this.targetAllocation,
    suggestedTrades: []
  };
};

portfolioSchema.methods.getAssetAllocation = async function() {
  await this.populate('investments');
  const allocation = new Map();
  
  this.investments.forEach(inv => {
    const type = inv.investmentType;
    const value = inv.currentPrice * inv.quantity;
    allocation.set(type, (allocation.get(type) || 0) + value);
  });

  // Convert to percentages
  for (let [type, value] of allocation) {
    allocation.set(type, (value / this.totalValue) * 100);
  }

  return Object.fromEntries(allocation);
};

const Portfolio = mongoose.model('Portfolio', portfolioSchema);

module.exports = Portfolio;