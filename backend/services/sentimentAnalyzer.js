const natural = require('natural');
const axios = require('axios');
const mongoose = require('mongoose');

class SentimentAnalyzer {
  constructor() {
    this.sentimentScore = 0;
    this.dataSource = 'NEWS_API';
    this.lastUpdate = null;
    this.confidence = 0;
    this.tokenizer = new natural.WordTokenizer();
    this.sentiment = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');
  }

  async analyzeSentiment(symbol) {
    try {
      const newsData = await this._fetchNewsData(symbol);
      const processedData = await this._processNewsData(newsData);
      
      const sentimentData = {
        symbol,
        overallSentiment: processedData.overallSentiment,
        sentimentBreakdown: processedData.sentimentBreakdown,
        confidence: processedData.confidence,
        newsCount: newsData.length,
        timestamp: new Date()
      };

      await this._updateSentimentScore(sentimentData);
      return sentimentData;
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      throw error;
    }
  }

  async generateMarketAlert() {
    try {
      const sentimentThreshold = 0.5; // Threshold for generating alerts
      const recentSentiments = await this._getRecentSentiments();
      
      const significantChanges = recentSentiments.filter(sentiment => 
        Math.abs(sentiment.overallSentiment) > sentimentThreshold
      );

      if (significantChanges.length === 0) {
        return null;
      }

      const alert = {
        type: 'SENTIMENT_ALERT',
        message: this._generateAlertMessage(significantChanges),
        severity: this._calculateAlertSeverity(significantChanges),
        affectedSymbols: significantChanges.map(s => s.symbol),
        timestamp: new Date()
      };

      await this._saveAlert(alert);
      return alert;
    } catch (error) {
      console.error('Error generating market alert:', error);
      throw error;
    }
  }

  async getSectorSentiment(sector) {
    try {
      const Stock = mongoose.model('Stock');
      const sectorStocks = await Stock.find({ sector });
      
      const sectorSentiments = await Promise.all(
        sectorStocks.map(stock => this.analyzeSentiment(stock.symbol))
      );

      const aggregatedSentiment = this._aggregateSectorSentiment(sectorSentiments);
      
      return {
        sector,
        sentiment: aggregatedSentiment,
        stockCount: sectorStocks.length,
        timestamp: new Date(),
        confidence: this._calculateAggregateConfidence(sectorSentiments)
      };
    } catch (error) {
      console.error('Error analyzing sector sentiment:', error);
      throw error;
    }
  }

  async processNewsData() {
    try {
      const newsData = await this._fetchLatestNews();
      const processedData = await Promise.all(
        newsData.map(async news => {
          const tokens = this.tokenizer.tokenize(news.content);
          const sentiment = this.sentiment.getSentiment(tokens);
          
          return {
            title: news.title,
            sentiment,
            keywords: this._extractKeywords(tokens),
            timestamp: new Date(news.publishedAt)
          };
        })
      );

      await this._saveProcessedNews(processedData);
      return processedData;
    } catch (error) {
      console.error('Error processing news data:', error);
      throw error;
    }
  }

  async updateSentimentScores() {
    try {
      const stocks = await mongoose.model('Stock').find();
      
      const updatedScores = await Promise.all(
        stocks.map(async stock => {
          const sentiment = await this.analyzeSentiment(stock.symbol);
          return {
            symbol: stock.symbol,
            score: sentiment.overallSentiment,
            timestamp: new Date()
          };
        })
      );

      await this._saveSentimentScores(updatedScores);
      this.lastUpdate = new Date();
      return updatedScores;
    } catch (error) {
      console.error('Error updating sentiment scores:', error);
      throw error;
    }
  }

  // Private helper methods
  async _fetchNewsData(symbol) {
    // Implementation would use a news API to fetch relevant articles
    // This is a placeholder implementation
    return [
      {
        title: `Latest news about ${symbol}`,
        content: 'Positive market outlook',
        publishedAt: new Date()
      }
    ];
  }

  async _fetchLatestNews() {
    // Implementation would fetch general market news
    // This is a placeholder implementation
    return [];
  }

  async _processNewsData(newsData) {
    const sentiments = await Promise.all(
      newsData.map(news => {
        const tokens = this.tokenizer.tokenize(news.content);
        return this.sentiment.getSentiment(tokens);
      })
    );

    const overallSentiment = sentiments.reduce((sum, s) => sum + s, 0) / sentiments.length;
    
    return {
      overallSentiment,
      sentimentBreakdown: {
        positive: sentiments.filter(s => s > 0).length,
        negative: sentiments.filter(s => s < 0).length,
        neutral: sentiments.filter(s => s === 0).length
      },
      confidence: this._calculateConfidence(sentiments)
    };
  }

  _calculateConfidence(sentiments) {
    const variance = this._calculateVariance(sentiments);
    return Math.max(0, 1 - variance);
  }

  _calculateVariance(values) {
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    return squaredDiffs.reduce((sum, d) => sum + d, 0) / values.length;
  }

  _extractKeywords(tokens) {
    // Implementation of keyword extraction
    // This is a placeholder implementation
    return tokens.slice(0, 5);
  }

  async _getRecentSentiments() {
    // Implementation would fetch recent sentiment data from database
    // This is a placeholder implementation
    return [];
  }

  _generateAlertMessage(changes) {
    const significantChange = changes[0];
    return `Significant sentiment change detected for ${significantChange.symbol}`;
  }

  _calculateAlertSeverity(changes) {
    const maxSentiment = Math.max(...changes.map(c => Math.abs(c.overallSentiment)));
    if (maxSentiment > 0.8) return 'HIGH';
    if (maxSentiment > 0.5) return 'MEDIUM';
    return 'LOW';
  }

  _aggregateSectorSentiment(sentiments) {
    return sentiments.reduce((sum, s) => sum + s.overallSentiment, 0) / sentiments.length;
  }

  _calculateAggregateConfidence(sentiments) {
    return sentiments.reduce((sum, s) => sum + s.confidence, 0) / sentiments.length;
  }

  async _updateSentimentScore(sentimentData) {
    this.sentimentScore = sentimentData.overallSentiment;
    this.confidence = sentimentData.confidence;
    this.lastUpdate = new Date();
  }

  async _saveAlert(alert) {
    // Implementation would save alert to database
    // This is a placeholder implementation
    console.log('Saving alert:', alert);
  }

  async _saveProcessedNews(processedData) {
    // Implementation would save processed news to database
    // This is a placeholder implementation
    console.log('Saving processed news:', processedData);
  }

  async _saveSentimentScores(scores) {
    // Implementation would save sentiment scores to database
    // This is a placeholder implementation
    console.log('Saving sentiment scores:', scores);
  }
}

module.exports = new SentimentAnalyzer();