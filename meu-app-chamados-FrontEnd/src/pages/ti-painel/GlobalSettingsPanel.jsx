// MEU-APP-CHAMADOS-FRONTEND/src/pages/ti-painel/GlobalSettingsPanel.jsx
import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Button, Grid, FormHelperText, CircularProgress, Alert } from '@mui/material';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useAppContext } from '../../context/AppContext';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const ImageUploadBox = ({ label, description, previewUrl, onFileUpload, isUploading, themeId }) => {
  if (!themeId) {
    return <Alert severity="warning">O tema padrão 'laink' não foi encontrado no banco de dados. Crie-o primeiro para habilitar o upload.</Alert>;
  }

  return (
    <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box 
        sx={{ 
          width: 150, 
          height: 60, 
          bgcolor: 'action.hover', 
          borderRadius: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          p: 0.5, 
          border: '1px dashed grey' 
        }}
      >
        {previewUrl ? 
          <img src={previewUrl} alt={`${label} preview`} style={{ maxHeight: '100%', maxWidth: '100%' }} /> 
          : <Typography variant="caption" color="text.secondary">Sem imagem</Typography>
        }
      </Box>
      <Box>
        <Typography sx={{ fontWeight: '500' }}>{label}</Typography>
        <Button 
          variant="outlined" 
          component="label" 
          size="small"
          startIcon={isUploading ? <CircularProgress size={20} /> : <UploadFileIcon />} 
          disabled={isUploading}
          sx={{ mt: 0.5 }}
        >
          Enviar Arquivo
          <input 
            type="file" 
            hidden 
            accept="image/png, image/jpeg, image/svg+xml, image/x-icon" 
            onChange={onFileUpload} 
          />
        </Button>
        <FormHelperText>{description}</FormHelperText>
      </Box>
    </Paper>
  );
};

export default function GlobalSettingsPanel() {
  const { enqueueSnackbar } = useSnackbar();
  const { apiThemes, fetchApiThemes } = useAppContext();
  const [lainkTheme, setLainkTheme] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [faviconPreview, setFaviconPreview] = useState(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingFavicon, setIsUploadingFavicon] = useState(false);

  useEffect(() => {
    if (Array.isArray(apiThemes)) {
      const theme = apiThemes.find(t => t.nome?.toLowerCase() === 'laink');
      setLainkTheme(theme);
      if (theme) {
        const getFullUrl = (url) => {
          if (!url || url.startsWith('http')) return url;
          return `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
        };
        setLogoPreview(getFullUrl(theme.logo_url));
        setFaviconPreview(getFullUrl(theme.favicon_url));
      }
    }
  }, [apiThemes]);
  
  const handleFileUpload = async (file, type) => {
    if (!file || !lainkTheme) return;

    const isLogo = type === 'logo';
    if (isLogo) setIsUploadingLogo(true);
    else setIsUploadingFavicon(true);
    
    const formData = new FormData();
    formData.append('image', file);

    try {
      const token = localStorage.getItem('authToken');
      await axios.patch(`${API_URL}/temas/${lainkTheme.id}/upload/${type}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
      });
      enqueueSnackbar(`${isLogo ? 'Logo' : 'Favicon'} enviado com sucesso!`, { variant: 'success' });
      await fetchApiThemes();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.error || `Falha no upload.`, { variant: 'error' });
    } finally {
      if (isLogo) setIsUploadingLogo(false);
      else setIsUploadingFavicon(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Configurações Globais
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Gerencie os itens visuais que se aplicam a todo o sistema, associados ao tema padrão 'laink'.
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <ImageUploadBox
            label="Logo Principal"
            description="Recomendado: 250x60 (PNG, SVG)"
            previewUrl={logoPreview}
            onFileUpload={(e) => handleFileUpload(e.target.files[0], 'logo')}
            isUploading={isUploadingLogo}
            themeId={lainkTheme?.id}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <ImageUploadBox
            label="Favicon"
            description="Recomendado: 32x32 (.ico, PNG)"
            previewUrl={faviconPreview}
            onFileUpload={(e) => handleFileUpload(e.target.files[0], 'favicon')}
            isUploading={isUploadingFavicon}
            themeId={lainkTheme?.id}
          />
        </Grid>
      </Grid>
    </Paper>
  );
}