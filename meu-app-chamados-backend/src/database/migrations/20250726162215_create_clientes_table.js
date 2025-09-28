// Dentro do novo arquivo de migration: ..._create_clientes_table.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('clientes', table => {
    table.increments('id').primary();
    table.string('nome').notNullable(); 
    table.string('ic').notNullable().unique();
    table.string('endereco').notNullable();
    table.string('localizacao').nullable();
    table.text('observacoes').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('clientes');
};