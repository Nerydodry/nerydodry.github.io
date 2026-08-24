const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { usuarioPublico } = require('../utils');
const { JWT_SECRET } = require('../middleware/auth');

function gerarToken(usuario) {
  return jwt.sign({ id: usuario.id }, JWT_SECRET, { expiresIn: '7d' });
}

router.post('/registrar', async (req, res) => {
  const { nome, email, senha } = req.body || {};

  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: 'Nome, e-mail e senha são obrigatórios.' });
  }

  if (String(senha).length < 6) {
    return res.status(400).json({ erro: 'A senha deve ter pelo menos 6 caracteres.' });
  }

  const emailNormalizado = String(email).trim().toLowerCase();

  if (db.get().usuarios.some((u) => u.email === emailNormalizado)) {
    return res.status(409).json({ erro: 'Este e-mail já está cadastrado.' });
  }

  const novoUsuario = {
    id: db.proximoId('usuarios'),
    nome: String(nome).trim(),
    email: emailNormalizado,
    senhaHash: await bcrypt.hash(String(senha), 10),
    cidade: '',
    bio: '',
    criadoEm: new Date().toISOString()
  };

  db.get().usuarios.push(novoUsuario);
  db.salvar();

  res.status(201).json({
    token: gerarToken(novoUsuario),
    usuario: usuarioPublico(novoUsuario)
  });
});

router.post('/login', async (req, res) => {
  const { email, senha } = req.body || {};
  const emailNormalizado = String(email || '').trim().toLowerCase();

  const usuario = db.get().usuarios.find((u) => u.email === emailNormalizado);

  if (!usuario || !(await bcrypt.compare(String(senha || ''), usuario.senhaHash))) {
    return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
  }

  res.json({
    token: gerarToken(usuario),
    usuario: usuarioPublico(usuario)
  });
});

module.exports = router;
