// src/routes/sessions.routes.js
const { Router } = require('express');
const SessionsController = require('../controllers/SessionsController');

const sessionsRoutes = Router();

sessionsRoutes.post('/', SessionsController.create);

module.exports = sessionsRoutes;