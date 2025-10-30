// Advanced Risk Analysis Service

/**
 * Calculate Value at Risk (VaR) using historical simulation
 * @param {Array} returns - Array of historical returns
 * @param {number} confidenceLevel - Confidence level (e.g., 0.95 for 95%)
 * @returns {number} VaR value
 */
function calculateVaR(returns, confidenceLevel = 0.95) {
  if (!returns || returns.length === 0) return 0;
  const sorted = [...returns].sort((a, b) => a - b);
  const index = Math.floor((1 - confidenceLevel) * sorted.length);
  return Math.abs(sorted[index] || 0);
}

/**
 * Calculate Conditional Value at Risk (CVaR/Expected Shortfall)
 * @param {Array} returns - Array of historical returns
 * @param {number} confidenceLevel - Confidence level
 * @returns {number} CVaR value
 */
function calculateCVaR(returns, confidenceLevel = 0.95) {
  if (!returns || returns.length === 0) return 0;
  const sorted = [...returns].sort((a, b) => a - b);
  const index = Math.floor((1 - confidenceLevel) * sorted.length);
  const tailReturns = sorted.slice(0, index);
  const avgTailLoss = tailReturns.reduce((sum, r) => sum + r, 0) / (tailReturns.length || 1);
  return Math.abs(avgTailLoss);
}

/**
 * Calculate Sharpe Ratio
 * @param {Array} returns - Array of returns
 * @param {number} riskFreeRate - Risk-free rate (annualized)
 * @returns {number} Sharpe ratio
 */
function calculateSharpeRatio(returns, riskFreeRate = 0.05) {
  if (!returns || returns.length === 0) return 0;
  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);
  
  if (stdDev === 0) return 0;
  
  // Annualize assuming daily returns
  const annualizedReturn = avgReturn * 252;
  const annualizedStdDev = stdDev * Math.sqrt(252);
  
  return (annualizedReturn - riskFreeRate) / annualizedStdDev;
}

/**
 * Calculate Sortino Ratio (downside deviation)
 * @param {Array} returns - Array of returns
 * @param {number} targetReturn - Target/minimum acceptable return
 * @returns {number} Sortino ratio
 */
function calculateSortinoRatio(returns, targetReturn = 0) {
  if (!returns || returns.length === 0) return 0;
  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const downsideReturns = returns.filter(r => r < targetReturn);
  const downsideVariance = downsideReturns.reduce((sum, r) => sum + Math.pow(r - targetReturn, 2), 0) / returns.length;
  const downsideDeviation = Math.sqrt(downsideVariance);
  
  if (downsideDeviation === 0) return 0;
  
  return (avgReturn - targetReturn) / downsideDeviation;
}

/**
 * Calculate Maximum Drawdown
 * @param {Array} values - Array of portfolio values over time
 * @returns {Object} { maxDrawdown, peak, trough }
 */
function calculateMaxDrawdown(values) {
  if (!values || values.length === 0) return { maxDrawdown: 0, peak: 0, trough: 0 };
  
  let maxDrawdown = 0;
  let peak = values[0];
  let peakIndex = 0;
  let troughIndex = 0;
  
  for (let i = 0; i < values.length; i++) {
    if (values[i] > peak) {
      peak = values[i];
      peakIndex = i;
    }
    const drawdown = (peak - values[i]) / peak;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
      troughIndex = i;
    }
  }
  
  return {
    maxDrawdown: maxDrawdown * 100,
    peak: peak,
    trough: values[troughIndex],
    peakIndex,
    troughIndex
  };
}

/**
 * Calculate portfolio volatility (standard deviation of returns)
 * @param {Array} returns - Array of returns
 * @returns {number} Annualized volatility
 */
function calculateVolatility(returns) {
  if (!returns || returns.length === 0) return 0;
  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);
  
  // Annualize assuming daily returns
  return stdDev * Math.sqrt(252) * 100;
}

/**
 * Calculate Beta (relative to market/benchmark)
 * @param {Array} portfolioReturns - Portfolio returns
 * @param {Array} marketReturns - Market/benchmark returns
 * @returns {number} Beta value
 */
function calculateBeta(portfolioReturns, marketReturns) {
  if (!portfolioReturns || !marketReturns || portfolioReturns.length !== marketReturns.length) return 1;
  
  const n = portfolioReturns.length;
  const avgPortfolio = portfolioReturns.reduce((sum, r) => sum + r, 0) / n;
  const avgMarket = marketReturns.reduce((sum, r) => sum + r, 0) / n;
  
  let covariance = 0;
  let marketVariance = 0;
  
  for (let i = 0; i < n; i++) {
    covariance += (portfolioReturns[i] - avgPortfolio) * (marketReturns[i] - avgMarket);
    marketVariance += Math.pow(marketReturns[i] - avgMarket, 2);
  }
  
  covariance /= n;
  marketVariance /= n;
  
  if (marketVariance === 0) return 1;
  
  return covariance / marketVariance;
}

/**
 * Calculate Alpha (excess return over expected return based on beta)
 * @param {number} portfolioReturn - Portfolio return
 * @param {number} marketReturn - Market return
 * @param {number} beta - Portfolio beta
 * @param {number} riskFreeRate - Risk-free rate
 * @returns {number} Alpha value
 */
function calculateAlpha(portfolioReturn, marketReturn, beta, riskFreeRate = 0.05) {
  const expectedReturn = riskFreeRate + beta * (marketReturn - riskFreeRate);
  return portfolioReturn - expectedReturn;
}

/**
 * Calculate Information Ratio
 * @param {Array} portfolioReturns - Portfolio returns
 * @param {Array} benchmarkReturns - Benchmark returns
 * @returns {number} Information ratio
 */
function calculateInformationRatio(portfolioReturns, benchmarkReturns) {
  if (!portfolioReturns || !benchmarkReturns || portfolioReturns.length !== benchmarkReturns.length) return 0;
  
  const activeReturns = portfolioReturns.map((r, i) => r - benchmarkReturns[i]);
  const avgActiveReturn = activeReturns.reduce((sum, r) => sum + r, 0) / activeReturns.length;
  const trackingError = Math.sqrt(
    activeReturns.reduce((sum, r) => sum + Math.pow(r - avgActiveReturn, 2), 0) / activeReturns.length
  );
  
  if (trackingError === 0) return 0;
  
  return avgActiveReturn / trackingError;
}

/**
 * Perform comprehensive risk analysis on a portfolio
 * @param {Object} portfolio - Portfolio object with investments
 * @param {Array} historicalData - Historical price data
 * @returns {Object} Comprehensive risk metrics
 */
function analyzePortfolioRisk(portfolio, historicalData = []) {
  // Calculate basic metrics
  const totalValue = portfolio.totalValue || 0;
  const investments = portfolio.investments || [];
  
  // Asset allocation
  const allocationMap = investments.reduce((map, inv) => {
    const value = (inv.currentPrice || inv.purchasePrice) * inv.quantity;
    map[inv.type] = (map[inv.type] || 0) + value;
    return map;
  }, {});
  
  const allocation = {};
  Object.keys(allocationMap).forEach(key => {
    allocation[key] = totalValue > 0 ? (allocationMap[key] / totalValue) * 100 : 0;
  });
  
  // Concentration risk
  const maxConcentration = Object.values(allocationMap).reduce(
    (max, value) => Math.max(max, totalValue > 0 ? value / totalValue : 0),
    0
  ) * 100;
  
  // Diversification score (0-100)
  const numAssets = investments.length;
  const numAssetTypes = Object.keys(allocationMap).length;
  const diversificationScore = Math.min(100, (numAssets * 10 + numAssetTypes * 20));
  
  // Equity percentage (higher = higher risk)
  const equityPct = allocation['STOCK'] || 0;
  
  // Calculate risk score (0-100, higher = riskier)
  const riskScore = Math.min(100, 
    equityPct * 0.5 + 
    maxConcentration * 0.3 + 
    (100 - diversificationScore) * 0.2
  );
  
  // Risk level classification
  let riskLevel = 'MEDIUM';
  if (riskScore < 30) riskLevel = 'LOW';
  else if (riskScore > 60) riskLevel = 'HIGH';
  
  // Generate mock returns for demonstration (in production, use real historical data)
  const mockReturns = Array.from({ length: 252 }, () => (Math.random() - 0.5) * 0.02);
  
  return {
    riskScore: Math.round(riskScore),
    riskLevel,
    metrics: {
      totalValue,
      equityPercentage: equityPct,
      bondPercentage: allocation['BOND'] || 0,
      goldPercentage: allocation['GOLD'] || 0,
      cashPercentage: allocation['CASH'] || 0,
      concentrationRisk: maxConcentration,
      diversificationScore,
      numAssets,
      numAssetTypes,
      sharpeRatio: calculateSharpeRatio(mockReturns),
      volatility: calculateVolatility(mockReturns),
      var95: calculateVaR(mockReturns, 0.95) * 100,
      cvar95: calculateCVaR(mockReturns, 0.95) * 100,
      maxDrawdown: calculateMaxDrawdown(
        mockReturns.reduce((acc, r, i) => {
          acc.push((acc[i - 1] || 100000) * (1 + r));
          return acc;
        }, [])
      ).maxDrawdown
    },
    recommendations: generateRiskRecommendations(riskScore, allocation, maxConcentration, diversificationScore)
  };
}

/**
 * Generate risk-based recommendations
 */
function generateRiskRecommendations(riskScore, allocation, maxConcentration, diversificationScore) {
  const recommendations = [];
  
  if (riskScore > 70) {
    recommendations.push({
      type: 'HIGH_RISK',
      severity: 'HIGH',
      message: 'Your portfolio has high risk. Consider reducing equity exposure and adding bonds or stable assets.'
    });
  }
  
  if (maxConcentration > 40) {
    recommendations.push({
      type: 'CONCENTRATION',
      severity: 'HIGH',
      message: `High concentration risk detected (${maxConcentration.toFixed(1)}%). Diversify across more assets.`
    });
  }
  
  if (diversificationScore < 40) {
    recommendations.push({
      type: 'DIVERSIFICATION',
      severity: 'MEDIUM',
      message: 'Low diversification. Consider adding more asset types and individual holdings.'
    });
  }
  
  const equityPct = allocation['STOCK'] || 0;
  if (equityPct > 80) {
    recommendations.push({
      type: 'ASSET_ALLOCATION',
      severity: 'MEDIUM',
      message: `Equity allocation is ${equityPct.toFixed(1)}%. Consider adding bonds for stability.`
    });
  }
  
  if (equityPct < 20 && allocation['BOND'] > 60) {
    recommendations.push({
      type: 'ASSET_ALLOCATION',
      severity: 'LOW',
      message: 'Very conservative allocation. Consider adding some growth assets if appropriate for your goals.'
    });
  }
  
  return recommendations;
}

module.exports = {
  calculateVaR,
  calculateCVaR,
  calculateSharpeRatio,
  calculateSortinoRatio,
  calculateMaxDrawdown,
  calculateVolatility,
  calculateBeta,
  calculateAlpha,
  calculateInformationRatio,
  analyzePortfolioRisk
};
