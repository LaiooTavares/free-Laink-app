// MEU-APP-CHAMADOS-FRONTEND/src/pages/GestorDashboard.jsx
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardActionArea } from '@mui/material';
import { useAppContext } from '@/context/AppContext.jsx';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import AssignmentIcon from '@mui/icons-material/Assignment';

export default function GestorDashboard() {
  const navigate = useNavigate();
  const { user } = useAppContext();

  const firstName = useMemo(() => {
    if (!user?.name) return '';
    return user.name.split(' ')[0];
  }, [user]);

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

  return (
    <Box sx={{ pt: {xs: 1, sm: 2}, px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 3 } }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
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
          Gerencie os recursos e as operações da sua equipe.
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 3 }}>
        
        <Box sx={{ width: '100%', flex: { md: 1 } }}>
          <Card sx={card1Styles}>
            <CardActionArea 
              onClick={() => navigate('/gestor/chamados')} 
              sx={{ p: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2.5, height: '100%' }}
            >
              <FlashOnIcon sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                  Chamados
                </Typography>
                <Typography sx={{ opacity: 0.8 }}>
                  Visualizar fila de urgência
                </Typography>
              </Box>
            </CardActionArea>
          </Card>
        </Box>

        <Box sx={{ width: '100%', flex: { md: 1 } }}>
          <Card sx={card2Styles}>
            <CardActionArea 
              onClick={() => navigate('/gestor/servicos')} 
              sx={{ p: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2.5, height: '100%' }}
            >
              <AssignmentIcon sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                  Serviços
                </Typography>
                <Typography sx={{ opacity: 0.8 }}>
                  Acompanhar serviços agendados
                </Typography>
              </Box>
            </CardActionArea>
          </Card>
        </Box>

      </Box>
    </Box>
  );
}