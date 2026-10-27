/**
 * Cliente HTTP Agnóstico com Fallback Local-First.
 * Permite conectar o CMS a qualquer backend externo (Cloudflare Worker + Turso, Python, PHP)
 * ou operar em modo local (memória/localStorage) para desenvolvimento e testes instantâneos.
 */
import { cms } from './HookEngine.js';
import { isSafeApiUrl } from './security.js';
import { validateAndNormalizePost } from './validator.js';

export class ApiClient {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || '';
    this.token = options.token || '';
    this.localStore = new Map();
  }

  /**
   * Configura e valida a URL da API externa e o Token de acesso.
   */
  setConfig(url, token = '') {
    if (url && !isSafeApiUrl(url)) {
      throw new Error(
        'URL de API insegura ou inválida. Use HTTPS (ou http://localhost para desenvolvimento).'
      );
    }
    this.baseUrl = url ? url.trim().replace(/\/$/, '') : '';
    this.token = token.trim();
  }

  isRemoteConfigured() {
    return Boolean(this.baseUrl);
  }

  async request(endpoint, options = {}) {
    const reqConfig = await cms.applyFilters('api:before_request', {
      url: `${this.baseUrl}${endpoint}`,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
        ...(options.headers || {})
      },
      body: options.body
    });

    const response = await fetch(reqConfig.url, {
      method: reqConfig.method,
      headers: reqConfig.headers,
      body: reqConfig.body
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || `Erro HTTP ${response.status}`);
    }
    return data;
  }

  /**
   * Fluxo completo de salvamento de Post:
   * 1. Passa pelo filtro 'post:before_validate'
   * 2. Valida tipos, gera ID/Slug e sanitiza HTML/Meta contra XSS
   * 3. Passa pelo filtro 'post:before_save' (para plugins como Smart SEO atuarem)
   * 4. Revalida segurança final e envia para a API (ou banco local)
   * 5. Dispara as actions 'post:saved' e 'post:published'
   */
  async savePost(rawPost) {
    const preFiltered = await cms.applyFilters('post:before_validate', { ...rawPost });
    const validated = validateAndNormalizePost(preFiltered);
    const pluginModified = await cms.applyFilters('post:before_save', validated);
    const finalPost = validateAndNormalizePost(pluginModified);

    let savedRecord;
    if (this.isRemoteConfigured()) {
      const isUpdate = Boolean(rawPost.id);
      const endpoint = isUpdate ? `/api/posts/${encodeURIComponent(finalPost.id)}` : '/api/posts';
      savedRecord = await this.request(endpoint, {
        method: isUpdate ? 'PUT' : 'POST',
        body: JSON.stringify(finalPost)
      });
    } else {
      // Modo Local-First (desenvolvimento/testes sem backend externo)
      this.localStore.set(finalPost.id, finalPost);
      savedRecord = finalPost;
    }

    await cms.doAction('post:saved', savedRecord);
    if (savedRecord.status === 'published') {
      await cms.doAction('post:published', savedRecord);
    }

    return savedRecord;
  }

  async listPosts() {
    if (this.isRemoteConfigured()) {
      return this.request('/api/posts');
    }
    return {
      rows: Array.from(this.localStore.values()).sort((a, b) =>
        b.created_at.localeCompare(a.created_at)
      ),
      total: this.localStore.size
    };
  }
}

export const api = new ApiClient();
