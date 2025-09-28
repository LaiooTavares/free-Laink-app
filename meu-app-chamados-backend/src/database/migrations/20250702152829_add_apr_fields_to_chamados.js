exports.up = function(knex) {
  return knex.schema.table('chamados', function(table) {
    // Coluna para saber se a APR foi concluída com sucesso
    table.boolean('apr_completa').defaultTo(false);
    // Coluna para guardar as respostas (Sim/Não) como um objeto JSON
    table.json('apr_respostas'); 
  });
};

exports.down = function(knex) {
  return knex.schema.table('chamados', function(table) {
    table.dropColumn('apr_completa');
    table.dropColumn('apr_respostas');
  });
};