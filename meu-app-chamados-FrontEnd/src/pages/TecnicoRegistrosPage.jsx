// FILE: MEU-APP-CHAMADOS-FRONTEND/src/pages/TecnicoRegistrosPage.jsx 
// (Sugestão: renomear o arquivo para refletir a nova funcionalidade)

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
// ALTERAÇÃO: Adicionado 'Alert' na lista de importações
import { Box, Typography, TextField, Button, Paper, CircularProgress, Autocomplete, List, ListItem, ListItemText, IconButton, ListItemIcon, Divider, Card, CardActionArea, CardContent, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText, Chip, Alert, InputAdornment } from '@mui/material';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import { useAppContext } from '../context/AppContext.jsx';

import AddIcon from '@mui/icons-material/Add';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteIcon from '@mui/icons-material/Delete';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import BusinessIcon from '@mui/icons-material/Business';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SearchIcon from '@mui/icons-material/Search';

const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function TecnicoRegistrosPage() {
  const [observacoes, setObservacoes] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Estados do Modal de Cadastro
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [descricao, setDescricao] = useState('');
  const [anexos, setAnexos] = useState([]);
  
  // Estado para o Dialog de Exclusão
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [observacaoToDelete, setObservacaoToDelete] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  
  const { enqueueSnackbar } = useSnackbar();
  const fileInputRef = useRef(null);

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      const headers = { headers: { Authorization: `Bearer ${token}` } };
      const [obsResponse, clientesResponse] = await Promise.all([
        axios.get(`${API_URL}/observacoes/me`, headers),
        axios.get(`${API_URL}/clientes`, headers)
      ]);
      setObservacoes(obsResponse.data || []);
      setClientes(clientesResponse.data || []);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      setError("Não foi possível carregar os dados da página.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  const filteredObservacoes = useMemo(() => {
    if (!observacoes) return [];
    const sorted = [...observacoes].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    if (!searchTerm) return sorted;
    const lowercasedFilter = searchTerm.toLowerCase();
    return sorted.filter(obs => 
      obs.cliente_nome?.toLowerCase().includes(lowercasedFilter) ||
      obs.descricao?.toLowerCase().includes(lowercasedFilter)
    );
  }, [observacoes, searchTerm]);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    const filePromises = files.map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve({ name: file.name, type: file.type, data: reader.result });
        reader.onerror = error => reject(error);
      });
    });
    Promise.all(filePromises).then(novosAnexos => {
      setAnexos(prevAnexos => [...prevAnexos, ...novosAnexos]);
    });
  };

  const handleRemoveAnexo = (indexToRemove) => {
    setAnexos(prevAnexos => prevAnexos.filter((_, index) => index !== indexToRemove));
  };

  const handleOpenCreateModal = () => {
    setClienteSelecionado(null);
    setDescricao('');
    setAnexos([]);
    setCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => setCreateModalOpen(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!clienteSelecionado || !descricao.trim()) {
      enqueueSnackbar('Por favor, selecione um cliente e descreva a observação.', { variant: 'warning' });
      return;
    }
    setIsSubmitting(true);
    const dadosParaEnviar = {
      clienteId: clienteSelecionado.id,
      descricao: descricao.trim(),
      anexos: anexos.map(anexo => ({ name: anexo.name, data: anexo.data })) 
    };

    try {
      const token = localStorage.getItem('authToken');
      await axios.post(`${API_URL}/observacoes`, dadosParaEnviar, { headers: { Authorization: `Bearer ${token}` } });
      enqueueSnackbar('Observação registrada com sucesso!', { variant: 'success' });
      handleCloseCreateModal();
      fetchData();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Erro ao enviar a observação.';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleOpenDeleteDialog = (obs, e) => {
    e.stopPropagation();
    setObservacaoToDelete(obs);
    setDeleteDialogOpen(true);
  };
  
  const handleConfirmDelete = async () => {
      if(!observacaoToDelete) return;
      setIsSubmitting(true);
      try {
        const token = localStorage.getItem('authToken');
        await axios.delete(`${API_URL}/observacoes/${observacaoToDelete.id}`, { headers: { Authorization: `Bearer ${token}` } });
        enqueueSnackbar('Registro excluído com sucesso!', { variant: 'info' });
        setDeleteDialogOpen(false);
        fetchData();
      } catch (error) {
        enqueueSnackbar(error.response?.data?.error || "Falha ao excluir registro.", { variant: 'error' });
      } finally {
        setIsSubmitting(false);
        setObservacaoToDelete(null);
      }
  };


  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  if (error) return <Box sx={{ p: 3 }}><Alert severity="error">{error}</Alert></Box>;

  return (
    <Box sx={{ width: '100%', boxSizing: 'border-box', overflowX: 'hidden', p: { xs: 2, sm: 3 } }}>
      <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontSize: { xs: '1.8rem', sm: '2.125rem' } }}>
          Registros
        </Typography>
        <IconButton color="primary" onClick={handleOpenCreateModal} sx={{ position: 'absolute', right: 0, backgroundColor: 'primary.main', color: 'primary.contrastText', '&:hover': { backgroundColor: 'primary.dark' }}}>
          <AddIcon />
        </IconButton>
      </Box>

      <Paper sx={{ mb: 3, p: 2, borderRadius: 2 }}>
          <TextField fullWidth variant="outlined" placeholder="Buscar registros..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }} />
      </Paper>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {filteredObservacoes.length > 0 ? filteredObservacoes.map(obs => (
            <Box key={obs.id} sx={{ display: 'flex', width: { xs: 'calc(50% - 9px)', sm: 'calc(33.333% - 11px)', md: 'calc(25% - 13px)'}}}>
                <Card sx={{ width: '100%', borderRadius: 2 }}>
                    <CardActionArea sx={{p: 1.5}}>
                        <CardContent sx={{ p: 0 }}>
                            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1}}>
                                <Chip label={`Anexos: ${obs.anexos_count || 0}`} size="small" icon={<AttachFileIcon />} />
                                <IconButton size="small" color="error" onClick={(e) => handleOpenDeleteDialog(obs, e)}><DeleteIcon fontSize="small" /></IconButton>
                            </Box>
                            <Box sx={{display: 'flex', alignItems: 'center', mb: 0.5}}>
                                <BusinessIcon sx={{mr: 1, fontSize: '1rem'}} color="action"/>
                                <Typography variant="body2" noWrap sx={{fontWeight: 'bold'}}>{obs.cliente_nome}</Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', minHeight: '32px' }}>
                                {obs.descricao}
                            </Typography>
                            <Box sx={{display: 'flex', alignItems: 'center', mt: 1}}>
                                <CalendarTodayIcon sx={{mr: 1, fontSize: '1rem'}} color="action"/>
                                <Typography variant="caption" color="text.secondary">
                                    {new Date(obs.created_at).toLocaleDateString('pt-BR')}
                                </Typography>
                            </Box>
                        </CardContent>
                    </CardActionArea>
                </Card>
            </Box>
        )) : (
            <Box sx={{width: '100%'}}>
                <Paper sx={{p: 3, textAlign: 'center', borderRadius: 2}}>
                    <Typography>Nenhum registro encontrado.</Typography>
                </Paper>
            </Box>
        )}
      </Box>

      {/* MODAL DE CRIAÇÃO */}
      <Dialog open={isCreateModalOpen} onClose={handleCloseCreateModal} fullWidth maxWidth="sm">
        <DialogTitle>Registrar Nova Observação</DialogTitle>
        <DialogContent>
            <Box component="form" id="create-obs-form" onSubmit={handleSubmit} sx={{pt: 1}}>
                <Autocomplete options={clientes} getOptionLabel={(option) => `[${option.ic}] ${option.nome}`} value={clienteSelecionado} onChange={(event, newValue) => {setClienteSelecionado(newValue);}} isOptionEqualToValue={(option, value) => option.id === value.id} renderInput={(params) => <TextField {...params} label="Selecione o Cliente *" margin="normal" variant="outlined" />} />
                <TextField label="Descrição da Observação / Problema *" value={descricao} onChange={(e) => setDescricao(e.target.value)} fullWidth required multiline rows={6} margin="normal" variant="outlined" />
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom>Anexos</Typography>
                <input type="file" multiple ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
                <Button variant="outlined" startIcon={<AttachFileIcon />} onClick={() => fileInputRef.current.click()}>
                    Adicionar Arquivos
                </Button>
                {anexos.length > 0 && (
                    <List dense sx={{mt: 1}}>
                        {anexos.map((anexo, index) => (
                            <ListItem key={index} secondaryAction={ <IconButton edge="end" onClick={() => handleRemoveAnexo(index)}><DeleteIcon /></IconButton> }>
                                <ListItemIcon sx={{minWidth: 40}}><InsertDriveFileIcon /></ListItemIcon>
                                <ListItemText primary={anexo.name} />
                            </ListItem>
                        ))}
                    </List>
                )}
            </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateModal}>Cancelar</Button>
          <Button type="submit" form="create-obs-form" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={24}/> : 'Enviar'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* DIALOG DE EXCLUSÃO */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
            <DialogContentText>Tem certeza que deseja excluir este registro?</DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleConfirmDelete} color="error" variant="contained" disabled={isSubmitting}>
                {isSubmitting ? <CircularProgress size={24}/> : 'Excluir'}
            </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}