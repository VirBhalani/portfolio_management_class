const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { analyzePortfolioRisk } = require('./services/riskAnalyzer');
const { calculateRebalancing, generateTargetAllocation, calculateTaxEfficientRebalancing } = require('./services/rebalancer');
const { analyzePerformance, generatePerformanceReport, calculateIncomeProjections } = require('./services/performanceAnalyzer');

const app = express();

// CORS configuration - Allow all origins for simplicity
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

app.get('/', (req, res) => {
  res.json({ message: 'Portfolio Management API', status: 'running' });
});

// Hardcoded users for testing
const users = [
  { id: 1, email: 'vir.bhalani23@spit.ac.in', password: 'virbhalani', name: 'Vir Bhalani' },
  { id: 2, email: 'kapish.bhalodia23@spit.ac.in', password: 'kapishbhalodia', name: 'Kapish Bhalodia' }
];

// Hardcoded JWT secret
const JWT_SECRET = 'portfolio-management-secret-123';

const AUTHORIZED_EMAILS = [
  'vir.bhalani23@spit.ac.in',
  'kapish.bhalodia23@spit.ac.in',
];

// Simple auth middleware
const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { _id: decoded.userId };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication required' });
  }
};

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  // Only authorized emails can log in
  if (!AUTHORIZED_EMAILS.includes(email)) {
    return res.status(401).json({ message: 'User not allowed to login. Please register first.' });
  }
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    user: {
      _id: user.id,
      userId: user.id,
      name: user.name,
      email: user.email
    },
    token
  });
});

// Register endpoint
app.post('/api/auth/register', (req, res) => {
  const { email, password, name } = req.body;
  
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const newUser = {
    id: users.length + 1,
    email,
    password,
    name
  };
  users.push(newUser);

  const token = jwt.sign(
    { userId: newUser.id, email: newUser.email },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.status(201).json({
    user: {
      _id: newUser.id,
      userId: newUser.id,
      name: newUser.name,
      email: newUser.email
    },
    token
  });
});

// In-memory storage for portfolios
let portfolios = [];
// In-memory notifications per user
let notifications = [];
// In-memory user watchlists and alerts
let watchlists = []; // { id, userId, symbol, note }
let priceAlerts = []; // { id, userId, symbol, above, below, active }

// Protected route example
app.get('/api/user/profile', auth, (req, res) => {
  const user = users.find(u => u.id === req.user._id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.json({
    _id: user.id,
    userId: user.id,
    name: user.name,
    email: user.email
  });
});

// Portfolio Routes
app.post('/api/portfolios', auth, (req, res) => {
  const { name } = req.body;
  const portfolio = {
    id: 'PORT' + Date.now(),
    name,
    userId: req.user._id,
    totalValue: 0,
    investments: [],
    allocations: [], // { id, type, symbol, amount }
    createdAt: new Date()
  };
  portfolios.push(portfolio);
  res.status(201).json(portfolio);
});

// Get user's portfolios
app.get('/api/portfolios', auth, (req, res) => {
  const userPortfolios = portfolios.filter(p => p.userId === req.user._id);
  res.json(userPortfolios);
});

// Update portfolio (rename)
app.put('/api/portfolios/:portfolioId', auth, (req, res) => {
  const portfolio = portfolios.find(p => p.id === req.params.portfolioId && p.userId === req.user._id);
  if (!portfolio) return res.status(404).json({ message: 'Portfolio not found' });
  const { name } = req.body;
  if (name) portfolio.name = name;
  res.json(portfolio);
});

// Delete portfolio
app.delete('/api/portfolios/:portfolioId', auth, (req, res) => {
  const exists = portfolios.some(p => p.id === req.params.portfolioId && p.userId === req.user._id);
  if (!exists) return res.status(404).json({ message: 'Portfolio not found' });
  portfolios = portfolios.filter(p => !(p.id === req.params.portfolioId && p.userId === req.user._id));
  res.json({ message: 'Deleted' });
});

// Add investment to portfolio
app.post('/api/portfolios/:portfolioId/investments', auth, (req, res) => {
  const { type, symbol, quantity, purchasePrice } = req.body;
  const portfolio = portfolios.find(p => p.id === req.params.portfolioId && p.userId === req.user._id);
  
  if (!portfolio) {
    return res.status(404).json({ message: 'Portfolio not found' });
  }

  const investment = {
    id: type.toUpperCase() + Date.now(),
    type: type.toUpperCase(),
    symbol,
    quantity: Number(quantity),
    purchasePrice: Number(purchasePrice),
    currentPrice: Number(purchasePrice), // For simplicity
    createdAt: new Date()
  };

  portfolio.investments.push(investment);
  portfolio.totalValue += investment.quantity * investment.purchasePrice;
  
  // Push a notification to the user
  notifications.push({
    id: 'NTF' + Date.now(),
    userId: req.user._id,
    message: `Added ${investment.quantity} ${investment.type} of ${investment.symbol} at ${investment.purchasePrice}`,
    type: 'PORTFOLIO_UPDATE',
    timestamp: new Date().toISOString(),
    isRead: false,
    priority: 'NORMAL'
  });

  // Compute allocation and simple risk confidence
  const allocationMap = portfolio.investments.reduce((map, inv) => {
    const v = inv.currentPrice * inv.quantity;
    map[inv.type] = (map[inv.type] || 0) + v;
    return map;
  }, {});
  const allocation = {};
  Object.keys(allocationMap).forEach(k => {
    allocation[k] = portfolio.totalValue > 0 ? (allocationMap[k] / portfolio.totalValue) * 100 : 0;
  });
  const equityPct = allocation['STOCK'] || 0;
  let riskConfidence = 'MEDIUM';
  if (equityPct >= 70) riskConfidence = 'HIGH';
  else if (equityPct <= 40) riskConfidence = 'LOW';

  // Notify if GOLD allocation exceeds 33%
  const goldPct = allocation['GOLD'] || 0;
  if (goldPct > 33) {
    notifications.push({
      id: 'NTF' + Date.now() + Math.random(),
      userId: req.user._id,
      message: `Alert: Gold allocation is ${goldPct.toFixed(2)}% (>33%). Consider rebalancing.`,
      type: 'RISK_ALERT',
      timestamp: new Date().toISOString(),
      isRead: false,
      priority: 'HIGH'
    });
  }

  res.status(201).json({ investment, portfolio, allocation, riskConfidence });
});

// Add allocation (amount-based; e.g., 10000 TCS or 50000 GOLD)
app.post('/api/portfolios/:portfolioId/allocations', auth, (req, res) => {
  const portfolio = portfolios.find(p => p.id === req.params.portfolioId && p.userId === req.user._id);
  if (!portfolio) return res.status(404).json({ message: 'Portfolio not found' });

  const { type, symbol, amount } = req.body;
  if (!type || isNaN(Number(amount))) return res.status(400).json({ message: 'type and amount are required' });
  const entry = { id: 'ALC' + Date.now(), type: String(type).toUpperCase(), symbol: symbol || '', amount: Number(amount) };
  portfolio.allocations.push(entry);

  // Recompute totals for allocations pie (separate from investments)
  const total = portfolio.allocations.reduce((t, a) => t + a.amount, 0);
  const byType = portfolio.allocations.reduce((m, a) => { m[a.type] = (m[a.type] || 0) + a.amount; return m; }, {});
  const percentages = Object.fromEntries(Object.entries(byType).map(([k, v]) => [k, total > 0 ? (v / total) * 100 : 0]));

  // Risk alert if any single allocation > 30%
  const over = Object.entries(percentages).find(([_, pct]) => pct > 30);
  if (over) {
    const [overType, pct] = over;
    notifications.push({
      id: 'NTF' + Date.now() + Math.random(),
      userId: req.user._id,
      message: `Risk alert: ${overType} allocation is ${pct.toFixed(2)}% (>30%).`,
      type: 'RISK_ALERT',
      timestamp: new Date().toISOString(),
      isRead: false,
      priority: 'HIGH'
    });
  }

  res.status(201).json({ entry, total, byType, percentages });
});

// Get allocations summary for a portfolio
app.get('/api/portfolios/:portfolioId/allocations', auth, (req, res) => {
  const portfolio = portfolios.find(p => p.id === req.params.portfolioId && p.userId === req.user._id);
  if (!portfolio) return res.status(404).json({ message: 'Portfolio not found' });
  const total = portfolio.allocations.reduce((t, a) => t + a.amount, 0);
  const byType = portfolio.allocations.reduce((m, a) => { m[a.type] = (m[a.type] || 0) + a.amount; return m; }, {});
  const percentages = Object.fromEntries(Object.entries(byType).map(([k, v]) => [k, total > 0 ? (v / total) * 100 : 0]));
  res.json({ items: portfolio.allocations, total, byType, percentages });
});

// Simple portfolio analytics
app.get('/api/portfolios/:portfolioId/analytics', auth, (req, res) => {
  const portfolio = portfolios.find(p => p.id === req.params.portfolioId && p.userId === req.user._id);
  if (!portfolio) {
    return res.status(404).json({ message: 'Portfolio not found' });
  }

  const initialValue = portfolio.investments.reduce((t, inv) => t + (inv.purchasePrice * inv.quantity), 0);
  const currentValue = portfolio.investments.reduce((t, inv) => t + (inv.currentPrice * inv.quantity), 0);
  const totalReturn = initialValue > 0 ? ((currentValue - initialValue) / initialValue) * 100 : 0;

  const allocationMap = portfolio.investments.reduce((map, inv) => {
    const v = inv.currentPrice * inv.quantity;
    map[inv.type] = (map[inv.type] || 0) + v;
    return map;
  }, {});
  const allocation = {};
  Object.keys(allocationMap).forEach(k => {
    allocation[k] = portfolio.totalValue > 0 ? (allocationMap[k] / portfolio.totalValue) * 100 : 0;
  });

  res.json({
    totalValue: portfolio.totalValue,
    totalReturn,
    assetAllocation: allocation,
    investmentCount: portfolio.investments.length,
    lastUpdated: new Date().toISOString()
  });
});

// Advanced risk assessment
app.get('/api/portfolios/:portfolioId/risk', auth, (req, res) => {
  const portfolio = portfolios.find(p => p.id === req.params.portfolioId && p.userId === req.user._id);
  if (!portfolio) {
    return res.status(404).json({ message: 'Portfolio not found' });
  }
  const riskAnalysis = analyzePortfolioRisk(portfolio);
  res.json(riskAnalysis);
});

// Portfolio rebalancing suggestions
app.post('/api/portfolios/:portfolioId/rebalance', auth, (req, res) => {
  const portfolio = portfolios.find(p => p.id === req.params.portfolioId && p.userId === req.user._id);
  if (!portfolio) {
    return res.status(404).json({ message: 'Portfolio not found' });
  }
  
  const { strategy, targetAllocation, taxOptimized } = req.body;
  
  let target = targetAllocation;
  if (!target && strategy) {
    target = generateTargetAllocation(portfolio, strategy);
  }
  
  if (!target) {
    target = generateTargetAllocation(portfolio, 'MODERATE');
  }
  
  const rebalancing = taxOptimized 
    ? calculateTaxEfficientRebalancing(portfolio, target)
    : calculateRebalancing(portfolio, target);
  
  res.json(rebalancing);
});

// Performance analysis
app.get('/api/portfolios/:portfolioId/performance-analysis', auth, (req, res) => {
  const portfolio = portfolios.find(p => p.id === req.params.portfolioId && p.userId === req.user._id);
  if (!portfolio) {
    return res.status(404).json({ message: 'Portfolio not found' });
  }
  
  const performance = analyzePerformance(portfolio);
  res.json(performance);
});

// Comprehensive performance report
app.get('/api/portfolios/:portfolioId/report', auth, (req, res) => {
  const portfolio = portfolios.find(p => p.id === req.params.portfolioId && p.userId === req.user._id);
  if (!portfolio) {
    return res.status(404).json({ message: 'Portfolio not found' });
  }
  
  const report = generatePerformanceReport(portfolio);
  res.json(report);
});

// Income projections
app.get('/api/portfolios/:portfolioId/income', auth, (req, res) => {
  const portfolio = portfolios.find(p => p.id === req.params.portfolioId && p.userId === req.user._id);
  if (!portfolio) {
    return res.status(404).json({ message: 'Portfolio not found' });
  }
  
  const projections = calculateIncomeProjections(portfolio);
  res.json(projections);
});

// Notifications API
app.get('/api/notifications', auth, (req, res) => {
  res.json(notifications.filter(n => n.userId === req.user._id));
});
app.post('/api/notifications/mark-read', auth, (req, res) => {
  const { ids } = req.body;
  notifications = notifications.map(n => ids?.includes(n.id) ? { ...n, isRead: true } : n);
  res.json({ message: 'Notifications marked as read' });
});

// Market data proxy endpoints (uses indianapi.in)
const axios = require('axios');
const INDIAN_API_KEY = process.env.INDIAN_API_KEY || 'sk-live-cS2JwcbEalMlqb3BZD9T3qUdLWTHkBQnAo4mv467';
const MARKET_BASE = 'https://api.indianapi.in/v1';

async function fetchIndianQuote(symbol) {
  const r = await axios.get(`${MARKET_BASE}/stocks/${symbol}/quote`, {
    headers: { Authorization: `Bearer ${INDIAN_API_KEY}` }
  });
  return r.data;
}

async function fetchIndianHistorical(symbol, period) {
  const r = await axios.get(`${MARKET_BASE}/stocks/${symbol}/historical`, {
    headers: { Authorization: `Bearer ${INDIAN_API_KEY}` },
    params: { period }
  });
  return r.data;
}

async function fetchYahooHistorical(symbol) {
  // Append .NS for NSE tickers if not provided
  const ySymbol = /\.[A-Z]+$/.test(symbol) ? symbol : `${symbol}.NS`;
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ySymbol)}?interval=1d&range=1mo`;
  const r = await axios.get(url);
  const result = r.data?.chart?.result?.[0];
  const timestamps = result?.timestamp || [];
  const closes = result?.indicators?.quote?.[0]?.close || [];
  const series = timestamps.map((t, i) => ({ date: new Date(t * 1000).toISOString().slice(0,10), close: closes[i] }));
  const lastPrice = closes.filter(v => typeof v === 'number').slice(-1)[0];
  return { lastPrice, series };
}
app.get('/api/market/:symbol/quote', auth, async (req, res) => {
  const { symbol } = req.params;
  try {
    const data = await fetchIndianQuote(symbol);
    return res.json(data);
  } catch (e1) {
    try {
      const yahoo = await fetchYahooHistorical(symbol);
      return res.json({ lastPrice: yahoo.lastPrice });
    } catch (e2) {
      return res.status(500).json({ message: 'Error fetching quote', error: e2.message });
    }
  }
});
app.get('/api/market/:symbol/historical', auth, async (req, res) => {
  const { symbol } = req.params;
  const { period = '1mo' } = req.query;
  try {
    const data = await fetchIndianHistorical(symbol, period);
    return res.json(data);
  } catch (e1) {
    try {
      const yahoo = await fetchYahooHistorical(symbol);
      return res.json(yahoo.series.map(p => ({ date: p.date, close: p.close })));
    } catch (e2) {
      return res.status(500).json({ message: 'Error fetching historical', error: e2.message });
    }
  }
});

// Watchlist APIs
app.get('/api/watchlist', auth, (req, res) => {
  res.json(watchlists.filter(w => w.userId === req.user._id));
});
app.post('/api/watchlist', auth, (req, res) => {
  const { symbol, note } = req.body;
  const item = { id: 'WL' + Date.now(), userId: req.user._id, symbol, note: note || '' };
  watchlists.push(item);
  res.status(201).json(item);
});
app.delete('/api/watchlist/:id', auth, (req, res) => {
  watchlists = watchlists.filter(w => !(w.id === req.params.id && w.userId === req.user._id));
  res.json({ message: 'Removed' });
});

// Price alert APIs
app.get('/api/alerts', auth, (req, res) => {
  res.json(priceAlerts.filter(a => a.userId === req.user._id));
});
app.post('/api/alerts', auth, (req, res) => {
  const { symbol, above, below } = req.body;
  const alert = { id: 'AL' + Date.now(), userId: req.user._id, symbol, above: Number(above) || null, below: Number(below) || null, active: true };
  priceAlerts.push(alert);
  res.status(201).json(alert);
});
app.delete('/api/alerts/:id', auth, (req, res) => {
  priceAlerts = priceAlerts.filter(a => !(a.id === req.params.id && a.userId === req.user._id));
  res.json({ message: 'Removed' });
});

// Mock price check to trigger alerts and create notifications
app.post('/api/alerts/check', auth, (req, res) => {
  const { prices } = req.body; // { SYMBOL: price }
  const userAlerts = priceAlerts.filter(a => a.userId === req.user._id && a.active);
  const triggered = [];
  userAlerts.forEach(a => {
    const p = prices?.[a.symbol];
    if (typeof p === 'number') {
      if ((a.above != null && p >= a.above) || (a.below != null && p <= a.below)) {
        triggered.push({ id: a.id, symbol: a.symbol, price: p });
        notifications.push({
          id: 'NTF' + Date.now() + Math.random(),
          userId: req.user._id,
          message: `Price alert: ${a.symbol} hit ${p}`,
          type: 'PRICE_ALERT',
          timestamp: new Date().toISOString(),
          isRead: false,
          priority: 'HIGH'
        });
        a.active = false;
      }
    }
  });
  res.json({ triggered });
});

// Simple performance snapshot (daily)
app.get('/api/portfolios/:portfolioId/performance', auth, (req, res) => {
  const portfolio = portfolios.find(p => p.id === req.params.portfolioId && p.userId === req.user._id);
  if (!portfolio) return res.status(404).json({ message: 'Portfolio not found' });
  // Mock 7-day performance from current totalValue
  const points = Array.from({ length: 7 }).map((_, i) => ({
    date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    value: Math.max(0, portfolio.totalValue * (0.98 + Math.random() * 0.04))
  }));
  res.json({ series: points });
});

const PORT = process.env.PORT || 5004;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});