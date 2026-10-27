/**
 * Camada de Segurança do Edge CMS
 * Proteção contra XSS, injeção de scripts, URLs maliciosas e poluição de objetos.
 */

const DANGEROUS_TAGS_REGEX = /<(script|iframe|object|embed|applet|meta|link|style|base|form)[^>]*>([\s\S]*?<\/\1>)?/gi;
const EVENT_HANDLER_ATTR_REGEX = /\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
const JS_PROTOCOL_REGEX = /(href|src|action|xlink:href)\s*=\s*(?:"\s*javascript:[^"]*"|'\s*javascript:[^']*'|\s*javascript:[^\s>]+)/gi;
const DATA_PROTOCOL_REGEX = /(href|src)\s*=\s*(?:"\s*data:text\/html[^"]*"|'\s*data:text\/html[^']*')/gi;

/**
 * Sanitiza HTML gerado pelo editor ou modificado por plugins,
 * removendo vetores de XSS (<script>, handlers on*, javascript: URIs).
 */
export function sanitizeHtml(dirtyHtml) {
  if (typeof dirtyHtml !== 'string') return '';
  return dirtyHtml
    .replace(DANGEROUS_TAGS_REGEX, '')
    .replace(EVENT_HANDLER_ATTR_REGEX, '')
    .replace(JS_PROTOCOL_REGEX, '$1="#"')
    .replace(DATA_PROTOCOL_REGEX, '$1="#"')
    .trim();
}

/**
 * Valida se a URL da API fornecida pelo usuário é segura.
 * Permite HTTPS para qualquer domínio ou HTTP apenas para localhost/127.0.0.1.
 */
export function isSafeApiUrl(rawUrl) {
  if (typeof rawUrl !== 'string' || !rawUrl.trim()) return false;
  try {
    const parsed = new URL(rawUrl.trim());
    if (parsed.protocol === 'https:') return true;
    if (
      parsed.protocol === 'http:' &&
      (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1')
    ) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Sanitiza um objeto JSON de metadados (post.meta) contra Prototype Pollution
 * e garante um limite de tamanho seguro (padrão: 64KB).
 */
export function sanitizeMetaObject(meta, maxBytes = 65536) {
  if (!meta || typeof meta !== 'object' || Array.isArray(meta)) {
    return {};
  }
  const clean = Object.create(null);
  for (const [key, value] of Object.entries(meta)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue;
    }
    clean[key] = value;
  }
  const serialized = JSON.stringify(clean);
  if (serialized.length > maxBytes) {
    throw new Error(`O campo meta excede o limite máximo de segurança (${maxBytes} bytes).`);
  }
  return JSON.parse(serialized);
}
