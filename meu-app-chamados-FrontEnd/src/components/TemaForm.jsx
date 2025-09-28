// MEU-APP-CHAMADOS-FRONTEND/src/components/TemaForm.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, Box, Typography,
  FormControlLabel, Switch, Divider, CircularProgress, FormHelperText, Alert, Paper
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const defaultThemeColors = {
  primary: { main: '#007bff' },
  secondary: { main: '#6c757d' },
  success: { main: '#28a745' },
  warning: { main: '#ffc107' },
  error: { main: '#dc3545' },
  background: { default: '#f8f9fa', paper: '#ffffff' },
  text: { primary: '#212529', secondary: '#6c757d' },
  headline: '#007bff',
  configCard_bg: '#ffffff',
  configIcon_color: '#ffffff',
  dashboardCard_bg: '#007bff',
  dashboardCard_textColor: '#ffffff',
  chamadoCard_bg: '#ffffff',
  chamadoCard_accent: '#007bff',
  chamadoCard_titleColor: '#212529',
  chamadoCard_textColor: '#6c757d',
  chamado: {
    fundoDetalhe: '#ffffff',
    textoPrincipal: '#007bff',
    textoSecundario: '#6c757d',
    bordaGeral: 'rgba(0, 0, 0, 0.12)',
    tabAtivaFundo: '#007bff',
    tabAtivaTexto: '#ffffff',
    tabAtivaHoverFundo: '#0069d9',
    tabInativaFundo: '#e9ecef',
    tabInativaTexto: '#495057',
    tabInativaHoverFundo: '#dee2e6',
    fundoCaixaConteudo: '#f8f9fa',
    textoCaixaConteudo: '#212529',
    timelineDot: '#007bff',
    timelineConnector: 'rgba(0, 0, 0, 0.12)',
    historicoTituloCor: '#212529',
    historicoTimestampCor: '#6c757d',
    historicoTextoCor: '#212529',
    historicoPlaceholderCor: '#868e96',
    cronometroFundo: 'transparent',
    cronometroTexto: '#212529',
    cronometroBorda: 'rgba(0, 0, 0, 0.12)',
    registrosTituloCor: '#212529',
    registrosInputFundo: '#ffffff',
    registrosInputTexto: '#212529',
    registrosInputBorder: 'rgba(0, 0, 0, 0.23)',
    registrosInputLabel: '#6c757d',
    registrosBotaoPrincipalFundo: '#007bff',
    registrosBotaoPrincipalTexto: '#ffffff',
    registrosBotaoSecundarioFundo: '#6c757d',
    registrosBotaoSecundarioTexto: '#ffffff',
    conclusaoBotaoFinalizarFundo: '#28a745',
    conclusaoBotaoFinalizarTexto: '#ffffff',
    conclusaoBotaoPausarFundo: '#ffc107',
    conclusaoBotaoPausarTexto: '#212529',
    conclusaoBotaoDevolverFundo: '#dc3545',
    conclusaoBotaoDevolverTexto: '#ffffff',
  },
  login: {
    background: '#ffffff',
    textColor: '#212529',
    inputBackground: '#f8f9fa',
    buttonBackground: '#007bff',
    buttonTextColor: '#ffffff',
  }
};

const ColorPicker = ({ label, value, onChange, number }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
    <Typography sx={{ minWidth: {xs: 180, md: 240}, textAlign: 'right', pr: 1, fontSize: '0.9rem' }}>{number}. {label}:</Typography>
    <TextField
      value={value}
      onChange={(e) => onChange(e.target.value)}
      variant="outlined"
      size="small"
      sx={{ flexGrow: 1, '.MuiInputBase-input': { fontFamily: 'monospace' } }}
    />
    <Paper
      component="label"
      elevation={2}
      sx={{
        width: '40px',
        height: '40px',
        borderRadius: '8px',
        cursor: 'pointer',
        bgcolor: value,
        border: '2px solid rgba(255,255,255,0.5)'
      }}
    >
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} style={{ visibility: 'hidden', width: 0, height: 0 }} />
    </Paper>
  </Box>
);

export default function TemaForm({ open, onClose, onSave, onUploadSuccess, initialData }) {
  const { enqueueSnackbar } = useSnackbar();
  const [nome, setNome] = useState('');
  const [cores, setCores] = useState(defaultThemeColors);
  const [ativo, setAtivo] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState(null);
  const logoInputRef = useRef(null);
  const isEditing = Boolean(initialData);

  useEffect(() => {
    if (open) {
      if (isEditing && initialData.cores) {
        setNome(initialData.nome || '');
        const mergedCores = {
          ...defaultThemeColors,
          ...initialData.cores,
          primary: { ...defaultThemeColors.primary, ...(initialData.cores.primary || {}) },
          secondary: { ...defaultThemeColors.secondary, ...(initialData.cores.secondary || {}) },
          success: { ...defaultThemeColors.success, ...(initialData.cores.success || {}) },
          warning: { ...defaultThemeColors.warning, ...(initialData.cores.warning || {}) },
          error: { ...defaultThemeColors.error, ...(initialData.cores.error || {}) },
          background: { ...defaultThemeColors.background, ...(initialData.cores.background || {}) },
          text: { ...defaultThemeColors.text, ...(initialData.cores.text || {}) },
          chamado: { ...defaultThemeColors.chamado, ...(initialData.cores.chamado || {}) },
          login: { ...defaultThemeColors.login, ...(initialData.cores.login || {}) },
        };
        setCores(mergedCores);
        setAtivo(initialData.ativo || false);
        setLogoPreviewUrl(initialData.logo_url || null);
      } else {
        setNome('');
        setCores(defaultThemeColors);
        setAtivo(false);
        setLogoPreviewUrl(null);
      }
    }
  }, [open, initialData, isEditing]);

  const handleColorChange = (group, key, value) => {
    if (key) {
      setCores(prev => ({ ...prev, [group]: { ...prev[group], [key]: value } }));
    } else {
      setCores(prev => ({ ...prev, [group]: value }));
    }
  };

  const handleChamadoColorChange = (key, value) => {
    setCores(prev => ({ ...prev, chamado: { ...prev.chamado, [key]: value } }));
  };

  const handleLoginColorChange = (key, value) => {
    setCores(prev => ({ ...prev, login: { ...prev.login, [key]: value } }));
  };

  const handleSaveClick = () => {
    if (!nome.trim()) {
      enqueueSnackbar('O nome do tema é obrigatório.', { variant: 'warning' });
      return;
    }
    const temaData = { nome, cores, ativo };
    onSave(temaData, initialData?.id);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    setIsUploading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.patch(`${API_URL}/temas/${initialData.id}/upload/logo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
      });
      if (response.data && response.data.logo_url) { setLogoPreviewUrl(response.data.logo_url); }
      enqueueSnackbar(`Logo enviado com sucesso!`, { variant: 'success' });
      if (onUploadSuccess) { onUploadSuccess(); }
    } catch (error) {
      const errorMessage = error.response?.data?.error || `Falha no upload do logo.`;
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setIsUploading(false);
      event.target.value = null;
    }
  };
  
  const safeGet = (obj, path, fallback = '') => path.split('.').reduce((acc, part) => acc && acc[part] !== undefined ? acc[part] : fallback, obj);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl">
      <DialogTitle>{isEditing ? `Editando Tema: ${initialData.nome}` : 'Criar Novo Tema'}</DialogTitle>
      <DialogContent>
        <TextField autoFocus margin="dense" label="Nome do Tema" type="text" fullWidth variant="outlined" value={nome} onChange={(e) => setNome(e.target.value)} sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={4}>
            <Typography variant="h6" gutterBottom>Cores Globais e Semânticas</Typography>
            <ColorPicker number={1} label="Primária (Botões, links)" value={safeGet(cores, 'primary.main')} onChange={(v) => handleColorChange('primary', 'main', v)} />
            <ColorPicker number={2} label="Secundária (Destaques)" value={safeGet(cores, 'secondary.main')} onChange={(v) => handleColorChange('secondary', 'main', v)} />
            <Divider sx={{ my: 2 }} />
            <ColorPicker number={3} label="Sucesso (Ações positivas)" value={safeGet(cores, 'success.main')} onChange={(v) => handleColorChange('success', 'main', v)} />
            <ColorPicker number={4} label="Aviso (Ações de atenção)" value={safeGet(cores, 'warning.main')} onChange={(v) => handleColorChange('warning', 'main', v)} />
            <ColorPicker number={5} label="Erro (Ações destrutivas)" value={safeGet(cores, 'error.main')} onChange={(v) => handleColorChange('error', 'main', v)} />
            <Divider sx={{ my: 2 }} />
            <ColorPicker number={6} label="Fundo da Página" value={safeGet(cores, 'background.default')} onChange={(v) => handleColorChange('background', 'default', v)} />
            <ColorPicker number={7} label="Fundo de Cards/Modais" value={safeGet(cores, 'background.paper')} onChange={(v) => handleColorChange('background', 'paper', v)} />
            <Divider sx={{ my: 2 }} />
            <ColorPicker number={8} label="Texto Principal" value={safeGet(cores, 'text.primary')} onChange={(v) => handleColorChange('text', 'primary', v)} />
            <ColorPicker number={9} label="Texto Secundário" value={safeGet(cores, 'text.secondary')} onChange={(v) => handleColorChange('text', 'secondary', v)} />
            <ColorPicker number={10} label="Cor Ícones (Naveg./Menus)" value={safeGet(cores, 'configIcon_color')} onChange={(v) => handleColorChange('configIcon_color', null, v)} />
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>Dashboard e Listagem</Typography>
            <ColorPicker number={11} label="Título de Boas-vindas" value={safeGet(cores, 'headline')} onChange={(v) => handleColorChange('headline', null, v)} />
            <ColorPicker number={12} label="Fundo Cards Dashboard" value={safeGet(cores, 'dashboardCard_bg')} onChange={(v) => handleColorChange('dashboardCard_bg', null, v)} />
            <ColorPicker number={13} label="Texto Cards Dashboard" value={safeGet(cores, 'dashboardCard_textColor')} onChange={(v) => handleColorChange('dashboardCard_textColor', null, v)} />
            <Divider sx={{ my: 2 }} />
            <ColorPicker number={14} label="Fundo Card Chamado" value={safeGet(cores, 'chamadoCard_bg')} onChange={(v) => handleColorChange('chamadoCard_bg', null, v)} />
            <ColorPicker number={15} label="Destaque Lateral Card" value={safeGet(cores, 'chamadoCard_accent')} onChange={(v) => handleColorChange('chamadoCard_accent', null, v)} />
            <ColorPicker number={16} label="Título Card Chamado" value={safeGet(cores, 'chamadoCard_titleColor')} onChange={(v) => handleColorChange('chamadoCard_titleColor', null, v)} />
            <ColorPicker number={17} label="Texto Card Chamado" value={safeGet(cores, 'chamadoCard_textColor')} onChange={(v) => handleColorChange('chamadoCard_textColor', null, v)} />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <Typography variant="h6" gutterBottom>Cores da Página de Detalhes</Typography>
            <ColorPicker number={18} label="Fundo da Página" value={safeGet(cores, 'chamado.fundoDetalhe')} onChange={(v) => handleChamadoColorChange('fundoDetalhe', v)} />
            <ColorPicker number={19} label="Texto Principal (Título)" value={safeGet(cores, 'chamado.textoPrincipal')} onChange={(v) => handleChamadoColorChange('textoPrincipal', v)} />
            <ColorPicker number={20} label="Texto Secundário (Endereço)" value={safeGet(cores, 'chamado.textoSecundario')} onChange={(v) => handleChamadoColorChange('textoSecundario', v)} />
            <ColorPicker number={21} label="Borda Geral" value={safeGet(cores, 'chamado.bordaGeral')} onChange={(v) => handleChamadoColorChange('bordaGeral', v)} />
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom>Botões de Navegação</Typography>
            <ColorPicker number={22} label="Fundo Botão Ativo" value={safeGet(cores, 'chamado.tabAtivaFundo')} onChange={(v) => handleChamadoColorChange('tabAtivaFundo', v)} />
            <ColorPicker number={23} label="Texto Botão Ativo" value={safeGet(cores, 'chamado.tabAtivaTexto')} onChange={(v) => handleChamadoColorChange('tabAtivaTexto', v)} />
            <ColorPicker number={24} label="Fundo Hover Botão Ativo" value={safeGet(cores, 'chamado.tabAtivaHoverFundo')} onChange={(v) => handleChamadoColorChange('tabAtivaHoverFundo', v)} />
            <ColorPicker number={25} label="Fundo Botão Inativo" value={safeGet(cores, 'chamado.tabInativaFundo')} onChange={(v) => handleChamadoColorChange('tabInativaFundo', v)} />
            <ColorPicker number={26} label="Texto Botão Inativo" value={safeGet(cores, 'chamado.tabInativaTexto')} onChange={(v) => handleChamadoColorChange('tabInativaTexto', v)} />
            <ColorPicker number={27} label="Fundo Hover Botão Inativo" value={safeGet(cores, 'chamado.tabInativaHoverFundo')} onChange={(v) => handleChamadoColorChange('tabInativaHoverFundo', v)} />
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom>Componentes das Abas</Typography>
            <ColorPicker number={28} label="Fundo Caixa de Conteúdo" value={safeGet(cores, 'chamado.fundoCaixaConteudo')} onChange={(v) => handleChamadoColorChange('fundoCaixaConteudo', v)} />
            <ColorPicker number={29} label="Texto Caixa de Conteúdo" value={safeGet(cores, 'chamado.textoCaixaConteudo')} onChange={(v) => handleChamadoColorChange('textoCaixaConteudo', v)} />
            <ColorPicker number={30} label="Fundo Cronômetro" value={safeGet(cores, 'chamado.cronometroFundo')} onChange={(v) => handleChamadoColorChange('cronometroFundo', v)} />
            <ColorPicker number={31} label="Texto Cronômetro" value={safeGet(cores, 'chamado.cronometroTexto')} onChange={(v) => handleChamadoColorChange('cronometroTexto', v)} />
            <ColorPicker number={32} label="Borda Cronômetro" value={safeGet(cores, 'chamado.cronometroBorda')} onChange={(v) => handleChamadoColorChange('cronometroBorda', v)} />
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom>Aba de Histórico</Typography>
            <ColorPicker number={33} label="Título da Seção" value={safeGet(cores, 'chamado.historicoTituloCor')} onChange={(v) => handleChamadoColorChange('historicoTituloCor', v)} />
            <ColorPicker number={34} label="Ponto Linha do Tempo" value={safeGet(cores, 'chamado.timelineDot')} onChange={(v) => handleChamadoColorChange('timelineDot', v)} />
            <ColorPicker number={35} label="Conector Linha do Tempo" value={safeGet(cores, 'chamado.timelineConnector')} onChange={(v) => handleChamadoColorChange('timelineConnector', v)} />
            <ColorPicker number={36} label="Texto Data/Hora" value={safeGet(cores, 'chamado.historicoTimestampCor')} onChange={(v) => handleChamadoColorChange('historicoTimestampCor', v)} />
            <ColorPicker number={37} label="Texto do Evento" value={safeGet(cores, 'chamado.historicoTextoCor')} onChange={(v) => handleChamadoColorChange('historicoTextoCor', v)} />
            <ColorPicker number={38} label="Texto Placeholder (Vazio)" value={safeGet(cores, 'chamado.historicoPlaceholderCor')} onChange={(v) => handleChamadoColorChange('historicoPlaceholderCor', v)} />
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom>Aba de Registros</Typography>
            <ColorPicker number={39} label="Título da Seção" value={safeGet(cores, 'chamado.registrosTituloCor')} onChange={(v) => handleChamadoColorChange('registrosTituloCor', v)} />
            <ColorPicker number={40} label="Fundo Input Anotações" value={safeGet(cores, 'chamado.registrosInputFundo')} onChange={(v) => handleChamadoColorChange('registrosInputFundo', v)} />
            <ColorPicker number={41} label="Texto Input Anotações" value={safeGet(cores, 'chamado.registrosInputTexto')} onChange={(v) => handleChamadoColorChange('registrosInputTexto', v)} />
            <ColorPicker number={42} label="Borda Input Anotações" value={safeGet(cores, 'chamado.registrosInputBorder')} onChange={(v) => handleChamadoColorChange('registrosInputBorder', v)} />
            <ColorPicker number={43} label="Label Input Anotações" value={safeGet(cores, 'chamado.registrosInputLabel')} onChange={(v) => handleChamadoColorChange('registrosInputLabel', v)} />
            <ColorPicker number={44} label="Fundo Botão Principal" value={safeGet(cores, 'chamado.registrosBotaoPrincipalFundo')} onChange={(v) => handleChamadoColorChange('registrosBotaoPrincipalFundo', v)} />
            <ColorPicker number={45} label="Texto Botão Principal" value={safeGet(cores, 'chamado.registrosBotaoPrincipalTexto')} onChange={(v) => handleChamadoColorChange('registrosBotaoPrincipalTexto', v)} />
            <ColorPicker number={46} label="Fundo Botão Secundário" value={safeGet(cores, 'chamado.registrosBotaoSecundarioFundo')} onChange={(v) => handleChamadoColorChange('registrosBotaoSecundarioFundo', v)} />
            <ColorPicker number={47} label="Texto Botão Secundário" value={safeGet(cores, 'chamado.registrosBotaoSecundarioTexto')} onChange={(v) => handleChamadoColorChange('registrosBotaoSecundarioTexto', v)} />
          </Grid>
          <Grid item xs={12} md={12} lg={4}>
            <Typography variant="subtitle1" gutterBottom>Aba de Conclusão</Typography>
            <ColorPicker number={48} label="Fundo Botão Finalizar" value={safeGet(cores, 'chamado.conclusaoBotaoFinalizarFundo')} onChange={(v) => handleChamadoColorChange('conclusaoBotaoFinalizarFundo', v)} />
            <ColorPicker number={49} label="Texto Botão Finalizar" value={safeGet(cores, 'chamado.conclusaoBotaoFinalizarTexto')} onChange={(v) => handleChamadoColorChange('conclusaoBotaoFinalizarTexto', v)} />
            <ColorPicker number={50} label="Fundo Botão Pausar" value={safeGet(cores, 'chamado.conclusaoBotaoPausarFundo')} onChange={(v) => handleChamadoColorChange('conclusaoBotaoPausarFundo', v)} />
            <ColorPicker number={51} label="Texto Botão Pausar" value={safeGet(cores, 'chamado.conclusaoBotaoPausarTexto')} onChange={(v) => handleChamadoColorChange('conclusaoBotaoPausarTexto', v)} />
            <ColorPicker number={52} label="Fundo Botão Devolver" value={safeGet(cores, 'chamado.conclusaoBotaoDevolverFundo')} onChange={(v) => handleChamadoColorChange('conclusaoBotaoDevolverFundo', v)} />
            <ColorPicker number={53} label="Texto Botão Devolver" value={safeGet(cores, 'chamado.conclusaoBotaoDevolverTexto')} onChange={(v) => handleChamadoColorChange('conclusaoBotaoDevolverTexto', v)} />
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom>Cores da Tela de Login</Typography>
            <ColorPicker number={54} label="Fundo da Página de Login" value={safeGet(cores, 'login.background')} onChange={(v) => handleLoginColorChange('background', v)} />
            <ColorPicker number={55} label="Texto (Labels, Placeholder)" value={safeGet(cores, 'login.textColor')} onChange={(v) => handleLoginColorChange('textColor', v)} />
            <ColorPicker number={56} label="Fundo do Campo de Texto" value={safeGet(cores, 'login.inputBackground')} onChange={(v) => handleLoginColorChange('inputBackground', v)} />
            <ColorPicker number={57} label="Fundo do Botão 'Entrar'" value={safeGet(cores, 'login.buttonBackground')} onChange={(v) => handleLoginColorChange('buttonBackground', v)} />
            <ColorPicker number={58} label="Texto do Botão 'Entrar'" value={safeGet(cores, 'login.buttonTextColor')} onChange={(v) => handleLoginColorChange('buttonTextColor', v)} />
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom>Imagens e Configurações</Typography>
            {!isEditing && (<Alert severity="info" sx={{ mb: 2 }}>Salve o tema primeiro para poder adicionar imagens.</Alert>)}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box sx={{ width: 150, height: 60, bgcolor: 'action.hover', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 0.5, border: '1px dashed grey' }}>
                {logoPreviewUrl ? <img src={logoPreviewUrl} alt="Logo preview" style={{ maxHeight: '100%', maxWidth: '100%' }} /> : <Typography variant="caption">Sem logo</Typography>}
              </Box>
              <Box>
                <Button variant="outlined" component="label" startIcon={isUploading ? <CircularProgress size={20} /> : <UploadFileIcon />} disabled={!isEditing || isUploading}>
                  Enviar Logo
                  <input type="file" hidden accept="image/png, image/jpeg, image/svg+xml" ref={logoInputRef} onChange={handleFileUpload} />
                </Button>
                <FormHelperText>Recomendado: 250x60 pixels</FormHelperText>
              </Box>
            </Box>
            <Box>
              <FormControlLabel control={<Switch checked={ativo} onChange={(e) => setAtivo(e.target.checked)} />} label="Definir como tema padrão para novos usuários" />
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSaveClick} variant="contained">Salvar Alterações</Button>
      </DialogActions>
    </Dialog>
  );
}