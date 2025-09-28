/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('materiais', (table) => {
    table.increments('id').primary();
    
    // Código único para o material (SKU). Essencial para atualizações.
    table.string('codigo').notNullable().unique();

    table.string('nome').notNullable();
    table.text('descricao').notNullable();
    table.integer('quantidade').notNullable().defaultTo(0);
    table.string('tipo').notNullable();
    
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('materiais');
};