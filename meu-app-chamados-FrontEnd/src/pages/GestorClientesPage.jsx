// FILE: MEU-APP-CHAMADOS-FRONTEND/src/pages/GestorClientesPage.jsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import {
  Box, Typography, Paper, Button, CircularProgress, Alert, IconButton,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField,
  Snackbar, Card, CardActionArea, CardContent, InputAdornment
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import BusinessIcon from '@mui/icons-material/Business';
import PinIcon from '@mui/icons-material/Pin';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SearchIcon from '@mui/icons-material/Search';

const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function GestorClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ nome: '', ic: '', endereco: '', localizacao: '', observacoes: '' });
  const [editingCliente, setEditingCliente] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deletingCliente, setDeletingCliente] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const fetchClientes = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${API_URL}/clientes`, { headers: { Authorization: `Bearer ${token}` } });
      setClientes(response.data);
      setError(null);
    } catch (err) {
      console.error("Erro ao buscar clientes:", err);
      setError("Não foi possível carregar a lista de clientes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  const filteredClientes = useMemo(() => {
    const sorted = [...clientes].sort((a, b) => a.nome.localeCompare(b.nome));
    if (!searchTerm) return sorted;
    const lowercasedFilter = searchTerm.toLowerCase();
    return sorted.filter(cliente =>
      cliente.nome.toLowerCase().includes(lowercasedFilter) ||
      cliente.ic.toLowerCase().includes(lowercasedFilter) ||
      (cliente.endereco && cliente.endereco.toLowerCase().includes(lowercasedFilter))
    );
  }, [clientes, searchTerm]);

  const handleOpenAddModal = () => {
    setEditingCliente(null);
    setFormData({ nome: '', ic: '', endereco: '', localizacao: '', observacoes: '' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cliente) => {
    setEditingCliente(cliente);
    setFormData({
      nome: cliente.nome || '',
      ic: cliente.ic || '',
      endereco: cliente.endereco || '',
      localizacao: cliente.localizacao || '',
      observacoes: cliente.observacoes || ''
    });
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCliente(null);
  };

  const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nome || !formData.ic || !formData.endereco) {
      setNotification({ open: true, message: 'Nome, IC e Endereço são obrigatórios.', severity: 'error' });
      return;
    }
    const token = localStorage.getItem('authToken');
    const headers = { Authorization: `Bearer ${token}` };
    const isEditing = !!editingCliente;
    const url = isEditing ? `${API_URL}/clientes/${editingCliente.id}` : `${API_URL}/clientes`;
    const method = isEditing ? 'patch' : 'post';

    try {
      await axios[method](url, formData, { headers });
      const successMessage = isEditing ? 'Cliente atualizado com sucesso!' : 'Cliente criado com sucesso!';
      setNotification({ open: true, message: successMessage, severity: 'success' });
      handleCloseModal();
      fetchClientes();
    } catch (err) {
      console.error("Erro ao salvar cliente:", err);
      setNotification({ open: true, message: err.response?.data?.error || 'Erro ao salvar cliente.', severity: 'error' });
    }
  };

  const handleOpenConfirmDialog = (cliente) => {
    setDeletingCliente(cliente);
    setIsConfirmOpen(true);
  };

  const handleCloseConfirmDialog = () => setIsConfirmOpen(false);

  const handleConfirmDelete = async () => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`${API_URL}/clientes/${deletingCliente.id}`, { headers: { Authorization: `Bearer ${token}` } });
      setNotification({ open: true, message: 'Cliente excluído com sucesso!', severity: 'success' });
      handleCloseConfirmDialog();
      fetchClientes();
    } catch (err) {
      console.error("Erro ao excluir cliente:", err);
      setNotification({ open: true, message: err.response?.data?.error || 'Erro ao excluir cliente.', severity: 'error' });
    }
  };

  const handleCloseNotification = () => setNotification({ ...notification, open: false });

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }
  
  return (
    <Box sx={{ width: '100%', boxSizing: 'border-box', overflowX: 'hidden', p: { xs: 2, sm: 3 } }}>
      <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontSize: { xs: '1.8rem', sm: '2.125rem' } }}>
          Clientes
        </Typography>
        <IconButton
          color="primary"
          onClick={handleOpenAddModal}
          sx={{
            position: 'absolute',
            right: 0,
            backgroundColor: 'primary.main',
            color: 'primary.contrastText',
            '&:hover': { backgroundColor: 'primary.dark' }
          }}
        >
          <AddIcon />
        </IconButton>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* ALTERAÇÃO: Removido 'maxWidth' e 'mx' para a barra de busca ocupar 100% da largura */}
      <Paper sx={{ mb: 3, p: 2, borderRadius: 2 }}>
        <TextField fullWidth variant="outlined" placeholder="Buscar cliente..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }} />
      </Paper>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {filteredClientes.map((cliente) => (
          <Box 
            key={cliente.id}
            sx={{
              display: 'flex',
               width: {
                xs: 'calc(50% - 9px)', 
                sm: 'calc(50% - 9px)',
                md: 'calc(33.333% - 11px)',
                lg: 'calc(25% - 13px)'
              }
            }}
          >
            <Card sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
              <CardActionArea onClick={() => handleOpenEditModal(cliente)} sx={{ flexGrow: 1, p: { xs: 1, sm: 1.5 } }}>
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', overflow: 'hidden', mr: 1, minWidth: 0 }}>
                      <BusinessIcon color="action" sx={{ mr: 0.75, flexShrink: 0, fontSize: { xs: '1rem', sm: '1.2rem' } }} />
                      <Typography variant="h6" component="div" noWrap sx={{ fontWeight: 'bold', fontSize: { xs: '0.8rem', sm: '1rem' } }}>
                        {cliente.nome}
                      </Typography>
                    </Box>
                    <IconButton color="error" size="small" onClick={(e) => { e.stopPropagation(); handleOpenConfirmDialog(cliente); }} sx={{ p: 0.25 }}>
                      <DeleteIcon sx={{ fontSize: { xs: '1rem', sm: '1.2rem' } }} />
                    </IconButton>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <PinIcon color="action" sx={{ mr: 0.75, fontSize: { xs: '0.9rem', sm: '1.1rem' } }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                      {cliente.ic}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', overflow: 'hidden', minWidth: 0 }}>
                    <LocationOnIcon color="action" sx={{ mr: 0.75, flexShrink: 0, fontSize: { xs: '0.9rem', sm: '1.1rem' } }} />
                    <Typography variant="body2" color="text.secondary" noWrap sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                      {cliente.endereco}
                    </Typography>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Box>
        ))}
      </Box>
      
      <Dialog open={isModalOpen} onClose={handleCloseModal}>
        <DialogTitle>{editingCliente ? 'Editar Cliente' : 'Adicionar Novo Cliente'}</DialogTitle>
        <DialogContent><Box component="form" onSubmit={handleFormSubmit} sx={{ mt: 2 }}>
            <TextField name="nome" label="Nome do Cliente" fullWidth margin="dense" required value={formData.nome} onChange={handleFormChange} autoFocus/>
            <TextField name="ic" label="IC (Identificação do Cliente)" fullWidth margin="dense" required value={formData.ic} onChange={handleFormChange} />
            <TextField name="endereco" label="Endereço" fullWidth margin="dense" required value={formData.endereco} onChange={handleFormChange} />
            <TextField name="localizacao" label="Localização (Link do Google Maps)" fullWidth margin="dense" value={formData.localizacao} onChange={handleFormChange} />
            <TextField name="observacoes" label="Observações (Opcional)" fullWidth margin="dense" multiline rows={3} value={formData.observacoes} onChange={handleFormChange} />
        </Box></DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancelar</Button>
          <Button type="submit" variant="contained" onClick={handleFormSubmit}>{editingCliente ? 'Salvar Alterações' : 'Salvar'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isConfirmOpen} onClose={handleCloseConfirmDialog}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent><DialogContentText>Tem certeza que deseja excluir o cliente <strong>{deletingCliente?.nome}</strong>?</DialogContentText></DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog}>Cancelar</Button>
          <Button onClick={handleConfirmDelete} color="error">Excluir</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={notification.open} autoHideDuration={6000} onClose={handleCloseNotification}><Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>{notification.message}</Alert></Snackbar>
    </Box>
  );
}