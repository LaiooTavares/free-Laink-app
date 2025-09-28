// MEU-APP-CHAMADOS-BACKEND/knexfile.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

module.exports = {
  /**
   * Configuração para o ambiente de Desenvolvimento (sua máquina local).
   */
  development: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE, // CORRIGIDO de DB_NAME para DB_DATABASE
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
   * ATUALIZADO para usar as mesmas variáveis separadas do ambiente de desenvolvimento.
   */
  production: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE, // CORRIGIDO de DB_NAME e ajustado para produção
    },
    migrations: {
      directory: path.resolve(__dirname, 'src', 'database', 'migrations')
    },
    seeds: {
      directory: path.resolve(__dirname, 'src', 'database', 'seeds')
    }
  }
};