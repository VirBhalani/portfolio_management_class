import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';

const AddInvestment = ({ portfolioId, onSuccess }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'STOCK',
    symbol: '',
    quantity: '',
    purchasePrice: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5004';
      const response = await fetch(`${API_BASE}/api/portfolios/${portfolioId}/investments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: formData.type,
          symbol: formData.symbol.toUpperCase(),
          quantity: Number(formData.quantity),
          purchasePrice: Number(formData.purchasePrice)
        })
      });

      if (response.ok) {
        setFormData({ type: 'STOCK', symbol: '', quantity: '', purchasePrice: '' });
        setShowForm(false);
        if (onSuccess) onSuccess();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to add investment');
      }
    } catch (err) {
      setError('Error adding investment');
    } finally {
      setLoading(false);
    }
  };

  if (!showForm) {
    return (
      <Button
        variant="contained"
        onClick={() => setShowForm(true)}
        startIcon={<AddIcon />}
        sx={{
          background: 'linear-gradient(to right, #1976d2, #7b1fa2)',
          '&:hover': {
            background: 'linear-gradient(to right, #1565c0, #6a1b9a)',
          }
        }}
      >
        Add Investment
      </Button>
    );
  }

  return (
    <Dialog
      open={showForm}
      onClose={() => setShowForm(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Add Investment
        <IconButton onClick={() => setShowForm(false)} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Asset Type</InputLabel>
              <Select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                required
                label="Asset Type"
              >
                <MenuItem value="STOCK">Stock</MenuItem>
                <MenuItem value="BOND">Bond</MenuItem>
                <MenuItem value="GOLD">Gold</MenuItem>
                <MenuItem value="CASH">Cash</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Symbol"
              value={formData.symbol}
              onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
              placeholder="e.g., TCS, INFY, RELIANCE"
              required
              fullWidth
            />

            <TextField
              label="Quantity"
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              placeholder="Number of units"
              inputProps={{ min: "0.01", step: "0.01" }}
              required
              fullWidth
            />

            <TextField
              label="Purchase Price (₹)"
              type="number"
              value={formData.purchasePrice}
              onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
              placeholder="Price per unit"
              inputProps={{ min: "0.01", step: "0.01" }}
              required
              fullWidth
            />

            {error && (
              <Alert severity="error" sx={{ mt: 1 }}>
                {error}
              </Alert>
            )}

            <Alert severity="info" sx={{ mt: 1 }}>
              <Typography variant="caption">
                <strong>Tip:</strong> Total investment value will be calculated as Quantity × Purchase Price
              </Typography>
            </Alert>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setShowForm(false)}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              background: 'linear-gradient(to right, #1976d2, #7b1fa2)',
              '&:hover': {
                background: 'linear-gradient(to right, #1565c0, #6a1b9a)',
              }
            }}
          >
            {loading ? 'Adding...' : 'Add Investment'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddInvestment;
