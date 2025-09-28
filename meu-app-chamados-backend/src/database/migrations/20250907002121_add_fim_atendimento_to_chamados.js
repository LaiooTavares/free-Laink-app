// MEU-APP-CHAMADOS-BACKEND/src/database/migrations/SEU_ARQUIVO_DE_MIGRATION.js
exports.up = function(knex) {
  return knex.schema.table('chamados', function(table) {
    table.timestamp('fim_atendimento');
  });
};

exports.down = function(knex) {
  return knex.schema.table('chamados', function(table) {
    table.dropColumn('fim_atendimento');
  });
};