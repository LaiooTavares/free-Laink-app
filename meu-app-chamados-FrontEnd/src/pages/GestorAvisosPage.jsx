// File: src/pages/GestorAvisosPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Box, Typography, Paper, TextField, Button, FormControl, InputLabel, Select,
  MenuItem, Autocomplete, CircularProgress, Snackbar, Alert, Chip, Divider,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText,
  Card, CardContent, CardActionArea
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { format } from 'date-fns';

const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function GestorAvisosPage() {
  const [avisos, setAvisos] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newMessage, setNewMessage] = useState('');
  const [newTarget, setNewTarget] = useState('ALL_USERS');
  const [newTargetIds, setNewTargetIds] = useState([]);
  const [newExpiresAt, setNewExpiresAt] = useState('');

  const [editingAviso, setEditingAviso] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deletingAviso, setDeletingAviso] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [avisosResponse, usersResponse] = await Promise.all([
        axios.get(`${API_URL}/avisos/gestor`),
        axios.get(`${API_URL}/users`)
      ]);
      setAvisos(avisosResponse.data || []);
      const filteredUsers = (usersResponse.data || []).filter(user => user.role === 'TECNICO' || user.role === 'OPERADOR');
      setUsers(filteredUsers);
    } catch (err) {
      console.error("Erro ao buscar dados:", err);
      const errorMessage = err.response?.data?.error || "Falha ao carregar dados.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateSubmit = async (event) => {
    event.preventDefault();
    if (!newMessage.trim()) {
      setNotification({ open: true, message: 'A mensagem do aviso não pode estar vazia.', severity: 'warning' });
      return;
    }
    if (newTarget === 'SPECIFIC_USERS' && newTargetIds.length === 0) {
      setNotification({ open: true, message: 'Por favor, selecione pelo menos um destinatário.', severity: 'warning' });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        message: newMessage,
        target: newTarget,
        targetIds: newTargetIds,
        expires_at: newExpiresAt || null
      };
      await axios.post(`${API_URL}/avisos`, payload);
      
      setNotification({ open: true, message: 'Aviso enviado com sucesso!', severity: 'success' });
      setNewMessage('');
      setNewTarget('ALL_USERS');
      setNewTargetIds([]);
      setNewExpiresAt('');
      fetchData();
    } catch (err) {
      console.error("Erro ao enviar aviso:", err);
      setNotification({ open: true, message: err.response?.data?.error || 'Erro ao enviar aviso.', severity: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleOpenEditModal = (aviso) => {
    setEditingAviso({
      ...aviso,
      expires_at: aviso.expires_at ? format(new Date(aviso.expires_at), 'yyyy-MM-dd') : ''
    });
    setIsEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    setEditingAviso({ ...editingAviso, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        message: editingAviso.message,
        expires_at: editingAviso.expires_at || null
      };
      await axios.patch(`${API_URL}/avisos/${editingAviso.id}`, payload);
      setNotification({ open: true, message: 'Aviso atualizado com sucesso!', severity: 'success' });
      setIsEditModalOpen(false);
      fetchData();
    } catch (err) {
      setNotification({ open: true, message: err.response?.data?.error || 'Erro ao atualizar aviso.', severity: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenConfirmDialog = (aviso, event) => {
    event.stopPropagation();
    setDeletingAviso(aviso);
    setIsConfirmOpen(true);
  };
  
  const handleConfirmDelete = async () => {
    setIsSubmitting(true);
    try {
      await axios.delete(`${API_URL}/avisos/${deletingAviso.id}`);
      setNotification({ open: true, message: 'Aviso excluído com sucesso!', severity: 'info' });
      setIsConfirmOpen(false);
      fetchData();
    } catch (err) {
      setNotification({ open: true, message: err.response?.data?.error || 'Erro ao excluir aviso.', severity: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateString = format(maxDate, 'yyyy-MM-dd');

  return (
    <Box sx={{ width: '100%', boxSizing: 'border-box', overflowX: 'hidden', p: { xs: 2, sm: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontSize: { xs: '1.8rem', sm: '2.125rem' } }}>
          Avisos
        </Typography>
      </Box>

      <Paper 
        component="form" 
        onSubmit={handleCreateSubmit} 
        sx={{ 
          p: {xs: 2, sm: 3}, 
          mb: 4, 
          borderRadius: 2,
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        {/* ALTERAÇÃO: Adicionado textAlign: 'center' ao título do formulário */}
        <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
          Novo Aviso
        </Typography>
        <TextField 
          label="Mensagem do Aviso" 
          multiline 
          rows={3} 
          fullWidth 
          required 
          value={newMessage} 
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Digite sua mensagem"
          variant="outlined"
          sx={{ mb: 2 }}
        />
        <TextField
          label="Data de Validade (Opcional)"
          type="date"
          fullWidth
          margin="normal"
          value={newExpiresAt}
          onChange={(e) => setNewExpiresAt(e.target.value)}
          InputLabelProps={{ shrink: true }}
          inputProps={{ max: maxDateString }}
          variant="outlined"
          sx={{ mb: 2 }}
        />
        <FormControl fullWidth margin="normal" variant="outlined" sx={{ mb: 2 }}>
          <InputLabel>Enviar Para</InputLabel>
          <Select value={newTarget} label="Enviar Para" onChange={(e) => setNewTarget(e.target.value)}>
            <MenuItem value="ALL_TECNICOS">Todos os Técnicos</MenuItem>
            <MenuItem value="ALL_OPERADORES">Todos os Operadores</MenuItem>
            <MenuItem value="ALL_USERS">Todos (Técnicos e Operadores)</MenuItem>
            <MenuItem value="SPECIFIC_USERS">Usuários Específicos</MenuItem>
          </Select>
        </FormControl>
        {newTarget === 'SPECIFIC_USERS' && (
          <Autocomplete multiple options={users} getOptionLabel={(option) => `${option.name} (${option.role})`}
            onChange={(e, value) => setNewTargetIds(value.map(user => user.id))}
            renderInput={(params) => <TextField {...params} label="Selecionar Destinatários" variant="outlined" />}
          />
        )}
        <Button 
          type="submit" 
          variant="contained" 
          size="large" 
          fullWidth
          startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />} 
          disabled={isSubmitting}
          sx={{ mt: 3, py: 1.5, fontSize: '1rem' }}
        >
          {isSubmitting ? 'Enviando...' : 'Enviar Aviso'}
        </Button>
      </Paper>

      <Divider sx={{ my: 4 }} />

      <Typography variant="h6" gutterBottom>Avisos Enviados</Typography>
      {loading ? <CircularProgress /> : error ? <Alert severity="error">{error}</Alert> : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {avisos.length > 0 ? avisos.map((aviso) => {
            const isExpired = aviso.expires_at && new Date(aviso.expires_at) < new Date();
            return (
              <Box 
                key={aviso.id}
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
                  <CardActionArea onClick={() => handleOpenEditModal(aviso)} sx={{ flexGrow: 1, p: { xs: 1.5, sm: 2 } }}>
                    <CardContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Chip label={isExpired ? 'Expirado' : 'Ativo'} color={isExpired ? 'default' : 'success'} size="small"/>
                        <Box>
                          <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleOpenEditModal(aviso); }}>
                            <EditIcon fontSize="small"/>
                          </IconButton>
                          <IconButton size="small" color="error" onClick={(e) => handleOpenConfirmDialog(aviso, e)}>
                            <DeleteIcon fontSize="small"/>
                          </IconButton>
                        </Box>
                      </Box>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          mb: 1, 
                          flexGrow: 1, 
                          wordBreak: 'break-word',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {aviso.message}
                      </Typography>
                      <Box sx={{ mt: 'auto', pt: 1, borderTop: 1, borderColor: 'divider' }}>
                        <Typography variant="caption" display="block" color="text.secondary">
                          Por: {aviso.sender_name}
                        </Typography>
                        <Typography variant="caption" display="block" color="text.secondary">
                          Em: {format(new Date(aviso.created_at), 'dd/MM/yyyy HH:mm')}
                        </Typography>
                        {aviso.expires_at && (
                          <Typography variant="caption" display="block" color={isExpired ? 'error.main' : 'text.secondary'}>
                            Expira em: {format(new Date(aviso.expires_at), 'dd/MM/yyyy')}
                          </Typography>
                        )}
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Box>
            );
          }) : (
            <Box sx={{width: '100%'}}>
              <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
                <Typography>Nenhum aviso encontrado.</Typography>
              </Paper>
            </Box>
          )}
        </Box>
      )}

      {/* Dialogs */}
      <Dialog open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} fullWidth>
        <DialogTitle>Editar Aviso</DialogTitle>
        <DialogContent>
          <TextField name="message" label="Mensagem do Aviso" multiline rows={4} fullWidth required value={editingAviso?.message || ''} onChange={handleEditChange} sx={{ mt: 2 }} />
          <TextField name="expires_at" label="Data de Validade (Opcional)" type="date" fullWidth margin="normal" value={editingAviso?.expires_at || ''} onChange={handleEditChange} InputLabelProps={{ shrink: true }} inputProps={{ max: maxDateString }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditModalOpen(false)}>Cancelar</Button>
          <Button onClick={handleEditSubmit} variant="contained" disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Salvar Alterações'}
          </Button>
        </DialogActions>
      </Dialog>
      
      <Dialog open={isConfirmOpen} onClose={() => setIsConfirmOpen(false)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent><DialogContentText>Tem certeza que deseja excluir este aviso?</DialogContentText></DialogContent>
        <DialogActions>
          <Button onClick={() => setIsConfirmOpen(false)}>Cancelar</Button>
          <Button onClick={handleConfirmDelete} color="error" disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Excluir'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={notification.open} autoHideDuration={6000} onClose={() => setNotification({ ...notification, open: false })}>
        <Alert onClose={() => setNotification({ ...notification, open: false })} severity={notification.severity} sx={{ width: '100%' }} variant="filled">
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}