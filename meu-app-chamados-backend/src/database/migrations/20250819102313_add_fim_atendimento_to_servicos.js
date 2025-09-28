// FILE: src/database/migrations/SEU_NOVO_ARQUIVO_DE_MIGRACAO.js

exports.up = function(knex) {
  return knex.schema.table('servicos', function(table) {
    // Adiciona a coluna para armazenar o timestamp de finalização
    table.datetime('fim_atendimento').nullable();
  });
};

exports.down = function(knex) {
  return knex.schema.table('servicos', function(table) {
    // Remove a coluna caso seja necessário reverter a migração
    table.dropColumn('fim_atendimento');
  });
};