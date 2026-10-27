import React, { useState } from 'react';
import { Settings, Save, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../../core/apiClient.js';

export function SettingsTab({ onConfigSaved }) {
  const [apiUrl, setApiUrl] = useState(localStorage.getItem('EDGE_API_URL') || '');
  const [apiToken, setApiToken] = useState(localStorage.getItem('EDGE_API_TOKEN') || '');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    try {
      api.setConfig(apiUrl, apiToken);
      setSuccess(true);
      if (onConfigSaved) onConfigSaved();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'URL de API inválida.');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Configurações da API</h2>
        <p className="text-sm text-slate-400 mt-1">Conecte seu CMS a qualquer backend externo via HTTP REST.</p>
      </div>

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> Configuração salva com sucesso!
        </div>
      )}

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-2">
            URL da API Externa (HTTPS ou localhost)
          </label>
          <input
            type="text"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            placeholder="Ex: https://minha-api.workers.dev ou deixe vazio para Modo Local"
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm font-mono"
          />
          <p className="text-[11px] text-slate-500 mt-1">
            Se mantiver vazio, o CMS opera em modo Local-First (armazenamento na memória do navegador).
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-2">
            Token de Acesso (Bearer Token / JWT)
          </label>
          <input
            type="password"
            value={apiToken}
            onChange={(e) => setApiToken(e.target.value)}
            placeholder="************************"
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm font-mono"
          />
        </div>

        <button
          type="submit"
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg text-sm transition-all shadow-lg shadow-indigo-600/20"
        >
          <Save className="w-4 h-4" /> Salvar Conexão
        </button>
      </form>
    </div>
  );
}
