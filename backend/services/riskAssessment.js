const mongoose = require('mongoose');

class RiskAssessment {
  constructor() {
    this.riskModel = 'ADVANCED';
    this.lastCalculation = null;
    this.riskFactors = [
      'MARKET_RISK',
      'CREDIT_RISK',
      'LIQUIDITY_RISK',
      'INTEREST_RATE_RISK',
      'VOLATILITY_RISK',
      'CONCENTRATION_RISK'
    ];
  }

  async assessUserRisk(user) {
    try {
      const portfolios = await mongoose.model('Portfolio')
        .find({ userId: user._id })
        .populate('investments');

      const riskProfile = {
        userId: user._id,
        riskTolerance: user.riskTolerance,
        investmentGoals: user.investmentGoals,
        riskMetrics: this._calculateUserRiskMetrics(portfolios),
        recommendations: this._generateRiskRecommendations(user.riskTolerance),
        timestamp: new Date()
      };

      this.lastCalculation = new Date();
      return riskProfile;
    } catch (error) {
      console.error('Error assessing user risk:', error);
      throw error;
    }
  }

  async calculatePortfolioRisk(portfolio) {
    try {
      await portfolio.populate('investments');

      const riskMetrics = {
        totalRisk: this._calculateTotalRisk(portfolio),
        riskBreakdown: this._calculateRiskBreakdown(portfolio),
        diversificationScore: this._calculateDiversificationScore(portfolio),
        riskAdjustedReturn: this._calculateRiskAdjustedReturn(portfolio),
        stressTestResults: await this._performStressTest(portfolio),
        timestamp: new Date()
      };

      this.lastCalculation = new Date();
      return riskMetrics;
    } catch (error) {
      console.error('Error calculating portfolio risk:', error);
      throw error;
    }
  }

  async evaluateInvestmentRisk(investment) {
    try {
      const riskScore = {
        investmentId: investment._id,
        symbol: investment.symbol,
        type: investment.investmentType,
        riskLevel: this._calculateInvestmentRiskLevel(investment),
        riskFactors: this._evaluateInvestmentRiskFactors(investment),
        volatility: await this._calculateHistoricalVolatility(investment),
        timestamp: new Date()
      };

      this.lastCalculation = new Date();
      return riskScore;
    } catch (error) {
      console.error('Error evaluating investment risk:', error);
      throw error;
    }
  }

  async generateRiskReport() {
    try {
      const Portfolio = mongoose.model('Portfolio');
      const allPortfolios = await Portfolio.find().populate('investments');

      const report = {
        overallMarketRisk: await this._assessMarketRisk(),
        portfolioRisks: await Promise.all(
          allPortfolios.map(portfolio => this.calculatePortfolioRisk(portfolio))
        ),
        riskTrends: this._analyzeRiskTrends(),
        recommendations: this._generateSystemWideRecommendations(),
        timestamp: new Date()
      };

      this.lastCalculation = new Date();
      return report;
    } catch (error) {
      console.error('Error generating risk report:', error);
      throw error;
    }
  }

  // Private helper methods
  _calculateUserRiskMetrics(portfolios) {
    const totalValue = portfolios.reduce((sum, p) => sum + p.totalValue, 0);
    const weightedRisks = portfolios.map(p => ({
      weight: p.totalValue / totalValue,
      risk: this._calculateTotalRisk(p)
    }));

    return {
      aggregateRiskScore: weightedRisks.reduce((sum, wr) => 
        sum + (wr.weight * wr.risk), 0),
      portfolioCount: portfolios.length,
      diversification: this._calculateOverallDiversification(portfolios),
      riskConcentration: this._calculateRiskConcentration(portfolios)
    };
  }

  _generateRiskRecommendations(riskTolerance) {
    const recommendations = [];
    
    switch (riskTolerance) {
      case 'HIGH':
        recommendations.push(
          'Consider maintaining a strategic cash reserve',
          'Implement stop-loss orders for volatile investments',
          'Regular portfolio rebalancing recommended'
        );
        break;
      case 'MEDIUM':
        recommendations.push(
          'Balance between growth and stability',
          'Consider increasing bond allocation',
          'Regular risk assessment recommended'
        );
        break;
      case 'LOW':
        recommendations.push(
          'Focus on capital preservation',
          'Consider lower-risk investments',
          'Regular income-generating assets recommended'
        );
        break;
    }

    return recommendations;
  }

  _calculateTotalRisk(portfolio) {
    const risks = portfolio.investments.map(investment => {
      const riskLevel = this._calculateInvestmentRiskLevel(investment);
      const weight = (investment.currentPrice * investment.quantity) / portfolio.totalValue;
      return riskLevel * weight;
    });

    return risks.reduce((sum, risk) => sum + risk, 0);
  }

  _calculateRiskBreakdown(portfolio) {
    const breakdown = {};
    
    this.riskFactors.forEach(factor => {
      breakdown[factor] = this._calculateSpecificRisk(portfolio, factor);
    });

    return breakdown;
  }

  _calculateSpecificRisk(portfolio, riskFactor) {
    switch (riskFactor) {
      case 'MARKET_RISK':
        return this._calculateMarketRisk(portfolio);
      case 'CREDIT_RISK':
        return this._calculateCreditRisk(portfolio);
      case 'LIQUIDITY_RISK':
        return this._calculateLiquidityRisk(portfolio);
      case 'INTEREST_RATE_RISK':
        return this._calculateInterestRateRisk(portfolio);
      case 'VOLATILITY_RISK':
        return this._calculateVolatilityRisk(portfolio);
      case 'CONCENTRATION_RISK':
        return this._calculateConcentrationRisk(portfolio);
      default:
        return 0;
    }
  }

  _calculateDiversificationScore(portfolio) {
    const typeDistribution = portfolio.investments.reduce((acc, inv) => {
      acc[inv.investmentType] = (acc[inv.investmentType] || 0) + 
        (inv.currentPrice * inv.quantity);
      return acc;
    }, {});

    const totalValue = Object.values(typeDistribution).reduce((a, b) => a + b, 0);
    const weights = Object.values(typeDistribution).map(v => v / totalValue);
    
    // Calculate Herfindahl-Hirschman Index (HHI)
    const hhi = weights.reduce((sum, w) => sum + Math.pow(w, 2), 0);
    
    // Convert HHI to diversification score (1 - HHI)
    return 1 - hhi;
  }

  _calculateRiskAdjustedReturn(portfolio) {
    const totalReturn = (portfolio.totalValue - portfolio.investments.reduce((sum, inv) => 
      sum + (inv.purchasePrice * inv.quantity), 0)) / portfolio.totalValue;
    
    const risk = this._calculateTotalRisk(portfolio);
    
    // Sharpe Ratio (assuming risk-free rate of 2%)
    return (totalReturn - 0.02) / risk;
  }

  async _performStressTest(portfolio) {
    const scenarios = {
      marketCrash: -0.30,
      moderateDecline: -0.15,
      interestrateHike: 0.02,
      currencyShock: -0.10
    };

    const results = {};
    
    for (const [scenario, impact] of Object.entries(scenarios)) {
      results[scenario] = this._calculateScenarioImpact(portfolio, impact);
    }

    return results;
  }

  _calculateScenarioImpact(portfolio, impact) {
    const newValue = portfolio.totalValue * (1 + impact);
    return {
      valueImpact: newValue - portfolio.totalValue,
      percentageImpact: impact * 100,
      newRiskLevel: this._calculateTotalRisk(portfolio) * (1 + Math.abs(impact))
    };
  }

  _calculateInvestmentRiskLevel(investment) {
    let baseRisk;
    
    switch (investment.investmentType) {
      case 'STOCK':
        baseRisk = this._calculateStockRisk(investment);
        break;
      case 'BOND':
        baseRisk = this._calculateBondRisk(investment);
        break;
      case 'GOLD':
        baseRisk = this._calculateGoldRisk(investment);
        break;
      default:
        baseRisk = 0.5;
    }

    return baseRisk;
  }

  _calculateStockRisk(stock) {
    return (stock.beta * 0.4) + (this._marketCapRisk(stock.marketCap) * 0.3) +
           (this._sectorRisk(stock.sector) * 0.3);
  }

  _calculateBondRisk(bond) {
    const maturityRisk = this._calculateMaturityRisk(bond.maturityDate);
    const creditRisk = this._calculateCreditRatingRisk(bond.creditRating);
    return (maturityRisk * 0.5) + (creditRisk * 0.5);
  }

  _calculateGoldRisk(gold) {
    return 0.3; // Base risk for gold
  }

  _marketCapRisk(marketCap) {
    switch (marketCap.toUpperCase()) {
      case 'LARGE': return 0.3;
      case 'MID': return 0.5;
      case 'SMALL': return 0.8;
      default: return 0.5;
    }
  }

  _sectorRisk(sector) {
    // Implementation would include sector-specific risk calculations
    return 0.5; // Placeholder
  }

  _calculateMaturityRisk(maturityDate) {
    const yearsToMaturity = (new Date(maturityDate) - new Date()) / 
                           (1000 * 60 * 60 * 24 * 365);
    return Math.min(yearsToMaturity / 30, 1); // Scale based on 30-year maximum
  }

  _calculateCreditRatingRisk(rating) {
    const riskMap = {
      'AAA': 0.1,
      'AA': 0.2,
      'A': 0.3,
      'BBB': 0.4,
      'BB': 0.6,
      'B': 0.7,
      'CCC': 0.8,
      'CC': 0.9,
      'C': 1.0
    };
    return riskMap[rating] || 0.5;
  }

  async _calculateHistoricalVolatility(investment) {
    // Implementation would calculate volatility from historical price data
    return 0.15; // Placeholder
  }

  async _assessMarketRisk() {
    // Implementation would assess overall market risk conditions
    return 0.5; // Placeholder
  }

  _analyzeRiskTrends() {
    // Implementation would analyze historical risk trends
    return {
      trend: 'STABLE',
      momentum: 'NEUTRAL'
    };
  }

  _generateSystemWideRecommendations() {
    return [
      'Maintain diversified portfolios',
      'Regular risk assessment recommended',
      'Monitor market conditions closely'
    ];
  }

  _calculateOverallDiversification(portfolios) {
    return portfolios.reduce((sum, p) => 
      sum + this._calculateDiversificationScore(p), 0) / portfolios.length;
  }

  _calculateRiskConcentration(portfolios) {
    // Implementation would calculate risk concentration across portfolios
    return 0.5; // Placeholder
  }

  _calculateMarketRisk(portfolio) {
    return portfolio.investments.reduce((risk, inv) => 
      risk + (inv.investmentType === 'STOCK' ? inv.beta : 0.5), 0) / 
      portfolio.investments.length;
  }

  _calculateCreditRisk(portfolio) {
    const bondInvestments = portfolio.investments
      .filter(inv => inv.investmentType === 'BOND');
    
    if (bondInvestments.length === 0) return 0;

    return bondInvestments.reduce((risk, bond) => 
      risk + this._calculateCreditRatingRisk(bond.creditRating), 0) / 
      bondInvestments.length;
  }

  _calculateLiquidityRisk(portfolio) {
    // Implementation would calculate liquidity risk
    return 0.3; // Placeholder
  }

  _calculateInterestRateRisk(portfolio) {
    const bondInvestments = portfolio.investments
      .filter(inv => inv.investmentType === 'BOND');
    
    if (bondInvestments.length === 0) return 0;

    return bondInvestments.reduce((risk, bond) => 
      risk + this._calculateMaturityRisk(bond.maturityDate), 0) / 
      bondInvestments.length;
  }

  _calculateVolatilityRisk(portfolio) {
    // Implementation would calculate volatility risk
    return 0.4; // Placeholder
  }

  _calculateConcentrationRisk(portfolio) {
    return 1 - this._calculateDiversificationScore(portfolio);
  }
}

module.exports = new RiskAssessment();