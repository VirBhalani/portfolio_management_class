const Portfolio = require('../models/Portfolio');
const Investment = require('../models/Investment');
const Stock = require('../models/Stock');
const Bond = require('../models/Bond');
const Gold = require('../models/Gold');
const riskAssessment = require('../services/riskAssessment');
const realTimeService = require('../services/realTimeService');

// Default user ID for no-auth mode
const DEFAULT_USER_ID = 'default-user';

exports.createPortfolio = async (req, res) => {
  try {
    const { name, targetAllocation } = req.body;
    const userId = req.user?._id || DEFAULT_USER_ID;

    const portfolio = new Portfolio({
      portfolioId: 'PORT' + Date.now(),
      name,
      userId,
      targetAllocation
    });

    await portfolio.save();

    res.status(201).json({
      message: 'Portfolio created successfully',
      portfolio
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getPortfolio = async (req, res) => {
  try {
    const userId = req.user?._id || DEFAULT_USER_ID;
    
    // If no portfolioId, return all portfolios for the user
    if (!req.params.portfolioId) {
      const portfolios = await Portfolio.find({ userId }).populate('investments');
      
      // Update total value for each portfolio
      for (const portfolio of portfolios) {
        await portfolio.updateTotalValue();
      }
      
      return res.json(portfolios);
    }
    
    // Get single portfolio
    const portfolio = await Portfolio.findOne({
      portfolioId: req.params.portfolioId,
      userId
    }).populate('investments');

    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    await portfolio.updateTotalValue();

    res.json(portfolio);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.addInvestment = async (req, res) => {
  try {
    const { type, symbol, quantity, purchasePrice, ...investmentData } = req.body;
    const portfolio = await Portfolio.findOne({
      portfolioId: req.params.portfolioId,
      userId: req.user?._id || DEFAULT_USER_ID
    });

    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    let InvestmentModel;
    switch (type.toUpperCase()) {
      case 'STOCK':
        InvestmentModel = Stock;
        break;
      case 'BOND':
        InvestmentModel = Bond;
        break;
      case 'GOLD':
        InvestmentModel = Gold;
        break;
      default:
        return res.status(400).json({ message: 'Invalid investment type' });
    }

    const investment = new InvestmentModel({
      investmentId: type.toUpperCase() + Date.now(),
      symbol,
      quantity,
      purchasePrice,
      currentPrice: purchasePrice, // Will be updated with real-time data
      ...investmentData
    });

    await investment.save();
    await portfolio.addInvestment(investment);

    res.status(201).json({
      message: 'Investment added successfully',
      investment,
      portfolioValue: portfolio.totalValue
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.removeInvestment = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({
      portfolioId: req.params.portfolioId,
      userId: req.user?._id || DEFAULT_USER_ID
    });

    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    await portfolio.removeInvestment(req.params.investmentId);
    await Investment.findOneAndDelete({ investmentId: req.params.investmentId });

    res.json({
      message: 'Investment removed successfully',
      portfolioValue: portfolio.totalValue
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getPortfolioAnalytics = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({
      portfolioId: req.params.portfolioId,
      userId: req.user?._id || DEFAULT_USER_ID
    }).populate('investments');

    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    const totalReturn = await portfolio.calculateTotalReturn();
    const assetAllocation = await portfolio.getAssetAllocation();

    const analytics = {
      totalValue: portfolio.totalValue,
      totalReturn,
      assetAllocation,
      lastUpdated: portfolio.lastUpdated,
      investmentCount: portfolio.investments.length,
      riskMetrics: {
        // Will be enhanced with RiskAssessment service
        diversificationScore: Object.keys(assetAllocation).length / 3, // Simple diversification score
        volatility: 0 // Will be calculated by RiskAssessment service
      }
    };

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.optimizePortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({
      portfolioId: req.params.portfolioId,
      userId: req.user?._id || DEFAULT_USER_ID
    }).populate('investments');

    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    const optimization = await portfolio.optimizePortfolio();
    const rebalancing = await portfolio.rebalance();

    res.json({
      currentAllocation: optimization,
      targetAllocation: portfolio.targetAllocation,
      rebalancingSuggestions: rebalancing.suggestedTrades
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};