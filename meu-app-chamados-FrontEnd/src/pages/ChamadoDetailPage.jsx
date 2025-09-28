// MEU-APP-CHAMADOS-FRONTEND/src/pages/ChamadoDetailPage.jsx
import React, { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import { Box, Paper, Typography, Button, CircularProgress } from '@mui/material';
import { useAppContext } from '../context/AppContext.jsx';
import { ITENS_APR } from '../data/mockData.js';

import Fase1Chamado from '../components/chamado-detail/Fase1Chamado.jsx';
import Fase2Chamado from '../components/chamado-detail/Fase2Chamado.jsx';

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

export default function ChamadoDetailPage() {
  const { user, socket, fetchData } = useAppContext();
  const { chamadoId } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [trabalho, setTrabalho] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [tabValue, setTabValue] = useState('1');
  const [aprDialogOpen, setAprDialogOpen] = useState(false);
  const [respostasAprState, setRespostasAprState] = useState({});
  const [estoqueDisponivel, setEstoqueDisponivel] = useState([]);
  const [loadingEstoque, setLoadingEstoque] = useState(false);
  const [dialogMaterialAberto, setDialogMaterialAberto] = useState(false);
  const [materialSelecionado, setMaterialSelecionado] = useState(null);
  const [quantidadeMaterial, setQuantidadeMaterial] = useState(1);
  const [signatureDialogOpen, setSignatureDialogOpen] = useState(false);
  const [imagemEmDestaque, setImagemEmDestaque] = useState(null);
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
      const response = await axios.get(`${API_URL}/chamados/${chamadoId}`, { headers: { Authorization: `Bearer ${token}` } });
      setTrabalho(response.data);
      setLocalComentarios(response.data.comentarios || '');
      setRespostasAprState(parseJsonObject(response.data.aprRespostas, {}));
    } catch (err) {
      setError("O trabalho que você está procurando não foi encontrado.");
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [chamadoId]);

  useEffect(() => { if (chamadoId) fetchTrabalho(); }, [chamadoId, fetchTrabalho]);
  useEffect(() => {
    if (socket) {
      const handleRealtimeUpdate = (data) => { if (String(data.id) === String(chamadoId)) fetchTrabalho(false); };
      socket.on('chamado_atualizado', handleRealtimeUpdate);
      return () => socket.off('chamado_atualizado', handleRealtimeUpdate);
    }
  }, [socket, chamadoId, fetchTrabalho]);

  const handleUpdateTrabalho = async (dados) => {
    if (isUpdating || !trabalho) return;
    setIsUpdating(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.patch(`${API_URL}/chamados/${trabalho.id}`, dados, { headers: { Authorization: `Bearer ${token}` } });
      setTrabalho(response.data);
      await fetchData(token);
    } catch (error) {
      enqueueSnackbar(error.response?.data?.error || "Falha ao atualizar.", { variant: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleAceitarChamado = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(`${API_URL}/chamados/aceitar`, { chamadoId: trabalho.id }, { headers: { Authorization: `Bearer ${token}` } });
      setTrabalho(response.data);
      enqueueSnackbar('Chamado aceito! Deslocamento iniciado.', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(error.response?.data?.error || "Falha ao aceitar.", { variant: 'error' });
      if (error.response?.data?.error.includes('disponível')) navigate('/chamados');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAbrirAprDialog = async () => {
    if (trabalho.inicio_deslocamento && !trabalho.tempo_deslocamento) {
      await handleUpdateTrabalho({
        tempo_deslocamento: Math.floor((new Date() - new Date(trabalho.inicio_deslocamento)) / 1000),
        historico: [...parseJsonArray(trabalho?.historico), { timestamp: new Date().toISOString(), texto: 'Chegada ao local.' }]
      });
    }
    setAprDialogOpen(true);
  };
  
  const handleIniciarServico = () => { if (!trabalho?.aprCompleta) return enqueueSnackbar('APR não preenchida.', { variant: 'error' }); handleUpdateTrabalho({ inicio_atendimento: new Date().toISOString(), status: 'Em Andamento' }); };
  const handleSalvarApr = () => { if (Object.keys(respostasAprState).length < ITENS_APR.length) return enqueueSnackbar('Responda todos os itens.', { variant: 'warning' }); const aprAprovada = Object.values(respostasAprState).every(r => r === 'sim'); handleUpdateTrabalho({ aprCompleta: aprAprovada, aprRespostas: respostasAprState }); setAprDialogOpen(false); };
  const handlePausarRetomarServico = () => handleUpdateTrabalho({ status: trabalho?.status !== 'Pausado' ? 'Pausado' : 'Em Andamento' });
  const handleDevolverServico = () => setDevolucaoDialogOpen(true);
  const handleConfirmarDevolucao = async () => { if (!motivoDevolucao.trim()) return enqueueSnackbar('Informe o motivo.', { variant: 'warning' }); await handleUpdateTrabalho({ status: 'Devolvido', motivoDevolucao }); navigate('/chamados'); };
  const handleOpenSignatureDialog = () => setSignatureDialogOpen(true);

  const saveSignature = async () => {
    if (sigCanvas.current.isEmpty()) return enqueueSnackbar('Assinatura vazia.', { variant: 'warning' });
    try {
      await handleUpdateTrabalho({
        assinatura: sigCanvas.current.toDataURL('image/png'),
        status: 'Finalizado',
        comentarios: localComentarios
      });
      enqueueSnackbar('Chamado finalizado com sucesso!', { variant: 'success' });
      navigate('/');
    } catch (error) {
      console.error("Falha ao finalizar o chamado:", error);
    }
  };

  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    const formData = new FormData();
    files.forEach(file => { formData.append('fotos', file); });
    setIsUpdating(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(`${API_URL}/chamados/${trabalho.id}/fotos`, formData, { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` } });
      setTrabalho(response.data);
      enqueueSnackbar('Imagens enviadas com sucesso!', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(error.response?.data?.error || "Falha ao enviar imagens.", { variant: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoverFoto = (idx) => handleUpdateTrabalho({ fotos: parseJsonArray(trabalho?.fotos).filter((_, i) => i !== idx) });
  const handleSaveComentarios = () => { if (localComentarios !== trabalho.comentarios) handleUpdateTrabalho({ comentarios: localComentarios }); };
  const handleAbrirDialogMaterial = async () => { setLoadingEstoque(true); setDialogMaterialAberto(true); try { const token = localStorage.getItem('authToken'); const res = await axios.get(`${API_URL}/materiais`, { headers: { Authorization: `Bearer ${token}` } }); setEstoqueDisponivel(res.data); } catch (e) { enqueueSnackbar('Erro ao carregar estoque.', { variant: 'error' }); } finally { setLoadingEstoque(false); } };
  
  const handleConfirmarAddMaterial = async () => { 
    if (!materialSelecionado || quantidadeMaterial <= 0) return; 
    setIsUpdating(true); 
    try { 
      const token = localStorage.getItem('authToken'); 
      await axios.post(`${API_URL}/materiais/utilizar`, { osId: trabalho.id, tipo: 'chamado', materialId: materialSelecionado.id, quantidadeUtilizada: quantidadeMaterial }, { headers: { Authorization: `Bearer ${token}` } }); 
      await fetchTrabalho(false); // Apenas re-busca os dados do chamado atual
    } catch (e) { 
      enqueueSnackbar(e.response?.data?.error || "Falha ao usar material.", { variant: 'error' }); 
    } finally { 
      setIsUpdating(false); 
      setDialogMaterialAberto(false); 
    } 
  };
  
  const handleRemoverMaterial = (idx) => handleUpdateTrabalho({ materiais: parseJsonArray(trabalho?.materiais, []).filter((_, i) => i !== idx) });

  if (loading || !trabalho) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  if (error) return <Paper sx={{ p: 3, m: 2 }}><Typography variant="h5">Erro</Typography><Typography>{error}</Typography><Button onClick={() => navigate('/')}>Voltar</Button></Paper>;

  const { status: statusAtual, tecnico_id } = trabalho;
  const isTecnico = user?.role === 'TECNICO';
  const isAssignedToMe = String(tecnico_id) === String(user?.id);
  const isAvailableToTake = ['Aguardando na Fila', 'Devolvido'].includes(statusAtual) && isTecnico;
  const podeIniciarDeslocamento = isAssignedToMe && ['Atribuído ao Técnico'].includes(statusAtual) && !trabalho.inicio_deslocamento;
  const emDeslocamento = isAssignedToMe && statusAtual === 'Em Deslocamento' && trabalho.inicio_deslocamento && !trabalho.tempo_deslocamento;
  const chegouAoLocal = isAssignedToMe && statusAtual === 'Em Deslocamento' && trabalho.tempo_deslocamento && !trabalho.inicio_atendimento;
  const emAndamento = isAssignedToMe && ['Em Andamento', 'Em Execução', 'Pausado'].includes(statusAtual);

  if (isAvailableToTake) {
    return (
      <Fase1Chamado
        trabalho={trabalho}
        onAceitar={handleAceitarChamado}
        isUpdating={isUpdating}
        navigateBack={() => navigate('/chamados')}
      />
    );
  }

  const fase2Props = {
    trabalho, isUpdating, navigate, parseJsonArray,
    tabValue, setTabValue,
    handleAbrirAprDialog, handleIniciarServico, handleSaveComentarios,
    handleAbrirDialogMaterial,
    handleFileChange, handleRemoverFoto, handleRemoverMaterial,
    handleOpenSignatureDialog, handlePausarRetomarServico, handleDevolverServico,
    aprDialogOpen, setAprDialogOpen, respostasAprState, setRespostasAprState, ITENS_APR, handleSalvarApr,
    dialogMaterialAberto, setDialogMaterialAberto, loadingEstoque, estoqueDisponivel,
    materialSelecionado, setMaterialSelecionado, quantidadeMaterial, setQuantidadeMaterial, handleConfirmarAddMaterial,
    signatureDialogOpen, setSignatureDialogOpen, sigCanvas, saveSignature,
    imagemEmDestaque, setImagemEmDestaque, // <-- CORREÇÃO: Chave duplicada 'setImagemEmDestaque' foi removida da linha abaixo
    devolucaoDialogOpen, setDevolucaoDialogOpen, motivoDevolucao, setMotivoDevolucao, handleConfirmarDevolucao,
    podeIniciarDeslocamento, emDeslocamento, chegouAoLocal, emAndamento
  };

  return <Fase2Chamado {...fase2Props} />;
}