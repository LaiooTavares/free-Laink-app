// MEU-APP-CHAMADOS-BACKEND/knexfile.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    },
    migrations: {
      directory: path.resolve(__dirname, 'src', 'database', 'migrations')
    },
    seeds: {
      directory: path.resolve(__dirname, 'src', 'database', 'seeds')
    }
  },

  // --- CONFIGURAÇÃO DE PRODUÇÃO CORRIGIDA ---
  // Voltamos a usar uma única DATABASE_URL, que é o padrão e o mais confiável.
  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL, // <-- A MUDANÇA ESTÁ AQUI
    migrations: {
      directory: path.resolve(__dirname, 'src', 'database', 'migrations')
    },
    seeds: {
      directory: path.resolve(__dirname, 'src', 'database', 'seeds')
    }
  }
};