// Dentro do ficheiro ..._add_progress_fields_to_chamados.js

exports.up = function(knex) {
  return knex.schema.table('chamados', function(table) {
    // Usando os mesmos nomes que o front-end envia (camelCase)
    table.integer('tempoDecorrido').defaultTo(0);
    table.text('comentarios');
    table.json('materiais');
    table.json('fotos');
    table.json('historico');
    table.text('assinatura');
    table.boolean('aprCompleta').defaultTo(false);
    table.json('aprRespostas');
  });
};

exports.down = function(knex) {
  return knex.schema.table('chamados', function(table) {
    // Nomes correspondentes para apagar as colunas
    table.dropColumn('tempoDecorrido');
    table.dropColumn('comentarios');
    table.dropColumn('materiais');
    table.dropColumn('fotos');
    table.dropColumn('historico');
    table.dropColumn('assinatura');
    table.dropColumn('aprCompleta');
    table.dropColumn('aprRespostas');
  });
};