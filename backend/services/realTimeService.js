const marketDataController = require('../controllers/marketDataController');
const Portfolio = require('../models/Portfolio');
const Investment = require('../models/Investment');

class RealTimeService {
  constructor(io) {
    this.io = io;
    this.updateInterval = 5000; // 5 seconds
    this.connectedUsers = new Map(); // userId -> socket.id
    this.initializeSocketHandlers();
    this.startPriceUpdates();
  }

  initializeSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log('Client connected');

      // Handle user authentication
      socket.on('authenticate', async (token) => {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          this.connectedUsers.set(decoded.userId, socket.id);
          socket.userId = decoded.userId;
          socket.join(`user:${decoded.userId}`);
          console.log(`User ${decoded.userId} authenticated`);
        } catch (error) {
          socket.emit('error', { message: 'Authentication failed' });
        }
      });

      // Handle portfolio subscription
      socket.on('subscribe_portfolio', (portfolioId) => {
        if (socket.userId) {
          socket.join(`portfolio:${portfolioId}`);
          console.log(`User ${socket.userId} subscribed to portfolio ${portfolioId}`);
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        if (socket.userId) {
          this.connectedUsers.delete(socket.userId);
          console.log(`User ${socket.userId} disconnected`);
        }
      });
    });
  }

  async startPriceUpdates() {
    setInterval(async () => {
      try {
        const investments = await Investment.find({ investmentType: 'STOCK' });
        const updates = await marketDataController.updatePrices(investments);

        // Group updates by portfolio
        const portfolioUpdates = new Map();
        
        for (const update of updates) {
          const investment = await Investment.findOne({ investmentId: update.investmentId });
          const portfolios = await Portfolio.find({ investments: investment._id });

          for (const portfolio of portfolios) {
            if (!portfolioUpdates.has(portfolio.portfolioId)) {
              portfolioUpdates.set(portfolio.portfolioId, []);
            }
            portfolioUpdates.get(portfolio.portfolioId).push(update);
          }
        }

        // Emit updates to relevant portfolios
        for (const [portfolioId, updates] of portfolioUpdates) {
          this.io.to(`portfolio:${portfolioId}`).emit('price_updates', {
            portfolioId,
            updates
          });
        }
      } catch (error) {
        console.error('Error updating prices:', error);
      }
    }, this.updateInterval);
  }

  // Send notification to specific user
  async sendNotification(userId, notification) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit('notification', notification);
    }
  }

  // Broadcast market alert to all connected users
  async broadcastMarketAlert(alert) {
    this.io.emit('market_alert', alert);
  }

  // Update portfolio dashboard in real-time
  async updatePortfolioDashboard(portfolioId) {
    try {
      const portfolio = await Portfolio.findOne({ portfolioId })
        .populate('investments');
      
      if (!portfolio) return;

      const analytics = {
        totalValue: portfolio.totalValue,
        totalReturn: await portfolio.calculateTotalReturn(),
        assetAllocation: await portfolio.getAssetAllocation(),
        lastUpdated: new Date()
      };

      this.io.to(`portfolio:${portfolioId}`).emit('dashboard_update', analytics);
    } catch (error) {
      console.error('Error updating dashboard:', error);
    }
  }
}

module.exports = RealTimeService;