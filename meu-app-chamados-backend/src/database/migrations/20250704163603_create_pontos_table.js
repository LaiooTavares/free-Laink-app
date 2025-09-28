exports.up = function(knex) {
  return knex.schema.createTable('pontos', table => {
    table.increments('id').primary();

    table.string('tipo').notNullable(); // 'Entrada' ou 'Saída'
    table.timestamp('data_hora').notNullable(); // Data e hora exatas do ponto

    // Chave estrangeira para saber qual técnico bateu o ponto
    table.integer('tecnico_id')
         .references('id')
         .inTable('users')
         .onDelete('CASCADE'); // Se o técnico for apagado, os seus pontos também são.
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('pontos');
};