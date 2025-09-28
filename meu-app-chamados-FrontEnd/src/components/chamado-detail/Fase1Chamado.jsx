// MEU-APP-CHAMADOS-FRONTEND/src/components/chamado-detail/Fase1Chamado.jsx
import React from 'react';
import { Box, Typography, Paper, Divider, Button, Chip, IconButton, Alert, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MapIcon from '@mui/icons-material/Map';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const parseJsonArray = (data, fallback = []) => {
  if (Array.isArray(data)) return data;
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : fallback;
    } catch (e) {
      return fallback;
    }
  }
  return fallback;
};

const getTagColor = (tag) => {
  const lowerCaseTag = (tag || '').toLowerCase().trim();
  switch (lowerCaseTag) {
    case 'urgente': case 'emergencial': case 'elevador parado': case 'cliente preso':
      return 'error';
    case 'barulho estranho': case 'desnivelado':
      return 'warning';
    case 'rapido':
      return 'primary';
    default:
      return 'default';
  }
};

// Botão com gradiente verde
const GradientButton = styled(Button)(({ theme }) => ({
  // ✅ CORREÇÃO APLICADA: Gradiente de verde, forte para fraco
  background: `linear-gradient(145deg, ${theme.palette.success.main}, ${theme.palette.success.light})`,
  color: theme.palette.success.contrastText,
  fontWeight: 'bold',
  '&:hover': {
    // Ajuste o hover para ter um efeito sutil de mudança no gradiente
    background: `linear-gradient(145deg, ${theme.palette.success.dark}, ${theme.palette.success.main})`,
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
  },
}));

export default function Fase1Chamado({ trabalho, onAceitar, isUpdating, navigateBack }) {
  const tags = parseJsonArray(trabalho.tags, []);

  return (
    <Box sx={{ p: { xs: 0, sm: 2 }, minHeight: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ px: { xs: 2, sm: 1 }, pt: 2, pb: 1, display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={navigateBack} color="primary"><ArrowBackIcon /></IconButton>
        <Typography variant="button" sx={{ ml: 1, cursor: 'pointer', fontWeight: 'bold', color: 'primary.main' }} onClick={navigateBack}>
          Voltar para Fila
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
          <Chip
            label={trabalho.status === 'Devolvido' ? `Devolvido - Prioridade ${trabalho.prioridade}` : `Prioridade ${trabalho.prioridade || 'Não definida'}`}
            sx={{ 
              fontWeight: 'bold', 
              mb: 2, 
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
            }}
          />
          <Typography variant="h4" component="h1" fontWeight="bold">{`Chamado #${trabalho.id}`}</Typography>
          <Typography variant="h5" component="h2" sx={{ mt: 1 }}>{`[${trabalho.ic}] ${trabalho.cliente}`}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2, opacity: 0.9 }}>
            <MapIcon sx={{ mr: 1 }} />
            <Typography>{trabalho.endereco}</Typography>
          </Box>
        </Box>

        {/* === CORPO DO CARD === */}
        <Box sx={{ p: { xs: 2, sm: 3 }, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          {trabalho.status === 'Devolvido' && trabalho.motivo_devolucao && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography fontWeight="bold">Motivo da Devolução Anterior:</Typography>
              <Typography variant="body2">{trabalho.motivo_devolucao}</Typography>
            </Alert>
          )}

          <Box sx={{ mb: 3, flexGrow: 1, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>Descrição do Problema</Typography>
            <Divider sx={{ my: 1 }} />
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mt: 1 }}>{trabalho.descricao}</Typography>

            {tags.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>Tags</Typography>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', mt: 2 }}>
                  {tags.map((tag, index) => (
                    <Chip key={index} label={tag.nome} color={getTagColor(tag.nome)} />
                  ))}
                </Box>
              </Box>
            )}
          </Box>

          <Box sx={{ mt: 'auto', pt: 2 }}>
            <GradientButton
              variant="contained" size="large" fullWidth
              onClick={onAceitar} disabled={isUpdating}
              startIcon={isUpdating ? <CircularProgress size={24} color="inherit" /> : <CheckCircleOutlineIcon />}
            >
              {isUpdating ? 'Aceitando...' : 'Aceitar Chamado'}
            </GradientButton>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}