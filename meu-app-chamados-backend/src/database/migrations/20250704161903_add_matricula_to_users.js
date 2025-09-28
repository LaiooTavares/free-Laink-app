exports.up = function(knex) {
  return knex.schema.table('users', function(table) {
    // Adiciona a coluna 'matricula', que pode ser um número ou texto
    table.string('matricula').unique(); // 'unique' garante que não haja duas matrículas iguais
  });
};

exports.down = function(knex) {
  return knex.schema.table('users', function(table) {
    table.dropColumn('matricula');
  });
};