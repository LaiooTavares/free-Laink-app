const connection = require('../database/connection');
// O WebhookService não é usado neste arquivo, então a linha foi removida para limpeza.

// Função auxiliar para registrar no histórico de estoque
async function registrarHistorico(trx, dados) {
  return trx('historico_estoque').insert(dados);
}

// Função genérica para lidar com 'chamados' ou 'servicos'
async function adicionarMaterialAoTrabalho(trx, trabalhoId, tableName, material, quantidadeUtilizada, tecnicoNome) {
    const trabalho = await trx(tableName).where('id', trabalhoId).first();
    if (!trabalho) {
        throw new Error(`Ordem de Serviço com ID ${trabalhoId} não encontrada.`);
    }

    const materiaisAtuais = Array.isArray(trabalho.materiais) ? trabalho.materiais : JSON.parse(trabalho.materiais || '[]');
    const novoHistorico = Array.isArray(trabalho.historico) ? trabalho.historico : JSON.parse(trabalho.historico || '[]');
    
    novoHistorico.push({
        timestamp: new Date().toISOString(),
        texto: `Material utilizado por ${tecnicoNome}: ${quantidadeUtilizada}x ${material.nome}`
    });

    const novosDados = {
        materiais: JSON.stringify([...materiaisAtuais, { nome: material.nome, quantidade: quantidadeUtilizada, id: material.id, codigo: material.codigo }]),
        historico: JSON.stringify(novoHistorico)
    };

    await trx(tableName).where('id', trabalhoId).update(novosDados);
}

class MateriaisController {
  async index(request, response) {
    try {
      const tecnico_id = request.user.id;
      const materiais = await connection('materiais').where({ tecnico_id }).select('*').orderBy('nome', 'asc');
      return response.json(materiais);
    } catch (error) {
      console.error("Erro ao buscar materiais:", error);
      return response.status(500).json({ error: "Erro interno ao buscar materiais do estoque." });
    }
  }

  async utilizar(request, response) {
    // <<< ALTERAÇÃO 1: Recebendo 'osId' e 'tipo' explicitamente >>>
    const { osId, tipo, materialId, quantidadeUtilizada } = request.body;
    const { id: tecnico_id, name: tecnicoNome } = request.user;
    
    if (!osId || !tipo || !materialId || !quantidadeUtilizada || quantidadeUtilizada <= 0) {
      return response.status(400).json({ error: 'Dados insuficientes para utilizar o material.' });
    }

    const trx = await connection.transaction();
    try {
      const material = await trx('materiais').where({ id: materialId, tecnico_id }).forUpdate().first();

      if (!material) {
        await trx.rollback();
        return response.status(404).json({ error: 'Material não encontrado no seu estoque.' });
      }
      
      const quantidadeNumerica = Number(quantidadeUtilizada);
      if (material.quantidade < quantidadeNumerica) {
        await trx.rollback();
        return response.status(400).json({ error: `Quantidade insuficiente. Disponível: ${material.quantidade}.` });
      }

      // <<< ALTERAÇÃO 2: Lógica de "adivinhação" removida. Agora usamos o 'tipo' >>>
      let tableName;
      if (tipo === 'servico') {
        tableName = 'servicos';
      } else if (tipo === 'chamado') {
        tableName = 'chamados';
      } else {
        await trx.rollback();
        return response.status(400).json({ error: 'Tipo de Ordem de Serviço inválido ou não fornecido.' });
      }

      const saldoAnterior = material.quantidade;
      const saldoNovo = saldoAnterior - quantidadeNumerica;

      await adicionarMaterialAoTrabalho(trx, osId, tableName, material, quantidadeNumerica, tecnicoNome);
      
      await registrarHistorico(trx, {
        tecnico_id: tecnico_id,
        material_id: material.id,
        tipo_movimentacao: 'USO_EM_CHAMADO', // Pode ser melhorado para 'USO_EM_OS'
        quantidade_alteracao: -quantidadeNumerica,
        saldo_anterior: saldoAnterior,
        saldo_novo: saldoNovo,
        referencia: `OS ID: ${osId}`,
        responsavel: `Técnico: ${tecnicoNome}`
      });
      
      if (saldoNovo === 0) {
        await trx('materiais').where({ id: material.id }).del();
      } else {
        await trx('materiais').where({ id: material.id }).decrement('quantidade', quantidadeNumerica);
      }
      
      await trx.commit();

      const trabalhoAtualizado = await connection(tableName).where('id', osId).first();
      if (request.io) {
          const formattedTrabalho = { ...trabalhoAtualizado, tipo: tipo };
          const eventoSocket = `${tipo}_atualizado`;

          // Emite para todos os gestores/operadores
          request.io.to('operadors').to('gestors').emit(eventoSocket, formattedTrabalho);
          // Emite para o técnico que fez a ação
          const personalRoom = `user-${tecnico_id}`;
          request.io.to(personalRoom).emit(eventoSocket, formattedTrabalho);
          
          request.io.to(personalRoom).emit('estoque_atualizado', { updatedCodes: [material.codigo] });
      }
      return response.status(200).json(trabalhoAtualizado);
    } catch (error) {
      await trx.rollback();
      console.error("Erro ao utilizar material:", error);
      const userMessage = error.message.includes("não encontrada") 
        ? error.message
        : "Erro interno ao processar a utilização do material.";
      return response.status(500).json({ error: userMessage });
    }
  }

  // O restante das funções (transferir, historico) permanecem inalteradas...
  async transferir(request, response) { const { materialId, quantidade, matriculaDestino } = request.body; const { id: tecnicoOrigemId, name: tecnicoNome, matricula: tecnicoMatricula } = request.user; const { io } = request; if (!materialId || !quantidade || !matriculaDestino || quantidade <= 0) { return response.status(400).json({ error: 'Dados insuficientes para a transferência.' }); } if (matriculaDestino.trim() === '0000') { const { WEBHOOK_SECRET } = process.env; if (!WEBHOOK_SECRET) { console.error("ERRO: Segredo do Webhook (WEBHOOK_SECRET) não configurado no .env"); return response.status(500).json({ error: "Serviço de devolução indisponível." }); } const trx = await connection.transaction(); try { const material = await trx('materiais').where({ id: materialId, tecnico_id: tecnicoOrigemId }).forUpdate().first(); if (!material) { await trx.rollback(); return response.status(404).json({ error: 'Material não encontrado no seu estoque.' }); } const quantidadeNumerica = Number(quantidade); if (material.quantidade < quantidadeNumerica) { await trx.rollback(); return response.status(400).json({ error: `Quantidade inválida. Disponível: ${material.quantidade}.` }); } const { sendToWebhook } = require('../services/WebhookService'); const webhookPayload = { evento: 'estoque', matricula_tecnico: tecnicoMatricula, materiais: [{ codigo: material.codigo, nome: material.nome, descricao: material.descricao, tipo: material.tipo, quantidade: -quantidadeNumerica }] }; await sendToWebhook(webhookPayload, { 'x-webhook-secret': WEBHOOK_SECRET }); const saldoAnterior = material.quantidade; const saldoNovo = saldoAnterior - quantidadeNumerica; await registrarHistorico(trx, { tecnico_id: tecnicoOrigemId, material_id: material.id, tipo_movimentacao: 'DEVOLUCAO_ESTOQUE', quantidade_alteracao: -quantidadeNumerica, saldo_anterior: saldoAnterior, saldo_novo: saldoNovo, referencia: 'Para Estoque Central', responsavel: `Técnico: ${tecnicoNome}` }); if (saldoNovo === 0) { await trx('materiais').where({ id: material.id }).del(); } else { await trx('materiais').where({ id: material.id }).decrement('quantidade', quantidadeNumerica); } await trx.commit(); if (io) { const personalRoom = `user-${tecnicoOrigemId}`; io.to(personalRoom).emit('estoque_atualizado', { updatedCodes: [material.codigo] }); } return response.status(200).json({ message: 'Material devolvido ao estoque central com sucesso.' }); } catch (error) { await trx.rollback(); console.error("Erro ao devolver material:", error.message); const userMessage = error.message.includes("URL do Webhook não configurada") ? "A URL para devolução não está configurada pelo gestor." : "Erro interno ao processar a devolução."; return response.status(500).json({ error: userMessage }); } } else { const trx = await connection.transaction(); try { const tecnicoOrigem = await trx('users').where({ id: tecnicoOrigemId }).first(); if (!tecnicoOrigem) { await trx.rollback(); return response.status(404).json({ error: 'Usuário de origem não encontrado.' }); } const tecnicoDestino = await trx('users').where({ matricula: matriculaDestino }).first(); if (!tecnicoDestino) { await trx.rollback(); return response.status(404).json({ error: `Técnico de destino com matrícula ${matriculaDestino} não encontrado.` }); } if (tecnicoDestino.id === tecnicoOrigemId) { await trx.rollback(); return response.status(400).json({ error: 'Não é possível transferir material para si mesmo.' }); } const materialOrigem = await trx('materiais').where({ id: materialId, tecnico_id: tecnicoOrigemId }).forUpdate().first(); if (!materialOrigem) { await trx.rollback(); return response.status(404).json({ error: 'Material não encontrado no seu estoque.' }); } const quantidadeNumerica = Number(quantidade); if (materialOrigem.quantidade < quantidadeNumerica) { await trx.rollback(); return response.status(400).json({ error: `Quantidade insuficiente. Disponível: ${materialOrigem.quantidade}.` }); } const saldoAnteriorOrigem = materialOrigem.quantidade; const saldoNovoOrigem = saldoAnteriorOrigem - quantidadeNumerica; await registrarHistorico(trx, { tecnico_id: tecnicoOrigemId, material_id: materialOrigem.id, tipo_movimentacao: 'TRANSFERENCIA_ENVIADA', quantidade_alteracao: -quantidadeNumerica, saldo_anterior: saldoAnteriorOrigem, saldo_novo: saldoNovoOrigem, referencia: `Para Matrícula: ${tecnicoDestino.matricula}`, responsavel: `Técnico: ${tecnicoOrigem.name}` }); if (saldoNovoOrigem === 0) { await trx('materiais').where({ id: materialId, tecnico_id: tecnicoOrigemId }).del(); } else { await trx('materiais').where({ id: materialId, tecnico_id: tecnicoOrigemId }).decrement('quantidade', quantidadeNumerica); } const materialDestinoExistente = await trx('materiais').where({ codigo: materialOrigem.codigo, tecnico_id: tecnicoDestino.id }).forUpdate().first(); let materialDestinoAtualizado; let saldoAnteriorDestino = 0; if (materialDestinoExistente) { saldoAnteriorDestino = Number(materialDestinoExistente.quantidade); const saldoNovoDestino = saldoAnteriorDestino + quantidadeNumerica; [materialDestinoAtualizado] = await trx('materiais').where({ id: materialDestinoExistente.id }).update({ quantidade: saldoNovoDestino }).returning('*'); } else { const materialParaDestino = { codigo: materialOrigem.codigo, nome: materialOrigem.nome, descricao: materialOrigem.descricao, quantidade: quantidadeNumerica, tipo: materialOrigem.tipo, tecnico_id: tecnicoDestino.id }; [materialDestinoAtualizado] = await trx('materiais').insert(materialParaDestino).returning('*'); } await registrarHistorico(trx, { tecnico_id: tecnicoDestino.id, material_id: materialDestinoAtualizado.id, tipo_movimentacao: 'TRANSFERENCIA_RECEBIDA', quantidade_alteracao: quantidadeNumerica, saldo_anterior: saldoAnteriorDestino, saldo_novo: materialDestinoAtualizado.quantidade, referencia: `De Matrícula: ${tecnicoOrigem.matricula}`, responsavel: `Técnico: ${tecnicoOrigem.name}` }); await trx.commit(); if (io) { const origemRoom = `user-${tecnicoOrigem.id}`; const destinoRoom = `user-${tecnicoDestino.id}`; const payload = { updatedCodes: [materialOrigem.codigo] }; io.to(origemRoom).emit('estoque_atualizado', payload); io.to(destinoRoom).emit('estoque_atualizado', payload); } return response.status(200).json({ message: 'Material transferido com sucesso.' }); } catch (error) { await trx.rollback(); console.error("Erro ao transferir material:", error); return response.status(500).json({ error: "Erro interno ao processar a transferência." }); } } }
  async historico(request, response) { try { const tecnico_id = request.user.id; const historico = await connection('historico_estoque as he') .join('materiais as m', 'he.material_id', 'm.id') .where('he.tecnico_id', tecnico_id) .select( 'he.*', 'm.nome as material_nome', 'm.codigo as material_codigo' ) .orderBy('he.created_at', 'desc'); return response.json(historico); } catch (error) { console.error("Erro ao buscar histórico de estoque:", error); return response.status(500).json({ error: "Erro interno ao buscar histórico de estoque." }); } }
}

module.exports = MateriaisController;