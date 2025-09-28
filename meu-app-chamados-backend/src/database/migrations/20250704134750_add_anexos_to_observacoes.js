exports.up = function(knex) {
  return knex.schema.table('observacoes', function(table) {
    // A coluna 'anexos' guardará uma lista de ficheiros (nome, tipo, dados) como JSON
    table.json('anexos');
  });
};

exports.down = function(knex) {
  return knex.schema.table('observacoes', function(table) {
    table.dropColumn('anexos');
  });
};