// File: MEU-APP-CHAMADOS-BACKEND/src/controllers/SessionsController.js
const connection = require('../database/connection');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = {
  async create(request, response) {
    try {
      const { email, password } = request.body;
      
      // ✅ CONSULTA SIMPLIFICADA: Busca apenas na tabela 'users'.
      const user = await connection('users')
        .where('users.email', email)
        .first();

      if (!user) {
        return response.status(401).json({ error: 'Credenciais inválidas.' });
      }

      const passwordMatched = await bcrypt.compare(password, user.password);

      if (!passwordMatched) {
        return response.status(401).json({ error: 'Credenciais inválidas.' });
      }

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' } 
      );

      // Remove a senha do objeto de usuário antes de enviá-lo na resposta.
      delete user.password;
      
      return response.json({ user, token });

    } catch (error) {
      console.error('--- [ERRO NO LOGIN] ---', error);
      return response.status(500).json({ error: 'Ocorreu um erro interno no servidor.' });
    }
  }
};