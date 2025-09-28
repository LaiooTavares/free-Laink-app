// src/components/CriarLembreteModal.jsx

import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, TextField, 
  FormControl, InputLabel, Select, MenuItem, DialogActions, Button 
} from '@mui/material';

export default function CriarLembreteModal({ open, onClose, onSave }) {
  const [text, setText] = useState('');
  const [priority, setPriority] = useState('baixa');

  // Limpa os campos quando o modal é fechado
  useEffect(() => {
    if (!open) {
      setText('');
      setPriority('baixa');
    }
  }, [open]);

  const handleSave = () => {
    if (text.trim()) {
      onSave({ text: text.trim(), priority });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Criar Novo Lembrete</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          id="lembrete"
          label="Lembrete"
          type="text"
          fullWidth
          variant="outlined"
          value={text}
          onChange={(e) => setText(e.target.value)}
          sx={{ mb: 2, mt: 1 }}
        />
        <FormControl fullWidth>
          <InputLabel id="priority-label">Prioridade</InputLabel>
          <Select
            labelId="priority-label"
            id="priority"
            value={priority}
            label="Prioridade"
            onChange={(e) => setPriority(e.target.value)}
          >
            <MenuItem value="baixa">Baixa</MenuItem>
            <MenuItem value="media">Média</MenuItem>
            <MenuItem value="alta">Alta</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained">Salvar</Button>
      </DialogActions>
    </Dialog>
  );
}