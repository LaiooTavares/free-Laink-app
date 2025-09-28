// File: MEU-APP-CHAMADOS-BACKEND/database/migrations/YYYYMMDDHHMMSS_add_default_os_settings.js
// (substitua YYYYMMDDHHMMSS pelo timestamp gerado pelo Knex)

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  // Insere as configurações padrão para os prefixos das Ordens de Serviço.
  // Usamos 'knex.raw' com 'ON CONFLICT DO NOTHING' para evitar erros se as chaves já existirem.
  return knex('configuracoes').insert([
    { chave: 'os_prefixo_chamado', valor: 'CH' },
    { chave: 'os_prefixo_servico', valor: 'SV' }
  ]).onConflict('chave').ignore();
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  // Remove as chaves de configuração ao reverter a migração.
  return knex('configuracoes')
    .whereIn('chave', ['os_prefixo_chamado', 'os_prefixo_servico'])
    .del();
};
