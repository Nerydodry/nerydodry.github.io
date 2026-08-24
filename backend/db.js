const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');

const ESTRUTURA_INICIAL = {
  usuarios: [],
  denuncias: [],
  mensagens: []
};

let banco = null;

function carregar() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_PATH)) {
    try {
      banco = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    } catch {
      console.error('[db] Arquivo db.json corrompido, iniciando banco vazio.');
      banco = structuredClone(ESTRUTURA_INICIAL);
    }
  } else {
    banco = structuredClone(ESTRUTURA_INICIAL);
  }

  for (const colecao of Object.keys(ESTRUTURA_INICIAL)) {
    if (!Array.isArray(banco[colecao])) {
      banco[colecao] = [];
    }
  }

  return banco;
}

function get() {
  if (!banco) carregar();
  return banco;
}

function salvar() {
  const temporario = DB_PATH + '.tmp';
  fs.writeFileSync(temporario, JSON.stringify(get(), null, 2));
  fs.renameSync(temporario, DB_PATH);
}

function proximoId(nomeColecao) {
  const itens = get()[nomeColecao];
  if (!itens.length) return 1;
  return Math.max(...itens.map((item) => item.id)) + 1;
}

module.exports = { get, salvar, proximoId };
