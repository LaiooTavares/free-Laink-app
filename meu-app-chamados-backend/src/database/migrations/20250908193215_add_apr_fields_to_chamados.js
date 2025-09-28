// MEU-APP-CHAMADOS-BACKEND/src/database/migrations/[timestamp]_add_apr_fields_to_chamados.js
exports.up = function(knex) {
  return knex.schema.table('chamados', async function(table) {
    // Verifica se a coluna 'inicio_apr' NÃO existe antes de adicioná-la
    if (!(await knex.schema.hasColumn('chamados', 'inicio_apr'))) {
      table.timestamp('inicio_apr');
    }
    // Verifica se a coluna 'apr_respostas' NÃO existe antes de adicioná-la
    if (!(await knex.schema.hasColumn('chamados', 'apr_respostas'))) {
      table.json('apr_respostas').defaultTo('{}');
    }
    // Verifica se a coluna 'apr_completa' NÃO existe antes de adicioná-la
    if (!(await knex.schema.hasColumn('chamados', 'apr_completa'))) {
      table.boolean('apr_completa').defaultTo(false);
    }
  });
};

exports.down = function(knex) {
  return knex.schema.table('chamados', async function(table) {
    // Verifica se a coluna existe antes de tentar removê-la
    if (await knex.schema.hasColumn('chamados', 'inicio_apr')) {
      table.dropColumn('inicio_apr');
    }
    if (await knex.schema.hasColumn('chamados', 'apr_respostas')) {
      table.dropColumn('apr_respostas');
    }
    if (await knex.schema.hasColumn('chamados', 'apr_completa')) {
      table.dropColumn('apr_completa');
    }
  });
};
//