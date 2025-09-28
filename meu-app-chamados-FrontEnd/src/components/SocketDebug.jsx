// FILE: src/components/SocketDebug.jsx

import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';
import { useAppContext } from '../context/AppContext';

export default function SocketDebug() {
  const { socket } = useAppContext();
  const [status, setStatus] = useState('Aguardando socket...');
  const [socketId, setSocketId] = useState(null);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (!socket) {
      setStatus('Socket NULO no contexto');
      return;
    }

    // Função para adicionar um evento à lista
    const addEvent = (eventName, data) => {
      const timestamp = new Date().toLocaleTimeString();
      setEvents(prevEvents => [{ timestamp, eventName, data: JSON.stringify(data) }, ...prevEvents].slice(0, 10)); // Mantém apenas os últimos 10 eventos
    };

    // Listeners padrão
    socket.on('connect', () => {
      setStatus('Conectado');
      setSocketId(socket.id);
      addEvent('connect', { id: socket.id });
    });

    socket.on('disconnect', (reason) => {
      setStatus(`Desconectado: ${reason}`);
      addEvent('disconnect', { reason });
    });

    socket.on('connect_error', (err) => {
      setStatus('Erro de Conexão');
      addEvent('connect_error', { message: err.message });
    });

    // O listener "mágico": ouve TUDO o que o servidor enviar
    socket.onAny((eventName, ...args) => {
      console.log(`[SocketDebug] Evento recebido: ${eventName}`, args);
      addEvent(eventName, args);
    });
    
    // Define o status inicial
    if (socket.connected) {
        setStatus('Conectado');
        setSocketId(socket.id);
    } else {
        setStatus('Conectando...');
    }

    return () => {
      // Limpa os listeners para evitar duplicação
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.offAny();
    };
  }, [socket]);

  return (
    <Paper elevation={3} sx={{ p: 2, mb: 3, border: '2px solid #1976d2' }}>
      <Typography variant="h6" gutterBottom>Painel de Diagnóstico Socket.IO</Typography>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1 }}>
        <Typography variant="body1"><strong>Status:</strong></Typography>
        <Chip 
          label={status} 
          color={status === 'Conectado' ? 'success' : 'error'}
          size="small"
        />
      </Box>
      <Typography variant="body2" sx={{ mb: 2 }}><strong>ID da Conexão:</strong> {socketId || 'N/A'}</Typography>
      
      <Typography variant="body1"><strong>Eventos Recebidos (mais recentes primeiro):</strong></Typography>
      <Box sx={{ maxHeight: 200, overflowY: 'auto', bgcolor: 'rgba(0,0,0,0.05)', borderRadius: 1, p: 1, mt: 1 }}>
        {events.length === 0 ? (
          <Typography variant="body2" color="text.secondary">Aguardando eventos...</Typography>
        ) : (
          events.map((event, index) => (
            <Box key={index} sx={{ mb: 1, borderBottom: '1px solid #ddd', pb: 1 }}>
              <Typography variant="caption" display="block">{event.timestamp}</Typography>
              <Typography variant="body2"><strong>Evento:</strong> <Chip label={event.eventName} color="primary" size="small" /></Typography>
              <Typography variant="body2" sx={{ wordBreak: 'break-all' }}><strong>Dados:</strong> {event.data}</Typography>
            </Box>
          ))
        )}
      </Box>
    </Paper>
  );
}