import React, { useState } from 'react';
import { MessageSquare, CornerDownRight, X } from 'lucide-react';
import { api } from '../../core/apiClient.js';

export function WpPostsTab({ posts, onRefresh, onEditPost, onNewPost }) {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [quickEditId, setQuickEditId] = useState(null);
  const [quickData, setQuickData] = useState({ title: '', slug: '', status: 'published' });
  const [savingQuick, setSavingQuick] = useState(false);

  const filteredPosts = posts.filter(p => {
    if (filter !== 'all' && p.status !== filter) return false;
    if (searchTerm) {
      return p.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
             p.slug?.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  const countPublished = posts.filter(p => p.status === 'published').length;
  const countDraft = posts.filter(p => p.status === 'draft').length;

  const handleStartQuickEdit = (post, e) => {
    e.stopPropagation();
    setQuickEditId(post.id);
    setQuickData({ title: post.title, slug: post.slug, status: post.status || 'published' });
  };

  const handleSaveQuickEdit = async (post) => {
    setSavingQuick(true);
    try {
      await api.savePost({
        ...post,
        title: quickData.title,
        slug: quickData.slug,
        status: quickData.status
      });
      setQuickEditId(null);
      onRefresh();
    } catch (err) {
      alert(`Erro: ${err.message}`);
    } finally {
      setSavingQuick(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Mover este artigo para a lixeira?')) return;
    try {
      await api.deletePost(id);
      onRefresh();
    } catch (err) {
      alert(`Erro: ${err.message}`);
    }
  };

  return (
    <div className="font-sans text-[#2c3338]">
      {/* Topo: Título + Botão Adicionar Novo + Ajuda */}
      <div className="flex items-center justify-between pb-3">
        <div className="flex items-center gap-2.5">
          <h1 className="text-[23px] font-normal text-[#1d2327]">Posts</h1>
          <button 
            onClick={onNewPost}
            className="px-2.5 py-1 text-[13px] text-[#2271b1] border border-[#2271b1] rounded hover:bg-[#2271b1] hover:text-white transition-colors"
          >
            Adicionar novo
          </button>
        </div>

        <div className="hidden sm:flex items-center space-x-2 text-[13px] text-[#2271b1]">
          <button className="px-2 py-0.5 hover:bg-[#f6f7f7] border border-transparent hover:border-[#dcdcde] rounded">
            Opções de tela ▾
          </button>
          <button className="px-2 py-0.5 hover:bg-[#f6f7f7] border border-transparent hover:border-[#dcdcde] rounded">
            Ajuda ▾
          </button>
        </div>
      </div>

      {/* Filtros de Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[13px] gap-2 mb-2">
        <div className="text-[#646970]">
          <button 
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'text-[#1d2327] font-semibold' : 'text-[#2271b1] hover:underline'}
          >
            Todos ({posts.length})
          </button>
          <span className="mx-1 text-[#dcdcde]">|</span>
          <button 
            onClick={() => setFilter('published')}
            className={filter === 'published' ? 'text-[#1d2327] font-semibold' : 'text-[#2271b1] hover:underline'}
          >
            Publicados ({countPublished})
          </button>
          <span className="mx-1 text-[#dcdcde]">|</span>
          <button 
            onClick={() => setFilter('draft')}
            className={filter === 'draft' ? 'text-[#1d2327] font-semibold' : 'text-[#2271b1] hover:underline'}
          >
            Rascunhos ({countDraft})
          </button>
        </div>

        <div className="flex items-center gap-1">
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar posts"
            className="bg-white border border-[#8c8f94] rounded px-2 py-1 text-[13px] text-[#2c3338] focus:border-[#2271b1] focus:outline-none w-56"
          />
          <button className="px-2.5 py-1 bg-[#f6f7f7] border border-[#8c8f94] text-[#2c3338] text-[13px] rounded hover:bg-[#f0f0f1]">
            Pesquisar posts
          </button>
        </div>
      </div>

      {/* Ações em Massa e Filtros de Data/Categoria */}
      <div className="flex items-center justify-between bg-transparent mb-2 text-[13px]">
        <div className="flex items-center gap-1.5 flex-wrap">
          <select className="bg-white border border-[#8c8f94] text-[#2c3338] rounded px-2 py-1 text-[13px] focus:outline-none">
            <option>Ações em massa</option>
            <option>Mover para a lixeira</option>
          </select>
          <button className="px-2.5 py-1 bg-[#f6f7f7] hover:bg-[#f0f0f1] text-[#2271b1] border border-[#2271b1] rounded text-[13px]">
            Aplicar
          </button>

          <select className="bg-white border border-[#8c8f94] text-[#2c3338] rounded px-2 py-1 text-[13px] focus:outline-none hidden md:block">
            <option>Todas as datas</option>
          </select>
          <select className="bg-white border border-[#8c8f94] text-[#2c3338] rounded px-2 py-1 text-[13px] focus:outline-none hidden md:block">
            <option>Todas as categorias</option>
          </select>
          <button className="px-2.5 py-1 bg-[#f6f7f7] hover:bg-[#f0f0f1] text-[#2271b1] border border-[#2271b1] rounded text-[13px] hidden md:block">
            Filtrar
          </button>
        </div>

        <span className="text-[#646970] text-[12px]">{filteredPosts.length} itens</span>
      </div>

      {/* Tabela Oficial de Posts */}
      <div className="bg-white border border-[#c3c4c7] shadow-sm">
        <table className="w-full text-left border-collapse text-[13px]">
          <thead>
            <tr className="border-b border-[#c3c4c7] bg-[#f6f7f7] text-[#2c3338] font-semibold">
              <th className="p-2.5 w-8">
                <input type="checkbox" className="rounded border-[#8c8f94]" />
              </th>
              <th className="p-2.5">Título</th>
              <th className="p-2.5 w-28 hidden md:table-cell">Autor</th>
              <th className="p-2.5 w-32 hidden md:table-cell">Categorias</th>
              <th className="p-2.5 w-24 hidden lg:table-cell">Tags</th>
              <th className="p-2.5 w-14 text-center hidden sm:table-cell">
                <MessageSquare className="w-3.5 h-3.5 inline text-[#646970]" />
              </th>
              <th className="p-2.5 w-36">Data</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#c3c4c7]">
            {filteredPosts.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-[#646970]">
                  Nenhum post encontrado.
                </td>
              </tr>
            ) : (
              filteredPosts.map((post) => {
                const isQuick = quickEditId === post.id;

                if (isQuick) {
                  return (
                    <tr key={post.id} className="bg-[#f0f6fc]">
                      <td colSpan={7} className="p-4 space-y-3">
                        <div className="flex items-center justify-between border-b border-[#c3c4c7] pb-2">
                          <span className="font-bold text-[#1d2327] text-xs flex items-center gap-1.5">
                            <CornerDownRight className="w-3.5 h-3.5 text-[#2271b1]" /> Edição Rápida
                          </span>
                          <button onClick={() => setQuickEditId(null)} className="text-[#646970] hover:text-[#1d2327]">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[11px] text-[#646970] mb-1">Título</label>
                            <input
                              type="text"
                              value={quickData.title}
                              onChange={(e) => setQuickData({ ...quickData, title: e.target.value })}
                              className="w-full bg-white border border-[#8c8f94] rounded px-2.5 py-1 text-xs text-[#2c3338] focus:border-[#2271b1] focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-[#646970] mb-1">Slug</label>
                            <input
                              type="text"
                              value={quickData.slug}
                              onChange={(e) => setQuickData({ ...quickData, slug: e.target.value })}
                              className="w-full bg-white border border-[#8c8f94] rounded px-2.5 py-1 text-xs text-[#2c3338] focus:border-[#2271b1] focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-[#646970] mb-1">Status</label>
                            <select
                              value={quickData.status}
                              onChange={(e) => setQuickData({ ...quickData, status: e.target.value })}
                              className="w-full bg-white border border-[#8c8f94] rounded px-2.5 py-1 text-xs text-[#2c3338] focus:border-[#2271b1] focus:outline-none"
                            >
                              <option value="published">Publicado</option>
                              <option value="draft">Rascunho</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            onClick={() => setQuickEditId(null)}
                            className="px-3 py-1 bg-[#f6f7f7] hover:bg-[#f0f0f1] text-[#2271b1] border border-[#8c8f94] rounded text-xs"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => handleSaveQuickEdit(post)}
                            disabled={savingQuick}
                            className="px-4 py-1 bg-[#2271b1] hover:bg-[#135e96] text-white font-medium rounded text-xs"
                          >
                            {savingQuick ? 'Atualizando...' : 'Atualizar'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={post.id} className="hover:bg-[#f6f7f7] group">
                    <td className="p-2.5 align-top">
                      <input type="checkbox" className="rounded border-[#8c8f94]" />
                    </td>
                    <td className="p-2.5 align-top">
                      <strong className="text-[#1d2327] block">
                        <button 
                          onClick={() => onEditPost(post)}
                          className="text-[#2271b1] hover:underline text-left font-semibold"
                        >
                          {post.title || '(Sem título)'}
                        </button>
                        {post.status === 'draft' && (
                          <span className="text-[#646970] font-normal ml-1.5">— Rascunho</span>
                        )}
                      </strong>

                      {/* Links de Ação no Hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1.5 text-[12px] text-[#2271b1] pt-1">
                        <button onClick={() => onEditPost(post)} className="hover:underline">
                          Editar
                        </button>
                        <span className="text-[#dcdcde]">|</span>
                        <button onClick={(e) => handleStartQuickEdit(post, e)} className="hover:underline">
                          Edição rápida
                        </button>
                        <span className="text-[#dcdcde]">|</span>
                        <button onClick={(e) => handleDelete(post.id, e)} className="text-[#b32d2e] hover:underline">
                          Lixeira
                        </button>
                        <span className="text-[#dcdcde]">|</span>
                        <button onClick={() => window.open(`/${post.slug}`, '_blank')} className="hover:underline">
                          Ver
                        </button>
                      </div>
                    </td>
                    <td className="p-2.5 text-[#50575e] align-top hidden md:table-cell">
                      admin
                    </td>
                    <td className="p-2.5 text-[#2271b1] align-top hidden md:table-cell hover:underline cursor-pointer">
                      Geral
                    </td>
                    <td className="p-2.5 text-[#50575e] align-top hidden lg:table-cell">
                      —
                    </td>
                    <td className="p-2.5 text-center text-[#50575e] align-top hidden sm:table-cell">
                      —
                    </td>
                    <td className="p-2.5 text-[#50575e] align-top text-[12px]">
                      <div>{post.status === 'published' ? 'Publicado' : 'Última modificação'}</div>
                      <div className="text-[#646970] mt-0.5">
                        {post.created_at ? new Date(post.created_at).toLocaleDateString('pt-BR') : 'Hoje'}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
