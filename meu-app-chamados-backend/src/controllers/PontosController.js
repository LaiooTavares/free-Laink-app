// File: MEU-APP-CHAMADOS-BACKEND/src/controllers/PontosController.js

const connection = require('../database/connection');
const { sendToWebhook } = require('../services/WebhookService');

module.exports = {
  async index(request, response) {
    try {
      const tecnico_id = request.user.id;
      const pontosDoDia = await connection('pontos')
        .where({ tecnico_id })
        .whereRaw("CAST(data_hora AS DATE) = CURRENT_DATE")
        .orderBy('data_hora', 'asc');
      return response.json(pontosDoDia);
    } catch (error) {
      console.error("Erro ao listar registros de ponto:", error);
      return response.status(500).json({ error: "Erro interno ao buscar registros." });
    }
  },

  async create(request, response) {
    const { tipo, data_hora, latitude, longitude, foto } = request.body;
    const { id: tecnico_id } = request.user; // Pegamos apenas o ID do token

    try {
      const [result] = await connection('pontos').insert({
        tipo,
        data_hora,
        tecnico_id,
        latitude,
        longitude
      }).returning('id');

      try {
        // CORREÇÃO: Busca os dados completos do técnico no banco de dados
        const tecnico = await connection('users').where('id', tecnico_id).first();

        const webhookPayload = {
          evento: 'Ponto',
          // Usa os dados do técnico que acabamos de buscar
          nome: tecnico ? tecnico.name : 'Nome não encontrado',
          matricula: tecnico ? tecnico.matricula : null,
          localizacao: {
            latitude: latitude,
            longitude: longitude
          },
          foto: foto || null
        };
        
        await sendToWebhook(webhookPayload);
        
      } catch (webhookError) {
        console.error("AVISO: O registro de ponto foi salvo, mas o envio para o webhook falhou.", webhookError.message);
      }

      const id = result?.id || result;
      return response.status(201).json({ id });
      
    } catch (error) {
      console.error("Erro ao criar registro de ponto:", error);
      return response.status(500).json({ error: "Erro interno ao salvar ponto."});
    }
  }
};