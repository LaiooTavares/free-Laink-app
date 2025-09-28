// MEU-APP-CHAMADOS-FRONTEND/src/components/LogoDinamico.jsx
import React from 'react';
import { Box, Typography } from '@mui/material';
import { useAppContext } from '../context/AppContext.jsx';

export default function LogoDinamico({ sx }) {
  const { brandingData, loading } = useAppContext();

  if (loading) {
    return null;
  }

  const logoSrc = brandingData?.logo_url;

  if (!logoSrc) {
    return null;
  }

  // ✅ O componente agora é um contêiner para permitir o texto sobre a imagem
  return (
    <Box sx={{ position: 'relative', display: 'inline-block', ...sx }}>
      <Box
        component="img"
        src={logoSrc}
        alt="Logo da Empresa"
        // Garante que a imagem preencha o contêiner
        sx={{ width: '100%', height: '100%', display: 'block' }}
        onError={(e) => {
          if (e.target.src.includes('logo-padrao.svg')) return;
          console.error(`Falha ao carregar o logo dinâmico: ${logoSrc}`);
          e.target.onerror = null; 
          e.target.src = '/logo-padrao.svg';
        }}
      />
      {/* ✅ Selo "Free" adicionado aqui */}
      <Typography
        sx={{
          position: 'absolute',
          bottom: -2,
          right: -5,
          bgcolor: 'background.paper',
          color: 'text.secondary',
          px: 0.5,
          py: 0.2,
          fontSize: '0.6rem',
          fontWeight: 'bold',
          borderRadius: '4px',
          lineHeight: 1,
          border: '1px solid rgba(0,0,0,0.1)'
        }}
      >
        Free
      </Typography>
    </Box>
  );
}