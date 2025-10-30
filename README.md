# Professional Portfolio Management System

A comprehensive, enterprise-grade portfolio management platform with advanced risk analytics, performance tracking, and rebalancing capabilities.

## 🚀 Features

### Core Portfolio Management
- **Multi-Portfolio Support**: Create and manage multiple investment portfolios
- **Asset Tracking**: Track stocks, bonds, gold, and cash investments
- **Real-time Valuation**: Live portfolio value calculations
- **Investment History**: Complete audit trail of all transactions

### Advanced Risk Analytics
- **Value at Risk (VaR)**: 95% confidence level risk assessment
- **Conditional VaR (CVaR)**: Expected shortfall calculations
- **Sharpe Ratio**: Risk-adjusted return metrics
- **Sortino Ratio**: Downside deviation analysis
- **Maximum Drawdown**: Peak-to-trough decline tracking
- **Volatility Analysis**: Annualized portfolio volatility
- **Beta & Alpha**: Market correlation and excess returns
- **Concentration Risk**: Asset concentration monitoring
- **Diversification Score**: Portfolio diversification metrics

### Performance Analysis
- **Time-Weighted Returns**: Accurate performance measurement
- **Money-Weighted Returns**: IRR-based calculations
- **Attribution Analysis**: Contribution of each asset to returns
- **Top/Bottom Performers**: Identify best and worst investments
- **Sector Performance**: Asset type performance breakdown
- **Win Rate**: Percentage of profitable investments
- **Benchmark Comparison**: Compare against market indices

### Portfolio Rebalancing
- **Strategy-Based Rebalancing**: Conservative, Moderate, Aggressive strategies
- **Tax-Efficient Rebalancing**: Tax-loss harvesting optimization
- **Drift Detection**: Automatic allocation drift monitoring
- **Rebalancing Suggestions**: Actionable buy/sell recommendations
- **Cost Estimation**: Transaction cost projections

### Income Projections
- **Dividend Tracking**: Annual, quarterly, and monthly income projections
- **Yield Analysis**: Portfolio-wide yield calculations
- **Income Forecasting**: Future income stream predictions

### Risk Management
- **Real-time Alerts**: Automated risk notifications
- **Threshold Monitoring**: Custom risk threshold alerts
- **Recommendation Engine**: AI-powered portfolio suggestions
- **Compliance Checks**: Allocation limit monitoring

### Market Data Integration
- **Multi-Source Data**: Indian API and Yahoo Finance integration
- **Historical Data**: Price history and trend analysis
- **Quote Fetching**: Real-time price quotes
- **Watchlist**: Track stocks of interest
- **Price Alerts**: Custom price threshold notifications

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js
- **JWT Authentication**: Secure token-based auth
- **RESTful API**: Clean, documented endpoints
- **Modular Services**: Separated business logic
  - Risk Analyzer
  - Performance Analyzer
  - Rebalancer
  - Portfolio Analyzer

### Frontend
- **React 19**: Latest React features
- **Tailwind CSS**: Modern, responsive design
- **Recharts**: Professional data visualizations
- **Lucide Icons**: Beautiful, consistent iconography
- **React Router**: Client-side routing

### Data Visualization
- Line charts for performance tracking
- Pie charts for allocation visualization
- Bar charts for comparative analysis
- Stat cards for key metrics
- Interactive tooltips and legends

## 📦 Installation

### Prerequisites
- Node.js 16+ and npm
- Git

### Backend Setup
```bash
cd backend
npm install
npm start
# Server runs on http://localhost:5004
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
# App runs on http://localhost:3000
```

## 🔐 Authentication

Demo Credentials:
- Email: `vir.bhalani23@spit.ac.in`
- Password: `virbhalani`

OR

- Email: `kapish.bhalodia23@spit.ac.in`
- Password: `kapishbhalodia`

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/user/profile` - Get user profile

### Portfolio Management
- `GET /api/portfolios` - Get all portfolios
- `POST /api/portfolios` - Create new portfolio
- `PUT /api/portfolios/:id` - Update portfolio
- `DELETE /api/portfolios/:id` - Delete portfolio
- `POST /api/portfolios/:id/investments` - Add investment
- `POST /api/portfolios/:id/allocations` - Add allocation

### Analytics & Risk
- `GET /api/portfolios/:id/risk` - Advanced risk analysis
- `GET /api/portfolios/:id/analytics` - Portfolio analytics
- `GET /api/portfolios/:id/performance-analysis` - Performance metrics
- `GET /api/portfolios/:id/report` - Comprehensive report
- `GET /api/portfolios/:id/income` - Income projections
- `POST /api/portfolios/:id/rebalance` - Rebalancing suggestions

### Market Data
- `GET /api/market/:symbol/quote` - Get stock quote
- `GET /api/market/:symbol/historical` - Historical data

### Notifications & Alerts
- `GET /api/notifications` - Get notifications
- `POST /api/notifications/mark-read` - Mark as read
- `GET /api/watchlist` - Get watchlist
- `POST /api/watchlist` - Add to watchlist
- `GET /api/alerts` - Get price alerts
- `POST /api/alerts` - Create price alert

## 🎨 UI Features

### Modern Design
- **Gradient Backgrounds**: Beautiful color transitions
- **Glass Morphism**: Frosted glass effects
- **Smooth Animations**: Polished transitions
- **Responsive Layout**: Mobile-first design
- **Dark Mode Ready**: Prepared for dark theme

### Components
- **Stat Cards**: Key metrics at a glance
- **Interactive Charts**: Hover for details
- **Notification Panel**: Real-time alerts
- **Portfolio Selector**: Easy portfolio switching
- **Risk Dashboard**: Comprehensive risk view
- **Performance Tables**: Sortable, filterable data

## 📈 Risk Metrics Explained

### Sharpe Ratio
Measures risk-adjusted returns. Higher is better.
- **> 1.0**: Good
- **> 2.0**: Very Good
- **> 3.0**: Excellent

### Volatility
Annualized standard deviation of returns.
- **< 10%**: Low volatility
- **10-20%**: Moderate volatility
- **> 20%**: High volatility

### Value at Risk (VaR)
Maximum expected loss at 95% confidence level.
- Example: 5% VaR means 5% max loss in 95% of scenarios

### Maximum Drawdown
Largest peak-to-trough decline.
- **< 10%**: Low drawdown
- **10-20%**: Moderate drawdown
- **> 20%**: High drawdown

## 🔄 Rebalancing Strategies

### Conservative
- 30% Stocks
- 50% Bonds
- 15% Gold
- 5% Cash

### Moderate
- 60% Stocks
- 30% Bonds
- 8% Gold
- 2% Cash

### Aggressive
- 80% Stocks
- 15% Bonds
- 3% Gold
- 2% Cash

## 🚧 Future Enhancements

- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] Real-time WebSocket updates
- [ ] Advanced charting (candlesticks, indicators)
- [ ] PDF report generation
- [ ] Email notifications
- [ ] Mobile app (React Native)
- [ ] Machine learning predictions
- [ ] Social trading features
- [ ] Multi-currency support
- [ ] Tax reporting
- [ ] Goal-based investing
- [ ] Robo-advisor capabilities

## 📝 License

MIT License - feel free to use for personal or commercial projects.

## 👥 Authors

- Vir Bhalani
- Kapish Bhalodia

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📞 Support

For support, email vir.bhalani23@spit.ac.in or kapish.bhalodia23@spit.ac.in

---

**Built with ❤️ for professional portfolio management**
