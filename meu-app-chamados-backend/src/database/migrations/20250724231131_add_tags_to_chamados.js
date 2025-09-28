// dentro do novo arquivo de migration (ex: ..._add_tags_to_chamados.js)

exports.up = function(knex) {
  return knex.schema.table('chamados', function(table) {
    // Adiciona uma nova coluna de texto para armazenar as tags
    table.string('tags'); 
  });
};

exports.down = function(knex) {
  return knex.schema.table('chamados', function(table) {
    // Remove a coluna caso seja necessário reverter a migration
    table.dropColumn('tags');
  });
};