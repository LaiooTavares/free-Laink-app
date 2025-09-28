// File: MEU-APP-CHAMADOS-BACKEND/database/migrations/YYYYMMDDHHMMSS_create_servicos_table.js
// (substitua YYYYMMDDHHMMSS pelo timestamp gerado pelo Knex)

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('servicos', table => {
    // Estrutura espelhada da tabela 'chamados'
    table.string('id').primary();
    table.string('ic').notNullable();
    table.string('cliente').notNullable();
    table.string('endereco');
    table.jsonb('localizacao');
    table.string('status').notNullable();
    table.string('tipoServico').notNullable();
    table.text('descricao').notNullable();
    table.jsonb('tags');
    
    // Chave estrangeira para o técnico responsável
    table.integer('tecnico_id').unsigned().references('id').inTable('users').onDelete('SET NULL');

    // Campos para controle de estado e progresso
    table.jsonb('materiais').defaultTo('[]');
    table.jsonb('fotos').defaultTo('[]');
    table.jsonb('historico').defaultTo('[]');
    table.boolean('aprCompleta').defaultTo(false);
    table.jsonb('aprRespostas');
    table.timestamp('inicio_deslocamento');
    table.timestamp('inicio_atendimento');
    table.integer('tempo_deslocamento'); // Em segundos

    // Timestamps
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('servicos');
};
