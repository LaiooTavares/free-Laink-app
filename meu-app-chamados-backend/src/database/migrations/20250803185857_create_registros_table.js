// File: MEU-APP-CHAMADOS-BACKEND/database/migrations/YYYYMMDDHHMMSS_create_registros_table.js
// (substitua YYYYMMDDHHMMSS pelo timestamp gerado pelo Knex)

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('registros', (table) => {
    table.increments('id').primary();
    table.string('evento').notNullable();
    table.string('cliente');
    table.string('ic_cliente');
    table.text('descricao');
    table.jsonb('anexos'); // Usando jsonb para armazenar a lista de anexos (URLs)
    table.timestamp('data_evento').notNullable();
    table.string('nome_tecnico');
    table.string('matricula_tecnico');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('registros');
};
