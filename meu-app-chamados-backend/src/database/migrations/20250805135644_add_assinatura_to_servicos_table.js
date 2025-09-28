// File: src/database/migrations/SEU_TIMESTAMP_add_assinatura_to_servicos_table.js

exports.up = function(knex) {
  // A função 'up' é o que acontece quando você executa a migração
  return knex.schema.table('servicos', function(table) {
    // Adiciona uma nova coluna chamada 'assinatura' do tipo TEXT.
    // Usamos TEXT porque a assinatura (geralmente em base64) pode ser muito longa.
    table.text('assinatura');
  });
};

exports.down = function(knex) {
  // A função 'down' é para o caso de você precisar reverter a migração
  return knex.schema.table('servicos', function(table) {
    table.dropColumn('assinatura');
  });
};