// src/database/connection.js

const knex = require('knex');
const configuration = require('../../knexfile');

// Lógica para selecionar a configuração correta
// Se a variável de ambiente NODE_ENV for 'production', usa a configuração de produção.
// Caso contrário, usa a de desenvolvimento.
const config = process.env.NODE_ENV === 'production' ? configuration.production : configuration.development;

// Cria a conexão usando a configuração selecionada
const connection = knex(config);

// Exporta a conexão para ser usada em outras partes da aplicação
module.exports = connection;
