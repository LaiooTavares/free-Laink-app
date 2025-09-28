// Dentro do novo ficheiro ..._create_observacoes_table.js

exports.up = function(knex) {
  return knex.schema.createTable('observacoes', table => {
    table.increments('id').primary();
    table.text('descricao').notNullable();
    table.string('local'); // Onde o problema foi observado

    // Chave estrangeira para saber qual técnico enviou
    table.integer('tecnico_id')
         .references('id')
         .inTable('users')
         .onDelete('SET NULL'); // Se o técnico for apagado, a observação permanece

    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('observacoes');
};