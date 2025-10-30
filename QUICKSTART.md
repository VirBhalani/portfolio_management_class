# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### Step 2: Start the Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```
Server will run on `http://localhost:5004`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```
App will open at `http://localhost:3000`

### Step 3: Login

Use demo credentials:
- **Email**: `vir.bhalani23@spit.ac.in`
- **Password**: `virbhalani`

### Step 4: Create Your First Portfolio

1. Enter a portfolio name (e.g., "My Investment Portfolio")
2. Click "Create"
3. Your portfolio is now ready!

### Step 5: Add Investments (Optional)

Use the API or extend the UI to add investments:

```bash
# Example API call to add investment
curl -X POST http://localhost:5004/api/portfolios/PORT123/investments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "STOCK",
    "symbol": "TCS",
    "quantity": 10,
    "purchasePrice": 3500
  }'
```

## 📊 Key Features to Explore

### 1. Risk Analysis
- View your portfolio's risk score
- Check Sharpe ratio, volatility, VaR
- Get personalized recommendations

### 2. Performance Tracking
- See total returns
- Identify top and bottom performers
- Track win rate

### 3. Rebalancing
- Click "Conservative", "Moderate", or "Aggressive"
- Get tax-optimized rebalancing suggestions
- See estimated costs

### 4. Income Projections
- View annual, monthly, quarterly income
- Check average portfolio yield

## 🎯 Common Tasks

### Create Multiple Portfolios
Perfect for separating:
- Retirement savings
- Emergency fund
- Growth investments
- Income-generating assets

### Monitor Risk
- Check risk score regularly
- Follow recommendations
- Rebalance when drift > 10%

### Track Performance
- Review top/bottom performers
- Compare against benchmarks
- Analyze attribution

## 🔧 Troubleshooting

### Backend won't start
- Check if port 5004 is available
- Ensure all dependencies are installed
- Check Node.js version (16+)

### Frontend won't start
- Check if port 3000 is available
- Clear node_modules and reinstall
- Check for Tailwind CSS errors (they're warnings, safe to ignore)

### Can't login
- Ensure backend is running
- Check network tab for API errors
- Verify credentials

## 📱 Next Steps

1. **Explore the Dashboard**: Navigate through different sections
2. **Create Test Portfolios**: Experiment with different strategies
3. **Check Notifications**: See risk alerts and updates
4. **Try Rebalancing**: Test different allocation strategies
5. **Review Documentation**: Read README.md for detailed info

## 💡 Pro Tips

- **Diversify**: Spread investments across asset types
- **Monitor Risk**: Keep risk score under 70 for balanced portfolios
- **Rebalance Quarterly**: Check rebalancing suggestions every 3 months
- **Track Performance**: Review performance reports monthly
- **Use Notifications**: Enable alerts for important portfolio changes

## 🎨 UI Highlights

- **Gradient Backgrounds**: Modern, professional look
- **Interactive Charts**: Hover for detailed information
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Updates**: Data refreshes automatically
- **Clean Layout**: Easy to navigate and understand

## 📈 Sample Portfolio

Try creating a balanced portfolio:
- 60% Stocks (TCS, INFY, RELIANCE)
- 30% Bonds (Government bonds, Corporate bonds)
- 8% Gold
- 2% Cash

This gives you:
- Moderate risk
- Good diversification
- Steady income potential
- Growth opportunities

---

**Happy Investing! 🎉**

For detailed documentation, see [README.md](./README.md)
