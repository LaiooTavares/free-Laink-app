// MEU-APP-CHAMADOS-BACKEND/src/database/migrations/[timestamp]_add_motivo_devolucao_to_servicos.js
exports.up = function(knex) {
  return knex.schema.table('servicos', function(table) {
    table.text('motivoDevolucao');
  });
};

exports.down = function(knex) {
  return knex.schema.table('servicos', function(table) {
    table.dropColumn('motivoDevolucao');
  });
};