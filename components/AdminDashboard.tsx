
import React, { useState, useRef } from 'react';
import { Member, UserRole } from '../types';
import { databaseService } from '../services/databaseService';

interface AdminDashboardProps {
  members: Member[];
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
  onDataImported: () => void;
  currentUserId: string;
  onResetIndicators?: () => Promise<void>;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ members, currentUserId, onResetIndicators }) => {
  const [adminView, setAdminView] = useState<'members' | 'settings'>('members');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialForm: Member = {
    id: '', fullName: '', cpf: '', cns: '', birthDate: '', password: '1234',
    gender: 'Masculino', workplace: '', microArea: '', team: '', areaType: 'Urbana',
    status: 'Ativo', registrationDate: new Date().toISOString().split('T')[0],
    profileImage: '', role: UserRole.ACS
  };

  const [formData, setFormData] = useState<Member>(initialForm);
  const [newPassword, setNewPassword] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, profileImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const finalMember = editingMember 
        ? formData 
        : { ...formData, id: `acs-${Date.now()}` };

      await databaseService.saveMember(finalMember);
      setIsModalOpen(false);
      setEditingMember(null);
      setFormData(initialForm);
      alert("Dados salvos com sucesso!");
    } catch (err) {
      alert("Erro ao salvar no banco de dados.");
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMember && newPassword) {
      await databaseService.saveMember({ ...editingMember, password: newPassword });
      setIsPasswordModalOpen(false);
      setNewPassword('');
      alert("Senha atualizada com sucesso!");
    }
  };

  const handleFullReset = async () => {
    const confirm1 = window.confirm("ATENÇÃO: Isso apagará TODOS os sócios cadastrados e o histórico da tesouraria. Deseja continuar?");
    if (confirm1) {
      const confirm2 = window.confirm("TEM CERTEZA? Esta ação não pode ser desfeita. Apenas o seu usuário atual será mantido.");
      if (confirm2) {
        setIsResetting(true);
        try {
          await databaseService.clearDatabase(currentUserId);
          alert("Sistema zerado com sucesso! Agora você pode começar os cadastros reais.");
        } catch (err) {
          alert("Erro ao limpar banco de dados.");
        } finally {
          setIsResetting(false);
        }
      }
    }
  };

  // FUNÇÃO PARA ALTERAR O CARGO (ADMIN <-> SOCIO)
  const toggleAdminRole = async (member: Member) => {
    // Segurança: Não permitir que o admin atual se rebaixe sozinho (pode ficar sem acesso)
    if (member.id === currentUserId) {
      alert("Você não pode remover seu próprio acesso de Administrador enquanto estiver logado.");
      return;
    }

    const isCurrentlyAdmin = member.role === UserRole.ADMIN;
    const actionText = isCurrentlyAdmin ? "REMOVER acesso de Administrador de" : "TORNAR Administrador o sócio";
    
    if (window.confirm(`Deseja realmente ${actionText} ${member.fullName}?`)) {
      try {
        const updatedMember: Member = {
          ...member,
          role: isCurrentlyAdmin ? UserRole.ACS : UserRole.ADMIN
        };
        await databaseService.saveMember(updatedMember);
        alert(`Cargo de ${member.fullName} atualizado com sucesso!`);
      } catch (err) {
        alert("Erro ao atualizar cargo no servidor.");
      }
    }
  };

  const openEdit = (member: Member) => {
    setEditingMember(member);
    setFormData({ ...member });
    setIsModalOpen(true);
  };

  const openPasswordReset = (member: Member) => {
    setEditingMember(member);
    setNewPassword('');
    setIsPasswordModalOpen(true);
  };

  const deleteMember = async (id: string, name: string) => {
    if (id === currentUserId) {
      alert("Não é possível excluir seu próprio usuário em uso.");
      return;
    }
    if (window.confirm(`Deseja excluir permanentemente o cadastro de ${name}?`)) {
      await databaseService.deleteMember(id);
    }
  };

  const myProfile = members.find(m => m.id === currentUserId);

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom duration-500 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-center md:text-left">
          <h2 className="text-3xl font-black text-emerald-900 uppercase tracking-tighter leading-none">Gestão de Sócios</h2>
          <p className="text-slate-500 font-bold mt-2 uppercase text-[10px] tracking-widest">Painel Administrativo ACS Mulungu</p>
        </div>
        
        <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full md:w-auto">
          <button onClick={() => setAdminView('members')} className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${adminView === 'members' ? 'bg-white shadow-sm text-emerald-700' : 'text-slate-400'}`}>Lista de Membros</button>
          <button onClick={() => setAdminView('settings')} className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${adminView === 'settings' ? 'bg-white shadow-sm text-emerald-700' : 'text-slate-400'}`}>Configurações</button>
        </div>
      </header>

      {adminView === 'members' ? (
        <>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center text-lg">👥</div>
                <div className="text-left">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Total na Base</p>
                   <p className="text-xl font-black text-emerald-900 leading-tight">{members.length} Cadastrados</p>
                </div>
             </div>
             <button 
              onClick={() => { setEditingMember(null); setFormData(initialForm); setIsModalOpen(true); }}
              className="w-full md:w-auto bg-emerald-900 text-white px-6 py-3 rounded-xl font-black shadow-lg hover:bg-black transition-all uppercase tracking-widest text-[10px]"
            >
              Adicionar Novo
            </button>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="px-6 py-4">Membro</th>
                    <th className="px-6 py-4 text-center">Nível (Clique p/ Mudar)</th>
                    <th className="px-6 py-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {members.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-20 text-center text-slate-400 font-bold uppercase text-xs italic">Nenhum registro encontrado no banco de dados.</td>
                    </tr>
                  ) : (
                    members.map(m => (
                      <tr key={m.id} className={`hover:bg-slate-50/50 transition-all ${m.id === currentUserId ? 'bg-emerald-50/30' : ''}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center border-2 border-white shadow-sm flex-shrink-0">
                              {m.profileImage ? <img src={m.profileImage} className="w-full h-full object-cover" /> : <span className="text-[10px] text-slate-300 font-black">ACS</span>}
                            </div>
                            <div className="text-left">
                              <p className="font-black text-slate-800 text-sm uppercase leading-tight">{m.fullName}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">CPF: {m.cpf} {m.id === currentUserId && ' (VOCÊ)'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                           <button 
                             onClick={() => toggleAdminRole(m)}
                             className={`px-4 py-1.5 rounded-lg text-[8px] font-black uppercase border-2 transition-all shadow-sm active:scale-95 ${
                               m.role === UserRole.ADMIN 
                                 ? 'bg-emerald-600 text-white border-emerald-700' 
                                 : 'bg-slate-50 text-slate-400 border-slate-200 hover:border-emerald-400 hover:text-emerald-600'
                             }`}
                           >
                             {m.role === UserRole.ADMIN ? '⭐ Administrador' : '👤 Sócio (ACS)'}
                           </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center items-center gap-2">
                            <button onClick={() => openPasswordReset(m)} className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-600 hover:text-white" title="Senha">🔑</button>
                            <button onClick={() => openEdit(m)} className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-emerald-600 hover:text-white">✏️</button>
                            <button onClick={() => deleteMember(m.id, m.fullName)} className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white">🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Ações do Sistema</h3>
              <div className="space-y-3">
                <button 
                  onClick={onResetIndicators}
                  className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg"
                >
                  Sincronizar Indicadores 360
                </button>
                {myProfile && (
                  <button 
                    onClick={() => openEdit(myProfile)}
                    className="w-full flex items-center justify-center gap-3 bg-emerald-900 text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg"
                  >
                    Editar Meus Dados
                  </button>
                )}
                
                <div className="pt-4 mt-4 border-t border-slate-100">
                  <p className="text-[9px] font-black text-rose-600 uppercase tracking-widest mb-3">Zona de Perigo</p>
                  <button 
                    onClick={handleFullReset}
                    disabled={isResetting}
                    className={`w-full flex items-center justify-center gap-3 bg-rose-50 text-rose-600 border-2 border-rose-100 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all hover:bg-rose-600 hover:text-white ${isResetting ? 'opacity-50 cursor-wait' : ''}`}
                  >
                    {isResetting ? 'Limpando...' : '🗑️ Zerar Base de Dados'}
                  </button>
                  <p className="text-[8px] text-slate-400 mt-2 font-medium italic">Remove todos os sócios e financeiro (Mantém seu acesso).</p>
                </div>
              </div>
           </div>
           <div className="bg-emerald-900 p-8 rounded-[2.5rem] text-white flex flex-col justify-center shadow-2xl relative overflow-hidden">
              <h3 className="text-xl font-black uppercase tracking-tighter mb-4 relative z-10">Servidor Ativo</h3>
              <p className="text-emerald-100 text-sm font-medium opacity-80 relative z-10">O banco de dados está sincronizado via Google Cloud (Firebase). Todas as alterações são aplicadas em tempo real.</p>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/5 rounded-full"></div>
           </div>
        </div>
      )}

      {/* MODAL DE EDIÇÃO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-2xl shadow-2xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-xl font-black text-emerald-900 uppercase">Ficha do Sócio</h3>
               <button onClick={() => setIsModalOpen(false)} className="text-slate-300 text-2xl">✕</button>
            </div>
            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
               <div className="md:col-span-2 flex flex-col items-center mb-2">
                  <div className="w-20 h-20 bg-slate-100 rounded-2xl border-2 border-emerald-100 overflow-hidden mb-1 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    {formData.profileImage ? <img src={formData.profileImage} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">👤</div>}
                  </div>
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                  <p className="text-[8px] font-black text-emerald-600 uppercase">Alterar Foto</p>
               </div>
               <div className="md:col-span-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                  <input required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value.toUpperCase()})} className="w-full p-3 bg-slate-50 border rounded-xl font-bold uppercase text-xs" />
               </div>
               <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">CPF</label>
                  <input required value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl font-bold text-xs" />
               </div>
               <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Unidade</label>
                  <input value={formData.workplace || ''} onChange={e => setFormData({...formData, workplace: e.target.value.toUpperCase()})} className="w-full p-3 bg-slate-50 border rounded-xl font-bold uppercase text-xs" />
               </div>
               <div className="md:col-span-2 flex gap-3 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 font-black text-slate-400 uppercase text-[10px]">Cancelar</button>
                  <button type="submit" className="flex-1 bg-emerald-900 text-white py-3 rounded-xl font-black uppercase text-[10px] shadow-lg">Salvar Dados</button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL SENHA */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[250] flex items-center justify-center p-4 text-center">
           <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-xs shadow-2xl">
              <h3 className="text-xl font-black text-slate-800 uppercase mb-4">Nova Senha</h3>
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                 <input 
                   required 
                   autoFocus
                   type="text"
                   value={newPassword}
                   onChange={e => setNewPassword(e.target.value)}
                   className="w-full p-4 bg-slate-50 border-2 rounded-xl font-black text-center text-2xl tracking-widest"
                 />
                 <button type="submit" className="w-full bg-amber-600 text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg">Redefinir</button>
                 <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="w-full text-slate-400 font-bold uppercase text-[9px]">Sair</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
