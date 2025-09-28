// MEU-APP-CHAMADOS-BACKEND/src/database/seeds/001_initial_admin_user.js

const bcrypt = require('bcryptjs');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  const primerUserEmail = 'gestor.primer@laink.com.br';

  // Passo 1: Verifica se o usuário "primer" já existe no banco de dados.
  const userExists = await knex('users').where({ email: primerUserEmail }).first();

  // Passo 2: Se o usuário NÃO existir, o código abaixo será executado para criá-lo.
  // Se ele já existir, o script não faz nada, garantindo que ele nunca seja apagado.
  if (!userExists) {
    // Cria a hash da nova senha segura. NUNCA salve senhas em texto plano.
    const hashedPassword = await bcrypt.hash('G3st0rPr1m3r', 8);

    // Insere o usuário administrador principal com as credenciais fornecidas.
    await knex('users').insert([
      {
        name: 'Gestor Primer',
        email: primerUserEmail,
        password: hashedPassword,
        role: 'GESTOR'
      }
    ]);
  }
};
