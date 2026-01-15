
import React, { useState } from 'react';
import { Member } from '../types';
import Logo from './Logo';

interface IDCardProps {
  member: Member;
  hidePrintButton?: boolean;
}

const IDCard: React.FC<IDCardProps> = ({ member, hidePrintButton = false }) => {
  const [isPreparing, setIsPreparing] = useState(false);

  const handlePrint = () => {
    setIsPreparing(true);
    
    const frontEl = document.getElementById(`card-front-${member.id}`);
    const backEl = document.getElementById(`card-back-${member.id}`);

    if (!frontEl || !backEl) {
      alert("Erro ao preparar documento.");
      setIsPreparing(false);
      return;
    }

    // Criamos o HTML que será enviado para a nova janela
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Carteira ACS - ${member.fullName}</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
            body { 
              font-family: 'Inter', sans-serif; 
              margin: 0; 
              padding: 20px; 
              display: flex; 
              flex-direction: column; 
              align-items: center; 
              background: white; 
            }
            .card-print { 
              width: 85.6mm; height: 53.98mm; 
              border-radius: 3mm; border: 0.1mm solid #ccc; 
              overflow: hidden; margin-bottom: 20px;
              position: relative; background: white;
              box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
              -webkit-print-color-adjust: exact; print-color-adjust: exact;
            }
            .print-controls {
              margin-bottom: 30px;
              text-align: center;
            }
            .btn-primary {
              background: #064e3b; color: white; padding: 12px 24px;
              border-radius: 12px; font-weight: 900; text-transform: uppercase;
              border: none; cursor: pointer; font-size: 14px;
            }
            @media print {
              body { padding: 0; margin: 0; }
              .no-print { display: none !important; }
              .card-print { 
                margin-bottom: 0; 
                border: none; 
                box-shadow: none;
                page-break-after: always;
              }
              @page { size: 85.6mm 53.98mm; margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="print-controls no-print">
            <button class="btn-primary" onclick="window.print()">Confirmar e Gerar PDF</button>
            <p style="font-size: 10px; color: #666; margin-top: 10px; font-weight: bold;">
              DICA: No Android, selecione "Salvar como PDF" no menu de impressoras.
            </p>
          </div>
          <div class="card-print">${frontEl.innerHTML}</div>
          <div class="card-print">${backEl.innerHTML}</div>
          <script>
            // Tenta acionar a impressão automaticamente após o carregamento dos estilos
            window.onload = () => {
              setTimeout(() => {
                window.print();
              }, 800);
            };
          </script>
        </body>
      </html>
    `;

    // Abrimos uma nova janela vazia
    const printWin = window.open('', '_blank');
    
    if (printWin) {
      printWin.document.write(htmlContent);
      printWin.document.close();
      
      // No Android, o window.print() disparado pelo script interno costuma funcionar melhor.
      // Resetamos o estado local
      setTimeout(() => {
        setIsPreparing(false);
      }, 1000);
    } else {
      alert("O bloqueador de pop-ups impediu a abertura da carteirinha. Por favor, permita pop-ups para este site.");
      setIsPreparing(false);
    }
  };

  const CardFront = ({ id, isPreview = true }: { id?: string, isPreview?: boolean }) => (
    <div id={id} className={`card-face card-front bg-white w-[85.6mm] h-[53.98mm] rounded-[3mm] overflow-hidden relative border border-slate-300 flex flex-col shadow-lg mx-auto ${!isPreview ? 'shadow-none' : ''}`}>
      <div className="bg-emerald-900 px-3 py-1.5 flex items-center gap-2">
        <Logo className="w-6 h-6" />
        <div className="leading-none text-left">
          <h1 className="text-[7px] font-black text-white uppercase leading-none">Associação ACS Mulungu do Morro</h1>
          <p className="text-[4.5px] text-emerald-200 font-bold opacity-90 mt-0.5">CNPJ: 03.379.704/0001-05</p>
          <p className="text-[5px] text-emerald-300 font-black uppercase tracking-widest mt-0.5">Identidade Profissional</p>
        </div>
      </div>
      <div className="flex-1 p-3 flex gap-4 text-left">
        <div className="w-[22mm] h-[28mm] bg-slate-100 rounded-lg border-[1.5px] border-emerald-900 overflow-hidden flex items-center justify-center bg-cover bg-center" 
             style={member.profileImage ? {backgroundImage: `url(${member.profileImage})`} : {}}>
          {!member.profileImage && <span className="text-[10px] font-black text-slate-300 uppercase">Sem Foto</span>}
        </div>
        <div className="flex-1 space-y-1 py-0.5">
          <div>
            <label className="text-[4px] text-slate-400 font-black uppercase tracking-widest block">Nome Completo</label>
            <p className="text-[8.5px] font-black text-slate-900 uppercase leading-tight line-clamp-2">{member.fullName}</p>
          </div>
          <div className="grid grid-cols-2 gap-1 mt-1">
            <div>
              <label className="text-[4px] text-slate-400 font-black uppercase tracking-widest block">CPF</label>
              <p className="text-[7px] font-bold text-slate-700">{member.cpf}</p>
            </div>
            <div>
              <label className="text-[4px] text-slate-400 font-black uppercase tracking-widest block">Nascimento</label>
              <p className="text-[7px] font-bold text-slate-700">{member.birthDate ? new Date(member.birthDate).toLocaleDateString('pt-BR') : '--/--/----'}</p>
            </div>
          </div>
          <div className="pt-1 border-t border-slate-100 mt-1">
            <p className="text-[7px] font-black text-emerald-800 uppercase leading-none">Agente Comunitário de Saúde</p>
          </div>
        </div>
      </div>
      <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-100 flex justify-between items-center mt-auto">
        <span className="text-[6px] font-black text-emerald-700 uppercase">Sócio Ativo</span>
        <span className="text-[5px] text-slate-400 font-bold uppercase tracking-widest">Mulungu do Morro - BA</span>
      </div>
    </div>
  );

  const CardBack = ({ id, isPreview = true }: { id?: string, isPreview?: boolean }) => (
    <div id={id} className={`card-face card-back bg-white w-[85.6mm] h-[53.98mm] rounded-[3mm] overflow-hidden relative border border-slate-300 flex flex-col shadow-lg mx-auto ${!isPreview ? 'shadow-none' : ''}`}>
      <div className="p-4 flex flex-col h-full relative z-10 text-left">
        <div className="space-y-3">
          <div>
            <label className="text-[4.5px] text-slate-400 font-black uppercase tracking-widest block mb-0.5">Lotação / Unidade</label>
            <p className="text-[7.5px] font-bold text-slate-800 uppercase leading-tight">{member.workplace || 'SECRETARIA MUNICIPAL'}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[4.5px] text-slate-400 font-black uppercase tracking-widest block">Microárea / Equipe</label>
              <p className="text-[7.5px] font-black text-emerald-800 uppercase mt-0.5">{member.microArea || '---'} / {member.team || '---'}</p>
            </div>
            <div>
              <label className="text-[4.5px] text-slate-400 font-black uppercase tracking-widest block">Zona</label>
              <p className="text-[7px] font-black text-emerald-700 uppercase mt-0.5">{member.areaType || 'URBANA'}</p>
            </div>
          </div>
        </div>
        <div className="mt-auto flex flex-col items-center">
             <div className="w-32 h-[0.4pt] bg-slate-300 mb-1"></div>
             <p className="text-[4px] text-slate-400 font-black uppercase tracking-tighter">Assinatura Digital - AACSM</p>
        </div>
      </div>
      <Logo className="absolute inset-0 m-auto w-32 h-32 opacity-[0.03] rotate-12 pointer-events-none" />
    </div>
  );

  return (
    <div className="flex flex-col items-center w-full">
      <div className="screen-preview flex flex-col lg:flex-row gap-8 mb-10 no-print items-center">
        <div className="space-y-2 text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Visualização: Frente</p>
          <CardFront id={`card-front-${member.id}`} />
        </div>
        <div className="space-y-2 text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Visualização: Verso</p>
          <CardBack id={`card-back-${member.id}`} />
        </div>
      </div>

      {!hidePrintButton && (
        <button 
          onClick={handlePrint}
          disabled={isPreparing}
          className={`bg-emerald-900 text-white px-8 py-4 rounded-xl font-black uppercase text-[10px] shadow-xl flex items-center gap-3 no-print hover:bg-black transition-all ${isPreparing ? 'opacity-70 cursor-wait' : ''}`}
        >
          {isPreparing ? '⏳ Gerando Documento...' : '🖨️ Imprimir / Gerar PDF'}
        </button>
      )}
    </div>
  );
};

export default IDCard;
