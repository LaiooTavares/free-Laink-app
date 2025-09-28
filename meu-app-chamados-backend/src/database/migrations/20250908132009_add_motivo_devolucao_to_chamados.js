// Conteúdo para o novo arquivo de migração
exports.up = function(knex) {
  return knex.schema.table('chamados', function(table) {
    // Adiciona uma coluna do tipo texto para o motivo
    table.text('motivoDevolucao'); 
  });
};

exports.down = function(knex) {
  return knex.schema.table('chamados', function(table) {
    table.dropColumn('motivoDevolucao');
  });
};