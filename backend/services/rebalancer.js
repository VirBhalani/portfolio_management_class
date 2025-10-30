// Portfolio Rebalancing Service

/**
 * Calculate optimal portfolio rebalancing suggestions
 * @param {Object} portfolio - Current portfolio
 * @param {Object} targetAllocation - Target allocation percentages
 * @returns {Object} Rebalancing suggestions
 */
function calculateRebalancing(portfolio, targetAllocation) {
  const investments = portfolio.investments || [];
  const totalValue = portfolio.totalValue || 0;
  
  if (totalValue === 0) {
    return {
      needsRebalancing: false,
      suggestions: [],
      drift: 0
    };
  }
  
  // Calculate current allocation
  const currentAllocation = {};
  const assetValues = {};
  
  investments.forEach(inv => {
    const value = (inv.currentPrice || inv.purchasePrice) * inv.quantity;
    currentAllocation[inv.type] = (currentAllocation[inv.type] || 0) + value;
    
    if (!assetValues[inv.type]) assetValues[inv.type] = [];
    assetValues[inv.type].push({
      symbol: inv.symbol,
      value,
      quantity: inv.quantity,
      price: inv.currentPrice || inv.purchasePrice
    });
  });
  
  // Convert to percentages
  Object.keys(currentAllocation).forEach(type => {
    currentAllocation[type] = (currentAllocation[type] / totalValue) * 100;
  });
  
  // Calculate drift from target
  let totalDrift = 0;
  const suggestions = [];
  
  Object.keys(targetAllocation).forEach(type => {
    const target = targetAllocation[type] || 0;
    const current = currentAllocation[type] || 0;
    const drift = current - target;
    totalDrift += Math.abs(drift);
    
    if (Math.abs(drift) > 5) { // 5% threshold
      const targetValue = (target / 100) * totalValue;
      const currentValue = (current / 100) * totalValue;
      const difference = targetValue - currentValue;
      
      suggestions.push({
        assetType: type,
        currentPercentage: current,
        targetPercentage: target,
        drift: drift,
        action: difference > 0 ? 'BUY' : 'SELL',
        amount: Math.abs(difference),
        priority: Math.abs(drift) > 10 ? 'HIGH' : 'MEDIUM'
      });
    }
  });
  
  // Sort by priority and drift magnitude
  suggestions.sort((a, b) => {
    if (a.priority === 'HIGH' && b.priority !== 'HIGH') return -1;
    if (a.priority !== 'HIGH' && b.priority === 'HIGH') return 1;
    return Math.abs(b.drift) - Math.abs(a.drift);
  });
  
  return {
    needsRebalancing: totalDrift > 10,
    totalDrift: totalDrift,
    currentAllocation,
    targetAllocation,
    suggestions,
    estimatedCost: calculateRebalancingCost(suggestions)
  };
}

/**
 * Calculate estimated cost of rebalancing (transaction fees, taxes, etc.)
 */
function calculateRebalancingCost(suggestions) {
  // Assume 0.1% transaction fee
  const transactionFeeRate = 0.001;
  let totalCost = 0;
  
  suggestions.forEach(suggestion => {
    totalCost += suggestion.amount * transactionFeeRate;
  });
  
  return totalCost;
}

/**
 * Generate automatic rebalancing strategy
 * @param {Object} portfolio - Current portfolio
 * @param {string} strategy - 'CONSERVATIVE', 'MODERATE', 'AGGRESSIVE'
 * @returns {Object} Target allocation based on strategy
 */
function generateTargetAllocation(portfolio, strategy = 'MODERATE') {
  const strategies = {
    CONSERVATIVE: {
      STOCK: 30,
      BOND: 50,
      GOLD: 15,
      CASH: 5
    },
    MODERATE: {
      STOCK: 60,
      BOND: 30,
      GOLD: 8,
      CASH: 2
    },
    AGGRESSIVE: {
      STOCK: 80,
      BOND: 15,
      GOLD: 3,
      CASH: 2
    },
    BALANCED: {
      STOCK: 50,
      BOND: 40,
      GOLD: 8,
      CASH: 2
    }
  };
  
  return strategies[strategy] || strategies.MODERATE;
}

/**
 * Calculate tax-efficient rebalancing
 * @param {Object} portfolio - Current portfolio
 * @param {Object} targetAllocation - Target allocation
 * @returns {Object} Tax-optimized rebalancing plan
 */
function calculateTaxEfficientRebalancing(portfolio, targetAllocation) {
  const rebalancing = calculateRebalancing(portfolio, targetAllocation);
  
  if (!rebalancing.needsRebalancing) {
    return rebalancing;
  }
  
  // Prioritize selling assets with losses (tax-loss harvesting)
  const taxOptimizedSuggestions = rebalancing.suggestions.map(suggestion => {
    if (suggestion.action === 'SELL') {
      // In a real system, calculate actual gains/losses
      const estimatedGainLoss = Math.random() * 0.2 - 0.1; // Mock: -10% to +10%
      
      return {
        ...suggestion,
        estimatedGainLoss: estimatedGainLoss * 100,
        taxImpact: estimatedGainLoss > 0 ? 'TAXABLE_GAIN' : 'TAX_LOSS',
        priority: estimatedGainLoss < 0 ? 'HIGH' : suggestion.priority // Prioritize losses
      };
    }
    return suggestion;
  });
  
  // Sort to prioritize tax-loss harvesting
  taxOptimizedSuggestions.sort((a, b) => {
    if (a.taxImpact === 'TAX_LOSS' && b.taxImpact !== 'TAX_LOSS') return -1;
    if (a.taxImpact !== 'TAX_LOSS' && b.taxImpact === 'TAX_LOSS') return 1;
    return Math.abs(b.drift) - Math.abs(a.drift);
  });
  
  return {
    ...rebalancing,
    suggestions: taxOptimizedSuggestions,
    taxOptimized: true
  };
}

/**
 * Calculate periodic rebalancing schedule
 * @param {string} frequency - 'MONTHLY', 'QUARTERLY', 'ANNUALLY'
 * @returns {Object} Rebalancing schedule
 */
function generateRebalancingSchedule(frequency = 'QUARTERLY') {
  const schedules = {
    MONTHLY: {
      frequency: 'MONTHLY',
      daysInterval: 30,
      description: 'Rebalance every month'
    },
    QUARTERLY: {
      frequency: 'QUARTERLY',
      daysInterval: 90,
      description: 'Rebalance every quarter'
    },
    SEMIANNUALLY: {
      frequency: 'SEMIANNUALLY',
      daysInterval: 180,
      description: 'Rebalance twice per year'
    },
    ANNUALLY: {
      frequency: 'ANNUALLY',
      daysInterval: 365,
      description: 'Rebalance once per year'
    }
  };
  
  const schedule = schedules[frequency] || schedules.QUARTERLY;
  const nextRebalanceDate = new Date();
  nextRebalanceDate.setDate(nextRebalanceDate.getDate() + schedule.daysInterval);
  
  return {
    ...schedule,
    nextRebalanceDate: nextRebalanceDate.toISOString()
  };
}

module.exports = {
  calculateRebalancing,
  generateTargetAllocation,
  calculateTaxEfficientRebalancing,
  generateRebalancingSchedule
};
