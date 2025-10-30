import React from 'react';
import { Alert } from '@mui/material';

const RiskNotification = ({ portfolio }) => {
  if (!portfolio.analysis?.riskAlerts?.length) return null;

  // Only show gold allocation warning
  const goldWarning = portfolio.analysis.riskAlerts.find(
    alert => alert.message.includes('Gold allocation')
  );

  if (!goldWarning) return null;

  return (
    <Alert 
      severity="warning" 
      sx={{ 
        position: 'fixed', 
        top: '20px', 
        left: '50%', 
        transform: 'translateX(-50%)',
        zIndex: 1000,
        width: '80%',
        maxWidth: '600px'
      }}
    >
      {goldWarning.message}
    </Alert>
  );
};

export default RiskNotification;