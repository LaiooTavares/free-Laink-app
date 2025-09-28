// File: MEU-APP-CHAMADOS-BACKEND/src/middlewares/authorize.js

// Este middleware recebe uma lista de funções ('roles') permitidas para uma rota.
function authorize(allowedRoles) {
  // Ele retorna uma função de middleware, que é o que o Express usa.
  return (request, response, next) => {
    console.log('[Middleware: authorize] >>> INICIANDO verificação de permissão.');

    if (!request.user || !request.user.role) {
      console.error('[Middleware: authorize] ERRO FATAL: request.user ou request.user.role não existem. O middleware de autenticação pode ter falhado.');
      return response.status(403).json({ error: 'Acesso negado. Falha na autenticação do usuário.' });
    }

    const { role } = request.user;
    console.log(`[Middleware: authorize] Verificando... Role do usuário: '${role}'. Roles permitidas: [${allowedRoles.join(', ')}]`);

    // Verificamos se a função do utilizador está na lista de funções permitidas.
    if (!allowedRoles.includes(role)) {
      console.warn(`[Middleware: authorize] ACESSO NEGADO para role '${role}'.`);
      // Se não estiver, retornamos o erro 403 Forbidden.
      return response.status(403).json({ error: 'Acesso negado. Você não tem permissão para executar esta ação.' });
    }

    // Se a permissão for válida, permite que a requisição continue.
    console.log('[Middleware: authorize] <<< Autorização CONCEDIDA. Prosseguindo...');
    return next();
  };
}

module.exports = authorize;