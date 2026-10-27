import React, { useState } from 'react';
import { SmartSeoPlugin } from '../../plugins/smart-seo/index.js';

export function WpPluginsTab() {
  const [plugins, setPlugins] = useState([
    {
      id: SmartSeoPlugin.id,
      name: SmartSeoPlugin.name,
      version: SmartSeoPlugin.version,
      author: 'Equipe Edge Core',
      description: 'Adiciona campos de SEO, pré-visualização do Google e preenche meta tags automaticamente via HookEngine.',
      active: true,
      autoUpdate: false
    }
  ]);

  const [filter, setFilter] = useState('all');

  const togglePlugin = (id) => {
    setPlugins(plugins.map(p => p.id === id ? { ...p, active: !p.active } : p));
  };

  const activeCount = plugins.filter(p => p.active).length;

  return (
    <div className="font-sans text-[#2c3338]">
      {/* Topo: Título + Botão Adicionar Plugin + Guias de Ajuda */}
      <div className="flex items-center justify-between pb-3">
        <div className="flex items-center gap-2.5">
          <h1 className="text-[23px] font-normal text-[#1d2327]">Plugins</h1>
          <button 
            onClick={() => alert('Em breve: Instalação de novos plugins')}
            className="px-2.5 py-1 text-[13px] text-[#2271b1] border border-[#2271b1] rounded hover:bg-[#2271b1] hover:text-white transition-colors"
          >
            Adicionar plugin
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

      {/* Aviso de Notificação (Estilo WordPress) */}
      <div className="border-l-4 border-l-[#00a32a] bg-white p-3 text-[13px] shadow-sm mb-4 flex items-center justify-between">
        <span>O motor de plugins assíncrono (HookEngine) está ativo e funcionando no Edge.</span>
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[13px] gap-2 mb-2">
        <div className="text-[#646970]">
          <button 
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'text-[#1d2327] font-semibold' : 'text-[#2271b1] hover:underline'}
          >
            Todos ({plugins.length})
          </button>
          <span className="mx-1 text-[#dcdcde]">|</span>
          <button 
            onClick={() => setFilter('active')}
            className={filter === 'active' ? 'text-[#1d2327] font-semibold' : 'text-[#2271b1] hover:underline'}
          >
            Ativos ({activeCount})
          </button>
        </div>

        <div className="flex items-center gap-1">
          <input
            type="search"
            placeholder="Pesquisar plugins instalados"
            className="bg-white border border-[#8c8f94] rounded px-2 py-1 text-[13px] text-[#2c3338] focus:border-[#2271b1] focus:outline-none w-56"
          />
          <button className="px-2.5 py-1 bg-[#f6f7f7] border border-[#8c8f94] text-[#2c3338] text-[13px] rounded hover:bg-[#f0f0f1]">
            Pesquisar
          </button>
        </div>
      </div>

      {/* Barra de Ações em Massa */}
      <div className="flex items-center justify-between bg-transparent mb-2 text-[13px]">
        <div className="flex items-center gap-1.5">
          <select className="bg-white border border-[#8c8f94] text-[#2c3338] rounded px-2 py-1 text-[13px] focus:outline-none">
            <option>Ações em massa</option>
            <option>Ativar</option>
            <option>Desativar</option>
          </select>
          <button className="px-2.5 py-1 bg-[#f6f7f7] hover:bg-[#f0f0f1] text-[#2271b1] border border-[#2271b1] rounded text-[13px]">
            Aplicar
          </button>
        </div>

        <span className="text-[#646970] text-[12px]">{plugins.length} itens</span>
      </div>

      {/* Tabela de Plugins (Estilo wp-list-table) */}
      <div className="bg-white border border-[#c3c4c7] shadow-sm">
        <table className="w-full text-left border-collapse text-[13px]">
          <thead>
            <tr className="border-b border-[#c3c4c7] bg-[#f6f7f7] text-[#2c3338] font-semibold">
              <th className="p-2.5 w-8">
                <input type="checkbox" className="rounded border-[#8c8f94]" />
              </th>
              <th className="p-2.5 w-64">Plugin</th>
              <th className="p-2.5">Descrição</th>
              <th className="p-2.5 w-48 text-right pr-4">Atualizações automáticas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#c3c4c7]">
            {plugins.map((plugin) => (
              <tr 
                key={plugin.id} 
                className={plugin.active ? 'bg-white border-l-4 border-l-[#72aee6]' : 'bg-[#f6f7f7]'}
              >
                <td className="p-2.5 align-top">
                  <input type="checkbox" className="rounded border-[#8c8f94]" />
                </td>
                <td className="p-2.5 align-top">
                  <strong className="text-[#1d2327] font-semibold block">{plugin.name}</strong>
                  <div className="flex items-center space-x-1.5 text-[12px] text-[#2271b1] pt-1">
                    <button 
                      onClick={() => togglePlugin(plugin.id)}
                      className={plugin.active ? 'text-[#b32d2e] hover:underline' : 'text-[#2271b1] hover:underline'}
                    >
                      {plugin.active ? 'Desativar' : 'Ativar'}
                    </button>
                  </div>
                </td>
                <td className="p-2.5 align-top text-[#50575e] space-y-1">
                  <p>{plugin.description}</p>
                  <div className="text-[12px] text-[#646970]">
                    Versão {plugin.version} | Por <span className="text-[#2271b1]">{plugin.author}</span>
                  </div>
                </td>
                <td className="p-2.5 align-top text-right pr-4 text-[12px] text-[#2271b1]">
                  <button className="hover:underline">Ativar atualizações automáticas</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
