/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('materiais', (table) => {
    // Remove o unique constraint antigo da coluna 'codigo'
    table.dropUnique('codigo');

    // Adiciona a coluna para referenciar o técnico
    table.integer('tecnico_id').unsigned().notNullable();

    // Cria a chave estrangeira para a tabela 'users'
    table.foreign('tecnico_id').references('id').inTable('users').onDelete('CASCADE');

    // Cria um novo unique constraint composto
    table.unique(['codigo', 'tecnico_id']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('materiais', (table) => {
    table.dropUnique(['codigo', 'tecnico_id']);
    table.dropForeign('tecnico_id');
    table.dropColumn('tecnico_id');
    table.unique('codigo'); // Restaura o unique constraint antigo
  });
};