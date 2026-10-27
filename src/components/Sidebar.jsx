import React from 'react';
import { LayoutDashboard, FileText, Puzzle, Settings, LogOut, Globe } from 'lucide-react';

export function Sidebar({ currentTab, setCurrentTab, apiConfigured }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'posts', label: 'Artigos & Páginas', icon: FileText },
    { id: 'plugins', label: 'Plugins & Hooks', icon: Puzzle },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between">
      <div>
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-indigo-500 inline-block animate-pulse"></span>
              Edge CMS
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">Arquitetura Serverless</p>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-800/80 text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-slate-400">Modo de Operação:</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
              apiConfigured ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}>
              {apiConfigured ? 'Remoto (API)' : 'Local-First'}
            </span>
          </div>
          <p className="text-slate-500 truncate">
            {apiConfigured ? 'Conectado via HTTP REST' : 'Armazenamento em Memória'}
          </p>
        </div>
      </div>
    </aside>
  );
}
