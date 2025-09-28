// MEU-APP-CHAMADOS-FRONTEND/src/pages/OperadorServicosPage.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Button, Divider,
  Autocomplete, TextField, CircularProgress, Alert, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText,
  ToggleButtonGroup, ToggleButton, IconButton, Card, CardContent,
  CardActionArea, CardActions, useTheme
} from '@mui/material';
import { styled, lighten } from '@mui/material/styles';
import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot } from '@mui/lab';
import axios from 'axios';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import HistoryIcon from '@mui/icons-material/History';
import { useAppContext } from '../context/AppContext.jsx';

const API_URL = import.meta.env.VITE_API_BASE_URL;

// --- COMPONENTES ESTILIZADOS ---

const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(145deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  color: theme.palette.primary.contrastText,
  fontWeight: 'bold',
  '&:hover': {
    background: `linear-gradient(145deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
  },
}));

const GradientTypography = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 50%, ${theme.palette.primary.main} 100%)`,
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
}));

const getStatusColors = (status, theme) => {
  let mainColor, lightColor;

  switch(status) {
    case 'Em Andamento':
    case 'Pausado':
      mainColor = theme.palette.warning.main;
      lightColor = lighten(mainColor, 0.3);
      break;
    case 'Atribuído ao Técnico':
    case 'Em Deslocamento':
      mainColor = theme.palette.primary.main;
      lightColor = lighten(mainColor, 0.4);
      break;
    case 'Finalizado':
      mainColor = theme.palette.success.main;
      lightColor = lighten(mainColor, 0.3);
      break;
    case 'Aguardando na Fila':
    case 'Aguardando Atribuição':
      mainColor = theme.palette.info.main;
      lightColor = lighten(mainColor, 0.3);
      break;
    default:
      mainColor = theme.palette.grey[500];
      lightColor = theme.palette.grey[300];
      break;
  }
  return { main: mainColor, light: lightColor };
};


const GradientChip = ({ label, status, ...props }) => {
  const theme = useTheme();
  const statusColors = getStatusColors(status, theme);
  return (
    <Chip
      label={label}
      size="small"
      sx={{
        fontWeight: 'bold',
        background: `linear-gradient(90deg, ${statusColors.light}, ${statusColors.main})`,
        color: theme.palette.getContrastText(statusColors.main),
        ...props.sx,
      }}
      {...props}
    />
  );
};

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

// --- COMPONENTE PRINCIPAL ---

export default function OperadorServicosPage() {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const { socket } = useAppContext();
  const theme = useTheme();
  
  const [servicos, setServicos] = useState([]);
  const [users, setUsers] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, setFormState] = useState({ cliente: null, descricao: '', tipoServico: '', tags: '' });
  
  const [atribuicaoDialogOpen, setAtribuicaoDialogOpen] = useState(false);
  const [servicoParaAtribuir, setServicoParaAtribuir] = useState(null);
  const [tecnicoSelecionado, setTecnicoSelecionado] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [servicoParaDeletar, setServicoParaDeletar] = useState(null);
  const [view, setView] = useState('ativos');
  
  const [selectedServico, setSelectedServico] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      const headers = { headers: { Authorization: `Bearer ${token}` } };
      const [servicosRes, usersRes, clientesRes] = await Promise.all([
        axios.get(`${API_URL}/servicos`, headers),
        axios.get(`${API_URL}/users`, headers),
        axios.get(`${API_URL}/clientes`, headers),
      ]);
      setServicos(servicosRes.data || []);
      setUsers(usersRes.data || []);
      setClientes(clientesRes.data || []);
    } catch (err) { setError("Falha ao carregar dados."); } 
    finally { setLoading(false); }
  }, []);

  useEffect(() => { setLoading(true); fetchData(); }, [fetchData]);

  // --- LÓGICA DE SOCKET.IO OTIMIZADA ---
  useEffect(() => {
    if (socket) {
      const handleNovoServico = (novoServico) => {
        setServicos(prev => [novoServico, ...prev.filter(s => s.id !== novoServico.id)]);
      };
      const handleServicoAtualizado = (servicoAtualizado) => {
        setServicos(prev => prev.map(s => s.id === servicoAtualizado.id ? servicoAtualizado : s));
      };
      const handleServicoDeletado = (data) => {
        setServicos(prev => prev.filter(s => s.id !== data.id));
      };

      socket.on('novo_servico', handleNovoServico);
      socket.on('servico_atualizado', handleServicoAtualizado);
      socket.on('servico_deletado', handleServicoDeletado);

      return () => {
        socket.off('novo_servico', handleNovoServico);
        socket.off('servico_atualizado', handleServicoAtualizado);
        socket.off('servico_deletado', handleServicoDeletado);
      };
    }
  }, [socket]);

  const tecnicos = useMemo(() => users.filter(user => user.role === 'TECNICO'), [users]);
  const servicosAtivos = useMemo(() => servicos.filter(servico => servico.status !== 'Finalizado' && servico.status !== 'Cancelado'), [servicos]);
  const servicosFinalizados = useMemo(() => servicos.filter(servico => servico.status === 'Finalizado' || servico.status === 'Cancelado'), [servicos]);
  const listaParaExibir = view === 'ativos' ? servicosAtivos : servicosFinalizados;
  const tituloDaLista = view === 'ativos' ? 'Serviços Ativos' : 'Histórico de Serviços';

  // --- CORREÇÃO 1: ATUALIZAÇÃO IMEDIATA AO CRIAR ---
  const handleCreateServico = async () => {
    if (!formState.cliente || !formState.descricao || !formState.tipoServico) {
      enqueueSnackbar('Preencha todos os campos obrigatórios (*).', { variant: 'warning' });
      return;
    }
    setIsSubmitting(true);
    const dadosParaEnviar = { ic: formState.cliente.ic, descricao: formState.descricao, tipoServico: formState.tipoServico, tags: formState.tags.trim() };
    try {
      const response = await axios.post(`${API_URL}/servicos`, dadosParaEnviar, { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } });
      setServicos(prev => [response.data, ...prev]);
      enqueueSnackbar('Novo serviço criado!', { variant: 'success' });
      setFormState({ cliente: null, descricao: '', tipoServico: '', tags: '' });
    } catch (error) {
      enqueueSnackbar(error.response?.data?.error || "Falha ao criar o serviço.", { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleOpenAtribuicaoDialog = (servico, event) => { event.stopPropagation(); setServicoParaAtribuir(servico); const tecnicoAtual = tecnicos.find(t => t.id === servico.tecnico_id) || null; setTecnicoSelecionado(tecnicoAtual); setAtribuicaoDialogOpen(true); };
  
  // --- CORREÇÃO 2: ATUALIZAÇÃO IMEDIATA AO ATRIBUIR ---
  const handleConfirmarAtribuicao = async () => {
    if (!servicoParaAtribuir) return;
    const isUnassigning = !tecnicoSelecionado || tecnicoSelecionado.id === null;
    let payload = isUnassigning ? { tecnico_id: null, status: 'Aguardando Atribuição' } : { tecnico_id: tecnicoSelecionado.id, status: 'Atribuído ao Técnico' };
    setIsSubmitting(true);
    try {
      const response = await axios.patch(`${API_URL}/servicos/${servicoParaAtribuir.id}`, payload, { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } });
      const servicoAtualizado = response.data;
      setServicos(prev => prev.map(s => s.id === servicoAtualizado.id ? servicoAtualizado : s));
      enqueueSnackbar(isUnassigning ? 'Atribuição removida.' : 'Serviço atribuído.', { variant: 'success' });
      setAtribuicaoDialogOpen(false);
    } catch (error) {
      enqueueSnackbar(error.response?.data?.error || "Falha ao atualizar.", { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDeleteDialog = (servico, event) => { event.stopPropagation(); setServicoParaDeletar(servico); setDeleteConfirmOpen(true); };
  
  // --- CORREÇÃO 3: ATUALIZAÇÃO IMEDIATA AO DELETAR ---
  const handleConfirmDelete = async () => {
    if (!servicoParaDeletar) return;
    setIsSubmitting(true);
    try {
      await axios.delete(`${API_URL}/servicos/${servicoParaDeletar.id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } });
      setServicos(prev => prev.filter(s => s.id !== servicoParaDeletar.id));
      enqueueSnackbar('Serviço excluído.', { variant: 'info' });
      setDeleteConfirmOpen(false);
    } catch (error) {
      enqueueSnackbar(error.response?.data?.error || "Falha ao excluir.", { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectServico = (servico) => {
    setSelectedServico(servico);
    setIsDetailsModalOpen(true);
  };

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
    ].filter(e => e.timestamp)
     .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

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


  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  if (error) return <Box sx={{ p: 3 }}><Alert severity="error">{error}</Alert></Box>;

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <GradientTypography variant="h4" component="h1">Gerenciar Serviços</GradientTypography>
      </Box>

      <Paper elevation={4} sx={{ borderRadius: 3, overflow: 'hidden', mb: 4, p: 0 }}>
        <Box sx={{ p: { xs: 2, sm: 3 }, background: `linear-gradient(145deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`, color: 'white', textAlign: 'center' }}>
            <Typography variant="h6" fontWeight="bold">Novo Serviço</Typography>
        </Box>
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <Autocomplete options={clientes} getOptionLabel={(option) => `${option.nome} - ${option.ic}`} value={formState.cliente} onChange={(e, value) => setFormState({ ...formState, cliente: value })} renderInput={(params) => <TextField {...params} label="Pesquisar Cliente *" />} sx={{ mb: 2 }} />
          <TextField label="Tipo de Serviço *" fullWidth value={formState.tipoServico} onChange={(e) => setFormState({ ...formState, tipoServico: e.target.value })} sx={{ mb: 2 }} helperText="Ex: Manutenção Preventiva" />
          <TextField label="Descrição Detalhada *" fullWidth multiline rows={4} value={formState.descricao} onChange={(e) => setFormState({ ...formState, descricao: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Tags (separadas por vírgula)" fullWidth value={formState.tags} onChange={(e) => setFormState({ ...formState, tags: e.target.value })} />
          <GradientButton fullWidth sx={{ mt: 2 }} onClick={handleCreateServico} disabled={isSubmitting}>{isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Criar Serviço'}</GradientButton>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <GradientTypography variant="h6">{tituloDaLista} ({listaParaExibir.length})</GradientTypography>
        <ToggleButtonGroup value={view} exclusive onChange={(e, newView) => { if (newView) setView(newView); }} size="small">
          <ToggleButton value="ativos">Ativos</ToggleButton>
          <ToggleButton value="finalizados">Histórico</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {listaParaExibir.length > 0 ? listaParaExibir.map(servico => {
          const podeApagar = !['Em Andamento', 'Pausado', 'Finalizado'].includes(servico.status);
          const statusColors = getStatusColors(servico.status, theme);
          const isBlueStatus = ['Atribuído ao Técnico', 'Em Deslocamento', 'Aguardando na Fila', 'Aguardando Atribuição'].includes(servico.status);

          const beforeStyle = isBlueStatus
            ? { 
                content: '""', position: 'absolute', top: 0, left: 0, bottom: 0, width: '5px',
                background: 'linear-gradient(145deg, #1C204E, #0084F3)',
                boxShadow: '1px 0px 4px rgba(0, 0, 0, 0.3)',
              }
            : {
                content: '""', position: 'absolute', top: 0, left: 0, bottom: 0, width: '5px',
                background: `linear-gradient(180deg, ${statusColors.main}, ${statusColors.light})`,
              };

          return (
            <Box key={servico.id} sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(33.333% - 11px)' } }}>
              <Card sx={{
                  width: '100%', borderRadius: 2, display: 'flex', flexDirection: 'column', height: '100%',
                  position: 'relative', overflow: 'hidden', bgcolor: 'background.paper',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
                  '&::before': beforeStyle,
              }}>
                <CardActionArea onClick={() => handleSelectServico(servico)} sx={{ flexGrow: 1, p: 1.5 }}>
                  <CardContent sx={{ p: 0 }}>
                    <Typography variant="body2" color="text.secondary">{servico.id}</Typography>
                    <Typography variant="h6" component="div" noWrap sx={{ fontWeight: 'bold', fontSize: '1rem' }}>{`[${servico.ic}] ${servico.cliente}`}</Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>{servico.descricao}</Typography>
                    <GradientChip label={servico.status} status={servico.status} sx={{ mt: 1 }} />
                    {servico.tecnico_name && <Typography variant="caption" display="block" sx={{ mt: 1 }}>Téc: {servico.tecnico_name}</Typography>}
                  </CardContent>
                </CardActionArea>
                {view === 'ativos' && (
                  <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
                    <Button size="small" startIcon={servico.tecnico_id ? <EditIcon /> : <PersonAddIcon />} onClick={(e) => handleOpenAtribuicaoDialog(servico, e)}>
                      {servico.tecnico_id ? 'Trocar' : 'Atribuir'}
                    </Button>
                    {podeApagar && (<IconButton size="small" color="error" onClick={(e) => handleOpenDeleteDialog(servico, e)}><DeleteIcon fontSize="small" /></IconButton>)}
                  </CardActions>
                )}
              </Card>
            </Box>
          )
        }) : (
          <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2, width: '100%' }}>
            <Typography>{view === 'ativos' ? 'Nenhum serviço ativo.' : 'Nenhum serviço no histórico.'}</Typography>
          </Paper>
        )}
      </Box>

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
      
      <Dialog open={atribuicaoDialogOpen} onClose={() => setAtribuicaoDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Atribuir Serviço</DialogTitle>
        <DialogContent>
          <Typography variant="h6">{servicoParaAtribuir?.id}</Typography>
          <Autocomplete options={tecnicos} getOptionLabel={(option) => option.name} value={tecnicoSelecionado} onChange={(e, value) => setTecnicoSelecionado(value)} renderInput={(params) => <TextField {...params} label="Técnico" />} sx={{ mt: 2 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAtribuicaoDialogOpen(false)}>Cancelar</Button>
          <GradientButton onClick={handleConfirmarAtribuicao} disabled={isSubmitting}>{isSubmitting ? <CircularProgress size={24}/> : 'Confirmar'}</GradientButton>
        </DialogActions>
      </Dialog>
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent><DialogContentText>Deseja excluir o serviço <strong>{servicoParaDeletar?.id}</strong>?</DialogContentText></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancelar</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">Excluir</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}