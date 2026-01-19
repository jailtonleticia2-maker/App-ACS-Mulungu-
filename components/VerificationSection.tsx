
import React from 'react';
import { Member } from '../types';
import Logo from './Logo';

interface VerificationSectionProps {
  member: Member;
  onClose: () => void;
}

const VerificationSection: React.FC<VerificationSectionProps> = ({ member, onClose }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="max-w-md w-full bg-white rounded-[3.5rem] shadow-2xl border border-slate-100 overflow-hidden relative">
        {/* Banner de Status */}
        <div className="bg-emerald-600 p-8 text-center text-white relative">
          <div className="absolute top-4 left-4">
             <Logo className="w-8 h-8 opacity-40" />
          </div>
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-5xl mx-auto mb-4 backdrop-blur-md border border-white/30 shadow-lg">
             ✅
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tighter">Vínculo Confirmado</h2>
          <p className="text-emerald-100 text-[10px] font-black uppercase tracking-widest mt-1 opacity-80">Portal de Autenticidade AACSM</p>
        </div>

        <div className="p-10 space-y-8">
          <div className="flex flex-col items-center">
             <div className="w-32 h-32 rounded-[2.5rem] bg-slate-100 border-4 border-emerald-50 shadow-md overflow-hidden mb-4">
                {member.profileImage ? (
                  <img src={member.profileImage} alt={member.fullName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl bg-emerald-50 text-emerald-200 font-black">ACS</div>
                )}
             </div>
             <h3 className="text-xl font-black text-slate-800 uppercase leading-tight text-center">{member.fullName}</h3>
             <p className="text-emerald-600 font-black uppercase tracking-widest text-[9px] bg-emerald-50 px-3 py-1 rounded-full mt-2">Agente Comunitário de Saúde</p>
          </div>

          <div className="space-y-4">
             <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Unidade de Lotação</label>
                <p className="text-sm font-black text-slate-700 uppercase">{member.workplace || '--'}</p>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Equipe</label>
                  <p className="text-sm font-black text-emerald-700 uppercase">{member.team || '--'}</p>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Microárea</label>
                  <p className="text-sm font-black text-emerald-700 uppercase">{member.microArea || '--'}</p>
                </div>
             </div>
          </div>

          <div className="pt-6 border-t border-slate-50 text-center">
             <p className="text-[10px] font-bold text-slate-400 leading-relaxed">
               Este profissional é um associado devidamente registrado na <br/>
               <span className="text-emerald-800 font-black uppercase">Associação de Agentes Comunitários de Saúde de Mulungu do Morro.</span>
             </p>
          </div>

          <button 
            onClick={onClose}
            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-emerald-900 transition-all"
          >
            Ir para o Portal Inicial
          </button>
        </div>
        
        {/* Selo Decorativo */}
        <div className="absolute -bottom-8 -right-8 w-32 h-32 opacity-5 pointer-events-none">
           <Logo />
        </div>
      </div>
    </div>
  );
};

export default VerificationSection;