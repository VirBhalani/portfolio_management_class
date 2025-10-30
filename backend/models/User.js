const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  investmentGoals: [{
    type: String
  }],
  registrationDate: {
    type: Date,
    default: Date.now
  },
  portfolios: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Portfolio'
  }]
}, {
  timestamps: true
});

// Methods
userSchema.methods.createPortfolio = async function(portfolioData) {
  const Portfolio = mongoose.model('Portfolio');
  const portfolio = new Portfolio({
    ...portfolioData,
    userId: this._id
  });
  await portfolio.save();
  this.portfolios.push(portfolio._id);
  await this.save();
  return portfolio;
};

userSchema.methods.updateProfile = async function(updateData) {
  Object.assign(this, updateData);
  return await this.save();
};

userSchema.methods.getRiskProfile = function() {
  return {
    riskTolerance: this.riskTolerance,
    investmentGoals: this.investmentGoals,
    portfolioCount: this.portfolios.length
  };
};

const User = mongoose.model('User', userSchema);

module.exports = User;