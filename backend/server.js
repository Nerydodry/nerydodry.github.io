require('dotenv').config();

const path = require('path');
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');

const db = require('./db');
const { autenticar, JWT_SECRET } = require('./middleware/auth');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const reportRoutes = require('./routes/reportRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { maxHttpBufferSize: 1e6 });

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/denuncias', reportRoutes);
app.use('/api/chat', chatRoutes);

app.get('/api', (req, res) => {
  res.json({
    nome: 'CidadeViva API',
    versao: '1.0.0',
    documentacao: '/docs/API.md'
  });
});

app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada.' });
});

app.use((erro, req, res, next) => {
  if (erro.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ erro: 'A foto deve ter no máximo 5 MB.' });
  }
  console.error('[erro]', erro.message);
  res.status(500).json({ erro: 'Erro interno do servidor.' });
});

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    socket.usuario = require('jsonwebtoken').verify(token || '', JWT_SECRET);
    next();
  } catch {
    next(new Error('não autorizado'));
  }
});

io.on('connection', (socket) => {
  socket.on('chat:mensagem', (dados) => {
    const texto = String(dados?.texto || '').trim().slice(0, 500);
    if (!texto) return;

    const usuario = db.get().usuarios.find((u) => u.id === socket.usuario.id);
    if (!usuario) return;

    const mensagem = {
      id: db.proximoId('mensagens'),
      usuarioId: usuario.id,
      nome: usuario.nome,
      texto,
      criadoEm: new Date().toISOString()
    };

    db.get().mensagens.push(mensagem);
    db.salvar();
    io.emit('chat:nova', mensagem);
  });
});

const PORTA = process.env.PORTA || 3000;

server.listen(PORTA, () => {
  console.log(`🌿 CidadeViva rodando em http://localhost:${PORTA}`);
});
