// MEU-APP-CHAMADOS-BACKEND/src/routes/users.routes.js

const { Router } = require('express');
const UsersController = require('../controllers/UsersController');
const authMiddleware = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
const ensureGestor = require('../middlewares/ensureGestor');

const usersRoutes = Router();

const ROLES = {
  GESTOR: 'GESTOR',
  OPERADOR: 'OPERADOR',
  TECNICO: 'TECNICO'
};

// Aplica a autenticação a TODAS as rotas de usuários.
usersRoutes.use(authMiddleware);

// ===================== NOVA ROTA PARA LISTAR TÉCNICOS =====================
// Acessível apenas para Gestores
usersRoutes.get(
  '/tecnicos',
  authorize([ROLES.GESTOR]),
  UsersController.getTecnicos
);
// ========================================================================

// Rota para listar todos os usuários (gerenciamento)
// ALTERADO: Agora permite que GESTOR e OPERADOR acessem a lista.
usersRoutes.get('/', authorize([ROLES.GESTOR, ROLES.OPERADOR]), UsersController.index);

// Rota para criar um usuário (Apenas Gestor)
usersRoutes.post('/', ensureGestor, UsersController.create);

// Rota para atualizar um usuário (Apenas Gestor)
usersRoutes.patch('/:id', ensureGestor, UsersController.update);

// Rota para deletar um usuário (Apenas Gestor)
usersRoutes.delete('/:id', ensureGestor, UsersController.delete);

// ===================== ALTERAÇÃO APLICADA AQUI =====================
// Rota para o usuário atualizar sua própria preferência de tema
// O caminho foi corrigido de '/theme/preference' para '/me/theme' para corresponder ao frontend.
usersRoutes.patch('/me/theme', UsersController.updateThemePreference);
// ===================================================================


module.exports = usersRoutes;