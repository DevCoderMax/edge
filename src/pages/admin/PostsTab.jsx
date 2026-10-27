import React, { useState } from 'react';
import { Plus, Edit3, Trash2, CheckCircle, Clock, FileEdit, Sparkles } from 'lucide-react';
import { api } from '../../core/apiClient.js';
import { cms } from '../../core/HookEngine.js';

export function PostsTab({ posts, onRefresh }) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentPost, setCurrentPost] = useState({ title: '', content_html: '', status: 'published', meta: {} });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Busca campos dinâmicos injetados por plugins (Ex: Smart SEO) via Hook `admin:post_sidebar_fields`
  const [pluginFields, setPluginFields] = useState([]);

  React.useEffect(() => {
    async function loadSidebarFields() {
      const fields = await cms.applyFilters('admin:post_sidebar_fields', []);
      setPluginFields(fields);
    }
    loadSidebarFields();
  }, []);

  const handleOpenNew = () => {
    setCurrentPost({ title: '', content_html: '', status: 'published', meta: {} });
    setError('');
    setIsEditing(true);
  };

  const handleEdit = (post) => {
    setCurrentPost({ ...post, meta: post.meta || {} });
    setError('');
    setIsEditing(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.savePost(currentPost);
      setIsEditing(false);
      onRefresh();
    } catch (err) {
      setError(err.message || 'Erro ao salvar post.');
    } finally {
      setLoading(false);
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              {currentPost.id ? 'Editar Artigo' : 'Novo Artigo'}
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">Criado com validação e hooks de plugins integrados.</p>
          </div>
          <button
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg transition-all"
          >
            Voltar à Lista
          </button>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-2">
                  Título do Artigo *
                </label>
                <input
                  type="text"
                  required
                  value={currentPost.title}
                  onChange={(e) => setCurrentPost({ ...currentPost, title: e.target.value })}
                  placeholder="Ex: Como criar um app sem servidor"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-2">
                  Conteúdo (HTML Sanitizado) *
                </label>
                <textarea
                  rows={8}
                  required
                  value={currentPost.content_html}
                  onChange={(e) => setCurrentPost({ ...currentPost, content_html: e.target.value })}
                  placeholder="<p>Escreva seu conteúdo em HTML limpo...</p>"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-4 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono text-xs"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Tags perigosas (&lt;script&gt;, on* handlers) são removidas automaticamente por segurança.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
              <h3 className="text-sm font-semibold text-white border-b border-slate-800 pb-2">Publicação</h3>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Status</label>
                <select
                  value={currentPost.status}
                  onChange={(e) => setCurrentPost({ ...currentPost, status: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="published">Publicado</option>
                  <option value="draft">Rascunho</option>
                  <option value="scheduled">Agendado</option>
                </select>
              </div>

              {/* Renderização dinâmica dos campos injetados por Plugins via Hook */}
              {pluginFields.length > 0 && (
                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    Campos de Plugins (Hooks)
                  </div>
                  {pluginFields.map((field) => (
                    <div key={field.key}>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">{field.label}</label>
                      {field.type === 'textarea' ? (
                        <textarea
                          rows={3}
                          value={currentPost.meta?.[field.key] || ''}
                          onChange={(e) =>
                            setCurrentPost({
                              ...currentPost,
                              meta: { ...(currentPost.meta || {}), [field.key]: e.target.value }
                            })
                          }
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                      ) : (
                        <input
                          type="text"
                          value={currentPost.meta?.[field.key] || ''}
                          onChange={(e) =>
                            setCurrentPost({
                              ...currentPost,
                              meta: { ...(currentPost.meta || {}), [field.key]: e.target.value }
                            })
                          }
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg text-sm transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50"
              >
                {loading ? 'Salvando...' : 'Salvar & Publicar'}
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Artigos e Páginas</h2>
          <p className="text-sm text-slate-400 mt-1">Gerencie seus conteúdos e publique instantaneamente.</p>
        </div>
        <button
          onClick={handleOpenNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-all shadow-lg shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          Novo Artigo
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase bg-slate-950/50">
              <th className="p-4">Título</th>
              <th className="p-4">Status</th>
              <th className="p-4">Slug</th>
              <th className="p-4">Criado em</th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-sm">
            {posts.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">
                  Nenhum artigo cadastrado ainda. Clique em "Novo Artigo" para começar.
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr key={post.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 font-medium text-white">{post.title}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      post.status === 'published'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {post.status === 'published' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {post.status}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-xs text-slate-400">/{post.slug}</td>
                  <td className="p-4 text-xs text-slate-400">
                    {new Date(post.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleEdit(post)}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors inline-block"
                      title="Editar"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
