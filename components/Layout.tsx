
import React from 'react';
import { UserRole } from '../types';
import Logo from './Logo';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: UserRole;
  userName: string;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, userRole, userName, onLogout }) => {
  const isGuest = userName === 'Visitante';
  
  const menuItems = [
    { id: 'dashboard', label: 'Início', icon: '🏠' },
    { id: 'indicators', label: 'Indicadores', icon: '📊' },
    { id: 'courses', label: 'Cursos', icon: '🎓' },
    { id: 'treasury', label: 'Tesouraria', icon: '⚖️' },
    { id: 'association-docs', label: 'Documentos', icon: '📂' },
    { id: 'profile', label: 'Carteirinha', icon: '🪪' },
    { id: 'news', label: 'Notícias MS', icon: '📰' },
    { id: 'members', label: 'Gestão', icon: '⚙️' }, // Removido 'restricted: true' para estar sempre visível
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Sidebar / Menu Inferior Mobile */}
      <aside className="w-full md:w-64 bg-emerald-900 text-white flex-shrink-0 no-print z-50 flex flex-col">
        <div className="p-6 hidden md:flex items-center space-x-3">
          <Logo className="w-10 h-10" />
          <div>
            <h1 className="font-bold text-sm leading-tight uppercase tracking-tighter">Associação ACS</h1>
            <p className="text-[10px] text-emerald-300">Mulungu do Morro - BA</p>
          </div>
        </div>

        {/* Menu Desktop */}
        <nav className="mt-6 px-4 space-y-1 hidden md:block">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === item.id 
                  ? 'bg-emerald-800 text-white shadow-inner border-l-4 border-emerald-400' 
                  : 'hover:bg-emerald-800/50 text-emerald-100'
              } ${item.id === 'members' ? 'mt-8 border-t border-emerald-800/50 pt-4 opacity-80 hover:opacity-100' : ''}`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Menu Inferior Estilo App (Mobile) */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-emerald-900 border-t border-emerald-800 flex justify-around items-center p-2 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.2)] overflow-x-auto no-scrollbar">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center p-2 min-w-[60px] rounded-xl transition-all ${
                activeTab === item.id ? 'text-white scale-110' : 'text-emerald-400 opacity-60'
              }`}
            >
              <span className="text-xl mb-0.5">{item.icon}</span>
              <span className="text-[8px] font-black uppercase tracking-widest">{item.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        <div className="mt-auto p-4 border-t border-emerald-800/50 hidden md:block">
          <div className="flex items-center space-x-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center text-sm font-bold border border-emerald-600">
              {userName.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{userName}</p>
              <p className="text-[10px] text-emerald-400 uppercase font-bold">
                {isGuest ? 'Acesso Público' : (userRole === UserRole.ADMIN ? 'Administrador' : 'Agente de Saúde')}
              </p>
            </div>
          </div>
          {!isGuest && (
            <button 
              onClick={onLogout}
              className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-emerald-400 hover:text-white hover:bg-emerald-800/50 rounded-lg transition-colors"
            >
              <span>🚪</span>
              <span>Sair</span>
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto mb-20 md:mb-0">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;