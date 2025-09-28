// MEU-APP-CHAMADOS-FRONTEND/src/context/AppContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import axios from 'axios';
import { io } from "socket.io-client";
import { jwtDecode } from "jwt-decode";
import { themeConfigs } from '../theme';

const API_URL = import.meta.env.VITE_API_BASE_URL;
const AppContext = createContext();

const LOGO_PADRAO_URL = '/laink.png';
const FAVICON_PADRAO_URL = '/favicon.ico';

export function AppProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [appConfig, setAppConfig] = useState(null);
  const [themeName, setThemeName] = useState(() => localStorage.getItem('themePreference') || 'laink');
  const [socket, setSocket] = useState(null);
  const [servicos, setServicos] = useState([]);
  const [chamados, setChamados] = useState([]);

  const toggleTheme = useCallback(() => {
    setThemeName(prevTheme => {
      const newTheme = prevTheme === 'laink' ? 'dark' : 'laink';
      localStorage.setItem('themePreference', newTheme);
      return newTheme;
    });
  }, []);

  const theme = useMemo(() => {
    const selectedConfig = themeConfigs[themeName] || themeConfigs.laink;
    return createTheme(selectedConfig);
  }, [themeName]);

  const brandingData = useMemo(() => ({
    logo_url: LOGO_PADRAO_URL,
    favicon_url: FAVICON_PADRAO_URL,
  }), []);

  useEffect(() => {
    const faviconElement = document.querySelector("link[rel*='icon']");
    if (faviconElement && brandingData.favicon_url) {
      faviconElement.href = brandingData.favicon_url;
    }
  }, [brandingData]);

  const activeChamado = useMemo(() => {
    if (!user) return null;
    const chamadoAtivo = chamados.find(c => String(c.tecnico_id) === String(user.id) && !['Finalizado', 'Cancelado', 'Aguardando na Fila', 'Devolvido', 'Atribuído ao Técnico'].includes(c.status));
    if (chamadoAtivo) return { ...chamadoAtivo, tipo: 'chamado' };
    return null;
  }, [user, chamados]);

  const activeServico = useMemo(() => {
    if (!user) return null;
    const activeStatuses = ['Em Deslocamento', 'Aguardando a APR', 'Em Andamento', 'Em Execução', 'Pausado', 'Aguardando Assinatura'];
    const servicoAtivo = servicos.find(s => String(s.tecnico_id) === String(user.id) && activeStatuses.includes(s.status));
    if (servicoAtivo) return { ...servicoAtivo, tipo: 'servico' };
    return null;
  }, [user, servicos]);
  
  const activeJob = useMemo(() => activeChamado || activeServico, [activeChamado, activeServico]);

  const logout = useCallback(() => {
    if (socket) {
      socket.disconnect();
    }
    setUser(null);
    setSocket(null);
    setServicos([]);
    setChamados([]);
    setThemeName('laink');
    localStorage.removeItem('userSession');
    localStorage.removeItem('authToken');
    localStorage.removeItem('themePreference');
    delete axios.defaults.headers.common['Authorization'];
    navigate('/login');
  }, [navigate, socket]);

  const fetchData = useCallback(async (token) => {
    const headers = { headers: { Authorization: `Bearer ${token}` } };
    const cacheBuster = `?t=${new Date().getTime()}`;

    const promises = [
      axios.get(`${API_URL}/chamados${cacheBuster}`, headers),
      axios.get(`${API_URL}/servicos${cacheBuster}`, headers),
      axios.get(`${API_URL}/configuracoes/settings${cacheBuster}`, headers)
    ];
    
    const [chamadosRes, servicosRes, settingsRes] = await Promise.allSettled(promises);

    if (chamadosRes.status === 'rejected' && chamadosRes.reason.response?.status === 401) {
      logout();
      return;
    }
    
    setChamados(chamadosRes.status === 'fulfilled' ? chamadosRes.value.data || [] : []);
    setServicos(servicosRes.status === 'fulfilled' ? servicosRes.value.data || [] : []);
    setAppConfig(settingsRes.status === 'fulfilled' ? settingsRes.value.data || null : null);
  }, [logout]);

  const login = useCallback(async (email, password) => {
    const response = await axios.post(`${API_URL}/sessions`, { email, password });
    const { user: loggedUser, token } = response.data;
    localStorage.setItem('authToken', token);
    localStorage.setItem('userSession', JSON.stringify(loggedUser));
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    await fetchData(token);
    setUser(loggedUser);
  }, [fetchData]);

  useEffect(() => {
    const loadApp = async () => {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const userSession = localStorage.getItem('userSession');
      
      if (token && userSession) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const parsedUser = JSON.parse(userSession);
        setUser(parsedUser);
        await fetchData(token);
      }
      setLoading(false);
    };
    loadApp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!user || socket) return;
    const newSocket = io(API_URL, { auth: { token: localStorage.getItem('authToken') } });

    newSocket.on('chamado_atualizado', (chamadoAtualizado) => setChamados(prev => prev.map(c => c.id === chamadoAtualizado.id ? chamadoAtualizado : c)));
    newSocket.on('novo_chamado', (novoChamado) => setChamados(prev => [novoChamado, ...prev]));
    newSocket.on('chamado_deletado', (data) => setChamados(prev => prev.filter(c => c.id !== data.id)));

    newSocket.on('servico_atualizado', (servicoAtualizado) => setServicos(prev => prev.map(s => s.id === servicoAtualizado.id ? servicoAtualizado : s)));
    newSocket.on('novo_servico', (novoServico) => setServicos(prev => [novoServico, ...prev]));
    newSocket.on('servico_deletado', (data) => setServicos(prev => prev.filter(s => s.id !== data.id)));

    setSocket(newSocket);
    return () => { newSocket.disconnect(); };
  }, [user, socket]);

  const value = useMemo(() => ({
    user, loading, login, logout, isAuthenticated: !!user, appConfig,
    servicos, socket, brandingData, chamados,
    activeChamado, activeServico, theme, fetchData, themeName, toggleTheme,
    activeJob 
  }),
  [
    user, loading, login, logout, appConfig, servicos,
    socket, brandingData, chamados, activeChamado,
    activeServico, theme, fetchData, themeName, toggleTheme,
    activeJob 
  ]);

  return (
    <AppContext.Provider value={value}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </AppContext.Provider>
  );
}

export const useAppContext = () => useContext(AppContext);