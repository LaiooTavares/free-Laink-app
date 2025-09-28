// MEU-APP-CHAMADOS-FRONTEND/src/components/chamado-detail/RegistrosTab.jsx
import React, { useRef } from 'react';
import {
  Box, Typography, Button, Paper, Divider, TextField,
  List, ListItem, ListItemText, Grid, IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Ícones
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import CloseIcon from '@mui/icons-material/Close';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';

const isMobileDevice = typeof window !== 'undefined' && navigator.maxTouchPoints > 0;

const parseJsonArray = (data, fallback = []) => {
  if (Array.isArray(data)) return data;
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : fallback;
    } catch (e) { return fallback; }
  }
  return fallback;
};

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

// Título com gradiente
const GradientTypography = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 50%, ${theme.palette.primary.main} 100%)`,
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
}));

export default function RegistrosTab({
  trabalho,
  localComentarios,
  setLocalComentarios,
  handleSaveComentarios,
  handleAbrirDialogMaterial,
  handleFileChange,
  setImagemEmDestaque,
  handleRemoverFoto,
  handleRemoverMaterial
}) {
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const materiais = parseJsonArray(trabalho?.materiais, []);
  const fotos = parseJsonArray(trabalho?.fotos, []);

  const handleTirarFotoClick = () => cameraInputRef.current.click();
  const handleGaleriaClick = () => galleryInputRef.current.click();

  return (
    <Paper
      elevation={3}
      sx={{
        borderRadius: { xs: 0, sm: 3 },
        p: { xs: 2, sm: 3 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <GradientTypography variant="h6" gutterBottom>
        Anotações do Técnico
      </GradientTypography>
      <TextField
        placeholder="Adicione as suas anotações aqui..."
        multiline
        rows={4}
        fullWidth
        value={localComentarios}
        onChange={(e) => setLocalComentarios(e.target.value)}
        onBlur={handleSaveComentarios}
        variant="filled"
        sx={{
          my: 2,
          '& .MuiInputBase-root': {
            backgroundColor: (theme) => theme.palette.grey[100],
            borderRadius: 2,
            '&:before, &:after': {
              borderBottom: 'none !important',
            },
          },
          '& .MuiInputBase-input': {
            textAlign: 'center',
          },
        }}
      />

      <Divider sx={{ my: 2, width: '90%' }} />

      <GradientTypography variant="h6" gutterBottom>
        Materiais Utilizados
      </GradientTypography>
      {materiais.length > 0 ? (
        <List dense sx={{ width: '100%' }}>
          {materiais.map((item, index) => (
            <ListItem
              key={index}
              secondaryAction={
                <IconButton edge="end" aria-label="delete" onClick={() => handleRemoverMaterial(index)}>
                  <DeleteIcon sx={{ color: 'error.main' }} />
                </IconButton>
              }
            >
              <ListItemText
                primary={`- ${item.quantidade}x ${item.nome}`}
                sx={{ pr: 5 }}
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography sx={{ my: 1.5, fontStyle: 'italic', color: 'text.secondary' }}>
          Nenhum material utilizado.
        </Typography>
      )}
      <GradientButton
        startIcon={<AddShoppingCartIcon />}
        onClick={handleAbrirDialogMaterial}
      >
        Adicionar Material
      </GradientButton>

      <Divider sx={{ my: 2, width: '90%' }} />

      <GradientTypography variant="h6" gutterBottom>
        Fotos do Serviço
      </GradientTypography>
      {fotos.length > 0 ? (
        <Grid container spacing={1} sx={{ mt: 1, justifyContent: 'center' }}>
          {fotos.map((foto, index) => (
            <Grid item xs={'auto'} sm={'auto'} key={index}>
              <Box sx={{ position: 'relative' }}>
                <Box
                  component="img"
                  src={foto}
                  alt={`preview ${index}`}
                  sx={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 1, cursor: 'pointer' }}
                  onClick={() => setImagemEmDestaque(foto)}
                />
                <IconButton
                  size="small"
                  onClick={() => handleRemoverFoto(index)}
                  sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'rgba(255,255,255,0.7)', '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography sx={{ my: 1.5, fontStyle: 'italic', color: 'text.secondary' }}>
          Nenhuma foto foi adicionada.
        </Typography>
      )}
      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
        <input type="file" multiple accept="image/*" ref={galleryInputRef} onChange={handleFileChange} style={{ display: 'none' }} />

        {isMobileDevice ? (
          <>
            <GradientButton startIcon={<PhotoCameraIcon />} onClick={handleTirarFotoClick}>
              Tirar Foto
            </GradientButton>
            <GradientButton startIcon={<AddAPhotoIcon />} onClick={handleGaleriaClick}>
              Anexar
            </GradientButton>
          </>
        ) : (
          <GradientButton startIcon={<AddAPhotoIcon />} onClick={handleGaleriaClick}>
            Anexar Imagens
          </GradientButton>
        )}
      </Box>
    </Paper>
  );
}