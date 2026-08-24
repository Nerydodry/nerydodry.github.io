const API = {
  get token() {
    return localStorage.getItem('cv_token');
  },
  get usuario() {
    try {
      return JSON.parse(localStorage.getItem('cv_usuario'));
    } catch {
      return null;
    }
  },

  salvarSessao(token, usuario) {
    localStorage.setItem('cv_token', token);
    localStorage.setItem('cv_usuario', JSON.stringify(usuario));
  },

  limparSessao() {
    localStorage.removeItem('cv_token');
    localStorage.removeItem('cv_usuario');
  },

  async requisitar(caminho, opcoes = {}) {
    const cabecalhos = { ...(opcoes.headers || {}) };

    if (this.token) {
      cabecalhos.Authorization = `Bearer ${this.token}`;
    }

    if (opcoes.body && !(opcoes.body instanceof FormData)) {
      cabecalhos['Content-Type'] = 'application/json';
      opcoes.body = JSON.stringify(opcoes.body);
    }

    const resposta = await fetch(caminho, { ...opcoes, headers: cabecalhos });
    const dados = await resposta.json().catch(() => ({}));

    if (!resposta.ok) {
      const erro = new Error(dados.erro || 'Erro inesperado.');
      erro.status = resposta.status;
      throw erro;
    }

    return dados;
  },

  registrar(nome, email, senha) {
    return this.requisitar('/api/auth/registrar', {
      method: 'POST',
      body: { nome, email, senha }
    });
  },

  login(email, senha) {
    return this.requisitar('/api/auth/login', {
      method: 'POST',
      body: { email, senha }
    });
  },

  listarDenuncias(filtros = {}) {
    const parametros = new URLSearchParams(
      Object.entries(filtros).filter(([, valor]) => valor)
    );
    const query = parametros.toString();
    return this.requisitar(`/api/denuncias${query ? `?${query}` : ''}`);
  },

  minhasDenuncias() {
    return this.requisitar('/api/denuncias/minhas');
  },

  criarDenuncia(formData) {
    return this.requisitar('/api/denuncias', {
      method: 'POST',
      body: formData
    });
  },

  alterarStatus(id, status) {
    return this.requisitar(`/api/denuncias/${id}/status`, {
      method: 'PATCH',
      body: { status }
    });
  },

  apoiar(id) {
    return this.requisitar(`/api/denuncias/${id}/apoio`, { method: 'POST' });
  },

  comentariosDenuncia(id) {
    return this.requisitar(`/api/denuncias/${id}/comentarios`);
  },

  comentar(id, texto) {
    return this.requisitar(`/api/denuncias/${id}/comentarios`, {
      method: 'POST',
      body: { texto }
    });
  },

  detalheDenuncia(id) {
    return this.requisitar(`/api/denuncias/${id}`);
  },

  listarNoticias(filtros = {}) {
    const parametros = new URLSearchParams(
      Object.entries(filtros).filter(([, valor]) => valor)
    );
    const query = parametros.toString();
    return this.requisitar(`/api/noticias${query ? `?${query}` : ''}`);
  },

  meuPerfil() {
    return this.requisitar('/api/usuarios/eu');
  },

  atualizarPerfil(dados) {
    return this.requisitar('/api/usuarios/eu', {
      method: 'PUT',
      body: dados
    });
  },

  mensagensChat(antesDe) {
    const query = antesDe ? `?antesDe=${antesDe}` : '';
    return this.requisitar(`/api/chat/mensagens${query}`);
  }
};
