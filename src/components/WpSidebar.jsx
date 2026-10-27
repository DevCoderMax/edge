import React from 'react';
import { 
  Gauge, 
  Pin, 
  FileText, 
  Plug, 
  Settings, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';

export function WpSidebar({ currentTab, setCurrentTab, isCollapsed, setIsCollapsed }) {
  const menuItems = [
    { id: 'dashboard', label: 'Painel', icon: Gauge },
    { id: 'posts', label: 'Posts', icon: Pin },
    { id: 'pages', label: 'Páginas', icon: FileText },
    { id: 'plugins', label: 'Plugins', icon: Plug },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <aside 
      className={`${
        isCollapsed ? 'w-10' : 'w-[160px]'
      } bg-[#1d2327] text-[#c3c4c7] flex flex-col justify-between shrink-0 select-none text-[13px] font-sans border-r border-[#1d2327]`}
    >
      <div className="py-2">
        <ul className="space-y-[1px]">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <li key={item.id} className="relative">
                <button
                  onClick={() => setCurrentTab(item.id)}
                  className={`w-full flex items-center px-3 py-2 text-left transition-colors relative ${
                    isActive
                      ? 'bg-[#2271b1] text-white font-medium'
                      : 'hover:bg-[#13171a] hover:text-[#72aee6]'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isCollapsed ? 'mx-auto' : 'mr-2.5'}`} />

                  {!isCollapsed && (
                    <span className="truncate flex-1 text-[13px]">{item.label}</span>
                  )}

                  {/* Triângulo indicador do menu ativo apontando para o conteúdo */}
                  {isActive && !isCollapsed && (
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-y-[4px] border-y-transparent border-r-[4px] border-r-[#f0f0f1]" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Botão de Recolher Menu */}
      <div className="p-2 border-t border-[#2c3338]">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center gap-2 p-1.5 text-[#a7aaad] hover:text-[#72aee6] text-xs transition-colors"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4 mx-auto" /> : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span className="text-[12px]">Recolher menu</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
