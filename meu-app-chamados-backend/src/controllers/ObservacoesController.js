// File: MEU-APP-CHAMADOS-BACKEND/src/controllers/ObservacoesController.js
const connection = require('../database/connection');
const { sendToWebhook } = require('../services/WebhookService');

module.exports = {
  async create(request, response) {
    const { io } = request;
    const { clienteId, descricao, anexos } = request.body;
    const { id: tecnicoId } = request.user;

    if (!clienteId || !descricao) {
      return response.status(400).json({ error: "Cliente e descrição são obrigatórios." });
    }

    try {
      const cliente = await connection('clientes').where('id', clienteId).first();
      const tecnico = await connection('users').where('id', tecnicoId).first();

      if (!cliente) {
        return response.status(404).json({ error: "Cliente não encontrado." });
      }
      if (!tecnico) {
        return response.status(404).json({ error: "Técnico não encontrado." });
      }

      const dadosObservacao = {
        cliente_id: cliente.id,
        tecnico_id: tecnico.id,
        descricao: descricao,
        anexos: JSON.stringify(anexos || []),
      };

      const [observacaoSalva] = await connection('observacoes')
        .insert(dadosObservacao)
        .returning('*');

      const dadosRegistro = {
        evento: 'Registro de Observação',
        cliente: cliente.nome,
        ic_cliente: cliente.ic,
        descricao: descricao,
        anexos: JSON.stringify(anexos || []),
        data_evento: new Date(),
        nome_tecnico: tecnico.name,
        matricula_tecnico: tecnico.matricula
      };

      const [registroSalvo] = await connection('registros')
        .insert(dadosRegistro)
        .returning('*');

      if (registroSalvo && io) {
        io.to('gestors').emit('new_registro', registroSalvo);
      }
      
      const payload = {
        evento: 'registro',
        observacao: { id: observacaoSalva.id, descricao, anexos: anexos || [] },
        cliente: { id: cliente.id, nome: cliente.nome, ic: cliente.ic },
        tecnico: { id: tecnico.id, nome: tecnico.name, matricula: tecnico.matricula },
        timestamp: new Date().toISOString(),
      };

      await sendToWebhook(payload);

      return response.status(201).json(observacaoSalva);

    } catch (error) {
      console.error("Erro ao registrar observação:", error);
      const userMessage = error.message.includes("URL do Webhook não configurada")
        ? "A URL para envio de registros não está configurada pelo gestor."
        : "Erro interno ao processar o registro.";
      return response.status(500).json({ error: userMessage });
    }
  },

  async index(request, response) {
    try {
      const registros = await connection('registros')
        .orderBy('created_at', 'desc');
      
      return response.json(registros);

    } catch (error) {
      console.error("Erro ao buscar registros:", error);
      return response.status(500).json({ error: "Erro interno ao buscar registros." });
    }
  },

  async indexByTechnician(request, response) {
    const tecnico_id = request.user.id;

    try {
        const observacoes = await connection('observacoes')
            .select(
                'observacoes.id',
                'observacoes.descricao',
                'observacoes.anexos',
                'observacoes.created_at',
                'clientes.nome as cliente_nome'
            )
            .leftJoin('clientes', 'observacoes.cliente_id', 'clientes.id')
            .where('observacoes.tecnico_id', tecnico_id)
            .orderBy('observacoes.created_at', 'desc');

        // ==================== INÍCIO DA CORREÇÃO ====================
        const observacoesComAnexos = observacoes.map(obs => {
            let anexos = []; // Garante um valor padrão
            if (obs.anexos) { 
                if (typeof obs.anexos === 'string') {
                    // Se for string (vindo do SQLite), faz o parse.
                    try {
                        anexos = JSON.parse(obs.anexos);
                    } catch (e) {
                        console.error('Erro ao fazer parse dos anexos:', obs.anexos);
                        anexos = []; // Em caso de erro no parse, usa um array vazio.
                    }
                } else {
                    // Se não for string, já é um objeto/array (vindo do PostgreSQL).
                    anexos = obs.anexos;
                }
            }
            
            return {
                ...obs,
                anexos, // Substitui o campo 'anexos' original pelo array processado
                anexos_count: Array.isArray(anexos) ? anexos.length : 0
            };
        });
        // ===================== FIM DA CORREÇÃO ======================

        return response.json(observacoesComAnexos);
    } catch (error) {
        console.error("Erro ao buscar observações do técnico:", error);
        return response.status(500).json({ error: "Erro interno ao buscar observações." });
    }
  },

  async update(request, response) {
    const { id } = request.params;
    const { descricao, anexos } = request.body;
    const { id: userId, role: userRole } = request.user;
    const { io } = request;

    if (!descricao) {
      return response.status(400).json({ error: "A descrição é obrigatória." });
    }

    try {
      const observacao = await connection('observacoes').where({ id }).first();

      if (!observacao) {
        return response.status(404).json({ error: 'Observação não encontrada.' });
      }

      if (userRole === 'TECNICO' && observacao.tecnico_id !== userId) {
        return response.status(403).json({ error: 'Você não tem permissão para editar esta observação.' });
      }

      const dadosUpdate = {
        descricao,
        anexos: JSON.stringify(anexos || []),
      };

      const [observacaoAtualizada] = await connection('observacoes')
        .where({ id })
        .update(dadosUpdate)
        .returning('*');

      const cliente = await connection('clientes').where('id', observacaoAtualizada.cliente_id).first();
      const tecnico = await connection('users').where('id', observacaoAtualizada.tecnico_id).first();

      if (!cliente || !tecnico) {
         console.error("Erro de integridade de dados: Cliente ou Técnico não encontrado para a observação atualizada.");
         return response.status(500).json({ error: 'Erro ao encontrar dados associados à observação.' });
      }

      const dadosRegistro = {
        evento: 'Atualização de Observação',
        cliente: cliente.nome,
        ic_cliente: cliente.ic,
        descricao: observacaoAtualizada.descricao,
        anexos: observacaoAtualizada.anexos,
        data_evento: new Date(),
        nome_tecnico: tecnico.name,
        matricula_tecnico: tecnico.matricula
      };

      const [registroSalvo] = await connection('registros')
        .insert(dadosRegistro)
        .returning('*');

      if (registroSalvo && io) {
        io.to('gestors').emit('registro_atualizado', registroSalvo);
      }
      
      const payload = {
        evento: 'atualizacao',
        observacao: { id: observacaoAtualizada.id, descricao: observacaoAtualizada.descricao, anexos: JSON.parse(observacaoAtualizada.anexos) },
        cliente: { id: cliente.id, nome: cliente.nome, ic: cliente.ic },
        tecnico: { id: tecnico.id, nome: tecnico.name, matricula: tecnico.matricula },
        timestamp: new Date().toISOString(),
      };

      await sendToWebhook(payload);

      return response.status(200).json(observacaoAtualizada);

    } catch (error) {
      console.error("Erro ao atualizar observação:", error);
      const userMessage = error.message.includes("URL do Webhook não configurada")
        ? "A URL para envio de registros não está configurada pelo gestor."
        : "Erro interno ao processar a atualização.";
      return response.status(500).json({ error: userMessage });
    }
  },

  async delete(request, response) {
    const { id } = request.params;
    const user_id = request.user.id;
    const user_role = request.user.role;

    try {
        const observacao = await connection('observacoes').where({ id }).first();

        if (!observacao) {
            return response.status(404).json({ error: 'Observação não encontrada.' });
        }

        if (user_role !== 'GESTOR' && observacao.tecnico_id !== user_id) {
            return response.status(403).json({ error: 'Você não tem permissão para deletar esta observação.' });
        }

        await connection('observacoes').where({ id }).delete();

        request.io.emit('registro_deletado', { id });

        return response.status(204).send();
    } catch (error) {
        console.error("Erro ao deletar observação:", error);
        return response.status(500).json({ error: 'Erro interno ao deletar observação.' });
    }
  }
};