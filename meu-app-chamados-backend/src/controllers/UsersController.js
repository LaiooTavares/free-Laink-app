// FILE: MEU-APP-CHAMADOS-BACKEND/src/controllers/UsersController.js
const connection = require('../database/connection');
const bcrypt = require('bcryptjs');

// Função auxiliar para parsear o JSON de cores, caso seja necessário
const parseCores = (cores) => {
  if (typeof cores === 'string') {
    try { return JSON.parse(cores); } catch (e) { return null; }
  }
  return cores;
};

module.exports = {
  async index(request, response) {
    try {
      const users = await connection('users')
        .whereNot('role', 'TI')
        .andWhereNot('id', 1)
        .select(
          'id',
          'name',
          'email',
          'role',
          'matricula'
        );
      return response.status(200).json(users);
    } catch (error) {
      console.error("Erro no servidor ao buscar utilizadores:", error);
      return response.status(500).json({ error: "Ocorreu um erro interno ao listar os utilizadores." });
    }
  },

  async getTecnicos(request, response) {
    try {
      const tecnicos = await connection('users')
        .where('role', 'TECNICO')
        .select('id', 'name')
        .orderBy('name', 'asc');
      return response.status(200).json(tecnicos);
    } catch (error) {
      console.error("Erro ao buscar técnicos:", error);
      return response.status(500).json({ error: "Ocorreu um erro interno ao listar os técnicos." });
    }
  },
  
  async create(request, response) {
    try {
      const { name, email, password, role, matricula } = request.body;
      if (!name || !email || !password || !role) {
        return response.status(400).json({ error: "Nome, email, senha e função são obrigatórios." });
      }

      const allowedRoles = ['GESTOR', 'OPERADOR', 'TECNICO', 'TI'];
      if (!allowedRoles.includes(role.toUpperCase())) {
        return response.status(400).json({ error: `Função '${role}' inválida.` });
      }
      
      const hashedPassword = await bcrypt.hash(password, 8);
      
      const createdUser = await connection('users')
        .insert({
          name,
          email,
          password: hashedPassword,
          role: role.toUpperCase(),
          matricula
        })
        .returning(['id', 'name', 'email', 'role']);

      return response.status(201).json(createdUser[0]);

    } catch (error) {
      console.error("Erro no servidor ao criar utilizador:", error);
      if (error.code === '23505' || (error.code === 'SQLITE_CONSTRAINT' && error.message.includes('UNIQUE'))) {
        return response.status(409).json({ error: "O e-mail ou matrícula fornecido já está em uso." });
      }
      return response.status(500).json({ error: "Ocorreu um erro interno ao criar o utilizador." });
    }
  },

  async update(request, response) {
    try {
      const { id } = request.params;
      const { name, email, role, matricula } = request.body;
      const user = await connection('users').where({ id }).first();
      if (!user) {
        return response.status(404).json({ error: 'Utilizador não encontrado.' });
      }
      await connection('users').where({ id }).update({
        name,
        email,
        role,
        matricula,
        updated_at: connection.fn.now()
      });
      return response.status(200).json({ message: 'Utilizador atualizado com sucesso!' });
    } catch (error) {
      console.error("Erro no servidor ao atualizar utilizador:", error);
      if (error.code === '23505' || (error.code === 'SQLITE_CONSTRAINT' && error.message.includes('UNIQUE'))) {
        return response.status(409).json({ error: "O e-mail ou matrícula fornecido já está em uso por outro utilizador." });
      }
      return response.status(500).json({ error: 'Ocorreu um erro interno ao atualizar o utilizador.' });
    }
  },

  async delete(request, response) {
    try {
      const { id } = request.params;
      const loggedUserId = request.user.id;

      if (Number(id) === 1) {
        return response.status(403).json({ error: 'Ação não permitida. O gestor mestre não pode ser excluído.' });
      }

      if (Number(id) === Number(loggedUserId)) {
        return response.status(403).json({ error: 'Ação não permitida. Você não pode excluir seu próprio utilizador.' });
      }
      
      const user = await connection('users').where({ id }).first();
      if (!user) {
        return response.status(404).json({ error: 'Utilizador não encontrado.' });
      }

      if (user.role === 'TI') {
        return response.status(403).json({ error: 'Ação não permitida. O utilizador de TI não pode ser excluído.' });
      }

      await connection('users').where({ id }).delete();

      return response.status(204).send(); 
    } catch (error) {
      console.error("Erro no servidor ao deletar utilizador:", error);
      return response.status(500).json({ error: 'Ocorreu um erro interno ao deletar o utilizador.' });
    }
  },
  
  async updateThemePreference(request, response) {
    try {
      const { id: userId } = request.user;
      const { temaId } = request.body; // temaId pode ser um número ou null

      if (temaId) {
        const tema = await connection('temas').where({ id: temaId }).first();
        if (!tema) {
          return response.status(404).json({ error: 'Tema não encontrado.' });
        }
      }

      await connection('users').where({ id: userId }).update({ tema_id: temaId });

      // <<-- ALTERAÇÃO AQUI: A consulta ao banco foi corrigida -->>
      const updatedUser = await connection('users')
        .leftJoin('temas', 'users.tema_id', 'temas.id')
        .where('users.id', userId)
        .select(
          'users.*', 
          'temas.id as tema_id_ref', 
          'temas.nome as tema_nome', 
          'temas.key as tema_key', // 1. Buscando a 'key' do tema
          'temas.cores as tema_cores',
          'temas.logo_url as tema_logo_url',
          'temas.favicon_url as tema_favicon_url'
        )
        .first();
      
      // <<-- ALTERAÇÃO AQUI: A reconstrução do objeto foi corrigida -->>
      const temaDoUsuario = updatedUser.tema_id_ref ? {
        id: updatedUser.tema_id_ref,
        nome: updatedUser.tema_nome,
        key: updatedUser.tema_key, // 2. Adicionando a 'key' ao objeto do tema
        cores: parseCores(updatedUser.tema_cores),
        logo_url: updatedUser.tema_logo_url, // 3. Usando a URL correta vinda da tabela 'temas'
        favicon_url: updatedUser.tema_favicon_url // 4. Usando a URL correta vinda da tabela 'temas'
      } : null;

      delete updatedUser.password;
      delete updatedUser.tema_id_ref;
      delete updatedUser.tema_nome;
      delete updatedUser.tema_key; // 5. Limpando a propriedade redundante do objeto principal
      delete updatedUser.tema_cores;
      delete updatedUser.tema_logo_url;
      delete updatedUser.tema_favicon_url;
      
      updatedUser.tema = temaDoUsuario;

      return response.status(200).json({ user: updatedUser });

    } catch (error) {
      console.error("Erro ao atualizar preferência de tema:", error);
      return response.status(500).json({ error: 'Ocorreu um erro interno.' });
    }
  }
};
