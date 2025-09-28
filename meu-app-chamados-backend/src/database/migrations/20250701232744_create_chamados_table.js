// Dentro do novo ficheiro em: src/database/migrations/TIMESTAMP_create_chamados_table.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('chamados', table => {
    // Usaremos o ID do chamado (ex: 'OS-URG-101') como chave primária
    table.string('id').primary(); 
    table.string('ic').notNullable();
    table.string('cliente').notNullable();
    table.string('status').notNullable();
    table.integer('prioridade'); // Para chamados urgentes
    table.string('tipoServico').notNullable();
    table.text('descricao').notNullable(); // 'text' permite textos mais longos
    table.string('endereco');

    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('chamados');
};