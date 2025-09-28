// MEU-APP-CHAMADOS-FRONTEND/src/components/dashboard/CardChamados.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardActionArea, Badge } from '@mui/material';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import BuildIcon from '@mui/icons-material/Build';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import Cronometro from '../Cronometro';

const formatTime = (totalSeconds) => {
  if (totalSeconds === null || totalSeconds === undefined) return '00:00:00';
  const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
  const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

const getChamadoDisplayData = (activeChamado) => {
  if (!activeChamado) return null;
  let title = "Status", icon = <FlashOnIcon sx={{ fontSize: 40 }} />, chronometerStart = null, timeDisplay = null, subtext = "Chamado em andamento";
  switch (activeChamado.status) {
    case 'Atribuído ao Técnico': title = "Pronto para Iniciar"; icon = <FlashOnIcon sx={{ fontSize: 40 }} />; subtext = "Aguardando início do deslocamento"; break;
    case 'Em Deslocamento': title = "Em Deslocamento"; icon = <DirectionsCarIcon sx={{ fontSize: 40 }} />; chronometerStart = activeChamado.inicio_deslocamento; break;
    case 'Aguardando a APR': title = "Aguardando APR"; icon = <AssignmentIcon sx={{ fontSize: 40 }} />; chronometerStart = activeChamado.inicio_apr; subtext = "Preencha a Análise de Risco"; break;
    case 'Pausado': title = "Pausado"; icon = <PauseCircleOutlineIcon sx={{ fontSize: 40 }} />; timeDisplay = formatTime(activeChamado.tempoDecorrido); break;
    case 'Em Andamento': case 'Em Execução': case 'Aguardando Assinatura': title = "Em Execução"; icon = <BuildIcon sx={{ fontSize: 40 }} />; chronometerStart = activeChamado.inicio_atendimento; break;
    default: title = "Em Atendimento"; icon = <FlashOnIcon sx={{ fontSize: 40 }} />; chronometerStart = activeChamado.inicio_atendimento || activeChamado.inicio_deslocamento; break;
  }
  return { title, icon, chronometerStart, timeDisplay, subtext };
};

export default function CardChamados({ activeChamado, unreadChamadosCount, chamadoSlaColor }) {
  const navigate = useNavigate();
  const badgeStyle = { '& .MuiBadge-badge': { border: '2px solid white', fontWeight: 'bold', top: 12, right: 12 } };
  const displayData = getChamadoDisplayData(activeChamado);

  const cardStyles = (theme) => ({
    height: '100%',
    borderRadius: 3,
    color: theme.palette.primary.contrastText,
    // Aplicando o mesmo gradiente cromático dos botões
    background: `linear-gradient(145deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    // Sombra de profundidade
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    border: '2px solid transparent', // Borda base para transição suave

    // Efeito hover para interatividade
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
    }
  });

  const activeCardStyles = (theme) => ({
    ...cardStyles(theme), // Pega todos os estilos base
    // Adiciona o brilho de SLA para o card ativo
    border: `2px solid ${chamadoSlaColor || 'transparent'}`,
    boxShadow: `0 0 10px 2px ${chamadoSlaColor || 'transparent'}, 0 8px 25px rgba(0,0,0,0.2)`,
  });

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      {activeChamado ? (
        <Card sx={activeCardStyles}>
          <CardActionArea onClick={() => navigate(`/chamado/${activeChamado.id}`)} sx={{ p: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2.5, height: '100%' }}>
            {displayData.icon}
            <Box textAlign="center">
              <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>{displayData.title}</Typography>
              {displayData.chronometerStart && <Cronometro dataInicio={displayData.chronometerStart} tempoAcumulado={activeChamado.tempoDecorrido} />}
              {displayData.timeDisplay && <Typography variant="h6">{displayData.timeDisplay}</Typography>}
              <Typography sx={{ opacity: 0.8, fontSize: '0.8rem', mt: 0.5 }}>{displayData.subtext}</Typography>
            </Box>
          </CardActionArea>
        </Card>
      ) : (
        <Card sx={cardStyles}>
          <Badge badgeContent={unreadChamadosCount} color="error" sx={{ ...badgeStyle, width: '100%', height: '100%' }}>
            <CardActionArea onClick={() => navigate('/chamados')} sx={{ p: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2.5, height: '100%' }}>
              <FlashOnIcon sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>Chamados</Typography>
                <Typography sx={{ opacity: 0.8 }}>Ver fila de urgência</Typography>
              </Box>
            </CardActionArea>
          </Badge>
        </Card>
      )}
    </Box>
  );
}