// MEU-APP-CHAMADOS-FRONTEND/src/pages/ChamadosPage.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box, Typography, Card, CardContent, Chip, CircularProgress, Alert,
  CardActionArea, useTheme
} from '@mui/material';
import { lighten } from '@mui/material/styles';
import { useAppContext } from '../context/AppContext.jsx';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Ícones
import BusinessIcon from '@mui/icons-material/Business';
import EngineeringIcon from '@mui/icons-material/Engineering';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const parseJsonArray = (data, fallback = []) => {
  if (Array.isArray(data)) return data;
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : fallback;
    } catch (e) { return fallback; }
  }
  return fallback;
};

// --- COMPONENTES E FUNÇÕES PARA OS GRADIENT CHIPS ---

const getStatusColors = (status, theme) => {
  let mainColor, lightColor;
  switch(status) {
    case 'Devolvido':
      mainColor = theme.palette.error.main;
      break;
    case 'Aguardando na Fila':
    default:
      mainColor = theme.palette.info.main;
      break;
  }
  lightColor = lighten(mainColor, 0.3);
  return { main: mainColor, light: lightColor };
};

const getPriorityColors = (priority, theme) => {
  let mainColor, lightColor;
  switch (priority?.toLowerCase()) {
    case 'alta':
      mainColor = theme.palette.error.main;
      break;
    case 'media':
      mainColor = theme.palette.warning.main;
      break;
    case 'baixa':
    default:
      mainColor = theme.palette.info.main;
      break;
  }
  lightColor = lighten(mainColor, 0.3);
  return { main: mainColor, light: lightColor };
};

const GradientChip = ({ label, mainColor, lightColor, ...props }) => {
    const theme = useTheme();
    return (
      <Chip
        label={label}
        size="small"
        sx={{
          fontWeight: 'bold',
          background: `linear-gradient(90deg, ${lightColor}, ${mainColor})`,
          color: theme.palette.getContrastText(mainColor),
          ...props.sx,
        }}
        {...props}
      />
    );
};

export default function ChamadosPage() {
  const navigate = useNavigate();
  const { socket } = useAppContext();
  const theme = useTheme();
  const [chamados, setChamados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchChamados = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Token de autenticação não encontrado.');
      const response = await axios.get(`${API_URL}/chamados`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChamados(response.data || []);
    } catch (err) {
      console.error('Erro ao buscar chamados:', err);
      setError('Não foi possível carregar os chamados.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChamados();
  }, [fetchChamados]);

  useEffect(() => {
    if (socket) {
      const handleRealtimeUpdate = () => fetchChamados();
      
      socket.on('novo_chamado', handleRealtimeUpdate);
      socket.on('chamado_atualizado', handleRealtimeUpdate);
      socket.on('chamado_deletado', handleRealtimeUpdate);

      return () => {
        socket.off('novo_chamado', handleRealtimeUpdate);
        socket.off('chamado_atualizado', handleRealtimeUpdate);
        socket.off('chamado_deletado', handleRealtimeUpdate);
      };
    }
  }, [socket, fetchChamados]);

  const chamadosDisponiveis = useMemo(() => {
    if (!chamados) return [];
    return chamados.filter(c => c.status === 'Aguardando na Fila' || c.status === 'Devolvido');
  }, [chamados]);

  const handleCardClick = (chamadoId) => {
    navigate(`/chamado/${chamadoId}`);
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Box sx={{ p: 3 }}><Alert severity="error">{error}</Alert></Box>;
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{
          fontSize: { xs: '1.8rem', sm: '2.125rem' }, fontWeight: 700,
          background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 50%, ${theme.palette.primary.main} 100%)`,
          WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
        }}>
          Fila de Chamados
        </Typography>
      </Box>

      {chamadosDisponiveis.length > 0 ? (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {chamadosDisponiveis.map((chamado) => {
            const prioridade = chamado.prioridade || 'baixa';
            const beforeStyle = {
              content: '""', position: 'absolute', top: 0, left: 0, bottom: 0, width: '5px',
              background: 'linear-gradient(145deg, #1C204E, #0084F3)',
              boxShadow: '1px 0px 4px rgba(0, 0, 0, 0.3)',
            };
            const statusColors = getStatusColors(chamado.status, theme);
            const priorityColors = getPriorityColors(prioridade, theme);

            return (
              <Box key={chamado.id} sx={{
                position: 'relative', borderRadius: 2,
                width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(33.333% - 11px)', lg: 'calc(25% - 12px)' },
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
              }}>
                <Card sx={{
                  height: '100%', width: '100%', display: 'flex', flexDirection: 'column',
                  borderRadius: 2, bgcolor: 'background.paper', position: 'relative', overflow: 'hidden',
                  '&::before': beforeStyle,
                }}>
                  <CardActionArea onClick={() => handleCardClick(chamado.id)} sx={{ flexGrow: 1, p: { xs: 1.5, sm: 2 } }}>
                    <CardContent sx={{ p: 0 }}>
                      <Typography variant="h6" component="div" gutterBottom sx={{ fontWeight: 'bold', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                        OS: {chamado.id}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}><BusinessIcon sx={{ mr: 1, fontSize: '1.2rem' }} /><Typography variant="body2" noWrap>{chamado.cliente}</Typography></Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}><EngineeringIcon sx={{ mr: 1, fontSize: '1.2rem' }} /><Typography variant="body2" noWrap>{chamado.tecnico_nome || 'Não atribuído'}</Typography></Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, flexWrap: 'wrap' }}><CheckCircleOutlineIcon sx={{ mr: 1, fontSize: '1.2rem' }} /><GradientChip label={chamado.status} mainColor={statusColors.main} lightColor={statusColors.light} sx={{minWidth: '110px'}}/></Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}><PriorityHighIcon sx={{ mr: 1, fontSize: '1.2rem' }} /><GradientChip label={prioridade.toUpperCase()} mainColor={priorityColors.main} lightColor={priorityColors.light} /></Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}><CalendarTodayIcon sx={{ mr: 1, fontSize: '1.2rem' }} /><Typography variant="body2">{format(new Date(chamado.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</Typography></Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Box>
            );
          })}
        </Box>
      ) : (
        <Alert severity="info" sx={{ mt: 4 }}>Não há chamados na fila no momento.</Alert>
      )}
    </Box>
  );
}