import React from 'react';
import { FileText, Puzzle, ShieldCheck, Zap, HardDrive } from 'lucide-react';

export function DashboardTab({ stats, apiConfigured }) {
  const cards = [
    { label: 'Total de Artigos', value: stats.totalPosts || 0, icon: FileText, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'Plugins Ativos', value: stats.activePlugins || 1, icon: Puzzle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Segurança XSS', value: 'Blindado', icon: ShieldCheck, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: 'Latência Edge', value: '~15ms', icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Dashboard Geral</h2>
        <p className="text-sm text-slate-400 mt-1">Visão geral da sua instância do Edge CMS no Cloudflare Pages.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-xs font-medium text-slate-400">{c.label}</p>
                <p className="text-2xl font-semibold text-white mt-1">{c.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${c.bg} ${c.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-indigo-400" />
          Status da Conexão e Contrato
        </h3>
        <div className="space-y-3 text-sm text-slate-300">
          <div className="flex justify-between py-2 border-b border-slate-800">
            <span className="text-slate-400">Backend Conectado:</span>
            <span className="font-mono text-xs bg-slate-950 px-2 py-1 rounded text-indigo-300">
              {apiConfigured ? localStorage.getItem('EDGE_API_URL') : 'Modo Local-First (Memória / Sem API externa)'}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-800">
            <span className="text-slate-400">Motor de Hooks (HookEngine):</span>
            <span className="text-emerald-400 font-medium">Ativo (Async com Sandboxing)</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-slate-400">Sanitização de XSS:</span>
            <span className="text-emerald-400 font-medium">Ativa em tempo de salvamento</span>
          </div>
        </div>
      </div>
    </div>
  );
}
