// src/database/migrations/YYYYMMDDHHMMSS_add_deslocamento_to_chamados.js

exports.up = function(knex) {
  return knex.schema.table('chamados', table => {
    // Guarda o timestamp de quando o deslocamento começou
    table.timestamp('inicio_deslocamento');
    // Guarda o tempo total de deslocamento em segundos
    table.integer('tempo_deslocamento'); 
  });
};

exports.down = function(knex) {
  return knex.schema.table('chamados', table => {
    table.dropColumn('inicio_deslocamento');
    table.dropColumn('tempo_deslocamento');
  });
};
