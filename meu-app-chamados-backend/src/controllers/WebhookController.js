// File: MEU-APP-CHAMADOS-BACKEND/src/controllers/WebhookController.js

const connection = require('../database/connection');

// Função auxiliar para registrar no histórico de estoque
async function registrarHistorico(trx, dados) {
  return trx('historico_estoque').insert(dados);
}

class WebhookController {
  // MÉTODO PARA RECEBER REGISTROS
  async handleRegistro(request, response) {
    const { 'x-webhook-secret': secret } = request.headers;
    const { WEBHOOK_SECRET } = process.env;
    if (!WEBHOOK_SECRET || secret !== WEBHOOK_SECRET) {
      return response.status(401).json({ error: 'Acesso não autorizado.' });
    }

    const {
      evento,
      cliente,
      'ic-cliente': ic_cliente,
      descricao,
      anexos,
      'data-evento': data_evento,
      'nome-tecnico': nome_tecnico,
      'matricula-tecnico': matricula_tecnico,
    } = request.body;
    
    if (!evento || !data_evento) {
      return response.status(400).json({ error: 'Os campos "evento" e "data-evento" são obrigatórios.' });
    }

    const { io } = request;

    try {
      const [novoRegistro] = await connection('registros').insert({
        evento,
        cliente,
        ic_cliente,
        descricao,
        anexos: anexos ? JSON.stringify(anexos) : null,
        data_evento,
        nome_tecnico,
        matricula_tecnico,
      }).returning('*');
      
      // DIAGNÓSTICO: Log para confirmar que o registro foi inserido e temos um ID.
      console.log(`[WebhookController] Registro inserido no banco com sucesso. ID: ${novoRegistro.id}`);

      if (io) {
        io.to('GESTORs').emit('novo_registro', novoRegistro);
        console.log(`[Webhook] Novo registro recebido e emitido para a sala GESTORs: ${evento}`);
      }

      return response.status(201).json({ message: 'Registro criado com sucesso.' });

    } catch (error) {
      console.error("Erro no webhook de registros:", error);
      return response.status(500).json({ error: 'Erro interno ao processar webhook de registro.' });
    }
  }

  // --- SEU CÓDIGO DE ESTOQUE EXISTENTE (INTOCADO) ---
  async atualizarEstoque(request, response) {
    if (!request.body || Object.keys(request.body).length === 0) {
      return response.status(400).json({ error: 'Corpo da requisição (body) ausente ou vazio.' });
    }
    const { 'x-webhook-secret': secret } = request.headers;
    const { WEBHOOK_SECRET } = process.env;
    const { io } = request;
    if (!WEBHOOK_SECRET || secret !== WEBHOOK_SECRET) {
      return response.status(401).json({ error: 'Acesso não autorizado.' });
    }
    const { matricula_tecnico, materiais } = request.body;
    if (!matricula_tecnico) {
      return response.status(400).json({ error: 'A "matricula_tecnico" é obrigatória.' });
    }
    if (!materiais || !Array.isArray(materiais)) {
      return response.status(400).json({ error: 'Formato de dados inválido.' });
    }
    
    const trx = await connection.transaction();
    try {
      const tecnico = await trx('users').where({ matricula: matricula_tecnico }).first();
      if (!tecnico) {
        await trx.rollback();
        return response.status(404).json({ error: `Técnico com matrícula "${matricula_tecnico}" não encontrado.` });
      }

      const updatedCodes = materiais.map(material => material.codigo);

      for (const material of materiais) {
        const quantidadeMovimentada = Number(material.quantidade);
        if (isNaN(quantidadeMovimentada)) {
            await trx.rollback();
            return response.status(400).json({ error: `Quantidade inválida para o material "${material.codigo}".` });
        }
        const materialExistente = await trx('materiais').where({ codigo: material.codigo, tecnico_id: tecnico.id }).forUpdate().first();
        const saldoAnterior = materialExistente ? Number(materialExistente.quantidade) : 0;
        const novoSaldo = saldoAnterior + quantidadeMovimentada;

        if (novoSaldo < 0) {
            await trx.rollback();
            return response.status(400).json({ error: `Estoque não pode ficar negativo para o material "${material.nome}".` });
        }
        
        let materialIdParaHistorico = materialExistente ? materialExistente.id : null;
        
        if (!materialExistente && novoSaldo > 0) {
            const [mat] = await trx('materiais').insert({ 
                codigo: material.codigo, 
                nome: material.nome, 
                descricao: material.descricao, 
                quantidade: 0,
                tipo: material.tipo, 
                tecnico_id: tecnico.id 
            }).returning('*');
            materialIdParaHistorico = mat.id;
        }
        
        if (quantidadeMovimentada !== 0) {
            await registrarHistorico(trx, { 
                tecnico_id: tecnico.id, 
                material_id: materialIdParaHistorico, 
                tipo_movimentacao: quantidadeMovimentada >= 0 ? 'ENTRADA_EXTERNA' : 'SAIDA_EXTERNA', 
                quantidade_alteracao: quantidadeMovimentada, 
                saldo_anterior: saldoAnterior, 
                saldo_novo: novoSaldo, 
                responsavel: 'Estoque Central' 
            });
        }

        if (novoSaldo === 0 && materialExistente) {
            await trx('materiais').where({ id: materialExistente.id }).del();
        } else if (materialExistente) {
            await trx('materiais').where({ id: materialExistente.id }).update({ quantidade: novoSaldo, nome: material.nome, descricao: material.descricao, tipo: material.tipo });
        } else if (novoSaldo > 0) {
            await trx('materiais').where({ id: materialIdParaHistorico }).update({ quantidade: novoSaldo });
        }
      }

      await trx.commit();
      
      if (io) {
        const personalRoom = `user-${tecnico.id}`;
        io.to(personalRoom).emit('estoque_atualizado', { updatedCodes });
      }
      
      console.log(`[Webhook] Estoque do técnico ${tecnico.name} (matrícula: ${matricula_tecnico}) atualizado.`);
      return response.status(200).json({ message: `Estoque do técnico ${tecnico.name} atualizado.` });
    } catch (error) {
      await trx.rollback();
      console.error("Erro no webhook de estoque:", error);
      return response.status(500).json({ error: 'Erro interno ao processar webhook.' });
    }
  }

  async retirarEstoque(request, response) {
    if (!request.body || Object.keys(request.body).length === 0) {
      return response.status(400).json({ error: 'Corpo da requisição (body) ausente ou vazio.' });
    }
    const { 'x-webhook-secret': secret } = request.headers;
    const { WEBHOOK_SECRET } = process.env;
    const { io } = request;
    if (!WEBHOOK_SECRET || secret !== WEBHOOK_SECRET) {
      return response.status(401).json({ error: 'Acesso não autorizado.' });
    }
    const { matricula_tecnico, codigo_material, quantidade_a_remover } = request.body;
    if (!matricula_tecnico || !codigo_material || !quantidade_a_remover || quantidade_a_remover <= 0) {
      return response.status(400).json({ error: 'Os campos "matricula_tecnico", "codigo_material" e "quantidade_a_remover" são obrigatórios.' });
    }

    const trx = await connection.transaction();
    try {
      const tecnico = await trx('users').where({ matricula: matricula_tecnico }).first();
      if (!tecnico) {
        await trx.rollback();
        return response.status(404).json({ error: `Técnico com a matrícula "${matricula_tecnico}" não foi encontrado.` });
      }
      const material = await trx('materiais').where({ tecnico_id: tecnico.id, codigo: codigo_material }).forUpdate().first();
      if (!material) {
        await trx.rollback();
        return response.status(404).json({ error: `Material com código "${codigo_material}" não encontrado no estoque do técnico.` });
      }
      if (material.quantidade < quantidade_a_remover) {
        await trx.rollback();
        return response.status(400).json({ error: `Quantidade insuficiente para retirada. Disponível: ${material.quantidade}.` });
      }
      const saldoAnterior = material.quantidade;
      const saldoNovo = saldoAnterior - quantidade_a_remover;

      await registrarHistorico(trx, {
        tecnico_id: tecnico.id,
        material_id: material.id,
        tipo_movimentacao: 'SAIDA_EXTERNA',
        quantidade_alteracao: -quantidade_a_remover,
        saldo_anterior: saldoAnterior,
        saldo_novo: saldoNovo,
        responsavel: 'Estoque Central',
      });

      if (saldoNovo === 0) {
        await trx('materiais').where({ id: material.id }).del();
      } else {
        await trx('materiais').where({ id: material.id }).decrement('quantidade', quantidade_a_remover);
      }
      
      await trx.commit();

      if (io) {
        const personalRoom = `user-${tecnico.id}`;
        io.to(personalRoom).emit('estoque_atualizado', { updatedCodes: [codigo_material] });
      }
      
      console.log(`[Webhook] Retirado ${quantidade_a_remover}x '${codigo_material}' do estoque do técnico ${tecnico.name}.`);
      return response.status(200).json({ message: 'Retirada de material do estoque realizada com sucesso.' });
    } catch (error) {
      await trx.rollback();
      console.error("Erro no webhook de retirada de material:", error);
      return response.status(500).json({ error: 'Erro interno ao processar a retirada de material.' });
    }
  }
}

module.exports = WebhookController;
