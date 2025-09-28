// MEU-APP-CHAMADOS-BACKEND/src/controllers/ClientesController.js (CORRIGIDO)
const connection = require('../database/connection');

module.exports = {
  async index(request, response) {
    try {
      const clientes = await connection('clientes')
        .select('*')
        .orderBy('nome', 'asc');

      return response.json(clientes);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      return response.status(500).json({ error: "Ocorreu um erro interno ao buscar os clientes." });
    }
  },

  async create(request, response) {
    try {
      const { nome, ic, endereco, localizacao, observacoes } = request.body;

      if (!nome || !ic || !endereco) {
        return response.status(400).json({ error: "Nome, IC e Endereço são obrigatórios." });
      }

      const [createdClient] = await connection('clientes')
        .insert({
          nome,
          ic,
          endereco,
          localizacao,
          observacoes
        })
        .returning('*');

      return response.status(201).json(createdClient);

    } catch (error) {
      console.error("Erro ao criar cliente:", error);
      if (error.code === '23505' || (error.code === 'SQLITE_CONSTRAINT' && error.message.includes('UNIQUE'))) {
        return response.status(409).json({ error: "A Identificação do Cliente (IC) fornecida já está em uso." });
      }
      return response.status(500).json({ error: "Ocorreu um erro interno ao criar o cliente." });
    }
  },

  // --- MÉTODO UPDATE ADICIONADO ---
  async update(request, response) {
    try {
      const { id } = request.params;
      const { nome, ic, endereco, localizacao, observacoes } = request.body;

      const cliente = await connection('clientes').where({ id }).first();
      if (!cliente) {
        return response.status(404).json({ error: 'Cliente não encontrado.' });
      }

      // Valida se o novo IC já não pertence a outro cliente
      if (ic && ic !== cliente.ic) {
        const existingIc = await connection('clientes').where({ ic }).first();
        if (existingIc) {
          return response.status(409).json({ error: "A Identificação do Cliente (IC) já está em uso por outro cliente." });
        }
      }

      const updatedData = {
        nome,
        ic,
        endereco,
        localizacao,
        observacoes
      };

      const [updatedClient] = await connection('clientes')
        .where({ id })
        .update(updatedData)
        .returning('*');

      return response.json(updatedClient);

    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
      if (error.code === '23505' || (error.code === 'SQLITE_CONSTRAINT' && error.message.includes('UNIQUE'))) {
        return response.status(409).json({ error: "A Identificação do Cliente (IC) já está em uso." });
      }
      return response.status(500).json({ error: "Ocorreu um erro interno ao atualizar o cliente." });
    }
  },

  async delete(request, response) {
    try {
      const { id } = request.params;

      const cliente = await connection('clientes').where({ id }).first();
      if (!cliente) {
        return response.status(404).json({ error: 'Cliente não encontrado.' });
      }

      const chamadosDoCliente = await connection('chamados').where({ ic: cliente.ic }).first();
      if (chamadosDoCliente) {
        return response.status(403).json({ 
          error: 'Este cliente não pode ser excluído pois possui chamados associados.' 
        });
      }

      await connection('clientes').where({ id }).delete();

      return response.status(204).send();
    } catch (error) {
      console.error("Erro ao deletar cliente:", error);
      return response.status(500).json({ error: 'Ocorreu um erro interno ao deletar o cliente.' });
    }
  }
};
