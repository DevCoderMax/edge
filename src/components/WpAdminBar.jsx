import React from 'react';
import { Plus, User, ExternalLink } from 'lucide-react';

export function WpAdminBar({ onNavigate, onNewPost }) {
  return (
    <header className="h-8 bg-[#1d2327] text-[#c3c4c7] text-[13px] flex items-center justify-between px-3 select-none z-50 sticky top-0 font-sans border-b border-[#2c3338]">
      {/* Esquerda: Logo, Nome do Site, + Novo */}
      <div className="flex items-center space-x-2 h-full">
        <div 
          onClick={() => onNavigate('dashboard')}
          className="flex items-center justify-center w-6 h-full hover:bg-[#2c3338] hover:text-[#72aee6] cursor-pointer transition-colors"
          title="Edge CMS"
        >
          <div className="w-4 h-4 rounded-full bg-[#c3c4c7] text-[#1d2327] flex items-center justify-center text-[10px] font-black">
            W
          </div>
        </div>

        <button 
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-1 px-2 h-full hover:bg-[#2c3338] hover:text-[#72aee6] transition-colors font-semibold text-white text-[13px]"
        >
          Edge CMS
        </button>

        <button 
          onClick={onNewPost}
          className="flex items-center gap-1 px-2 h-full hover:bg-[#2c3338] hover:text-[#72aee6] transition-colors text-[13px]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Novo</span>
        </button>
      </div>

      {/* Direita: Perfil */}
      <div className="flex items-center h-full">
        <div className="flex items-center gap-2 px-2.5 h-full hover:bg-[#2c3338] hover:text-[#72aee6] cursor-pointer transition-colors text-[13px]">
          <span>Olá, <strong className="text-white font-medium">admin</strong></span>
          <div className="w-5 h-5 rounded-full bg-[#4f5d68] text-white flex items-center justify-center text-[10px]">
            <User className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </header>
  );
}
