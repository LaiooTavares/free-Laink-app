// MEU-APP-CHAMADOS-FRONTEND/src/components/AppLayout.jsx
import React, { useState, useEffect, createContext, useContext } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  AppBar, Toolbar, Typography, Box, IconButton, Drawer, List, ListItem, 
  ListItemButton, ListItemIcon, ListItemText, Divider, CssBaseline, Paper, useTheme, Tooltip
} from '@mui/material';
import { styled, darken } from '@mui/material/styles';

// Ícones
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import GroupIcon from '@mui/icons-material/Group';
import BusinessIcon from '@mui/icons-material/Business';
import CampaignIcon from '@mui/icons-material/Campaign';
import ArticleIcon from '@mui/icons-material/Article';
import TimerIcon from '@mui/icons-material/Timer';
import TuneIcon from '@mui/icons-material/Tune';
import BuildIcon from '@mui/icons-material/Build';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

import LogoDinamico from './LogoDinamico';
import { useAppContext } from '../context/AppContext';
import Cronometro from './Cronometro';

const LayoutContext = createContext({ setAppBarActions: () => {} });
export const useLayoutContext = () => useContext(LayoutContext);

const drawerWidth = 280;

const upgradeTooltip = "Para desbloquear essa função adiquira a versão Full";

const GradientListItemButton = styled(ListItemButton)(({ theme }) => {
  const strongBlue = theme.palette.primary.main;
  const vibrantBlue = theme.palette.secondary.main;

  return {
    borderRadius: theme.shape.borderRadius * 1.5,
    paddingTop: theme.spacing(1.5),
    paddingBottom: theme.spacing(1.5),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    color: `${theme.palette.primary.contrastText} !important`,
    background: `linear-gradient(145deg, ${vibrantBlue}, ${strongBlue}) !important`,
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease, border-color 0.2s ease',
    border: '2px solid transparent',

    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
    },
    
    '&.Mui-selected': {
      background: `linear-gradient(145deg, ${strongBlue}, ${vibrantBlue}) !important`,
      boxShadow: `0 0 6px 2px rgba(0, 132, 243, 0.6), 0 8px 20px rgba(0,0,0,0.25)`, 
      border: `2px solid rgba(0, 132, 243, 0.6)`, 
      
      '& .MuiListItemIcon-root': {
        color: `${theme.palette.primary.contrastText} !important`,
      },
      
      '&:hover': {
        background: `linear-gradient(145deg, ${darken(strongBlue, 0.1)}, ${vibrantBlue}) !important`,
      }
    },
    
    '&.Mui-disabled': {
      background: `${theme.palette.action.disabledBackground} !important`,
      boxShadow: 'none',
      border: '2px solid transparent',
      '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
        color: theme.palette.action.disabled,
      },
    },
    
    '& .MuiListItemIcon-root': {
      minWidth: '48px',
      color: `${theme.palette.primary.contrastText} !important`,
    },
    
    '& .MuiListItemText-primary': {
      fontWeight: '600',
      fontSize: '1.1rem',
    }
  };
});


const menuTecnico = [
  { text: 'Painel', icon: <HomeIcon />, path: '/' },
  { text: 'Check in/out', icon: <AccessTimeIcon />, path: '/ponto' },
  { text: 'Estoque', icon: <Inventory2OutlinedIcon />, disabled: true, tooltip: upgradeTooltip },
  { text: 'Configurações', icon: <SettingsOutlinedIcon />, path: '/configuracoes' },
];
const menuOperador = [
    { text: 'Painel', icon: <HomeIcon />, path: '/operador' }, 
    { text: 'Check in/out', icon: <AccessTimeIcon />, path: '/ponto' },
    { text: 'Configurações', icon: <SettingsOutlinedIcon />, path: '/configuracoes' },
];
const menuGestor = [ 
  { text: 'Dashboard Gestor', icon: <QueryStatsIcon />, path: '/gestor/dashboard' },
  { text: 'Usuários', icon: <GroupIcon />, path: '/gestor/usuarios' },
  { text: 'Clientes', icon: <BusinessIcon />, path: '/gestor/clientes' },
  { text: 'Inserir Aviso', icon: <CampaignIcon />, disabled: true, tooltip: upgradeTooltip },
  { text: 'Registros', icon: <ArticleIcon />, disabled: true, tooltip: upgradeTooltip },
  { text: 'Tempo', icon: <TimerIcon />, disabled: true, tooltip: upgradeTooltip },
  { text: 'Ajustes', icon: <TuneIcon />, path: '/gestor/ajustes' }
];

const getMenuItems = (role) => {
    switch (role) {
        case 'OPERADOR': return menuOperador;
        case 'GESTOR': return menuGestor;
        case 'TECNICO': 
        default: 
          return menuTecnico;
    }
};

const getTitle = (role) => {
    switch(role) {
        case 'OPERADOR': return 'Painel do Operador';
        case 'GESTOR': return 'Painel do Gestor';
        case 'TECNICO': 
        default: 
          return 'Painel do Técnico';
    }
}

const GlobalChronometer = ({ slaColor }) => {
  const navigate = useNavigate();
  const { activeJob } = useAppContext();
  const theme = useTheme();
  
  if (!activeJob || !['Em Deslocamento', 'Em Andamento', 'Pausado', 'Aguardando Assinatura'].includes(activeJob.status)) {
    return null;
  }

  const getChronometerIcon = () => {
    if (activeJob.status === 'Em Deslocamento') {
      return <DirectionsCarIcon sx={{ fontSize: 20, color: 'primary.contrastText' }} />;
    }
    return <BuildIcon sx={{ fontSize: 20, color: 'primary.contrastText' }} />;
  };

  const getPath = () => {
    return activeJob.tipo === 'chamado' ? `/chamado/${activeJob.id}` : `/servico/${activeJob.id}`;
  };

  return (
    <Paper 
      elevation={8}
      onClick={() => navigate(getPath())}
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        borderRadius: '50px',
        background: `linear-gradient(145deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        color: 'primary.contrastText',
        p: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        cursor: 'pointer',
        zIndex: (theme) => theme.zIndex.drawer + 1,
        transition: 'transform 0.2s ease-in-out, border-color 0.5s ease, box-shadow 0.5s ease',
        border: `2px solid ${slaColor}`,
        boxShadow: `0px 0px 8px ${slaColor}`,
        '&:hover': {
          transform: 'scale(1.05)',
        }
      }}
    >
      {getChronometerIcon()}
      <Box>
        <Typography variant="caption" sx={{ display: 'block', lineHeight: 1.2 }}>{activeJob.id}</Typography>
        <Cronometro 
          dataInicio={activeJob.inicio_atendimento || activeJob.inicio_deslocamento}
          textSx={{ fontSize: '1.1rem', fontWeight: 'bold' }}
        />
      </Box>
    </Paper>
  );
};


export default function AppLayout({ children, onLogout, userRole }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const menuItems = getMenuItems(userRole);
  const title = getTitle(userRole);
  const [slaColor, setSlaColor] = useState('#4caf50');
  const [appBarActions, setAppBarActions] = useState(null);

  useEffect(() => {
    setAppBarActions(null);
  }, [location.pathname]);

  useEffect(() => {
    setSlaColor('#4caf50');
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
        <LogoDinamico sx={{ height: '45px', filter: 'drop-shadow(0 0 5px rgba(255, 255, 255, 0.7))' }} />
      </Toolbar>
      <List sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {menuItems.map((item) => {
          const listItemButton = (
            <GradientListItemButton 
              component={item.disabled ? 'div' : RouterLink}
              to={item.disabled ? undefined : item.path}
              disabled={item.disabled}
              selected={!item.disabled && location.pathname === item.path} 
              onClick={mobileOpen && !item.disabled ? handleDrawerToggle : null}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </GradientListItemButton>
          );

          return (
            <ListItem key={item.text} disablePadding>
              {item.disabled ? (
                <Tooltip title={item.tooltip} placement="right">
                  <Box sx={{ width: '100%' }}>
                    {listItemButton}
                  </Box>
                </Tooltip>
              ) : (
                listItemButton
              )}
            </ListItem>
          );
        })}
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
          Laink-OS V1.0.0 free
        </Typography>
      </Box>
      <Divider sx={{ mx: 2 }} />
      <List sx={{ p: 2 }}>
        <ListItem disablePadding>
          <GradientListItemButton onClick={onLogout}>
            <ListItemIcon><LogoutIcon /></ListItemIcon>
            <ListItemText primary="Sair" />
          </GradientListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <LayoutContext.Provider value={{ setAppBarActions }}>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <CssBaseline />
        <AppBar 
          position="fixed" 
          elevation={0}
          sx={{ 
            width: { sm: `calc(100% - ${drawerWidth}px)` }, 
            ml: { sm: `${drawerWidth}px` }, 
            bgcolor: 'background.paper', 
            color: 'text.primary',
          }}
        >
          <Toolbar>
            <IconButton color="inherit" aria-label="open drawer" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2, display: { sm: 'none' } }}>
              <MenuIcon />
            </IconButton>
            
            <Box sx={{ flexGrow: 1, textAlign: 'right', pr: 2 }}>
              <Typography variant="h6" noWrap component="div" sx={{ 
                fontWeight: 600,
                fontSize: '1.0rem',
                lineHeight: 1.2,
              }}>
                {title}
              </Typography>
              <Box sx={{
                display: 'inline-block',
                bgcolor: 'grey.200',
                px: 0.75,
                py: 0.25,
                borderRadius: 1,
                mt: 0.5,
              }}>
                <Typography sx={{ fontSize: '0.6rem', fontWeight: 'bold', color: 'grey.700', lineHeight: 1 }}>
                  Free
                </Typography>
              </Box>
            </Box>

            {appBarActions && (
              <Box sx={{ minWidth: { xs: 48, sm: 200 }, display: 'flex', justifyContent: 'flex-end' }}>
                {appBarActions}
              </Box>
            )}
          </Toolbar>
        </AppBar>
        <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
          {/* --- DRAWER MÓVEL CORRIGIDO --- */}
          <Drawer variant="temporary" open={mobileOpen} onClose={handleDrawerToggle} ModalProps={{ keepMounted: true }} sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, border: 'none', bgcolor: 'background.paper' }, }}>
            {drawerContent}
          </Drawer>
          {/* --- DRAWER DESKTOP CORRIGIDO --- */}
          <Drawer 
            variant="permanent" 
            sx={{ 
              display: { xs: 'none', sm: 'block' }, 
              '& .MuiDrawer-paper': { 
                boxSizing: 'border-box', 
                width: drawerWidth, 
                border: 'none',
                bgcolor: 'background.paper' // Alterado de 'transparent' para a cor padrão
              }, 
            }} 
            open
          >
            {drawerContent}
          </Drawer>
        </Box>
        <Box
          component="main"
          sx={{ 
            flexGrow: 1, 
            p: { xs: 2, sm: 3 }, 
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            bgcolor: 'background.default',
            overflowX: 'hidden',
          }}
        >
          <Toolbar /> 
          {children}
          <GlobalChronometer slaColor={slaColor} />
        </Box>
      </Box>
    </LayoutContext.Provider>
  );
}