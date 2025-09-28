// MEU-APP-CHAMADOS-FRONTEND/src/pages/ServicosDetailPage.jsx
import React, { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import { Box, Paper, Typography, Button, CircularProgress } from '@mui/material';
import { useAppContext } from '../context/AppContext.jsx';
import { ITENS_APR } from '../data/mockData.js';

import Fase1Servico from '../components/chamado-detail/Fase1Servico.jsx';
import Fase2Servico from '../components/chamado-detail/Fase2Servico.jsx';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const parseJsonArray = (data, fallback = []) => {
  if (Array.isArray(data)) return data;
  if (typeof data === 'string') { try { const p = JSON.parse(data); return Array.isArray(p) ? p : fallback; } catch (e) { return fallback; } }
  return fallback;
};

const parseJsonObject = (data, fallback = {}) => {
  if (typeof data === 'object' && data !== null && !Array.isArray(data)) return data;
  if (typeof data === 'string') { try { const p = JSON.parse(data); return (typeof p === 'object' && p !== null) ? p : fallback; } catch (e) { return fallback; } }
  return fallback;
};

export default function ServicosDetailPage() {
  const { user, socket, fetchData } = useAppContext();
  const { servicoId } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [trabalho, setTrabalho] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [tabValue, setTabValue] = useState('1');
  const [estoqueDisponivel, setEstoqueDisponivel] = useState([]);
  const [loadingEstoque, setLoadingEstoque] = useState(false);
  const [dialogMaterialAberto, setDialogMaterialAberto] = useState(false);
  const [materialSelecionado, setMaterialSelecionado] = useState(null);
  const [quantidadeMaterial, setQuantidadeMaterial] = useState(1);
  const [aprDialogOpen, setAprDialogOpen] = useState(false);
  const [signatureDialogOpen, setSignatureDialogOpen] = useState(false);
  const [imagemEmDestaque, setImagemEmDestaque] = useState(null);
  const [respostasAprState, setRespostasAprState] = useState({});
  const [devolucaoDialogOpen, setDevolucaoDialogOpen] = useState(false);
  const [motivoDevolucao, setMotivoDevolucao] = useState('');
  const [localComentarios, setLocalComentarios] = useState('');
  const sigCanvas = useRef({});

  const fetchTrabalho = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error("Usuário não autenticado");
      const response = await axios.get(`${API_URL}/servicos/${servicoId}`, { headers: { Authorization: `Bearer ${token}` } });
      setTrabalho(response.data);
      setLocalComentarios(response.data.comentarios || '');
      setRespostasAprState(parseJsonObject(response.data.aprRespostas, {}));
    } catch (err) {
      setError("O serviço não foi encontrado.");
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [servicoId]);

  useEffect(() => { if (servicoId) fetchTrabalho(); }, [servicoId, fetchTrabalho]);

  useEffect(() => {
    if (socket) {
      const handleRealtimeUpdate = (data) => { if (String(data.id) === String(servicoId)) fetchTrabalho(false); };
      socket.on('servico_atualizado', handleRealtimeUpdate);
      return () => {
        socket.off('servico_atualizado', handleRealtimeUpdate);
      };
    }
  }, [socket, servicoId, fetchTrabalho]);

  const handleUpdateTrabalho = async (dados) => {
    if (isUpdating || !trabalho) return;
    setIsUpdating(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.patch(`${API_URL}/servicos/${trabalho.id}`, dados, { headers: { Authorization: `Bearer ${token}` } });
      setTrabalho(prevState => ({ ...prevState, ...response.data }));
      setLocalComentarios(response.data.comentarios || '');
      await fetchData(token);
    } catch (error) {
      enqueueSnackbar(error.response?.data?.error || "Falha ao atualizar.", { variant: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleIniciarDeslocamento = () => handleUpdateTrabalho({ inicio_deslocamento: new Date().toISOString() });
  const handleAbrirAprDialog = () => handleUpdateTrabalho({ inicio_apr: new Date().toISOString() }).then(() => setAprDialogOpen(true));
  const handleIniciarServico = async () => { if (!trabalho?.aprCompleta) { enqueueSnackbar('Preencha a APR.', { variant: 'error' }); return; } try { await handleUpdateTrabalho({ inicio_atendimento: new Date().toISOString() }); enqueueSnackbar('Serviço iniciado!', { variant: 'info' }); } catch (error) { /* ... */ } };
  const handlePausarRetomarServico = () => handleUpdateTrabalho({ status: trabalho?.status !== 'Pausado' ? 'Pausado' : 'Em Andamento' });
  const handleDevolverServico = () => setDevolucaoDialogOpen(true);
  const handleConfirmarDevolucao = () => { if (!motivoDevolucao.trim()) return enqueueSnackbar('Informe o motivo.', { variant: 'warning' }); handleUpdateTrabalho({ status: 'Devolvido', motivoDevolucao }); navigate('/'); };
  const handleOpenSignatureDialog = () => setSignatureDialogOpen(true);
  const handleSalvarApr = async () => { if (Object.keys(respostasAprState).length < ITENS_APR.length) return; const aprAprovada = Object.values(respostasAprState).every(r => r === 'sim'); await handleUpdateTrabalho({ aprCompleta: aprAprovada, aprRespostas: JSON.stringify(respostasAprState) }); setAprDialogOpen(false); };
  const saveSignature = async () => { if (sigCanvas.current.isEmpty()) return; await handleUpdateTrabalho({ assinatura: sigCanvas.current.toDataURL('image/png'), status: 'Finalizado', comentarios: localComentarios }); navigate('/'); };
  const handleAbrirDialogMaterial = async () => { setLoadingEstoque(true); setDialogMaterialAberto(true); try { const token = localStorage.getItem('authToken'); const res = await axios.get(`${API_URL}/materiais`, { headers: { Authorization: `Bearer ${token}` } }); setEstoqueDisponivel(res.data); } catch (error) { setDialogMaterialAberto(false); } finally { setLoadingEstoque(false); } };
  const handleConfirmarAddMaterial = async () => { if (!materialSelecionado || quantidadeMaterial <= 0) return; setIsUpdating(true); try { const token = localStorage.getItem('authToken'); await axios.post(`${API_URL}/materiais/utilizar`, { osId: trabalho.id, tipo: 'servico', materialId: materialSelecionado.id, quantidadeUtilizada: quantidadeMaterial }, { headers: { Authorization: `Bearer ${token}` } }); await fetchTrabalho(false); } catch (error) { enqueueSnackbar(error.response?.data?.error || "Falha ao usar material.", { variant: 'error' }); } finally { setIsUpdating(false); setDialogMaterialAberto(false); } };
  const handleSaveComentarios = () => { if (trabalho && localComentarios !== trabalho.comentarios) handleUpdateTrabalho({ comentarios: localComentarios }); };
  const handleRemoverMaterial = (idx) => handleUpdateTrabalho({ materiais: parseJsonArray(trabalho?.materiais, []).filter((_, i) => i !== idx) });
  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    const formData = new FormData();
    files.forEach(file => { formData.append('fotos', file); });
    setIsUpdating(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(`${API_URL}/servicos/${trabalho.id}/fotos`, { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` } });
      setTrabalho(response.data);
      enqueueSnackbar('Imagens enviadas!', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(error.response?.data?.error || "Falha ao enviar imagens.", { variant: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };
  const handleRemoverFoto = (idx) => handleUpdateTrabalho({ fotos: parseJsonArray(trabalho?.fotos).filter((_, i) => i !== idx) });

  if (loading || !trabalho) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  if (error) return <Paper sx={{ p: 3, m: 2 }}><Typography variant="h5">Erro</Typography><Typography>{error}</Typography><Button onClick={() => navigate('/')} sx={{ mt: 2 }}>Voltar</Button></Paper>;

  const podeIniciarDeslocamento = trabalho.status === 'Atribuído ao Técnico' && !trabalho.inicio_deslocamento;

  // ✅ CORREÇÃO DE LÓGICA: Verifica se o usuário é TÉCNICO
  const isTecnico = user?.role === 'TECNICO';

  // Renderiza a Fase 1 apenas se o usuário for técnico e o serviço estiver no estado correto
  if (podeIniciarDeslocamento && isTecnico) {
    return (
      <Fase1Servico
        trabalho={trabalho}
        onIniciarDeslocamento={handleIniciarDeslocamento}
        isUpdating={isUpdating}
        navigateBack={() => navigate('/servicos')}
      />
    );
  }

  const fase2Props = {
    trabalho, isUpdating, navigate, parseJsonArray, tabValue, setTabValue,
    handleIniciarDeslocamento, podeIniciarDeslocamento,
    handleAbrirAprDialog, handleIniciarServico, handleSaveComentarios,
    handleAbrirDialogMaterial, handleFileChange, handleRemoverFoto, handleRemoverMaterial,
    handleOpenSignatureDialog, handlePausarRetomarServico, handleDevolverServico,
    aprDialogOpen, setAprDialogOpen, respostasAprState, setRespostasAprState, ITENS_APR, handleSalvarApr,
    dialogMaterialAberto, setDialogMaterialAberto, loadingEstoque, estoqueDisponivel,
    materialSelecionado, setMaterialSelecionado, quantidadeMaterial, setQuantidadeMaterial, handleConfirmarAddMaterial,
    signatureDialogOpen, setSignatureDialogOpen, sigCanvas, saveSignature,
    imagemEmDestaque, setImagemEmDestaque,
    devolucaoDialogOpen, setDevolucaoDialogOpen, motivoDevolucao, setMotivoDevolucao, handleConfirmarDevolucao,
    localComentarios, setLocalComentarios
  };

  return <Fase2Servico {...fase2Props} />;
}