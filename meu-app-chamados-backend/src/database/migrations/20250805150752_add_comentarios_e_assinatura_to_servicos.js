// MEU-APP-CHAMADOS-BACKEND/src/database/migrations/20250805150752_add_comentarios_e_assinatura_to_servicos.js

// A função 'up' agora cria APENAS a coluna 'comentarios'
exports.up = function(knex) {
  return knex.schema.alterTable('servicos', function(table) {
    table.text('comentarios'); // A linha que adicionava 'assinatura' foi removida
  });
};

// A função 'down' agora remove APENAS a coluna 'comentarios'
exports.down = function(knex) {
  return knex.schema.alterTable('servicos', function(table) {
    table.dropColumn('comentarios');
  });
};