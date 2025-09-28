// MEU-APP-CHAMADOS-FRONTEND/src/pages/ServicosPage.jsx
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent, Chip, CircularProgress, Alert, CardActionArea, useTheme } from '@mui/material';
import { lighten } from '@mui/material/styles';
import { useAppContext } from '../context/AppContext.jsx';

// Função auxiliar para pegar a chave da cor do status
const getStatusColorKey = (status) => {
  if (status === 'Em Andamento' || status === 'Pausado') return 'warning';
  if (status === 'Atribuído ao Técnico' || status === 'Em Deslocamento') return 'info';
  if (status === 'Finalizado') return 'success';
  return 'default';
};

// Componente reutilizável para o Chip com gradiente
const GradientChip = ({ label, status, ...props }) => {
  const theme = useTheme();
  const colorKey = getStatusColorKey(status);
  
  let mainColor, lightColor;

  if (colorKey === 'info') {
    // VERSÃO CORRETA: Usando o gradiente de azul escuro para azul vibrante
    mainColor = theme.palette.secondary.main; // Azul Vibrante
    lightColor = theme.palette.primary.main;  // Azul Escuro
  } else {
    mainColor = theme.palette[colorKey]?.main || theme.palette.grey[500];
    lightColor = theme.palette[colorKey]?.light || lighten(mainColor, 0.3);
  }

  return (
    <Chip
      label={label}
      size="small"
      sx={{
        fontWeight: 'bold',
        fontSize: { xs: '0.65rem', sm: '0.75rem' },
        background: `linear-gradient(90deg, ${lightColor}, ${mainColor})`,
        color: theme.palette.getContrastText(mainColor),
        border: 'none',
        ...props.sx,
      }}
      {...props}
    />
  );
};

export default function ServicosPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user, servicos, loading } = useAppContext();

  const meusServicos = useMemo(() => {
    if (!user || !servicos) return [];
    return servicos.filter(s =>
      s.tecnico_id === user.id && s.status !== 'Finalizado' && s.status !== 'Cancelado'
    );
  }, [servicos, user]);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ width: '100%', boxSizing: 'border-box', overflowX: 'hidden', p: { xs: 2, sm: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          sx={(theme) => ({
            fontSize: { xs: '1.8rem', sm: '2.125rem' },
            fontWeight: 700,
            background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 50%, ${theme.palette.primary.main} 100%)`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          })}
        >
          Meus Serviços
        </Typography>
      </Box>

      {meusServicos.length > 0 ? (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'flex-start' }}>
          {meusServicos.map((servico) => {
            const colorKey = getStatusColorKey(servico.status);
            
            let mainColor, lightColor;

            if (colorKey === 'info') {
              // VERSÃO CORRETA: Usando o gradiente de azul escuro para azul vibrante
              mainColor = theme.palette.secondary.main; // Azul Vibrante
              lightColor = theme.palette.primary.main;  // Azul Escuro
            } else {
              mainColor = theme.palette[colorKey]?.main || theme.palette.grey[500];
              lightColor = theme.palette[colorKey]?.light || lighten(mainColor, 0.3);
            }

            return (
              <Box
                key={servico.id}
                sx={{
                  width: {
                    xs: '100%',
                    sm: 'calc(50% - 8px)',
                    md: 'calc(33.333% - 11px)',
                    lg: 'calc(25% - 12px)',
                  },
                }}
              >
                <Card
                  elevation={3}
                  sx={{
                    width: '100%',
                    borderRadius: 2,
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    bgcolor: 'background.paper',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 6,
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      bottom: 0,
                      width: '5px',
                      background: `linear-gradient(180deg, ${lightColor}, ${mainColor})`,
                    },
                  }}
                >
                  <CardActionArea onClick={() => navigate(`/servico/${servico.id}`)} sx={{ flexGrow: 1, p: 1.5 }}>
                    <CardContent sx={{ p: '0 !important' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' }, color: 'text.secondary' }}>
                          {servico.id}
                        </Typography>
                        <GradientChip
                          label={servico.status}
                          status={servico.status}
                        />
                      </Box>
                      <Typography variant="h6" component="div" noWrap sx={{ fontWeight: 'bold', fontSize: { xs: '0.9rem', sm: '1.1rem' }, color: 'text.primary' }}>
                        {`[${servico.ic}] ${servico.cliente}`}
                      </Typography>
                      <Typography variant="body2" noWrap sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' }, color: 'text.secondary' }}>
                        {servico.descricao}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Box>
            );
          })}
        </Box>
      ) : (
        <Alert severity="info" sx={{ mt: 4 }}>
          Você não tem nenhum serviço agendado no momento.
        </Alert>
      )}
    </Box>
  );
}