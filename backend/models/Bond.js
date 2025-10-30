const mongoose = require('mongoose');
const Investment = require('./Investment');

const bondSchema = new mongoose.Schema({
  maturityDate: {
    type: Date,
    required: true
  },
  couponRate: {
    type: Number,
    required: true
  },
  faceValue: {
    type: Number,
    required: true
  },
  creditRating: {
    type: String,
    required: true
  },
  bondType: {
    type: String,
    required: true,
    enum: ['GOVERNMENT', 'CORPORATE', 'MUNICIPAL', 'ZERO_COUPON']
  }
});

// Methods
bondSchema.methods.calculateYieldToMaturity = function() {
  const timeToMaturity = (this.maturityDate - new Date()) / (1000 * 60 * 60 * 24 * 365);
  return ((this.faceValue - this.purchasePrice) / this.purchasePrice) / timeToMaturity * 100;
};

bondSchema.methods.getCouponPayment = function() {
  return (this.couponRate / 100) * this.faceValue;
};

bondSchema.methods.getCreditRisk = function() {
  const riskLevels = {
    'AAA': 'LOW',
    'AA': 'LOW',
    'A': 'MEDIUM',
    'BBB': 'MEDIUM',
    'BB': 'HIGH',
    'B': 'HIGH',
    'CCC': 'VERY_HIGH',
    'CC': 'VERY_HIGH',
    'C': 'VERY_HIGH',
    'D': 'DEFAULT'
  };
  return riskLevels[this.creditRating] || 'UNKNOWN';
};

const Bond = Investment.discriminator('BOND', bondSchema);

module.exports = Bond;