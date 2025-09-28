// MEU-APP-CHAMADOS-FRONTEND/src/components/chamado-detail/Fase1Servico.jsx
import React from 'react';
import { Box, Typography, Paper, Divider, Button, IconButton, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MapIcon from '@mui/icons-material/Map';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

// Botão com gradiente azul
const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(145deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  color: theme.palette.primary.contrastText,
  fontWeight: 'bold',
  '&:hover': {
    background: `linear-gradient(145deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
  },
}));

export default function Fase1Servico({ trabalho, onIniciarDeslocamento, isUpdating, navigateBack }) {
  return (
    <Box sx={{ p: { xs: 0, sm: 2 }, minHeight: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ px: { xs: 2, sm: 1 }, pt: 2, pb: 1, display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={navigateBack} color="primary">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="button" sx={{ ml: 1, cursor: 'pointer', fontWeight: 'bold', color: 'primary.main' }} onClick={navigateBack}>
          Voltar para Serviços
        </Typography>
      </Box>

      <Paper
        elevation={4}
        sx={{
          m: { xs: 0, sm: 2 }, mt: 2,
          borderRadius: { xs: 0, sm: 3 }, flexGrow: 1,
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          p: 0,
        }}
      >
        {/* === CABEÇALHO COM GRADIENTE === */}
        <Box sx={(theme) => ({
          textAlign: 'center',
          p: { xs: 2, sm: 3 },
          background: `linear-gradient(145deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          color: theme.palette.primary.contrastText,
        })}>
          <Typography variant="h4" component="h1" fontWeight="bold">{`Serviço #${trabalho.id}`}</Typography>
          <Typography variant="h5" component="h2" sx={{ mt: 1 }}>{`[${trabalho.ic}] ${trabalho.cliente}`}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2, opacity: 0.9 }}>
            <MapIcon sx={{ mr: 1 }} />
            <Typography>{trabalho.endereco}</Typography>
          </Box>
        </Box>
        
        {/* === CORPO DO CARD === */}
        <Box sx={{ p: { xs: 2, sm: 3 }, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ flexGrow: 1, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>Descrição do Serviço</Typography>
            <Divider sx={{ my: 1 }} />
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mt: 2 }}>{trabalho.descricao}</Typography>
          </Box>

          <Box sx={{ mt: 'auto', pt: 2 }}>
            <GradientButton
              variant="contained" size="large" fullWidth
              onClick={onIniciarDeslocamento} disabled={isUpdating}
              startIcon={isUpdating ? <CircularProgress size={24} color="inherit" /> : <DirectionsCarIcon />}
            >
              {isUpdating ? 'Iniciando...' : 'Iniciar Deslocamento'}
            </GradientButton>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}