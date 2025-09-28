// MEU-APP-CHAMADOS-FRONTEND/src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { AppProvider, useAppContext } from './context/AppContext.jsx';
import AppLayout from './components/AppLayout.jsx';

// Importe todas as suas páginas e componentes de layout
import AuthLayout from './components/AuthLayout.jsx';
import LoginPage from './components/LoginPage.jsx';
import RequestPasswordResetPage from './components/RequestPasswordResetPage.jsx';
import TecnicoDashboard from './pages/TecnicoDashboard.jsx';
import BaterPontoPage from './pages/BaterPontoPage.jsx';
import ServicosPage from './pages/ServicosPage.jsx';
import ChamadosPage from './pages/ChamadosPage.jsx';
import ChamadoDetailPage from './pages/ChamadoDetailPage.jsx';
import ServicosDetailPage from './pages/ServicosDetailPage.jsx';
import OperadorServicosPage from './pages/OperadorServicosPage.jsx';
import ConfiguracoesPage from './pages/ConfiguracoesPage.jsx';
import GestorUsuariosPage from './pages/GestorUsuariosPage.jsx';
import GestorClientesPage from './pages/GestorClientesPage.jsx';
import OperadorDashboard from './pages/OperadorDashboard.jsx';
import OperadorGerenciarChamadosPage from './pages/OperadorGerenciarChamadosPage.jsx';
import GestorDashboard from './pages/GestorDashboard.jsx';
// import GestorTempoPage from './pages/GestorTempoPage.jsx'; // REMOVIDO
import EstoquePage from './pages/EstoquePage.jsx';
import GestorAjustesPage from './pages/GestorAjustesPage.jsx';
// import GestorRegistrosPage from './pages/GestorRegistrosPage.jsx'; // REMOVIDO
import GestorGerenciarChamadosPage from './pages/GestorGerenciarChamadosPage.jsx';
import GestorGerenciarServicosPage from './pages/GestorGerenciarServicosPage.jsx';


// Componente principal que envolve tudo com o Provider
export default function AppWrapper() {
  return (
    <AppProvider>
      <CssBaseline />
      <AppRoutesController />
    </AppProvider>
  );
}

// Componente que gerencia as rotas
function AppRoutesController() {
  const { user } = useAppContext();

  const getHomeRoute = () => {
    if (!user) return "/login";
    switch (user.role) {
      case 'TI': return '/configuracoes';
      case 'OPERADOR': return '/operador';
      case 'GESTOR': return '/gestor/dashboard';
      default: return '/';
    }
  };

  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/login" element={!user ? (<AuthLayout><LoginPage /></AuthLayout>) : (<Navigate to={getHomeRoute()} />)} />
      <Route path="/esqueci-senha" element={<AuthLayout><RequestPasswordResetPage /></AuthLayout>} />
      
      {/* Rotas Protegidas */}
      <Route path="/" element={<ProtectedRoute roles={['TECNICO']}><PageRenderer PageComponent={TecnicoDashboard} /></ProtectedRoute>} />
      <Route path="/servicos" element={<ProtectedRoute roles={['TECNICO']}><PageRenderer PageComponent={ServicosPage} /></ProtectedRoute>} />
      <Route path="/chamados" element={<ProtectedRoute roles={['TECNICO']}><PageRenderer PageComponent={ChamadosPage} /></ProtectedRoute>} />
      <Route path="/chamado/:chamadoId" element={<ProtectedRoute roles={['TECNICO', 'OPERADOR', 'GESTOR']}><PageRenderer PageComponent={ChamadoDetailPage} /></ProtectedRoute>} />
      <Route path="/servico/:servicoId" element={<ProtectedRoute roles={['TECNICO', 'OPERADOR', 'GESTOR']}><PageRenderer PageComponent={ServicosDetailPage} /></ProtectedRoute>} />
      <Route path="/ponto" element={<ProtectedRoute roles={['TECNICO', 'OPERADOR']}><PageRenderer PageComponent={BaterPontoPage} /></ProtectedRoute>} />
      <Route path="/estoque" element={<ProtectedRoute roles={['TECNICO']}><PageRenderer PageComponent={EstoquePage} /></ProtectedRoute>} />
      <Route path="/configuracoes" element={<ProtectedRoute roles={['TECNICO', 'OPERADOR', 'GESTOR', 'TI']}><PageRenderer PageComponent={ConfiguracoesPage} /></ProtectedRoute>} />
      
      {/* Rotas do Operador */}
      <Route path="/operador" element={<ProtectedRoute roles={['OPERADOR']}><PageRenderer PageComponent={OperadorDashboard} /></ProtectedRoute>} />
      <Route path="/operador/servicos" element={<ProtectedRoute roles={['OPERADOR']}><PageRenderer PageComponent={OperadorServicosPage} /></ProtectedRoute>} />
      <Route path="/operador/gerenciar-chamados" element={<ProtectedRoute roles={['OPERADOR']}><PageRenderer PageComponent={OperadorGerenciarChamadosPage} /></ProtectedRoute>} />

      {/* Rotas do Gestor */}
      <Route path="/gestor/dashboard" element={<ProtectedRoute roles={['GESTOR']}><PageRenderer PageComponent={GestorDashboard} /></ProtectedRoute>} />
      <Route path="/gestor/chamados" element={<ProtectedRoute roles={['GESTOR']}><PageRenderer PageComponent={GestorGerenciarChamadosPage} /></ProtectedRoute>} />
      <Route path="/gestor/servicos" element={<ProtectedRoute roles={['GESTOR']}><PageRenderer PageComponent={GestorGerenciarServicosPage} /></ProtectedRoute>} />
      <Route path="/gestor/usuarios" element={<ProtectedRoute roles={['GESTOR']}><PageRenderer PageComponent={GestorUsuariosPage} /></ProtectedRoute>} />
      <Route path="/gestor/clientes" element={<ProtectedRoute roles={['GESTOR']}><PageRenderer PageComponent={GestorClientesPage} /></ProtectedRoute>} />
      {/* <Route path="/gestor/avisos" element={<ProtectedRoute roles={['GESTOR']}><PageRenderer PageComponent={GestorAvisosPage} /></ProtectedRoute>} /> */}{/* ROTA REMOVIDA */}
      {/* <Route path="/gestor/registros" element={<ProtectedRoute roles={['GESTOR']}><PageRenderer PageComponent={GestorRegistrosPage} /></ProtectedRoute>} /> */}{/* ROTA REMOVIDA */}
      {/* <Route path="/gestor/tempo" element={<ProtectedRoute roles={['GESTOR']}><PageRenderer PageComponent={GestorTempoPage} /></ProtectedRoute>} /> */}{/* ROTA REMOVIDA */}
      <Route path="/gestor/ajustes" element={<ProtectedRoute roles={['GESTOR']}><PageRenderer PageComponent={GestorAjustesPage} /></ProtectedRoute>} />

      {/* Rota de fallback */}
      <Route path="*" element={<Navigate to={getHomeRoute()} />} />
    </Routes>
  );
}

// Componentes auxiliares (ProtectedRoute, PageRenderer)
function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAppContext();
  
  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" />;
  }
  if (roles && !roles.includes(user.role)) {
    const homeRoute = user.role === 'TI' ? '/configuracoes' : (user.role === 'GESTOR' ? '/gestor/dashboard' : (user.role === 'OPERADOR' ? '/operador' : '/'));
    return <Navigate to={homeRoute} />;
  }
  return children;
}

function PageRenderer({ PageComponent }) {
  const { user, logout } = useAppContext();
  return (
    <AppLayout onLogout={logout} userRole={user.role}>
      <PageComponent />
    </AppLayout>
  );
}