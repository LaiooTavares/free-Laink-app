// File: MEU-APP-CHAMADOS-BACKEND/src/database/seeds/03_add_branding_config.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  const brandingConfigs = [
    {
      chave: 'logo_dashboard_url',
      valor: '', // Valor inicial vazio para não ser nulo
    },
    {
      chave: 'favicon_url',
      valor: '',
    }
  ];

  // Insere as configurações apenas se elas não existirem
  for (const config of brandingConfigs) {
    const existing = await knex('configuracoes').where('chave', config.chave).first();
    if (!existing) {
      // Objeto de inserção corrigido, sem a coluna 'descricao'
      await knex('configuracoes').insert({
        chave: config.chave,
        valor: config.valor
      });
    }
  }

  console.log('Configurações de branding padrão inseridas/verificadas com sucesso.');
};
