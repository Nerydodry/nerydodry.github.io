# 🌿 CidadeViva

Plataforma colaborativa (site/aplicativo) para **denunciar problemas ambientais urbanos**:

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
| 💬 Chat da comunidade | Conversa em tempo real entre usuários sobre os problemas das cidades (Socket.IO) |
| 👍 Apoio nas denúncias | Dê um "joinha" nas denúncias para mostrar relevância |
| 🔄 Acompanhamento de status | Denúncias marcadas como *Aberta*, *Em análise* ou *Resolvida* |

## 🛠️ Tecnologias

- **Frontend:** HTML5, CSS3 e JavaScript puro (SPA sem frameworks)
- **Backend:** Node.js + Express
- **Banco de dados:** arquivo JSON (`data/db.json`) — simples e sem dependências externas
- **Autenticação:** JWT + bcrypt
- **Upload de fotos:** Multer (armazenadas em `uploads/`)
- **Tempo real:** Socket.IO

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
│       ├── reportRoutes.js    # Denúncias + upload de foto
│       └── chatRoutes.js      # Mensagens do chat
├── frontend/
│   ├── index.html             # SPA (telas de login, feed, denúncia, chat, perfil)
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

| Método | Rota                        | Descrição                          |
| ------ | --------------------------- | ---------------------------------- |
| POST   | `/api/auth/registrar`       | Criar conta                        |
| POST   | `/api/auth/login`           | Entrar                             |
| GET    | `/api/usuarios/eu`          | Meu perfil + estatísticas          |
| PUT    | `/api/usuarios/eu`          | Editar meu perfil                  |
| GET    | `/api/denuncias`            | Listar denúncias (com filtros)     |
| POST   | `/api/denuncias`            | Criar denúncia (multipart + foto)  |
| PATCH  | `/api/denuncias/:id/status` | Alterar status (só o autor)        |
| POST   | `/api/denuncias/:id/apoio`  | Alternar apoio 👍                  |
| GET    | `/api/chat/mensagens`       | Histórico do chat                  |

## 🗺️ Próximos passos (roadmap)

- [ ] Mapa interativo com marcadores das denúncias
- [ ] Notificações quando uma denúncia for resolvida
- [ ] Integração direta com órgãos públicos (prefeitura, bombeiros)
- [ ] Versão instalável como PWA

## 📝 Licença

MIT — use, estude e melhore livremente.
