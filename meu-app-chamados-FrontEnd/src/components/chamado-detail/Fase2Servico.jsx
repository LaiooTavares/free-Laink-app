// MEU-APP-CHAMADOS-FRONTEND/src/components/chamado-detail/Fase2Servico.jsx
import React, { lazy, Suspense } from 'react';
import {
    Box, Typography, Button, Paper, Divider, IconButton, CircularProgress,
    Dialog, DialogTitle, DialogContent, DialogActions,
    FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, useTheme, TextField,
    DialogContentText, Autocomplete
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { TabContext, TabPanel } from '@mui/lab';
import Cronometro from '../Cronometro';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MapIcon from '@mui/icons-material/Map';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';

const RegistrosTab = lazy(() => import('../chamado-detail/RegistrosTab.jsx'));
const HistoricoTab = lazy(() => import('../chamado-detail/HistoricoTab.jsx'));
const ConclusaoTab = lazy(() => import('../chamado-detail/ConclusaoTab.jsx'));
const SignatureCanvas = lazy(() => import('react-signature-canvas'));

// Botão com gradiente azul
const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(145deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  color: theme.palette.primary.contrastText,
  fontWeight: 'bold',
  '&:hover': {
    background: `linear-gradient(145deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
  },
}));

const Fase2Servico = (props) => {
    const {
        trabalho, isUpdating, navigate, tabValue, setTabValue,
        handleAbrirAprDialog, handleIniciarServico,
        aprDialogOpen, setAprDialogOpen, respostasAprState, setRespostasAprState, ITENS_APR, handleSalvarApr,
        dialogMaterialAberto, setDialogMaterialAberto, loadingEstoque, estoqueDisponivel,
        materialSelecionado, setMaterialSelecionado, quantidadeMaterial, setQuantidadeMaterial, handleConfirmarAddMaterial,
        signatureDialogOpen, setSignatureDialogOpen, sigCanvas, saveSignature,
        devolucaoDialogOpen, setDevolucaoDialogOpen, motivoDevolucao, setMotivoDevolucao, handleConfirmarDevolucao,
        imagemEmDestaque, setImagemEmDestaque
    } = props;

    const theme = useTheme();

    const handleTabChange = (_, newValue) => setTabValue(newValue);

    const handleAdvance = () => {
        const currentTab = parseInt(tabValue, 10);
        if (currentTab < 5) {
            handleTabChange(null, (currentTab + 1).toString());
        }
    };

    const buttonTabStyle = (tabId) => ({
      textTransform: 'none', fontWeight: 600, fontSize: { xs: '0.8rem', sm: '0.9rem' },
      minWidth: 0, flexGrow: 1, borderRadius: '20px', mx: { xs: 0.5, sm: 1 },
      py: 1, px: 2,
      transition: 'all 0.3s ease',
      ...(tabValue === tabId ? {
        // Estilo da Aba Ativa
        background: `linear-gradient(145deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        color: theme.palette.primary.contrastText,
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      } : {
        // Estilo da Aba Inativa
        color: theme.palette.primary.main,
        backgroundColor: theme.palette.grey[200],
        '&:hover': {
          backgroundColor: theme.palette.grey[300],
        },
      }),
    });
    
    const isServiceInProgress = ['Em Andamento', 'Em Execução', 'Pausado', 'Aguardando Assinatura'].includes(trabalho.status);

    return (
        <Box sx={{ pb: '100px' }}>
            <Box sx={{ px: { xs: 2, sm: 3 }, pt: 2, pb: 1, display: 'flex', alignItems: 'center' }}>
                <IconButton onClick={() => navigate(-1)} color="primary"><ArrowBackIcon /></IconButton>
                <Typography variant="button" sx={{ ml: 1, cursor: 'pointer', fontWeight: 'bold', color: 'primary.main' }} onClick={() => navigate(-1)}>Voltar</Typography>
            </Box>

            <TabContext value={tabValue}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: { xs: 0.5, sm: 1 }, mx: { xs: 1, sm: 3 }, mb: 2 }}>
                    <Button onClick={() => handleTabChange(null, '1')} sx={buttonTabStyle('1')}>Detalhes</Button>
                    <Button onClick={() => handleTabChange(null, '2')} sx={buttonTabStyle('2')}>Descrição</Button>
                    {isServiceInProgress && (
                        <>
                            <Button onClick={() => handleTabChange(null, '3')} sx={buttonTabStyle('3')}>Registros</Button>
                            <Button onClick={() => handleTabChange(null, '4')} sx={buttonTabStyle('4')}>Histórico</Button>
                            <Button onClick={() => handleTabChange(null, '5')} sx={buttonTabStyle('5')}>Conclusão</Button>
                        </>
                    )}
                </Box>

                <Box sx={{ px: { xs: 0, sm: 3 }, mt: 2, pb: 2 }}>
                    <TabPanel value="1" sx={{ p: 0 }}>
                        <Paper elevation={4} sx={{ borderRadius: { xs: 0, sm: 3 }, overflow: 'hidden', p: 0 }}>
                            <Box sx={{ textAlign: 'center', p: { xs: 2, sm: 3 }, background: `linear-gradient(145deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`, color: 'white' }}>
                                <Typography variant="h4" component="h1" fontWeight="bold">{trabalho.id}</Typography>
                                <Typography variant="h5" component="h2" sx={{ mt: 1 }}>{`[${trabalho.ic}] ${trabalho.cliente}`}</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2, opacity: 0.9 }}><MapIcon sx={{ mr: 1 }} /><Typography>{trabalho.endereco.replace(' - ', '\n')}</Typography></Box>
                            </Box>
                            <Box sx={{ p: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {trabalho.status === 'Atribuído ao Técnico' && !trabalho.inicio_deslocamento && <GradientButton size="large" fullWidth onClick={props.handleIniciarDeslocamento} disabled={isUpdating}>Iniciar Deslocamento</GradientButton>}
                                {trabalho.status === 'Em Deslocamento' && (<><Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}><Typography variant="overline">Tempo de Deslocamento</Typography><Cronometro dataInicio={trabalho.inicio_deslocamento} /></Paper><GradientButton fullWidth startIcon={<AssignmentTurnedInIcon />} onClick={handleAbrirAprDialog}>Cheguei / Preencher APR</GradientButton></>)}
                                {trabalho.status === 'Aguardando a APR' && (<><Button variant="contained" fullWidth color={trabalho.aprCompleta ? "success" : "warning"} startIcon={<AssignmentTurnedInIcon />} onClick={() => setAprDialogOpen(true)}>{trabalho.aprCompleta ? "APR Preenchida (Ver/Editar)" : "Preencher APR"}</Button><GradientButton size="large" fullWidth onClick={handleIniciarServico} disabled={!trabalho.aprCompleta || isUpdating}>Iniciar Serviço</GradientButton></>)}
                                {isServiceInProgress && (<Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}><Typography variant="overline">Tempo de Execução</Typography><Cronometro dataInicio={trabalho.inicio_atendimento} tempoAcumulado={trabalho.tempoDecorrido} /></Paper>)}
                            </Box>
                        </Paper>
                    </TabPanel>
                    <TabPanel value="2" sx={{ p: 0 }}>
                        <Paper elevation={3} sx={{ borderRadius: { xs: 0, sm: 3 }, p: { xs: 3, sm: 5 }, textAlign: 'center' }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>Descrição do Problema</Typography>
                            <Typography sx={{ whiteSpace: 'pre-wrap' }}>{trabalho.descricao}</Typography>
                        </Paper>
                    </TabPanel>
                    <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>}>
                        {isServiceInProgress && (
                            <>
                                <TabPanel value="3" sx={{ p: 0 }}><RegistrosTab {...props} /></TabPanel>
                                <TabPanel value="4" sx={{ p: 0 }}><HistoricoTab {...props} /></TabPanel>
                                <TabPanel value="5" sx={{ p: 0 }}><ConclusaoTab {...props} /></TabPanel>
                            </>
                        )}
                    </Suspense>
                </Box>
            </TabContext>

            {isServiceInProgress && tabValue !== '5' && (
                <Paper 
                    elevation={4} 
                    sx={{ 
                      position: 'sticky', bottom: 0, zIndex: 1100,
                      background: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(4px)',
                      borderTop: `1px solid ${theme.palette.divider}`,
                    }}
                >
                  <Box sx={{ p: 2 }}>
                    <GradientButton endIcon={<ArrowForwardIcon />} onClick={handleAdvance} fullWidth size="large">
                        Avançar
                    </GradientButton>
                  </Box>
                </Paper>
            )}

            {/* DIALOGS */}
            <Dialog open={aprDialogOpen} onClose={() => setAprDialogOpen(false)}><DialogTitle>Análise Preliminar de Risco (APR)</DialogTitle><DialogContent>{ITENS_APR.map(item => (<FormControl component="fieldset" key={item.id} sx={{ mb: 2, width: '100%' }}><FormLabel component="legend">{item.texto}</FormLabel><RadioGroup row value={respostasAprState[item.id] || ''} onChange={(e) => setRespostasAprState(prev => ({ ...prev, [item.id]: e.target.value }))}><FormControlLabel value="sim" control={<Radio />} label="Sim" /><FormControlLabel value="não" control={<Radio />} label="Não" /></RadioGroup></FormControl>))}</DialogContent><DialogActions><Button onClick={() => setAprDialogOpen(false)}>Cancelar</Button><Button onClick={handleSalvarApr} variant="contained">Salvar APR</Button></DialogActions></Dialog>
            <Dialog open={dialogMaterialAberto} onClose={() => setDialogMaterialAberto(false)} fullWidth maxWidth="xs"><DialogTitle>Adicionar Material do Estoque</DialogTitle><DialogContent>{loadingEstoque ? <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box> : <><Autocomplete options={estoqueDisponivel} getOptionLabel={(option) => `${option.nome} (Disponível: ${option.quantidade})`} getOptionDisabled={(option) => option.quantidade === 0} value={materialSelecionado} onChange={(event, newValue) => setMaterialSelecionado(newValue)} renderInput={(params) => <TextField {...params} label="Buscar material" margin="normal" />} /><TextField label="Quantidade" type="number" value={quantidadeMaterial} onChange={(e) => setQuantidadeMaterial(Number(e.target.value))} fullWidth margin="normal" InputProps={{ inputProps: { min: 1, max: materialSelecionado?.quantidade || 1 } }} /></>}</DialogContent><DialogActions><Button onClick={() => setDialogMaterialAberto(false)}>Cancelar</Button><Button onClick={handleConfirmarAddMaterial} variant="contained" disabled={loadingEstoque}>Adicionar</Button></DialogActions></Dialog>
            <Dialog open={signatureDialogOpen} onClose={() => setSignatureDialogOpen(false)} fullWidth maxWidth="sm"><DialogTitle>Assinatura do Cliente</DialogTitle><DialogContent sx={{ display: 'flex', justifyContent: 'center', p: 1 }}><Box sx={{ border: `1px dashed ${theme.palette.divider}`, width: '100%', height: 200 }}><Suspense fallback={<CircularProgress />}><SignatureCanvas ref={sigCanvas} penColor={theme.palette.text.primary} canvasProps={{ style: { width: '100%', height: '100%' } }} /></Suspense></Box></DialogContent><DialogActions sx={{ justifyContent: 'space-between', p: 2 }}><Button onClick={() => sigCanvas.current.clear()}>Limpar</Button><Box><Button onClick={() => setSignatureDialogOpen(false)} sx={{ mr: 1 }}>Cancelar</Button><Button onClick={saveSignature} variant="contained">Confirmar</Button></Box></DialogActions></Dialog>
            <Dialog open={!!imagemEmDestaque} onClose={() => setImagemEmDestaque(null)} maxWidth="lg"><DialogTitle>Visualizador de Imagem</DialogTitle><DialogContent sx={{ p: 1, textAlign: 'center' }}><img src={imagemEmDestaque} alt="Imagem em destaque" style={{ maxWidth: '100%', maxHeight: '80vh' }} /></DialogContent><DialogActions><Button onClick={() => setImagemEmDestaque(null)}>Fechar</Button></DialogActions></Dialog>
            <Dialog open={devolucaoDialogOpen} onClose={() => setDevolucaoDialogOpen(false)} fullWidth maxWidth="sm"><DialogTitle>Devolver Serviço</DialogTitle><DialogContent><DialogContentText>Descreva o motivo da devolução.</DialogContentText><TextField autoFocus margin="dense" label="Motivo da Devolução" type="text" fullWidth multiline rows={4} variant="outlined" value={motivoDevolucao} onChange={(e) => setMotivoDevolucao(e.target.value)} /></DialogContent><DialogActions><Button onClick={() => setDevolucaoDialogOpen(false)}>Cancelar</Button><Button onClick={handleConfirmarDevolucao} variant="contained" color="error">Confirmar</Button></DialogActions></Dialog>
        </Box>
    );
};

export default Fase2Servico;