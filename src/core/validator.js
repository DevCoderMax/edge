/**
 * Validador de Schemas e Gerador de Identificadores Universais (SQLite / Postgres / MySQL)
 * Segue as 2 Regras de Ouro:
 * 1. IDs em texto ordenáveis cronologicamente (estilo UUIDv7 / ULID com prefixo)
 * 2. Datas sempre em ISO-8601 UTC
 */
import { sanitizeHtml, sanitizeMetaObject } from './security.js';

const VALID_STATUSES = new Set(['draft', 'published', 'scheduled']);
const VALID_TYPES = new Set(['post', 'page']);

/**
 * Gera um ID único ordenável por tempo (ex: pst_0192cef4a8_9f8a7b)
 */
export function generateId(prefix = 'pst') {
  const timestampHex = Date.now().toString(16).padStart(12, '0');
  const randomPart = Array.from({ length: 10 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
  return `${prefix}_${timestampHex}_${randomPart}`;
}

/**
 * Converte qualquer título em um slug URL-safe limpo (remove acentos e caracteres especiais).
 */
export function slugify(text) {
  if (typeof text !== 'string') return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

/**
 * Valida e normaliza um payload de Post/Página antes de enviar para a API ou salvar no banco.
 */
export function validateAndNormalizePost(input = {}) {
  const errors = [];

  const title = typeof input.title === 'string' ? input.title.trim() : '';
  if (!title || title.length < 2) {
    errors.push('O título do post é obrigatório e deve ter pelo menos 2 caracteres.');
  }
  if (title.length > 250) {
    errors.push('O título do post não pode exceder 250 caracteres.');
  }

  const slug = input.slug ? slugify(input.slug) : slugify(title);
  if (!slug) {
    errors.push('Não foi possível gerar um slug válido para o post.');
  }

  const type = input.type || 'post';
  if (!VALID_TYPES.has(type) && !/^[a-z0-9_]{2,32}$/.test(type)) {
    errors.push(`Tipo de post inválido: "${type}".`);
  }

  const status = input.status || 'draft';
  if (!VALID_STATUSES.has(status)) {
    errors.push(`Status inválido: "${status}". Valores aceitos: draft, published, scheduled.`);
  }

  let meta = {};
  try {
    meta = sanitizeMetaObject(
      typeof input.meta === 'string' ? JSON.parse(input.meta) : input.meta || {}
    );
  } catch (err) {
    errors.push(err.message || 'O objeto meta contém JSON inválido.');
  }

  if (errors.length > 0) {
    const error = new Error(errors.join(' '));
    error.validationErrors = errors;
    throw error;
  }

  const nowIso = new Date().toISOString();
  const contentHtml = sanitizeHtml(input.content_html || '');
  const contentJson =
    typeof input.content_json === 'string'
      ? input.content_json
      : JSON.stringify(input.content_json || []);

  return {
    id: input.id && typeof input.id === 'string' ? input.id : generateId('pst'),
    type,
    title,
    slug,
    summary: typeof input.summary === 'string' ? input.summary.trim().slice(0, 500) : '',
    content_json: contentJson,
    content_html: contentHtml,
    cover_image: typeof input.cover_image === 'string' ? input.cover_image.trim() : null,
    status,
    meta,
    published_at:
      status === 'published' ? input.published_at || nowIso : input.published_at || null,
    created_at: input.created_at || nowIso,
    updated_at: nowIso
  };
}
