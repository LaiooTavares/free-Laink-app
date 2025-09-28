// MEU-APP-CHAMADOS-FRONTEND/src/components/chamado-detail/HistoricoTab.jsx
import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Timeline, TimelineItem, TimelineSeparator, TimelineDot, TimelineConnector, TimelineContent } from '@mui/lab';
import { format } from 'date-fns';

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

export default function HistoricoTab({ trabalho, coresChamado }) {
  const historico = parseJsonArray(trabalho?.historico, []);

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        borderRadius: { xs: 0, sm: 3 }, 
        p: { xs: 2, sm: 3 },
        bgcolor: coresChamado?.fundoCaixaConteudo
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ color: coresChamado?.historicoTituloCor, textAlign: 'center' }}>
        Histórico de Eventos do Chamado
      </Typography>
      {/* ===== PONTO DA CORREÇÃO: Posição alterada para "alternate" para centralizar o layout ===== */}
      <Timeline position="alternate" sx={{ p: 0, mt: 2 }}>
        {historico.length > 0 ? [...historico].reverse().map((item, index) => (
          <TimelineItem key={index}>
            <TimelineSeparator>
              <TimelineDot sx={{ bgcolor: coresChamado?.timelineDot }} />
              {index < historico.length - 1 && <TimelineConnector sx={{ bgcolor: coresChamado?.timelineConnector }} />}
            </TimelineSeparator>
            <TimelineContent>
              <Typography variant="subtitle2" sx={{ color: coresChamado?.historicoTimestampCor }}>
                {item.timestamp ? format(new Date(item.timestamp), 'dd/MM/yyyy HH:mm') : 'Data inválida'}
              </Typography>
              <Typography sx={{ color: coresChamado?.historicoTextoCor }}>
                {item.texto || 'Texto do evento não encontrado.'}
              </Typography>
            </TimelineContent>
          </TimelineItem>
        )) : (
          <Typography sx={{ fontStyle: 'italic', color: coresChamado?.historicoPlaceholderCor, textAlign: 'center' }}>
            Nenhum histórico para exibir.
          </Typography>
        )}
      </Timeline>
    </Paper>
  );
}