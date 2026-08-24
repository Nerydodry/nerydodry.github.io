const router = require('express').Router();
const db = require('../db');
const { autenticar } = require('../middleware/auth');

router.get('/mensagens', (req, res) => {
  const antesDe = Number(req.query.antesDe) || Infinity;
  const quantidade = Math.min(Number(req.query.quantidade) || 50, 100);

  const mensagens = db
    .get()
    .mensagens.filter((m) => m.id <= antesDe)
    .sort((a, b) => a.id - b.id)
    .slice(-quantidade);

  res.json(mensagens);
});

router.post('/mensagens', autenticar, (req, res) => {
  const texto = String((req.body || {}).texto || '').trim();

  if (!texto) {
    return res.status(400).json({ erro: 'A mensagem não pode ficar vazia.' });
  }

  const usuario = db.get().usuarios.find((u) => u.id === req.usuario.id);

  if (!usuario) {
    return res.status(401).json({ erro: 'Usuário não encontrado.' });
  }

  const mensagem = {
    id: db.proximoId('mensagens'),
    usuarioId: usuario.id,
    nome: usuario.nome,
    texto: texto.slice(0, 500),
    criadoEm: new Date().toISOString()
  };

  db.get().mensagens.push(mensagem);
  db.salvar();

  res.status(201).json(mensagem);
});

module.exports = router;
