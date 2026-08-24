const path = require('path');
const router = require('express').Router();
const multer = require('multer');
const db = require('../db');
const { autenticar } = require('../middleware/auth');
const { TIPOS_DENUNCIA, STATUS_DENUNCIA, ROTULO_TIPOS, ROTULO_STATUS } = require('../utils');

const PASTA_UPLOADS = path.join(__dirname, '..', '..', 'uploads');

const armazenamento = multer.diskStorage({
  destination: (req, arquivo, cb) => cb(null, PASTA_UPLOADS),
  filename: (req, arquivo, cb) => {
    const extensao = (path.extname(arquivo.originalname) || '.jpg').toLowerCase();
    cb(null, `denuncia-${Date.now()}-${Math.round(Math.random() * 1e6)}${extensao}`);
  }
});

const upload = multer({
  storage: armazenamento,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, arquivo, cb) => {
    if (/^image\//.test(arquivo.mimetype)) return cb(null, true);
    cb(new Error('A foto deve ser um arquivo de imagem.'));
  }
});

function denunciaPublica(denuncia) {
  const autor = db.get().usuarios.find((u) => u.id === denuncia.usuarioId);
  return {
    ...denuncia,
    tipoRotulo: ROTULO_TIPOS[denuncia.tipo] || denuncia.tipo,
    statusRotulo: ROTULO_STATUS[denuncia.status] || denuncia.status,
    autor: autor ? { id: autor.id, nome: autor.nome } : { id: null, nome: 'Usuário removido' }
  };
}

router.post('/', autenticar, upload.single('foto'), (req, res) => {
  const { tipo, titulo, descricao, latitude, longitude } = req.body;

  if (!req.file) {
    return res.status(400).json({ erro: 'A foto do problema é obrigatória.' });
  }

  if (!TIPOS_DENUNCIA.includes(tipo)) {
    return res.status(400).json({ erro: `Tipo inválido. Tipos aceitos: ${TIPOS_DENUNCIA.join(', ')}.` });
  }

  if (!titulo || !String(titulo).trim()) {
    return res.status(400).json({ erro: 'O título é obrigatório.' });
  }

  const novaDenuncia = {
    id: db.proximoId('denuncias'),
    usuarioId: req.usuario.id,
    tipo,
    titulo: String(titulo).trim().slice(0, 120),
    descricao: String(descricao || '').trim().slice(0, 1000),
    latitude: latitude ? Number(latitude) : null,
    longitude: longitude ? Number(longitude) : null,
    foto: `/uploads/${req.file.filename}`,
    status: 'aberta',
    apoios: [],
    criadoEm: new Date().toISOString()
  };

  db.get().denuncias.push(novaDenuncia);
  db.salvar();

  res.status(201).json(denunciaPublica(novaDenuncia));
});

router.get('/', (req, res) => {
  const { tipo, status, busca } = req.query;
  const limite = Math.min(Number(req.query.limite) || 50, 100);

  let lista = [...db.get().denuncias];

  if (tipo && TIPOS_DENUNCIA.includes(tipo)) {
    lista = lista.filter((d) => d.tipo === tipo);
  }

  if (status && STATUS_DENUNCIA.includes(status)) {
    lista = lista.filter((d) => d.status === status);
  }

  if (busca) {
    const termo = String(busca).toLowerCase();
    lista = lista.filter(
      (d) =>
        d.titulo.toLowerCase().includes(termo) ||
        d.descricao.toLowerCase().includes(termo)
    );
  }

  lista.sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm));

  res.json(lista.slice(0, limite).map(denunciaPublica));
});

router.get('/minhas', autenticar, (req, res) => {
  const lista = db
    .get()
    .denuncias.filter((d) => d.usuarioId === req.usuario.id)
    .sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm));

  res.json(lista.map(denunciaPublica));
});

router.get('/:id', (req, res) => {
  const denuncia = db.get().denuncias.find((d) => d.id === Number(req.params.id));

  if (!denuncia) {
    return res.status(404).json({ erro: 'Denúncia não encontrada.' });
  }

  res.json(denunciaPublica(denuncia));
});

router.patch('/:id/status', autenticar, (req, res) => {
  const denuncia = db.get().denuncias.find((d) => d.id === Number(req.params.id));

  if (!denuncia) {
    return res.status(404).json({ erro: 'Denúncia não encontrada.' });
  }

  if (denuncia.usuarioId !== req.usuario.id) {
    return res.status(403).json({ erro: 'Somente o autor pode alterar o status da denúncia.' });
  }

  const { status } = req.body || {};

  if (!STATUS_DENUNCIA.includes(status)) {
    return res.status(400).json({ erro: `Status inválido. Aceitos: ${STATUS_DENUNCIA.join(', ')}.` });
  }

  denuncia.status = status;
  db.salvar();

  res.json(denunciaPublica(denuncia));
});

router.post('/:id/apoio', autenticar, (req, res) => {
  const denuncia = db.get().denuncias.find((d) => d.id === Number(req.params.id));

  if (!denuncia) {
    return res.status(404).json({ erro: 'Denúncia não encontrada.' });
  }

  const indice = denuncia.apoios.indexOf(req.usuario.id);

  if (indice >= 0) {
    denuncia.apoios.splice(indice, 1);
  } else {
    denuncia.apoios.push(req.usuario.id);
  }

  db.salvar();

  res.json({
    apoios: denuncia.apoios.length,
    apoiou: indice < 0
  });
});

module.exports = router;
