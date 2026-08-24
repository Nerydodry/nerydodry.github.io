const TIPOS = {
  lixo: { rotulo: 'Lixo', icone: '🗑️' },
  vazamento_agua: { rotulo: 'Vazamento de água', icone: '💧' },
  queimada: { rotulo: 'Queimada', icone: '🔥' },
  desmatamento: { rotulo: 'Desmatamento', icone: '🌳' },
  esgoto: { rotulo: 'Esgoto', icone: '🚱' },
  outro: { rotulo: 'Outro', icone: '📍' }
};

const STATUS = {
  aberta: 'Aberta',
  em_analise: 'Em análise',
  resolvida: 'Resolvida'
};

const $conteudo = document.getElementById('conteudo');
const $telaAuth = document.getElementById('autenticacao');
const $aplicativo = document.getElementById('aplicativo');

let socket = null;
let filtroTipoAtual = '';

/* ---------- Utilidades ---------- */

function iniciais(nome) {
  return String(nome || '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join('')
    .toUpperCase();
}

function escapar(texto) {
  const div = document.createElement('div');
  div.textContent = String(texto ?? '');
  return div.innerHTML;
}

function dataCurta(iso) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short'
  });
}

function horaCurta(iso) {
  return new Date(iso).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

function exigirLogin() {
  if (!API.token) {
    mostrarTelaAuth();
    return true;
  }
  return false;
}

/* ---------- Autenticação (telas) ---------- */

function mostrarTelaAuth() {
  encerrarSocket();
  $aplicativo.classList.add('oculto');
  $telaAuth.classList.remove('oculto');
}

function mostrarAplicativo() {
  $telaAuth.classList.add('oculto');
  $aplicativo.classList.remove('oculto');
  atualizarAvatar();
  conectarSocket();
  navegar(location.hash || '#/inicio');
}

function atualizarAvatar() {
  const usuario = API.usuario;
  document.getElementById('avatarTopo').textContent = usuario
    ? iniciais(usuario.nome)
    : '';
}

function configurarFormulariosAuth() {
  const $abaEntrar = document.getElementById('abaEntrar');
  const $abaCriar = document.getElementById('abaCriar');
  const $formLogin = document.getElementById('formLogin');
  const $formRegistro = document.getElementById('formRegistro');
  const $mensagem = document.getElementById('mensagemAuth');

  function alternarAba(entrando) {
    $abaEntrar.classList.toggle('ativa', entrando);
    $abaCriar.classList.toggle('ativa', !entrando);
    $formLogin.classList.toggle('oculto', !entrando);
    $formRegistro.classList.toggle('oculto', entrando);
    $mensagem.textContent = '';
  }

  $abaEntrar.addEventListener('click', () => alternarAba(true));
  $abaCriar.addEventListener('click', () => alternarAba(false));

  function tratarErro(erro) {
    $mensagem.textContent =
      erro.status === 401
        ? 'E-mail ou senha incorretos.'
        : erro.message;
  }

  $formLogin.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    $mensagem.textContent = '';
    const dados = Object.fromEntries(new FormData($formLogin));
    try {
      const resposta = await API.login(dados.email, dados.senha);
      API.salvarSessao(resposta.token, resposta.usuario);
      mostrarAplicativo();
    } catch (erro) {
      tratarErro(erro);
    }
  });

  $formRegistro.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    $mensagem.textContent = '';
    const dados = Object.fromEntries(new FormData($formRegistro));
    try {
      const resposta = await API.registrar(dados.nome, dados.email, dados.senha);
      API.salvarSessao(resposta.token, resposta.usuario);
      mostrarAplicativo();
    } catch (erro) {
      tratarErro(erro);
    }
  });
}

/* ---------- Roteador ---------- */

const ROTAS = {
  '#/inicio': telaInicio,
  '#/denunciar': telaDenunciar,
  '#/chat': telaChat,
  '#/perfil': telaPerfil
};

async function navegar(rota) {
  if (!ROTAS[rota]) rota = '#/inicio';

  document.querySelectorAll('.menu button').forEach((botao) => {
    botao.classList.toggle('ativo', botao.dataset.rota === rota);
  });

  await ROTAS[rota]();
}

document.querySelectorAll('.menu button').forEach((botao) => {
  botao.addEventListener('click', () => {
    location.hash = botao.dataset.rota;
  });
});

document.getElementById('avatarTopo').addEventListener('click', () => {
  location.hash = '#/perfil';
});

window.addEventListener('hashchange', () => {
  if (!API.token) return;
  navegar(location.hash);
});

/* ---------- Tela: Início (feed) ---------- */

async function telaInicio() {
  $conteudo.innerHTML = `
    <div class="banner">
      <h2>Faça sempre a diferença!</h2>
      <p>Nos ajude a manter nossa cidade limpa e sustentável.</p>
    </div>

    <button class="botao-principal" id="botaoNovaDenuncia" style="width:100%">
      📸 Nova denúncia
    </button>

    <h3 class="secao-titulo">Últimas denúncias</h3>
    <div class="filtros" id="filtros"></div>
    <div id="listaDenuncias"><p class="aviso-carregando">Carregando…</p></div>
  `;

  document.getElementById('botaoNovaDenuncia').addEventListener('click', () => {
    location.hash = '#/denunciar';
  });

  const $filtros = document.getElementById('filtros');
  const filtros = [['', 'Todas'], ...Object.entries(TIPOS).map(([chave, valor]) => [chave, `${valor.icone} ${valor.rotulo}`])];

  filtros.forEach(([chave, rotulo]) => {
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = `filtro${chave === filtroTipoAtual ? ' ativo' : ''}`;
    botao.textContent = rotulo;
    botao.addEventListener('click', () => {
      filtroTipoAtual = chave;
      navegar('#/inicio');
    });
    $filtros.appendChild(botao);
  });

  try {
    const denuncias = await API.listarDenuncias(
      filtroTipoAtual ? { tipo: filtroTipoAtual } : {}
    );
    renderizarDenuncias(denuncias);
  } catch {
    document.getElementById('listaDenuncias').innerHTML =
      '<p class="vazio">Não foi possível carregar as denúncias.</p>';
  }
}

function cartaoDenuncia(denuncia) {
  const tipo = TIPOS[denuncia.tipo] || TIPOS.outro;
  const apoiado = denuncia.apoios.includes(API.usuario?.id);
  const foto = denuncia.foto
    ? `<img class="foto-denuncia" src="${escapar(denuncia.foto)}" alt="Foto da denúncia">`
    : `<div class="placeholder-foto">${tipo.icone}</div>`;
  const podeMudarStatus = denuncia.usuarioId === API.usuario?.id && denuncia.status !== 'resolvida';

  return `
    <article class="card" data-id="${denuncia.id}">
      <div class="card-cabecalho">
        <h4>${tipo.icone} ${escapar(denuncia.titulo)}</h4>
        <span class="etiqueta ${denuncia.status}">${STATUS[denuncia.status]}</span>
      </div>
      <p>${escapar(denuncia.descricao)}</p>
      ${foto}
      <div class="card-rodape">
        <span>por ${escapar(denuncia.autor?.nome || '?')} · ${dataCurta(denuncia.criadoEm)}</span>
        <button class="apoiar${apoiado ? ' ativo' : ''}" type="button">👍 ${denuncia.apoios.length}</button>
      </div>
      ${
        podeMudarStatus
          ? `<select class="mudar-status" style="margin-top:10px">
              <option value="">Mudar status…</option>
              <option value="em_analise">Marcar como em análise</option>
              <option value="resolvida">Marcar como resolvida</option>
            </select>`
          : ''
      }
    </article>
  `;
}

function renderizarDenuncias(denuncias) {
  const $lista = document.getElementById('listaDenuncias');

  if (!denuncias.length) {
    $lista.innerHTML =
      '<p class="vazio">Nenhuma denúncia por aqui ainda. Seja a primeira pessoa a reportar! 💚</p>';
    return;
  }

  $lista.innerHTML = denuncias.map(cartaoDenuncia).join('');

  $lista.querySelectorAll('.card').forEach((cartao) => {
    const id = Number(cartao.dataset.id);

    cartao.querySelector('.apoiar')?.addEventListener('click', async (evento) => {
      const botao = evento.currentTarget;
      try {
        const resposta = await API.apoiar(id);
        botao.classList.toggle('ativo', resposta.apoiou);
        botao.textContent = `👍 ${resposta.apoios}`;
      } catch (erro) {
        alert(erro.message);
      }
    });

    cartao.querySelector('.mudar-status')?.addEventListener('change', async (evento) => {
      const novoStatus = evento.target.value;
      if (!novoStatus) return;
      try {
        await API.alterarStatus(id, novoStatus);
        navegar('#/inicio');
      } catch (erro) {
        alert(erro.message);
      }
    });
  });
}

/* ---------- Tela: Denunciar ---------- */

function telaDenunciar() {
  $conteudo.innerHTML = `
    <h3 class="secao-titulo">📸 Nova denúncia</h3>

    <form class="formulario" id="formDenuncia">
      <label>Tipo do problema
        <select name="tipo" required>
          <option value="" disabled selected>Selecione o tipo…</option>
          ${Object.entries(TIPOS)
            .map(([chave, valor]) => `<option value="${chave}">${valor.icone} ${valor.rotulo}</option>`)
            .join('')}
        </select>
      </label>

      <label>Título
        <input type="text" name="titulo" maxlength="120" placeholder="Resumo curto do problema" required>
      </label>

      <label>Descrição
        <textarea name="descricao" maxlength="1000" placeholder="Conte o que você encontrou…"></textarea>
      </label>

      <label>Foto do problema *
        <div class="area-foto">
          <img id="previewFoto" class="oculto" alt="Prévia da foto">
          <span id="textoFoto">📷 Tire uma foto ou escolha da galeria</span>
          <input type="file" name="foto" accept="image/*" capture="environment" required>
        </div>
      </label>

      <button type="button" class="botao-localizacao" id="botaoLocalizacao">
        📍 Usar minha localização <span class="coordenadas" id="coordenadas"></span>
      </button>
      <input type="hidden" name="latitude">
      <input type="hidden" name="longitude">

      <button type="submit" class="botao-principal" id="botaoEnviar">Enviar denúncia</button>
    </form>
  `;

  const $form = document.getElementById('formDenuncia');
  const $entradaFoto = $form.elements.foto;

  $entradaFoto.addEventListener('change', () => {
    const arquivo = $entradaFoto.files[0];
    if (!arquivo) return;

    const leitor = new FileReader();
    leitor.onload = () => {
      const $preview = document.getElementById('previewFoto');
      $preview.src = leitor.result;
      $preview.classList.remove('oculto');
      document.getElementById('textoFoto').textContent = 'Trocar foto';
    };
    leitor.readAsDataURL(arquivo);
  });

  document.getElementById('botaoLocalizacao').addEventListener('click', () => {
    if (!navigator.geolocation) {
      alert('Seu navegador não suporta localização.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (posicao) => {
        $form.elements.latitude.value = posicao.coords.latitude.toFixed(6);
        $form.elements.longitude.value = posicao.coords.longitude.toFixed(6);
        document.getElementById('coordenadas').textContent =
          `(${posicao.coords.latitude.toFixed(4)}, ${posicao.coords.longitude.toFixed(4)})`;
      },
      () => alert('Não foi possível obter sua localização.')
    );
  });

  $form.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const dados = Object.fromEntries(new FormData($form));
    const corpo = new FormData();
    corpo.append('tipo', dados.tipo);
    corpo.append('titulo', dados.titulo);
    corpo.append('descricao', dados.descricao);
    if (dados.latitude) corpo.append('latitude', dados.latitude);
    if (dados.longitude) corpo.append('longitude', dados.longitude);
    corpo.append('foto', $entradaFoto.files[0]);

    const $botao = document.getElementById('botaoEnviar');
    $botao.disabled = true;
    $botao.textContent = 'Enviando…';

    try {
      await API.criarDenuncia(corpo);
      alert('Denúncia enviada! Obrigado por cuidar da cidade. 💚');
      filtroTipoAtual = '';
      location.hash = '#/inicio';
    } catch (erro) {
      alert(erro.message);
      $botao.disabled = false;
      $botao.textContent = 'Enviar denúncia';
    }
  });
}

/* ---------- Tela: Chat ---------- */

async function telaChat() {
  $conteudo.innerHTML = `
    <h3 class="secao-titulo">💬 Chat da comunidade</h3>
    <div class="chat-container">
      <div class="chat-mensagens" id="chatMensagens">
        <p class="aviso-carregando">Carregando mensagens…</p>
      </div>
    </div>
    <form class="chat-form" id="formChat">
      <input type="text" id="campoMensagem" placeholder="Fale com a comunidade…" maxlength="500" autocomplete="off" required>
      <button type="submit" title="Enviar">➤</button>
    </form>
  `;

  const $mensagens = document.getElementById('chatMensagens');

  function bolha(mensagem) {
    const minha = mensagem.usuarioId === API.usuario?.id;
    return `
      <div class="msg${minha ? ' minha' : ''}" data-id="${mensagem.id}">
        <span class="autor">${escapar(minha ? 'Você' : mensagem.nome)}</span>
        ${escapar(mensagem.texto)}
        <span class="hora">${horaCurta(mensagem.criadoEm)}</span>
      </div>
    `;
  }

  function rolarParaOFim() {
    $mensagens.scrollTop = $mensagens.scrollHeight;
  }

  try {
    const historico = await API.mensagensChat();
    $mensagens.innerHTML = historico.length
      ? historico.map(bolha).join('')
      : '<p class="vazio">Nenhuma mensagem ainda. Diga olá! 👋</p>';
    rolarParaOFim();
  } catch {
    $mensagens.innerHTML = '<p class="vazio">Erro ao carregar o chat.</p>';
  }

  document.getElementById('formChat').addEventListener('submit', (evento) => {
    evento.preventDefault();
    const $campo = document.getElementById('campoMensagem');
    const texto = $campo.value.trim();
    if (!texto) return;
    socket?.emit('chat:mensagem', { texto });
    $campo.value = '';
  });

  window._chatAoReceber = (mensagem) => {
    if ($mensagens.querySelector(`[data-id="${mensagem.id}"]`)) return;
    $mensagens.insertAdjacentHTML('beforeend', bolha(mensagem));
    rolarParaOFim();
  };

  socket?.off('chat:nova', window._chatAoReceber);
  socket?.on('chat:nova', window._chatAoReceber);
}

function encerrarSocket() {
  socket?.disconnect();
  socket = null;
}

function conectarSocket() {
  encerrarSocket();
  socket = io({ auth: { token: API.token } });
}

/* ---------- Tela: Perfil ---------- */

let modoEdicaoPerfil = false;

async function telaPerfil() {
  if (exigirLogin()) return;
  modoEdicaoPerfil = false;

  let perfil;
  try {
    perfil = await API.meuPerfil();
  } catch (erro) {
    if (erro.status === 401) {
      API.limparSessao();
      mostrarTelaAuth();
      return;
    }
    $conteudo.innerHTML = '<p class="vazio">Erro ao carregar perfil.</p>';
    return;
  }

  const estatisticas = perfil.estatisticas;

  $conteudo.innerHTML = `
    <div class="perfil-cabecalho">
      <div class="avatar-grande">${iniciais(perfil.nome)}</div>
      <h2>${escapar(perfil.nome)}</h2>
      <p class="cidade">${escapar(perfil.cidade || 'Cidade não informada')}</p>
      <p class="bio">${escapar(perfil.bio || '')}</p>

      <div class="estatisticas">
        <div class="estatistica"><strong>${estatisticas.denunciasEnviadas}</strong><span>Denúncias</span></div>
        <div class="estatistica"><strong>${estatisticas.denunciasResolvidas}</strong><span>Resolvidas</span></div>
        <div class="estatistica"><strong>${estatisticas.apoiosRecebidos}</strong><span>Apoios</span></div>
      </div>
    </div>

    <form class="formulario oculto" id="formEditarPerfil">
      <label>Nome
        <input type="text" name="nome" value="${escapar(perfil.nome)}" required>
      </label>
      <label>Cidade
        <input type="text" name="cidade" value="${escapar(perfil.cidade)}" placeholder="Sua cidade - UF">
      </label>
      <label>Bio
        <textarea name="bio" maxlength="300" placeholder="Fale um pouco sobre você…">${escapar(perfil.bio)}</textarea>
      </label>
      <button type="submit" class="botao-principal">Salvar alterações</button>
    </form>

    <div class="acoes-perfil">
      <button class="botao-secundario" id="botaoEditar" type="button">✏️ Editar perfil</button>
      <button class="botao-secundario botao-sair" id="botaoSair" type="button">Sair</button>
    </div>

    <h3 class="secao-titulo">Minhas denúncias</h3>
    <div class="lista-minhas" id="minhasDenuncias"><p class="aviso-carregando">Carregando…</p></div>
  `;

  document.getElementById('botaoSair').addEventListener('click', () => {
    API.limparSessao();
    mostrarTelaAuth();
  });

  document.getElementById('botaoEditar').addEventListener('click', () => {
    modoEdicaoPerfil = !modoEdicaoPerfil;
    document.getElementById('formEditarPerfil').classList.toggle('oculto', !modoEdicaoPerfil);
  });

  document.getElementById('formEditarPerfil').addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const dados = Object.fromEntries(new FormData(evento.target));
    try {
      const atualizado = await API.atualizarPerfil(dados);
      API.salvarSessao(API.token, { ...API.usuario, nome: atualizado.nome });
      atualizarAvatar();
      telaPerfil();
    } catch (erro) {
      alert(erro.message);
    }
  });

  try {
    const minhas = await API.minhasDenuncias();
    const $minhas = document.getElementById('minhasDenuncias');
    $minhas.innerHTML = minhas.length
      ? minhas
          .map((d) => {
            const tipo = TIPOS[d.tipo] || TIPOS.outro;
            return `
              <article class="card">
                <div class="linha-status">
                  <strong>${tipo.icone} ${escapar(d.titulo)}</strong>
                  <span class="etiqueta ${d.status}">${STATUS[d.status]}</span>
                </div>
                <p style="margin-top:0">${escapar(d.descricao)}</p>
                <div class="card-rodape">
                  <span>${dataCurta(d.criadoEm)}</span>
                  <span>👍 ${d.apoios.length}</span>
                </div>
              </article>
            `;
          })
          .join('')
      : '<p class="vazio">Você ainda não enviou denúncias.</p>';
  } catch {
    document.getElementById('minhasDenuncias').innerHTML =
      '<p class="vazio">Erro ao carregar suas denúncias.</p>';
  }
}

/* ---------- Inicialização ---------- */

configurarFormulariosAuth();

if (API.token) {
  mostrarAplicativo();
} else {
  mostrarTelaAuth();
}
