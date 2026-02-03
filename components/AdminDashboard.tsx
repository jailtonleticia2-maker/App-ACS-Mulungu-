

import React, { useState, useRef, useEffect } from 'react';
import { Member, UserRole, PSF_LIST } from '../types';
import { databaseService } from '../services/databaseService';

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
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [accessStats, setAccessStats] = useState({ accessCount: 0 });
  
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (adminView === 'settings') {
      const unsubStats = databaseService.subscribeSystemStats((stats) => {
        setAccessStats(stats);
      });
      return () => {
        unsubStats();
      };
    }
  }, [adminView]);

  const pendingMembers = members.filter(m => m.status === 'Pendente');
  const activeMembers = members.filter(m => m.status !== 'Pendente');
  const onlineCount = activeMembers.filter(m => m.isOnline).length;

  const initialForm: Member = {
    id: '', fullName: '', cpf: '', cns: '', birthDate: '', password: '1234',
    gender: 'Masculino', workplace: PSF_LIST[0], microArea: '', team: '', areaType: 'Urbana',
    status: 'Ativo', registrationDate: new Date().toISOString(),
    profileImage: '', role: UserRole.ACS, accessCount: 0, dailyAccessCount: 0, isOnline: false
  };

  const [formData, setFormData] = useState<Member>(initialForm);
  const [newPassword, setNewPassword] = useState('');

  const executeConfirmAction = async () => {
    if (!confirmAction) return;
    setIsProcessing(true);
    
    try {
      const { type, member } = confirmAction;
      
      if (type === 'approve') {
        await databaseService.saveMember({ ...member, status: 'Ativo' });
      } else if (type === 'delete') {
        await databaseService.deleteMember(member.id);
      } else if (type === 'admin') {
        const newRole = member.role === UserRole.ADMIN ? UserRole.ACS : UserRole.ADMIN;
        await databaseService.saveMember({ ...member, role: newRole });
      }
      
      setConfirmAction(null);
    } catch (err: any) {
      alert("Erro ao processar ação: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const finalMember = editingMember 
        ? formData 
        : { ...formData, id: `acs-${Date.now()}`, registrationDate: new Date().toISOString() };

      await databaseService.saveMember(finalMember);
      setIsModalOpen(false);
      setEditingMember(null);
      setFormData(initialForm);
    } catch (err) {
      alert("Erro ao salvar cadastro.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMember && newPassword) {
      setIsProcessing(true);
      try {
        await databaseService.saveMember({ ...editingMember, password: newPassword });
        setIsPasswordModalOpen(false);
        setNewPassword('');
      } catch (err) {
        alert("Erro ao mudar senha.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom duration-500 pb-24 text-left">
      <header className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-emerald-900 uppercase tracking-tighter">Gestão de Sócios</h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Administrador: {currentUserId === 'admin-01' ? 'Mestre Jailton' : 'Diretoria'}</p>
        </div>
        
        <div className="flex bg-slate-200 p-1 rounded-2xl">
          <button onClick={() => setAdminView('members')} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${adminView === 'members' ? 'bg-white shadow-md text-emerald-800' : 'text-slate-500'}`}>Lista de ACS</button>
          <button onClick={() => setAdminView('settings')} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${adminView === 'settings' ? 'bg-white shadow-md text-emerald-800' : 'text-slate-500'}`}>Sistema</button>
        </div>
      </header>

      {adminView === 'members' ? (
        <div className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="bg-emerald-900 text-white p-6 rounded-[2rem] shadow-lg flex items-center justify-between">
                <div>
                   <p className="text-[10px] font-black uppercase opacity-60">Sócios Online</p>
                   <p className="text-3xl font-black">{onlineCount}</p>
                </div>
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-2xl">🟢</div>
             </div>
             <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-between">
                <div>
                   <p className="text-[10px] font-black uppercase text-slate-400">Total Ativos</p>
                   <p className="text-3xl font-black text-slate-800">{activeMembers.length}</p>
                </div>
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-2xl">👥</div>
             </div>
             <div className="bg-amber-50 p-6 rounded-[2rem] shadow-sm border border-amber-100 flex items-center justify-between">
                <div>
                   <p className="text-[10px] font-black uppercase text-amber-600">Pendentes</p>
                   <p className="text-3xl font-black text-amber-700">{pendingMembers.length}</p>
                </div>
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl">⏳</div>
             </div>
          </div>

          {pendingMembers.length > 0 && (
            <section className="bg-amber-50 border-2 border-amber-200 rounded-[3rem] p-8 md:p-10 shadow-lg animate-in zoom-in duration-300">
               <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center text-2xl shadow-lg">🔔</div>
                  <h3 className="text-2xl font-black text-amber-900 uppercase tracking-tight">Novos Pedidos ({pendingMembers.length})</h3>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingMembers.map(m => (
                    <div key={m.id} className="bg-white p-6 rounded-[2rem] border border-amber-100 flex items-center justify-between shadow-sm">
                       <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-slate-50 overflow-hidden border-2 border-amber-100">
                             {m.profileImage ? <img src={m.profileImage} className="w-full h-full object-cover" /> : <span className="flex items-center justify-center h-full text-xl">👤</span>}
                          </div>
                          <div>
                             <p className="font-black text-slate-800 uppercase text-xs leading-tight">{m.fullName}</p>
                             <p className="text-[10px] text-slate-400 font-bold uppercase">{m.workplace}</p>
                          </div>
                       </div>
                       <div className="flex flex-col gap-2">
                          <button 
                            type="button" 
                            onClick={() => setConfirmAction({ type: 'approve', member: m })}
                            className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-black uppercase text-[9px] shadow-md active:scale-95 transition-all"
                          >
                            Aceitar
                          </button>
                          <button 
                            type="button" 
                            onClick={() => setConfirmAction({ type: 'delete', member: m })}
                            className="bg-rose-50 text-rose-600 px-5 py-2.5 rounded-xl font-black uppercase text-[9px] active:scale-95 transition-all"
                          >
                            Recusar
                          </button>
                       </div>
                    </div>
                  ))}
               </div>
            </section>
          )}

          <div className="space-y-4">
            <div className="flex justify-between items-end px-4">
               <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Agentes Associados</h3>
               <button onClick={() => { setEditingMember(null); setFormData(initialForm); setIsModalOpen(true); }} className="bg-emerald-900 text-white px-6 py-3 rounded-2xl font-black uppercase text-[9px] shadow-lg">+ Novo Cadastro</button>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="px-8 py-5">Membro</th>
                      <th className="px-6 py-5 text-center">PSF / Equipe</th>
                      <th className="px-6 py-5 text-center">Hoje</th>
                      <th className="px-6 py-5 text-center">Total</th>
                      <th className="px-8 py-5 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {activeMembers.map(m => (
                      <tr key={m.id} className="hover:bg-slate-50/50 transition-all">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden border-2 border-white shadow-md">
                                {m.profileImage ? <img src={m.profileImage} className="w-full h-full object-cover" /> : <span className="flex items-center justify-center h-full text-[10px] text-slate-300 font-black">ACS</span>}
                              </div>
                            </div>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className={`font-black text-sm uppercase leading-tight ${m.isOnline ? 'text-emerald-700' : 'text-slate-800'}`}>
                                  {m.fullName}
                                </p>
                                {m.role === UserRole.ADMIN && <span className="bg-amber-100 text-amber-700 text-[8px] px-2 py-0.5 rounded-full font-black border border-amber-200 uppercase tracking-tighter">ADM</span>}
                                
                                {/* ETIQUETA ONLINE / OFFLINE AO LADO DO NOME */}
                                {m.isOnline ? (
                                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full text-[8px] font-black border border-emerald-100 uppercase tracking-tighter animate-pulse shadow-sm">
                                    <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
                                    Online
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 bg-slate-50 text-slate-400 px-2 py-0.5 rounded-full text-[8px] font-black border border-slate-200 uppercase tracking-tighter opacity-70">
                                    Offline
                                  </span>
                                )}
                              </div>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">CPF: {m.cpf}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                           <p className="text-[10px] font-black text-slate-600 uppercase leading-none">{m.workplace}</p>
                           <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">EQ: {m.team} / MA: {m.microArea}</p>
                        </td>
                        <td className="px-6 py-5 text-center">
                           <div className="inline-flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                              <span className="text-[10px]">📱</span>
                              <span className="text-[11px] font-black text-emerald-700">{m.dailyAccessCount || 0}</span>
                           </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                           <div className="inline-flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full border border-slate-100 shadow-inner">
                              <span className="text-[11px] font-black text-slate-500">{m.accessCount || 0}</span>
                           </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex justify-center items-center gap-2">
                            <button type="button" onClick={() => setConfirmAction({ type: 'admin', member: m })} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${m.role === UserRole.ADMIN ? 'bg-amber-400 text-white shadow-md' : 'bg-slate-100 text-slate-300'}`} title="Cargo">⭐</button>
                            <button type="button" onClick={() => { setEditingMember(m); setNewPassword(''); setIsPasswordModalOpen(true); }} className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shadow-sm" title="Mudar Senha">🔑</button>
                            <button type="button" onClick={() => { setEditingMember(m); setFormData({...m}); setIsModalOpen(true); }} className="w-10 h-10 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center shadow-sm" title="Editar Dados">✏️</button>
                            <button type="button" onClick={() => setConfirmAction({ type: 'delete', member: m })} className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shadow-sm" title="Excluir">🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-8">
           <div className="bg-[#0f172a] rounded-[3.5rem] p-12 text-white shadow-2xl relative overflow-hidden group border border-white/5">
              <div className="absolute -right-8 -top-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>
              
              <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-8">
                <div>
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <span className="w-3 h-3 bg-emerald-400 rounded-full animate-ping"></span>
                    <span className="text-[12px] font-black text-emerald-400 uppercase tracking-[0.4em]">Analytics Cloud Ativo</span>
                  </div>
                  <h3 className="text-4xl font-black uppercase tracking-tighter">Impacto Digital</h3>
                  <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mt-2">Monitoramento de engajamento no portal da associação</p>
                </div>
                
                <div className="bg-white/5 backdrop-blur-md px-16 py-10 rounded-[3rem] border border-white/10 shadow-inner inline-block">
                   <p className="text-[10px] font-black uppercase text-emerald-400 mb-2">Acessos Totais Acumulados</p>
                   <p className="text-7xl font-black text-white tracking-tighter">{accessStats.accessCount.toLocaleString('pt-BR')}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-2xl mt-8">
                   <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                      <p className="text-[8px] font-black text-slate-500 uppercase">Status Global</p>
                      <p className="text-xl font-black">{onlineCount} ACS Online</p>
                   </div>
                   <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                      <p className="text-[8px] font-black text-slate-500 uppercase">Sincronização</p>
                      <p className="text-xl font-black">Tempo Real</p>
                   </div>
                   <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                      <p className="text-[8px] font-black text-slate-500 uppercase">Segurança</p>
                      <p className="text-xl font-black">End-to-End</p>
                   </div>
                </div>
              </div>
           </div>

           <div className="bg-white p-10 rounded-[3.5rem] shadow-xl border border-slate-100">
              <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-8">Administração do Sistema</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button onClick={onResetIndicators} className="bg-blue-600 text-white py-5 rounded-3xl font-black uppercase text-[10px] shadow-lg hover:bg-blue-700 transition-all transform active:scale-95">Sincronizar Indicadores 360</button>
                  <button 
                    onClick={() => { 
                      if(window.prompt('Para resetar tudo, digite RESET:') === 'RESET') {
                          databaseService.clearDatabase(currentUserId).then(() => alert('Tudo limpo!'));
                      }
                    }} 
                    className="bg-rose-50 text-rose-600 py-5 rounded-3xl font-black uppercase text-[10px] border-2 border-rose-100 hover:bg-rose-600 hover:text-white transition-all transform active:scale-95"
                  >
                    Zerar Banco de Dados
                  </button>
              </div>
           </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO SEGURO */}
      {confirmAction && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[500] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] p-10 w-full max-sm shadow-2xl animate-in zoom-in duration-300 text-center">
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 shadow-inner ${
              confirmAction.type === 'delete' ? 'bg-rose-50 text-rose-500' : 
              confirmAction.type === 'approve' ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500'
            }`}>
              {confirmAction.type === 'delete' ? '⚠️' : 
               confirmAction.type === 'approve' ? '✅' : '⭐'}
            </div>
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter mb-4">
              {confirmAction.type === 'delete' ? 'Confirmar Exclusão' : 
               confirmAction.type === 'approve' ? 'Aprovar Sócio' : 'Alterar Cargo'}
            </h3>
            <p className="text-slate-500 text-sm mb-10 leading-relaxed">
              Deseja realmente {
                confirmAction.type === 'delete' ? 'EXCLUIR PERMANENTEMENTE' : 
                confirmAction.type === 'approve' ? 'APROVAR e LIBERAR o acesso de' : 'mudar o cargo de'
              } <strong>{confirmAction.member.fullName}</strong>?
            </p>
            
            <div className="space-y-3">
              <button 
                disabled={isProcessing}
                onClick={executeConfirmAction}
                className={`w-full py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest text-white shadow-xl transition-all ${
                  confirmAction.type === 'delete' ? 'bg-rose-600' : 'bg-emerald-900'
                } ${isProcessing ? 'opacity-50' : 'active:scale-95'}`}
              >
                {isProcessing ? 'Processando...' : 'Sim, Confirmar'}
              </button>
              <button 
                disabled={isProcessing}
                onClick={() => setConfirmAction(null)}
                className="w-full text-slate-400 font-bold uppercase text-[9px] py-2"
              >
                Não, Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL FICHA (CADASTRO/EDIÇÃO) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] p-10 w-full max-w-2xl shadow-2xl animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
               <h3 className="text-2xl font-black text-emerald-900 uppercase tracking-tighter">Ficha do Agente</h3>
               <button onClick={() => setIsModalOpen(false)} className="text-2xl text-slate-300">✕</button>
            </div>
            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="md:col-span-2 flex flex-col items-center">
                  <div className="w-24 h-24 bg-slate-50 rounded-[2rem] border-4 border-emerald-50 overflow-hidden mb-2 cursor-pointer relative group" onClick={() => fileInputRef.current?.click()}>
                    {formData.profileImage ? <img src={formData.profileImage} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-3xl">👤</div>}
                  </div>
                  <input type="file" ref={fileInputRef} onChange={(e) => { const file = e.target.files?.[0]; if(file){ const reader = new FileReader(); reader.onloadend = () => setFormData({...formData, profileImage: reader.result as string}); reader.readAsDataURL(file); } }} className="hidden" />
               </div>
               
               <div className="md:col-span-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Nome Completo</label>
                  <input required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value.toUpperCase()})} className="w-full p-4 bg-slate-50 border-2 rounded-2xl font-black uppercase text-sm" />
               </div>

               <div className="md:col-span-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Data de Nascimento</label>
                  <input required type="date" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} className="w-full p-4 bg-slate-50 border-2 rounded-2xl font-black text-sm" />
               </div>

               <div className="md:col-span-2 grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Equipe</label>
                    <input required value={formData.team} onChange={e => setFormData({...formData, team: e.target.value.toUpperCase()})} className="w-full p-4 bg-slate-50 border-2 rounded-2xl font-black uppercase text-sm" />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Microárea</label>
                    <input required value={formData.microArea} onChange={e => setFormData({...formData, microArea: e.target.value})} className="w-full p-4 bg-slate-50 border-2 rounded-2xl font-black uppercase text-sm" />
                  </div>
               </div>
               
               <div className="md:col-span-2 grid grid-cols-2 gap-4 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="w-full font-black text-slate-400 uppercase text-[10px] tracking-widest py-4">Cancelar</button>
                  <button disabled={isProcessing} type="submit" className="w-full bg-emerald-900 text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl">
                    {isProcessing ? 'Salvando...' : 'Salvar Sócio'}
                  </button>
               </div>
            </form>
          </div>
        </div>
      )}

      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[250] flex items-center justify-center p-4">
           <div className="bg-white rounded-[3rem] p-10 w-full max-sm shadow-2xl text-center">
              <h3 className="text-2xl font-black text-slate-800 uppercase mb-8">Nova Senha</h3>
              <form onSubmit={handlePasswordUpdate} className="space-y-6">
                 <input required autoFocus type="text" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full p-6 bg-slate-50 border-4 rounded-[2.5rem] font-black text-center text-3xl tracking-[0.4em]" />
                 <button disabled={isProcessing} type="submit" className="w-full bg-emerald-900 text-white py-5 rounded-2xl font-black uppercase text-[11px] shadow-xl">
                    {isProcessing ? 'Atualizando...' : 'Confirmar'}
                 </button>
                 <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="w-full text-slate-400 font-bold uppercase text-[9px] py-2">Sair</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;