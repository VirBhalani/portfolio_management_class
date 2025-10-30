require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5004,
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  mongoURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio_db',
  nodeEnv: process.env.NODE_ENV || 'development',
  clientURL: process.env.CLIENT_URL || 'http://localhost:3000'
};