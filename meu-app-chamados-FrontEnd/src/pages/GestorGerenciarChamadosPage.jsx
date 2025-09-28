// MEU-APP-CHAMADOS-FRONTEND/src/pages/GestorGerenciarChamadosPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, CircularProgress, Alert, Paper, Chip,
  FormControl, InputLabel, Select, MenuItem, Button, Card, CardContent,
  CardActionArea, Dialog, DialogTitle, DialogContent, DialogActions, Stack,
  IconButton, useTheme, Divider, DialogContentText
} from '@mui/material';
import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot } from '@mui/lab';
import { lighten } from '@mui/material/styles';
import { useAppContext } from '../context/AppContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import BusinessIcon from '@mui/icons-material/Business';
import EngineeringIcon from '@mui/icons-material/Engineering';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TuneIcon from '@mui/icons-material/Tune';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
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
    case 'Aguardando na Fila':
    case 'Aguardando Atribuição':
      mainColor = theme.palette.info.main;
      break;
    default:
      mainColor = theme.palette.grey[500];
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

const periodos = [
  { value: 'sempre', label: 'Desde o Início' }, { value: 'semana', label: 'Última Semana' },
  { value: '15dias', label: 'Últimos 15 Dias' }, { value: '30dias', label: 'Últimos 30 Dias' },
  { value: '60dias', label: 'Últimos 60 Dias' }, { value: '90dias', label: 'Últimos 90 Dias' },
  { value: '360dias', label: 'Último Ano' },
];

export default function GestorGerenciarChamadosPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { socket, loading: contextLoading } = useAppContext();
  const [chamados, setChamados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tecnicos, setTecnicos] = useState([]);
  const [selectedTecnico, setSelectedTecnico] = useState('todos');
  const [selectedPeriodo, setSelectedPeriodo] = useState('sempre');
  const [isHistoricoView, setIsHistoricoView] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [tempSelectedTecnico, setTempSelectedTecnico] = useState('todos');
  const [tempSelectedPeriodo, setTempSelectedPeriodo] = useState('sempre');

  // --- NOVOS ESTADOS PARA O MODAL DE DETALHES ---
  const [selectedChamado, setSelectedChamado] = useState(null);
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
      const url = historicoAtivado ? `${API_URL}/chamados/historico` : `${API_URL}/chamados/fila-gestor`;
      const params = historicoAtivado ? { tecnicoId: selectedTecnico, periodo: selectedPeriodo } : {};
      const response = await axios.get(url, { headers: { Authorization: `Bearer ${token}` }, params });
      setChamados(response.data || []);
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
    if (!socket) return; // Removido isHistoricoView para que o modal possa ser atualizado
    const handleNovoChamado = (novoChamado) => {
        if (!isHistoricoView) setChamados(prev => [novoChamado, ...prev]);
    };
    const handleChamadoAtualizado = (chamadoAtualizado) => {
        setChamados(prev => prev.map(c => c.id === chamadoAtualizado.id ? chamadoAtualizado : c));
        // Atualiza o chamado no modal se ele estiver aberto
        if (selectedChamado && selectedChamado.id === chamadoAtualizado.id) {
          setSelectedChamado(chamadoAtualizado);
        }
    };
    const handleChamadoDeletado = (data) => {
        if (!isHistoricoView) setChamados(prev => prev.filter(c => c.id !== data.id));
    };
    
    socket.on('novo_chamado', handleNovoChamado);
    socket.on('chamado_atualizado', handleChamadoAtualizado);
    socket.on('chamado_deletado', handleChamadoDeletado);

    return () => {
      socket.off('novo_chamado', handleNovoChamado);
      socket.off('chamado_atualizado', handleChamadoAtualizado);
      socket.off('chamado_deletado', handleChamadoDeletado);
    };
  }, [socket, isHistoricoView, selectedChamado]);

  // --- AÇÃO DE CLIQUE ATUALIZADA ---
  const handleCardClick = (chamado) => {
    setSelectedChamado(chamado);
    setIsDetailsModalOpen(true);
  };
  
  const handleOpenFilterModal = () => { setTempSelectedTecnico(selectedTecnico); setTempSelectedPeriodo(selectedPeriodo); setIsFilterModalOpen(true); };
  const handleCloseFilterModal = () => { setIsFilterModalOpen(false); };
  const handleApplyFilters = () => { setSelectedTecnico(tempSelectedTecnico); setSelectedPeriodo(tempSelectedPeriodo); handleCloseFilterModal(); };
  const handleClearFiltersInModal = () => { setTempSelectedTecnico('todos'); setTempSelectedPeriodo('sempre'); };
  const pageTitle = isHistoricoView ? 'Histórico de Chamados' : 'Fila de Chamados';

  if (contextLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ width: '100%', boxSizing: 'border-box', overflowX: 'hidden', p: { xs: 2, sm: 3 } }}>
      <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 4 }}>
        <Typography color="primary" variant="h4" component="h1" sx={{ fontWeight: 700, fontSize: { xs: '1.8rem', sm: '2.125rem' } }}>
          {pageTitle}
        </Typography>
        <IconButton
          color="primary"
          onClick={handleOpenFilterModal}
          sx={{ position: 'absolute', right: 0, backgroundColor: 'primary.main', color: 'primary.contrastText', '&:hover': { backgroundColor: 'primary.dark' } }}
        >
          <TuneIcon />
        </IconButton>
      </Box>

      <Dialog open={isFilterModalOpen} onClose={handleCloseFilterModal} fullWidth maxWidth="xs">
        <DialogTitle>Filtrar Chamados</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Técnico</InputLabel>
              <Select value={tempSelectedTecnico} label="Técnico" onChange={(e) => setTempSelectedTecnico(e.target.value)}>
                <MenuItem value="todos">Todos os Técnicos</MenuItem>
                {tecnicos.map(t => (<MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Período</InputLabel>
              <Select value={tempSelectedPeriodo} label="Período" onChange={(e) => setTempSelectedPeriodo(e.target.value)}>
                {periodos.map(p => (<MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClearFiltersInModal} color="secondary">Limpar</Button>
          <Box sx={{ flexGrow: 1 }} />
          <Button onClick={handleCloseFilterModal}>Cancelar</Button>
          <Button autoFocus onClick={handleApplyFilters} variant="contained">Aplicar</Button>
        </DialogActions>
      </Dialog>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {chamados.length > 0 ? (
            chamados.map((chamado) => {
              const dataLabel = isHistoricoView && chamado.status === 'Finalizado'
                ? format(new Date(chamado.updated_at), "dd/MM/yyyy")
                : format(new Date(chamado.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
              const prioridade = chamado.prioridade || 'baixa';
              const isDevolvido = chamado.status === 'Devolvido';
              const tags = parseJsonArray(chamado.tags, []);

              const beforeStyle = !isHistoricoView
                ? {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: '5px',
                    background: 'linear-gradient(145deg, #1C204E, #0084F3)',
                    boxShadow: '1px 0px 4px rgba(0, 0, 0, 0.3)',
                  }
                : {};

              const statusColors = getStatusColors(chamado.status, theme);
              const priorityColors = getPriorityColors(prioridade, theme);

              return (
                <Box
                  key={chamado.id}
                  sx={{
                    position: 'relative',
                    borderRadius: 2,
                    width: {
                      xs: 'calc(50% - 9px)',
                      sm: 'calc(50% - 9px)',
                      md: 'calc(33.333% - 11px)',
                      lg: 'calc(25% - 13px)'
                    },
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 8px 25px rgba(0,0,0,0.2)`,
                    },
                  }}
                >
                  {isDevolvido && (
                    <Box sx={{
                      position: 'absolute', top: 0, left: 0, width: '100%',
                      backgroundColor: 'error.main', color: 'white', p: 0.5,
                      textAlign: 'center', zIndex: 1,
                      borderTopLeftRadius: theme.shape.borderRadius * 2,
                      borderTopRightRadius: theme.shape.borderRadius * 2,
                    }}>
                      <Typography variant="caption" sx={{ fontWeight: 'bold' }}>DEVOLVIDO</Typography>
                    </Box>
                  )}

                  <Card sx={{
                    height: '100%', width: '100%', display: 'flex', flexDirection: 'column',
                    borderRadius: 2, bgcolor: 'background.paper',
                    mt: isDevolvido ? '28px' : 0, position: 'relative', overflow: 'hidden',
                    '&::before': beforeStyle,
                  }}>
                    {/* Ação de clique passa o objeto 'chamado' inteiro */}
                    <CardActionArea onClick={() => handleCardClick(chamado)} sx={{ flexGrow: 1, p: { xs: 1.25, sm: 2 } }}>
                      <CardContent sx={{ p: 0 }}>
                        <Typography variant="h6" component="div" gutterBottom sx={{ fontWeight: 'bold', fontSize: { xs: '0.9rem', sm: '1.25rem' }, color: 'text.primary' }}>
                          OS: {chamado.id}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, minWidth: 0, color: 'text.secondary' }}>
                          <BusinessIcon sx={{ mr: 1, fontSize: { xs: '1rem', sm: '1.2rem' } }} />
                          <Typography variant="body2" noWrap sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                            {chamado.cliente}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, minWidth: 0, color: 'text.secondary' }}>
                          <EngineeringIcon sx={{ mr: 1, fontSize: { xs: '1rem', sm: '1.2rem' } }} />
                          <Typography variant="body2" noWrap sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                            {chamado.tecnico_nome || 'Não atribuído'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, flexWrap: 'wrap' }}>
                            <CheckCircleOutlineIcon sx={{ mr: 1, fontSize: { xs: '1rem', sm: '1.2rem' }, color: 'text.secondary' }} />
                            {!isDevolvido && (
                               <GradientChip label={chamado.status} mainColor={statusColors.main} lightColor={statusColors.light} sx={{minWidth: '110px'}}/>
                            )}
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: 'text.secondary' }}>
                          <PriorityHighIcon sx={{ mr: 1, fontSize: { xs: '1rem', sm: '1.2rem' } }} />
                           <GradientChip label={prioridade.toUpperCase()} mainColor={priorityColors.main} lightColor={priorityColors.light} />
                        </Box>
                        {tags.length > 0 && (
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 0.5, color: 'text.secondary' }}>
                            <LocalOfferIcon sx={{ mr: 1, fontSize: { xs: '1rem', sm: '1.2rem' } }} />
                            {tags.map(tag => (
                              <Chip key={tag.id || tag.nome} label={tag.nome} size="small" variant="outlined" />
                            ))}
                          </Box>
                        )}
                        <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                          <CalendarTodayIcon sx={{ mr: 1, fontSize: { xs: '1rem', sm: '1.2rem' } }} />
                          <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                            {dataLabel}
                          </Typography>
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Box>
              );
            })
          ) : (
            <Box sx={{ width: '100%' }}>
              <Paper sx={{ p: 3, textAlign: 'center', mt: 3, borderRadius: 2 }}>
                <Typography>
                  Nenhum chamado encontrado para os filtros selecionados.
                </Typography>
              </Paper>
            </Box>
          )}
        </Box>
      )}

      {/* --- NOVO MODAL DE DETALHES --- */}
      <Dialog open={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} fullWidth maxWidth="sm">
        {selectedChamado && (
          <>
            <DialogTitle sx={{ background: `linear-gradient(145deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`, color: 'white' }}>
              Detalhes do Chamado: {selectedChamado.id}
            </DialogTitle>
            <DialogContent sx={{ pt: '20px !important' }}>
                <DialogContentText><b>Cliente:</b> {`[${selectedChamado.ic}] - ${selectedChamado.cliente}`}</DialogContentText>
                <DialogContentText><b>Endereço:</b> {selectedChamado.endereco}</DialogContentText>
                <Divider sx={{ my: 2 }} />
                <DialogContentText><b>Descrição do Problema:</b></DialogContentText>
                <Typography variant="body2" color="text.secondary" sx={{whiteSpace: 'pre-wrap', p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>{selectedChamado.descricao}</Typography>
                
                <Divider sx={{ my: 3 }}><Chip label="Histórico de Eventos" icon={<HistoryIcon />} /></Divider>
                <Timeline position="left" sx={{ p: 0, [`& .MuiTimelineItem-root::before`]: { flex: 0, padding: 0 } }}>
                  {parseJsonArray(selectedChamado.historico).map((evento, index) => (
                    <TimelineItem key={index}>
                      <TimelineSeparator>
                        <TimelineDot color="primary" />
                        {index < parseJsonArray(selectedChamado.historico).length - 1 && <TimelineConnector />}
                      </TimelineSeparator>
                      <TimelineContent sx={{ py: '12px', px: 2 }}>
                        <Typography variant="body2" color="text.secondary">{new Date(evento.timestamp).toLocaleString('pt-BR')}</Typography>
                        <Typography>{evento.texto}</Typography>
                      </TimelineContent>
                    </TimelineItem>
                  ))}
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