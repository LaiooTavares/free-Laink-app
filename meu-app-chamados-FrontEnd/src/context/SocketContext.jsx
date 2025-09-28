// MEU-APP-CHAMADOS-FRONTEND/src/context/SocketContext.jsx (VERSÃO FINAL)

import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

// Define as URLs para os ambientes de produção e desenvolvimento
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3333';
const PRODUCTION_SOCKET_URL = 'https://api.laink.com.br';
const SOCKET_URL = import.meta.env.PROD ? PRODUCTION_SOCKET_URL : API_URL;

const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user, loading } = useAuth();

  useEffect(() => {
    // A conexão só é estabelecida quando o usuário está autenticado e o loading inicial terminou
    if (!loading && user) {
      const newSocket = io(SOCKET_URL, {
        forceNew: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
      });

      // Ao conectar, envia os dados do usuário para o backend para entrar nas salas corretas
      newSocket.on('connect', () => {
        if (user && user.id && user.role) {
          const userInfo = { userId: user.id, role: user.role.toLowerCase() };
          newSocket.emit('join_rooms', userInfo);
        }
      });

      setSocket(newSocket);

      // Função de limpeza para desconectar o socket ao fazer logout ou desmontar o componente
      return () => {
        newSocket.disconnect();
      };
    } else if (!loading && !user && socket) {
      // Garante a desconexão se o usuário fizer logout
      socket.disconnect();
      setSocket(null);
    }
  }, [user, loading]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
