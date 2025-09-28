exports.up = function(knex) {
  return knex.schema.table('chamados', async function(table) {
    const hasColumn = await knex.schema.hasColumn('chamados', 'tempoDecorrido');
    if (!hasColumn) {
      table.integer('tempoDecorrido').defaultTo(0);
    }
  });
};

exports.down = function(knex) {
  return knex.schema.table('chamados', async function(table) {
    const hasColumn = await knex.schema.hasColumn('chamados', 'tempoDecorrido');
    if (hasColumn) {
      table.dropColumn('tempoDecorrido');
    }
  });
};