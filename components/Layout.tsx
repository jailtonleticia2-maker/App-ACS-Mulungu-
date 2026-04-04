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

const Layout: React.FC<LayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
  userRole,
  userName,
  onLogout
}) => {
  const isGuest = userName === 'Visitante';

  const menuItems = [
    { id: 'dashboard', label: 'Início', icon: '🏠' },
    { id: 'indicators', label: 'Indicadores', icon: '📊' },
    { id: 'best-practices', label: 'Boas Práticas', icon: '✅' },
    { id: 'courses', label: 'Cursos', icon: '🎓' },
    { id: 'treasury', label: 'Tesouraria', icon: '⚖️' },
    { id: 'association-docs', label: 'Documentos', icon: '📂' },
    { id: 'profile', label: 'Carteirinha', icon: '🪪' },
    { id: 'news', label: 'Notícias MS', icon: '📰' },
    { id: 'payslip', label: 'Contracheque', icon: '💰' },
    { id: 'members', label: 'Gestão', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-emerald-900 text-white flex-shrink-0 no-print z-50 flex flex-col">
        
        <div className="p-6 hidden md:flex items-center space-x-3">
          <Logo className="w-10 h-10" />
          <div>
            <h1 className="font-bold text-sm leading-tight uppercase tracking-tighter">
              Associação ACS
            </h1>
            <p className="text-[10px] text-emerald-300">
              Mulungu do Morro - BA
            </p>
          </div>
        </div>

        {/* Menu Desktop */}
        <nav className="mt-6 px-4 space-y-1 hidden md:block">
          
          {isGuest && (
            <div className="space-y-2 mb-6">
              
              <button
                onClick={() => (window as any).openLogin?.()}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-black uppercase text-[10px]"
              >
                🔑 Entrar no Portal
              </button>

              <button
                onClick={() => (window as any).openRegister?.()}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-white text-emerald-600 border border-emerald-600 hover:bg-emerald-50 font-black uppercase text-[10px]"
              >
                📝 Solicitar Inscrição
              </button>

            </div>
          )}

          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${
                activeTab === item.id
                  ? 'bg-emerald-800 border-l-4 border-emerald-400'
                  : 'hover:bg-emerald-800/50 text-emerald-100'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}

        </nav>

        {/* Rodapé usuário */}
        <div className="mt-auto p-4 hidden md:block">
          
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-emerald-700 rounded-full flex items-center justify-center">
              {userName.charAt(0)}
            </div>

            <div>
              <p className="text-sm">{userName}</p>
              <p className="text-xs text-emerald-400">
                {isGuest
                  ? 'Acesso Público'
                  : userRole === UserRole.ADMIN
                  ? 'Administrador'
                  : 'Agente de Saúde'}
              </p>
            </div>
          </div>

          {!isGuest && (
            <button
              onClick={onLogout}
              className="w-full text-left text-emerald-400 hover:text-white"
            >
              🚪 Sair
            </button>
          )}

        </div>

      </aside>

      {/* Conteúdo */}
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>

    </div>
  );
};

export default Layout;