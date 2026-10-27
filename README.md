# Edge ⚡

> **The Zero-Server, Edge-First Headless CMS.**  
> Ultra-fast, lightweight, decoupled content management powered by SQLite (Turso / Cloudflare D1), React, and Edge Networks.

---

## 🎯 Vision & Philosophy

Modern content management shouldn't require managing heavy Linux VPS instances, running Apache/PHP daemons, or fearing database crashes during traffic spikes.

**Edge** is built on four core principles:
1. **Zero Traditional Servers:** Runs entirely on edge infrastructure (Cloudflare Pages, Workers) and distributed SQLite (Turso / D1). $0 idle costs, zero server maintenance.
2. **Agnostic API Contract:** The React admin dashboard is completely decoupled from the backend. Connect it to an official Cloudflare Worker, a Python FastAPI microservice, or your own serverless endpoint.
3. **Notion-Like Visual Editing:** Modern block-based editing experience (via BlockNote/Tiptap) in pure React, producing clean, structured JSON and HTML.
4. **Surgical Edge Caching (ISR):** Sub-20ms page loads worldwide via Cloudflare Cache API, with instant cache invalidation upon post publishing — never burning monthly build minutes.

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────┐
│                      EDGE ADMIN                        │
│             React + Vite + Tailwind + BlockNote        │
│          - 100% Static SPA on Cloudflare Pages         │
│          - Clean, decoupled HTTP client                │
└──────────────────────────┬─────────────────────────────┘
                           │ Standard REST Contract
                           ▼
┌────────────────────────────────────────────────────────┐
│                       EDGE API                         │
│             Cloudflare Worker / Serverless             │
│          - Lightweight CRUD & Authentication           │
│          - Surgical Cache Purge on publish             │
└──────────────────────────┬─────────────────────────────┘
                           │ Clean SQL / Kysely
                           ▼
┌────────────────────────────────────────────────────────┐
│                     EDGE DATABASE                      │
│             SQLite / Turso / Cloudflare D1             │
│          - UUIDv7 primary keys & ISO-8601 timestamps   │
│          - WAL mode with high-throughput read/writes   │
└────────────────────────────────────────────────────────┘
```

---

## 🗺️ Roadmap

- [x] Architecture design & repository initialization
- [ ] Canonical SQLite Schema (UUIDv7, ISO-8601, posts, pages, media, settings)
- [ ] Universal REST API specification & Cloudflare Worker reference starter
- [ ] Edge Admin SPA (Vite + React + Tailwind + Notion-like block editor)
- [ ] Edge SSR / Static frontend with instant cache purge

---

## 📄 License

MIT © [DevCoderMax](https://github.com/DevCoderMax)
