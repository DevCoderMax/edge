# AGENTS.md — Diretrizes para Agentes de IA (`devcodermax/edge`)

Bem-vindo ao repositório **Edge CMS**. Se você é um Agente de IA (Cursor, Claude Code, Copilot, Windsurf, Gemini, etc.), leia e siga estritamente estas regras arquiteturais antes de criar ou modificar qualquer arquivo.

---

## 1. Filosofia e Escopo do Repositório
1. **100% Frontend / Edge SPA:** Este repositório contém **exclusivamente** o Frontend (Painel Admin + Renderizador Público + Core de Plugins). Ele é compilado de forma estática via Vite para rodar no **Cloudflare Pages**.
2. **Backend Desacoplado por Contrato:** NUNCA crie servidores Node.js/Express, conexões diretas de banco TCP ou código PHP dentro deste repositório. Toda comunicação com banco de dados (Turso/SQLite, D1, etc.) ocorre via HTTP REST através do cliente `src/core/apiClient.js`.
3. **Modo Fallback Local (Local-First Dev):** O `apiClient.js` possui um modo de armazenamento local (`localStorage`) quando nenhuma `API_URL` externa está configurada. Mantenha sempre a paridade entre o modo local e o contrato HTTP remoto para que os testes e o desenvolvimento funcionem sem depender de rede externa.
4. **Zero Dependências Pesadas:** Evite bibliotecas inchadas (como Moment.js, Lodash completo ou pacotes legados do WordPress). Priorize Web APIs nativas (`crypto.randomUUID`, `fetch`, `Intl`, `URL`).

---

## 2. Arquitetura do Sistema de Plugins (`HookEngine`)
Nosso CMS é movido por um motor inspirado na API de Hooks do WordPress (`add_action` / `add_filter`), porém **assíncrono (`async/await`)** e **isolado contra falhas**:
- **Actions (`cms.addAction` / `cms.doAction`):** Disparam efeitos colaterais (webhooks, logs, purga de cache). Erros em plugins são capturados e logados sem interromper o fluxo principal.
- **Filters (`cms.addFilter` / `cms.applyFilters`):** Transformam dados em cascata respeitando a ordem de `priority` (menor número executa primeiro; padrão = `10`).
- **Proteção contra `undefined`:** Se um plugin esquecer de retornar um valor num `Filter`, o `HookEngine` preserva automaticamente o estado anterior do dado.
- **Imutabilidade de Eventos Core:** Sempre passe os dados do post por `src/core/validator.js` e `src/core/security.js` **antes e depois** de executar os filtros dos plugins.

---

## 3. Regras de Segurança Obrigatórias
1. **Prevenção de XSS:** Todo HTML gerado ou vindo da API/plugins deve ser sanitizado por `src/core/security.js` (`sanitizeHtml`) antes de ser injetado no DOM. Tags `<script>`, `<iframe>` não autorizados, atributos `on*` (`onerror`, `onload`, `onclick`) e URLs `javascript:` são estritamente proibidos.
2. **Validação de URLs da API:** O endpoint da API configurado pelo usuário deve ser validado via `isSafeApiUrl()` (apenas protocolos `https:` em produção ou `http://localhost` / `http://127.0.0.1` em desenvolvimento).
3. **Isolamento de Metadados de Plugins:** Campos extras criados por plugins jamais devem alterar colunas estruturais sem validação; eles devem ser armazenados dentro do objeto `post.meta` (JSON validado com limite de tamanho).

---

## 4. Contrato Oficial da API Externa
Qualquer backend externo conectado a este CMS deve responder às seguintes rotas JSON:
- `GET /api/health` -> `{ "ok": true, "engine": "sqlite", "version": "1.0.0" }`
- `POST /api/auth/login` -> `{ "token": "jwt...", "user": { "id": "...", "name": "..." } }`
- `GET /api/posts?type=post&status=published&limit=20&offset=0` -> `{ "rows": [...], "total": 0 }`
- `GET /api/posts/:idOrSlug` -> `{ "id": "...", "title": "...", "slug": "...", "content_html": "...", "meta": {} }`
- `POST /api/posts` / `PUT /api/posts/:id` -> Recebe payload validado e retorna o post salvo.
- `DELETE /api/posts/:id` -> `{ "ok": true, "deleted_id": "..." }`
- `GET /api/settings` / `PUT /api/settings` -> Lê/salva configurações globais e lista de plugins ativos.

---

## 5. Testes e Qualidade de Código
- Todo código em `src/core/` deve ter cobertura de testes automatizados em `tests/` usando **Vitest**.
- Antes de concluir qualquer tarefa, execute `npm test` para garantir que:
  1. A fila de prioridades e o isolamento de erros do `HookEngine` funcionam.
  2. O sanitizador de segurança bloqueia vetores de XSS.
  3. O validador rejeita payloads malformados e normaliza slugs/IDs.
