// File: MEU-APP-CHAMADOS-BACKEND/src/routes/observacoes.routes.js
const { Router } = require('express');
const ObservacoesController = require('../controllers/ObservacoesController');
const authMiddleware = require('../middlewares/auth.js');
const ensureRoles = require('../middlewares/authorize.js'); // Middleware para verificar papéis

const observacoesRoutes = Router();

// Rota para o GESTOR listar TODAS as observações.
observacoesRoutes.get('/', authMiddleware, ensureRoles(['GESTOR']), ObservacoesController.index);

// ROTA ADICIONADA: Rota para o TÉCNICO listar apenas as SUAS observações.
observacoesRoutes.get('/me', authMiddleware, ensureRoles(['TECNICO']), ObservacoesController.indexByTechnician);

// Rota para TÉCNICO criar uma nova observação.
observacoesRoutes.post('/', authMiddleware, ensureRoles(['TECNICO']), ObservacoesController.create);

// NOVA ROTA: Rota para TÉCNICO ou GESTOR atualizar uma observação.
observacoesRoutes.put('/:id', authMiddleware, ensureRoles(['TECNICO', 'GESTOR']), ObservacoesController.update);

// ROTA ADICIONADA: Rota para TÉCNICO ou GESTOR deletar uma observação.
observacoesRoutes.delete('/:id', authMiddleware, ensureRoles(['TECNICO', 'GESTOR']), ObservacoesController.delete);

module.exports = observacoesRoutes;