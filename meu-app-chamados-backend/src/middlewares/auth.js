// MEU-APP-CHAMADOS-BACKEND/src/middlewares/auth.js
const jwt = require('jsonwebtoken');

// --- INÍCIO DA CORREÇÃO: Convertendo para async/await ---
module.exports = async (request, response, next) => {
  console.log('[Middleware: auth] >>> INICIANDO verificação de token.');
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    console.warn('[Middleware: auth] ACESSO NEGADO: Nenhum header de autorização fornecido.');
    return response.status(401).json({ error: 'Nenhum token foi fornecido.' });
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2) {
    console.warn('[Middleware: auth] ACESSO NEGADO: Token com formato inválido (não tem 2 partes).');
    return response.status(401).json({ error: 'Erro no formato do token.' });
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    console.warn(`[Middleware: auth] ACESSO NEGADO: Esquema '${scheme}' inválido.`);
    return response.status(401).json({ error: 'Token mal formatado.' });
  }

  try {
    // Usamos jwt.verify de forma síncrona dentro de um try/catch
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    console.log('[Middleware: auth] Token verificado com sucesso. Payload:', decoded);

    request.user = {
      id: decoded.id,
      role: decoded.role
    };

    console.log('[Middleware: auth] <<< Autenticação CONCEDIDA. Prosseguindo...');
    return next(); // Agora o 'next()' é chamado no fluxo principal, após a verificação

  } catch (err) {
    console.error("[Middleware: auth] ERRO FATAL na verificação do JWT:", err.message);
    return response.status(401).json({ error: 'Token inválido ou expirado.' });
  }
};
// --- FIM DA CORREÇÃO ---