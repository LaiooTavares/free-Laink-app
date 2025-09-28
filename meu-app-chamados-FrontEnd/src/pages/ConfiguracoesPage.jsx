// MEU-APP-CHAMADOS-FRONTEND/src/pages/ConfiguracoesPage.jsx
import React from 'react';
import {
  Box, Typography, Paper, Card, CardActionArea, CardContent, Tooltip, useTheme
} from '@mui/material';
import {
  IntegrationInstructions as IntegrationInstructionsIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
} from '@mui/icons-material';
import { useAppContext } from '../context/AppContext';

// ✅ Componente de Card reutilizável para manter a consistência
const SettingsCard = ({ title, icon, onClick, disabled = false, tooltip }) => {
  const theme = useTheme();

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
          <div>{CardButton}</div>
        </Tooltip>
      ) : (
        CardButton
      )}
    </Card>
  );
};


export default function ConfiguracoesPage() {
  const { themeName, toggleTheme } = useAppContext();
  const isDarkMode = themeName === 'dark';

  const upgradeTooltip = "Para desbloquear essa função adiquira a versão Full";

  // ✅ Lista de cards atualizada com a opção 'Integrações' desabilitada
  const settingCards = [
    {
      key: 'theme',
      title: isDarkMode ? 'Ativar Tema Claro' : 'Ativar Tema Escuro',
      icon: isDarkMode
        ? <Brightness7Icon />
        : <Brightness4Icon />,
      action: toggleTheme,
      disabled: false
    },
    {
      key: 'integrations',
      title: 'Integrações',
      icon: <IntegrationInstructionsIcon />,
      action: () => {},
      disabled: true,
      tooltip: upgradeTooltip
    }
  ];

  return (
    <Paper sx={{ p: { xs: 2, sm: 4 } }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
        Configurações Gerais
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 3 }}>
        {settingCards.map((card) => (
          <Box key={card.key} sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' }, maxWidth: { xs: '100%', sm: '300px' } }}>
            <SettingsCard
              title={card.title}
              icon={card.icon}
              onClick={card.action}
              disabled={card.disabled}
              tooltip={card.tooltip}
            />
          </Box>
        ))}
      </Box>
    </Paper>
  );
}