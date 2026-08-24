# 🌿 CidadeViva

Plataforma colaborativa (site/aplicativo) para **denunciar problemas ambientais urbanos** e **acompanhar as notícias da sua cidade**:

- 🗑️ Descarte irregular de lixo
- 💧 Vazamentos de água
- 🔥 Queimadas
- 🌳 Desmatamento
- 🚱 Esgoto a céu aberto… e mais

## ✨ Funcionalidades

| Funcionalidade | Descrição |
| -------------- | --------- |
| 👤 Perfil de usuário | Cadastro, login com senha criptografada (JWT), edição de nome/cidade/bio e estatísticas de participação |
| 📸 Denúncia com foto | Tire uma foto do problema direto da câmera (ou escolha da galeria), informe tipo, descrição e localização GPS |
| 📍 Localização da denúncia | Capture as coordenadas GPS com um toque e veja o local em um mapa (OpenStreetMap) na página da denúncia |
| 💬 Chat da comunidade | Conversa em tempo real entre usuários sobre os problemas das cidades (Socket.IO) |
| 🗨️ Discussão por denúncia | Cada denúncia tem seu próprio tópico de comentários para a comunidade conversar sobre aquele problema específico — atualizado em tempo real |
| 📰 Notícias locais | Mural de notícias da cidade por categoria (meio ambiente, obras, saúde, eventos, mobilidade) |
| 👍 Apoio nas denúncias | Dê um "joinha" nas denúncias para mostrar relevância |
| 🔄 Acompanhamento de status | Denúncias marcadas como *Aberta*, *Em análise* ou *Resolvida* |

## 🛠️ Tecnologias

- **Frontend:** HTML5, CSS3 e JavaScript puro (SPA sem frameworks)
- **Backend:** Node.js + Express
- **Banco de dados:** arquivo JSON (`data/db.json`) — simples e sem dependências externas
- **Autenticação:** JWT + bcrypt
- **Upload de fotos:** Multer (armazenadas em `uploads/`)
- **Tempo real:** Socket.IO (chat da comunidade + comentários das denúncias)
- **Mapas:** OpenStreetMap (sem chave de API)

## 🚀 Como rodar

Pré-requisitos: [Node.js](https://nodejs.org) 18+ instalado.

```bash
# 1. Instalar dependências
npm install

# 2. (Opcional) configurar variáveis de ambiente
cp .env.example .env   # ajuste JWT_SECRET em produção!

# 3. (Opcional) popular o banco com dados de demonstração
npm run seed

# 4. Iniciar o servidor
npm start
```

Acesse **http://localhost:3000** 🎉

### Usuários de demonstração (após `npm run seed`)

| E-mail          | Senha  |
| --------------- | ------ |
| maria@demo.com  | 123456 |
| joao@demo.com   | 123456 |

Para desenvolvimento com reinício automático: `npm run dev`.

> O seed é incremental: ele preenche apenas coleções vazias (usuários, denúncias, mensagens, notícias e comentários).

## 📁 Estrutura do projeto

```
cidadeviva/
├── backend/
│   ├── server.js              # Servidor Express + Socket.IO
│   ├── db.js                  # Persistência em arquivo JSON
│   ├── utils.js               # Tipos/status e helpers
│   ├── seed.js                # Dados de demonstração
│   ├── middleware/auth.js     # Verificação do token JWT
│   └── routes/
│       ├── authRoutes.js      # Registro e login
│       ├── userRoutes.js      # Perfis de usuário
│       ├── reportRoutes.js    # Denúncias, foto, GPS e comentários
│       ├── noticiaRoutes.js   # Notícias locais
│       └── chatRoutes.js      # Mensagens do chat
├── frontend/
│   ├── index.html             # SPA (login, feed, denúncia, detalhe, notícias, chat, perfil)
│   ├── css/styles.css
│   └── js/
│       ├── api.js             # Cliente da API REST
│       └── app.js             # Rotas, telas e Socket.IO
├── docs/API.md                # 📄 Documentação completa da API
├── uploads/                   # Fotos das denúncias
└── data/                      # Banco de dados (db.json)
```

## 📄 API

A documentação completa dos endpoints está em [`docs/API.md`](docs/API.md).

Resumo:

| Método | Rota                              | Descrição                          |
| ------ | --------------------------------- | ---------------------------------- |
| POST   | `/api/auth/registrar`             | Criar conta                        |
| POST   | `/api/auth/login`                 | Entrar                             |
| GET    | `/api/usuarios/eu` 🔒             | Meu perfil + estatísticas          |
| PUT    | `/api/usuarios/eu` 🔒             | Editar meu perfil                  |
| GET    | `/api/denuncias`                  | Listar denúncias (com filtros)     |
| POST   | `/api/denuncias` 🔒               | Criar denúncia (multipart + foto)  |
| PATCH  | `/api/denuncias/:id/status` 🔒    | Alterar status (só o autor)        |
| POST   | `/api/denuncias/:id/apoio` 🔒     | Alternar apoio 👍                  |
| GET    | `/api/denuncias/:id/comentarios`  | Discussão da denúncia              |
| POST   | `/api/denuncias/:id/comentarios`🔒| Comentar na discussão              |
| GET    | `/api/noticias`                   | Notícias locais (filtros)          |
| GET    | `/api/chat/mensagens`             | Histórico do chat                  |

🔒 = requer token JWT.

## 🖼️ Telas

- **Início** — banner, filtros por tipo e feed de denúncias recentes
- **Denunciar** — formulário com foto da câmera e botão de GPS
- **Detalhe da denúncia** — foto ampliada, mapa, apoio, status e discussão em tempo real
- **Notícias** — mural de notícias da cidade com filtros por categoria
- **Chat** — conversa geral da comunidade em tempo real
- **Perfil** — avatar, estatísticas, edição de dados e minhas denúncias

## 🗺️ Próximos passos (roadmap)

- [ ] Mapa interativo com todos os marcadores das denúncias
- [x] Mapa na página individual da denúncia ✅
- [x] Notícias locais ✅
- [x] Discussão/comentários por denúncia ✅
- [ ] Notificações quando uma denúncia for resolvida
- [ ] Integração direta com órgãos públicos (prefeitura, bombeiros)
- [ ] Versão instalável como PWA

## 📝 Licença

MIT — use, estude e melhore livremente.
