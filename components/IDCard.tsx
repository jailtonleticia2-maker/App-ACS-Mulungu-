
import React, { useState } from 'react';
import { Member } from '../types';
import Logo from './Logo';

interface IDCardProps {
  member: Member;
  hidePrintButton?: boolean;
}

const IDCard: React.FC<IDCardProps> = ({ member, hidePrintButton = false }) => {
  const [isPreparing, setIsPreparing] = useState(false);

  const formatBirthDate = (dateStr: string) => {
    if (!dateStr) return '--/--/----';
    if (dateStr.includes('-')) {
      const [year, month, day] = dateStr.split('-');
      return `${day}/${month}/${year}`;
    }
    return dateStr;
  };

  // URL de Verificação Pública
  const verificationUrl = `${window.location.origin}${window.location.pathname}?verify=${member.id}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verificationUrl)}`;

  const handlePrint = () => {
    setIsPreparing(true);
    const frontEl = document.getElementById(`card-front-${member.id}`);
    const backEl = document.getElementById(`card-back-${member.id}`);

    if (!frontEl || !backEl) {
      alert("Erro ao preparar documento.");
      setIsPreparing(false);
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Carteira ACS - ${member.fullName}</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700;900&display=swap');
            body { 
              font-family: 'Roboto', sans-serif; 
              margin: 0; 
              padding: 20px; 
              display: flex; 
              flex-direction: column; 
              align-items: center; 
              background: white; 
            }
            .card-print { 
              width: 85.6mm; height: 53.98mm; 
              border-radius: 4mm; border: 0.2mm solid #ddd; 
              overflow: hidden; margin-bottom: 20px;
              position: relative; background: white;
              -webkit-print-color-adjust: exact; print-color-adjust: exact;
            }
            @media print {
              body { padding: 0; margin: 0; }
              .no-print { display: none !important; }
              .card-print { 
                margin-bottom: 0; border: none; box-shadow: none;
                page-break-after: always;
              }
              @page { size: 85.6mm 53.98mm; margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="print-controls no-print" style="margin-bottom: 30px; text-align: center;">
            <button style="background: #064e3b; color: white; padding: 12px 24px; border-radius: 12px; font-weight: 900; text-transform: uppercase; border: none; cursor: pointer;" onclick="window.print()">Confirmar e Gerar PDF</button>
          </div>
          <div class="card-print">${frontEl.innerHTML}</div>
          <div class="card-print">${backEl.innerHTML}</div>
        </body>
      </html>
    `;

    const printWin = window.open('', '_blank');
    if (printWin) {
      printWin.document.write(htmlContent);
      printWin.document.close();
      setTimeout(() => setIsPreparing(false), 1000);
    } else {
      alert("O bloqueador de pop-ups impediu a abertura.");
      setIsPreparing(false);
    }
  };

  const CardFront = ({ id, isPreview = true }: { id?: string, isPreview?: boolean }) => (
    <div id={id} className={`card-face card-front bg-[#f7fff9] w-[85.6mm] h-[53.98mm] rounded-[4mm] overflow-hidden relative border border-slate-300 flex flex-col mx-auto ${!isPreview ? 'shadow-none' : 'shadow-xl'}`} style={{backgroundImage: 'url("https://www.transparenttextures.com/patterns/marble-similar.png")'}}>
      <div className="bg-white border-b-[0.8mm] border-emerald-600 h-[12mm] flex items-center justify-between px-3 relative z-10">
        <div className="flex items-center gap-1.5">
           <Logo className="w-6 h-6" />
           <div className="leading-none">
             <h1 className="text-[7.5px] font-black text-emerald-900 uppercase tracking-tighter">AACSM</h1>
             <p className="text-[3.5px] text-slate-500 font-bold uppercase">Assoc. Agentes Comunitários de Saúde</p>
           </div>
        </div>
        <div className="text-right flex items-center gap-2">
           <div className="h-6 w-[0.2mm] bg-slate-200"></div>
           <div className="leading-none">
             <h2 className="text-[7px] font-black text-emerald-800 uppercase italic">ACS MULUNGU DO MORRO</h2>
             <p className="text-[4px] text-emerald-600 font-black uppercase">Bahia - Brasil</p>
           </div>
        </div>
      </div>

      <div className="flex-1 p-3 flex relative">
        <div className="flex-1 space-y-2 text-left pr-[24mm]">
          <div>
            <label className="text-[4.5px] text-emerald-900 font-black uppercase tracking-widest block opacity-70">Titular:</label>
            <p className="text-[8px] font-black text-slate-900 uppercase leading-none">{member.fullName}</p>
          </div>

          <div className="grid grid-cols-2 gap-1">
            <div>
              <label className="text-[4.5px] text-emerald-900 font-black uppercase tracking-widest block opacity-70">Data Nasc.:</label>
              <p className="text-[7.5px] font-black text-slate-800">{formatBirthDate(member.birthDate)}</p>
            </div>
            <div>
              <label className="text-[4.5px] text-emerald-900 font-black uppercase tracking-widest block opacity-70">CPF:</label>
              <p className="text-[7.5px] font-black text-slate-800">{member.cpf}</p>
            </div>
          </div>

          <div>
            <label className="text-[4.5px] text-emerald-900 font-black uppercase tracking-widest block opacity-70">Cargo:</label>
            <p className="text-[7.5px] font-black text-emerald-800 uppercase">Agente Comunitário de Saúde</p>
          </div>

          <div className="grid grid-cols-2 gap-1 pt-1">
             <div>
                <label className="text-[4.5px] text-emerald-900 font-black uppercase tracking-widest block opacity-70">Emissão:</label>
                <p className="text-[6.5px] font-black text-slate-600">{new Date().toLocaleDateString('pt-BR')}</p>
             </div>
             <div>
                <label className="text-[4.5px] text-emerald-900 font-black uppercase tracking-widest block opacity-70">Validade:</label>
                <p className="text-[6.5px] font-black text-slate-600">INDETERMINADA</p>
             </div>
          </div>
          
          <div className="pt-2">
             <label className="text-[4.5px] text-emerald-900 font-black uppercase tracking-widest block opacity-70">CNPJ Associação:</label>
             <p className="text-[6px] font-black text-slate-500">14.502.836/0001-38</p>
          </div>
        </div>

        <div className="absolute right-3 bottom-3 w-[22mm] h-[28mm] bg-white p-[0.5mm] rounded-[2mm] shadow-lg border border-emerald-100 overflow-hidden">
          <div className="w-full h-full rounded-[1.5mm] overflow-hidden bg-slate-100 flex items-center justify-center bg-cover bg-center" 
               style={member.profileImage ? {backgroundImage: `url(${member.profileImage})`} : {}}>
            {!member.profileImage && <span className="text-[6px] font-black text-slate-300 uppercase">SEM FOTO</span>}
          </div>
        </div>
      </div>

      <div className="h-[1.5mm] bg-emerald-600 w-full"></div>
    </div>
  );

  const CardBack = ({ id, isPreview = true }: { id?: string, isPreview?: boolean }) => (
    <div id={id} className={`card-face card-back bg-[#f7fff9] w-[85.6mm] h-[53.98mm] rounded-[4mm] overflow-hidden relative border border-slate-300 flex flex-col mx-auto ${!isPreview ? 'shadow-none' : 'shadow-xl'}`} style={{backgroundImage: 'url("https://www.transparenttextures.com/patterns/marble-similar.png")'}}>
      <div className="bg-emerald-900/5 h-full p-4 flex flex-col justify-between relative">
        <div className="space-y-3 text-left">
           <div className="flex justify-between items-start">
             <h3 className="text-[9px] font-black text-emerald-900 uppercase border-b border-emerald-200 pb-1 flex-1 mr-4">Informações Profissionais</h3>
             {/* QR Code de Verificação */}
             <div className="bg-white p-1 rounded-lg border border-emerald-100 shadow-sm shrink-0">
               <img src={qrCodeUrl} className="w-[12mm] h-[12mm]" alt="Verificação" />
             </div>
           </div>
           
           <div className="space-y-2">
             <div>
               <label className="text-[4.5px] text-slate-400 font-black uppercase tracking-widest block">Unidade de Saúde / PSF</label>
               <p className="text-[8px] font-black text-slate-800 uppercase">{member.workplace || 'SECRETARIA DE SAÚDE'}</p>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="text-[4.5px] text-slate-400 font-black uppercase tracking-widest block">Equipe / Microárea</label>
                 <p className="text-[7.5px] font-black text-emerald-800 uppercase">{member.team || '---'} / {member.microArea || '---'}</p>
               </div>
               <div>
                 <label className="text-[4.5px] text-slate-400 font-black uppercase tracking-widest block">Zona de Atuação</label>
                 <p className="text-[7.5px] font-black text-slate-800 uppercase">{member.areaType || 'URBANA'}</p>
               </div>
             </div>
           </div>
        </div>

        <div className="mt-auto flex flex-col items-center gap-1">
          <p className="text-[3.5px] font-black text-slate-400 uppercase tracking-tighter mb-1">Aponte a câmera para verificar autenticidade</p>
          <div className="w-32 h-[0.3pt] bg-slate-400"></div>
          <p className="text-[4px] font-black text-slate-400 uppercase tracking-tighter">Assinatura Digital de Identificação AACSM</p>
        </div>

        <Logo className="absolute inset-0 m-auto w-32 h-32 opacity-[0.03] rotate-12 pointer-events-none" />
      </div>
      <div className="h-[1.5mm] bg-emerald-600 w-full"></div>
    </div>
  );

  return (
    <div className="flex flex-col items-center w-full">
      <div className="screen-preview flex flex-col lg:flex-row gap-8 mb-10 no-print items-center">
        <div className="space-y-2 text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Frente Profissional</p>
          <CardFront id={`card-front-${member.id}`} />
        </div>
        <div className="space-y-2 text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verso com Verificação</p>
          <CardBack id={`card-back-${member.id}`} />
        </div>
      </div>

      {!hidePrintButton && (
        <button 
          onClick={handlePrint}
          disabled={isPreparing}
          className={`bg-emerald-900 text-white px-10 py-5 rounded-2xl font-black uppercase text-[10px] shadow-xl flex items-center gap-3 no-print hover:scale-105 active:scale-95 transition-all ${isPreparing ? 'opacity-70 cursor-wait' : ''}`}
        >
          {isPreparing ? '⏳ Preparando...' : '🖨️ Imprimir Carteira Profissional'}
        </button>
      )}
    </div>
  );
};

export default IDCard;