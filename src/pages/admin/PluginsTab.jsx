import React from 'react';
import { Puzzle, CheckCircle, ShieldCheck } from 'lucide-react';
import { SmartSeoPlugin } from '../../plugins/smart-seo/index.js';

export function PluginsTab() {
  const installedPlugins = [
    {
      id: SmartSeoPlugin.id,
      name: SmartSeoPlugin.name,
      version: SmartSeoPlugin.version,
      description: 'Adiciona campos de SEO e preenche meta tags automaticamente via HookEngine.',
      active: true
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Plugins & Extensões</h2>
        <p className="text-sm text-slate-400 mt-1">Gerencie plugins que modificam o comportamento do CMS em tempo de execução.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {installedPlugins.map((plugin) => (
          <div key={plugin.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                    <Puzzle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">{plugin.name}</h3>
                    <span className="text-[11px] text-slate-400">v{plugin.version}</span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle className="w-3 h-3" /> Ativo
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{plugin.description}</p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1 text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> Sandboxed Hooks
              </span>
              <span className="font-mono text-[10px]">ID: {plugin.id}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
