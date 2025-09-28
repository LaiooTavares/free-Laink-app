// MEU-APP-CHAMADOS-FRONTEND/src/pages/GestorGerenciarServicosPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, CircularProgress, Alert, Paper, Chip,
  FormControl, InputLabel, Select, MenuItem, Button, Card, CardContent,
  CardActionArea, Dialog, DialogTitle, DialogContent, DialogActions, Stack,
  useTheme, Divider, DialogContentText
} from '@mui/material';
import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot } from '@mui/lab';
import { lighten } from '@mui/material/styles';
import { useAppContext } from '../context/AppContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Imports de Ícones
import BusinessIcon from '@mui/icons-material/Business';
import EngineeringIcon from '@mui/icons-material/Engineering';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import BuildIcon from '@mui/icons-material/Build';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TuneIcon from '@mui/icons-material/Tune';
import HistoryIcon from '@mui/icons-material/History';

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
    case 'Em Andamento':
    case 'Pausado':
      mainColor = theme.palette.warning.main;
      break;
    case 'Finalizado':
      mainColor = theme.palette.success.main;
      break;
    case 'Aguardando Atribuição':
    case 'Atribuído ao Técnico':
    case 'Em Deslocamento':
      mainColor = theme.palette.info.main;
      break;
    default:
      mainColor = theme.palette.grey[500];
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

const periodos = [
  { value: 'sempre', label: 'Desde o Início' },
  { value: 'semana', label: 'Última Semana' },
  { value: '15dias', label: 'Últimos 15 Dias' },
  { value: '30dias', label: 'Últimos 30 Dias' },
  { value: '60dias', label: 'Últimos 60 Dias' },
  { value: '90dias', label: 'Últimos 90 Dias' },
  { value: '360dias', label: 'Último Ano' },
];

export default function GestorGerenciarServicosPage() {
  const navigate = useNavigate();
  const { socket, loading: contextLoading } = useAppContext();
  const theme = useTheme();
  const [servicos, setServicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tecnicos, setTecnicos] = useState([]);

  const [selectedTecnico, setSelectedTecnico] = useState('todos');
  const [selectedPeriodo, setSelectedPeriodo] = useState('sempre');
  const [isHistoricoView, setIsHistoricoView] = useState(false);

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [tempSelectedTecnico, setTempSelectedTecnico] = useState('todos');
  const [tempSelectedPeriodo, setTempSelectedPeriodo] = useState('sempre');

  const [selectedServico, setSelectedServico] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const fetchTecnicos = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${API_URL}/users/tecnicos`, { headers: { Authorization: `Bearer ${token}` } });
      setTecnicos(response.data || []);
    } catch (err) {
      console.error("Falha ao buscar técnicos", err);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error("Token de autenticação não encontrado.");
      
      const historicoAtivado = selectedTecnico !== 'todos' || selectedPeriodo !== 'sempre';
      setIsHistoricoView(historicoAtivado);

      const url = historicoAtivado ? `${API_URL}/servicos/historico` : `${API_URL}/servicos/fila-gestor`;
      const params = historicoAtivado ? { tecnicoId: selectedTecnico, periodo: selectedPeriodo } : {};
      
      const response = await axios.get(url, { headers: { Authorization: `Bearer ${token}` }, params });
      setServicos(response.data || []);

    } catch (err) {
      setError("Falha ao carregar dados. Verifique suas permissões ou os filtros aplicados.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedTecnico, selectedPeriodo]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetchTecnicos(); }, [fetchTecnicos]);

  useEffect(() => {
    if (!socket) return;
    const handleNovoServico = (novoServico) => {
      if (!isHistoricoView) setServicos(prev => [novoServico, ...prev.filter(s => s.id !== novoServico.id)]);
    };
    const handleServicoAtualizado = (servicoAtualizado) => {
      setServicos(prev => prev.map(s => s.id === servicoAtualizado.id ? servicoAtualizado : s));
      if (selectedServico && selectedServico.id === servicoAtualizado.id) {
        setSelectedServico(servicoAtualizado);
      }
    };
    const handleServicoDeletado = (data) => {
      if (!isHistoricoView) setServicos(prev => prev.filter(s => s.id !== data.id));
    };

    socket.on('novo_servico', handleNovoServico);
    socket.on('servico_atualizado', handleServicoAtualizado);
    socket.on('servico_deletado', handleServicoDeletado);

    return () => {
      socket.off('novo_servico', handleNovoServico);
      socket.off('servico_atualizado', handleServicoAtualizado);
      socket.off('servico_deletado', handleServicoDeletado);
    };
  }, [socket, isHistoricoView, selectedServico]);

  const handleCardClick = (servico) => {
    setSelectedServico(servico);
    setIsDetailsModalOpen(true);
  };
  
  const handleOpenFilterModal = () => { setTempSelectedTecnico(selectedTecnico); setTempSelectedPeriodo(selectedPeriodo); setIsFilterModalOpen(true); };
  const handleCloseFilterModal = () => { setIsFilterModalOpen(false); };
  const handleApplyFilters = () => { setSelectedTecnico(tempSelectedTecnico); setSelectedPeriodo(tempSelectedPeriodo); handleCloseFilterModal(); };
  const handleClearFiltersInModal = () => { setTempSelectedTecnico('todos'); setTempSelectedPeriodo('sempre'); };
  const pageTitle = isHistoricoView ? 'Histórico de Serviços' : 'Fila de Serviços';

  const renderServiceHistory = (servico) => {
    if (servico.historico && parseJsonArray(servico.historico).length > 0) {
      return parseJsonArray(servico.historico).map((evento, index) => (
        <TimelineItem key={index}>
          <TimelineSeparator>
            <TimelineDot color="primary" />
            {index < parseJsonArray(servico.historico).length - 1 && <TimelineConnector />}
          </TimelineSeparator>
          <TimelineContent sx={{ py: '12px', px: 2 }}>
            <Typography variant="body2" color="text.secondary">{new Date(evento.timestamp).toLocaleString('pt-BR')}</Typography>
            <Typography>{evento.texto}</Typography>
          </TimelineContent>
        </TimelineItem>
      ));
    }
    const eventos = [
      { timestamp: servico.created_at, texto: `Serviço ${servico.id} criado.` },
      { timestamp: servico.inicio_deslocamento, texto: "Técnico iniciou deslocamento." },
      { timestamp: servico.inicio_apr, texto: "APR iniciada." },
      { timestamp: servico.inicio_atendimento, texto: "Atendimento iniciado no local." },
      { timestamp: servico.fim_atendimento, texto: "Atendimento finalizado." }
    ].filter(e => e.timestamp).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    return eventos.map((evento, index) => (
      <TimelineItem key={index}>
        <TimelineSeparator>
          <TimelineDot color="primary" />
          {index < eventos.length - 1 && <TimelineConnector />}
        </TimelineSeparator>
        <TimelineContent sx={{ py: '12px', px: 2 }}>
          <Typography variant="body2" color="text.secondary">{new Date(evento.timestamp).toLocaleString('pt-BR')}</Typography>
          <Typography>{evento.texto}</Typography>
        </TimelineContent>
      </TimelineItem>
    ));
  };
  
  if (contextLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      
      {/* --- CABEÇALHO ATUALIZADO --- */}
      <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 3 }}>
        <Typography color="primary" variant="h4" component="h1" sx={{ fontWeight: 700, fontSize: { xs: '1.8rem', sm: '2.125rem' } }}>
          {pageTitle}
        </Typography>
        <Button
          variant="contained"
          startIcon={<TuneIcon />}
          onClick={handleOpenFilterModal}
          size="small"
          sx={{ position: 'absolute', right: 0 }} // Estilo para posicionar à direita
        >
          Filtrar
        </Button>
      </Box>

      <Dialog open={isFilterModalOpen} onClose={handleCloseFilterModal} fullWidth maxWidth="xs">
        <DialogTitle>Filtrar Serviços</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <FormControl fullWidth><InputLabel>Técnico</InputLabel><Select value={tempSelectedTecnico} label="Técnico" onChange={(e) => setTempSelectedTecnico(e.target.value)}><MenuItem value="todos">Todos os Técnicos</MenuItem>{tecnicos.map(t => (<MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>))}</Select></FormControl>
            <FormControl fullWidth><InputLabel>Período</InputLabel><Select value={tempSelectedPeriodo} label="Período" onChange={(e) => setTempSelectedPeriodo(e.target.value)}>{periodos.map(p => (<MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>))}</Select></FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}><Button onClick={handleClearFiltersInModal} color="secondary">Limpar</Button><Box sx={{ flexGrow: 1 }} /><Button onClick={handleCloseFilterModal}>Cancelar</Button><Button onClick={handleApplyFilters} variant="contained">Aplicar</Button></DialogActions>
      </Dialog>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {servicos.length > 0 ? (
            servicos.map((servico) => {
              const dataLabel = isHistoricoView && servico.status === 'Finalizado' 
                ? format(new Date(servico.updated_at), "dd/MM/yyyy") 
                : format(new Date(servico.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
              
              const beforeStyle = !isHistoricoView
                ? {
                    content: '""', position: 'absolute', top: 0, left: 0, bottom: 0, width: '5px',
                    background: 'linear-gradient(145deg, #1C204E, #0084F3)',
                    boxShadow: '1px 0px 4px rgba(0, 0, 0, 0.3)',
                  }
                : {};
              const statusColors = getStatusColors(servico.status, theme);

              return (
                <Box key={servico.id} sx={{
                  position: 'relative', borderRadius: 2,
                  width: { xs: 'calc(50% - 9px)', sm: 'calc(50% - 9px)', md: 'calc(33.333% - 11px)', lg: 'calc(25% - 13px)' },
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: `0 8px 25px rgba(0,0,0,0.2)` },
                }}>
                  <Card sx={{
                    height: '100%', width: '100%', display: 'flex', flexDirection: 'column',
                    borderRadius: 2, bgcolor: 'background.paper', position: 'relative', overflow: 'hidden',
                    '&::before': beforeStyle,
                  }}>
                    <CardActionArea onClick={() => handleCardClick(servico)} sx={{ flexGrow: 1, p: { xs: 1.5, sm: 2 } }}>
                      <CardContent sx={{ p: 0 }}>
                        <Typography variant="h6" component="div" gutterBottom sx={{ fontWeight: 'bold', fontSize: { xs: '1rem', sm: '1.25rem' } }}>OS: {servico.id}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}><BusinessIcon sx={{ mr: 1, fontSize: { xs: '1rem', sm: '1.2rem' } }} /><Typography variant="body2" noWrap sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{servico.cliente}</Typography></Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}><EngineeringIcon sx={{ mr: 1, fontSize: { xs: '1rem', sm: '1.2rem' } }} /><Typography variant="body2" noWrap sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{servico.tecnico_nome || 'Não atribuído'}</Typography></Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, flexWrap: 'wrap' }}><CheckCircleOutlineIcon sx={{ mr: 1, fontSize: { xs: '1rem', sm: '1.2rem' } }} /><GradientChip label={servico.status} mainColor={statusColors.main} lightColor={statusColors.light} sx={{minWidth: '110px'}}/></Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}><BuildIcon sx={{ mr: 1, fontSize: { xs: '1rem', sm: '1.2rem' } }} /><Typography variant="body2" noWrap sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{servico.tipoServico || 'Não especificado'}</Typography></Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}><CalendarTodayIcon sx={{ mr: 1, fontSize: { xs: '1rem', sm: '1.2rem' } }} /><Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{dataLabel}</Typography></Box>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Box>
              );
            })
          ) : (
            <Box sx={{ width: '100%' }}>
              <Paper sx={{ p: 3, textAlign: 'center', mt: 3, borderRadius: 2 }}>
                <Typography>Nenhum serviço encontrado para os filtros selecionados.</Typography>
              </Paper>
            </Box>
          )}
        </Box>
      )}

      <Dialog open={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} fullWidth maxWidth="sm">
        {selectedServico && (
          <>
            <DialogTitle sx={{ background: `linear-gradient(145deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`, color: 'white' }}>
              Detalhes do Serviço: {selectedServico.id}
            </DialogTitle>
            <DialogContent sx={{ pt: '20px !important' }}>
              <DialogContentText><b>Cliente:</b> {`[${selectedServico.ic}] - ${selectedServico.cliente}`}</DialogContentText>
              <DialogContentText><b>Endereço:</b> {selectedServico.endereco}</DialogContentText>
              <Divider sx={{ my: 2 }} />
              <DialogContentText><b>Tipo de Serviço:</b></DialogContentText>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{selectedServico.tipoServico}</Typography>
              <DialogContentText><b>Descrição Detalhada:</b></DialogContentText>
              <Typography variant="body2" color="text.secondary" sx={{whiteSpace: 'pre-wrap', p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>{selectedServico.descricao}</Typography>
              <Divider sx={{ my: 3 }}><Chip label="Eventos Principais" icon={<HistoryIcon />} /></Divider>
              <Timeline position="left" sx={{ p: 0, [`& .MuiTimelineItem-root::before`]: { flex: 0, padding: 0 } }}>
                {renderServiceHistory(selectedServico)}
              </Timeline>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setIsDetailsModalOpen(false)}>Fechar</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}