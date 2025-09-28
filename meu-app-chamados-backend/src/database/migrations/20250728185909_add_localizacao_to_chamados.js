// MEU-APP-CHAMADOS-BACKEND/database/migrations/20250728185909_add_localizacao_to_chamados.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.table('chamados', function(table) {
    // Adiciona a nova coluna 'localizacao' que pode ser nula
    table.string('localizacao').nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.table('chamados', function(table) {
    // Remove a coluna 'localizacao' caso precise reverter a migration
    table.dropColumn('localizacao');
  });
};
