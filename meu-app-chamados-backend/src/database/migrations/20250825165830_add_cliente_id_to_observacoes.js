// File: src/database/migrations/20250825165830_add_cliente_id_to_observacoes.js

exports.up = async function(knex) {
  // 1. Verifica se a coluna 'cliente_id' já existe na tabela 'observacoes'
  const hasColumn = await knex.schema.hasColumn('observacoes', 'cliente_id');

  // 2. Se a coluna NÃO existir, cria ela.
  if (!hasColumn) {
    return knex.schema.table('observacoes', function(table) {
      table.integer('cliente_id')
           .notNullable()
           .references('id')
           .inTable('clientes');
    });
  }
};

exports.down = async function(knex) {
  // 1. Verifica se a coluna 'cliente_id' existe antes de tentar removê-la
  const hasColumn = await knex.schema.hasColumn('observacoes', 'cliente_id');
  
  // 2. Se a coluna existir, remove ela.
  if (hasColumn) {
    return knex.schema.table('observacoes', function(table) {
      table.dropColumn('cliente_id');
    });
  }
};