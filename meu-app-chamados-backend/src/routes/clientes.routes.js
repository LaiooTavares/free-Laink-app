// MEU-APP-CHAMADOS-BACKEND/src/routes/clientes.routes.js (CORRIGIDO)
const { Router } = require('express');
const ClientesController = require('../controllers/ClientesController');
// Importações para proteger as rotas
const authMiddleware = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');

const clientesRoutes = Router();

// Rota para listar clientes (acessível a todos os usuários logados)
clientesRoutes.get('/', authMiddleware, ClientesController.index);

// Rota para criar um novo cliente (apenas para gestores)
clientesRoutes.post(
  '/',
  authMiddleware,
  authorize(['GESTOR']), // Proteção de rota
  ClientesController.create
);

// --- ROTA DE ATUALIZAÇÃO ADICIONADA ---
// Rota para atualizar um cliente (apenas para gestores)
clientesRoutes.patch(
  '/:id',
  authMiddleware,
  authorize(['GESTOR']), // Proteção de rota
  ClientesController.update
);

// Rota para excluir um cliente (apenas para gestores)
clientesRoutes.delete(
  '/:id',
  authMiddleware,
  authorize(['GESTOR']), // Proteção de rota
  ClientesController.delete
);

module.exports = clientesRoutes;
