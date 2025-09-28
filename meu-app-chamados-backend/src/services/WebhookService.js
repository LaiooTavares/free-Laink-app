// File: MEU-APP-CHAMADOS-BACKEND/src/services/WebhookService.js

const connection = require('../database/connection');
const axios = require('axios'); // Importar o axios

/**
 * Função central para enviar dados para o webhook configurado.
 * @param {object} payload - O objeto de dados a ser enviado no corpo da requisição.
 */
async function sendToWebhook(payload) {
  try {
    // 1. Busca a URL do webhook no banco de dados.
    const configUrl = await connection('configuracoes').where('chave', 'webhookUrl').first();
    const webhookUrl = configUrl ? configUrl.valor : null;

    // 2. Se a URL não estiver configurada, interrompe e avisa no log.
    if (!webhookUrl || webhookUrl.trim() === '') {
      console.warn('[WebhookService] URL do Webhook não está configurada. Nenhum dado foi enviado.');
      return; // Retorna para não travar a operação principal se o webhook não for essencial.
    }

    // 3. Adiciona o link do frontend ao payload, se aplicável.
    if (process.env.FRONTEND_BASE_URL && payload.evento === 'chamado' && payload.id) {
      payload.link_chamado = `${process.env.FRONTEND_BASE_URL}/chamado/${payload.id}`;
    }

    // 4. Envia a requisição POST para a URL do webhook usando axios.
    console.log(`[WebhookService] Enviando payload para: ${webhookUrl}`);
    
    await axios.post(webhookUrl, payload, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    // 5. Log de sucesso. O axios já trata erros de status (4xx, 5xx) no catch.
    console.log(`[WebhookService] Payload enviado com sucesso!`);

  } catch (error) {
    // O axios joga um erro para respostas com status de erro, o que é ótimo.
    if (error.response) {
      // A requisição foi feita e o servidor respondeu com um status de erro
      console.error(`[WebhookService] Erro ao enviar webhook. Status: ${error.response.status}. Resposta:`, error.response.data);
    } else if (error.request) {
      // A requisição foi feita mas nenhuma resposta foi recebida
      console.error('[WebhookService] Erro de rede ou nenhuma resposta recebida do servidor do webhook.');
    } else {
      // Algo aconteceu ao configurar a requisição que disparou um erro
      console.error('[WebhookService] Falha crítica ao configurar a requisição do webhook:', error.message);
    }
    // Opcional: Se o envio do webhook for CRÍTICO, você pode re-lançar o erro.
    // Se não for crítico, apenas logamos o erro e deixamos a operação principal continuar.
    // throw error; 
  }
}

module.exports = {
  sendToWebhook
};