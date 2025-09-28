// MEU-APP-CHAMADOS-FRONTEND/src/components/chamado-detail/ConclusaoTab.jsx
import React from 'react';
import { Box, Typography, Button, Paper, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';

// Ícones
import DrawIcon from '@mui/icons-material/Draw';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import ReplayIcon from '@mui/icons-material/Replay';
 
// Título com gradiente
const GradientTypography = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 50%, ${theme.palette.primary.main} 100%)`,
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
}));

// Botão Verde (Sucesso)
const GradientButtonSuccess = styled(Button)(({ theme }) => ({
  background: `linear-gradient(145deg, #388e3c, #66bb6a)`, // Forte -> Fraco
  color: theme.palette.common.white,
  fontWeight: 'bold',
  '&:hover': {
    background: `linear-gradient(145deg, #2e7d32, #4caf50)`,
  },
}));

// Botão Amarelo (Aviso)
const GradientButtonWarning = styled(Button)(({ theme }) => ({
  background: `linear-gradient(145deg, #f57c00, #ffa726)`, // Forte -> Fraco
  color: theme.palette.common.white,
  fontWeight: 'bold',
  '&:hover': {
    background: `linear-gradient(145deg, #ef6c00, #ff9800)`,
  },
}));

// Botão Vermelho (Erro)
const GradientButtonError = styled(Button)(({ theme }) => ({
  background: `linear-gradient(145deg, #d32f2f, #ef5350)`, // Forte -> Fraco
  color: theme.palette.common.white,
  fontWeight: 'bold',
  '&:hover': {
    background: `linear-gradient(145deg, #c62828, #f44336)`,
  },
}));

export default function ConclusaoTab({
  trabalho,
  handleOpenSignatureDialog,
  handlePausarRetomarServico,
  handleDevolverServico,
}) {
  const assinatura = trabalho?.assinatura || null;
  const statusAtual = trabalho?.status;
  const estaPausado = statusAtual === 'Pausado';
  const podeDevolver = !['Finalizado', 'Cancelado', 'Aguardando Atribuição', 'Aguardando na Fila'].includes(statusAtual);

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        borderRadius: { xs: 0, sm: 3 }, 
        p: { xs: 2, sm: 3 },
      }}
    >
      <GradientTypography 
        variant="h6" 
        gutterBottom 
        sx={{ 
          textAlign: 'center',
          mb: 3 
        }}
      >
        Conclusão e Ações
      </GradientTypography>

      {assinatura && (
        <Box sx={{ mt: 2, mb: 3, textAlign: 'center' }}>
          <Typography variant="subtitle1">Assinatura do Cliente:</Typography>
          <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, display: 'inline-block', mt: 1, p: 1, bgcolor: '#fff' }}>
            <img src={assinatura} alt="Assinatura" style={{ display: 'block', maxWidth: 250 }} />
          </Box>
        </Box>
      )}

      <Stack spacing={2} sx={{ mt: assinatura ? 3 : 0 }}>
        <GradientButtonSuccess
          variant="contained"
          size="large"
          startIcon={<DrawIcon />}
          onClick={handleOpenSignatureDialog}
          disabled={!!assinatura}
        >
          Coletar Assinatura e Finalizar
        </GradientButtonSuccess>

        <GradientButtonWarning
          variant="contained"
          size="large"
          startIcon={estaPausado ? <PlayCircleOutlineIcon /> : <PauseCircleOutlineIcon />}
          onClick={handlePausarRetomarServico}
        >
          {estaPausado ? 'Retomar' : 'Pausar'}
        </GradientButtonWarning>

        {podeDevolver && (
          <GradientButtonError
            variant="contained"
            size="large"
            startIcon={<ReplayIcon />}
            onClick={handleDevolverServico}
          >
            Devolver
          </GradientButtonError>
        )}
      </Stack>
    </Paper>
  );
}