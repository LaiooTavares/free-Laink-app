// MEU-APP-CHAMADOS-FRONTEND/src/pages/OperadorDashboard.jsx
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardActionArea, Divider,
  Chip, Tooltip, Paper
} from '@mui/material';
import CampaignIcon from '@mui/icons-material/Campaign';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import BuildIcon from '@mui/icons-material/Build';
import { useAppContext } from '../context/AppContext.jsx';

export default function OperadorDashboard() {
  const navigate = useNavigate();
  const { user, loading } = useAppContext();
  const firstName = useMemo(() => user?.name ? user.name.split(' ')[0] : '', [user]);

  // Estilos dos Cards
  const card1Styles = (theme) => ({
    height: '100%',
    borderRadius: 3,
    color: theme.palette.primary.contrastText,
    background: `linear-gradient(145deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
    }
  });

  const card2Styles = (theme) => ({
    ...card1Styles(theme), // Herda os estilos base
    // Inverte o gradiente
    background: `linear-gradient(145deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
  });

  if (loading) {
    return null;
  }

  return (
    <Box sx={{ pt: {xs: 1, sm: 2}, px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 3 } }}>
      <Box sx={{ mb: 2, textAlign: 'center' }}>
        <Typography 
          variant="h4" 
          component="h1" 
          sx={(theme) => ({
            fontWeight: 700,
            background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 50%, ${theme.palette.primary.main} 100%)`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          })}
        >
          {`Bem-vindo, ${firstName}!`}
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Crie ou gerencie os chamados e serviços:
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 3 }}>
        <Box sx={{ width: '100%', flex: { md: 1 } }}>
          <Card sx={card1Styles}>
            <CardActionArea onClick={() => navigate('/operador/gerenciar-chamados')} sx={{ p: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2.5, height: '100%' }}>
              <FlashOnIcon sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>Gerenciar Chamados</Typography>
                <Typography sx={{ opacity: 0.8 }}>Criar e editar chamados pendentes</Typography>
              </Box>
            </CardActionArea>
          </Card>
        </Box>
        <Box sx={{ width: '100%', flex: { md: 1 } }}>
          <Card sx={card2Styles}>
            <CardActionArea onClick={() => navigate('/operador/servicos')} sx={{ p: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2.5, height: '100%' }}>
              <BuildIcon sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>Serviços Agendados</Typography>
                <Typography sx={{ opacity: 0.8 }}>Visualizar e atribuir serviços</Typography>
              </Box>
            </CardActionArea>
          </Card>
        </Box>
      </Box>
      
      {/* ✅ MENSAGEM DO TOOLTIP CORRIGIDA */}
      <Tooltip title="Para desbloquear esta função, adquira a versão Full." placement="top">
        <Box>
          <Divider sx={{ mb: 2, '&::before, &::after': { borderColor: 'primary.light' } }}>
            <Chip 
              icon={<CampaignIcon />} 
              label="Avisos da Gestão" 
              sx={(theme) => ({ 
                fontWeight: 'bold', 
                fontSize: '1rem',
                '& .MuiChip-label': {
                  background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 20%, ${theme.palette.secondary.main} 80%, ${theme.palette.primary.main} 100%)`,
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                },
                '& .MuiChip-icon': {
                  color: theme.palette.primary.main,
                }
              })} 
            />
          </Divider>
          <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: 'action.disabledBackground', minHeight: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Desativado para esta versão
            </Typography>
          </Paper>
        </Box>
      </Tooltip>
    </Box>
  );
}