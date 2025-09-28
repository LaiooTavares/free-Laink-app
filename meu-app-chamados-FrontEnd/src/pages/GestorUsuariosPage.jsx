// src/pages/GestorUsuariosPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import {
  Box, Typography, Paper, Button, CircularProgress, Alert, IconButton,
  Dialog, DialogActions, DialogContent, DialogTitle, TextField,
  Snackbar, Select, MenuItem, FormControl, InputLabel,
  DialogContentText, Card, CardContent, Chip, InputAdornment, CardActionArea
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import BadgeIcon from '@mui/icons-material/Badge';
import PinIcon from '@mui/icons-material/Pin';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const getRoleChipColor = (role) => {
    switch (role) {
        case 'GESTOR': return 'primary';
        case 'OPERADOR': return 'secondary';
        case 'TECNICO': return 'info';
        default: return 'default';
    }
};

export default function GestorUsuariosPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', matricula: '', password: '', role: 'TECNICO' });
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/users`);
      setUsers(response.data || []);
    } catch (err) {
      console.error("Erro ao buscar usuários:", err);
      setError(err.response?.data?.error || "Falha ao carregar la lista de usuários.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    const sortedUsers = [...users].sort((a, b) => a.name.localeCompare(b.name));
    if (!searchTerm) return sortedUsers;
    const lowercasedFilter = searchTerm.toLowerCase();
    return sortedUsers.filter(user =>
      user.name.toLowerCase().includes(lowercasedFilter) ||
      user.email.toLowerCase().includes(lowercasedFilter) ||
      (user.matricula && user.matricula.toLowerCase().includes(lowercasedFilter)) ||
      user.role.toLowerCase().includes(lowercasedFilter)
    );
  }, [users, searchTerm]);

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', matricula: '', password: '', role: 'TECNICO' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, matricula: user.matricula || '', role: user.role, password: '' });
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => setIsModalOpen(false);

  const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const payload = { ...formData };
    if (editingUser && !payload.password) {
      delete payload.password;
    }

    try {
      if (editingUser) {
        await axios.patch(`${API_URL}/users/${editingUser.id}`, payload);
      } else {
        await axios.post(`${API_URL}/users`, payload);
      }
      setNotification({ open: true, message: `Usuário ${editingUser ? 'atualizado' : 'criado'} com sucesso!`, severity: 'success' });
      handleCloseModal();
      fetchUsers();
    } catch (err) {
      console.error("Erro ao salvar usuário:", err);
      setNotification({ open: true, message: err.response?.data?.error || 'Erro ao salvar usuário.', severity: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenConfirmDialog = (user) => {
    setDeletingUser(user);
    setIsConfirmOpen(true);
  };
  const handleCloseConfirmDialog = () => setIsConfirmOpen(false);

  const handleConfirmDelete = async () => {
    setIsSubmitting(true);
    try {
      await axios.delete(`${API_URL}/users/${deletingUser.id}`);
      setNotification({ open: true, message: 'Usuário excluído com sucesso!', severity: 'success' });
      handleCloseConfirmDialog();
      fetchUsers();
    } catch (err) {
      console.error("Erro ao excluir usuário:", err);
      setNotification({ open: true, message: err.response?.data?.error || 'Erro ao excluir usuário.', severity: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseNotification = () => setNotification({ ...notification, open: false });

  if (loading && users.length === 0) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ width: '100%', boxSizing: 'border-box', overflowX: 'hidden', p: { xs: 2, sm: 3 } }}>
      <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontSize: { xs: '1.8rem', sm: '2.125rem' } }}>
          Usuários
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
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar usuário..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }}
        />
      </Paper>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {filteredUsers.map((user) => (
          <Box 
            key={user.id}
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
              <CardActionArea 
                onClick={() => handleOpenEditModal(user)} 
                sx={{ flexGrow: 1, p: { xs: 1, sm: 1.5 } }}
              >
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', overflow: 'hidden', mr: 1, minWidth: 0 }}>
                      <PersonIcon color="action" sx={{ mr: 0.75, flexShrink: 0, fontSize: { xs: '1rem', sm: '1.2rem' } }} />
                      <Typography variant="h6" component="div" noWrap sx={{ fontWeight: 'bold', fontSize: { xs: '0.8rem', sm: '1rem' } }}>
                        {user.name}
                      </Typography>
                    </Box>
                    <IconButton 
                      color="error" 
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenConfirmDialog(user);
                      }}
                      sx={{ p: 0.25 }}
                    >
                      <DeleteIcon sx={{ fontSize: { xs: '1rem', sm: '1.2rem' } }} />
                    </IconButton>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <BadgeIcon color="action" sx={{ mr: 0.75, fontSize: { xs: '0.9rem', sm: '1.1rem' } }} />
                    <Chip label={user.role} size="small" color={getRoleChipColor(user.role)} />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5, overflow: 'hidden', minWidth: 0 }}>
                    <EmailIcon color="action" sx={{ mr: 0.75, flexShrink: 0, fontSize: { xs: '0.9rem', sm: '1.1rem' } }} />
                    <Typography variant="body2" color="text.secondary" noWrap sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                      {user.email}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PinIcon color="action" sx={{ mr: 0.75, fontSize: { xs: '0.9rem', sm: '1.1rem' } }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                      {user.matricula || 'N/A'}
                    </Typography>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Box>
        ))}
      </Box>
      
      {/* DIALOGS (sem alterações de layout) */}
      <Dialog open={isModalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>{editingUser ? 'Editar Usuário' : 'Adicionar Novo Usuário'}</DialogTitle>
        <DialogContent>
          <Box component="form" id="user-form" onSubmit={handleFormSubmit} sx={{ pt: 1 }}>
            <TextField name="name" label="Nome Completo" value={formData.name} onChange={handleFormChange} fullWidth margin="dense" required autoFocus/>
            <TextField name="email" label="Email" type="email" value={formData.email} onChange={handleFormChange} fullWidth margin="dense" required />
            <TextField name="matricula" label="Matrícula" value={formData.matricula} onChange={handleFormChange} fullWidth margin="dense" />
            <TextField name="password" label="Senha" type="password" helperText={editingUser ? "Deixe em branco para não alterar" : ""} onChange={handleFormChange} fullWidth margin="dense" required={!editingUser} />
            <FormControl fullWidth margin="dense" required>
              <InputLabel>Função</InputLabel>
              <Select name="role" label="Função" value={formData.role} onChange={handleFormChange}>
                <MenuItem value="TECNICO">Técnico</MenuItem>
                <MenuItem value="OPERADOR">Operador</MenuItem>
                <MenuItem value="GESTOR">Gestor</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancelar</Button>
          <Button type="submit" form="user-form" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isConfirmOpen} onClose={handleCloseConfirmDialog}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir o usuário <strong>{deletingUser?.name}</strong>? Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog}>Cancelar</Button>
          <Button onClick={handleConfirmDelete} color="error" disabled={isSubmitting}>
             {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Excluir'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={notification.open} autoHideDuration={6000} onClose={handleCloseNotification} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }} variant="filled">
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}