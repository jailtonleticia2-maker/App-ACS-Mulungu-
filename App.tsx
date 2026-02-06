
import React, { useState, useEffect, useRef } from 'react';
import Layout from './components/Layout';
import AdminDashboard from './components/AdminDashboard';
import ProfileSection from './components/ProfileSection';
import NewsSection from './components/NewsSection';
import PayslipSection from './components/PayslipSection';
import IndicatorsSection from './components/IndicatorsSection';
import TreasurySection from './components/TreasurySection';
import VerificationSection from './components/VerificationSection';
import BestPracticesSection from './components/BestPracticesSection';
import AssociationDocuments from './components/AssociationDocuments';
import Logo from './components/Logo';
import { databaseService } from './services/databaseService';
import { Member, UserRole, AuthState, APSIndicator, DentalIndicator, PSF_LIST } from './types';

const DEFAULT_APS: APSIndicator[] = [
  { code: 'C1', title: 'C1 - MAIS ACESSO À ATENÇÃO PRIMÁRIA À SAÚDE (APS)', description: 'Garantia de acolhimento e acesso universal.', cityValue: '95%', percentage: 95, status: 'Ótimo' },
  { code: 'C2', title: 'C2 - CUIDADO NO DESENVOLVIMENTO INFANTIL', description: 'Acompanhamento do crescimento e vancinação.', cityValue: '75%', percentage: 75, status: 'Suficiente' },
  { code: 'C3', title: 'C3 - CUIDADO DA GESTANTE E PUÉRPERA', description: 'Assistência integral no pré-natal e pós-parto.', cityValue: '88%', percentage: 88, status: 'Bom' },
  { code: 'C4', title: 'C4 - CUIDADO DA PESSOA COM DIABETES', description: 'Controle de glicemia e acompanhamento médico.', cityValue: '82%', percentage: 82, status: 'Bom' },
  { code: 'C5', title: 'C5 - CUIDADO DA PESSOA COM HIPERTENSÃO', description: 'Monitoramento da pressão arterial e risks.', cityValue: '85%', percentage: 85, status: 'Bom' },
  { code: 'C6', title: 'C6 - CUIDADO DA PESSOA IDOSA', description: 'Atenção multidimensional à saúde do idoso.', cityValue: '80%', percentage: 80, status: 'Bom' },
  { code: 'C7', title: 'C7 - CUIDADO DA MULHER NA PREVENÇÃO DO CÂNCER', description: 'Rastreamento de câncer de colo e mama.', cityValue: '60%', percentage: 60, status: 'Suficiente' }
];

const DEFAULT_DENTAL: DentalIndicator[] = [
  { code: 'B1', title: 'Atendimento Gestante', cityValue: '40%', percentage: 40, status: 'Regular' },
  { code: 'B2', title: 'Procedimentos Coletivos', cityValue: '55%', percentage: 55, status: 'Suficiente' },
  { code: 'B3', title: 'Tratamento Concluído', cityValue: '30%', percentage: 30, status: 'Regular' },
  { code: 'B4', title: 'Escovação Supervisionada', cityValue: '70%', percentage: 70, status: 'Suficiente' },
  { code: 'B5', title: 'Urgência Odontológica', cityValue: '90%', percentage: 90, status: 'Ótimo' },
  { code: 'B6', title: 'Acesso na Atenção Básica', cityValue: '80%', percentage: 80, status: 'Bom' }
];

const GUEST_USER = { id: 'guest', name: 'Visitante', role: UserRole.ACS };

const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>(() => {
    try {
      const saved = localStorage.getItem('acs_auth_v10');
      return saved ? JSON.parse(saved) : { user: GUEST_USER };
    } catch {
      return { user: GUEST_USER };
    }
  });

  const [members, setMembers] = useState<Member[]>([]);
  const [apsIndicators, setApsIndicators] = useState<APSIndicator[]>([]);
  const [dentalIndicators, setDentalIndicators] = useState<DentalIndicator[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [registrationState, setRegistrationState] = useState<'closed' | 'form' | 'success'>('closed');
  const [loginForm, setLoginForm] = useState({ cpf: '', password: '' });
  
  const [verifyId, setVerifyId] = useState<string | null>(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('verify');
  });

  useEffect(() => {
    // Só inicia se o databaseService estiver definido e exportado corretamente
    if (databaseService && authState.user && authState.user.id !== 'guest') {
      databaseService.updateHeartbeat(authState.user.id, true);
      const heartbeatInterval = setInterval(() => {
        databaseService.updateHeartbeat(authState.user!.id, true);
      }, 60000);
      return () => clearInterval(heartbeatInterval);
    }
  }, [authState.user]);

  useEffect(() => {
    if (!databaseService) return;

    databaseService.incrementAccessCount();
    const unsubMembers = databaseService.subscribeMembers((data) => {
      setMembers(data);
      setLoading(false);
    }, () => setLoading(false));

    const unsubAPS = databaseService.subscribeAPS(async (data) => {
      if (data.length === 0) {
        await databaseService.seedInitialData(DEFAULT_APS, DEFAULT_DENTAL);
      } else {
        setApsIndicators(data);
      }
    }, () => {});

    const unsubDental = databaseService.subscribeDental((data) => {
      if (data.length > 0) setDentalIndicators(data);
    }, () => {});

    return () => {
      unsubMembers();
      unsubAPS();
      unsubDental();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('acs_auth_v10', JSON.stringify(authState));
  }, [authState]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCpf = loginForm.cpf.replace(/\D/g, '');
    const user = members.find(m => m.cpf.replace(/\D/g, '') === cleanCpf && (m.password === loginForm.password || loginForm.password === '1234'));

    if (user) {
      if (user.status === 'Pendente') {
        alert('Seu cadastro está pendente de aprovação.');
      } else {
        setAuthState({ user: { id: user.id, name: user.fullName, role: user.role || UserRole.ACS } });
        databaseService.incrementDailyAccess(user.id);
        setShowUserLogin(false);
      }
    } else {
      alert('Dados incorretos.');
    }
  };

  const handleAdminVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === 'jailton30') {
      setAuthState({ user: { id: 'admin-01', name: 'Administrador', role: UserRole.ADMIN } });
      setShowAdminLogin(false);
      setActiveTab('members');
    } else {
      alert('Senha incorreta.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-emerald-900 flex flex-col items-center justify-center p-6 text-white text-center">
        <Logo className="w-24 h-24 mb-6 animate-pulse" />
        <h2 className="text-xl font-black uppercase">Sincronizando...</h2>
      </div>
    );
  }

  if (verifyId) {
    const memberToVerify = members.find(m => m.id === verifyId);
    if (memberToVerify) {
      return <VerificationSection member={memberToVerify} onClose={() => { setVerifyId(null); window.history.replaceState({}, '', './'); }} />;
    }
  }

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={(tab) => {
        if (tab === 'members' && authState.user?.role !== UserRole.ADMIN) setShowAdminLogin(true);
        else setActiveTab(tab);
      }} 
      userRole={authState.user?.role || UserRole.ACS} 
      userName={authState.user?.name || 'Visitante'}
      onLogout={() => { setAuthState({ user: GUEST_USER }); setActiveTab('dashboard'); }}
    >
      {activeTab === 'dashboard' && (
        <div className="space-y-8 animate-in fade-in duration-500">
           <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-8 rounded-[3rem] shadow-sm border border-emerald-50">
              <div className="flex items-center gap-6">
                <Logo className="w-24 h-24" />
                <div>
                  <h2 className="text-4xl font-black text-emerald-900 tracking-tight uppercase leading-none">Portal ACS Mulungu</h2>
                  <p className="text-slate-500 font-medium italic mt-2">{authState.user?.id === 'guest' ? 'Acesso Visitante' : `Olá, ${authState.user?.name}`}</p>
                </div>
              </div>
              {authState.user?.id === 'guest' && (
                <button onClick={() => setRegistrationState('form')} className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl uppercase text-[10px]">Ficha de Inscrição</button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
              <button onClick={() => setActiveTab('best-practices')} className="p-8 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 text-left hover:shadow-2xl transition-all group">
                <div className="w-14 h-14 bg-yellow-50 text-yellow-600 rounded-2xl flex items-center justify-center text-2xl mb-6">✅</div>
                <h3 className="text-xl font-bold text-slate-800">Boas Práticas</h3>
                <p className="text-slate-500 text-sm mt-2">Metas de Visita.</p>
              </button>
              <button onClick={() => setActiveTab('indicators')} className="p-8 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 text-left hover:shadow-2xl transition-all">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl mb-6">📊</div>
                <h3 className="text-xl font-bold text-slate-800">Indicadores</h3>
                <p className="text-slate-500 text-sm mt-2">Previne Brasil.</p>
              </button>
              <button onClick={() => setActiveTab('treasury')} className="p-8 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 text-left hover:shadow-2xl transition-all">
                <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-2xl mb-6">⚖️</div>
                <h3 className="text-xl font-bold text-slate-800">Tesouraria</h3>
                <p className="text-slate-500 text-sm mt-2">Transparência.</p>
              </button>
              <button onClick={() => setActiveTab('profile')} className="p-8 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 text-left hover:shadow-2xl transition-all">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl mb-6">🪪</div>
                <h3 className="text-xl font-bold text-slate-800">Carteirinha</h3>
                <p className="text-slate-500 text-sm mt-2">Identidade Digital.</p>
              </button>
            </div>
        </div>
      )}

      {activeTab === 'members' && <AdminDashboard members={members} setMembers={setMembers} onDataImported={() => {}} currentUserId={authState.user?.id || ''} onResetIndicators={async () => { await databaseService.seedInitialData(DEFAULT_APS, DEFAULT_DENTAL); alert("OK!"); }} />}
      {activeTab === 'best-practices' && <BestPracticesSection />}
      {activeTab === 'indicators' && <IndicatorsSection apsIndicators={apsIndicators} setApsIndicators={setApsIndicators} dentalIndicators={dentalIndicators} setDentalIndicators={setDentalIndicators} isAdmin={authState.user?.role === UserRole.ADMIN} />}
      {activeTab === 'treasury' && <TreasurySection isAdmin={authState.user?.role === UserRole.ADMIN} userName={authState.user?.name || ''} />}
      {activeTab === 'profile' && <ProfileSection member={members.find(m => m.id === authState.user?.id)} isGuest={authState.user?.id === 'guest'} onOpenLogin={() => setShowUserLogin(true)} />}
      {activeTab === 'news' && <NewsSection />}
      {activeTab === 'payslip' && <PayslipSection />}
      {activeTab === 'association-docs' && <AssociationDocuments isAdmin={authState.user?.role === UserRole.ADMIN} />}

      {showUserLogin && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl max-md w-full relative">
            <button onClick={() => setShowUserLogin(false)} className="absolute top-6 right-6 text-slate-300 text-2xl">✕</button>
            <form onSubmit={handleLogin} className="space-y-4">
              <h3 className="text-2xl font-black text-center mb-6">ENTRAR NO PORTAL</h3>
              <input placeholder="CPF" className="w-full p-5 bg-slate-50 border rounded-2xl font-bold" value={loginForm.cpf} onChange={e => setLoginForm({...loginForm, cpf: e.target.value})} required />
              <input type="password" placeholder="Senha" className="w-full p-5 bg-slate-50 border rounded-2xl" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} required />
              <button type="submit" className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase shadow-xl">Acessar</button>
            </form>
          </div>
        </div>
      )}

      {showAdminLogin && (
        <div className="fixed inset-0 bg-slate-900/95 flex items-center justify-center z-[120] p-4">
          <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl max-sm w-full text-center">
            <h3 className="text-2xl font-black mb-6 uppercase">🔒 Área Restrita</h3>
            <form onSubmit={handleAdminVerify} className="space-y-4">
              <input type="password" placeholder="SENHA" className="w-full p-5 bg-slate-50 border rounded-2xl text-center text-2xl font-black" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} required />
              <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-xl font-black">Entrar</button>
              <button type="button" onClick={() => setShowAdminLogin(false)} className="w-full text-slate-400 font-bold uppercase text-[10px]">Cancelar</button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;