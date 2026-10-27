import React, { useState, useEffect } from 'react';
import { Bold, Italic, Link, List, Quote } from 'lucide-react';
import { api } from '../../core/apiClient.js';
import { cms } from '../../core/HookEngine.js';

export function WpPostEditor({ initialPost, onSaveSuccess, onCancel }) {
  const [post, setPost] = useState(() => ({
    title: initialPost?.title || '',
    slug: initialPost?.slug || '',
    content_html: initialPost?.content_html || '',
    status: initialPost?.status || 'published',
    meta: initialPost?.meta || {}
  }));

  const [saving, setSaving] = useState(false);
  const [pluginFields, setPluginFields] = useState([]);

  useEffect(() => {
    async function loadFields() {
      const fields = await cms.applyFilters('admin:post_sidebar_fields', []);
      setPluginFields(fields);
    }
    loadFields();
  }, []);

  const handleSave = async (statusOverride = null) => {
    setSaving(true);
    try {
      const payload = {
        ...(initialPost || {}),
        ...post,
        status: statusOverride || post.status
      };
      const res = await api.savePost(payload);
      if (onSaveSuccess) onSaveSuccess(res);
    } catch (err) {
      alert(`Erro: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleInsertTag = (openTag, closeTag) => {
    const textarea = document.getElementById('wp-content-textarea');
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const selected = text.substring(start, end) || 'texto';
    const after = text.substring(end);
    setPost({ ...post, content_html: `${before}${openTag}${selected}${closeTag}${after}` });
  };

  return (
    <div className="font-sans text-[#2c3338] space-y-4">
      {/* Topo do Editor */}
      <div className="flex items-center justify-between pb-1">
        <h1 className="text-[23px] font-normal text-[#1d2327]">
          {initialPost?.id ? 'Editar post' : 'Adicionar novo post'}
        </h1>
        <button
          onClick={onCancel}
          className="text-[13px] text-[#2271b1] hover:underline"
        >
          Voltar para a lista
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Esquerda: Título + Barra de Ferramentas + Texto */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-[#c3c4c7] p-4 space-y-3 shadow-sm">
            <div>
              <input
                type="text"
                value={post.title}
                onChange={(e) => setPost({ ...post, title: e.target.value })}
                placeholder="Adicionar título"
                className="w-full bg-white border border-[#8c8f94] focus:border-[#2271b1] text-lg font-normal text-[#1d2327] p-2 focus:outline-none"
              />
            </div>

            <div className="text-[12px] text-[#646970] font-mono flex items-center gap-1">
              <span>Link permanente: https://meusite.com/</span>
              <input
                type="text"
                value={post.slug}
                onChange={(e) => setPost({ ...post, slug: e.target.value })}
                placeholder="slug-do-post"
                className="bg-white border border-[#8c8f94] px-1.5 py-0.5 text-[12px] text-[#2271b1] focus:outline-none"
              />
            </div>

            {/* Barra de Formatação */}
            <div className="flex items-center gap-1 p-1 bg-[#f6f7f7] border border-[#c3c4c7]">
              <button 
                type="button" 
                onClick={() => handleInsertTag('<strong>', '</strong>')} 
                className="p-1 hover:bg-[#dcdcde] text-[#2c3338] rounded"
                title="Negrito"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button 
                type="button" 
                onClick={() => handleInsertTag('<em>', '</em>')} 
                className="p-1 hover:bg-[#dcdcde] text-[#2c3338] rounded"
                title="Itálico"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button 
                type="button" 
                onClick={() => handleInsertTag('<h2>', '</h2>')} 
                className="p-1 hover:bg-[#dcdcde] text-[#2c3338] rounded text-xs font-bold"
                title="H2"
              >
                H2
              </button>
              <button 
                type="button" 
                onClick={() => handleInsertTag('<h3>', '</h3>')} 
                className="p-1 hover:bg-[#dcdcde] text-[#2c3338] rounded text-xs font-bold"
                title="H3"
              >
                H3
              </button>
              <button 
                type="button" 
                onClick={() => handleInsertTag('<blockquote>', '</blockquote>')} 
                className="p-1 hover:bg-[#dcdcde] text-[#2c3338] rounded"
                title="Citação"
              >
                <Quote className="w-3.5 h-3.5" />
              </button>
              <button 
                type="button" 
                onClick={() => handleInsertTag('<ul>\n  <li>', '</li>\n</ul>')} 
                className="p-1 hover:bg-[#dcdcde] text-[#2c3338] rounded"
                title="Lista"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button 
                type="button" 
                onClick={() => handleInsertTag('<a href="#">', '</a>')} 
                className="p-1 hover:bg-[#dcdcde] text-[#2c3338] rounded"
                title="Link"
              >
                <Link className="w-3.5 h-3.5" />
              </button>
            </div>

            <div>
              <textarea
                id="wp-content-textarea"
                rows={16}
                value={post.content_html}
                onChange={(e) => setPost({ ...post, content_html: e.target.value })}
                placeholder="Comece a digitar..."
                className="w-full bg-white border border-[#c3c4c7] p-3 text-[13px] text-[#2c3338] focus:border-[#2271b1] focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Coluna Direita: Caixas / Metaboxes */}
        <div className="space-y-4 text-[13px]">
          {/* Caixa: Publicar */}
          <div className="bg-white border border-[#c3c4c7] shadow-sm">
            <div className="px-3 py-2 border-b border-[#c3c4c7] font-semibold text-[14px] text-[#1d2327]">
              Publicar
            </div>
            <div className="p-3 space-y-2.5">
              <div className="flex justify-between text-[#646970]">
                <span>Status:</span>
                <select
                  value={post.status}
                  onChange={(e) => setPost({ ...post, status: e.target.value })}
                  className="bg-white border border-[#8c8f94] text-[#2c3338] rounded px-1.5 py-0.5 text-[12px] focus:outline-none"
                >
                  <option value="published">Publicado</option>
                  <option value="draft">Rascunho</option>
                </select>
              </div>

              <div className="flex justify-between text-[#646970]">
                <span>Visibilidade:</span>
                <strong className="text-[#2c3338] font-medium">Público</strong>
              </div>

              <div className="flex justify-between text-[#646970]">
                <span>Publicar:</span>
                <strong className="text-[#2c3338] font-medium">Imediatamente</strong>
              </div>

              <div className="pt-3 border-t border-[#f0f0f1] flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => handleSave('draft')}
                  disabled={saving}
                  className="px-2.5 py-1 bg-[#f6f7f7] hover:bg-[#f0f0f1] border border-[#8c8f94] text-[#2271b1] rounded text-[13px]"
                >
                  Salvar rascunho
                </button>
                <button
                  type="button"
                  onClick={() => handleSave('published')}
                  disabled={saving}
                  className="px-3 py-1 bg-[#2271b1] hover:bg-[#135e96] text-white font-medium rounded text-[13px] disabled:opacity-50"
                >
                  {saving ? 'Salvando...' : 'Publicar'}
                </button>
              </div>
            </div>
          </div>

          {/* Caixa: Categorias */}
          <div className="bg-white border border-[#c3c4c7] shadow-sm">
            <div className="px-3 py-2 border-b border-[#c3c4c7] font-semibold text-[14px] text-[#1d2327]">
              Categorias
            </div>
            <div className="p-3 space-y-1.5 text-[13px] text-[#2c3338]">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-[#8c8f94]" />
                <span>Geral</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-[#8c8f94]" />
                <span>Notícias</span>
              </label>
            </div>
          </div>

          {/* Caixa: Smart SEO Plugin */}
          {pluginFields.length > 0 && (
            <div className="bg-white border border-[#c3c4c7] shadow-sm">
              <div className="px-3 py-2 border-b border-[#c3c4c7] font-semibold text-[14px] text-[#1d2327]">
                Smart SEO
              </div>
              <div className="p-3 space-y-2.5">
                {pluginFields.map((field) => (
                  <div key={field.key}>
                    <label className="block text-[12px] text-[#646970] mb-1 font-medium">
                      {field.label}
                    </label>
                    <input
                      type="text"
                      value={post.meta?.[field.key] || ''}
                      onChange={(e) =>
                        setPost({
                          ...post,
                          meta: { ...(post.meta || {}), [field.key]: e.target.value }
                        })
                      }
                      className="w-full bg-white border border-[#8c8f94] rounded px-2 py-1 text-[12px] text-[#2c3338] focus:border-[#2271b1] focus:outline-none"
                      placeholder={field.placeholder || ''}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
