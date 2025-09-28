// MEU-APP-CHAMADOS-BACKEND/knexfile.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// ✅ CORREÇÃO APLICADA AQUI: module.exports em vez de module.log
module.exports = {
  /**
   * Configuração para o ambiente de Desenvolvimento (sua máquina local).
   * Lendo as variáveis separadas do .env.
   */
  development: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    },
    migrations: {
      directory: path.resolve(__dirname, 'src', 'database', 'migrations')
    },
    seeds: {
      directory: path.resolve(__dirname, 'src', 'database', 'seeds')
    }
  },

  /**
   * Configuração para o ambiente de Produção (Easypanel, Render, etc.).
   * Mantida com DATABASE_URL, que é o padrão para esses serviços.
   */
  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: path.resolve(__dirname, 'src', 'database', 'migrations')
    },
    seeds: {
      directory: path.resolve(__dirname, 'src', 'database', 'seeds')
    }
  }
};