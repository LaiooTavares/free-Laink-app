// MEU-APP-CHAMADOS-BACKEND/src/routes/pontos.routes.js (SEM ALTERAÇÕES)
const { Router } = require('express');
const PontosController = require('../controllers/PontosController');
const authMiddleware = require('../middlewares/auth');

const pontosRoutes = Router();
pontosRoutes.use(authMiddleware); // Todas as rotas de ponto exigem autenticação

pontosRoutes.get('/', PontosController.index);
pontosRoutes.post('/', PontosController.create);

module.exports = pontosRoutes;
