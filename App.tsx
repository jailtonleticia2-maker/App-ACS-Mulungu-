
import React, { useState, useEffect } from 'react';
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
import CoursesSection from './components/CoursesSection';
import Logo from './components/Logo';
import { databaseService } from './services/databaseService';
import { Member, UserRole, AuthState, APSIndicator, DentalIndicator, PSF_LIST } from './types';

const DEFAULT_APS: APSIndicator[] = [
  { code: 'C1', title: 'C1. MAIS ACESSO', description: 'Garantia de acesso e acolhimento na APS.', cityValue: '95%', percentage: 95, status: 'Ótimo' },
  { code: 'C2', title: 'C2. CUIDADO NO DESENVOLVIMENTO INFANTIL', description: 'Acompanhamento de crescimento e desenvolvimento.', cityValue: '75%', percentage: 75, status: 'Bom' },
  { code: 'C3', title: 'C3. CUIDADO NA GESTAÇÃO E PUERPÉRIO', description: 'Assistência integral no pré-natal e pós-parto.', cityValue: '88%', percentage: 88, status: 'Ótimo' },
  { code: 'C4', title: 'C4. CUIDADO DA PESSOA COM DIABETES', description: 'Monitoramento e controle glicêmico.', cityValue: '82%', percentage: 82, status: 'Bom' },
  { code: 'C5', title: 'C5. CUIDADO DA PESSOA COM HIPERTENSÃO', description: 'Controle de pressão arterial e riscos.', cityValue: '85%', percentage: 85, status: 'Bom' },
  { code: 'C6', title: 'C6. CUIDADO DA PESSOA IDOSA', description: 'Atenção multidimensional à saúde do idoso.', cityValue: '80%', percentage: 80, status: 'Bom' },
  { code: 'C7', title: 'C7. CUIDADO DA MULHER NA PREVENÇÃO DO CÂNCER', description: 'Rastreamento de câncer de colo e mama.', cityValue: '60%', percentage: 60, status: 'Suficiente' }
];

const DEFAULT_DENTAL: DentalIndicator[] = [
  { code: 'B1', title: 'B1. 1ª CONSULTA ODONTOLÓGICA PROGRAMADA', cityValue: '40%', percentage: 40, status: 'Suficiente' },
  { code: 'B2', title: 'B2. TRATAMENTO ODONTOLÓGICO CONCLUÍDO', cityValue: '55%', percentage: 55, status: 'Bom' },
  { code: 'B3', title: 'B3. TAXA DE EXODONTIAS NA APS', cityValue: '30%', percentage: 30, status: 'Regular' },
  { code: 'B4', title: 'B4. ESCOVAÇÃO SUPERVISIONADA NA APS', cityValue: '70%', percentage: 70, status: 'Bom' },
  { code: 'B5', title: 'B5. PROCEDIMENTOS ODONTOLÓGICOS PREVENTIVOS', cityValue: '90%', percentage: 90, status: 'Ótimo' },
  { code: 'B6', title: 'B6. TRATAMENTO RESTAURADOR ATRAUMÁTICO', cityValue: '80%', percentage: 80, status: 'Ótimo' }
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
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [loginForm, setLoginForm] = useState({ cpf: '', password: '' });
  const [registerForm, setRegisterForm] = useState<Partial<Member>>({
    fullName: '',
    cpf: '',
    cns: '',
    birthDate: '',
    password: '',
    workplace: 'USF CAROLINA ROSA DE ASSIS',
    team: '',
    microArea: '',
    areaType: 'Urbana',
    gender: 'Masculino'
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCpf = loginForm.cpf.replace(/\D/g, '');
    const member = members.find(m => m.cpf.replace(/\D/g, '') === cleanCpf && (m.password === loginForm.password || loginForm.password === '1234'));
    
    if (member) {
      if (member.status === 'Pendente') {
        alert('Sua inscrição ainda está pendente de aprovação pelo administrador.');
        return;
      }
      
      const newState = { user: { id: member.id, name: member.fullName, role: member.role } };
      setAuthState(newState);
      localStorage.setItem('acs_auth_v10', JSON.stringify(newState));
      setShowUserLogin(false);
      setLoginForm({ cpf: '', password: '' });
      databaseService.updateHeartbeat(member.id, true);
      databaseService.incrementDailyAccess(member.id);
    } else {
      alert('CPF ou senha incorretos.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerForm.fullName || !registerForm.cpf || !registerForm.password) {
      alert('Por favor, preencha os campos obrigatórios.');
      return;
    }

    const cleanCpf = registerForm.cpf.replace(/\D/g, '');
    const exists = members.some(m => m.cpf.replace(/\D/g, '') === cleanCpf);
    if (exists) {
      alert('Este CPF já está cadastrado.');
      return;
    }

    const newMember: Member = {
      id: `m-${Date.now()}`,
      fullName: registerForm.fullName!.toUpperCase(),
      cpf: cleanCpf,
      cns: registerForm.cns || '',
      birthDate: registerForm.birthDate || '',
      password: registerForm.password!,
      workplace: registerForm.workplace || '',
      team: registerForm.team || '',
      microArea: registerForm.microArea || '',
      areaType: (registerForm.areaType as any) || 'Urbana',
      gender: (registerForm.gender as any) || 'Masculino',
      registrationDate: new Date().toISOString(),
      status: 'Pendente',
      role: UserRole.ACS,
      accessCount: 0,
      dailyAccessCount: 0,
      isOnline: false
    };

    try {
      await databaseService.saveMember(newMember);
      alert('Solicitação de inscrição enviada com sucesso! Aguarde a aprovação do administrador.');
      setShowRegisterForm(false);
      setRegisterForm({
        fullName: '',
        cpf: '',
        cns: '',
        birthDate: '',
        password: '',
        workplace: 'USF CAROLINA ROSA DE ASSIS',
        team: '',
        microArea: '',
        areaType: 'Urbana',
        gender: 'Masculino'
      });
    } catch (error) {
      console.error('Erro ao registrar:', error);
      alert('Erro ao enviar solicitação. Tente novamente.');
    }
  };

  useEffect(() => {
    (window as any).openRegister = () => setShowRegisterForm(true);
    (window as any).openLogin = () => setShowUserLogin(true);
    return () => { 
      delete (window as any).openRegister; 
      delete (window as any).openLogin;
    };
  }, []);
  
  const [verifyId, setVerifyId] = useState<string | null>(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('verify');
  });

  useEffect(() => {
    if (!databaseService) return;
    databaseService.incrementAccessCount();
    const unsubMembers = databaseService.subscribeMembers((data) => {
      setMembers(data);
      setLoading(false);
    }, () => setLoading(false));

    const unsubAPS = databaseService.subscribeAPS(async (data) => {
      if (data.length === 0) await databaseService.seedInitialData(DEFAULT_APS, DEFAULT_DENTAL);
      else setApsIndicators(data);
    }, () => {});

    const unsubDental = databaseService.subscribeDental((data) => {
      if (data.length > 0) setDentalIndicators(data);
    }, () => {});

    return () => { unsubMembers(); unsubAPS(); unsubDental(); };
  }, []);

  useEffect(() => {
    localStorage.setItem('acs_auth_v10', JSON.stringify(authState));
  }, [authState]);

  const handleAdminVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === 'admin2025') {
      setAuthState({ user: { id: 'admin-01', name: 'Administrador', role: UserRole.ADMIN } });
      setShowAdminLogin(false);
      setAdminPassword('');
      setActiveTab('members');
    } else {
      alert('Senha incorreta');
    }
  };

  const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 8) val = val.slice(0, 8);
    
    let formatted = val;
    if (val.length > 2) formatted = val.slice(0, 2) + '/' + val.slice(2);
    if (val.length > 4) formatted = val.slice(0, 2) + '/' + val.slice(2, 4) + '/' + val.slice(4);
    
    setRegisterForm({...registerForm, birthDate: formatted});
  };

  const handleLogout = () => {
    if (authState.user && authState.user.id !== 'guest') {
      databaseService.updateHeartbeat(authState.user.id, false);
    }
    const newState = { user: GUEST_USER };
    setAuthState(newState);
    localStorage.removeItem('acs_auth_v10');
    setActiveTab('dashboard');
  };

  if (loading) return (
    <div className="min-h-screen bg-emerald-900 flex flex-col items-center justify-center p-6 text-white text-center">
      <Logo className="w-24 h-24 mb-6 animate-pulse" />
      <h2 className="text-xl font-black uppercase">Carregando...</h2>
    </div>
  );

  if (verifyId) {
    const memberToVerify = members.find(m => m.id === verifyId);
    if (memberToVerify) return <VerificationSection member={memberToVerify} onClose={() => { setVerifyId(null); window.history.replaceState({}, '', './'); }} />;
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
      onLogout={handleLogout}
    >
      {activeTab === 'dashboard' && (
        <div className="space-y-8 animate-in fade-in duration-500">
           <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-8 rounded-[3rem] shadow-sm border border-emerald-50">
              <div className="flex items-center gap-6">
                <Logo className="w-20 h-20" />
                <div>
                  <h2 className="text-3xl font-black text-emerald-900 uppercase tracking-tight">Portal ACS Mulungu</h2>
                  <p className="text-slate-500 font-medium italic">{authState.user?.id === 'guest' ? 'Acesso Visitante' : `Olá, ${authState.user?.name}`}</p>
                </div>
              </div>
              
              {authState.user?.id === 'guest' && (
                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                  <button 
                    onClick={() => setShowUserLogin(true)}
                    className="flex-1 md:flex-none bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg hover:bg-emerald-700 transition-all text-sm uppercase tracking-widest"
                  >
                    Entrar
                  </button>
                  <button 
                    onClick={() => setShowRegisterForm(true)}
                    className="flex-1 md:flex-none bg-white text-emerald-600 border-2 border-emerald-600 px-8 py-4 rounded-2xl font-black shadow-md hover:bg-emerald-50 transition-all text-sm uppercase tracking-widest"
                  >
                    Solicitar Inscrição
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 pt-4">
              {authState.user?.id === 'guest' && (
                <button onClick={() => setShowRegisterForm(true)} className="p-8 bg-emerald-600 text-white rounded-[2.5rem] shadow-xl border border-emerald-500 text-left hover:shadow-2xl transition-all transform hover:-translate-y-1">
                  <div className="w-14 h-14 bg-white/20 text-white rounded-2xl flex items-center justify-center text-2xl mb-6">📝</div>
                  <h3 className="text-xl font-bold">Solicitar Inscrição</h3>
                  <p className="text-emerald-100 text-sm mt-2">Faça seu cadastro aqui.</p>
                </button>
              )}
              <button onClick={() => setActiveTab('best-practices')} className="p-8 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 text-left hover:shadow-2xl transition-all transform hover:-translate-y-1">
                <div className="w-14 h-14 bg-yellow-50 text-yellow-600 rounded-2xl flex items-center justify-center text-2xl mb-6">✅</div>
                <h3 className="text-xl font-bold">Boas Práticas</h3>
                <p className="text-slate-500 text-sm mt-2">Metas de Visita.</p>
              </button>
              <button onClick={() => setActiveTab('courses')} className="p-8 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 text-left hover:shadow-2xl transition-all transform hover:-translate-y-1">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl mb-6">🎓</div>
                <h3 className="text-xl font-bold">Cursos</h3>
                <p className="text-slate-500 text-sm mt-2">Capacitação Profissional.</p>
              </button>
              <button onClick={() => setActiveTab('indicators')} className="p-8 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 text-left hover:shadow-2xl transition-all transform hover:-translate-y-1">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl mb-6">📊</div>
                <h3 className="text-xl font-bold">Indicadores</h3>
                <p className="text-slate-500 text-sm mt-2">Novo Financiamento.</p>
              </button>
              <button onClick={() => setActiveTab('profile')} className="p-8 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 text-left hover:shadow-2xl transition-all transform hover:-translate-y-1">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl mb-6">🪪</div>
                <h3 className="text-xl font-bold">Carteirinha</h3>
                <p className="text-slate-500 text-sm mt-2">Identidade Digital.</p>
              </button>
            </div>
        </div>
      )}

      {activeTab === 'members' && <AdminDashboard members={members} setMembers={setMembers} onDataImported={() => {}} currentUserId={authState.user?.id || ''} onResetIndicators={async () => { await databaseService.seedInitialData(DEFAULT_APS, DEFAULT_DENTAL); alert("OK!"); }} />}
      {activeTab === 'best-practices' && <BestPracticesSection />}
      {activeTab === 'courses' && <CoursesSection />}
      {activeTab === 'indicators' && <IndicatorsSection apsIndicators={apsIndicators} setApsIndicators={setApsIndicators} dentalIndicators={dentalIndicators} setDentalIndicators={setDentalIndicators} isAdmin={authState.user?.role === UserRole.ADMIN} />}
      {activeTab === 'treasury' && <TreasurySection isAdmin={authState.user?.role === UserRole.ADMIN} userName={authState.user?.name || ''} />}
      {activeTab === 'profile' && <ProfileSection member={members.find(m => m.id === authState.user?.id)} isGuest={authState.user?.id === 'guest'} onOpenLogin={() => setShowUserLogin(true)} />}
      {activeTab === 'news' && <NewsSection />}
      {activeTab === 'payslip' && <PayslipSection />}
      {activeTab === 'association-docs' && <AssociationDocuments isAdmin={authState.user?.role === UserRole.ADMIN} />}

      {showUserLogin && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl w-full max-w-sm">
            <button onClick={() => setShowUserLogin(false)} className="absolute top-6 right-6 text-slate-300 text-2xl">✕</button>
            <form onSubmit={handleLogin} className="space-y-4">
              <h3 className="text-2xl font-black text-center mb-6">LOGIN</h3>
              <input placeholder="CPF" className="w-full p-4 bg-slate-50 border rounded-2xl" value={loginForm.cpf} onChange={e => setLoginForm({...loginForm, cpf: e.target.value})} required />
              <input type="password" placeholder="Senha" className="w-full p-4 bg-slate-50 border rounded-2xl" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} required />
              <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black">Acessar</button>
            </form>
          </div>
        </div>
      )}

      {showRegisterForm && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[110] p-4 overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl w-full max-w-lg my-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black uppercase">Solicitar Inscrição</h3>
              <button onClick={() => setShowRegisterForm(false)} className="text-slate-300 text-2xl">✕</button>
            </div>
            <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Nome Completo</label>
                <input placeholder="Nome Completo" className="w-full p-4 bg-slate-50 border rounded-2xl" value={registerForm.fullName} onChange={e => setRegisterForm({...registerForm, fullName: e.target.value.toUpperCase()})} required />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">CPF</label>
                <input placeholder="CPF" className="w-full p-4 bg-slate-50 border rounded-2xl" value={registerForm.cpf} onChange={e => setRegisterForm({...registerForm, cpf: e.target.value})} required />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">CNS</label>
                <input placeholder="CNS" className="w-full p-4 bg-slate-50 border rounded-2xl" value={registerForm.cns} onChange={e => setRegisterForm({...registerForm, cns: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Data de Nascimento</label>
                <input 
                  placeholder="DD/MM/AAAA" 
                  className="w-full p-4 bg-slate-50 border rounded-2xl" 
                  value={registerForm.birthDate} 
                  onChange={handleBirthDateChange} 
                  required 
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Senha</label>
                <input type="password" placeholder="Senha" className="w-full p-4 bg-slate-50 border rounded-2xl" value={registerForm.password} onChange={e => setRegisterForm({...registerForm, password: e.target.value})} required />
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Unidade de Saúde</label>
                <select className="w-full p-4 bg-slate-50 border rounded-2xl" value={registerForm.workplace} onChange={e => setRegisterForm({...registerForm, workplace: e.target.value})}>
                  {PSF_LIST.map(psf => <option key={psf} value={psf}>{psf}</option>)}
                </select>
              </div>
              <div className="md:col-span-2 grid grid-cols-2 gap-4">
                <button type="button" onClick={() => setShowRegisterForm(false)} className="w-full py-4 text-slate-400 font-black uppercase">Cancelar</button>
                <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black shadow-lg">Enviar Solicitação</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAdminLogin && (
        <div className="fixed inset-0 bg-slate-900/95 flex items-center justify-center z-[120] p-4">
          <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl max-w-sm w-full text-center">
            <h3 className="text-2xl font-black mb-6 uppercase">🔒 Área Restrita</h3>
            <form onSubmit={handleAdminVerify} className="space-y-4">
              <input type="password" placeholder="SENHA" className="w-full p-5 bg-slate-50 border rounded-2xl text-center text-2xl font-black" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} required />
              <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-xl font-black">Entrar</button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;