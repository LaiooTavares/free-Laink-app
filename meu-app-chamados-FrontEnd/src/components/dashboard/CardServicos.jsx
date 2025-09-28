// MEU-APP-CHAMADOS-FRONTEND/src/components/dashboard/CardServicos.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardActionArea, Badge } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BuildIcon from '@mui/icons-material/Build';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import Cronometro from '../Cronometro';

const formatTime = (totalSeconds) => {
  if (totalSeconds === null || totalSeconds === undefined) return '00:00:00';
  const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
  const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

const getServicoDisplayData = (activeServico) => {
  if (!activeServico) return null;
  let title = "Em Execução", icon = <BuildIcon sx={{ fontSize: 40 }} />, chronometerStart = activeServico.inicio_atendimento, timeDisplay = null, subtext = "Serviço em andamento";
  switch (activeServico.status) {
    case 'Atribuído ao Técnico': title = "Serviço Agendado"; icon = <AssignmentIcon sx={{ fontSize: 40 }} />; chronometerStart = null; subtext = "Aguardando início"; break;
    case 'Em Deslocamento': title = "Em Deslocamento"; icon = <DirectionsCarIcon sx={{ fontSize: 40 }} />; chronometerStart = activeServico.inicio_deslocamento; break;
    case 'Aguardando a APR': title = "Aguardando APR"; icon = <AssignmentIcon sx={{ fontSize: 40 }} />; chronometerStart = activeServico.inicio_apr; subtext = "Preencha a Análise de Risco"; break;
    case 'Pausado': title = "Pausado"; icon = <PauseCircleOutlineIcon sx={{ fontSize: 40 }} />; chronometerStart = null; timeDisplay = formatTime(activeServico.tempoDecorrido); break;
    case 'Em Andamento': case 'Em Execução': case 'Aguardando Assinatura': title = "Em Execução"; icon = <BuildIcon sx={{ fontSize: 40 }} />; chronometerStart = activeServico.inicio_atendimento; break;
    default: title = "Em Atendimento"; icon = <BuildIcon sx={{ fontSize: 40 }} />; chronometerStart = activeServico.inicio_atendimento || activeServico.inicio_deslocamento; break;
  }
  return { title, icon, chronometerStart, timeDisplay, subtext };
};

export default function CardServicos({ activeServico, servicosAgendadosCount, servicoSlaColor }) {
  const navigate = useNavigate();
  const badgeStyle = { '& .MuiBadge-badge': { border: '2px solid white', fontWeight: 'bold', top: 12, right: 12 } };
  const displayData = getServicoDisplayData(activeServico);

  const cardStyles = (theme) => ({
    height: '100%',
    borderRadius: 3,
    color: theme.palette.primary.contrastText,
    // Gradiente invertido: do azul fraco para o forte
    background: `linear-gradient(145deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
    // Sombra de profundidade
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    border: '2px solid transparent',

    // Efeito hover
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
    }
  });

  const activeCardStyles = (theme) => ({
    ...cardStyles(theme),
    // Brilho de SLA para o card ativo
    border: `2px solid ${servicoSlaColor || 'transparent'}`,
    boxShadow: `0 0 10px 2px ${servicoSlaColor || 'transparent'}, 0 8px 25px rgba(0,0,0,0.2)`,
  });

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      {activeServico ? (
        <Card sx={activeCardStyles}>
          <CardActionArea onClick={() => navigate(`/servico/${activeServico.id}`)} sx={{ p: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2.5, height: '100%' }}>
            {displayData.icon}
            <Box textAlign="center">
              <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>{displayData.title}</Typography>
              {displayData.chronometerStart && <Cronometro dataInicio={displayData.chronometerStart} tempoAcumulado={activeServico.tempoDecorrido} />}
              {displayData.timeDisplay && <Typography variant="h6">{displayData.timeDisplay}</Typography>}
              <Typography sx={{ opacity: 0.8, fontSize: '0.8rem', mt: 0.5 }}>{displayData.subtext}</Typography>
            </Box>
          </CardActionArea>
        </Card>
      ) : (
        <Card sx={cardStyles}>
          <Badge badgeContent={servicosAgendadosCount} color="info" sx={{ ...badgeStyle, width: '100%', height: '100%' }}>
            <CardActionArea onClick={() => navigate('/servicos')} sx={{ p: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2.5, height: '100%' }}>
              <AssignmentIcon sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>Serviços</Typography>
                <Typography sx={{ opacity: 0.8 }}>Ver serviços agendados</Typography>
              </Box>
            </CardActionArea>
          </Badge>
        </Card>
      )}
    </Box>
  );
}