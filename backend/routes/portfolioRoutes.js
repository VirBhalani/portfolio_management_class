const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createPortfolio,
  getPortfolio,
  addInvestment,
  removeInvestment,
  getPortfolioAnalytics,
  optimizePortfolio
} = require('../controllers/portfolioController');

// All routes require authentication
router.use(auth);

// Portfolio routes
router.post('/', createPortfolio);
router.get('/:portfolioId', getPortfolio);
router.get('/:portfolioId/analytics', getPortfolioAnalytics);
router.post('/:portfolioId/optimize', optimizePortfolio);

// Investment routes
router.post('/:portfolioId/investments', addInvestment);
router.delete('/:portfolioId/investments/:investmentId', removeInvestment);

module.exports = router;