// File: MEU-APP-CHAMADOS-BACKEND/src/routes/registros.routes.js

const { Router } = require('express');
const RegistrosController = require('../controllers/RegistrosController');
const authMiddleware = require('../middlewares/auth.js');
const ensureGestorMiddleware = require('../middlewares/ensureGestor.js');

const registrosRoutes = Router();

// Protege todas as rotas de registros com autenticação e verificação de gestor
registrosRoutes.use(authMiddleware);
registrosRoutes.use(ensureGestorMiddleware);

// Rota para buscar a lista de registros
registrosRoutes.get('/', RegistrosController.index);

// --- NOVA ROTA ADICIONADA ---
// Rota para deletar um registro específico pelo ID
registrosRoutes.delete('/:id', RegistrosController.deleteSingle);

// Rota existente para deletar múltiplos registros em massa
registrosRoutes.delete('/', RegistrosController.destroy);

module.exports = registrosRoutes;