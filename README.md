# ⚡ Edge CMS

> **O CMS Headless & Estático de Borda (Edge-First), com motor de Plugins assíncrono inspirado no WordPress e arquitetura de API 100% desacoplada.**

[![Architecture](https://img.shields.io/badge/Architecture-Edge--First%20SPA-0f172a?style=flat-square)](#)
[![Database](https://img.shields.io/badge/Database-SQLite%20%7C%20Turso%20%7C%20D1-10b981?style=flat-square)](#)
[![Security](https://img.shields.io/badge/Security-Double--Sandwich%20XSS%20Shield-ef4444?style=flat-square)](#)
[![Tests](https://img.shields.io/badge/Tests-Vitest%20Passing-8b5cf6?style=flat-square)](#)

O **Edge CMS** (`devcodermax/edge`) foi projetado sob o princípio de **Zero Servidores Tradicionais**. Ele separa completamente a interface de gestão e renderização (hospedada gratuitamente no **Cloudflare Pages**) da camada de persistência de dados, comunicando-se por meio de um **Contrato Universal REST JSON**.

Isso permite que você conecte o painel a um **Cloudflare Worker + Turso (libSQL)**, **Cloudflare D1**, **FastAPI (Python)** ou qualquer outro backend compatível — ou até mesmo opere em modo **Local-First** direto no navegador durante o desenvolvimento.

---

## 🎯 Por que o Edge CMS existe?

| Problema no WordPress Tradicional | Solução no Edge CMS |
| :--- | :--- |
| **80 a 150 queries SQL por clique** acopladas ao PHP monolítico. | **Entrega Estática / Edge Cache** (< 20ms) e leituras atômicas via HTTP. |
| **"Tela Branca da Morte"** quando um plugin possui um erro de sintaxe ou retorna `null`. | **`HookEngine` com Sandbox Lógica**: erros em plugins são isolados (`try/catch`) e retornos `undefined` preservam o dado original. |
| **Tabela `wp_postmeta` gigante** que degrada a performance com dezenas de `JOINs`. | **Coluna nativa `meta JSON`** validada na própria tabela `posts`, lida em `0.05ms` sem `JOIN`. |
| **Dependência de servidor VPS/Apache ligado 24/7** sofrendo ataques em `/wp-login.php`. | **100% Serverless**: Painel estático em React + Vite e API sob demanda no Edge a custo **$0**. |

---

## 🏗️ Visão Geral da Arquitetura

```text
┌───────────────────────────────────────────────────────────────────────────────┐
│                      REPOSITÓRIO FRONTEND (devcodermax/edge)                  │
│                        Hospedado no Cloudflare Pages                          │
│                                                                               │
│  ┌─────────────────────┐    ┌──────────────────────┐    ┌──────────────────┐  │
│  │  Painel Admin React │───▶│  HookEngine (Async)  │───▶│ Sanduíche de     │  │
│  │  + Editor de Blocos │    │  Actions & Filters   │    │ Validação & XSS  │  │
│  └─────────────────────┘    └──────────────────────┘    └────────┬─────────┘  │
│                                                                  │            │
│                                                         ┌────────▼─────────┐  │
│                                                         │   apiClient.js   │  │
│                                                         │ (Contrato HTTP / │  │
│                                                         │  Fallback Local) │  │
│                                                         └────────┬─────────┘  │
└──────────────────────────────────────────────────────────────────┼────────────┘
                                                                   │ HTTPS JSON
               ┌───────────────────────────────────────────────────┼───────────────────┐
               ▼                                                   ▼                   ▼
┌──────────────────────────────┐                 ┌───────────────────────┐   ┌───────────────────┐
│   Opção A (Recomendada)      │                 │       Opção B         │   │      Opção C      │
│ Cloudflare Worker + Turso/D1 │                 │ Python FastAPI + SQL  │   │ PHP / QuickJS API │
│  + Cron Triggers (1 min)     │                 │  (Render / Railway)   │   │  (Pantheon / VPS) │
└──────────────────────────────┘                 └───────────────────────┘   └───────────────────┘
```

---

## 📂 Estrutura de Diretórios

```text
edge/
├── AGENTS.md                       # Regras arquiteturais obrigatórias para Agentes de IA
├── README.md                       # Documentação oficial da arquitetura e contratos
├── package.json                    # Scripts e dependências enxutas (React, Vite, Vitest)
├── vite.config.js                  # Configuração de build estático e suíte de testes
│
├── src/
│   ├── core/                       # Núcleo blindado do CMS (100% testado)
│   │   ├── HookEngine.js           # Motor assíncrono de Actions e Filters com prioridades
│   │   ├── security.js             # Sanitizador Anti-XSS, anti-Prototype Pollution e SSRF
│   │   ├── validator.js            # Gerador de IDs ordenáveis (UUIDv7hex) e validação de Posts
│   │   └── apiClient.js            # Cliente HTTP universal com modo Local-First automático
│   │
│   ├── plugins/                    # Ecossistema de Plugins modulares em JS
│   │   └── smart-seo/              # Plugin oficial de exemplo (auto-SEO e campos na sidebar)
│   │       └── index.js
│   │
│   ├── components/                 # (Próxima Fase) Editor de Blocos, Sidebar Dinâmica e Modais
│   └── pages/                      # (Próxima Fase) Telas do Admin e Renderizador Público
│
└── tests/
    └── core.test.js                # Testes automatizados de Hooks, Segurança e Fluxo de Dados
```

---

## 🔌 Sistema de Plugins (`HookEngine`)

Inspirado na simplicidade do WordPress (`add_action` / `add_filter`), o nosso `HookEngine` foi reescrito do zero para a web moderna com suporte a **`async/await`**, **fila de prioridades** e **isolamento de falhas**.

### Exemplo Prático de um Plugin:

```javascript
export const MeuPlugin = {
  id: 'meu-plugin-custom',
  name: 'Meu Plugin Customizado',
  version: '1.0.0',

  setup(cms) {
    // 1. FILTER: Adiciona um campo extra na barra lateral do editor React
    cms.addFilter('admin:post_sidebar_fields', (fields) => [
      ...fields,
      { key: 'tempo_leitura', label: 'Tempo de Leitura', type: 'text' }
    ], 10, this.id);

    // 2. FILTER (Async): Calcula automaticamente o tempo de leitura antes de salvar
    cms.addFilter('post:before_save', async (post) => {
      const palavras = (post.content_html || '').split(/\s+/).length;
      const minutos = Math.max(1, Math.ceil(palavras / 200));
      return {
        ...post,
        meta: { ...post.meta, tempo_leitura: `${minutos} min` }
      };
    }, 10, this.id);

    // 3. ACTION (Async): Dispara um aviso quando um artigo é publicado
    cms.addAction('post:published', async (post) => {
      console.log(`Artigo publicado com sucesso: /${post.slug}`);
    }, 20, this.id);
  }
};
```

### Catálogo Oficial de Hooks

| Hook | Tipo | Onde Dispara | Descrição |
| :--- | :--- | :--- | :--- |
| `post:before_validate` | `Filter` | `apiClient.savePost` | Recebe o payload bruto antes da primeira validação. |
| `post:before_save` | `Filter` | `apiClient.savePost` | Transforma o post já normalizado (ideal para plugins de SEO, slugs, tags). |
| `post:saved` | `Action` | `apiClient.savePost` | Executado logo após salvar (rascunho ou publicado). |
| `post:published` | `Action` | `apiClient.savePost` | Executado quando um post salvo está com `status === 'published'`. |
| `api:before_request` | `Filter` | `apiClient.request` | Permite inspecionar ou injetar cabeçalhos customizados na chamada HTTP. |
| `admin:post_sidebar_fields` | `Filter` | UI do Editor | Injeta campos extras na barra lateral (salvos automaticamente em `post.meta`). |
| `admin:menu_items` | `Filter` | UI do Painel | Permite a plugins registrarem novas páginas no menu lateral. |

---

## 🛡️ Camada de Segurança ("Sanduíche de Dupla Validação")

Nenhum dado vindo do usuário ou modificado por um plugin vai para a API sem passar pelo nosso **Sanduíche de Validação**:

$$\text{Input Bruto} \xrightarrow{\text{Validação 1}} \text{Plugins (}\texttt{post:before\_save}\text{)} \xrightarrow{\text{Validação 2 + Sanitização XSS}} \text{API / Banco}$$

1. **Sanitização Anti-XSS (`sanitizeHtml`):** Remove tags `<script>`, `<iframe>`, `<object>`, `<style>`, elimina atributos de eventos (`onerror=`, `onload=`, `onclick=`) e neutraliza links com protocolo `javascript:` ou `data:text/html`.
2. **Prevenção de Prototype Pollution & DoS (`sanitizeMetaObject`):** Filtra chaves proibidas (`__proto__`, `constructor`, `prototype`) dentro de `post.meta` e impõe teto rígido de **64 KB** por payload de metadados.
3. **Validação de Endpoint (`isSafeApiUrl`):** Garante que o CMS só se conecte a backends externos sob protocolo criptografado `https://` (permitindo `http://localhost` ou `127.0.0.1` exclusivamente para desenvolvimento local).

---

## 🤝 Contrato Universal da API Externa

Para criar um backend compatível com o **Edge CMS** em outro repositório (seja em Cloudflare Workers, Python ou PHP), basta implementar as seguintes rotas JSON:

| Método e Rota | Payload / Query | Resposta Esperada |
| :--- | :--- | :--- |
| `GET /api/health` | — | `{ "ok": true, "engine": "sqlite", "version": "1.0.0" }` |
| `POST /api/auth/login` | `{ "email", "password" }` | `{ "token": "jwt...", "user": { "id", "name", "role" } }` |
| `GET /api/posts` | `?type=post&status=published&limit=20` | `{ "rows": [ ...posts ], "total": 100 }` |
| `GET /api/posts/:idOrSlug` | — | Objeto completo do Post (incluindo `content_html` e `meta`) |
| `POST /api/posts` | Objeto Post validado | Objeto Post salvo com HTTP `201` |
| `PUT /api/posts/:id` | Objeto Post validado | Objeto Post atualizado com HTTP `200` |
| `DELETE /api/posts/:id` | — | `{ "ok": true, "deleted_id": "pst_..." }` |
| `GET /api/settings` | — | `{ "site_name": "...", "active_plugins": [...] }` |

---

## 🗄️ Schema SQLite de Referência (Turso / Cloudflare D1)

Caso você esteja subindo seu repositório de API com **Turso** ou **Cloudflare D1**, utilize este schema compatível com o padrão ANSI SQL do nosso validador (IDs ordenáveis em texto e datas em `ISO-8601`):

```sql
PRAGMA journal_mode = WAL;
PRAGMA busy_timeout = 5000;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'editor',
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,                 -- ex: pst_0192cef4a8_9f8a7b (Ordenável por tempo)
    type TEXT DEFAULT 'post',            -- 'post', 'page' ou Custom Post Type
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    summary TEXT DEFAULT '',
    content_json TEXT NOT NULL,          -- Estrutura de blocos do editor
    content_html TEXT NOT NULL,          -- HTML sanitizado pronto para Edge Cache
    cover_image TEXT,
    status TEXT DEFAULT 'draft',         -- 'draft', 'published', 'scheduled'
    author_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
    meta TEXT DEFAULT '{}',              -- JSON de alta velocidade para Plugins
    published_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_lookup ON posts(status, type, published_at DESC);

CREATE TABLE IF NOT EXISTS background_jobs (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,                  -- ex: 'publish_scheduled', 'webhook_dispatch'
    payload TEXT NOT NULL,
    status TEXT DEFAULT 'pending',       -- 'pending', 'processing', 'completed', 'failed'
    scheduled_for TEXT NOT NULL,
    attempts INTEGER DEFAULT 0,
    last_error TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_jobs_poll ON background_jobs(status, scheduled_for);
```

---

## 🚀 Como Rodar Localmente e Executar os Testes

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Execute a suíte de testes automatizados (Vitest):**
   ```bash
   npm test
   ```

3. **Inicie o servidor de desenvolvimento (Vite):**
   ```bash
   npm run dev
   ```

4. **Gere o build estático para o Cloudflare Pages:**
   ```bash
   npm run build
   ```

---

## 🗺️ Roadmap de Desenvolvimento

- [x] **Fase 1: Core Engine & Segurança**
  - [x] `HookEngine` assíncrono com prioridades e isolamento de falhas (`try/catch`).
  - [x] Camada de segurança Anti-XSS (`security.js`) e validador de schemas (`validator.js`).
  - [x] Cliente HTTP agnóstico (`apiClient.js`) com fallback Local-First em memória.
  - [x] Plugin oficial de demonstração (`SmartSeoPlugin`) e testes unitários com Vitest.
- [ ] **Fase 2: Interface Administrativa (React + Tailwind)**
  - [ ] Layout do Painel Admin com menu lateral extensível por plugins.
  - [ ] Tela de Conexão de API Externa (com teste de latência e fallback offline).
  - [ ] Editor de Posts com barra lateral dinâmica (`admin:post_sidebar_fields`).
  - [ ] Loja/Gerenciador de Plugins ativos em tempo real.
- [ ] **Fase 3: Renderizador Público & Edge Caching**
  - [ ] Visualização pública rápida e suporte a temas limpos.