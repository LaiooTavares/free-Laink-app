// MEU-APP-CHAMADOS-FRONTEND/src/js/theme.js

const colors = {
  darkBlue: '#1C204E',
  vibrantBlue: '#0084F3',
  lightBlue: '#00A9F4',
  cyan: '#03D4F3',
  white: '#FFFFFF',
  black: '#000000',
  paper: '#FFFFFF',
  lightGray: '#F8F9FA',
  textPrimaryLight: '#1C204E',
  textSecondaryLight: '#5A6474',
  darkBackground: '#121212',
  darkPaper: '#1E1E1E',
  textPrimaryDark: '#E0E0E0',
  textSecondaryDark: '#A9B4C2'
};

const lainkThemeConfig = {
  palette: {
    mode: 'light',
    primary: { main: colors.darkBlue, contrastText: colors.white },
    secondary: { main: colors.vibrantBlue, contrastText: colors.white },
    cardBackground: {
      main: colors.lightBlue,
      contrastText: colors.white, // Alterado para branco para melhor contraste com degradê
    },
    info: { main: colors.cyan, contrastText: colors.black },
    success: { main: '#2e7d32' },
    warning: { main: '#ed6c02' },
    error: { main: '#d32f2f' },
    background: { default: colors.lightGray, paper: colors.paper },
    text: { primary: colors.textPrimaryLight, secondary: colors.textSecondaryLight },
    chamado: {
      tabAtivaFundo: colors.darkBlue,
      tabAtivaTexto: colors.white,
    },
  },
  gradients: {
    primary: `linear-gradient(90deg, ${colors.darkBlue} 0%, ${colors.vibrantBlue} 100%)`,
    // [DEGRADÊ AJUSTADO AQUI] - Agora mais forte
    secondary: `linear-gradient(90deg, ${colors.darkBlue} 0%, ${colors.vibrantBlue} 100%)`,
    full: `linear-gradient(90deg, ${colors.darkBlue} 0%, ${colors.vibrantBlue} 50%, ${colors.lightBlue} 100%)`,
  }
};

const darkThemeConfig = {
  palette: {
    mode: 'dark',
    primary: { main: colors.lightBlue, contrastText: colors.black },
    secondary: { main: colors.cyan, contrastText: colors.black },
    cardBackground: {
      main: colors.darkPaper,
      contrastText: colors.textPrimaryDark,
    },
    info: { main: '#03a9f4', contrastText: colors.black },
    success: { main: '#66bb6a' },
    warning: { main: '#ffa726' },
    error: { main: '#f44336' },
    background: { default: colors.darkBackground, paper: colors.darkPaper },
    text: { primary: colors.textPrimaryDark, secondary: colors.textSecondaryDark },
    chamado: {
      tabAtivaFundo: colors.lightBlue,
      tabAtivaTexto: colors.black,
    },
  },
  gradients: {
    primary: `linear-gradient(90deg, ${colors.vibrantBlue} 0%, ${colors.lightBlue} 100%)`,
    // [DEGRADÊ AJUSTADO AQUI]
    secondary: `linear-gradient(90deg, ${colors.darkBlue} 0%, ${colors.vibrantBlue} 100%)`,
    full: `linear-gradient(90deg, ${colors.darkBlue} 0%, ${colors.vibrantBlue} 50%, ${colors.lightBlue} 100%)`,
  }
};

export const themeConfigs = {
  laink: lainkThemeConfig,
  dark: darkThemeConfig,
};