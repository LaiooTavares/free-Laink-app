// File: MEU-APP-CHAMADOS-BACKEND/src/controllers/LembretesController.js

const connection = require('../database/connection');

class LembretesController {
  async index(request, response) {
    const user_id = Number(request.user.id);
    const lembretes = await connection('lembretes')
      .where('user_id', user_id)
      .select('*');
    return response.json(lembretes);
  }

  async create(request, response) {
    try {
      const { text, priority, position_x, position_y } = request.body;
      const user_id = Number(request.user.id);

      const [lembrete] = await connection('lembretes')
        .insert({
          text,
          priority,
          user_id,
          position_x: position_x || 10,
          position_y: position_y || 10,
        })
        .returning('*');
      
      return response.status(201).json(lembrete);

    } catch (error) {
        console.error("Erro ao criar lembrete:", error);
        return response.status(500).json({ error: "Ocorreu um erro interno ao criar o lembrete." });
    }
  }

  async update(request, response) {
    const { id } = request.params;
    const { position_x, position_y } = request.body;
    const user_id = Number(request.user.id);

    const lembrete = await connection('lembretes').where('id', id).first();
    if (lembrete.user_id !== user_id) {
      return response.status(401).json({ error: 'Operação não permitida.' });
    }

    await connection('lembretes')
      .where('id', id)
      .update({ position_x, position_y });

    return response.status(200).send();
  }

  async delete(request, response) {
    const { id } = request.params;
    const user_id = Number(request.user.id);
    const lembrete = await connection('lembretes').where('id', id).first();

    if (!lembrete) {
      return response.status(404).json({ error: 'Lembrete não encontrado.' });
    }
    if (lembrete.user_id !== user_id) {
      return response.status(401).json({ error: 'Operação não permitida.' });
    }
    await connection('lembretes').where('id', id).delete();
    return response.status(204).send();
  }
}

module.exports = LembretesController;