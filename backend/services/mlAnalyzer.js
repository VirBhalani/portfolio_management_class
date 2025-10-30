const tf = require('@tensorflow/tfjs-node');
const mongoose = require('mongoose');

class MLAnalyzer {
  constructor() {
    this.model = null;
    this.modelType = 'LSTM';
    this.accuracy = 0;
    this.lastTraining = null;
    this.parameters = new Map([
      ['epochs', 100],
      ['batchSize', 32],
      ['learningRate', 0.001],
      ['timeSteps', 60], // 60 days of historical data
      ['predictionDays', 30], // 30 days prediction
    ]);
  }

  async buildModel(inputShape) {
    const model = tf.sequential();
    
    // LSTM layer for sequence processing
    model.add(tf.layers.lstm({
      units: 50,
      returnSequences: true,
      inputShape: inputShape
    }));
    
    // Additional LSTM layers
    model.add(tf.layers.lstm({
      units: 50,
      returnSequences: false
    }));
    
    // Dense layers for prediction
    model.add(tf.layers.dense({
      units: 25,
      activation: 'relu'
    }));
    
    model.add(tf.layers.dense({
      units: 1,
      activation: 'linear'
    }));

    model.compile({
      optimizer: tf.train.adam(this.parameters.get('learningRate')),
      loss: 'meanSquaredError',
      metrics: ['accuracy']
    });

    this.model = model;
    return model;
  }

  async prepareData(historicalData) {
    const timeSteps = this.parameters.get('timeSteps');
    const X = [];
    const y = [];

    for (let i = timeSteps; i < historicalData.length; i++) {
      X.push(historicalData.slice(i - timeSteps, i));
      y.push(historicalData[i]);
    }

    // Convert to tensors
    const xTensor = tf.tensor3d(X, [X.length, timeSteps, 1]);
    const yTensor = tf.tensor2d(y, [y.length, 1]);

    return { xTensor, yTensor };
  }

  async trainModel(historicalData) {
    try {
      const { xTensor, yTensor } = await this.prepareData(historicalData);
      
      if (!this.model) {
        await this.buildModel([this.parameters.get('timeSteps'), 1]);
      }

      const history = await this.model.fit(xTensor, yTensor, {
        epochs: this.parameters.get('epochs'),
        batchSize: this.parameters.get('batchSize'),
        validationSplit: 0.2,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            console.log(`Epoch ${epoch + 1}: loss = ${logs.loss.toFixed(4)}`);
          }
        }
      });

      this.accuracy = history.history.accuracy[history.history.accuracy.length - 1];
      this.lastTraining = new Date();

      // Cleanup tensors
      xTensor.dispose();
      yTensor.dispose();

      return history;
    } catch (error) {
      console.error('Error training model:', error);
      throw error;
    }
  }

  async predictPerformance(investment, historicalData) {
    try {
      if (!this.model) {
        throw new Error('Model not trained');
      }

      const timeSteps = this.parameters.get('timeSteps');
      const recentData = historicalData.slice(-timeSteps);
      
      const inputTensor = tf.tensor3d([recentData], [1, timeSteps, 1]);
      const prediction = this.model.predict(inputTensor);
      
      const predictedValue = await prediction.data();
      
      // Cleanup tensors
      inputTensor.dispose();
      prediction.dispose();

      return {
        symbol: investment.symbol,
        currentPrice: investment.currentPrice,
        predictedPrice: predictedValue[0],
        confidence: this.accuracy,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error predicting performance:', error);
      throw error;
    }
  }

  async analyzeInvestmentProfile(user) {
    try {
      const riskScore = user.riskTolerance === 'HIGH' ? 3 : 
                       user.riskTolerance === 'MEDIUM' ? 2 : 1;

      const portfolios = await mongoose.model('Portfolio')
        .find({ userId: user._id })
        .populate('investments');

      const investmentPatterns = portfolios.flatMap(portfolio => 
        portfolio.investments.map(inv => ({
          type: inv.investmentType,
          performance: (inv.currentPrice - inv.purchasePrice) / inv.purchasePrice
        }))
      );

      // Calculate investment profile metrics
      const metrics = {
        averageReturn: investmentPatterns.reduce((sum, inv) => sum + inv.performance, 0) / 
                      investmentPatterns.length || 0,
        riskAppetite: riskScore,
        preferredInvestmentTypes: this._analyzePreferredTypes(investmentPatterns),
        recommendedAllocation: this._generateRecommendedAllocation(riskScore)
      };

      return {
        userId: user._id,
        metrics,
        timestamp: new Date(),
        confidence: this.accuracy
      };
    } catch (error) {
      console.error('Error analyzing investment profile:', error);
      throw error;
    }
  }

  async optimizePortfolio(portfolio) {
    try {
      const investments = portfolio.investments;
      const returns = investments.map(inv => 
        (inv.currentPrice - inv.purchasePrice) / inv.purchasePrice
      );
      
      // Calculate portfolio metrics
      const currentAllocation = this._calculateAllocation(investments);
      const correlationMatrix = await this._calculateCorrelationMatrix(investments);
      const volatility = this._calculateVolatility(returns);

      // Generate optimized allocation
      const optimizedAllocation = await this._optimizeAllocation(
        investments,
        returns,
        correlationMatrix,
        portfolio.user.riskTolerance
      );

      return {
        portfolioId: portfolio._id,
        currentAllocation,
        optimizedAllocation,
        expectedReturn: this._calculateExpectedReturn(optimizedAllocation, returns),
        volatility,
        timestamp: new Date(),
        confidence: this.accuracy
      };
    } catch (error) {
      console.error('Error optimizing portfolio:', error);
      throw error;
    }
  }

  async detectMarketPatterns() {
    try {
      const MarketData = mongoose.model('MarketData');
      const recentData = await MarketData.find()
        .sort({ timestamp: -1 })
        .limit(this.parameters.get('timeSteps'));

      const patterns = await this._analyzePatterns(recentData);
      
      return {
        patterns,
        marketTrend: this._calculateTrend(recentData),
        volatilityIndex: this._calculateVolatilityIndex(recentData),
        timestamp: new Date(),
        confidence: this.accuracy
      };
    } catch (error) {
      console.error('Error detecting market patterns:', error);
      throw error;
    }
  }

  // Private helper methods
  _analyzePreferredTypes(investments) {
    const typeCounts = investments.reduce((acc, inv) => {
      acc[inv.type] = (acc[inv.type] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(typeCounts)
      .sort(([,a], [,b]) => b - a)
      .reduce((acc, [type, count]) => {
        acc[type] = count / investments.length;
        return acc;
      }, {});
  }

  _generateRecommendedAllocation(riskScore) {
    switch (riskScore) {
      case 3: // High risk
        return { STOCK: 0.7, BOND: 0.2, GOLD: 0.1 };
      case 2: // Medium risk
        return { STOCK: 0.5, BOND: 0.3, GOLD: 0.2 };
      case 1: // Low risk
        return { STOCK: 0.3, BOND: 0.5, GOLD: 0.2 };
      default:
        return { STOCK: 0.4, BOND: 0.4, GOLD: 0.2 };
    }
  }

  _calculateAllocation(investments) {
    const totalValue = investments.reduce((sum, inv) => 
      sum + (inv.currentPrice * inv.quantity), 0);

    return investments.reduce((acc, inv) => {
      const value = inv.currentPrice * inv.quantity;
      acc[inv.investmentType] = (acc[inv.investmentType] || 0) + (value / totalValue);
      return acc;
    }, {});
  }

  async _calculateCorrelationMatrix(investments) {
    // Implementation of correlation matrix calculation
    // This would use historical price data to calculate correlations
    return [[1]]; // Placeholder
  }

  _calculateVolatility(returns) {
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const squaredDiffs = returns.map(r => Math.pow(r - mean, 2));
    return Math.sqrt(squaredDiffs.reduce((sum, d) => sum + d, 0) / returns.length);
  }

  async _optimizeAllocation(investments, returns, correlationMatrix, riskTolerance) {
    // Implementation of portfolio optimization using Modern Portfolio Theory
    // This is a placeholder implementation
    return this._generateRecommendedAllocation(
      riskTolerance === 'HIGH' ? 3 : 
      riskTolerance === 'MEDIUM' ? 2 : 1
    );
  }

  _calculateExpectedReturn(allocation, returns) {
    return Object.values(allocation).reduce((sum, weight, i) => 
      sum + (weight * returns[i]), 0);
  }

  async _analyzePatterns(data) {
    // Implementation of technical analysis patterns detection
    // This is a placeholder implementation
    return {
      trends: ['BULLISH', 'BEARISH'],
      supportLevels: [100, 95],
      resistanceLevels: [105, 110]
    };
  }

  _calculateTrend(data) {
    const prices = data.map(d => d.price);
    const firstPrice = prices[0];
    const lastPrice = prices[prices.length - 1];
    return {
      direction: lastPrice > firstPrice ? 'UPWARD' : 'DOWNWARD',
      magnitude: Math.abs((lastPrice - firstPrice) / firstPrice)
    };
  }

  _calculateVolatilityIndex(data) {
    const prices = data.map(d => d.price);
    return this._calculateVolatility(
      prices.slice(1).map((price, i) => (price - prices[i]) / prices[i])
    );
  }
}

module.exports = new MLAnalyzer();