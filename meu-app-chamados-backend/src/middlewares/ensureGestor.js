// File: MEU-APP-CHAMADOS-BACKEND/src/middlewares/ensureGestor.js

// Este é um middleware para garantir que apenas usuários com a role 'GESTOR' possam acessar certas rotas.
function ensureGestorMiddleware(request, response, next) {
  // O middleware de autenticação (auth.js) já deve ter adicionado o objeto 'user' à requisição.
  // Se 'request.user' não existir, o 'authMiddleware' já deveria ter barrado a requisição.
  if (!request.user) {
    return response.status(401).json({ error: 'Token de autenticação ausente ou inválido.' });
  }

  const { role } = request.user;

  // Verificação robusta e case-insensitive da role.
  if (role && role.toUpperCase() === 'GESTOR') {
    // Se o usuário é um GESTOR, permite que a requisição continue para o próximo passo (o controller).
    return next();
  } else {
    // Se o usuário não tem a role 'GESTOR', retorna um erro 403 (Forbidden).
    console.warn(`[ensureGestor] Tentativa de acesso negada para o usuário ID ${request.user.id} com a role '${role}'.`);
    return response.status(403).json({ error: 'Acesso negado. Esta funcionalidade é exclusiva para gestores.' });
  }
}

module.exports = ensureGestorMiddleware;
