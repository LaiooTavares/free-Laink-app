// MEU-APP-CHAMADOS-FRONTEND/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// <<-- ALTERAÇÃO: Importado o método moderno para lidar com caminhos de arquivos -->>
import { fileURLToPath, URL } from 'url';

export default defineConfig({
  plugins: [react()],
  base: '/',
  resolve: {
    alias: {
      // <<-- ALTERAÇÃO: 'path.resolve' trocado pela sintaxe moderna e segura -->>
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    include: ['react-draggable', 'react-signature-canvas'],
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
      include: [/react-draggable/, /react-signature-canvas/, /node_modules/],
    },
  },
});