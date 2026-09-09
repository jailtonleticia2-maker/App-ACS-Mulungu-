
import React, { useState, useRef, useEffect } from 'react';
import { Member, UserRole, PSF_LIST, SystemConfig } from '../types';
import { databaseService } from '../services/databaseService';
import { processProfileImage } from '../services/imageUtils';
import SignaturePadModal from './SignaturePadModal';

interface AdminDashboardProps {
  members: Member[];
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
  onDataImported: () => void;
  currentUserId: string;
  onResetIndicators?: () => Promise<void>;
}

type ConfirmAction = {
  type: 'approve' | 'delete' | 'admin';
  member: Member;
} | null;

const AdminDashboard: React.FC<AdminDashboardProps> = ({ members, currentUserId, onResetIndicators }) => {
  const [adminView, setAdminView] = useState<'members' | 'settings'>('members');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [accessStats, setAccessStats] = useState({ accessCount: 0 });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [sysConfig, setSysConfig] = useState<SystemConfig>({ q1Label: 'Q1/25', q2Label: 'Q2/25', q3Label: 'Q3/25' });
  
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);

  const docInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const memberPhotoInputRef = useRef<HTMLInputElement>(null);
  const [targetDocId, setTargetDocId] = useState<string | null>(null);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);

  const handleMemberPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessingPhoto(true);
    try {
      const optimized = await processProfileImage(file);
      setFormData(prev => ({ ...prev, profileImage: optimized }));
    } catch (err: any) {
      alert(err.message || 'Erro ao carregar a foto do aparelho.');
    } finally {
      setIsProcessingPhoto(false);
      if (e.target) e.target.value = '';
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    const unsubConfig = databaseService.subscribeSystemConfig(setSysConfig);
    return () => { clearInterval(timer); unsubConfig(); };
  }, []);

  useEffect(() => {
    if (adminView === 'settings') {
      const unsubStats = databaseService.subscribeSystemStats(setAccessStats);
      return () => unsubStats();
    }
  }, [adminView]);

  const isReallyOnline = (member: Member) => {
    if (!member.isOnline || !member.lastSeen) return false;
    const lastSeenDate = new Date(member.lastSeen);
    const diffInMinutes = (currentTime.getTime() - lastSeenDate.getTime()) / 60000;
    return diffInMinutes < 3;
  };

  const pendingMembers = members.filter(m => m.status === 'Pendente');
  const activeMembers = members.filter(m => m.status !== 'Pendente');
  const onlineCount = activeMembers.filter(m => isReallyOnline(m)).length;

  const initialForm: Member = {
    id: '', fullName: '', cpf: '', cns: '', birthDate: '', password: '1234',
    gender: 'Masculino', workplace: PSF_LIST[0], microArea: '', team: '', areaType: 'Urbana',
    status: 'Ativo', registrationDate: new Date().toISOString(),
    profileImage: '', role: UserRole.ACS, accessCount: 0, dailyAccessCount: 0, isOnline: false,
    lastSeen: new Date().toISOString()
  };

  const [formData, setFormData] = useState<Member>(initialForm);
  const [newPassword, setNewPassword] = useState('');

  const handleSaveConfig = async () => {
    try {
      await databaseService.updateSystemConfig(sysConfig);
      alert("Cronograma atualizado em todo o sistema!");
    } catch (err) {
      alert("Erro ao salvar configuração.");
    }
  };

  const executeConfirmAction = async () => {
    if (!confirmAction) return;
    setIsProcessing(true);
    try {
      const { type, member } = confirmAction;
      if (type === 'approve') await databaseService.saveMember({ ...member, status: 'Ativo' });
      else if (type === 'delete') await databaseService.deleteMember(member.id);
      else if (type === 'admin') await databaseService.saveMember({ ...member, role: member.role === UserRole.ADMIN ? UserRole.ACS : UserRole.ADMIN });
      setConfirmAction(null);
    } catch (err: any) {
      alert("Erro ao processar.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 8) val = val.slice(0, 8);
    let formatted = val;
    if (val.length > 2) formatted = val.slice(0, 2) + '/' + val.slice(2);
    if (val.length > 4) formatted = val.slice(0, 2) + '/' + val.slice(2, 4) + '/' + val.slice(4);
    setFormData({...formData, birthDate: formatted});
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const finalMember = editingMember ? formData : { ...formData, id: `acs-${Date.now()}`, registrationDate: new Date().toISOString() };
      await databaseService.saveMember(finalMember);
      if (!finalMember.membershipNumber) {
        await databaseService.getOrAssignMembershipNumber(finalMember.id);
      }
      setIsModalOpen(false);
      setEditingMember(null);
      setFormData(initialForm);
    } catch (err) { alert("Erro."); } finally { setIsProcessing(false); }
  };

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !targetDocId) return;
    if (file.type !== 'application/pdf') return alert("PDF apenas.");
    setUploadingDoc(targetDocId);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try { await databaseService.saveDocument(targetDocId, reader.result as string); alert("Documento ok!"); }
      catch { alert("Erro."); } finally { setUploadingDoc(null); setTargetDocId(null); }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom duration-500 pb-24 text-left">
      <header className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-emerald-900 uppercase tracking-tighter">Gestão Administrativa</h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] mt-1 tracking-widest">Painel Mestre</p>
        </div>
        <div className="flex bg-slate-200 p-1 rounded-2xl">
          <button onClick={() => setAdminView('members')} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${adminView === 'members' ? 'bg-white shadow-md text-emerald-800' : 'text-slate-500'}`}>Membros</button>
          <button onClick={() => setAdminView('settings')} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${adminView === 'settings' ? 'bg-white shadow-md text-emerald-800' : 'text-slate-500'}`}>Sistema</button>
        </div>
      </header>

      {adminView === 'members' ? (
        <div className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="bg-emerald-900 text-white p-6 rounded-[2rem] shadow-lg flex items-center justify-between">
                <div><p className="text-[10px] font-black uppercase opacity-60">Online Agora</p><p className="text-3xl font-black">{onlineCount}</p></div>
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-2xl">🟢</div>
             </div>
             <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-between">
                <div><p className="text-[10px] font-black uppercase text-slate-400">Total Ativos</p><p className="text-3xl font-black text-slate-800">{activeMembers.length}</p></div>
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-2xl">👥</div>
             </div>
             <div className="bg-amber-50 p-6 rounded-[2rem] shadow-sm border border-amber-100 flex items-center justify-between">
                <div><p className="text-[10px] font-black uppercase text-amber-600">Pendentes</p><p className="text-3xl font-black text-amber-700">{pendingMembers.length}</p></div>
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl">⏳</div>
             </div>
          </div>

          {pendingMembers.length > 0 && (
            <div className="bg-amber-50 rounded-[2.5rem] shadow-sm border border-amber-100 overflow-hidden">
              <div className="p-8 border-b border-amber-100 flex justify-between items-center">
                <h3 className="text-[11px] font-black text-amber-600 uppercase tracking-widest">Solicitações Pendentes</h3>
                <span className="bg-amber-200 text-amber-800 px-3 py-1 rounded-full text-[10px] font-black">{pendingMembers.length}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <tbody className="divide-y divide-amber-100">
                    {pendingMembers.map(m => (
                      <tr key={m.id} className="hover:bg-amber-100/30">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white overflow-hidden border-2 border-amber-200 shadow-xs shrink-0 flex items-center justify-center">
                              {m.profileImage ? (
                                <img src={m.profileImage} className="w-full h-full object-cover object-top" alt={m.fullName} />
                              ) : (
                                <span className="text-xs text-amber-700 font-black">ACS</span>
                              )}
                            </div>
                            <div>
                              <p className="font-black text-sm uppercase text-amber-900">{m.fullName}</p>
                              <div className="flex flex-wrap items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-amber-700 font-bold uppercase">{m.cpf} • {m.workplace}</span>
                                {m.microArea && (
                                  <span className="text-[8px] font-black bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded border border-amber-300 uppercase">
                                    MA: {m.microArea}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className="flex justify-end gap-3">
                            <button 
                              onClick={() => setConfirmAction({ type: 'delete', member: m })}
                              className="px-4 py-2 bg-white text-rose-500 rounded-xl text-[10px] font-black uppercase border border-rose-100 shadow-sm hover:bg-rose-50"
                            >
                              Negar
                            </button>
                            <button 
                              onClick={() => setConfirmAction({ type: 'approve', member: m })}
                              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase shadow-md hover:bg-emerald-700"
                            >
                              Aprovar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
            <div className="flex justify-between items-center p-8 border-b border-slate-50">
               <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Lista de Agentes</h3>
               <button onClick={() => { setEditingMember(null); setFormData(initialForm); setIsModalOpen(true); }} className="bg-emerald-900 text-white px-6 py-3 rounded-xl font-black uppercase text-[9px] shadow-lg">+ Novo</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50">
                  <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="px-8 py-5">Membro</th>
                    <th className="px-6 py-5 text-center">PSF</th>
                    <th className="px-6 py-5 text-center">Acessos</th>
                    <th className="px-8 py-5 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {activeMembers.map(m => (
                    <tr key={m.id} className="hover:bg-slate-50/50">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden border-2 border-white shadow-sm">
                            {m.profileImage ? <img src={m.profileImage} className="w-full h-full object-cover" /> : <span className="flex items-center justify-center h-full text-[10px] text-slate-300 font-black">ACS</span>}
                          </div>
                          <div>
                            <p className={`font-black text-sm uppercase ${isReallyOnline(m) ? 'text-emerald-700' : 'text-slate-800'}`}>{m.fullName}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {m.membershipNumber && (
                                <span className="text-[8px] font-black bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded border border-emerald-200">
                                  ID: ACS-{m.membershipNumber.replace(/\D/g, '').padStart(3, '0')}
                                </span>
                              )}
                              {m.microArea && (
                                <span className="text-[8px] font-black bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded border border-slate-200 uppercase">
                                  MA: {m.microArea}
                                </span>
                              )}
                              {m.role === UserRole.ADMIN && <span className="text-[7px] font-black text-amber-600 uppercase">Administrador</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center text-[10px] font-black uppercase text-slate-500">{m.workplace}</td>
                      <td className="px-6 py-5 text-center font-black text-emerald-600">{m.accessCount || 0}</td>
                      <td className="px-8 py-5">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => setConfirmAction({ type: 'admin', member: m })} className="p-2 bg-slate-100 rounded-lg text-lg opacity-40 hover:opacity-100">⭐</button>
                          <button onClick={() => { setEditingMember(m); setFormData(m); setIsModalOpen(true); }} className="p-2 bg-slate-100 rounded-lg text-lg">✏️</button>
                          <button onClick={() => setConfirmAction({ type: 'delete', member: m })} className="p-2 bg-rose-50 text-rose-500 rounded-lg text-lg">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-10">
           {/* CONFIGURAÇÃO DE CRONOGRAMA */}
           <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center text-3xl shadow-inner">📅</div>
                 <div>
                    <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Cronograma de Resultados</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Altere aqui os nomes dos quadrimestres (Ex: Q1/26)</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Rótulo 1º Quadrimestre</label>
                    <input value={sysConfig.q1Label} onChange={e => setSysConfig({...sysConfig, q1Label: e.target.value.toUpperCase()})} className="w-full p-4 bg-slate-50 border-2 rounded-2xl font-black uppercase text-emerald-700" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Rótulo 2º Quadrimestre</label>
                    <input value={sysConfig.q2Label} onChange={e => setSysConfig({...sysConfig, q2Label: e.target.value.toUpperCase()})} className="w-full p-4 bg-slate-50 border-2 rounded-2xl font-black uppercase text-emerald-700" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Rótulo 3º Quadrimestre</label>
                    <input value={sysConfig.q3Label} onChange={e => setSysConfig({...sysConfig, q3Label: e.target.value.toUpperCase()})} className="w-full p-4 bg-slate-50 border-2 rounded-2xl font-black uppercase text-emerald-700" />
                 </div>
              </div>
              <button onClick={handleSaveConfig} className="w-full bg-emerald-900 text-white py-5 rounded-2xl font-black uppercase text-[11px] shadow-xl hover:bg-black transition-all">Sincronizar Cronograma</button>
           </div>

           <div className="bg-[#0f172a] rounded-[3.5rem] p-12 text-white shadow-2xl relative overflow-hidden group border border-white/5">
              <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-6">
                <div>
                  <h3 className="text-4xl font-black uppercase tracking-tighter">Impacto Digital</h3>
                  <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mt-2">Acessos Totais Acumulados</p>
                </div>
                <div className="bg-white/5 backdrop-blur-md px-16 py-8 rounded-[3rem] border border-white/10 shadow-inner">
                   <p className="text-7xl font-black text-white tracking-tighter">{accessStats.accessCount.toLocaleString('pt-BR')}</p>
                </div>
              </div>
           </div>

           <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
              <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-8">Administração do Sistema</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button onClick={onResetIndicators} className="bg-blue-600 text-white py-5 rounded-3xl font-black uppercase text-[10px] shadow-lg">Zerar/Sincronizar Indicadores</button>
                  <button onClick={() => { if(window.confirm('Resetar tudo?')) databaseService.clearDatabase(currentUserId); }} className="bg-rose-50 text-rose-600 py-5 rounded-3xl font-black uppercase text-[10px] border-2 border-rose-100">Limpar Banco de Dados</button>
              </div>
           </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-[300] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[3rem] p-10 w-full max-w-2xl shadow-2xl animate-in zoom-in duration-300 my-8">
            <h3 className="text-2xl font-black mb-8 uppercase">{editingMember ? 'Editar Agente' : 'Novo Agente'}</h3>
            <form onSubmit={handleSaveMember} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Foto do Agente Direto do Aparelho */}
                <div className="md:col-span-2 bg-emerald-50/70 p-4 rounded-2xl border-2 border-dashed border-emerald-300 flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-white border-2 border-emerald-500 overflow-hidden shadow-sm flex items-center justify-center shrink-0">
                    {formData.profileImage ? (
                      <img src={formData.profileImage} alt="Foto 3x4" className="w-full h-full object-cover object-top" />
                    ) : (
                      <span className="text-xl text-emerald-400">👤</span>
                    )}
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <label className="text-[10px] font-black uppercase text-emerald-950 block">Foto da Carteirinha (3x4)</label>
                    <p className="text-[8px] text-slate-500 font-semibold mt-0.5 mb-2">Carregue ou substitua a foto direto do aparelho</p>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <input
                        ref={memberPhotoInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleMemberPhotoUpload}
                      />
                      <button
                        type="button"
                        disabled={isProcessingPhoto}
                        onClick={() => memberPhotoInputRef.current?.click()}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[9px] font-black uppercase shadow-xs transition-all flex items-center gap-1"
                      >
                        {isProcessingPhoto ? '⏳ Processando...' : (formData.profileImage ? '🔄 Trocar Foto do Aparelho' : '📷 Carregar Foto do Aparelho')}
                      </button>
                      {formData.profileImage && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, profileImage: '' })}
                          className="px-2.5 py-1.5 bg-white hover:bg-rose-50 text-rose-600 rounded-lg text-[9px] font-black uppercase border border-rose-200 transition-colors"
                        >
                          Remover
                        </button>
                      )}
                    </div>
                  </div>
                </div>
               <div className="md:col-span-2">
                 <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Nome Completo</label>
                 <input placeholder="Nome Completo" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value.toUpperCase()})} className="w-full p-4 bg-slate-50 border-2 rounded-2xl" required />
               </div>
               <div>
                 <label className="text-[10px] font-black uppercase text-slate-400 ml-2">CPF</label>
                 <input placeholder="CPF" value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value})} className="w-full p-4 bg-slate-50 border-2 rounded-2xl" required />
               </div>
               <div>
                 <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Data de Nascimento</label>
                 <input placeholder="DD/MM/AAAA" value={formData.birthDate} onChange={handleBirthDateChange} className="w-full p-4 bg-slate-50 border-2 rounded-2xl" required />
               </div>
               <div>
                 <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Equipe</label>
                 <input placeholder="Equipe" value={formData.team} onChange={e => setFormData({...formData, team: e.target.value})} className="w-full p-4 bg-slate-50 border-2 rounded-2xl" />
               </div>
               <div>
                 <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Micro-Área</label>
                 <input placeholder="Micro-Área" value={formData.microArea} onChange={e => setFormData({...formData, microArea: e.target.value})} className="w-full p-4 bg-slate-50 border-2 rounded-2xl" />
               </div>
               <div className="md:col-span-2">
                 <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Unidade de Saúde</label>
                 <select value={formData.workplace} onChange={e => setFormData({...formData, workplace: e.target.value})} className="w-full p-4 bg-slate-50 border-2 rounded-2xl">
                   {PSF_LIST.map(psf => <option key={psf} value={psf}>{psf}</option>)}
                 </select>
               </div>

               {/* Seção de Assinatura Digital do Sócio */}
               <div className="md:col-span-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                   <div>
                     <label className="text-[10px] font-black uppercase text-slate-700 block">Assinatura Digital do Sócio</label>
                     <p className="text-[9px] text-slate-400 font-semibold">Atribuída automaticamente na carteirinha ou desenhada pelo titular</p>
                   </div>
                   <button
                     type="button"
                     onClick={() => setIsSignatureModalOpen(true)}
                     className="px-3.5 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-1.5 self-start sm:self-auto"
                   >
                     {formData.signatureImage ? '✍️ Alterar Assinatura' : '✍️ Desenhar Assinatura'}
                   </button>
                 </div>

                 {formData.signatureImage ? (
                   <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-emerald-300 shadow-xs">
                     <div className="flex items-center gap-3">
                       <div className="bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                         <img src={formData.signatureImage} alt="Assinatura" className="h-7 max-w-[120px] object-contain" />
                       </div>
                       <div>
                         <span className="text-[10px] font-black text-emerald-800 uppercase block">Assinatura Desenhada</span>
                         <span className="text-[8px] text-slate-400 font-bold">Válida para o verso da carteirinha</span>
                       </div>
                     </div>
                     <button
                       type="button"
                       onClick={() => setFormData({ ...formData, signatureImage: undefined, signatureType: 'auto' })}
                       className="text-[9px] font-black text-rose-500 hover:text-rose-700 uppercase px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 transition-colors"
                     >
                       Usar Automática
                     </button>
                   </div>
                 ) : (
                   <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
                     <div className="flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                       <span className="text-[10px] font-black text-emerald-900 uppercase">Assinatura Digital Automática Ativa</span>
                     </div>
                     <span className="text-[9px] text-slate-400 font-semibold hidden sm:inline">(Caligrafia oficial eletrônica gerada pelo sistema)</span>
                   </div>
                 )}
               </div>

               <div className="md:col-span-2 flex gap-4 mt-4">
                 <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-black uppercase text-slate-400">Cancelar</button>
                 <button type="submit" className="flex-1 bg-emerald-900 text-white py-4 rounded-xl font-black uppercase shadow-lg">Salvar</button>
               </div>
            </form>
          </div>
        </div>
      )}

      <SignaturePadModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        memberName={formData.fullName}
        currentSignature={formData.signatureImage}
        onSave={(sig) => setFormData(prev => ({ ...prev, signatureImage: sig || undefined, signatureType: sig ? 'drawn' : 'auto' }))}
      />

      {confirmAction && (
        <div className="fixed inset-0 bg-slate-900/90 z-[500] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] p-10 max-w-sm w-full text-center">
            <h3 className="text-xl font-black mb-6 uppercase">Confirmar Ação?</h3>
            <div className="flex gap-4">
              <button onClick={() => setConfirmAction(null)} className="flex-1 py-4 font-black text-slate-400">Não</button>
              <button onClick={executeConfirmAction} className="flex-1 bg-rose-600 text-white py-4 rounded-xl font-black">Sim</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;