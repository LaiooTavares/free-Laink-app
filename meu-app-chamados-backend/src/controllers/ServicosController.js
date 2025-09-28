// MEU-APP-CHAMADOS-BACKEND/src/controllers/ServicosController.js
const connection = require('../database/connection');
const { sendToWebhook } = require('../services/WebhookService');
const { subDays } = require('date-fns');
const R2StorageService = require('../services/R2StorageService');

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

async function gerarProximaOS(tipoOS = 'servico') {
  return connection.transaction(async (trx) => {
    const ano = new Date().getFullYear().toString().slice(-2);
    const chavePrefixo = `os_prefixo_${tipoOS}`;
    const configPrefixo = await trx('configuracoes').where('chave', chavePrefixo).first();
    const prefixo = configPrefixo ? configPrefixo.valor : (tipoOS === 'servico' ? 'SV' : 'CH');

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
  });
}

function formatServico(servico) {
  if (!servico) return null;

  const formatted = { ...servico, tipo: 'servico' };

  formatted.materiais = parseJsonArray(formatted.materiais, []);
  formatted.fotos = parseJsonArray(formatted.fotos, []);
  formatted.historico = parseJsonArray(formatted.historico, []);
  formatted.aprRespostas = parseJsonArray(formatted.aprRespostas, null);
  formatted.tags = parseJsonArray(formatted.tags, []);

  if (formatted.localizacao && typeof formatted.localizacao === 'string') {
    try {
      formatted.localizacao = JSON.parse(formatted.localizacao);
    } catch (e) {
      formatted.localizacao = null;
    }
  }

  return formatted;
};

const ServicosController = {

  async index(request, response) {
    const { page = 1, pageSize = 20 } = request.query;
    const { user } = request;

    try {
      let query = connection('servicos');

      if (user && user.role === 'TECNICO') {
        query.where('servicos.tecnico_id', user.id);
      }

      const servicos = await query
        .leftJoin('users', 'servicos.tecnico_id', 'users.id')
        .select('servicos.*', 'users.name as tecnico_name')
        .orderBy('servicos.created_at', 'desc')
        .limit(pageSize)
        .offset((page - 1) * pageSize);

      return response.json(servicos.map(formatServico));
    } catch (error) {
      console.error("Erro ao buscar serviços:", error);
      return response.status(500).json({ error: "Erro ao buscar serviços." });
    }
  },

  async filaGestor(request, response) {
    try {
      const servicos = await connection('servicos')
        .leftJoin('users', 'servicos.tecnico_id', 'users.id')
        .whereNotIn('servicos.status', ['Finalizado', 'Cancelado'])
        .select('servicos.*', 'users.name as tecnico_nome')
        .orderBy('servicos.created_at', 'asc');

      const servicosFormatados = servicos.map(formatServico);
      return response.json(servicosFormatados);
    } catch (error) {
      console.error("Erro ao buscar a fila de serviços para o gestor:", error);
      return response.status(500).json({ error: "Erro ao buscar a fila de serviços." });
    }
  },

  async getHistorico(request, response) {
    try {
      const { tecnicoId, periodo } = request.query;
      let query = connection('servicos').leftJoin('users', 'servicos.tecnico_id', 'users.id').select('servicos.*', 'users.name as tecnico_nome');

      if (tecnicoId && tecnicoId !== 'todos') {
        query = query.where('servicos.tecnico_id', tecnicoId);
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
          query = query.where('servicos.created_at', '>=', dataInicio.toISOString());
        }
      }

      const servicos = await query.orderBy('servicos.created_at', 'desc');
      const servicosFormatados = servicos.map(formatServico);
      return response.json(servicosFormatados);

    } catch (error) {
      return response.status(500).json({ error: "Erro ao buscar histórico de serviços." });
    }
  },

  async show(request, response) {
    const { id } = request.params;
    const { user } = request;
    try {
      const query = connection('servicos').leftJoin('users', 'servicos.tecnico_id', 'users.id').select('servicos.*', 'users.name as tecnico_name').where('servicos.id', id);

      if (user.role === 'TECNICO') {
        query.andWhere('servicos.tecnico_id', user.id);
      }
      const servico = await query.first();
      if (!servico) {
        return response.status(404).json({ error: 'Serviço não encontrado ou você não tem permissão para acessá-lo.' });
      }
      return response.json(formatServico(servico));
    } catch (error) {
      return response.status(500).json({ error: "Erro ao buscar o serviço." });
    }
  },

  async create(request, response) {
    const { ic, descricao, tipoServico, tags } = request.body;
    const { io } = request;
    try {
      const clienteInfo = await connection('clientes').where({ ic }).first();
      if (!clienteInfo) return response.status(404).json({ error: 'Cliente não encontrado.' });

      const id = await gerarProximaOS('servico');
      const novoServicoData = {
        id, cliente: clienteInfo.nome, ic: clienteInfo.ic,
        endereco: clienteInfo.endereco, localizacao: JSON.stringify(clienteInfo.localizacao),
        tags: tags ? JSON.stringify(tags.split(',').map(tag => tag.trim()).filter(Boolean)) : '[]',
        descricao, tipoServico, status: 'Aguardando Atribuição',
        historico: JSON.stringify([{ timestamp: new Date().toISOString(), texto: `Serviço ${id} criado.` }]),
      };
      const [createdServico] = await connection('servicos').insert(novoServicoData).returning('*');
      const servicoFormatado = formatServico(createdServico);
      if (io) io.to('operadors').to('gestors').emit('novo_servico', servicoFormatado);
      return response.status(201).json(servicoFormatado);
    } catch (error) {
      return response.status(500).json({ error: "Falha ao criar o serviço." });
    }
  },

  async update(request, response) {
    const { id } = request.params;
    const updateData = request.body;
    const { user, io } = request;

    try {
      const servicoAtualizado = await connection.transaction(async trx => {
        const servicoAtual = await trx('servicos').where({ id }).first();
        if (!servicoAtual) { throw new Error('Serviço não encontrado.'); }

        if (updateData.status === 'Devolvido') {
          const { motivoDevolucao } = updateData;
          const historicoAtual = parseJsonArray(servicoAtual.historico, []);
          const tecnicoName = user.name || `ID ${user.id}`;
          const novoHistorico = [...historicoAtual, { timestamp: new Date().toISOString(), texto: `Serviço devolvido por ${tecnicoName}. Motivo: ${motivoDevolucao || 'Não especificado'}` }];

          const dadosParaDevolucao = {
            status: 'Devolvido',
            tecnico_id: null,
            motivoDevolucao: motivoDevolucao || null,
            inicio_deslocamento: null,
            inicio_atendimento: null,
            inicio_apr: null,
            tempo_deslocamento: null,
            tempoDecorrido: null,
            aprCompleta: false,
            aprRespostas: '[]',
            historico: JSON.stringify(novoHistorico)
          };

          const [updated] = await trx('servicos').where('id', id).update(dadosParaDevolucao).returning('*');
          return updated;
        }

        const historicoAtual = parseJsonArray(servicoAtual.historico, []);
        const novoHistorico = [...historicoAtual];
        let historicoModificado = false;

        if (updateData.status === 'Pausado' && servicoAtual.status !== 'Pausado') {
          const agora = new Date();
          const inicio = new Date(servicoAtual.inicio_atendimento);
          const segundosTrabalhados = Math.floor((agora - inicio) / 1000);
          updateData.tempoDecorrido = (servicoAtual.tempoDecorrido || 0) + segundosTrabalhados;
          updateData.inicio_atendimento = null;
          novoHistorico.push({ timestamp: agora.toISOString(), texto: `Serviço pausado.` });
          historicoModificado = true;
        } else if (updateData.status === 'Em Andamento' && servicoAtual.status === 'Pausado') {
          updateData.inicio_atendimento = new Date().toISOString();
          novoHistorico.push({ timestamp: new Date().toISOString(), texto: `Serviço retomado.` });
          historicoModificado = true;
        } else if (updateData.inicio_deslocamento && !servicoAtual.inicio_deslocamento) {
          updateData.status = 'Em Deslocamento';
          novoHistorico.push({ timestamp: new Date().toISOString(), texto: `Técnico ${user.name} iniciou o deslocamento.` });
          historicoModificado = true;
        } else if (updateData.inicio_apr && !servicoAtual.inicio_apr) {
          updateData.status = 'Aguardando a APR';
          novoHistorico.push({ timestamp: new Date().toISOString(), texto: `Técnico chegou ao local e iniciou a APR.` });
          historicoModificado = true;
        } else if (updateData.aprCompleta !== undefined && servicoAtual.aprCompleta !== updateData.aprCompleta) {
          novoHistorico.push({ timestamp: new Date().toISOString(), texto: `APR preenchida.` });
          historicoModificado = true;
        } else if (updateData.inicio_atendimento && !servicoAtual.inicio_atendimento) {
          updateData.status = 'Em Andamento';
          novoHistorico.push({ timestamp: new Date().toISOString(), texto: `Execução do serviço iniciada.` });
          historicoModificado = true;
        } else if (updateData.tecnico_id && String(updateData.tecnico_id) !== String(servicoAtual.tecnico_id)) {
          const tecnicoInfo = await connection('users').where({ id: updateData.tecnico_id }).first();
          if (!tecnicoInfo) throw new Error('Técnico não encontrado.');
          updateData.status = 'Atribuído ao Técnico';
          novoHistorico.push({ timestamp: new Date().toISOString(), texto: `Serviço atribuído ao técnico ${tecnicoInfo.name} por ${user.name}.` });
          historicoModificado = true;
        }

        if (updateData.status === 'Finalizado' && !servicoAtual.fim_atendimento) {
          updateData.fim_atendimento = new Date().toISOString();
          if (!historicoAtual.some(h => h.texto.includes('finalizado'))) {
            novoHistorico.push({ timestamp: new Date().toISOString(), texto: `Serviço finalizado por ${user.name}.` });
            historicoModificado = true;
          }
        }

        if (historicoModificado) {
          updateData.historico = JSON.stringify(novoHistorico);
        }

        const camposJson = ['materiais', 'fotos', 'aprRespostas', 'tags', 'localizacao', 'historico'];
        for (const key of camposJson) {
          if (updateData[key] !== undefined && typeof updateData[key] !== 'string') {
            updateData[key] = JSON.stringify(updateData[key]);
          }
        }

        await trx('servicos').where({ id }).update(updateData);

        const finalServico = await trx('servicos').leftJoin('users', 'servicos.tecnico_id', 'users.id').select('servicos.*', 'users.name as tecnico_name', 'users.matricula as tecnico_matricula').where('servicos.id', id).first();
        return finalServico;
      });

      const servicoFormatado = formatServico(servicoAtualizado);
      if (io) {
        io.to('operadors').to('gestors').emit('servico_atualizado', servicoFormatado);
        if (servicoFormatado.tecnico_id) {
          io.to(`user-${servicoFormatado.tecnico_id}`).emit('servico_atualizado', servicoFormatado);
        }
      }
      return response.json(servicoFormatado);
    } catch (error) {
      console.error(`Erro ao atualizar serviço ${id}:`, error);
      return response.status(500).json({ error: error.message || 'Falha ao processar a atualização do serviço.' });
    }
  },

  async delete(request, response) {
    const { id } = request.params;
    const { io } = request;
    try {
      const servico = await connection('servicos').where('id', id).first();
      if (!servico) {
        return response.status(404).json({ error: 'Serviço não encontrado.' });
      }

      const statusNaoExcluiveis = ['Em Andamento', 'Pausado', 'Finalizado', 'Aguardando Assinatura', 'Em Deslocamento', 'Aguardando a APR'];
      if (statusNaoExcluiveis.includes(servico.status)) {
        return response.status(403).json({ error: 'Ação não permitida. Este serviço já está em atendimento.' });
      }

      await connection('servicos').where({ id }).del();
      if (io) {
        io.to('operadors').to('gestors').emit('servico_deletado', { id });
      }
      return response.status(204).send();
    } catch (error) {
      console.error(`Erro ao deletar serviço ${id}:`, error);
      return response.status(500).json({ error: 'Erro interno ao tentar deletar o serviço.' });
    }
  },

  async uploadFotos(request, response) {
    const { id } = request.params;
    const { io } = request;
    const files = request.files;

    if (!files || files.length === 0) {
      return response.status(400).json({ error: 'Nenhuma foto foi enviada.' });
    }

    try {
      const uploadPromises = files.map(file => R2StorageService.saveFile(file));
      const novasFotosUrl = await Promise.all(uploadPromises);

      const servicoAtualizado = await connection.transaction(async trx => {
        const servico = await trx('servicos').where('id', id).first();
        if (!servico) {
          throw new Error('Serviço não encontrado.');
        }

        const fotosAtuais = parseJsonArray(servico.fotos, []);
        const fotosCombinadas = [...fotosAtuais, ...novasFotosUrl];

        await trx('servicos').where('id', id).update({ fotos: JSON.stringify(fotosCombinadas) });

        return trx('servicos').where('id', id).first();
      });

      const servicoFormatado = formatServico(servicoAtualizado);

      if (io) {
        io.to('tecnicos').to('operadors').to('gestors').emit('servico_atualizado', servicoFormatado);
      }

      return response.status(200).json(servicoFormatado);

    } catch (error) {
      console.error(`Erro ao fazer upload de fotos para o serviço ${id}:`, error);
      return response.status(500).json({ error: error.message || 'Erro interno ao processar upload.' });
    }
  },
};

module.exports = ServicosController;