// File: MEU-APP-CHAMADOS-BACKEND/src/controllers/RegistrosController.js

const connection = require('../database/connection');

module.exports = {
  // Busca todos os registros, ordenados do mais novo para o mais antigo
  async index(request, response) {
    try {
      const registros = await connection('registros')
        .select('*')
        .orderBy('created_at', 'desc');
      
      return response.json(registros);
    } catch (error) {
      console.error("Erro ao buscar registros:", error);
      return response.status(500).json({ error: "Erro ao buscar registros." });
    }
  },

  // --- NOVO MÉTODO ADICIONADO ---
  // Deleta um único registro com base no ID fornecido na URL
  async deleteSingle(request, response) {
    const { id } = request.params;

    try {
      const deletedCount = await connection('registros')
        .where({ id })
        .del();

      if (deletedCount === 0) {
        return response.status(404).json({ error: 'Nenhum registro encontrado com o ID fornecido.' });
      }
      
      // Emite um evento via socket para notificar os clientes em tempo real
      if (request.io) {
        request.io.emit('registro_deletado', { id });
      }

      console.log(`[RegistrosController] O registro ID ${id} foi excluído pelo usuário ID ${request.user.id}.`);
      return response.status(204).send(); // Resposta padrão de sucesso para DELETE

    } catch (error) {
      console.error(`Erro ao deletar o registro ID ${id}:`, error);
      return response.status(500).json({ error: 'Erro interno ao tentar deletar o registro.' });
    }
  },

  // Método existente para deletar um ou mais registros com base em uma lista de IDs
  async destroy(request, response) {
    const { ids } = request.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return response.status(400).json({ error: 'Uma lista de IDs para exclusão é obrigatória.' });
    }

    try {
      const deletedCount = await connection('registros')
        .whereIn('id', ids)
        .del();

      if (deletedCount === 0) {
        return response.status(404).json({ error: 'Nenhum registro encontrado com os IDs fornecidos.' });
      }

      // Poderíamos emitir um socket para cada ID deletado aqui também, se necessário
      // Ex: ids.forEach(id => request.io.emit('registro_deletado', { id }));

      console.log(`[RegistrosController] ${deletedCount} registro(s) foram excluídos pelo usuário ID ${request.user.id}.`);
      return response.status(200).json({ message: `${deletedCount} registro(s) excluído(s) com sucesso.` });

    } catch (error) {
      console.error("Erro ao deletar registros:", error);
      return response.status(500).json({ error: 'Erro interno ao tentar deletar os registros.' });
    }
  },
};