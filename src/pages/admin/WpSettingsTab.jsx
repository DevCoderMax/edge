import React, { useState } from 'react';
import { api } from '../../core/apiClient.js';

export function WpSettingsTab({ onConfigSaved }) {
  const [siteTitle, setSiteTitle] = useState('Unifica');
  const [tagline, setTagline] = useState('Apenas mais um site no Edge');
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
      setError(err.message || 'URL inválida.');
    }
  };

  return (
    <div className="font-sans text-[#2c3338] max-w-4xl space-y-4">
      <div className="flex items-center justify-between pb-1">
        <h1 className="text-[23px] font-normal text-[#1d2327]">Configurações Gerais</h1>
      </div>

      {success && (
        <div className="border-l-4 border-l-[#00a32a] bg-white p-3 text-[13px] shadow-sm">
          Configurações salvas.
        </div>
      )}

      {error && (
        <div className="border-l-4 border-l-[#d63638] bg-white p-3 text-[13px] shadow-sm text-[#d63638]">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4 text-[13px]">
        <table className="w-full text-left">
          <tbody className="divide-y divide-transparent">
            <tr>
              <th className="w-56 py-3 font-semibold text-[#1d2327] align-top">
                Título do site
              </th>
              <td className="py-3">
                <input
                  type="text"
                  value={siteTitle}
                  onChange={(e) => setSiteTitle(e.target.value)}
                  className="w-full max-w-md bg-white border border-[#8c8f94] rounded px-3 py-1 text-[13px] text-[#2c3338] focus:border-[#2271b1] focus:outline-none"
                />
              </td>
            </tr>

            <tr>
              <th className="w-56 py-3 font-semibold text-[#1d2327] align-top">
                Descrição
              </th>
              <td className="py-3">
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full max-w-md bg-white border border-[#8c8f94] rounded px-3 py-1 text-[13px] text-[#2c3338] focus:border-[#2271b1] focus:outline-none"
                />
                <p className="text-[12px] text-[#646970] mt-1">Em poucas palavras, explique sobre o que é este site.</p>
              </td>
            </tr>

            <tr>
              <th className="w-56 py-3 font-semibold text-[#1d2327] align-top">
                Endereço da API Externa (URL)
              </th>
              <td className="py-3">
                <input
                  type="text"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="https://sua-api.workers.dev (ou vazio para Modo Local)"
                  className="w-full max-w-md bg-white border border-[#8c8f94] rounded px-3 py-1 text-[13px] text-[#2c3338] font-mono focus:border-[#2271b1] focus:outline-none"
                />
                <p className="text-[12px] text-[#646970] mt-1">
                  URL da API Cloudflare Worker, Python ou PHP. Deixe em branco para usar armazenamento local.
                </p>
              </td>
            </tr>

            <tr>
              <th className="w-56 py-3 font-semibold text-[#1d2327] align-top">
                Token de Autenticação
              </th>
              <td className="py-3">
                <input
                  type="password"
                  value={apiToken}
                  onChange={(e) => setApiToken(e.target.value)}
                  placeholder="Token Bearer / JWT"
                  className="w-full max-w-md bg-white border border-[#8c8f94] rounded px-3 py-1 text-[13px] text-[#2c3338] font-mono focus:border-[#2271b1] focus:outline-none"
                />
              </td>
            </tr>
          </tbody>
        </table>

        <div className="pt-4">
          <button
            type="submit"
            className="px-4 py-1.5 bg-[#2271b1] hover:bg-[#135e96] text-white font-medium rounded text-[13px] shadow-sm"
          >
            Salvar alterações
          </button>
        </div>
      </form>
    </div>
  );
}
