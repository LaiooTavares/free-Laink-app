/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  // ALTERAÇÃO: Adicionado o método '.hasTable()' para verificar se a tabela já existe.
  return knex.schema.hasTable('contadores_os').then(function(exists) {
    if (!exists) {
      // Se a tabela NÃO existir, então cria-a.
      return knex.schema.createTable('contadores_os', table => {
        table.increments('id').primary();
        table.string('ano', 2).notNullable();
        table.string('tipo', 5).notNullable();
        table.integer('ultimo_valor').notNullable().defaultTo(0);
        table.unique(['ano', 'tipo']);
      });
    }
    // Se a tabela já existir, não faz nada e informa no log.
    console.log("A tabela 'contadores_os' já existe. A saltar a criação.");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  // A lógica para reverter permanece a mesma.
  return knex.schema.dropTableIfExists('contadores_os');
};
