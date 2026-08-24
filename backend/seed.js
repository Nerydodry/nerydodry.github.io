const bcrypt = require('bcryptjs');
const db = require('./db');

function popular() {
  if (db.get().usuarios.length > 0) {
    console.log('[seed] O banco já possui dados. Nada foi alterado.');
    return;
  }

  const agora = Date.now();
  const diasAtras = (dias) => new Date(agora - dias * 24 * 60 * 60 * 1000).toISOString();

  const maria = {
    id: 1,
    nome: 'Maria Souza',
    email: 'maria@demo.com',
    senhaHash: bcrypt.hashSync('123456', 10),
    cidade: 'Cuiabá - MT',
    bio: 'Apaixonada pelo meio ambiente 🌱',
    criadoEm: diasAtras(30)
  };

  const joao = {
    id: 2,
    nome: 'João Pereira',
    email: 'joao@demo.com',
    senhaHash: bcrypt.hashSync('123456', 10),
    cidade: 'Várzea Grande - MT',
    bio: 'Fiscal da comunidade 👀',
    criadoEm: diasAtras(20)
  };

  db.get().usuarios.push(maria, joao);

  db.get().denuncias.push(
    {
      id: 1,
      usuarioId: 1,
      tipo: 'lixo',
      titulo: 'Entulho descartado na praça central',
      descricao: 'Sacolas de lixo e restos de construção jogados ao lado do parquinho.',
      latitude: -15.6014,
      longitude: -56.0979,
      foto: null,
      status: 'aberta',
      apoios: [2],
      criadoEm: diasAtras(3)
    },
    {
      id: 2,
      usuarioId: 2,
      tipo: 'vazamento_agua',
      titulo: 'Vazamento na esquina da Rua das Flores',
      descricao: 'Água jorrando há dois dias, desperdício enorme.',
      latitude: -15.5989,
      longitude: -56.1031,
      foto: null,
      status: 'em_analise',
      apoios: [1],
      criadoEm: diasAtras(2)
    },
    {
      id: 3,
      usuarioId: 1,
      tipo: 'queimada',
      titulo: 'Fumaça no fim da Avenida Verde',
      descricao: 'Alguém queimando lixo perto das casas, fumaça forte.',
      latitude: -15.6102,
      longitude: -56.0876,
      foto: null,
      status: 'resolvida',
      apoios: [],
      criadoEm: diasAtras(8)
    }
  );

  db.get().mensagens.push(
    {
      id: 1,
      usuarioId: 1,
      nome: 'Maria Souza',
      texto: 'Oi pessoal! Vi muito entulho na praça central, alguém mais confirmou?',
      criadoEm: diasAtras(3)
    },
    {
      id: 2,
      usuarioId: 2,
      nome: 'João Pereira',
      texto: 'Confirmei! Já registrei uma denúncia de vazamento também na Rua das Flores.',
      criadoEm: diasAtras(2)
    },
    {
      id: 3,
      usuarioId: 1,
      nome: 'Maria Souza',
      texto: 'Boa! Vamos acompanhar até resolverem 💚',
      criadoEm: diasAtras(1)
    }
  );

  db.salvar();
  console.log('[seed] Dados de demonstração criados!');
  console.log('[seed] Login demo: maria@demo.com / 123456 ou joao@demo.com / 123456');
}

popular();
