const TIPOS_DENUNCIA = [
  'lixo',
  'vazamento_agua',
  'queimada',
  'desmatamento',
  'esgoto',
  'outro'
];

const ROTULO_TIPOS = {
  lixo: 'Descarte irregular de lixo',
  vazamento_agua: 'Vazamento de água',
  queimada: 'Queimada',
  desmatamento: 'Desmatamento',
  esgoto: 'Esgoto a céu aberto',
  outro: 'Outro'
};

const STATUS_DENUNCIA = ['aberta', 'em_analise', 'resolvida'];

const ROTULO_STATUS = {
  aberta: 'Aberta',
  em_analise: 'Em análise',
  resolvida: 'Resolvida'
};

function usuarioPublico(usuario) {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    cidade: usuario.cidade || '',
    bio: usuario.bio || '',
    criadoEm: usuario.criadoEm
  };
}

module.exports = { TIPOS_DENUNCIA, STATUS_DENUNCIA, ROTULO_TIPOS, ROTULO_STATUS, usuarioPublico };
