# 📄 CidadeViva — Documentação da API

API REST do CidadeViva, plataforma colaborativa de denúncias ambientais urbanas.

**URL base:** `http://localhost:3000/api`

**Formato:** todas as requisições e respostas usam JSON (`Content-Type: application/json`), exceto o upload de fotos (multipart/form-data).

**Autenticação:** após login/registro, envie o token JWT no cabeçalho:

```
Authorization: Bearer <token>
```

---

## Sumário

- [Autenticação](#autenticação)
- [Usuários](#usuários)
- [Denúncias](#denúncias)
- [Chat da comunidade](#chat-da-comunidade)
- [Eventos em tempo real (Socket.IO)](#eventos-em-tempo-real-socketio)
- [Códigos de erro](#códigos-de-erro)

---

## Autenticação

### `POST /api/auth/registrar`

Cria uma nova conta.

**Corpo:**

| Campo  | Tipo   | Obrigatório | Regra                    |
| ------ | ------ | ----------- | ------------------------ |
| `nome` | string | ✅          |                          |
| `email`| string | ✅          | deve ser único           |
| `senha`| string | ✅          | mínimo de 6 caracteres   |

**Exemplo:**

```bash
curl -X POST http://localhost:3000/api/auth/registrar \
  -H "Content-Type: application/json" \
  -d '{"nome":"Maria Souza","email":"maria@email.com","senha":"123456"}'
```

**Resposta `201 Created`:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "usuario": {
    "id": 3,
    "nome": "Maria Souza",
    "email": "maria@email.com",
    "cidade": "",
    "bio": "",
    "criadoEm": "2026-08-24T12:00:00.000Z"
  }
}
```

### `POST /api/auth/login`

Autentica um usuário existente.

**Corpo:** `email`, `senha`.

**Exemplo:**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"maria@email.com","senha":"123456"}'
```

**Resposta `200 OK`:** igual ao registro (`token` + `usuario`).

---

## Usuários

### `GET /api/usuarios/eu` 🔒

Retorna o perfil do usuário autenticado com estatísticas.

**Resposta `200 OK`:**

```json
{
  "id": 1,
  "nome": "Maria Souza",
  "email": "maria@email.com",
  "cidade": "Cuiabá - MT",
  "bio": "Apaixonada pelo meio ambiente 🌱",
  "criadoEm": "2026-07-25T12:00:00.000Z",
  "estatisticas": {
    "denunciasEnviadas": 2,
    "denunciasResolvidas": 1,
    "apoiosRecebidos": 1
  }
}
```

### `PUT /api/usuarios/eu` 🔒

Atualiza nome, cidade e bio do usuário autenticado. Campos são opcionais.

**Corpo:** `nome`, `cidade`, `bio` (máx. 300 caracteres).

```bash
curl -X PUT http://localhost:3000/api/usuarios/eu \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"cidade":"Rondonópolis - MT","bio":"Fiscal ambiental"}'
```

**Resposta `200 OK`:** perfil atualizado + `estatisticas`.

### `GET /api/usuarios/:id`

Perfil público de qualquer usuário (sem e-mail).

---

## Denúncias

Tipos aceitos em `tipo`: `lixo`, `vazamento_agua`, `queimada`, `desmatamento`, `esgoto`, `outro`.
Status possíveis: `aberta`, `em_analise`, `resolvida`.

### `POST /api/denuncias` 🔒

Cria uma denúncia com foto. Requisição `multipart/form-data`.

| Campo       | Tipo   | Obrigatório | Observação                        |
| ----------- | ------ | ----------- | --------------------------------- |
| `foto`      | file   | ✅          | imagem até **5 MB**               |
| `tipo`      | string | ✅          | ver tipos aceitos acima           |
| `titulo`    | string | ✅          | máx. 120 caracteres               |
| `descricao` | string | ➖          | máx. 1000 caracteres              |
| `latitude`  | number | ➖          | coordenada GPS                    |
| `longitude` | number | ➖          | coordenada GPS                    |

**Exemplo:**

```bash
curl -X POST http://localhost:3000/api/denuncias \
  -H "Authorization: Bearer <token>" \
  -F "foto=@minha-foto.jpg" \
  -F "tipo=lixo" \
  -F "titulo=Entulho na praça" \
  -F "descricao=Sacolas jogadas perto do parquinho" \
  -F "latitude=-15.6014" \
  -F "longitude=-56.0979"
```

**Resposta `201 Created`:**

```json
{
  "id": 4,
  "usuarioId": 1,
  "tipo": "lixo",
  "tipoRotulo": "Descarte irregular de lixo",
  "titulo": "Entulho na praça",
  "descricao": "Sacolas jogadas perto do parquinho",
  "latitude": -15.6014,
  "longitude": -56.0979,
  "foto": "/uploads/denuncia-1724498000000-123456.jpg",
  "status": "aberta",
  "statusRotulo": "Aberta",
  "apoios": [],
  "criadoEm": "2026-08-24T12:30:00.000Z",
  "autor": { "id": 1, "nome": "Maria Souza" }
}
```

### `GET /api/denuncias`

Lista denúncias públicas, mais recentes primeiro.

**Parâmetros de consulta (opcionais):**

| Parâmetro | Descrição                                    |
| --------- | -------------------------------------------- |
| `tipo`    | filtra por tipo                              |
| `status`  | filtra por status                            |
| `busca`   | busca textual em título e descrição          |
| `limite`  | quantidade máxima (padrão 50, máximo 100)    |

```bash
curl "http://localhost:3000/api/denuncias?tipo=queimada&limite=10"
```

### `GET /api/denuncias/minhas` 🔒

Lista apenas as denúncias do usuário autenticado.

### `GET /api/denuncias/:id`

Detalhe de uma denúncia.

### `PATCH /api/denuncias/:id/status` 🔒

Altera o status. **Somente o autor** pode alterar.

**Corpo:** `{ "status": "em_analise" }` (ou `"resolvida"`).

```bash
curl -X PATCH http://localhost:3000/api/denuncias/1/status \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"status":"resolvida"}'
```

### `POST /api/denuncias/:id/apoio` 🔒

Alterna o apoio ("👍") do usuário autenticado na denúncia.

**Resposta `200 OK`:**

```json
{ "apoios": 3, "apoiou": true }
```

---

## Chat da comunidade

### `GET /api/chat/mensagens`

Histórico das últimas mensagens (padrão: 50).

| Parâmetro  | Descrição                                   |
| ---------- | ------------------------------------------- |
| `antesDe`  | retorna mensagens com `id <= antesDe`       |
| `quantidade`| máx. de mensagens (padrão 50, máximo 100)  |

**Resposta `200 OK`:**

```json
[
  {
    "id": 1,
    "usuarioId": 1,
    "nome": "Maria Souza",
    "texto": "Oi pessoal!",
    "criadoEm": "2026-08-23T18:20:00.000Z"
  }
]
```

### `POST /api/chat/mensagens` 🔒 *(alternativa REST)*

Envia mensagem via HTTP. Em produção prefira o evento Socket.IO abaixo.

**Corpo:** `{ "texto": "mensagem de até 500 caracteres" }`

---

## Eventos em tempo real (Socket.IO)

Conecte informando o token JWT:

```js
const socket = io("http://localhost:3000", {
  auth: { token: "<token>" }
});
```

| Evento          | Direção         | Payload                  |
| --------------- | --------------- | ------------------------ |
| `chat:mensagem` | cliente → server| `{ texto: "..." }`       |
| `chat:nova`     | server → todos  | mensagem criada (igual à resposta REST) |

---

## Códigos de erro

| Código | Significado                                            |
| ------ | ------------------------------------------------------ |
| `400`  | Dados inválidos ou faltando (detalhe no campo `erro`)  |
| `401`  | Não autenticado (sem token, token inválido/expirado)   |
| `403`  | Sem permissão (ex.: alterar denúncia de outro usuário) |
| `404`  | Recurso não encontrado                                 |
| `409`  | Conflito (e-mail já cadastrado)                        |
| `500`  | Erro interno do servidor                               |

Todas as respostas de erro têm o formato:

```json
{ "erro": "Mensagem descritiva do problema." }
```

🔒 = requer cabeçalho `Authorization: Bearer <token>`
