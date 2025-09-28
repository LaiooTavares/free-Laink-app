// MEU-APP-CHAMADOS-BACKEND/src/routes/servicos.routes.js
const { Router } = require('express');
const multer = require('multer');
const uploadConfig = require('../config/upload');
const ServicosController = require('../controllers/ServicosController');
const authMiddleware = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');

const router = Router();
const upload = multer(uploadConfig);

const ROLES = {
  GESTOR: 'GESTOR',
  OPERADOR: 'OPERADOR',
  TECNICO: 'TECNICO'
};

router.get('/', authMiddleware, ServicosController.index);

// ===================== ROTAS EXCLUSIVAS DO GESTOR =====================
router.get(
  '/fila-gestor',
  authMiddleware,
  authorize([ROLES.GESTOR]),
  ServicosController.filaGestor
);

router.get(
  '/historico',
  authMiddleware,
  authorize([ROLES.GESTOR]),
  ServicosController.getHistorico
);
// ====================================================================

router.post('/', authMiddleware, authorize([ROLES.OPERADOR, ROLES.GESTOR]), ServicosController.create);

router.get('/:id', authMiddleware, authorize([ROLES.GESTOR, ROLES.OPERADOR, ROLES.TECNICO]), ServicosController.show);
router.patch('/:id', authMiddleware, authorize([ROLES.OPERADOR, ROLES.GESTOR, ROLES.TECNICO]), ServicosController.update);
router.delete('/:id', authMiddleware, authorize([ROLES.OPERADOR, ROLES.GESTOR]), ServicosController.delete);

// --- NOVA ROTA PARA UPLOAD DE FOTOS ---
router.post(
  '/:id/fotos',
  authMiddleware,
  authorize([ROLES.TECNICO]),
  upload.array('fotos', 10), // Permite até 10 fotos por vez
  ServicosController.uploadFotos
);

module.exports = router;