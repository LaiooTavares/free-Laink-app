// FILE: MEU-APP-CHAMADOS-FRONTEND/src/pages/BaterPontoPage.jsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Divider, Tooltip } from '@mui/material';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';

export default function BaterPontoPage() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Lógica para manter o relógio atualizando a cada segundo
    const timerId = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  const formatTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const upgradeTooltip = "Para desbloquear esta função, adquira a versão Full.";

  return (
    <Paper sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h2" component="h1" fontWeight="bold">
        {formatTime(currentTime)}
      </Typography>
      <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
        {currentTime.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </Typography>
      
      <Tooltip title={upgradeTooltip}>
        {/* O 'span' é necessário para que o Tooltip funcione em um botão desabilitado */}
        <span>
          <Button 
            variant="contained" 
            size="large" 
            startIcon={<AccessTimeFilledIcon />}
            disabled // Botão permanentemente desabilitado
            sx={{ py: 2, px: 5, fontSize: '1.2rem' }}
          >
            Check in/out
          </Button>
        </span>
      </Tooltip>

      <Divider sx={{ my: 4 }}>Registros de Hoje</Divider>

      <Typography color="text.secondary">
        Nenhum registro de check-in/out hoje.
      </Typography>
    </Paper>
  );
}