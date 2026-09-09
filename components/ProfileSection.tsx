
import React, { useState, useEffect } from 'react';
import { Member } from '../types';
import IDCard from './IDCard';
import SignaturePadModal from './SignaturePadModal';
import { databaseService } from '../services/databaseService';

interface ProfileSectionProps {
  member?: Member;
  isGuest: boolean;
  onOpenLogin: () => void;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ member, isGuest, onOpenLogin }) => {
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [currentMember, setCurrentMember] = useState<Member | undefined>(member);

  useEffect(() => {
    setCurrentMember(member);
  }, [member]);

  const handleSaveSignature = async (sig: string | null) => {
    if (!currentMember) return;
    const updated: Member = {
      ...currentMember,
      signatureImage: sig || undefined,
      signatureType: (sig ? 'drawn' : 'auto') as 'drawn' | 'auto'
    };
    setCurrentMember(updated);
    try {
      await databaseService.saveMember(updated);
    } catch (e) {
      console.error("Erro ao salvar assinatura:", e);
    }
  };

  // Função auxiliar para formatar data sem erro de fuso horário
  const formatBirthDate = (dateStr: string) => {
    if (!dateStr) return '---';
    if (dateStr.includes('-')) {
      const [year, month, day] = dateStr.split('-');
      return `${day}/${month}/${year}`;
    }
    return dateStr;
  };

  if (isGuest) {
    return (
      <div className="bg-white rounded-[3rem] p-16 text-center shadow-sm border border-slate-100 animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center text-5xl mx-auto mb-8">🪪</div>
        <h2 className="text-3xl font-black text-slate-800 mb-4">Acesso à Carteirinha</h2>
        <p className="text-slate-500 max-w-md mx-auto mb-10 text-lg leading-relaxed">
          Para visualizar sua carteirinha digital e dados profissionais, você precisa estar cadastrado.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={onOpenLogin}
            className="bg-emerald-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl hover:bg-emerald-700 transition-all"
          >
            ENTRAR NO PORTAL
          </button>
          <button 
            onClick={() => (window as any).openRegister?.()}
            className="bg-white text-emerald-600 border-2 border-emerald-600 px-10 py-4 rounded-2xl font-black shadow-lg hover:bg-emerald-50 transition-all"
          >
            SOLICITAR INSCRIÇÃO
          </button>
        </div>
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
                <p className="font-bold text-slate-800">{formatBirthDate(member.birthDate)}</p>
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

          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => setShowPrintModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-3 transition-all hover:scale-105"
            >
              📄 Gerar PDF / Imprimir Carteirinha
            </button>
            <button 
              onClick={() => setIsSignatureModalOpen(true)}
              className="bg-white hover:bg-slate-50 text-emerald-950 border-2 border-emerald-300 px-6 py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-md flex items-center justify-center gap-2 transition-all"
            >
              {currentMember?.signatureImage ? '✍️ Alterar Assinatura' : '✍️ Personalizar Assinatura'}
            </button>
          </div>
        </div>

        <div className="w-full md:w-auto flex flex-col items-center">
          <div 
            onClick={() => setShowPrintModal(true)}
            className="p-4 bg-white rounded-[3rem] shadow-xl border border-slate-100 cursor-pointer hover:shadow-2xl transition-all hover:scale-[1.02] group relative"
            title="Clique para abrir e gerar o PDF oficial de impressão"
          >
            <div className="absolute top-2 right-6 bg-emerald-700 text-white text-[9px] font-black uppercase px-3 py-1 rounded-full shadow-md z-20 group-hover:bg-emerald-600 transition-colors">
              🔍 Clique para Imprimir / PDF
            </div>
            <div className="scale-90 md:scale-100">
              <IDCard member={currentMember || member} hidePrintButton={true} />
            </div>
          </div>
        </div>
      </div>

      {showPrintModal && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-[200] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[3rem] p-6 md:p-10 max-w-4xl w-full text-center relative shadow-2xl my-8">
            <button 
              onClick={() => setShowPrintModal(false)} 
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center text-lg transition-colors"
              aria-label="Fechar"
            >
              ✕
            </button>
            <div className="mb-6">
              <h3 className="text-2xl font-black text-emerald-900 uppercase tracking-tight">Carteira de Identificação do Associado</h3>
              <p className="text-slate-500 text-xs font-medium mt-1">Gere o arquivo PDF oficial com marcas de corte para plastificação ou imprima diretamente</p>
            </div>
            <div className="flex justify-center mb-8">
              <IDCard member={currentMember || member} />
            </div>
            <div className="flex justify-center gap-4 items-center">
              <button
                onClick={() => setIsSignatureModalOpen(true)}
                className="text-emerald-700 hover:text-emerald-900 font-black text-[11px] uppercase tracking-wider py-2 px-4 border border-emerald-200 rounded-xl"
              >
                ✍️ Ajustar Assinatura Digital do Sócio
              </button>
              <button 
                onClick={() => setShowPrintModal(false)} 
                className="text-slate-400 hover:text-slate-600 font-black text-[11px] uppercase tracking-widest transition-colors py-2 px-6"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {currentMember && (
        <SignaturePadModal
          isOpen={isSignatureModalOpen}
          onClose={() => setIsSignatureModalOpen(false)}
          memberName={currentMember.fullName}
          currentSignature={currentMember.signatureImage}
          onSave={handleSaveSignature}
        />
      )}
    </div>
  );
};

export default ProfileSection;
