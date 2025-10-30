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
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PieChartIcon from '@mui/icons-material/PieChart';
import WarningIcon from '@mui/icons-material/Warning';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import AddIcon from '@mui/icons-material/Add';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
  ArcElement,
} from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';
import AddInvestment from './AddInvestment';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  ChartLegend,
  ArcElement
);

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5004';

const apiCall = async (endpoint, options = {}) => {
  try {
    console.log('API Call:', `${API_BASE}${endpoint}`, options);
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('API Response:', data);
    return data;
  } catch (error) {
    console.error('API Call Failed:', error);
    throw error;
  }
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

export const ModernDashboard = () => {
  const [portfolios, setPortfolios] = useState([]);
  const [selected, setSelected] = useState(null);
  const [risk, setRisk] = useState(null);
  const [perf, setPerf] = useState(null);
  const [income, setIncome] = useState(null);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    fetchPortfolios();
  }, []);

  useEffect(() => {
    if (selected) {
      Promise.all([
        apiCall(`/api/portfolios/${selected.id}/risk`),
        apiCall(`/api/portfolios/${selected.id}/performance-analysis`),
        apiCall(`/api/portfolios/${selected.id}/income`)
      ]).then(([r, p, i]) => {
        setRisk(r);
        setPerf(p);
        setIncome(i);
      });
    }
  }, [selected]);

  const fetchPortfolios = async () => {
    try {
      const data = await apiCall('/api/portfolios');
      console.log('Fetched portfolios:', data);
      setPortfolios(data);
      if (data.length > 0) setSelected(data[0]);
    } catch (error) {
      console.error('Error fetching portfolios:', error);
      setPortfolios([]);
    }
  };

  const createPortfolio = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      const result = await apiCall('/api/portfolios', {
        method: 'POST',
        body: JSON.stringify({ name: newName }),
      });
      console.log('Portfolio created:', result);
      setNewName('');
      await fetchPortfolios();
    } catch (error) {
      console.error('Error creating portfolio:', error);
      alert('Failed to create portfolio. Check console for details.');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      <Box sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'grey.200' }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3, py: 2 }}>
          <Typography variant="h4" fontWeight="bold" color="text.primary">
            Portfolio Manager
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Professional Investment Management
          </Typography>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3, py: 4 }}>
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
            {selected && <AddInvestment portfolioId={selected.id} onSuccess={fetchPortfolios} />}
          </Box>
        )}

        {selected && (
          <>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={3}>
                <StatCard 
                  title="Total Value" 
                  value={`₹${selected.totalValue?.toLocaleString() || 0}`} 
                  change={perf?.summary?.percentReturn} 
                  icon={AttachMoneyIcon} 
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <StatCard 
                  title="Return" 
                  value={`${perf?.summary?.percentReturn?.toFixed(2) || 0}%`} 
                  change={perf?.summary?.percentReturn} 
                  icon={ShowChartIcon} 
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <StatCard 
                  title="Risk Score" 
                  value={risk?.riskScore || 0} 
                  icon={WarningIcon} 
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <StatCard 
                  title="Assets" 
                  value={selected.investments?.length || 0} 
                  icon={PieChartIcon} 
                />
              </Grid>
            </Grid>

            {risk && (
              <Card sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <TrackChangesIcon color="primary" />
                  <Typography variant="h6" fontWeight="medium">
                    Risk Analysis
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
                    <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Sharpe Ratio
                      </Typography>
                      <Typography variant="h5" fontWeight="bold">
                        {risk.metrics?.sharpeRatio?.toFixed(2)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Volatility
                      </Typography>
                      <Typography variant="h5" fontWeight="bold">
                        {risk.metrics?.volatility?.toFixed(1)}%
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        VaR (95%)
                      </Typography>
                      <Typography variant="h5" fontWeight="bold">
                        {risk.metrics?.var95?.toFixed(2)}%
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Max Drawdown
                      </Typography>
                      <Typography variant="h5" fontWeight="bold">
                        {risk.metrics?.maxDrawdown?.toFixed(2)}%
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Card>
            )}

            {perf && perf.topPerformers && (
              <Card sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" fontWeight="medium" mb={2}>
                  Top Performers
                </Typography>
                <Box sx={{ '& > :not(:last-child)': { mb: 1 } }}>
                  {perf.topPerformers.slice(0, 5).map((asset, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        p: 2,
                        bgcolor: 'success.light',
                        borderRadius: 2,
                        '& > div': { display: 'flex', flexDirection: 'column' }
                      }}
                    >
                      <Box>
                        <Typography fontWeight="medium">
                          {asset.symbol}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {asset.type}
                        </Typography>
                      </Box>
                      <Box alignItems="flex-end">
                        <Typography color="success.main" fontWeight="medium">
                          +{asset.gainPercentage.toFixed(2)}%
                        </Typography>
                        <Typography variant="body2">
                          ₹{asset.gain.toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Card>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default ModernDashboard;
