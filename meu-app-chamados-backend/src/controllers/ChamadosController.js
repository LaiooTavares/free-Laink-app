// MEU-APP-CHAMADOS-BACKEND/src/controllers/ChamadosController.js
const connection = require('../database/connection');
const { sendToWebhook } = require('../services/WebhookService');
const { subDays } = require('date-fns');
const fs = require('fs'); // <-- ADICIONADO
const path = require('path'); // <-- ADICIONADO

const CHAMADO_EVENTS = {
  NEW: 'novo_chamado',
  UPDATE: 'chamado_atualizado',
  DELETE: 'chamado_deletado',
};
const CHAMADO_ROOMS = {
  TECNICOS: 'tecnicos',
  OPERADORS: 'operadors',
  GESTORS: 'gestors',
};

// ... (todas as outras funções permanecem iguais) ...
async function gerarProximaOS(tipoOS = 'chamado', trx) {
  const ano = new Date().getFullYear().toString().slice(-2);
  const chavePrefixo = `os_prefixo_${tipoOS}`;
  let configPrefixo = await trx('configuracoes').where('chave', chavePrefixo).first();
  const prefixo = configPrefixo ? configPrefixo.valor : (tipoOS === 'chamado' ? 'CH' : 'SV');
  let contador = await trx('contadores_os').where({ ano: ano, tipo: prefixo }).first();
  let proximoValor;
  if (contador) {
    proximoValor = contador.ultimo_valor + 1;
    await trx('contadores_os').where({ id: contador.id }).update({ ultimo_valor: proximoValor });
  } else {
    proximoValor = 1;
    await trx('contadores_os').insert({ ano: ano, tipo: prefixo, ultimo_valor: proximoValor });
  }
  const numeroFormatado = proximoValor.toString().padStart(5, '0');
  return `OS-${prefixo}${ano}${numeroFormatado}`;
}

const formatChamado = (chamado) => {
  if (!chamado) return null;
  const formatted = { ...chamado };
  const camposParaConverter = ['materiais', 'fotos', 'historico', 'aprRespostas', 'tags'];
  for (const campo of camposParaConverter) {
    const valorDefault = campo === 'aprRespostas' ? {} : [];
    const valorAtual = formatted[campo];
    if (typeof valorAtual === 'object' && valorAtual !== null) continue;
    if (typeof valorAtual === 'string' && (valorAtual.trim().startsWith('[') || valorAtual.trim().startsWith('{'))) {
      try {
        formatted[campo] = JSON.parse(valorAtual);
      } catch (e) {
        formatted[campo] = valorDefault;
      }
    } else {
      formatted[campo] = valorDefault;
    }
  }
  return formatted;
};

const getInitialStatus = (tipoServico, tecnicoId) => {
  const tiposDeChamadoUrgente = ['Chamado Urgente', 'Manutenção Corretiva', 'Parado', 'URGENTE: Cliente Preso', 'URGENTE: Falha Crítica', 'Ruído Anormal', 'Desnivelamento'];
  if (tiposDeChamadoUrgente.includes(tipoServico)) {
    return 'Aguardando na Fila';
  }
  return tecnicoId ? 'Atribuído ao Técnico' : 'Aguardando Atribuição';
};

const parseJsonArray = (data, fallback = []) => {
  if (Array.isArray(data)) return data;
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : fallback;
    } catch (e) {
      return fallback;
    }
  }
  return fallback;
};


module.exports = {
  // ... (todas as outras funções como index, show, create, etc. permanecem aqui) ...
  async index(request, response) {
    try {
      const chamados = await connection('chamados').select('*').orderBy('created_at', 'desc');
      return response.json(chamados.map(formatChamado));
    } catch (error) {
      return response.status(500).json({ error: "Erro ao buscar chamados." });
    }
  },

  async filaGestor(request, response) {
    try {
      const chamados = await connection('chamados')
        .leftJoin('users', 'chamados.tecnico_id', 'users.id')
        .whereNotIn('chamados.status', ['Finalizado', 'Cancelado'])
        .select('chamados.*', 'users.name as tecnico_nome')
        .orderBy('chamados.created_at', 'asc');
      return response.json(chamados.map(formatChamado));
    } catch (error) {
      return response.status(500).json({ error: "Erro ao buscar a fila de chamados." });
    }
  },

  async getHistorico(request, response) {
    try {
      const { tecnicoId, periodo } = request.query;
      let query = connection('chamados').leftJoin('users', 'chamados.tecnico_id', 'users.id').select('chamados.*', 'users.name as tecnico_nome');
      if (tecnicoId && tecnicoId !== 'todos') {
        query = query.where('chamados.tecnico_id', tecnicoId);
      }
      if (periodo && periodo !== 'sempre') {
        let dias;
        switch (periodo) {
          case 'semana': dias = 7; break;
          case '15dias': dias = 15; break;
          case '30dias': dias = 30; break;
          case '60dias': dias = 60; break;
          case '90dias': dias = 90; break;
          case '360dias': dias = 360; break;
          default: dias = null;
        }
        if (dias) {
          const dataInicio = subDays(new Date(), dias);
          query = query.where('chamados.created_at', '>=', dataInicio.toISOString());
        }
      }
      const chamados = await query.orderBy('chamados.created_at', 'desc');
      return response.json(chamados.map(formatChamado));
    } catch (error) {
      return response.status(500).json({ error: "Erro ao buscar histórico de chamados." });
    }
  },

  async show(request, response) {
    const { id } = request.params;
    try {
      const chamado = await connection('chamados').where('id', id).first();
      if (!chamado) {
        return response.status(404).json({ error: 'Chamado não encontrado.' });
      }
      return response.json(formatChamado(chamado));
    } catch (error) {
      return response.status(500).json({ error: "Erro ao buscar o chamado." });
    }
  },

  async getInProgressByUser(request, response) {
    try {
      const tecnico_id = request.user.id;
      if (!tecnico_id) {
        return response.status(401).json({ error: 'Usuário não autenticado.' });
      }
      const activeStatuses = ['Atribuído ao Técnico', 'Em Deslocamento', 'Em Andamento', 'Pausado', 'Aguardando Assinatura'];
      const activeChamado = await connection('chamados').where({ tecnico_id }).whereIn('status', activeStatuses).first();
      return response.json({ chamado: formatChamado(activeChamado), sla: null });
    } catch (error) {
      return response.status(500).json({ error: "Erro ao buscar chamado em andamento." });
    }
  },

  async update(request, response) {
    const { id } = request.params;
    let updateData = request.body;
    const { user, io } = request;
    try {
      const chamadoAposUpdate = await connection.transaction(async trx => {
        const chamadoAtual = await trx('chamados').where('id', id).first().forUpdate();
        if (!chamadoAtual) {
          throw new Error('Chamado não encontrado.');
        }
        if (updateData.status === 'Devolvido') {
          const { motivoDevolucao } = updateData;
          const historicoAtual = parseJsonArray(chamadoAtual.historico, []);
          const tecnicoName = user.name || `ID ${user.id}`;
          const novoHistorico = [...historicoAtual, { timestamp: new Date().toISOString(), texto: `Chamado devolvido por ${tecnicoName}. Motivo: ${motivoDevolucao || 'N/A'}` }];
          const dadosDevolucao = { status: 'Devolvido', tecnico_id: null, motivoDevolucao, inicio_deslocamento: null, inicio_atendimento: null, tempo_deslocamento: null, aprCompleta: false, aprRespostas: '[]', historico: JSON.stringify(novoHistorico) };
          const [updated] = await trx('chamados').where('id', id).update(dadosDevolucao).returning('*');
          return updated;
        }
        if (user.role === 'OPERADOR') {
          const statusNaoEditaveis = ['Em Andamento', 'Pausado', 'Finalizado', 'Cancelado', 'Em Deslocamento'];
          if (statusNaoEditaveis.includes(chamadoAtual.status)) {
            throw new Error('Ação não permitida. Chamado em atendimento.');
          }
        }
        if (updateData.inicio_deslocamento && !chamadoAtual.inicio_deslocamento) {
          updateData.status = 'Em Deslocamento';
        }
        if (updateData.inicio_atendimento && !chamadoAtual.inicio_atendimento) {
          updateData.status = 'Em Andamento';
        }
        for (const key in updateData) {
          if (Array.isArray(updateData[key]) || (typeof updateData[key] === 'object' && updateData[key] !== null)) {
            updateData[key] = JSON.stringify(updateData[key]);
          }
        }
        await trx('chamados').where('id', id).update(updateData);
        return trx('chamados').leftJoin('users', 'chamados.tecnico_id', 'users.id').select('chamados.*', 'users.name as tecnico_nome', 'users.matricula as tecnico_matricula').where('chamados.id', id).first();
      });
      const chamadoFormatado = formatChamado(chamadoAposUpdate);
      if (io && chamadoFormatado) {
        io.to(CHAMADO_ROOMS.TECNICOS).to(CHAMADO_ROOMS.OPERADORS).to(CHAMADO_ROOMS.GESTORS).emit(CHAMADO_EVENTS.UPDATE, chamadoFormatado);
        if (chamadoFormatado.tecnico_id) {
          io.to(`user-${chamadoFormatado.tecnico_id}`).emit(CHAMADO_EVENTS.UPDATE, chamadoFormatado);
        }
      }
      return response.status(200).json(chamadoFormatado);
    } catch (error) {
      return response.status(500).json({ error: error.message || "Erro ao atualizar chamado." });
    }
  },

  async create(request, response) {
    const { ic, descricao, tipoServico = 'Manutenção Corretiva', tecnico_id, prioridade, tags } = request.body;
    const { io } = request;
    if (!ic || !descricao) {
      return response.status(400).json({ error: 'IC e descrição são obrigatórios.' });
    }
    try {
      const chamadoFormatado = await connection.transaction(async trx => {
        const clienteInfo = await trx('clientes').where({ ic }).first();
        if (!clienteInfo) {
          throw new Error('Cliente não encontrado.');
        }
        const id = await gerarProximaOS('chamado', trx);
        const novoChamadoData = { id, cliente: clienteInfo.nome, ic: clienteInfo.ic, endereco: clienteInfo.endereco, localizacao: JSON.stringify(clienteInfo.localizacao), descricao, tipoServico, tecnico_id: tecnico_id || null, status: getInitialStatus(tipoServico, tecnico_id), prioridade, tags: JSON.stringify(tags || []), historico: JSON.stringify([{ timestamp: new Date().toISOString(), texto: `Chamado ${id} criado.` }]) };
        const [createdChamadoId] = await trx('chamados').insert(novoChamadoData).returning('id');
        const novoChamadoCompleto = await trx('chamados').where('id', createdChamadoId.id || id).first();
        return formatChamado(novoChamadoCompleto);
      });
      if (io) {
        io.to(CHAMADO_ROOMS.TECNICOS).to(CHAMADO_ROOMS.OPERADORS).to(CHAMADO_ROOMS.GESTORS).emit(CHAMADO_EVENTS.NEW, chamadoFormatado);
      }
      return response.status(201).json(chamadoFormatado);
    } catch (error) {
      return response.status(500).json({ error: error.message || "Falha ao criar o chamado." });
    }
  },

  async aceitar(request, response) {
    const { chamadoId } = request.body;
    const tecnico = request.user;
    const { io } = request;
    if (!chamadoId) {
      return response.status(400).json({ error: 'O ID do chamado é obrigatório.' });
    }
    try {
      const chamadoAtualizado = await connection.transaction(async trx => {
        const chamado = await trx('chamados').where('id', chamadoId).first().forUpdate();
        if (!chamado) {
          throw new Error('Chamado não encontrado.');
        }
        if (!['Aguardando na Fila', 'Devolvido'].includes(chamado.status)) {
          throw new Error('Este chamado não está mais disponível na fila.');
        }
        const historicoAtual = parseJsonArray(chamado.historico, []);
        const tecnicoName = tecnico.name || `ID ${tecnico.id}`;
        const novoHistorico = [...historicoAtual, { timestamp: new Date().toISOString(), texto: `Chamado aceito por ${tecnicoName}. Deslocamento iniciado.` }];
        const dadosUpdate = { tecnico_id: tecnico.id, status: 'Em Deslocamento', inicio_deslocamento: new Date(), historico: JSON.stringify(novoHistorico) };
        await trx('chamados').where('id', chamadoId).update(dadosUpdate);
        return trx('chamados').leftJoin('users', 'chamados.tecnico_id', 'users.id').select('chamados.*', 'users.name as tecnico_nome', 'users.matricula as tecnico_matricula').where('chamados.id', chamadoId).first();
      });
      const chamadoFormatado = formatChamado(chamadoAtualizado);
      if (io) {
        io.to(CHAMADO_ROOMS.TECNICOS).to(CHAMADO_ROOMS.OPERADORS).to(CHAMADO_ROOMS.GESTORS).emit(CHAMADO_EVENTS.UPDATE, chamadoFormatado);
      }
      return response.status(200).json(chamadoFormatado);
    } catch (error) {
      return response.status(500).json({ error: error.message || 'Erro interno ao tentar aceitar o chamado.' });
    }
  },

  async delete(request, response) {
    const { id } = request.params;
    const { user, io } = request;
    if (user.role !== 'OPERADOR') {
      return response.status(403).json({ error: 'Ação não permitida.' });
    }
    try {
      await connection.transaction(async trx => {
        const chamado = await trx('chamados').where('id', id).first();
        if (!chamado) {
          throw new Error('Chamado não encontrado.');
        }
        const statusNaoExcluiveis = ['Em Andamento', 'Pausado', 'Finalizado', 'Aguardando Assinatura', 'Em Deslocamento'];
        if (statusNaoExcluiveis.includes(chamado.status)) {
          throw new Error('Ação não permitida. Este chamado já está em atendimento.');
        }
        await trx('chamados').where({ id }).del();
      });
      if (io) {
        io.to(CHAMADO_ROOMS.TECNICOS).to(CHAMADO_ROOMS.OPERADORS).to(CHAMADO_ROOMS.GESTORS).emit(CHAMADO_EVENTS.DELETE, { id });
      }
      return response.status(204).send();
    } catch (error) {
      const status = error.message.includes('não encontrado') ? 404 : 403;
      return response.status(status).json({ error: error.message || 'Erro interno.' });
    }
  },
  
  // --- FUNÇÃO DE UPLOAD DE FOTOS ATUALIZADA ---
  async uploadFotos(request, response) {
    const { id } = request.params;
    const { files } = request;
    const { io } = request;

    if (!files || files.length === 0) {
      return response.status(400).json({ error: 'Nenhuma foto foi enviada.' });
    }

    try {
      const uploadsDir = path.join(__dirname, '..', '..', 'tmp', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const novasUrls = files.map(file => {
        const filename = `${id}-${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
        const filePath = path.join(uploadsDir, filename);
        fs.writeFileSync(filePath, file.buffer);
        return `/uploads/${filename}`;
      });

      const chamadoAtualizado = await connection.transaction(async trx => {
        const chamado = await trx('chamados').where('id', id).first();
        if (!chamado) {
          throw new Error('Chamado não encontrado.');
        }
        
        const fotosAtuais = parseJsonArray(chamado.fotos, []);
        const fotosAtualizadas = [...fotosAtuais, ...novasUrls];

        await trx('chamados').where('id', id).update({
          fotos: JSON.stringify(fotosAtualizadas),
        });

        return trx('chamados').where('id', id).first();
      });

      const chamadoFormatado = formatChamado(chamadoAtualizado);

      if (io) {
        io.to(CHAMADO_ROOMS.TECNICOS)
          .to(CHAMADO_ROOMS.OPERADORS)
          .to(CHAMADO_ROOMS.GESTORS)
          .emit(CHAMADO_EVENTS.UPDATE, chamadoFormatado);
      }

      return response.json(chamadoFormatado);

    } catch (error) {
      return response.status(500).json({ error: error.message || "Falha ao processar as fotos." });
    }
  },
};