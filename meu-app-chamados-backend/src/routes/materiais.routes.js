// Path: MEU-APP-CHAMADOS-BACKEND/src/routes/materiais.routes.js

const { Router } = require('express');
const MateriaisController = require('../controllers/MateriaisController');
const authMiddleware = require('../middlewares/auth');

const materiaisRoutes = Router();
const materiaisController = new MateriaisController();

// Aplica o middleware de autenticação a todas as rotas de materiais
materiaisRoutes.use(authMiddleware);

// Rota GET para buscar a lista de todos os materiais do técnico logado
materiaisRoutes.get('/', materiaisController.index);

// --- NOVA ROTA ADICIONADA PARA BUSCAR O HISTÓRICO ---
// Rota GET para buscar o histórico de movimentações de estoque do técnico logado
materiaisRoutes.get('/historico', materiaisController.historico);

// Rota POST para utilizar um material em um chamado
materiaisRoutes.post('/utilizar', materiaisController.utilizar);

// Rota POST para transferir um material para outro técnico
materiaisRoutes.post('/transferir', materiaisController.transferir);

module.exports = materiaisRoutes;