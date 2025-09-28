// MEU-APP-CHAMADOS-BACKEND/src/database/migrations/[timestamp]_fix_add_inicio_apr_to_chamados.js
exports.up = function(knex) {
  return knex.schema.table('chamados', function(table) {
    // Adiciona APENAS a coluna que está faltando
    table.timestamp('inicio_apr');
  });
};

exports.down = function(knex) {
  return knex.schema.table('chamados', function(table) {
    table.dropColumn('inicio_apr');
  });
};