/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  // O método 'up' é executado quando aplicamos a migração.
  // Ele adiciona a nova coluna 'inicio_atendimento' à tabela 'chamados'.
  return knex.schema.table('chamados', function(table) {
    // Adiciona a coluna 'inicio_atendimento' do tipo TIMESTAMP (data e hora).
    // Ela pode ser nula, pois só terá valor quando o atendimento começar.
    table.timestamp('inicio_atendimento').nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  // O método 'down' é usado para reverter a migração, caso seja necessário.
  // Ele remove a coluna que foi adicionada.
  return knex.schema.table('chamados', function(table) {
    table.dropColumn('inicio_atendimento');
  });
};
