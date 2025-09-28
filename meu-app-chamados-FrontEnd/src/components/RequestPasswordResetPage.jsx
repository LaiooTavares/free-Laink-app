// src/components/RequestPasswordResetPage.jsx

import React, { useState } from 'react';
import { Box, TextField, Button, Typography, CircularProgress, Alert } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { Link } from 'react-router-dom';
import logo from '../assets/logo 2.png';

export default function RequestPasswordResetPage() {
  const [matricula, setMatricula] = useState('');
  const [cpf, setCpf] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [requestSent, setRequestSent] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setRequestSent(true);
    }, 2000);
  };

  if (requestSent) {
    return (
      <Box sx={{ textAlign: 'center' }}>
        <CheckCircleOutlineIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
        <Typography component="h1" variant="h5" sx={{ mb: 2 }}>Solicitação Enviada!</Typography>
        <Typography variant="body1" color="text.secondary">Seu pedido foi recebido. Um gestor entrará em contato em breve.</Typography>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <Button variant="contained" fullWidth sx={{ mt: 4 }}>Voltar para o Login</Button>
        </Link>
      </Box>
    );
  }

  return (
    <>
      <img src={logo} alt="Logo da Laink" style={{ width: '100px', marginBottom: '16px' }} />
      <Typography component="h1" variant="h5">Solicitar Nova Senha</Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, width: '100%' }}>
        <TextField margin="normal" required fullWidth id="matricula" label="Matrícula" name="matricula" autoFocus value={matricula} onChange={(e) => setMatricula(e.target.value)} disabled={loading} />
        <TextField margin="normal" required fullWidth name="cpf" label="CPF" id="cpf" value={cpf} onChange={(e) => setCpf(e.target.value)} disabled={loading} />
        {error && (<Alert severity="error" sx={{ mt: 2, width: '100%' }}>{error}</Alert>)}
        <Box sx={{ position: 'relative', mt: 3, mb: 2 }}>
          <Button type="submit" fullWidth variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Enviar Solicitação'}
          </Button>
        </Box>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <Typography variant="body2" color="primary" sx={{ textAlign: 'center' }}>Voltar para o Login</Typography>
        </Link>
      </Box>
    </>
  );
}