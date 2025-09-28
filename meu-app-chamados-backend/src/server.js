// MEU-APP-CHAMADOS-BACKEND/src/server.js
require('dotenv').config();
const path = require('path');

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require("socket.io");
const jwt = require('jsonwebtoken');
require('./database/connection');

if (!process.env.JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined. Please set it in your environment variables.");
  process.exit(1);
}

// Importando todas as suas rotas
const usersRoutes = require('./routes/users.routes');
const sessionsRoutes = require('./routes/sessions.routes');
const chamadosRoutes = require('./routes/chamados.routes');
const observacoesRoutes = require('./routes/observacoes.routes');
const clientesRoutes = require('./routes/clientes.routes');
const pontosRoutes = require('./routes/pontos.routes');
const configuracoesRoutes = require('./routes/configuracoes.routes');
const webhooksRoutes = require('./routes/webhooks.routes');
const materiaisRoutes = require('./routes/materiais.routes');
const registrosRoutes = require('./routes/registros.routes');
const servicosRoutes = require('./routes/servicos.routes');

const app = express();
const server = http.createServer(app);

// --- LISTA DE ORIGENS ATUALIZADA ---
const allowedOrigins = [
  'https://app.laink.com.br',
  'https://www.app.laink.com.br',
  'https://api.laink.com.br',
  'https://www.api.laink.com.br',
  'http://localhost:5173',
  'http://localhost:3333',
  'https://free.laink.com.br',      // <-- CORREÇÃO
  'https://www.free.laink.com.br'   // <-- CORREÇÃO
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('A política de CORS para este site não permite acesso a partir da Origem especificada.'));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));

const io = new Server(server, {
  cors: corsOptions
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '..', 'tmp', 'uploads')));

app.use((request, response, next) => {
  request.io = io;
  return next();
});

// Registrando todas as rotas da aplicação
app.use('/users', usersRoutes);
app.use('/sessions', sessionsRoutes);
app.use('/chamados', chamadosRoutes);
app.use('/observacoes', observacoesRoutes);
app.use('/clientes', clientesRoutes);
app.use('/pontos', pontosRoutes);
app.use('/configuracoes', configuracoesRoutes);
app.use('/webhooks', webhooksRoutes);
app.use('/materiais', materiaisRoutes);
app.use('/registros', registrosRoutes);
app.use('/servicos', servicosRoutes);

app.get('/', (request, response) => {
  response.json({ message: "Servidor do App de Chamados Laink está no ar!" });
});

// --- LÓGICA DE SOCKET.IO ---
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication error: Token not provided"));
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return next(new Error("Authentication error: Invalid token"));
    }
    socket.userId = decoded.id; 
    socket.userRole = decoded.role;
    next();
  });
});

io.on('connection', (socket) => {
  console.log(`✅ [Socket.IO] Usuário autenticado e conectado! ID do Usuário: ${socket.userId}, Role: ${socket.userRole}, Socket ID: ${socket.id}`);
  const personalRoom = `user-${socket.userId}`;
  socket.join(personalRoom);
  if (socket.userRole) {
    const groupRoom = `${socket.userRole.toLowerCase()}s`;
    socket.join(groupRoom);
  }
  socket.on('disconnect', (reason) => {
    console.log(`❌ [Socket.IO] Socket desconectado: ${socket.id}. Motivo: ${reason}`);
  });
});

const PORT = process.env.PORT || 3333;
server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});