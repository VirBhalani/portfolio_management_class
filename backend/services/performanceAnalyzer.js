// Portfolio Performance Analysis Service

/**
 * Calculate comprehensive performance metrics
 * @param {Object} portfolio - Portfolio object
 * @param {Array} historicalValues - Historical portfolio values
 * @returns {Object} Performance metrics
 */
function analyzePerformance(portfolio, historicalValues = []) {
  const investments = portfolio.investments || [];
  const totalValue = portfolio.totalValue || 0;
  
  // Calculate total cost basis
  const totalCost = investments.reduce((sum, inv) => {
    return sum + (inv.purchasePrice * inv.quantity);
  }, 0);
  
  // Calculate total current value
  const currentValue = investments.reduce((sum, inv) => {
    return sum + ((inv.currentPrice || inv.purchasePrice) * inv.quantity);
  }, 0);
  
  // Calculate returns
  const absoluteReturn = currentValue - totalCost;
  const percentReturn = totalCost > 0 ? (absoluteReturn / totalCost) * 100 : 0;
  
  // Calculate time-weighted return (simplified)
  const timeWeightedReturn = calculateTimeWeightedReturn(historicalValues);
  
  // Calculate money-weighted return (IRR approximation)
  const moneyWeightedReturn = calculateMoneyWeightedReturn(investments);
  
  // Calculate per-asset performance
  const assetPerformance = investments.map(inv => {
    const cost = inv.purchasePrice * inv.quantity;
    const value = (inv.currentPrice || inv.purchasePrice) * inv.quantity;
    const gain = value - cost;
    const gainPct = cost > 0 ? (gain / cost) * 100 : 0;
    
    return {
      symbol: inv.symbol,
      type: inv.type,
      cost,
      value,
      gain,
      gainPercentage: gainPct,
      quantity: inv.quantity,
      purchasePrice: inv.purchasePrice,
      currentPrice: inv.currentPrice || inv.purchasePrice
    };
  });
  
  // Sort by performance
  assetPerformance.sort((a, b) => b.gainPercentage - a.gainPercentage);
  
  // Calculate sector/type performance
  const typePerformance = {};
  investments.forEach(inv => {
    if (!typePerformance[inv.type]) {
      typePerformance[inv.type] = { cost: 0, value: 0, count: 0 };
    }
    typePerformance[inv.type].cost += inv.purchasePrice * inv.quantity;
    typePerformance[inv.type].value += (inv.currentPrice || inv.purchasePrice) * inv.quantity;
    typePerformance[inv.type].count += 1;
  });
  
  Object.keys(typePerformance).forEach(type => {
    const data = typePerformance[type];
    data.gain = data.value - data.cost;
    data.gainPercentage = data.cost > 0 ? (data.gain / data.cost) * 100 : 0;
  });
  
  // Calculate winners and losers
  const winners = assetPerformance.filter(a => a.gainPercentage > 0);
  const losers = assetPerformance.filter(a => a.gainPercentage < 0);
  
  return {
    summary: {
      totalCost,
      currentValue,
      absoluteReturn,
      percentReturn,
      timeWeightedReturn,
      moneyWeightedReturn,
      numWinners: winners.length,
      numLosers: losers.length,
      winRate: investments.length > 0 ? (winners.length / investments.length) * 100 : 0
    },
    assetPerformance,
    typePerformance,
    topPerformers: assetPerformance.slice(0, 5),
    bottomPerformers: assetPerformance.slice(-5).reverse()
  };
}

/**
 * Calculate time-weighted return
 */
function calculateTimeWeightedReturn(historicalValues) {
  if (!historicalValues || historicalValues.length < 2) return 0;
  
  const returns = [];
  for (let i = 1; i < historicalValues.length; i++) {
    const prevValue = historicalValues[i - 1];
    const currValue = historicalValues[i];
    if (prevValue > 0) {
      returns.push((currValue - prevValue) / prevValue);
    }
  }
  
  if (returns.length === 0) return 0;
  
  // Compound returns
  const compoundedReturn = returns.reduce((acc, r) => acc * (1 + r), 1) - 1;
  return compoundedReturn * 100;
}

/**
 * Calculate money-weighted return (simplified IRR)
 */
function calculateMoneyWeightedReturn(investments) {
  if (!investments || investments.length === 0) return 0;
  
  // Simplified calculation - in production, use proper IRR algorithm
  const totalInvested = investments.reduce((sum, inv) => sum + (inv.purchasePrice * inv.quantity), 0);
  const totalValue = investments.reduce((sum, inv) => sum + ((inv.currentPrice || inv.purchasePrice) * inv.quantity), 0);
  
  if (totalInvested === 0) return 0;
  
  return ((totalValue - totalInvested) / totalInvested) * 100;
}

/**
 * Calculate portfolio attribution (contribution of each asset to returns)
 */
function calculateAttribution(portfolio) {
  const investments = portfolio.investments || [];
  const totalValue = portfolio.totalValue || 0;
  
  if (totalValue === 0) return [];
  
  const attribution = investments.map(inv => {
    const cost = inv.purchasePrice * inv.quantity;
    const value = (inv.currentPrice || inv.purchasePrice) * inv.quantity;
    const gain = value - cost;
    const weight = value / totalValue;
    const contribution = (gain / totalValue) * 100;
    
    return {
      symbol: inv.symbol,
      type: inv.type,
      weight: weight * 100,
      return: cost > 0 ? (gain / cost) * 100 : 0,
      contribution
    };
  });
  
  attribution.sort((a, b) => b.contribution - a.contribution);
  
  return attribution;
}

/**
 * Generate performance report
 */
function generatePerformanceReport(portfolio, historicalValues = [], benchmarkReturns = []) {
  const performance = analyzePerformance(portfolio, historicalValues);
  const attribution = calculateAttribution(portfolio);
  
  // Calculate benchmark comparison
  let benchmarkComparison = null;
  if (benchmarkReturns.length > 0) {
    const avgBenchmarkReturn = benchmarkReturns.reduce((sum, r) => sum + r, 0) / benchmarkReturns.length;
    const outperformance = performance.summary.percentReturn - (avgBenchmarkReturn * 100);
    
    benchmarkComparison = {
      benchmarkReturn: avgBenchmarkReturn * 100,
      portfolioReturn: performance.summary.percentReturn,
      outperformance,
      isOutperforming: outperformance > 0
    };
  }
  
  // Generate insights
  const insights = generatePerformanceInsights(performance, attribution);
  
  return {
    ...performance,
    attribution,
    benchmarkComparison,
    insights,
    generatedAt: new Date().toISOString()
  };
}

/**
 * Generate performance insights
 */
function generatePerformanceInsights(performance, attribution) {
  const insights = [];
  
  const { summary, typePerformance } = performance;
  
  // Overall performance insight
  if (summary.percentReturn > 10) {
    insights.push({
      type: 'POSITIVE',
      category: 'OVERALL',
      message: `Strong performance with ${summary.percentReturn.toFixed(2)}% return.`
    });
  } else if (summary.percentReturn < -5) {
    insights.push({
      type: 'NEGATIVE',
      category: 'OVERALL',
      message: `Portfolio is down ${Math.abs(summary.percentReturn).toFixed(2)}%. Consider reviewing your strategy.`
    });
  }
  
  // Win rate insight
  if (summary.winRate > 70) {
    insights.push({
      type: 'POSITIVE',
      category: 'WIN_RATE',
      message: `Excellent win rate of ${summary.winRate.toFixed(1)}%. Most investments are profitable.`
    });
  } else if (summary.winRate < 40) {
    insights.push({
      type: 'WARNING',
      category: 'WIN_RATE',
      message: `Low win rate of ${summary.winRate.toFixed(1)}%. Consider reviewing losing positions.`
    });
  }
  
  // Type performance insights
  Object.entries(typePerformance).forEach(([type, data]) => {
    if (data.gainPercentage > 15) {
      insights.push({
        type: 'POSITIVE',
        category: 'ASSET_TYPE',
        message: `${type} investments performing well with ${data.gainPercentage.toFixed(2)}% return.`
      });
    } else if (data.gainPercentage < -10) {
      insights.push({
        type: 'NEGATIVE',
        category: 'ASSET_TYPE',
        message: `${type} investments underperforming with ${data.gainPercentage.toFixed(2)}% loss.`
      });
    }
  });
  
  // Attribution insights
  if (attribution.length > 0) {
    const topContributor = attribution[0];
    if (topContributor.contribution > 5) {
      insights.push({
        type: 'INFO',
        category: 'ATTRIBUTION',
        message: `${topContributor.symbol} is the top contributor, adding ${topContributor.contribution.toFixed(2)}% to portfolio returns.`
      });
    }
    
    const bottomContributor = attribution[attribution.length - 1];
    if (bottomContributor.contribution < -3) {
      insights.push({
        type: 'WARNING',
        category: 'ATTRIBUTION',
        message: `${bottomContributor.symbol} is dragging down returns by ${Math.abs(bottomContributor.contribution).toFixed(2)}%.`
      });
    }
  }
  
  return insights;
}

/**
 * Calculate dividend/income projections
 */
function calculateIncomeProjections(portfolio, annualDividendYield = 0.02) {
  const investments = portfolio.investments || [];
  
  const projections = investments
    .filter(inv => inv.type === 'STOCK' || inv.type === 'BOND')
    .map(inv => {
      const value = (inv.currentPrice || inv.purchasePrice) * inv.quantity;
      const yieldRate = inv.type === 'BOND' ? 0.04 : annualDividendYield; // Bonds typically yield more
      const annualIncome = value * yieldRate;
      
      return {
        symbol: inv.symbol,
        type: inv.type,
        value,
        yieldRate: yieldRate * 100,
        annualIncome,
        monthlyIncome: annualIncome / 12,
        quarterlyIncome: annualIncome / 4
      };
    });
  
  const totalAnnualIncome = projections.reduce((sum, p) => sum + p.annualIncome, 0);
  
  return {
    projections,
    totalAnnualIncome,
    totalMonthlyIncome: totalAnnualIncome / 12,
    totalQuarterlyIncome: totalAnnualIncome / 4,
    averageYield: portfolio.totalValue > 0 ? (totalAnnualIncome / portfolio.totalValue) * 100 : 0
  };
}

module.exports = {
  analyzePerformance,
  calculateAttribution,
  generatePerformanceReport,
  calculateIncomeProjections
};
