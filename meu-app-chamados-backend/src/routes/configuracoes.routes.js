// File: MEU-APP-CHAMADOS-BACKEND/src/routes/configuracoes.routes.js

const { Router } = require('express');
const multer = require('multer');
const uploadConfig = require('../config/upload');
const ConfiguracoesController = require('../controllers/ConfiguracoesController'); // Importa o controller
const authMiddleware = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');

const configuracoesRoutes = Router();
const upload = multer(uploadConfig);

configuracoesRoutes.get('/branding', ConfiguracoesController.getBranding);
configuracoesRoutes.patch(
  '/branding/:type', 
  authMiddleware, 
  authorize(['TI', 'GESTOR']),
  upload.single('image'), 
  ConfiguracoesController.updateBrandingImage
);

configuracoesRoutes.use(authMiddleware);
configuracoesRoutes.get('/prefixes', ConfiguracoesController.getPrefixes);
configuracoesRoutes.get('/webhook', ConfiguracoesController.getWebhookUrl);
configuracoesRoutes.get('/settings', authorize(['GESTOR', 'TI', 'OPERADOR', 'TECNICO']), ConfiguracoesController.getSettings);
configuracoesRoutes.post('/settings', authorize(['GESTOR', 'TI']), ConfiguracoesController.updateSettings);
configuracoesRoutes.post('/reset-counter', authorize(['GESTOR', 'TI']), ConfiguracoesController.resetOSCounter);

module.exports = configuracoesRoutes;