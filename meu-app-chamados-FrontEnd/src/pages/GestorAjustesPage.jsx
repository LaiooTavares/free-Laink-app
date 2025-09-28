// MEU-APP-CHAMADOS-FRONTEND/src/pages/GestorAjustesPage.jsx
import React from 'react';
import {
  Box, Typography, Card, CardActionArea, CardContent, Grid, Tooltip, useTheme
} from '@mui/material';
import {
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  Webhook as WebhookIcon,
  ConfirmationNumber as ConfirmationNumberIcon,
  Build as BuildIcon,
  RestartAlt as RestartAltIcon
} from '@mui/icons-material';
import { useAppContext } from '../context/AppContext.jsx';

// Componente reutilizável para os cards de ajuste
const SettingsCard = ({ title, icon, onClick, disabled = false, tooltip }) => {
  const theme = useTheme();

  // O componente CardActionArea é envolvido por um div para que o Tooltip funcione mesmo quando o botão está desabilitado.
  const CardButton = (
    <CardActionArea
      onClick={onClick}
      disabled={disabled}
      sx={{
        height: '100%',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1.5,
        // Aplica um estilo cinza quando desabilitado
        ...(disabled && {
          backgroundColor: theme.palette.action.disabledBackground,
          color: theme.palette.action.disabled,
        }),
      }}
    >
      {React.cloneElement(icon, { sx: { fontSize: '2.8rem', color: 'inherit' } })}
      <Typography variant="h6" component="div" sx={{ fontSize: '1rem', fontWeight: 500, textAlign: 'center' }}>
        {title}
      </Typography>
    </CardActionArea>
  );

  return (
    <Card sx={{
      height: '100%',
      backgroundColor: disabled ? undefined : 'secondary.main',
      color: disabled ? undefined : 'secondary.contrastText',
      transition: 'transform 0.2s',
      '&:hover': {
        transform: disabled ? 'none' : 'translateY(-4px)'
      }
    }}>
      {disabled ? (
        <Tooltip title={tooltip} placement="top">
          {/* Div wrapper é necessário para o tooltip em elementos desabilitados */}
          <div>{CardButton}</div>
        </Tooltip>
      ) : (
        CardButton
      )}
    </Card>
  );
};

export default function GestorAjustesPage() {
  const { themeName, toggleTheme } = useAppContext();
  const isDarkMode = themeName === 'dark';

  const upgradeTooltip = "Para adicionar a função o usuário deve adquirir a versão full";

  const adjustmentCards = [
    {
      key: 'appearance',
      title: isDarkMode ? 'Ativar Tema Claro' : 'Ativar Tema Escuro',
      icon: isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />,
      action: toggleTheme,
      disabled: false,
    },
    {
      key: 'integrations',
      title: 'Integrações',
      icon: <WebhookIcon />,
      action: () => {},
      disabled: true,
      tooltip: upgradeTooltip,
    },
    {
      key: 'tickets',
      title: 'Chamados',
      icon: <ConfirmationNumberIcon />,
      action: () => {},
      disabled: true,
      tooltip: upgradeTooltip,
    },
    {
      key: 'services',
      title: 'Serviços',
      icon: <BuildIcon />,
      action: () => {},
      disabled: true,
      tooltip: upgradeTooltip,
    },
    {
      key: 'reset',
      title: 'Reset',
      icon: <RestartAltIcon />,
      action: () => {},
      disabled: true,
      tooltip: upgradeTooltip,
    },
  ];

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center', mb: 4 }}>
        Ajustes do Sistema
      </Typography>

      <Grid container spacing={2} justifyContent="center">
        {adjustmentCards.map((card) => (
          <Grid item key={card.key} xs={6} sm={4} md={3} lg={2}>
            <SettingsCard
              title={card.title}
              icon={card.icon}
              onClick={card.action}
              disabled={card.disabled}
              tooltip={card.tooltip}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}