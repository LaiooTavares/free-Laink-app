// File: src/database/migrations/SEU_TIMESTAMP_add_tempo_decorrido_to_servicos.js

exports.up = function(knex) {
  return knex.schema.table('servicos', function(table) {
    // Adiciona a coluna para armazenar o tempo total do atendimento em segundos.
    // O tipo integer (número inteiro) é perfeito para isso.
    table.integer('tempoDecorrido');
  });
};

exports.down = function(knex) {
  return knex.schema.table('servicos', function(table) {
    table.dropColumn('tempoDecorrido');
  });
};