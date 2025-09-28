// File: MEU-APP-CHAMADOS-BACKEND/src/database/seeds/01_create_default_users.js
const bcrypt = require('bcryptjs');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Define o usuário gestor padrão para a versão simplificada
  const gestorUser = {
    name: 'Gestor Primer',
    email: 'gestor.primer@laink.com.br',
    role: 'GESTOR',
    matricula: 'GS001'
  };
  
  const gestorPassword = 'G3st0rPr1m3r';

  // Verifica se o usuário já existe
  const userExists = await knex('users').where({ email: gestorUser.email }).first();

  // Se o usuário NÃO existir, cria-o
  if (!userExists) {
    console.log(`Criando usuário gestor padrão: ${gestorUser.email}`);
    const hashedPassword = await bcrypt.hash(gestorPassword, 8);
    await knex('users').insert({
      ...gestorUser,
      password: hashedPassword
    });
  } else {
    console.log(`Usuário gestor padrão (${gestorUser.email}) já existe. Nenhuma ação necessária.`);
  }
};