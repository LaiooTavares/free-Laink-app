// MEU-APP-CHAMADOS-FRONTEND/src/pages/OperadorGerenciarChamadosPage.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSnackbar } from 'notistack';
import { 
  Box, Typography, Card, CardContent, Button, Divider, 
  Autocomplete, TextField, Chip, Paper, IconButton, CircularProgress, Alert,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  ToggleButtonGroup, ToggleButton, CardActionArea, useTheme
} from '@mui/material';
import { styled, lighten } from '@mui/material/styles';
import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot } from '@mui/lab';
import axios from 'axios';
import { useAppContext } from '../context/AppContext.jsx';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import HistoryIcon from '@mui/icons-material/History';

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

const GradientButtonError = styled(Button)(({ theme }) => ({
  background: `linear-gradient(145deg, ${theme.palette.error.main}, ${theme.palette.error.light})`,
  color: theme.palette.error.contrastText,
  fontWeight: 'bold',
  '&:hover': {
    background: `linear-gradient(145deg, ${theme.palette.error.dark}, ${theme.palette.error.main})`,
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
    case 'Devolvido':
    case 'Cancelado':
       mainColor = theme.palette.error.main;
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

export default function OperadorGerenciarChamadosPage() {
  const { enqueueSnackbar } = useSnackbar();
  const { socket } = useAppContext();
  const theme = useTheme();
  const [chamados, setChamados] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedChamado, setSelectedChamado] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [newChamadoForm, setNewChamadoForm] = useState({ cliente: null, descricao: '', tags: '' });
  const [editChamadoForm, setEditChamadoForm] = useState({ descricao: '', tags: '' });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [view, setView] = useState('pendentes');

  const fetchData = useCallback(async () => {
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      const headers = { headers: { Authorization: `Bearer ${token}` } };
      const [chamadosRes, clientesRes] = await Promise.all([
        axios.get(`${API_URL}/chamados`, headers),
        axios.get(`${API_URL}/clientes`, headers),
      ]);
      setChamados(chamadosRes.data || []);
      setClientes(clientesRes.data || []);
    } catch (err) {
      setError("Falha ao carregar os dados da página.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (socket) {
      const handleNovoChamado = (novoChamado) => {
        setChamados(prevChamados => [novoChamado, ...prevChamados.filter(c => c.id !== novoChamado.id)]);
      };
      const handleChamadoAtualizado = (chamadoAtualizado) => {
        setChamados(prevChamados => prevChamados.map(c => c.id === chamadoAtualizado.id ? chamadoAtualizado : c));
        if (selectedChamado && selectedChamado.id === chamadoAtualizado.id) {
            setSelectedChamado(chamadoAtualizado);
        }
      };
      const handleChamadoDeletado = (data) => {
        setChamados(prevChamados => prevChamados.filter(c => c.id !== data.id));
      };
      
      socket.on('novo_chamado', handleNovoChamado);
      socket.on('chamado_atualizado', handleChamadoAtualizado);
      socket.on('chamado_deletado', handleChamadoDeletado);
      
      return () => {
        socket.off('novo_chamado', handleNovoChamado);
        socket.off('chamado_atualizado', handleChamadoAtualizado);
        socket.off('chamado_deletado', handleChamadoDeletado);
      };
    }
  }, [socket, selectedChamado]);

  const statusDeHistorico = ['Finalizado', 'Cancelado', 'Devolvido'];
  const chamadosPendentes = useMemo(() => chamados.filter(c => !statusDeHistorico.includes(c.status)), [chamados]);
  const chamadosFinalizados = useMemo(() => chamados.filter(c => statusDeHistorico.includes(c.status)), [chamados]);
  const listaParaExibir = view === 'pendentes' ? chamadosPendentes : chamadosFinalizados;
  const tituloDaLista = view === 'pendentes' ? 'Chamados Pendentes' : 'Histórico de Chamados';

  const handleSelectChamado = (chamado) => {
    setSelectedChamado(chamado);
    setEditChamadoForm({ descricao: chamado.descricao, tags: parseJsonArray(chamado.tags).map(t => t.nome).join(', ') });
    setIsEditing(false);
    setIsDetailsModalOpen(true);
  };

  // --- CORREÇÃO 1: ATUALIZAÇÃO IMEDIATA AO CRIAR ---
  const handleCreateChamado = async () => {
    if (!newChamadoForm.cliente || !newChamadoForm.descricao) {
      enqueueSnackbar('Selecione um cliente e preencha a descrição.', { variant: 'warning' });
      return;
    }
    const tagsArray = newChamadoForm.tags.split(',').map(tag => ({ nome: tag.trim() })).filter(t => t.nome);
    const dadosParaEnviar = { ic: newChamadoForm.cliente.ic, descricao: newChamadoForm.descricao, tags: JSON.stringify(tagsArray) };
    try {
      const response = await axios.post(`${API_URL}/chamados`, dadosParaEnviar, { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } });
      const novoChamado = response.data;
      setChamados(prevChamados => [novoChamado, ...prevChamados]);
      enqueueSnackbar('Novo chamado criado com sucesso!', { variant: 'success' });
      setNewChamadoForm({ cliente: null, descricao: '', tags: '' });
    } catch (error) {
      enqueueSnackbar(error.response?.data?.error || "Falha ao criar o chamado.", { variant: 'error' });
    }
  };

  // --- CORREÇÃO 2: ATUALIZAÇÃO IMEDIATA AO EDITAR ---
  const handleUpdateChamado = async () => {
    const tagsArray = editChamadoForm.tags.split(',').map(tag => ({ nome: tag.trim() })).filter(t => t.nome);
    const dataToUpdate = { descricao: editChamadoForm.descricao, tags: JSON.stringify(tagsArray) };
    try {
      const response = await axios.patch(`${API_URL}/chamados/${selectedChamado.id}`, dataToUpdate, { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } });
      const chamadoAtualizado = response.data;
      setChamados(prevChamados => prevChamados.map(c => c.id === chamadoAtualizado.id ? chamadoAtualizado : c));
      setSelectedChamado(chamadoAtualizado);
      enqueueSnackbar('Chamado atualizado com sucesso!', { variant: 'success' });
      setIsEditing(false);
    } catch (error) {
      enqueueSnackbar(error.response?.data?.error || "Falha ao atualizar o chamado.", { variant: 'error' });
    }
  };

  // --- CORREÇÃO 3: ATUALIZAÇÃO IMEDIATA AO DELETAR ---
  const handleDeleteChamado = async () => {
    if (!selectedChamado) return;
    try {
      await axios.delete(`${API_URL}/chamados/${selectedChamado.id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } });
      setChamados(prevChamados => prevChamados.filter(c => c.id !== selectedChamado.id));
      enqueueSnackbar('Chamado excluído com sucesso!', { variant: 'info' });
      setDeleteConfirmOpen(false);
      setIsDetailsModalOpen(false);
    } catch (error) {
      enqueueSnackbar(error.response?.data?.error || "Falha ao excluir o chamado.", { variant: 'error' });
    }
  };
  
  const handleDeleteClick = (chamado, event) => {
    event.stopPropagation();
    setSelectedChamado(chamado);
    setDeleteConfirmOpen(true);
  };
  
  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  if (error) return <Box sx={{ p: 3 }}><Alert severity="error">{error}</Alert></Box>;

  return (
    <Box sx={{ width: '100%', boxSizing: 'border-box', overflowX: 'hidden', p: { xs: 2, sm: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 4 }}>
        <GradientTypography variant="h4" component="h1">Gerenciar Chamados</GradientTypography>
      </Box>

      <Paper elevation={4} sx={{ borderRadius: 3, overflow: 'hidden', mb: 4, p: 0 }}>
        <Box sx={{ p: { xs: 2, sm: 3 }, background: `linear-gradient(145deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`, color: 'white' }}>
          <Typography variant="h6" fontWeight="bold">Novo Chamado</Typography>
        </Box>
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <Autocomplete options={clientes} getOptionLabel={(option) => `${option.nome} - ${option.ic}`} value={newChamadoForm.cliente} onChange={(e, value) => setNewChamadoForm({...newChamadoForm, cliente: value})} renderInput={(params) => <TextField {...params} label="Pesquisar Cliente *" />} sx={{ mb: 2 }} />
          <TextField label="Descrição do Problema *" fullWidth multiline rows={4} value={newChamadoForm.descricao} onChange={(e) => setNewChamadoForm({...newChamadoForm, descricao: e.target.value})} sx={{ mb: 2 }} />
          <TextField label="Tags (separadas por vírgula)" fullWidth value={newChamadoForm.tags} onChange={(e) => setNewChamadoForm({...newChamadoForm, tags: e.target.value})} helperText="Ex: elevador parado, barulho estranho" />
          <GradientButton fullWidth sx={{ mt: 2 }} onClick={handleCreateChamado}>Criar</GradientButton>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <GradientTypography variant="h6">{tituloDaLista} ({listaParaExibir.length})</GradientTypography>
        <ToggleButtonGroup value={view} exclusive onChange={(event, newView) => { if (newView !== null) setView(newView); }} size="small">
          <ToggleButton value="pendentes">Pendentes</ToggleButton>
          <ToggleButton value="finalizados">Histórico</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {listaParaExibir.length > 0 ? listaParaExibir.map(chamado => {
          const statusColors = getStatusColors(chamado.status, theme);
          const isBlueStatus = ['Atribuído ao Técnico', 'Em Deslocamento', 'Aguardando na Fila', 'Aguardando Atribuição'].includes(chamado.status);

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
            <Box key={chamado.id} sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(33.333% - 11px)', lg: 'calc(25% - 12px)' } }}>
              <Card sx={{
                  width: '100%', borderRadius: 2, display: 'flex', flexDirection: 'column', height: '100%',
                  position: 'relative', overflow: 'hidden', bgcolor: 'background.paper',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
                  '&::before': beforeStyle,
              }}>
                <CardActionArea onClick={() => handleSelectChamado(chamado)} sx={{ p: 1.5, display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'flex-start' }}>
                  <CardContent sx={{ p: 0, width: '100%', flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>{chamado.id}</Typography>
                      {view === 'pendentes' && (
                        <IconButton size="small" sx={{ color: 'text.secondary' }} onClick={(e) => handleDeleteClick(chamado, e)}><DeleteIcon fontSize="small"/></IconButton>
                      )}
                    </Box>
                    <Typography variant="h6" component="div" noWrap sx={{ fontWeight: 'bold', fontSize: { xs: '0.8rem', sm: '1rem' } }}>
                      {`[${chamado.ic}] ${chamado.cliente}`}
                    </Typography>
                    <Typography variant="body2" noWrap sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' }, color: 'text.secondary', mb: 1 }}>
                      {chamado.descricao}
                    </Typography>
                  </CardContent>
                  <GradientChip label={chamado.status} status={chamado.status} sx={{ alignSelf: 'flex-start' }} />
                </CardActionArea>
              </Card>
            </Box>
          )}) : (
          <Box sx={{ width: '100%' }}>
            <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
              <Typography>{view === 'pendentes' ? 'Nenhum chamado pendente no momento.' : 'Nenhum chamado no histórico.'}</Typography>
            </Paper>
          </Box>
        )}
      </Box>
      
      <Dialog open={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} fullWidth maxWidth="sm">
        {selectedChamado && (
          <>
            <DialogTitle sx={{ background: `linear-gradient(145deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`, color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Detalhes: {selectedChamado.id}
              {view === 'pendentes' && !isEditing && (
                <IconButton sx={{ color: 'white' }} onClick={() => setIsEditing(true)}><EditIcon /></IconButton>
              )}
            </DialogTitle>
            <DialogContent sx={{ pt: '20px !important' }}>
              {isEditing ? (
                <Box sx={{ pt: 1 }}>
                  <TextField label="Descrição do Problema" fullWidth multiline rows={6} value={editChamadoForm.descricao} onChange={(e) => setEditChamadoForm({...editChamadoForm, descricao: e.target.value})} sx={{ mb: 2 }} />
                  <TextField label="Tags" fullWidth value={editChamadoForm.tags} onChange={(e) => setEditChamadoForm({...editChamadoForm, tags: e.target.value})} />
                </Box>
              ) : (
                <>
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
                </>
              )}
            </DialogContent>
            <DialogActions>
              {isEditing ? (
                <>
                  <Button onClick={() => setIsEditing(false)}>Cancelar</Button>
                  <GradientButton onClick={handleUpdateChamado}>Salvar</GradientButton>
                </>
              ) : (
                <>
                  {view === 'pendentes' && <Button onClick={() => { setDeleteConfirmOpen(true); }} color="error">Excluir</Button>}
                  <Box sx={{flexGrow: 1}}/>
                  <Button onClick={() => setIsDetailsModalOpen(false)}>Fechar</Button>
                </>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
      
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>Tem certeza que deseja excluir o chamado <strong>{selectedChamado?.id}</strong>? Esta ação não pode ser desfeita.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancelar</Button>
          <GradientButtonError onClick={handleDeleteChamado}>Excluir</GradientButtonError>
        </DialogActions>
      </Dialog>
    </Box>
  );
}