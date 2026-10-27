import React, { useState } from 'react';
import { Pin, FileText, MessageSquare, Plug } from 'lucide-react';
import { api } from '../../core/apiClient.js';

export function WpDashboardTab({ stats, posts, onRefresh, onNavigate, onNewPost }) {
  const [draftTitle, setDraftTitle] = useState('');
  const [draftContent, setDraftContent] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSaveDraft = async (e) => {
    e.preventDefault();
    if (!draftTitle.trim()) return;
    setSaving(true);
    try {
      await api.savePost({
        title: draftTitle,
        content_html: `<p>${draftContent}</p>`,
        status: 'draft'
      });
      setDraftTitle('');
      setDraftContent('');
      onRefresh();
    } catch (err) {
      alert(`Erro: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="font-sans text-[#2c3338] space-y-4">
      {/* Topo do Painel */}
      <div className="flex items-center justify-between pb-1">
        <h1 className="text-[23px] font-normal text-[#1d2327]">Painel</h1>
        <div className="hidden sm:flex items-center space-x-2 text-[13px] text-[#2271b1]">
          <button className="px-2 py-0.5 hover:bg-[#f6f7f7] border border-transparent hover:border-[#dcdcde] rounded">
            Opções de tela ▾
          </button>
          <button className="px-2 py-0.5 hover:bg-[#f6f7f7] border border-transparent hover:border-[#dcdcde] rounded">
            Ajuda ▾
          </button>
        </div>
      </div>

      {/* Caixa de Boas-Vindas */}
      <div className="bg-white border border-[#c3c4c7] p-6 shadow-sm">
        <h2 className="text-xl font-medium text-[#1d2327]">Bem-vindo ao Edge CMS!</h2>
        <p className="text-[13px] text-[#646970] mt-1">
          Preparamos alguns links para você começar a publicar com velocidade de borda:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 text-[13px]">
          <div>
            <h3 className="font-semibold text-[#1d2327] mb-2">Primeiros passos</h3>
            <button
              onClick={onNewPost}
              className="px-3 py-1.5 bg-[#2271b1] hover:bg-[#135e96] text-white rounded text-[13px] font-medium"
            >
              Escrever seu primeiro artigo
            </button>
          </div>
          <div>
            <h3 className="font-semibold text-[#1d2327] mb-2">Próximos passos</h3>
            <ul className="space-y-1.5 text-[#2271b1]">
              <li><button onClick={() => onNavigate('pages')} className="hover:underline">Adicionar uma página</button></li>
              <li><button onClick={() => onNavigate('posts')} className="hover:underline">Ver todos os artigos</button></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-[#1d2327] mb-2">Mais ações</h3>
            <ul className="space-y-1.5 text-[#2271b1]">
              <li><button onClick={() => onNavigate('plugins')} className="hover:underline">Gerenciar plugins ({stats.activePlugins})</button></li>
              <li><button onClick={() => onNavigate('settings')} className="hover:underline">Configurações gerais</button></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Grid de Caixas do WordPress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Num relance */}
        <div className="bg-white border border-[#c3c4c7] shadow-sm">
          <div className="px-3 py-2 border-b border-[#c3c4c7] font-semibold text-[14px] text-[#1d2327]">
            Num relance
          </div>
          <div className="p-3 text-[13px] space-y-2">
            <div className="grid grid-cols-2 gap-2 text-[#50575e]">
              <span className="flex items-center gap-1.5">
                <Pin className="w-3.5 h-3.5 text-[#646970]" />
                <button onClick={() => onNavigate('posts')} className="text-[#2271b1] hover:underline font-medium">
                  {stats.totalPosts} posts
                </button>
              </span>
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#646970]" />
                <button onClick={() => onNavigate('pages')} className="text-[#2271b1] hover:underline font-medium">
                  1 página
                </button>
              </span>
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[#646970]" />
                <span>0 comentários</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Plug className="w-3.5 h-3.5 text-[#646970]" />
                <span>{stats.activePlugins} plugin ativo</span>
              </span>
            </div>
            <div className="text-[12px] text-[#646970] pt-2 border-t border-[#f0f0f1]">
              Edge CMS v0.1 rodando com SQLite no Edge.
            </div>
          </div>
        </div>

        {/* Rascunho Rápido */}
        <div className="bg-white border border-[#c3c4c7] shadow-sm">
          <div className="px-3 py-2 border-b border-[#c3c4c7] font-semibold text-[14px] text-[#1d2327]">
            Rascunho rápido
          </div>
          <form onSubmit={handleSaveDraft} className="p-3 space-y-2.5">
            <div>
              <input
                type="text"
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                placeholder="Título"
                className="w-full bg-white border border-[#8c8f94] rounded px-2.5 py-1 text-[13px] text-[#2c3338] focus:border-[#2271b1] focus:outline-none"
              />
            </div>
            <div>
              <textarea
                rows={3}
                value={draftContent}
                onChange={(e) => setDraftContent(e.target.value)}
                placeholder="O que você está pensando?"
                className="w-full bg-white border border-[#8c8f94] rounded p-2.5 text-[13px] text-[#2c3338] focus:border-[#2271b1] focus:outline-none"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving || !draftTitle.trim()}
                className="px-3 py-1 bg-[#2271b1] hover:bg-[#135e96] text-white text-[13px] font-medium rounded transition-colors disabled:opacity-40"
              >
                {saving ? 'Salvando...' : 'Salvar rascunho'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
