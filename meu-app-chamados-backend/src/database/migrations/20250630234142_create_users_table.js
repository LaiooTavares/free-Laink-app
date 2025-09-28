// Dentro do novo arquivo em: src/database/migrations/TIMESTAMP_create_users_table.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  // A função 'up' é o que acontece quando aplicamos a migração.
  // Aqui, estamos criando a tabela 'users'.
  return knex.schema.createTable('users', table => {
    table.increments('id'); // Cria uma coluna 'id' com auto-incremento.
    table.string('name').notNullable(); // Coluna 'name', tipo texto, não pode ser vazia.
    table.string('email').notNullable().unique(); // Coluna 'email', texto, não pode ser vazia e tem que ser única.
    table.string('password').notNullable(); // Coluna 'password', texto, não pode ser vazia.
    table.string('role').notNullable(); // Coluna 'role' (função), texto, não pode ser vazia.
    table.timestamp('created_at').defaultTo(knex.fn.now()); // Coluna com a data de criação.
    table.timestamp('updated_at').defaultTo(knex.fn.now()); // Coluna com a data da última atualização.
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  // A função 'down' é o que acontece quando DESFAZEMOS a migração.
  // Aqui, estamos deletando a tabela 'users'.
  return knex.schema.dropTable('users');
};