// src/components/AuthLayout.jsx

import React from 'react';
import { Box, Container } from '@mui/material';

// Este componente recebe o conteúdo da página como um "filho" (prop children)
export default function AuthLayout({ children }) {
  return (
    // O Box que faz a mágica da centralização
    <Box 
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Container component="main" maxWidth="xs">
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center' 
          }}
        >
          {children} {/* Aqui é onde o conteúdo da página (Login ou Reset) será renderizado */}
        </Box>
      </Container>
    </Box>
  );
}