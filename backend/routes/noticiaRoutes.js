const router = require('express').Router();
const db = require('../db');

const CATEGORIAS_NOTICIA = [
  'meio_ambiente',
  'obras',
  'saude',
  'eventos',
  'mobilidade',
  'cidade'
];

const ROTULO_CATEGORIAS = {
  meio_ambiente: 'Meio ambiente',
  obras: 'Obras',
  saude: 'Saúde',
  eventos: 'Eventos',
  mobilidade: 'Mobilidade',
  cidade: 'Cidade'
};

function noticiaPublica(noticia) {
  return {
    ...noticia,
    categoriaRotulo: ROTULO_CATEGORIAS[noticia.categoria] || noticia.categoria
  };
}

router.get('/', (req, res) => {
  const { categoria, busca } = req.query;
  const limite = Math.min(Number(req.query.limite) || 50, 100);

  let lista = [...db.get().noticias];

  if (categoria && CATEGORIAS_NOTICIA.includes(categoria)) {
    lista = lista.filter((n) => n.categoria === categoria);
  }

  if (busca) {
    const termo = String(busca).toLowerCase();
    lista = lista.filter(
      (n) =>
        n.titulo.toLowerCase().includes(termo) ||
        n.resumo.toLowerCase().includes(termo)
    );
  }

  lista.sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm));

  res.json(lista.slice(0, limite).map(noticiaPublica));
});

router.get('/:id', (req, res) => {
  const noticia = db.get().noticias.find((n) => n.id === Number(req.params.id));

  if (!noticia) {
    return res.status(404).json({ erro: 'Notícia não encontrada.' });
  }

  res.json(noticiaPublica(noticia));
});

module.exports = { router, CATEGORIAS_NOTICIA };
