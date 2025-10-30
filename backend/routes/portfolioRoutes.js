const express = require('express');
const router = express.Router();
// const auth = require('../middleware/auth'); // Authentication disabled
const {
  createPortfolio,
  getPortfolio,
  addInvestment,
  removeInvestment,
  getPortfolioAnalytics,
  optimizePortfolio
} = require('../controllers/portfolioController');

// All routes require authentication - DISABLED FOR DIRECT ACCESS
// router.use(auth);

// Portfolio routes
router.get('/', getPortfolio); // Get all portfolios for default user
router.post('/', createPortfolio);
router.get('/:portfolioId', getPortfolio);
router.get('/:portfolioId/analytics', getPortfolioAnalytics);
router.post('/:portfolioId/optimize', optimizePortfolio);

// Investment routes
router.post('/:portfolioId/investments', addInvestment);
router.delete('/:portfolioId/investments/:investmentId', removeInvestment);

module.exports = router;