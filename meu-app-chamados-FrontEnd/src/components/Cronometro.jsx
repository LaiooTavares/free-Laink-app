// MEU-APP-CHAMADOS-FRONTEND/src/components/Cronometro.jsx
import React, { useState, useEffect } from 'react';
import { Typography } from '@mui/material';

// Função auxiliar para formatar o tempo em HH:MM:SS
const formatarTempo = (totalSegundos) => {
  if (totalSegundos === null || typeof totalSegundos !== 'number' || totalSegundos < 0) {
    return '00:00:00';
  }
  const horas = Math.floor(totalSegundos / 3600);
  const minutos = Math.floor((totalSegundos % 3600) / 60);
  const segundos = Math.floor(totalSegundos % 60);
  return [horas, minutos, segundos]
    .map(unidade => unidade.toString().padStart(2, '0'))
    .join(':');
};

// Função auxiliar para calcular os segundos decorridos desde uma data de início
const calcularSegundosDecorridos = (dataInicio) => {
  if (!dataInicio) return 0;
  const inicioTimestamp = new Date(dataInicio).getTime();
  if (isNaN(inicioTimestamp)) return 0;
  
  // Math.max garante que o tempo não será negativo se houver dessincronia de relógio
  return Math.max(0, Math.floor((Date.now() - inicioTimestamp) / 1000));
};

/**
 * Componente de cronômetro aprimorado.
 * - Se 'tempoFinalSegundos' for fornecido, exibe um tempo estático.
 * - Caso contrário, funciona como um cronômetro vivo a partir de 'dataInicio'.
 */
export default function Cronometro({ dataInicio, tempoFinalSegundos }) {
  const isStatic = tempoFinalSegundos !== null && tempoFinalSegundos !== undefined;

  // O estado inicial é calculado na primeira renderização para evitar o "salto" do 00:00:00
  const [tempoDecorrido, setTempoDecorrido] = useState(() => 
    isStatic ? tempoFinalSegundos : calcularSegundosDecorridos(dataInicio)
  );

  useEffect(() => {
    // Se o cronômetro for estático ou não tiver uma data de início, não iniciamos o intervalo.
    if (isStatic || !dataInicio) {
      // Se o modo mudou para estático, garantimos que o valor correto seja exibido.
      if (isStatic) {
        setTempoDecorrido(tempoFinalSegundos);
      }
      return;
    }

    // A única responsabilidade do intervalo é atualizar o estado a cada segundo.
    const intervalId = setInterval(() => {
      setTempoDecorrido(calcularSegundosDecorridos(dataInicio));
    }, 1000);

    // Limpa o intervalo quando o componente for desmontado ou as props mudarem.
    return () => clearInterval(intervalId);

  }, [dataInicio, tempoFinalSegundos, isStatic]); // Efeito reage a mudanças importantes

  return (
    <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: '#ffeb3b', my: 0.5 }}>
      {formatarTempo(tempoDecorrido)}
    </Typography>
  );
}