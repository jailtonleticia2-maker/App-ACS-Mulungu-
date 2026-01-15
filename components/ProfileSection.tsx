
import React, { useState } from 'react';
import { Member } from '../types';
import IDCard from './IDCard';

interface ProfileSectionProps {
  member?: Member;
  isGuest: boolean;
  onOpenLogin: () => void;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ member, isGuest, onOpenLogin }) => {
  const [showPrintModal, setShowPrintModal] = useState(false);

  if (isGuest) {
    return (
      <div className="bg-white rounded-[3rem] p-16 text-center shadow-sm border border-slate-100 animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center text-5xl mx-auto mb-8">🪪</div>
        <h2 className="text-3xl font-black text-slate-800 mb-4">Acesso à Carteirinha</h2>
        <p className="text-slate-500 max-w-md mx-auto mb-10 text-lg leading-relaxed">
          Para visualizar sua carteirinha digital e dados profissionais, você precisa estar cadastrado.
        </p>
        <button 
          onClick={onOpenLogin}
          className="bg-emerald-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl"
        >
          ENTRAR NO PORTAL
        </button>
      </div>
    );
  }

  if (!member) return <div className="p-20 text-center text-slate-400 font-black uppercase">Membro não localizado...</div>;

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start gap-8">
        <div className="flex-1 space-y-8">
          <div>
            <h2 className="text-4xl font-black text-emerald-900 tracking-tight mb-2 uppercase">Meus Dados</h2>
            <p className="text-slate-500 font-medium italic uppercase text-sm">Informações Oficiais de Afiliado</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
              <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest border-b border-emerald-50 pb-2">Dados Pessoais</h4>
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nome Completo</label>
                <p className="font-bold text-slate-800 text-lg uppercase">{member.fullName}</p>
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nascimento</label>
                <p className="font-bold text-slate-800">{member.birthDate ? new Date(member.birthDate).toLocaleDateString('pt-BR') : '---'}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
              <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest border-b border-emerald-50 pb-2">Lotação Profissional</h4>
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Local (PSF/UBS)</label>
                <p className="font-bold text-slate-800 uppercase">{member.workplace || 'Não informado'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Equipe</label>
                  <p className="font-black text-emerald-800 uppercase text-xs">{member.team || '---'}</p>
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Área</label>
                  <p className="font-black text-emerald-800 uppercase text-xs">{member.microArea || '---'}</p>
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setShowPrintModal(true)}
            className="w-full md:w-auto bg-emerald-600 text-white px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-3"
          >
            📄 Acessar Carteira Digital
          </button>
        </div>

        <div className="w-full md:w-auto flex flex-col items-center">
          <div className="p-4 bg-white rounded-[3rem] shadow-xl border border-slate-50 scale-90 md:scale-100">
            <IDCard member={member} hidePrintButton={true} />
          </div>
        </div>
      </div>

      {showPrintModal && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-[200] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[3rem] p-8 md:p-12 max-w-2xl w-full text-center relative shadow-2xl my-8">
            <button onClick={() => setShowPrintModal(false)} className="absolute top-6 right-6 text-2xl text-slate-300">✕</button>
            <h3 className="text-2xl font-black text-emerald-900 uppercase mb-8">Carteirinha Digital</h3>
            <div className="flex justify-center mb-10">
              <IDCard member={member} />
            </div>
            <button onClick={() => setShowPrintModal(false)} className="text-emerald-600 font-black text-[10px] uppercase tracking-widest">Voltar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSection;
