// src/pages/EstoquePage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAppContext } from '../context/AppContext.jsx'; 
import { 
  Box, 
  Typography, 
  Paper, 
  CircularProgress, 
  TextField,
  InputAdornment,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Tooltip,
  Badge,
  Collapse,
  IconButton,
  Grid // Adicionado para o layout dos detalhes
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import SendIcon from '@mui/icons-material/Send';
import HistoryIcon from '@mui/icons-material/History';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// Componente para o ícone de expandir com animação
const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

const API_URL = import.meta.env.VITE_API_BASE_URL;

const formatarData = (dataString) => {
  return new Date(dataString).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function EstoquePage() {
  const [estoque, setEstoque] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [itemParaTransferir, setItemParaTransferir] = useState(null);
  const [quantidadeTransferir, setQuantidadeTransferir] = useState(1);
  const [matriculaDestino, setMatriculaDestino] = useState('');
  const [transferring, setTransferring] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const [historico, setHistorico] = useState([]);
  const [historicoLoading, setHistoricoLoading] = useState(false);
  const [historicoDialogOpen, setHistoricoDialogOpen] = useState(false);
  
  const [recentlyUpdated, setRecentlyUpdated] = useState([]);
  
  const [updateTrigger, setUpdateTrigger] = useState(0);

  const { socket } = useAppContext();
  
  const [expandedCardId, setExpandedCardId] = useState(null);

  const handleExpandClick = (itemId) => {
    setExpandedCardId(expandedCardId === itemId ? null : itemId);
  };

  useEffect(() => {
    const fetchEstoque = async () => {
      setError(null);
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(`${API_URL}/materiais`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEstoque(response.data);
      } catch (err) {
        console.error("Erro ao buscar estoque:", err);
        setError("Não foi possível carregar o estoque.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchEstoque();
  }, [updateTrigger]);

  useEffect(() => {
    if (!socket) return;

    const handleEstoqueAtualizado = (payload) => {
      console.log("[EstoquePage] Evento 'estoque_atualizado' recebido!");
      
      const codes = payload?.updatedCodes || [];
      if (codes.length > 0) {
        setRecentlyUpdated(prev => [...new Set([...prev, ...codes])]);
        
        setTimeout(() => {
          setRecentlyUpdated(current => current.filter(c => !codes.includes(c)));
        }, 5000);
      }

      setNotification({ open: true, message: 'Seu estoque foi atualizado remotamente!', severity: 'info' });
      setUpdateTrigger(prev => prev + 1);
    };

    socket.on('estoque_atualizado', handleEstoqueAtualizado);

    return () => {
      socket.off('estoque_atualizado', handleEstoqueAtualizado);
    };
  }, [socket]);

  const filteredEstoque = useMemo(() => {
    if (!searchTerm) return estoque;
    return estoque.filter(item =>
      item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.tipo && item.tipo.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [estoque, searchTerm]);

  const handleOpenTransferDialog = (item) => {
    setItemParaTransferir(item);
    setQuantidadeTransferir(1);
    setMatriculaDestino('');
    setTransferDialogOpen(true);
  };

  const handleCloseTransferDialog = () => {
    setTransferDialogOpen(false);
    setItemParaTransferir(null);
  };

  const handleConfirmarTransferencia = async () => {
    if (!itemParaTransferir || quantidadeTransferir <= 0 || !matriculaDestino.trim()) {
      setNotification({ open: true, message: 'Preencha todos os campos.', severity: 'warning' });
      return;
    }
    if (quantidadeTransferir > itemParaTransferir.quantidade) {
      setNotification({ open: true, message: `Quantidade indisponível. Máximo: ${itemParaTransferir.quantidade}.`, severity: 'error' });
      return;
    }

    setTransferring(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(`${API_URL}/materiais/transferir`, {
        materialId: itemParaTransferir.id,
        quantidade: quantidadeTransferir,
        matriculaDestino: matriculaDestino.trim()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setNotification({ open: true, message: response.data.message || 'Operação realizada com sucesso!', severity: 'success' });
      setUpdateTrigger(prev => prev + 1);
      handleCloseTransferDialog();
    } catch (err) {
      console.error("Erro ao transferir/devolver material:", err);
      const errorMessage = err.response?.data?.error || "Erro ao processar a operação.";
      setNotification({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setTransferring(false);
    }
  };

  const handleOpenHistoricoDialog = async () => {
    setHistoricoLoading(true);
    setHistoricoDialogOpen(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${API_URL}/materiais/historico`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistorico(response.data);
    } catch (err) {
      console.error("Erro ao buscar histórico:", err);
      setNotification({ open: true, message: 'Não foi possível carregar o histórico.', severity: 'error' });
    } finally {
      setHistoricoLoading(false);
    }
  };

  const handleCloseHistoricoDialog = () => {
    setHistoricoDialogOpen(false);
    setHistorico([]);
  };

  const handleCloseNotification = () => setNotification({ ...notification, open: false });

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: '900px', mx: 'auto' }}>
      <Box sx={{ textAlign: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Meus Materiais
        </Typography>
      </Box>

      <Paper 
        elevation={0}
        sx={{ 
          p: '2px 4px', 
          display: 'flex', 
          alignItems: 'center', 
          width: '100%', 
          mb: 3,
          border: '1px solid #e0e0e0',
          borderRadius: '50px' 
        }}
      >
        <InputAdornment position="start" sx={{ pl: 1 }}>
          <SearchIcon color="action" />
        </InputAdornment>
        <TextField
          fullWidth
          variant="standard" // Usando standard para remover bordas internas
          placeholder="Buscar por nome, código ou tipo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            '& .MuiInput-underline:before': { borderBottom: 'none' },
            '& .MuiInput-underline:after': { borderBottom: 'none' },
            '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottom: 'none' },
            '& .MuiInputBase-root': { height: '48px' }
          }}
        />
      </Paper>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="outlined" size="small" startIcon={<HistoryIcon />} onClick={handleOpenHistoricoDialog}>
          Histórico
        </Button>
      </Box>

      {error && <Typography color="error" sx={{ textAlign: 'center' }}>{error}</Typography>}

      {!loading && !error && (
        <Box>
          {filteredEstoque.length > 0 ? (
            filteredEstoque.map((item) => (
              <Paper key={item.id} elevation={0} sx={{ p: 2, mb: 2, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                       <Badge color="success" variant="dot" invisible={!recentlyUpdated.includes(item.codigo)} sx={{ '& .MuiBadge-dot': { top: 4, right: -4 } }}>
                        {item.codigo}
                      </Badge>
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5 }}>{item.nome}</Typography>
                  </Box>

                  <Button
                    variant="contained"
                    startIcon={<SendIcon />}
                    onClick={() => handleOpenTransferDialog(item)}
                    disabled={item.quantidade === 0}
                    sx={{
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase'
                    }}
                  >
                    Transferir
                  </Button>
                </Box>
                
                <Box 
                  onClick={() => handleExpandClick(item.id)} 
                  sx={{ 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center',
                    mt: 2, 
                    pt: 2, 
                    borderTop: 1, 
                    borderColor: 'divider' 
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: '500' }}>
                    {expandedCardId === item.id ? 'Ocultar Detalhes' : 'Ver Detalhes'}
                  </Typography>
                  <ExpandMore
                    expand={expandedCardId === item.id}
                    aria-expanded={expandedCardId === item.id}
                    aria-label="mostrar mais"
                  >
                    <ExpandMoreIcon />
                  </ExpandMore>
                </Box>

                <Collapse in={expandedCardId === item.id} timeout="auto" unmountOnExit>
                  <Box sx={{ pt: 1 }}>
                     <Grid container spacing={1}>
                        <Grid item xs={6}>
                            <Typography variant="caption" display="block" color="text.secondary">Quantidade</Typography>
                            <Typography variant="body2">{item.quantidade}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="caption" display="block" color="text.secondary">Tipo</Typography>
                            <Typography variant="body2">{item.tipo || 'N/A'}</Typography>
                        </Grid>
                        <Grid item xs={12} sx={{ mt: 1 }}>
                            <Typography variant="caption" display="block" color="text.secondary">Descrição</Typography>
                            <Typography variant="body2">{item.descricao || 'Sem descrição'}</Typography>
                        </Grid>
                    </Grid>
                  </Box>
                </Collapse>
              </Paper>
            ))
          ) : (
            <Paper sx={{ p: 3, textAlign: 'center', border: '1px solid #e0e0e0' }} elevation={0}>
              <Typography>Nenhum material encontrado no seu estoque.</Typography>
            </Paper>
          )}
        </Box>
      )}

      <Dialog open={transferDialogOpen} onClose={handleCloseTransferDialog} fullWidth maxWidth="xs">
        <DialogTitle>Transferir ou Devolver Material</DialogTitle>
        <DialogContent>
          <Typography variant="h6">{itemParaTransferir?.nome}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Disponível: {itemParaTransferir?.quantidade}
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            id="matricula"
            label="Matrícula do Técnico"
            type="text"
            fullWidth
            variant="outlined"
            value={matriculaDestino}
            onChange={(e) => setMatriculaDestino(e.target.value)}
            helperText="Para devolver ao estoque central, digite 0000."
          />
          <TextField
            margin="dense"
            id="quantidade"
            label="Quantidade"
            type="number"
            fullWidth
            variant="outlined"
            value={quantidadeTransferir}
            onChange={(e) => setQuantidadeTransferir(Number(e.target.value))}
            InputProps={{ inputProps: { min: 1, max: itemParaTransferir?.quantidade } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTransferDialog}>Cancelar</Button>
          <Button 
            onClick={handleConfirmarTransferencia} 
            variant="contained"
            disabled={transferring}
            startIcon={transferring ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
          >
            {transferring ? 'Processando...' : 'Confirmar'}
          </Button>
        </DialogActions>
      </Dialog>
      
      <Dialog open={historicoDialogOpen} onClose={handleCloseHistoricoDialog} fullWidth maxWidth="md">
        <DialogTitle>Histórico de Movimentação</DialogTitle>
        <DialogContent>
          {historicoLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
          ) : (
            <Box>
              {historico.length > 0 ? historico.map((log) => (
                <Paper key={log.id} sx={{ p: 2, mb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">{log.material_nome}</Typography>
                    <Typography variant="caption" color="text.secondary">{formatarData(log.created_at)}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>{log.tipo_movimentacao.replace(/_/g, ' ')}</Typography>
                    <Typography variant="caption" color="text.secondary">Ref: {log.responsavel}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', color: log.quantidade_alteracao > 0 ? 'success.main' : 'error.main' }}>
                    {log.quantidade_alteracao > 0 ? <ArrowUpwardIcon fontSize="inherit"/> : <ArrowDownwardIcon fontSize="inherit"/>}
                    <Typography fontWeight="bold" sx={{ mx: 0.5 }}>{Math.abs(log.quantidade_alteracao)}</Typography>
                    <Typography variant="body2">(Saldo: {log.saldo_novo})</Typography>
                  </Box>
                </Paper>
              )) : (
                <Typography sx={{ textAlign: 'center', p: 3 }}>Nenhum histórico de movimentação encontrado.</Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseHistoricoDialog}>Fechar</Button>
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