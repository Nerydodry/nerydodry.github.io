const router = require('express').Router();
const db = require('../db');
const { autenticar } = require('../middleware/auth');
const { usuarioPublico } = require('../utils');

function estatisticas(usuarioId) {
  const denuncias = db.get().denuncias.filter((d) => d.usuarioId === usuarioId);
  return {
    denunciasEnviadas: denuncias.length,
    denunciasResolvidas: denuncias.filter((d) => d.status === 'resolvida').length,
    apoiosRecebidos: denuncias.reduce((total, d) => total + d.apoios.length, 0)
  };
}

router.get('/eu', autenticar, (req, res) => {
  const usuario = db.get().usuarios.find((u) => u.id === req.usuario.id);

  if (!usuario) {
    return res.status(404).json({ erro: 'Usuário não encontrado.' });
  }

  res.json({ ...usuarioPublico(usuario), estatisticas: estatisticas(usuario.id) });
});

router.put('/eu', autenticar, (req, res) => {
  const usuario = db.get().usuarios.find((u) => u.id === req.usuario.id);

  if (!usuario) {
    return res.status(404).json({ erro: 'Usuário não encontrado.' });
  }

  const { nome, cidade, bio } = req.body || {};

  if (nome !== undefined) {
    if (!String(nome).trim()) {
      return res.status(400).json({ erro: 'O nome não pode ficar vazio.' });
    }
    usuario.nome = String(nome).trim();
  }

  if (cidade !== undefined) usuario.cidade = String(cidade).trim();
  if (bio !== undefined) usuario.bio = String(bio).trim().slice(0, 300);

  db.salvar();
  res.json({ ...usuarioPublico(usuario), estatisticas: estatisticas(usuario.id) });
});

router.get('/:id', (req, res) => {
  const usuario = db.get().usuarios.find((u) => u.id === Number(req.params.id));

  if (!usuario) {
    return res.status(404).json({ erro: 'Usuário não encontrado.' });
  }

  res.json({
    id: usuario.id,
    nome: usuario.nome,
    cidade: usuario.cidade || '',
    bio: usuario.bio || '',
    criadoEm: usuario.criadoEm,
    estatisticas: estatisticas(usuario.id)
  });
});

module.exports = router;
