
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
    const saved = localStorage.getItem('acs_auth_v10');
    return saved ? JSON.parse(saved) : { user: GUEST_USER };
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
  const [registrationPhoto, setRegistrationPhoto] = useState<string>('');
  const [regArea, setRegArea] = useState<'Rural' | 'Urbana'>('Urbana');
  const [regPsf, setRegPsf] = useState<string>(PSF_LIST[0]);
  
  const [verifyId, setVerifyId] = useState<string | null>(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('verify');
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    databaseService.incrementAccessCount();

    const handleErr = (err: any) => {
      console.error("Erro Crítico Firebase:", err);
      setLoading(false);
    };

    const unsubMembers = databaseService.subscribeMembers((data) => {
      setMembers(data);
      setLoading(false);
    }, handleErr);

    const unsubAPS = databaseService.subscribeAPS(async (data) => {
      if (data.length === 0 || data.length < 7) {
        await databaseService.seedInitialData(DEFAULT_APS, DEFAULT_DENTAL);
      } else {
        setApsIndicators(data);
      }
    }, handleErr);

    const unsubDental = databaseService.subscribeDental((data) => {
      if (data.length === 0) {
        databaseService.seedInitialData(DEFAULT_APS, DEFAULT_DENTAL);
      } else {
        setDentalIndicators(data);
      }
    }, handleErr);

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
    const user = members.find(m => 
      m.cpf.replace(/\D/g, '') === cleanCpf && 
      (m.password === loginForm.password || (!m.password && loginForm.password === '1234'))
    );

    if (user) {
      if (user.status === 'Pendente') {
        alert('Seu cadastro está pendente de aprovação pela diretoria.');
      } else {
        setAuthState({ user: { id: user.id, name: user.fullName, role: user.role || UserRole.ACS } });
        setShowUserLogin(false);
        setLoginForm({ cpf: '', password: '' });
      }
    } else {
      alert('Dados incorretos ou CPF não cadastrado.');
    }
  };

  const handleAdminVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === 'jailton30') {
      setAuthState({ user: { id: 'admin-01', name: 'Administrador', role: UserRole.ADMIN } });
      setShowAdminLogin(false);
      setAdminPassword('');
      setActiveTab('members');
    } else {
      alert('Senha mestra incorreta.');
    }
  };

  const handleRegistration = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newMember: Member = {
      id: `acs-${Date.now()}`,
      fullName: (formData.get('fullName') as string || '').toUpperCase(),
      birthDate: formData.get('birthDate') as string || '',
      cpf: (formData.get('cpf') as string || '').replace(/\D/g, ''),
      areaType: regArea,
      workplace: regPsf, 
      team: (formData.get('team') as string || '').toUpperCase(),
      microArea: (formData.get('microArea') as string || ''),
      profileImage: registrationPhoto,
      cns: '', 
      password: '1234', 
      status: 'Pendente',
      registrationDate: new Date().toISOString(),
      role: UserRole.ACS,
    };
    
    await databaseService.saveMember(newMember);
    setRegistrationState('success');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-emerald-900 flex flex-col items-center justify-center p-6 text-white text-center">
        <Logo className="w-20 h-20 mb-6 animate-pulse" />
        <h2 className="text-xl font-black uppercase tracking-tighter">Sincronizando Portal...</h2>
        <p className="text-[10px] text-emerald-400 mt-2 uppercase tracking-widest">Aguardando resposta do servidor Cloud</p>
      </div>
    );
  }

  if (verifyId) {
    const memberToVerify = members.find(m => m.id === verifyId);
    if (memberToVerify) {
      return (
        <VerificationSection 
          member={memberToVerify} 
          onClose={() => {
            setVerifyId(null);
            window.history.replaceState({}, '', window.location.pathname);
          }} 
        />
      );
    }
  }

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={(tab) => {
        if (tab === 'members' && authState.user?.role !== UserRole.ADMIN) {
          setShowAdminLogin(true);
        } else {
          setActiveTab(tab);
        }
      }} 
      userRole={authState.user?.role || UserRole.ACS} 
      userName={authState.user?.name || 'Visitante'}
      onLogout={() => { setAuthState({ user: GUEST_USER }); setActiveTab('dashboard'); }}
    >
      {activeTab === 'dashboard' && (
        <div className="space-y-8 animate-in fade-in duration-500">
           <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-center md:text-left">
                <h2 className="text-4xl font-black text-emerald-900 tracking-tight uppercase leading-none">Portal ACS Mulungu do Morro</h2>
                <p className="text-slate-500 font-medium italic mt-2">
                  {authState.user?.id === 'guest' ? 'Bem-vindo(a) ao portal da associação' : `Olá, ${authState.user?.name}`}
                </p>
              </div>
              {authState.user?.id === 'guest' && (
                <button onClick={() => setRegistrationState('form')} className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl hover:bg-emerald-700 transition-all uppercase tracking-widest text-[10px]">
                  Ficha de Inscrição
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
              <button onClick={() => setActiveTab('best-practices')} className="p-8 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 text-left hover:shadow-2xl transition-all group">
                <div className="w-14 h-14 bg-yellow-50 text-yellow-600 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:bg-yellow-400 group-hover:text-blue-900 transition-all">✅</div>
                <h3 className="text-xl font-bold text-slate-800">Boas Práticas</h3>
                <p className="text-slate-500 text-sm mt-2 tracking-tight">Metas de Visita.</p>
              </button>
              <button onClick={() => setActiveTab('indicators')} className="p-8 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 text-left hover:shadow-2xl transition-all group">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-all">📊</div>
                <h3 className="text-xl font-bold text-slate-800">Indicadores</h3>
                <p className="text-slate-500 text-sm mt-2 tracking-tight">Previne Brasil e Rankings.</p>
              </button>
              <button onClick={() => setActiveTab('treasury')} className="p-8 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 text-left hover:shadow-2xl transition-all group">
                <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:bg-amber-600 group-hover:text-white transition-all">⚖️</div>
                <h3 className="text-xl font-bold text-slate-800">Tesouraria</h3>
                <p className="text-slate-500 text-sm mt-2 tracking-tight">Transparência Financeira.</p>
              </button>
              <button onClick={() => setActiveTab('profile')} className="p-8 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 text-left hover:shadow-2xl transition-all group">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-all">🪪</div>
                <h3 className="text-xl font-bold text-slate-800">Carteirinha</h3>
                <p className="text-slate-500 text-sm mt-2 tracking-tight">Dados e Identificação.</p>
              </button>
            </div>
            
            <div className="bg-emerald-900 rounded-[3rem] p-10 md:p-20 text-white relative overflow-hidden shadow-2xl">
              <h2 className="text-5xl font-black mb-6 leading-tight max-w-xl text-left">Tecnologia a serviço do Agente.</h2>
              <p className="text-emerald-100 text-xl opacity-80 leading-relaxed max-w-lg mb-10 font-medium text-left">
                Sincronização em tempo real. Seus dados estão protegidos na nuvem.
              </p>
              <Logo className="absolute -bottom-20 -right-20 w-96 h-96 opacity-10 rotate-12" />
            </div>
        </div>
      )}

      {activeTab === 'members' && (
        <AdminDashboard 
          members={members} 
          setMembers={setMembers} 
          onDataImported={() => {}} 
          currentUserId={authState.user?.id || ''} 
          onResetIndicators={async () => {
            if(window.confirm("Restaurar indicadores padrão 360?")) {
              await databaseService.seedInitialData(DEFAULT_APS, DEFAULT_DENTAL);
              alert("Sincronizado!");
            }
          }} 
        />
      )}
      {activeTab === 'best-practices' && <BestPracticesSection />}
      {activeTab === 'indicators' && <IndicatorsSection apsIndicators={apsIndicators} setApsIndicators={setApsIndicators} dentalIndicators={dentalIndicators} setDentalIndicators={setDentalIndicators} isAdmin={authState.user?.role === UserRole.ADMIN} />}
      {activeTab === 'treasury' && <TreasurySection isAdmin={authState.user?.role === UserRole.ADMIN} userName={authState.user?.name || ''} />}
      {activeTab === 'profile' && <ProfileSection member={members.find(m => m.id === authState.user?.id)} isGuest={authState.user?.id === 'guest'} onOpenLogin={() => setShowUserLogin(true)} />}
      {activeTab === 'news' && <NewsSection />}
      {activeTab === 'payslip' && <PayslipSection />}

      {showUserLogin && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl max-md w-full relative">
            <button onClick={() => setShowUserLogin(false)} className="absolute top-6 right-6 text-slate-300 hover:text-slate-500 text-2xl">✕</button>
            <div className="text-center mb-8">
              <Logo className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Entrar no Portal</h3>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <input placeholder="CPF (Apenas números)" className="w-full p-5 bg-slate-50 border rounded-2xl font-bold" value={loginForm.cpf} onChange={e => setLoginForm({...loginForm, cpf: e.target.value})} required />
              <input type="password" placeholder="Sua Senha" className="w-full p-5 bg-slate-50 border rounded-2xl" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} required />
              <button type="submit" className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl">Acessar</button>
            </form>
          </div>
        </div>
      )}

      {showAdminLogin && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl flex items-center justify-center z-[120] p-4 text-center">
          <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl max-sm w-full">
            <h3 className="text-2xl font-black text-slate-800 mb-6 uppercase tracking-tighter">🔒 Área Restrita</h3>
            <form onSubmit={handleAdminVerify} className="space-y-4">
              <input 
                type="password" 
                placeholder="SENHA MESTRA" 
                className="w-full p-5 bg-slate-50 border rounded-2xl text-center text-2xl font-black tracking-widest outline-none focus:ring-2 focus:ring-emerald-500" 
                value={adminPassword} 
                onChange={(e) => setAdminPassword(e.target.value)} 
                autoFocus 
                required 
              />
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowAdminLogin(false)} className="flex-1 py-4 text-slate-400 font-bold uppercase text-[10px] tracking-widest">Voltar</button>
                <button type="submit" className="flex-1 bg-emerald-600 text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg">Entrar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {registrationState === 'form' && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[110] flex items-center justify-center p-4 overflow-y-auto">
           <div className="bg-white rounded-[3rem] p-8 md:p-10 max-w-xl w-full shadow-2xl my-8">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black text-emerald-900 uppercase tracking-tighter">Ficha de Inscrição</h3>
                <button onClick={() => setRegistrationState('closed')} className="text-slate-300 hover:text-rose-600 text-2xl">✕</button>
             </div>
             <form onSubmit={handleRegistration} className="space-y-4">
                <div className="flex flex-col items-center mb-6" onClick={() => fileInputRef.current?.click()}>
                   <div className="w-24 h-24 bg-slate-100 rounded-3xl border-2 border-emerald-100 flex items-center justify-center overflow-hidden mb-2 shadow-inner">
                      {registrationPhoto ? <img src={registrationPhoto} className="w-full h-full object-cover" /> : <span className="text-3xl">📷</span>}
                   </div>
                   <input type="file" accept="image/*" ref={fileInputRef} onChange={e => {
                     const file = e.target.files?.[0];
                     if(file) {
                        const reader = new FileReader();
                        reader.onloadend = () => setRegistrationPhoto(reader.result as string);
                        reader.readAsDataURL(file);
                     }
                   }} className="hidden" />
                   <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Toque para Foto</p>
                </div>
                
                <input name="fullName" placeholder="NOME COMPLETO" className="w-full p-4 bg-slate-50 border rounded-xl font-bold uppercase" required />
                
                <div className="grid grid-cols-2 gap-4">
                   <input name="birthDate" type="date" className="w-full p-4 bg-slate-50 border rounded-xl font-bold uppercase text-[10px]" required />
                   <input name="cpf" placeholder="CPF" className="w-full p-4 bg-slate-50 border rounded-xl font-bold" required />
                </div>
                
                <div className="flex gap-2">
                   <button type="button" onClick={() => setRegArea('Urbana')} className={`flex-1 py-4 rounded-xl font-black uppercase text-[10px] border-2 ${regArea === 'Urbana' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>Urbana</button>
                   <button type="button" onClick={() => setRegArea('Rural')} className={`flex-1 py-4 rounded-xl font-black uppercase text-[10px] border-2 ${regArea === 'Rural' ? 'bg-amber-600 text-white border-amber-600' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>Rural</button>
                </div>
                
                <div>
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Unidade de Saúde (PSF)</label>
                   <select 
                     value={regPsf} 
                     onChange={e => setRegPsf(e.target.value)}
                     className="w-full p-4 bg-slate-50 border rounded-xl font-bold uppercase text-xs"
                   >
                     {PSF_LIST.map(psf => <option key={psf} value={psf}>{psf}</option>)}
                   </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <input name="team" placeholder="EQUIPE" className="w-full p-4 bg-slate-50 border rounded-xl font-bold uppercase" required />
                   <input name="microArea" placeholder="MICROÁREA" className="w-full p-4 bg-slate-50 border rounded-xl font-bold uppercase" required />
                </div>
                
                <button type="submit" className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black shadow-lg uppercase tracking-widest text-xs mt-4">ENVIAR INSCRIÇÃO</button>
             </form>
           </div>
        </div>
      )}

      {registrationState === 'success' && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] p-12 text-center shadow-2xl max-w-sm">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">✅</div>
            <h3 className="text-2xl font-black mb-4 uppercase tracking-tighter">Sucesso!</h3>
            <p className="mb-8 text-slate-500">Sua ficha foi enviada. Aguarde ativação do CPF pela diretoria.</p>
            <button onClick={() => setRegistrationState('closed')} className="w-full bg-emerald-900 text-white py-4 rounded-xl font-black uppercase tracking-widest text-[10px]">Entendido</button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;