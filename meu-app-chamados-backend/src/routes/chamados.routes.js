// MEU-APP-CHAMADOS-BACKEND/src/routes/chamados.routes.js
const { Router } = require('express');
const upload = require('../config/upload');
const ChamadosController = require('../controllers/ChamadosController');
const authMiddleware = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');

const chamadosRoutes = Router();

const ROLES = {
  GESTOR: 'GESTOR',
  OPERADOR: 'OPERADOR',
  TECNICO: 'TECNICO'
};

chamadosRoutes.use(authMiddleware);

chamadosRoutes.get('/', ChamadosController.index);
chamadosRoutes.get('/fila-gestor', authorize([ROLES.GESTOR]), ChamadosController.filaGestor);
chamadosRoutes.get('/historico', authorize([ROLES.GESTOR]), ChamadosController.getHistorico);
chamadosRoutes.get('/active/me', authorize([ROLES.TECNICO]), ChamadosController.getInProgressByUser);
chamadosRoutes.get('/:id', authorize([ROLES.TECNICO, ROLES.GESTOR, ROLES.OPERADOR]), ChamadosController.show);
chamadosRoutes.post('/', authorize([ROLES.OPERADOR, ROLES.GESTOR]), ChamadosController.create);
chamadosRoutes.post('/aceitar', authorize([ROLES.TECNICO]), ChamadosController.aceitar);
chamadosRoutes.patch('/:id', authorize([ROLES.TECNICO, ROLES.GESTOR, ROLES.OPERADOR]), ChamadosController.update);
chamadosRoutes.delete('/:id', authorize([ROLES.OPERADOR]), ChamadosController.delete);

// ROTA DE UPLOAD DE FOTOS REATIVADA
chamadosRoutes.post(
  '/:id/fotos',
  authorize([ROLES.TECNICO]),
  upload.array('fotos', 10),
  ChamadosController.uploadFotos
);

module.exports = chamadosRoutes;