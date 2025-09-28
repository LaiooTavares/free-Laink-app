// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import App from './App.jsx';
import './index.css'; // ✅ ARQUIVO CSS GLOBAL IMPORTADO AQUI

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <SnackbarProvider 
        maxSnack={3} 
        autoHideDuration={3000} 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <App />
      </SnackbarProvider>
    </BrowserRouter>
  </React.StrictMode>
);