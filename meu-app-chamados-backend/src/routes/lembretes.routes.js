// MEU-APP-CHAMADOS-BACKEND/src/routes/lembretes.routes.js (SEM ALTERAÇÕES)

const { Router } = require('express');
const ensureAuthenticated = require('../middlewares/auth'); 
const LembretesController = require('../controllers/LembretesController');

const lembretesRoutes = Router();
const lembretesController = new LembretesController();

lembretesRoutes.use(ensureAuthenticated);

// Rotas existentes
lembretesRoutes.get('/', lembretesController.index);
lembretesRoutes.post('/', lembretesController.create);
lembretesRoutes.delete('/:id', lembretesController.delete);

// NOVA ROTA: para atualizar a posição
lembretesRoutes.patch('/:id/position', lembretesController.update);

module.exports = lembretesRoutes;
