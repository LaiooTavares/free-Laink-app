/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('historico_estoque', (table) => {
    table.increments('id').primary();

    table.integer('tecnico_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.integer('material_id').unsigned().notNullable().references('id').inTable('materiais').onDelete('CASCADE');

    table.string('tipo_movimentacao').notNullable(); // Ex: 'ENTRADA_EXTERNA', 'USO_EM_CHAMADO', 'TRANSFERENCIA_ENVIADA', 'TRANSFERENCIA_RECEBIDA'
    table.integer('quantidade_alteracao').notNullable(); // Valor positivo para entradas, negativo para saídas

    table.integer('saldo_anterior').notNullable();
    table.integer('saldo_novo').notNullable();

    table.string('referencia').nullable(); // Ex: ID do chamado, Matrícula do outro técnico
    table.string('responsavel').notNullable(); // Ex: 'Estoque Central', 'Técnico: João Silva'

    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('historico_estoque');
};