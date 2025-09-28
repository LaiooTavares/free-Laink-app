// ficheiro: yyyymmddhhmmss_create_configuracoes_table.js

exports.up = function(knex) {
  return knex.schema.createTable('configuracoes', table => {
    table.string('chave').primary(); // A chave, ex: 'webhookUrl'
    table.string('valor').notNullable(); // O valor, ex: 'https://...'
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('configuracoes');
};
