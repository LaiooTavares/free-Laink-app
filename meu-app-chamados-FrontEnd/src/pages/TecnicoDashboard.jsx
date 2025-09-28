// MEU-APP-CHAMADOS-FRONTEND/src/pages/TecnicoDashboard.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Divider, Badge, Chip, CircularProgress, Tooltip, Paper } from '@mui/material';
import CampaignIcon from '@mui/icons-material/Campaign';
import { useAppContext } from '../context/AppContext.jsx';
import CardChamados from '../components/dashboard/CardChamados';
import CardServicos from '../components/dashboard/CardServicos';

export default function TecnicoDashboard() {
  const { user, loading: contextLoading, chamados, servicos, activeChamado, activeServico } = useAppContext();
  
  const [unreadChamadosCount, setUnreadChamadosCount] = useState(0);
  
  const servicosAgendados = useMemo(() => servicos.filter(s => s.tecnico_id === user?.id && s.status === 'Atribuído ao Técnico'), [servicos, user]);
  useEffect(() => { 
    if (chamados) { 
      const unreadCount = chamados.filter(c => c.status === 'Aguardando na Fila' || c.status === 'Devolvido').length; 
      setUnreadChamadosCount(unreadCount); 
    } 
  }, [chamados]);
  
  const firstName = useMemo(() => user?.name ? user.name.split(' ')[0] : '', [user]);
  
  if (contextLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ pt: {xs: 1, sm: 2}, px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 3 } }}>
      <Box sx={{ mb: 3, textAlign: 'center' }}>
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
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>Acesse seus chamados e serviços:</Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 3 }}>
        <Box sx={{ width: '100%', flex: { md: 1 } }}>
          <CardChamados 
            activeChamado={activeChamado}
            unreadChamadosCount={unreadChamadosCount}
            chamadoSlaColor={'#4caf50'}
          />
        </Box>
        <Box sx={{ width: '100%', flex: { md: 1 } }}>
          <CardServicos 
            activeServico={activeServico}
            servicosAgendadosCount={servicosAgendados.length}
            servicoSlaColor={'#4caf50'}
          />
        </Box>
      </Box>

      {/* ✅ MENSAGEM DO TOOLTIP CORRIGIDA */}
      <Tooltip title="Para desbloquear esta função, adquira a versão Full." placement="top">
        <Box>
          <Divider sx={{ mb: 2, '&::before, &::after': { borderColor: 'primary.light' } }}>
            <Badge color="error" variant="dot" invisible>
              <Chip 
                icon={<CampaignIcon />} 
                label="Avisos da Gestão" 
                sx={(theme) => ({ 
                  fontWeight: 'bold', 
                  fontSize: '1rem',
                  '& .MuiChip-label': {
                    // Gradiente ajustado para ser sutil nas bordas
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
            </Badge>
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