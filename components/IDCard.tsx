
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

  const verificationUrl = `${window.location.origin}${window.location.pathname}?verify=${member.id}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verificationUrl)}`;

  const handleExportPDF = () => {
    setIsPreparing(true);
    const frontEl = document.getElementById(`card-front-${member.id}`);
    const backEl = document.getElementById(`card-back-${member.id}`);

    if (!frontEl || !backEl) {
      alert("Erro ao capturar dados.");
      setIsPreparing(false);
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>CARTEIRA_ACS_${member.fullName.replace(/\s+/g, '_')}</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
            body { 
              font-family: 'Inter', sans-serif; 
              margin: 0; 
              padding: 0; 
              display: flex; 
              flex-direction: column; 
              align-items: center; 
              background: #f1f5f9; 
              min-height: 100vh;
            }
            .print-wrapper {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 10mm;
              padding: 20mm;
            }
            .card-print { 
              width: 85.6mm; 
              height: 53.98mm; 
              border-radius: 3mm; 
              border: 0.2mm solid #e2e8f0; 
              overflow: hidden;
              position: relative; 
              background: white;
              box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
              -webkit-print-color-adjust: exact; 
              print-color-adjust: exact;
            }
            @media print {
              body { background: white; padding: 0; margin: 0; }
              .no-print { display: none !important; }
              .print-wrapper { padding: 10mm; gap: 5mm; }
              .card-print { 
                box-shadow: none;
                border: 0.1mm solid #ccc;
                page-break-inside: avoid;
                margin-bottom: 5mm;
              }
              @page { size: auto; margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 1000; color: white;">
            <div style="background: white; padding: 40px; border-radius: 32px; color: #1e293b; max-width: 400px; text-align: center; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);">
              <div style="font-size: 48px; margin-bottom: 20px;">📄</div>
              <h3 style="margin: 0 0 12px 0; font-weight: 900; color: #064e3b; font-size: 20px; text-transform: uppercase; letter-spacing: -0.5px;">Pronto para Salvar</h3>
              <p style="margin: 0 0 24px 0; color: #64748b; font-size: 14px; line-height: 1.5;">Para garantir que os dois lados saiam na mesma folha, selecione o papel <b>A4</b> no destino da impressão.</p>
              <button style="background: #064e3b; color: white; width: 100%; padding: 18px; border-radius: 16px; font-weight: 900; text-transform: uppercase; border: none; cursor: pointer; font-size: 14px; letter-spacing: 1px;" onclick="window.print()">Imprimir / Salvar PDF</button>
              <button style="background: transparent; color: #94a3b8; width: 100%; padding: 12px; margin-top: 8px; font-weight: 700; text-transform: uppercase; border: none; cursor: pointer; font-size: 11px;" onclick="window.close()">Cancelar</button>
            </div>
          </div>
          <div class="print-wrapper">
            <div class="card-print">${frontEl.innerHTML}</div>
            <div class="card-print">${backEl.innerHTML}</div>
          </div>
        </body>
      </html>
    `;

    const printWin = window.open('', '_blank');
    if (printWin) {
      printWin.document.write(htmlContent);
      printWin.document.close();
      setTimeout(() => setIsPreparing(false), 1000);
    } else {
      alert("Bloqueador de pop-ups ativo.");
      setIsPreparing(false);
    }
  };

  const CardFront = ({ id, isPreview = true }: { id?: string, isPreview?: boolean }) => (
    <div id={id} className={`card-face card-front bg-[#f7fff9] w-[85.6mm] h-[53.98mm] rounded-[3mm] overflow-hidden relative border border-slate-300 flex flex-col mx-auto ${!isPreview ? 'shadow-none' : 'shadow-xl'}`} style={{backgroundImage: 'url("https://www.transparenttextures.com/patterns/marble-similar.png")'}}>
      <div className="bg-white border-b-[0.8mm] border-emerald-600 h-[12mm] flex items-center justify-between px-3 relative z-10">
        <div className="flex items-center gap-1.5">
           <Logo className="w-6 h-6" />
           <div className="leading-none text-left">
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

      <div className="flex-1 p-3 flex relative z-10">
        <div className="flex-1 space-y-1.5 text-left pr-[24mm]">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 rounded-full text-[4px] font-black uppercase ${member.status === 'Ativo' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-rose-100 text-rose-700 border border-rose-200'}`}>
               SÓCIO {member.status === 'Ativo' ? 'ATIVO' : 'INATIVO'}
            </span>
          </div>
          <div>
            <label className="text-[4.5px] text-emerald-900 font-black uppercase tracking-widest block opacity-70">Titular:</label>
            <p className="text-[8px] font-black text-slate-900 uppercase leading-none truncate">{member.fullName}</p>
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
          <div className="grid grid-cols-2 gap-1 pt-0.5">
             <div>
                <label className="text-[4.5px] text-emerald-900 font-black uppercase tracking-widest block opacity-70">Emissão:</label>
                <p className="text-[6.5px] font-black text-slate-600">{new Date().toLocaleDateString('pt-BR')}</p>
             </div>
             <div>
                <label className="text-[4.5px] text-emerald-900 font-black uppercase tracking-widest block opacity-70">Validade:</label>
                <p className="text-[6.5px] font-black text-slate-600">INDETERMINADA</p>
             </div>
          </div>
        </div>

        <div className="absolute right-3 bottom-3 w-[22mm] h-[28mm] bg-white p-[0.5mm] rounded-[2mm] shadow-lg border border-emerald-100 overflow-hidden">
          <div className="w-full h-full rounded-[1.5mm] overflow-hidden bg-slate-100 flex items-center justify-center bg-cover bg-center" 
               style={member.profileImage ? {backgroundImage: `url(${member.profileImage})`} : {}}>
            {!member.profileImage && <span className="text-[6px] font-black text-slate-300 uppercase">SEM FOTO</span>}
          </div>
        </div>
      </div>
      <div className="h-[1.5mm] bg-emerald-600 w-full relative z-10"></div>
    </div>
  );

  const CardBack = ({ id, isPreview = true }: { id?: string, isPreview?: boolean }) => (
    <div id={id} className={`card-face card-back bg-[#f7fff9] w-[85.6mm] h-[53.98mm] rounded-[3mm] overflow-hidden relative border border-slate-300 flex flex-col mx-auto ${!isPreview ? 'shadow-none' : 'shadow-xl'}`} style={{backgroundImage: 'url("https://www.transparenttextures.com/patterns/marble-similar.png")'}}>
      <div className="bg-emerald-900/5 h-full p-4 flex flex-col justify-between relative z-10">
        <div className="space-y-3 text-left">
           <div className="flex justify-between items-start">
             <h3 className="text-[9px] font-black text-emerald-900 uppercase border-b border-emerald-200 pb-1 flex-1 mr-4">Verificação Profissional</h3>
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
          <p className="text-[3.5px] font-black text-slate-400 uppercase tracking-tighter">Aponte a câmera para verificar autenticidade</p>
          <div className="w-32 h-[0.3pt] bg-slate-400"></div>
          <p className="text-[4px] font-black text-slate-400 uppercase tracking-tighter">Assinatura Digital Auditada AACSM</p>
        </div>
      </div>
      <div className="h-[1.5mm] bg-emerald-600 w-full relative z-10"></div>
    </div>
  );

  return (
    <div className="flex flex-col items-center w-full">
      <div className="screen-preview flex flex-col lg:flex-row gap-8 mb-10 no-print items-center">
        <div className="space-y-2 text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Frente</p>
          <CardFront id={`card-front-${member.id}`} />
        </div>
        <div className="space-y-2 text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verso</p>
          <CardBack id={`card-back-${member.id}`} />
        </div>
      </div>

      {!hidePrintButton && (
        <div className="flex flex-col md:flex-row gap-4 no-print w-full max-w-md">
          <button 
            onClick={handleExportPDF}
            disabled={isPreparing}
            className={`flex-1 bg-emerald-900 text-white px-8 py-5 rounded-2xl font-black uppercase text-[10px] shadow-xl flex items-center justify-center gap-3 hover:scale-105 transition-all ${isPreparing ? 'opacity-70 cursor-wait' : ''}`}
          >
            {isPreparing ? '⏳ Preparando...' : '📄 Compartilhar via PDF'}
          </button>
        </div>
      )}
    </div>
  );
};

export default IDCard;