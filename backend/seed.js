const bcrypt = require('bcryptjs');
const db = require('./db');

function popular() {
  const banco = db.get();
  const criouAlgo = [];

  if (banco.usuarios.length === 0) {
    popularUsuarios(banco);
    criouAlgo.push('usuários');
  }

  if (banco.denuncias.length === 0) {
    popularDenuncias(banco);
    criouAlgo.push('denúncias');
  }

  if (banco.mensagens.length === 0) {
    popularMensagens(banco);
    criouAlgo.push('mensagens');
  }

  if (banco.noticias.length === 0) {
    popularNoticias(banco);
    criouAlgo.push('notícias');
  }

  if (banco.comentarios.length === 0 && banco.denuncias.length > 0) {
    popularComentarios(banco);
    criouAlgo.push('comentários');
  }

  db.salvar();

  if (criouAlgo.length) {
    console.log(`[seed] Dados de demonstração criados: ${criouAlgo.join(', ')}!`);
  } else {
    console.log('[seed] O banco já possui dados. Nada foi alterado.');
  }
  console.log('[seed] Login demo: maria@demo.com / 123456 ou joao@demo.com / 123456');
}

function popularUsuarios(banco) {
  const agora = Date.now();
  const diasAtras = (dias) => new Date(agora - dias * 24 * 60 * 60 * 1000).toISOString();

  banco.usuarios.push(
    {
      id: 1,
      nome: 'Maria Souza',
      email: 'maria@demo.com',
      senhaHash: bcrypt.hashSync('123456', 10),
      cidade: 'Cuiabá - MT',
      bio: 'Apaixonada pelo meio ambiente 🌱',
      criadoEm: diasAtras(30)
    },
    {
      id: 2,
      nome: 'João Pereira',
      email: 'joao@demo.com',
      senhaHash: bcrypt.hashSync('123456', 10),
      cidade: 'Várzea Grande - MT',
      bio: 'Fiscal da comunidade 👀',
      criadoEm: diasAtras(20)
    }
  );
}

function popularDenuncias(banco) {
  const agora = Date.now();
  const diasAtras = (dias) => new Date(agora - dias * 24 * 60 * 60 * 1000).toISOString();

  banco.denuncias.push(
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
}

function popularMensagens(banco) {
  const agora = Date.now();
  const diasAtras = (dias) => new Date(agora - dias * 24 * 60 * 60 * 1000).toISOString();

  banco.mensagens.push(
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
}

function popularNoticias(banco) {
  const agora = Date.now();
  const diasAtras = (dias) => new Date(agora - dias * 24 * 60 * 60 * 1000).toISOString();

  banco.noticias.push(
    {
      id: 1,
      titulo: 'Prefeitura inicia plantio de 500 mudas nos bairros',
      resumo: 'Projeto "Cidade Verde" vai arborizar avenidas e praças até o fim do semestre.',
      conteudo:
        'A prefeitura anunciou o início do plantio de 500 mudas de espécies nativas em avenidas, praças e áreas de preservação. A ação faz parte do projeto "Cidade Verde", que visa aumentar a sombra nas calçadas e reduzir as temperaturas no verão. Os moradores podem solicitar mudas gratuitamente pelo site da prefeitura e acompanhar os pontos de plantio pelo aplicativo.',
      categoria: 'meio_ambiente',
      fonte: 'Prefeitura Municipal',
      imagem: null,
      criadoEm: diasAtras(1)
    },
    {
      id: 2,
      titulo: 'Coleta seletiva agora atende todos os bairros',
      resumo: 'Caminhões de recicláveis passarão duas vezes por semana em toda a cidade.',
      conteudo:
        'Depois de meses de expansão gradual, a coleta seletiva passa a atender 100% dos bairros. A coleta de recicláveis acontece às terças e sextas-feiras. Papel, plástico, metal e vidro devem estar separados do lixo orgânico. A expectativa é triplicar a taxa de reciclagem da cidade em dois anos, gerando renda para cooperativas de catadores.',
      categoria: 'cidade',
      fonte: 'Secretaria de Meio Ambiente',
      imagem: null,
      criadoEm: diasAtras(2)
    },
    {
      id: 3,
      titulo: 'Mutirão de limpeza do rio reúne voluntários no sábado',
      resumo: 'Encontro às 8h na orla; luvas e sacos serão distribuídos gratuitamente.',
      conteudo:
        'O próximo mutirão de limpeza das margens do rio acontecerá neste sábado, com concentração às 8h na orla. Organizadores vão distribuir luvas, sacos de lixo e água para os voluntários. No último evento, mais de 300 pessoas recolheram 1,2 tonelada de resíduos. A participação pode ser registrada como horas de trabalho voluntário para estudantes.',
      categoria: 'eventos',
      fonte: 'CidadeViva Comunidade',
      imagem: null,
      criadoEm: diasAtras(4)
    },
    {
      id: 4,
      titulo: 'Obra de drenagem deve acabar com alagamentos na zona leste',
      resumo: 'Investimento de R$ 8 milhões amplia galerias e constrói duas bacias de contenção.',
      conteudo:
        'As obras de drenagem na zona leste entraram na fase final. O projeto amplia as galerias pluviais e constrói duas bacias de contenção para segurar a água das chuvas fortes. Segundo a Secretaria de Obras, a região deixará de alagar já no próximo período chuvoso. O tráfego na Avenida Central segue em meia pista até dezembro.',
      categoria: 'obras',
      fonte: 'Secretaria de Obras',
      imagem: null,
      criadoEm: diasAtras(6)
    },
    {
      id: 5,
      titulo: 'Alerta: caso de dengue cresce 30% no mês',
      resumo: 'Saúde reforça orientação para eliminar água parada nos quintais.',
      conteudo:
        'A Secretaria de Saúde registrou alta de 30% nos casos de dengue em relação ao mês anterior. As equipes de endemias intensificaram as visitas aos bairros com mais notificações. A população deve verificar quintais, calhas e vasos de plantas, eliminando qualquer acúmulo de água parada. Denúncias de focos podem ser feitas pelo próprio CidadeViva.',
      categoria: 'saude',
      fonte: 'Secretaria de Saúde',
      imagem: null,
      criadoEm: diasAtras(5)
    },
    {
      id: 6,
      titulo: 'Novas ciclovias ligam o centro aos parques urbanos',
      resumo: 'Três quilômetros de ciclovia compartilhada entram em operação neste mês.',
      conteudo:
        'A cidade ganhou três quilômetros de ciclovias ligando o centro aos principais parques urbanos. As vias são compartilhadas com pedestres e sinalizadas. O objetivo é reduzir o uso de carros nas distâncias curtas e incentivar o transporte ativo. Bicicletas públicas estão disponíveis para aluguel por aplicativo nos terminais.',
      categoria: 'mobilidade',
      fonte: 'Secretaria de Mobilidade',
      imagem: null,
      criadoEm: diasAtras(7)
    }
  );
}

function popularComentarios(banco) {
  const agora = Date.now();
  const diasAtras = (dias) => new Date(agora - dias * 24 * 60 * 60 * 1000).toISOString();

  banco.comentarios.push(
    {
      id: 1,
      denunciaId: 1,
      usuarioId: 2,
      nome: 'João Pereira',
      texto: 'Passei lá hoje e continua igual. Vamos pressionar a coleta! 💪',
      criadoEm: diasAtras(2)
    },
    {
      id: 2,
      denunciaId: 1,
      usuarioId: 1,
      nome: 'Maria Souza',
      texto: 'Obrigada pelo apoio, João. Já são 3 dias de entulho ali.',
      criadoEm: diasAtras(1)
    },
    {
      id: 3,
      denunciaId: 2,
      usuarioId: 1,
      nome: 'Maria Souza',
      texto: 'Reportei isso também para a companhia de água pelo telefone 115.',
      criadoEm: diasAtras(1)
    }
  );
}

popular();
