// MEU-APP-CHAMADOS-FRONTEND/src/pages/LoginPage.jsx
import React, { useState } from 'react';
import {
  Box, TextField, Button, Typography, CircularProgress, IconButton,
  InputAdornment, Alert, FormControlLabel, Checkbox, CssBaseline, useTheme
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LogoDinamico from '../components/LogoDinamico';
import { useAppContext } from '../context/AppContext.jsx';
import { alpha } from '@mui/material/styles';

export default function LoginPage() {
  const theme = useTheme();
  const { login } = useAppContext();
  
  const loginPalette = theme.palette.login || {};
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password); 
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Falha no login. Verifique suas credenciais.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const textFieldStyles = {
    "& .MuiInputBase-root": {
      color: loginPalette.textColor || theme.palette.text.primary,
    },
    "& .MuiInputBase-input": {
      fontSize: "1.45rem",
    },
    "& .MuiInputLabel-root": {
      color: loginPalette.textColor ? alpha(loginPalette.textColor, 0.7) : theme.palette.text.secondary,
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: loginPalette.textColor || theme.palette.primary.main,
    },
    "& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus, & input:-webkit-autofill:active": {
      fontSize: "1.45rem",
      WebkitBoxShadow: `0 0 0 1000px ${loginPalette.inputBackground || '#f5f5f5'} inset`,
      WebkitTextFillColor: `${loginPalette.textColor || theme.palette.text.primary} !important`,
      caretColor: `${loginPalette.textColor || theme.palette.text.primary} !important`,
    },
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      backgroundColor: loginPalette.inputBackground || '#f5f5f5',
      '& fieldset': {
        borderColor: loginPalette.textColor ? alpha(loginPalette.textColor, 0.3) : theme.palette.divider,
      },
      '&:hover fieldset': {
        borderColor: loginPalette.textColor ? alpha(loginPalette.textColor, 0.6) : theme.palette.text.primary,
      },
      '&.Mui-focused fieldset': {
        borderColor: loginPalette.textColor || theme.palette.primary.main,
      },
    },
  };

  return (
    <Box
      sx={{
        bgcolor: loginPalette.background || 'background.default',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
      }}
    >
      <CssBaseline />

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          maxWidth: '450px',
          bgcolor: 'transparent',
          boxShadow: 'none',
          p: { xs: 3, sm: 5 },
          borderRadius: 4,
        }}
      >
        <LogoDinamico
          sx={{
            width: '260px',
            height: 'auto',
            marginBottom: '32px',
            filter: theme.palette.mode === 'dark' ? 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.7))' : 'none'
          }}
        />

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <TextField
            required
            fullWidth
            id="email"
            label="Endereço de E-mail"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            variant="outlined"
            sx={textFieldStyles}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Senha"
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            variant="outlined"
            sx={textFieldStyles}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <FormControlLabel
            control={<Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} name="rememberMe" color="primary" />}
            label="Lembre-se de mim"
            sx={{ color: loginPalette.textColor || 'text.primary' }}
          />

          {error && (<Alert severity="error" sx={{ mt: 2, width: '100%' }}>{error}</Alert>)}

          <Box sx={{ position: 'relative', mt: 3, mb: 2 }}>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={(theme) => ({
                py: 1.5,
                borderRadius: '12px',
                textTransform: 'none',
                fontSize: '1.7rem',
                fontWeight: 800,
                color: theme.palette.primary.contrastText,
                // --- ESTILO DO BOTÃO ATUALIZADO ---
                background: `linear-gradient(145deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 16px rgba(0, 0, 0, 0.25)',
                },
              })}
            >
              Entrar
            </Button>
            {loading && (
              <CircularProgress size={24} sx={{
                position: 'absolute', top: '50%', left: '50%',
                marginTop: '-12px', marginLeft: '-12px',
                color: loginPalette.buttonTextColor || theme.palette.primary.contrastText,
              }} />
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}