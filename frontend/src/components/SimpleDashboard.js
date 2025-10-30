import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  IconButton,
  Button,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Chip,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PieChartIcon from '@mui/icons-material/PieChart';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningIcon from '@mui/icons-material/Warning';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';

// Local Storage Helper Functions
const STORAGE_KEY = 'portfolios';

const getPortfolios = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const savePortfolios = (portfolios) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolios));
};

// Risk Assessment Functions
const calculateRiskMetrics = (investments) => {
  if (!investments || investments.length === 0) {
    return {
      riskScore: 0,
      diversificationScore: 0,
      volatility: 0,
      sharpeRatio: 0,
      maxDrawdown: 0,
      var95: 0,
      riskLevel: 'Low',
      recommendations: []
    };
  }

  // Calculate asset allocation
  const totalValue = investments.reduce((sum, inv) => sum + (inv.quantity * inv.currentPrice), 0);
  const allocation = {};
  investments.forEach(inv => {
    const value = inv.quantity * inv.currentPrice;
    const percentage = (value / totalValue) * 100;
    allocation[inv.type] = (allocation[inv.type] || 0) + percentage;
  });

  // Diversification Score (0-100)
  const numAssetTypes = Object.keys(allocation).length;
  const numInvestments = investments.length;
  const diversificationScore = Math.min(100, (numAssetTypes * 20) + (numInvestments * 5));

  // Concentration Risk
  const maxConcentration = Math.max(...Object.values(allocation));
  const concentrationRisk = maxConcentration > 50 ? 'High' : maxConcentration > 30 ? 'Medium' : 'Low';

  // Volatility Estimate (based on asset types)
  const volatilityWeights = { STOCK: 0.25, BOND: 0.05, GOLD: 0.15, CASH: 0.01 };
  const volatility = investments.reduce((sum, inv) => {
    const value = inv.quantity * inv.currentPrice;
    const weight = value / totalValue;
    return sum + (weight * (volatilityWeights[inv.type] || 0.2));
  }, 0) * 100;

  // Sharpe Ratio Estimate (simplified)
  const returns = investments.reduce((sum, inv) => {
    const gain = ((inv.currentPrice - inv.purchasePrice) / inv.purchasePrice) * 100;
    return sum + gain;
  }, 0) / investments.length;
  const sharpeRatio = volatility > 0 ? returns / volatility : 0;

  // Risk Score (0-100, higher = riskier)
  const riskScore = Math.min(100, Math.max(0, 
    (volatility * 2) + 
    (maxConcentration * 0.5) - 
    (diversificationScore * 0.3)
  ));

  // Risk Level
  let riskLevel = 'Low';
  if (riskScore > 70) riskLevel = 'High';
  else if (riskScore > 40) riskLevel = 'Medium';

  // Generate Recommendations
  const recommendations = [];
  if (maxConcentration > 40) {
    recommendations.push(`High concentration in ${Object.entries(allocation).find(([k, v]) => v === maxConcentration)[0]} (${maxConcentration.toFixed(1)}%). Consider diversifying.`);
  }
  if (numAssetTypes < 3) {
    recommendations.push('Portfolio has limited asset types. Consider adding different asset classes.');
  }
  if (numInvestments < 5) {
    recommendations.push('Portfolio has few investments. Consider adding more for better diversification.');
  }
  if (allocation.STOCK > 70) {
    recommendations.push('High stock allocation increases volatility. Consider adding bonds or gold.');
  }
  if (!allocation.BOND && totalValue > 100000) {
    recommendations.push('No bonds in portfolio. Bonds can provide stability and reduce risk.');
  }

  return {
    riskScore: Math.round(riskScore),
    diversificationScore: Math.round(diversificationScore),
    volatility: volatility.toFixed(2),
    sharpeRatio: sharpeRatio.toFixed(2),
    maxDrawdown: (volatility * 1.5).toFixed(2),
    var95: (volatility * 1.65).toFixed(2),
    riskLevel,
    concentrationRisk,
    allocation,
    recommendations
  };
};

const StatCard = ({ title, value, change, icon: Icon }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <IconButton
          sx={{
            backgroundColor: 'primary.light',
            '&:hover': { backgroundColor: 'primary.main' },
          }}
        >
          <Icon sx={{ color: 'primary.contrastText' }} />
        </IconButton>
        {change !== undefined && (
          <Box display="flex" alignItems="center" gap={0.5}>
            {change >= 0 ? (
              <TrendingUpIcon color="success" fontSize="small" />
            ) : (
              <TrendingDownIcon color="error" fontSize="small" />
            )}
            <Typography
              variant="body2"
              color={change >= 0 ? 'success.main' : 'error.main'}
              fontWeight="medium"
            >
              {Math.abs(change).toFixed(2)}%
            </Typography>
          </Box>
        )}
      </Box>
      <Typography variant="body2" color="text.secondary">
        {title}
      </Typography>
      <Typography variant="h5" fontWeight="bold" mt={0.5}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

export const SimpleDashboard = () => {
  const [portfolios, setPortfolios] = useState([]);
  const [selected, setSelected] = useState(null);
  const [newName, setNewName] = useState('');
  const [showAddInvestment, setShowAddInvestment] = useState(false);
  const [investmentForm, setInvestmentForm] = useState({
    type: 'STOCK',
    symbol: '',
    quantity: '',
    purchasePrice: ''
  });
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    loadPortfolios();
  }, []);

  const loadPortfolios = () => {
    const loaded = getPortfolios();
    setPortfolios(loaded);
    if (loaded.length > 0 && !selected) {
      setSelected(loaded[0]);
    }
  };

  const createPortfolio = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newPortfolio = {
      id: 'PORT' + Date.now(),
      name: newName,
      investments: [],
      totalValue: 0,
      createdAt: new Date().toISOString()
    };

    const updated = [...portfolios, newPortfolio];
    savePortfolios(updated);
    setPortfolios(updated);
    setSelected(newPortfolio);
    setNewName('');
    setSuccessMsg('Portfolio created successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const deletePortfolio = (portfolioId) => {
    if (!window.confirm('Are you sure you want to delete this portfolio?')) return;
    
    const updated = portfolios.filter(p => p.id !== portfolioId);
    savePortfolios(updated);
    setPortfolios(updated);
    setSelected(updated.length > 0 ? updated[0] : null);
    setSuccessMsg('Portfolio deleted!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const addInvestment = () => {
    if (!selected || !investmentForm.symbol || !investmentForm.quantity || !investmentForm.purchasePrice) {
      alert('Please fill all fields');
      return;
    }

    const investment = {
      id: 'INV' + Date.now(),
      type: investmentForm.type,
      symbol: investmentForm.symbol.toUpperCase(),
      quantity: parseFloat(investmentForm.quantity),
      purchasePrice: parseFloat(investmentForm.purchasePrice),
      currentPrice: parseFloat(investmentForm.purchasePrice),
      addedAt: new Date().toISOString()
    };

    const updated = portfolios.map(p => {
      if (p.id === selected.id) {
        const newInvestments = [...p.investments, investment];
        const totalValue = newInvestments.reduce((sum, inv) => 
          sum + (inv.quantity * inv.currentPrice), 0
        );
        return { ...p, investments: newInvestments, totalValue };
      }
      return p;
    });

    savePortfolios(updated);
    setPortfolios(updated);
    setSelected(updated.find(p => p.id === selected.id));
    setShowAddInvestment(false);
    setInvestmentForm({ type: 'STOCK', symbol: '', quantity: '', purchasePrice: '' });
    setSuccessMsg('Investment added successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const deleteInvestment = (investmentId) => {
    const updated = portfolios.map(p => {
      if (p.id === selected.id) {
        const newInvestments = p.investments.filter(inv => inv.id !== investmentId);
        const totalValue = newInvestments.reduce((sum, inv) => 
          sum + (inv.quantity * inv.currentPrice), 0
        );
        return { ...p, investments: newInvestments, totalValue };
      }
      return p;
    });

    savePortfolios(updated);
    setPortfolios(updated);
    setSelected(updated.find(p => p.id === selected.id));
    setSuccessMsg('Investment removed!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const calculateStats = () => {
    if (!selected || !selected.investments.length) {
      return { totalValue: 0, totalInvested: 0, gain: 0, gainPercent: 0 };
    }

    const totalValue = selected.investments.reduce((sum, inv) => 
      sum + (inv.quantity * inv.currentPrice), 0
    );
    const totalInvested = selected.investments.reduce((sum, inv) => 
      sum + (inv.quantity * inv.purchasePrice), 0
    );
    const gain = totalValue - totalInvested;
    const gainPercent = totalInvested > 0 ? (gain / totalInvested) * 100 : 0;

    return { totalValue, totalInvested, gain, gainPercent };
  };

  const stats = calculateStats();
  const riskMetrics = selected ? calculateRiskMetrics(selected.investments) : null;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      <Box sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'grey.200' }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3, py: 2 }}>
          <Typography variant="h4" fontWeight="bold" color="text.primary">
            Portfolio Manager
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Local Storage Version - No Backend Required
          </Typography>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3, py: 4 }}>
        {successMsg && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMsg('')}>
            {successMsg}
          </Alert>
        )}

        <Card sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" fontWeight="medium" mb={2}>
            Create Portfolio
          </Typography>
          <Box component="form" onSubmit={createPortfolio} sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Portfolio name"
              variant="outlined"
              size="small"
            />
            <Button
              type="submit"
              variant="contained"
              disabled={!newName.trim()}
              sx={{
                minWidth: 'auto',
                px: 2,
                background: 'linear-gradient(to right, #1976d2, #7b1fa2)',
                '&:hover': {
                  background: 'linear-gradient(to right, #1565c0, #6a1b9a)',
                }
              }}
            >
              <AddIcon />
            </Button>
          </Box>
        </Card>

        {portfolios.length > 0 && (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <FormControl sx={{ flexGrow: 1, maxWidth: 400 }} size="small">
                <Select
                  value={selected?.id || ''}
                  onChange={(e) => setSelected(portfolios.find(p => p.id === e.target.value))}
                >
                  {portfolios.map(p => (
                    <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setShowAddInvestment(true)}
                sx={{
                  background: 'linear-gradient(to right, #1976d2, #7b1fa2)',
                  '&:hover': {
                    background: 'linear-gradient(to right, #1565c0, #6a1b9a)',
                  }
                }}
              >
                Add Investment
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => deletePortfolio(selected.id)}
              >
                Delete Portfolio
              </Button>
            </Box>

            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={3}>
                <StatCard 
                  title="Total Value" 
                  value={`₹${stats.totalValue.toLocaleString()}`}
                  change={stats.gainPercent}
                  icon={AttachMoneyIcon} 
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <StatCard 
                  title="Total Invested" 
                  value={`₹${stats.totalInvested.toLocaleString()}`}
                  icon={AttachMoneyIcon} 
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <StatCard 
                  title="Gain/Loss" 
                  value={`₹${stats.gain.toLocaleString()}`}
                  change={stats.gainPercent}
                  icon={TrendingUpIcon} 
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <StatCard 
                  title="Assets" 
                  value={selected?.investments?.length || 0}
                  icon={PieChartIcon} 
                />
              </Grid>
            </Grid>

            {/* Risk Assessment Section */}
            {selected && selected.investments.length > 0 && riskMetrics && (
              <Card sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <TrackChangesIcon color="primary" />
                  <Typography variant="h6" fontWeight="medium">
                    Risk Analysis
                  </Typography>
                  <Chip 
                    label={riskMetrics.riskLevel}
                    color={
                      riskMetrics.riskLevel === 'High' ? 'error' : 
                      riskMetrics.riskLevel === 'Medium' ? 'warning' : 'success'
                    }
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Box>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={3}>
                    <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                      <Typography variant="body2" color="text.secondary" mb={1}>
                        Risk Score
                      </Typography>
                      <Typography variant="h5" fontWeight="bold" mb={1}>
                        {riskMetrics.riskScore}/100
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={riskMetrics.riskScore} 
                        color={
                          riskMetrics.riskScore > 70 ? 'error' : 
                          riskMetrics.riskScore > 40 ? 'warning' : 'success'
                        }
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Diversification
                      </Typography>
                      <Typography variant="h5" fontWeight="bold" mb={1}>
                        {riskMetrics.diversificationScore}/100
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={riskMetrics.diversificationScore} 
                        color="primary"
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Volatility
                      </Typography>
                      <Typography variant="h5" fontWeight="bold">
                        {riskMetrics.volatility}%
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Sharpe Ratio
                      </Typography>
                      <Typography variant="h5" fontWeight="bold">
                        {riskMetrics.sharpeRatio}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        VaR (95%)
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {riskMetrics.var95}%
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Max Drawdown
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {riskMetrics.maxDrawdown}%
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Concentration Risk
                      </Typography>
                      <Chip 
                        label={riskMetrics.concentrationRisk}
                        color={
                          riskMetrics.concentrationRisk === 'High' ? 'error' : 
                          riskMetrics.concentrationRisk === 'Medium' ? 'warning' : 'success'
                        }
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  </Grid>
                </Grid>

                {/* Asset Allocation */}
                {riskMetrics.allocation && Object.keys(riskMetrics.allocation).length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" fontWeight="medium" mb={2}>
                      Asset Allocation
                    </Typography>
                    <Grid container spacing={2}>
                      {Object.entries(riskMetrics.allocation).map(([type, percentage]) => (
                        <Grid item xs={6} md={3} key={type}>
                          <Box sx={{ p: 2, bgcolor: 'primary.light', borderRadius: 2, textAlign: 'center' }}>
                            <Typography variant="body2" color="primary.contrastText">
                              {type}
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" color="primary.contrastText">
                              {percentage.toFixed(1)}%
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}

                {/* Recommendations */}
                {riskMetrics.recommendations && riskMetrics.recommendations.length > 0 && (
                  <Box>
                    <Typography variant="subtitle1" fontWeight="medium" mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WarningIcon color="warning" fontSize="small" />
                      Recommendations
                    </Typography>
                    <Box sx={{ '& > :not(:last-child)': { mb: 1 } }}>
                      {riskMetrics.recommendations.map((rec, idx) => (
                        <Alert key={idx} severity="info" sx={{ bgcolor: 'info.light' }}>
                          {rec}
                        </Alert>
                      ))}
                    </Box>
                  </Box>
                )}
              </Card>
            )}

            {selected && selected.investments.length > 0 && (
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="medium" mb={2}>
                  Investments
                </Typography>
                <Box sx={{ '& > :not(:last-child)': { mb: 2 } }}>
                  {selected.investments.map((inv) => {
                    const currentValue = inv.quantity * inv.currentPrice;
                    const invested = inv.quantity * inv.purchasePrice;
                    const gain = currentValue - invested;
                    const gainPercent = (gain / invested) * 100;

                    return (
                      <Box
                        key={inv.id}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          p: 2,
                          bgcolor: 'grey.50',
                          borderRadius: 2,
                        }}
                      >
                        <Box>
                          <Typography fontWeight="medium" variant="h6">
                            {inv.symbol}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {inv.type} • {inv.quantity} units @ ₹{inv.purchasePrice}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box>
                            <Typography fontWeight="medium">
                              ₹{currentValue.toLocaleString()}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              color={gain >= 0 ? 'success.main' : 'error.main'}
                            >
                              {gain >= 0 ? '+' : ''}{gain.toFixed(2)} ({gainPercent.toFixed(2)}%)
                            </Typography>
                          </Box>
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => deleteInvestment(inv.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Card>
            )}

            {selected && selected.investments.length === 0 && (
              <Card sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  No investments yet. Click "Add Investment" to get started!
                </Typography>
              </Card>
            )}
          </>
        )}

        {portfolios.length === 0 && (
          <Card sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No portfolios yet. Create your first portfolio above!
            </Typography>
          </Card>
        )}
      </Box>

      {/* Add Investment Dialog */}
      <Dialog open={showAddInvestment} onClose={() => setShowAddInvestment(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Investment</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <FormControl fullWidth>
              <Typography variant="body2" mb={1}>Asset Type</Typography>
              <Select
                value={investmentForm.type}
                onChange={(e) => setInvestmentForm({ ...investmentForm, type: e.target.value })}
              >
                <MenuItem value="STOCK">Stock</MenuItem>
                <MenuItem value="BOND">Bond</MenuItem>
                <MenuItem value="GOLD">Gold</MenuItem>
                <MenuItem value="CASH">Cash</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Symbol"
              value={investmentForm.symbol}
              onChange={(e) => setInvestmentForm({ ...investmentForm, symbol: e.target.value })}
              placeholder="e.g., TCS, INFY, RELIANCE"
              fullWidth
            />

            <TextField
              label="Quantity"
              type="number"
              value={investmentForm.quantity}
              onChange={(e) => setInvestmentForm({ ...investmentForm, quantity: e.target.value })}
              placeholder="Number of units"
              inputProps={{ min: "0.01", step: "0.01" }}
              fullWidth
            />

            <TextField
              label="Purchase Price (₹)"
              type="number"
              value={investmentForm.purchasePrice}
              onChange={(e) => setInvestmentForm({ ...investmentForm, purchasePrice: e.target.value })}
              placeholder="Price per unit"
              inputProps={{ min: "0.01", step: "0.01" }}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddInvestment(false)}>Cancel</Button>
          <Button 
            onClick={addInvestment} 
            variant="contained"
            sx={{
              background: 'linear-gradient(to right, #1976d2, #7b1fa2)',
              '&:hover': {
                background: 'linear-gradient(to right, #1565c0, #6a1b9a)',
              }
            }}
          >
            Add Investment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SimpleDashboard;
