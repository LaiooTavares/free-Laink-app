// File: MEU-APP-CHAMADOS-BACKEND/src/routes/webhooks.routes.js

const { Router } = require('express');
const WebhookController = require('../controllers/WebhookController');

const webhooksRoutes = Router();
const webhookController = new WebhookController();

// --- ROTA PARA REGISTROS ---
// Rota POST para receber e salvar um novo registro
webhooksRoutes.post('/registros', webhookController.handleRegistro);


// --- ROTAS DE ESTOQUE ---
// Rota POST para ATUALIZAR/ADICIONAR itens no estoque
webhooksRoutes.post('/estoque', webhookController.atualizarEstoque);

// Rota POST para RETIRAR uma quantidade de um item do estoque
webhooksRoutes.post('/estoque/retirar', webhookController.retirarEstoque);

module.exports = webhooksRoutes;
