// Dentro do novo ficheiro de migração

exports.up = function(knex) {
  return knex.schema.table('chamados', function(table) {
    // Adiciona uma coluna para guardar o ID do técnico
    table.integer('tecnico_id')
         .references('id') // Diz que este campo se refere à coluna 'id'
         .inTable('users'); // da tabela 'users'
  });
};

exports.down = function(knex) {
  return knex.schema.table('chamados', function(table) {
    // Remove a coluna caso precisemos de reverter
    table.dropColumn('tecnico_id');
  });
};