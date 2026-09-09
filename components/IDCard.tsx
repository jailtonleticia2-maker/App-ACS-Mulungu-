import React, { useState, useEffect, useRef } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Member } from '../types';
import Logo from './Logo';
import { databaseService } from '../services/databaseService';
import { ExecutiveSignature, MemberSignature } from './DigitalSignatures';

interface IDCardProps {
  member: Member;
  hidePrintButton?: boolean;
}

const IDCard: React.FC<IDCardProps> = ({ member, hidePrintButton = false }) => {
  const [isPreparing, setIsPreparing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  
  // ID de 3 dígitos do associado atribuído automaticamente sem repetição
  const [membershipNumber, setMembershipNumber] = useState<string>(() => {
    if (member.membershipNumber) {
      const clean = member.membershipNumber.replace(/\D/g, '');
      if (clean) return clean.padStart(3, '0');
    }
    return '';
  });

  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchOrAssignNumber = async () => {
      if (membershipNumber) return;
      try {
        const num = await databaseService.getOrAssignMembershipNumber(member.id);
        if (isMounted && num) {
          setMembershipNumber(num);
        }
      } catch (e) {
        console.error("Erro ao obter número de 3 dígitos:", e);
      }
    };
    fetchOrAssignNumber();
    return () => { isMounted = false; };
  }, [member.id, membershipNumber]);

  const displayId = membershipNumber || (member.membershipNumber ? member.membershipNumber.replace(/\D/g, '').padStart(3, '0') : '001');

  const formatBirthDate = (dateStr?: string) => {
    if (!dateStr) return '--/--/----';
    if (dateStr.includes('-')) {
      const [year, month, day] = dateStr.split('-');
      return `${day}/${month}/${year}`;
    }
    return dateStr;
  };

  const formatCPF = (cpf?: string) => {
    if (!cpf) return '---.---.--- --';
    const clean = cpf.replace(/\D/g, '');
    if (clean.length === 11) {
      return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9, 11)}`;
    }
    return cpf;
  };

  const verificationUrl = `${window.location.origin}${window.location.pathname}?verify=${member.id}`;

  // Gerar QR code em alta resolução convertido para Data URL sem depender de pacotes externos
  useEffect(() => {
    let isMounted = true;
    const fetchQrDataUrl = async () => {
      try {
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&color=064e3b&bgcolor=ffffff&data=${encodeURIComponent(verificationUrl)}`;
        const response = await fetch(qrUrl);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          if (isMounted && typeof reader.result === 'string') {
            setQrCodeDataUrl(reader.result);
          }
        };
        reader.readAsDataURL(blob);
      } catch (err) {
        console.warn("Aviso ao converter QR code para data URL:", err);
        if (isMounted) {
          setQrCodeDataUrl(`https://api.qrserver.com/v1/create-qr-code/?size=600x600&color=064e3b&bgcolor=ffffff&data=${encodeURIComponent(verificationUrl)}`);
        }
      }
    };

    fetchQrDataUrl();

    return () => {
      isMounted = false;
    };
  }, [verificationUrl]);

  const handleExportPDF = async () => {
    if (!frontRef.current || !backRef.current) {
      alert("Erro ao capturar as faces da carteirinha. Atualize a página e tente novamente.");
      return;
    }

    setIsPreparing(true);
    setStatusMessage("Preparando documento em alta definição...");

    try {
      // Pequena pausa para garantir renderização perfeita de fontes e imagens
      await new Promise(r => setTimeout(r, 150));

      const captureOptions = {
        scale: 4, // Gera ~1400x880px por face (equivalente a 400+ DPI de impressão profissional)
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        imageTimeout: 0,
      };

      setStatusMessage("Renderizando frente em 400+ DPI...");
      const frontCanvas = await html2canvas(frontRef.current, captureOptions);

      setStatusMessage("Renderizando verso em 400+ DPI...");
      const backCanvas = await html2canvas(backRef.current, captureOptions);

      setStatusMessage("Montando folha A4 com marcas de corte e dobra...");
      const frontImgData = frontCanvas.toDataURL('image/png');
      const backImgData = backCanvas.toDataURL('image/png');

      // Criação do documento A4 (210 mm x 297 mm)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = 210;

      // Topo institucional em tom verde esmeralda com acabamento elegante
      pdf.setFillColor(6, 95, 70); // #065f46
      pdf.rect(0, 0, pageWidth, 28, 'F');

      // Filete dourado decorativo
      pdf.setFillColor(217, 119, 6); // #d97706
      pdf.rect(0, 28, pageWidth, 1.2, 'F');

      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12.5);
      pdf.text('ASSOCIAÇÃO DOS AGENTES COMUNITÁRIOS DE SAÚDE', pageWidth / 2, 10.5, { align: 'center' });
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text('MULUNGU DO MORRO - BAHIA | FUNDADA PARA DEFESA DA CATEGORIA', pageWidth / 2, 16.5, { align: 'center' });
      pdf.setFontSize(7.5);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(253, 230, 138); // Dourado suave
      pdf.text('CARTEIRA DE IDENTIFICAÇÃO FUNCIONAL OFICIAL (CR-80: 85,6 mm x 53,98 mm)', pageWidth / 2, 23, { align: 'center' });

      // Faixa com dados resumidos do associado
      pdf.setFillColor(248, 250, 252);
      pdf.roundedRect(14, 34, 182, 16, 2, 2, 'F');
      pdf.setDrawColor(203, 213, 225);
      pdf.roundedRect(14, 34, 182, 16, 2, 2, 'S');

      pdf.setTextColor(15, 23, 42);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.text(`ASSOCIADO(A): ${member.fullName.toUpperCase()}`, 18, 40.5);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7.5);
      pdf.text(`CPF: ${formatCPF(member.cpf)}   |   CNS: ${member.cns || '---'}   |   ID: ACS-${displayId}   |   SITUAÇÃO: ${member.status?.toUpperCase() || 'ATIVO'}`, 18, 46);

      // Título da seção das carteiras
      pdf.setTextColor(6, 95, 70);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.text('RECORTE NA LINHA PONTILHADA, DOBRE NA LINHA CENTRAL E PLASTIFIQUE', pageWidth / 2, 57, { align: 'center' });

      // Dimensões da carteira CR80 em mm
      const cardW = 85.6;
      const cardH = 53.98;
      const totalW = cardW * 2; // 171.2 mm
      const startX = (pageWidth - totalW) / 2; // 19.4 mm
      const startY = 62;

      // Desenha as imagens dos dois lados lado a lado com qualidade máxima
      pdf.addImage(frontImgData, 'PNG', startX, startY, cardW, cardH, undefined, 'FAST');
      pdf.addImage(backImgData, 'PNG', startX + cardW, startY, cardW, cardH, undefined, 'FAST');

      // Marcas de corte nos 4 cantos externos (cruzetas profissionais de corte)
      const markLen = 5;
      pdf.setDrawColor(71, 85, 105);
      pdf.setLineWidth(0.25);

      // Canto Superior Esquerdo
      pdf.line(startX - markLen, startY, startX, startY);
      pdf.line(startX, startY - markLen, startX, startY);

      // Canto Superior Direito
      pdf.line(startX + totalW, startY, startX + totalW + markLen, startY);
      pdf.line(startX + totalW, startY - markLen, startX + totalW, startY);

      // Canto Inferior Esquerdo
      pdf.line(startX - markLen, startY + cardH, startX, startY + cardH);
      pdf.line(startX, startY + cardH, startX, startY + cardH + markLen);

      // Canto Inferior Direito
      pdf.line(startX + totalW, startY + cardH, startX + totalW + markLen, startY + cardH);
      pdf.line(startX + totalW, startY + cardH, startX + totalW, startY + cardH + markLen);

      // Linha pontilhada de recorte ao redor das duas faces
      pdf.setDrawColor(100, 116, 139);
      pdf.setLineDashPattern([2, 1.5], 0);
      pdf.rect(startX, startY, totalW, cardH, 'S');

      // Linha sólida de dobra central (em verde esmeralda destacada)
      pdf.setLineDashPattern([], 0);
      pdf.setDrawColor(5, 150, 105);
      pdf.setLineWidth(0.4);
      pdf.line(startX + cardW, startY, startX + cardW, startY + cardH);

      // Rótulos explicativos sob as faces
      pdf.setFontSize(7);
      pdf.setTextColor(100, 116, 139);
      pdf.setFont('helvetica', 'bold');
      pdf.text('[ FRENTE ]', startX + cardW / 2, startY + cardH + 5, { align: 'center' });
      pdf.setTextColor(5, 150, 105);
      pdf.text('| LINHA DE DOBRA CENTRAL |', startX + cardW, startY + cardH + 5, { align: 'center' });
      pdf.setTextColor(100, 116, 139);
      pdf.text('[ VERSO ]', startX + cardW + cardW / 2, startY + cardH + 5, { align: 'center' });

      // Aviso de recorte
      pdf.setFontSize(6.5);
      pdf.setFont('helvetica', 'italic');
      pdf.setTextColor(100, 116, 139);
      pdf.text('Recorte na linha pontilhada externa mantendo ambos os lados unidos, dobre na linha verde central e plastifique.', pageWidth / 2, startY + cardH + 10, { align: 'center' });

      // Caixa de Instruções de Acabamento Gráfico
      const instY = 135;
      pdf.setFillColor(248, 250, 252);
      pdf.roundedRect(14, instY, 182, 45, 3, 3, 'F');
      pdf.setDrawColor(226, 232, 240);
      pdf.roundedRect(14, instY, 182, 45, 3, 3, 'S');

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8.5);
      pdf.setTextColor(6, 95, 70);
      pdf.text('GUIA DE IMPRESSÃO E PLASTIFICAÇÃO EM ALTA DEFINIÇÃO:', 19, instY + 8);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7.5);
      pdf.setTextColor(51, 65, 85);
      pdf.text('1. Papel Recomendado: Imprima em papel fotográfico Glossy ou Matte de 180g a 240g (configurar qualidade alta na impressora).', 19, instY + 15);
      pdf.text('2. Escala 100%: Ao mandar imprimir este PDF, certifique-se de que a escala de impressão esteja em 100% (ou Tamanho Real).', 19, instY + 21);
      pdf.text('3. Recorte: Recorte exatamente no contorno pontilhado externo, preservando a união central entre Frente e Verso.', 19, instY + 27);
      pdf.text('4. Dobra: Dobre no vinco central (linha verde) unindo as duas faces perfeitamente alinhadas costas com costas.', 19, instY + 33);
      pdf.text('5. Plastificação: Utilize polaseal padrão crachá (54x86 mm) e termo-laminadora para acabamento impermeável e durável.', 19, instY + 39);

      // Caixa de Autenticidade e Validação Digital
      const valY = 188;
      pdf.setFillColor(236, 253, 245);
      pdf.roundedRect(14, valY, 182, 34, 3, 3, 'F');
      pdf.setDrawColor(167, 243, 208);
      pdf.roundedRect(14, valY, 182, 34, 3, 3, 'S');

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8.5);
      pdf.setTextColor(6, 95, 70);
      pdf.text('AUTENTICIDADE E VALIDAÇÃO DIGITAL AACSM:', 19, valY + 8);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7.5);
      pdf.setTextColor(51, 65, 85);
      pdf.text(`Portal de Validação Pública: ${verificationUrl}`, 19, valY + 15);
      pdf.text(`Código de Identificação do Associado: ACS-${displayId} (Ref: ${member.id})`, 19, valY + 21);

      const now = new Date();
      const dateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} às ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      pdf.text(`Documento oficial emitido eletronicamente em ${dateStr}. AACSM - Mulungu do Morro/BA.`, 19, valY + 27);

      // Rodapé
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(7);
      pdf.setTextColor(148, 163, 184);
      pdf.text('AACSM - Associação dos Agentes Comunitários de Saúde de Mulungu do Morro - Bahia • Amparo: Lei Federal nº 11.350/2006', pageWidth / 2, 285, { align: 'center' });

      // Salva e faz o download direto do arquivo PDF
      const safeName = member.fullName.replace(/[^a-zA-Z0-9]/g, '_');
      pdf.save(`Carteirinha_ACS_Oficial_${safeName}.pdf`);

      setStatusMessage("PDF de alta definição baixado com sucesso!");
    } catch (err: any) {
      console.error("Erro ao gerar PDF:", err);
      alert(`Erro ao gerar PDF: ${err.message || 'Verifique sua conexão e tente novamente.'}`);
    } finally {
      setTimeout(() => {
        setIsPreparing(false);
        setStatusMessage("");
      }, 1500);
    }
  };

  const handleDownloadPNG = async () => {
    if (!frontRef.current || !backRef.current) return;

    setIsPreparing(true);
    setStatusMessage("Gerando imagens em ultra-alta definição (600 DPI)...");

    try {
      const options = {
        scale: 5, // 5x scale (~1700 x 1080 px por cartão - padrão gráfico 600 DPI)
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        imageTimeout: 0,
      };

      const frontCanvas = await html2canvas(frontRef.current, options);
      const backCanvas = await html2canvas(backRef.current, options);

      const safeName = member.fullName.replace(/[^a-zA-Z0-9]/g, '_');

      // Baixa frente
      const linkFront = document.createElement('a');
      linkFront.download = `Carteirinha_ACS_FRENTE_600DPI_${safeName}.png`;
      linkFront.href = frontCanvas.toDataURL('image/png');
      linkFront.click();

      // Baixa verso após intervalo seguro
      setTimeout(() => {
        const linkBack = document.createElement('a');
        linkBack.download = `Carteirinha_ACS_VERSO_600DPI_${safeName}.png`;
        linkBack.href = backCanvas.toDataURL('image/png');
        linkBack.click();
      }, 600);

      setStatusMessage("Imagens em 600 DPI baixadas com sucesso!");
    } catch (err: any) {
      console.error("Erro ao gerar imagens:", err);
      alert("Erro ao baixar imagens: " + err.message);
    } finally {
      setTimeout(() => {
        setIsPreparing(false);
        setStatusMessage("");
      }, 1500);
    }
  };

  const handleDirectPrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Área da Carteirinha: Frente e Verso */}
      <div className="print-card-area flex flex-col lg:flex-row gap-8 mb-8 items-center justify-center">
        
        {/* LADO FRENTE */}
        <div className="space-y-2 text-center">
          <div className="flex items-center justify-center gap-2 no-print">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Frente do Documento (CR-80)</p>
          </div>
          
          <div 
            ref={frontRef}
            className="card-face card-front w-[85.6mm] min-w-[85.6mm] max-w-[85.6mm] h-[53.98mm] min-h-[53.98mm] max-h-[53.98mm] box-border rounded-[3mm] overflow-hidden relative border border-emerald-400 flex flex-col justify-between mx-auto shadow-2xl bg-white select-none text-slate-800" 
            style={{ 
              background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 40%, #e6fced 75%, #ffffff 100%)' 
            }}
          >
            {/* Padrão de Segurança / Marca D'água Geometria Sutil */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.035] bg-[radial-gradient(#065f46_1px,transparent_1px)] [background-size:6px_6px] z-0"></div>
            
            {/* Cabeçalho do Cartão */}
            <div className="bg-white border-b-2 border-emerald-600 h-[9.2mm] flex items-center justify-between px-2.5 relative z-10 shrink-0 shadow-xs">
              <div className="flex items-center gap-1.5 min-w-0">
                <Logo className="w-3.5 h-3.5 shrink-0 drop-shadow-xs" />
                <div className="leading-tight text-left min-w-0">
                  <div className="flex items-center gap-1">
                    <h1 className="text-[8.5px] font-black text-emerald-950 uppercase tracking-tight">AACSM</h1>
                    <span className="text-[4.8px] font-black bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded border border-emerald-200">BA</span>
                  </div>
                  <p className="text-[4.8px] text-slate-600 font-bold uppercase tracking-tight">Assoc. Agentes Comunitários de Saúde</p>
                </div>
              </div>
              <div className="text-right shrink-0 pl-1 leading-none">
                <h2 className="text-[7.2px] font-black text-emerald-900 uppercase tracking-tight">MULUNGU DO MORRO</h2>
                <p className="text-[4.5px] text-emerald-700 font-bold uppercase mt-0.5">Identidade Funcional</p>
              </div>
            </div>

            {/* Linha fina decorativa dourada */}
            <div className="h-[0.5mm] bg-amber-500 w-full relative z-10 shrink-0"></div>

            {/* Corpo do Cartão Frente: agrupado e elevado para dar folga total aos números dos documentos */}
            <div className="flex-1 px-2.5 pt-1 pb-2 flex items-center justify-between gap-2 relative z-10 overflow-hidden">
              
              {/* Coluna Esquerda: Informações do Associado agrupadas no topo com folga inferior garantida */}
              <div className="flex-1 flex flex-col justify-start gap-1.5 min-w-0 pr-1 text-left">
                
                {/* 1. Badge de Sócio */}
                <div className="shrink-0">
                  <span className={`inline-block px-1.5 py-0.2 rounded text-[4.8px] font-black uppercase tracking-wider ${member.status === 'Ativo' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'}`}>
                    ★ SÓCIO {member.status === 'Ativo' ? 'EFETIVO REGULAR' : 'INATIVO'}
                  </span>
                </div>

                {/* 2. Nome do Titular Completo */}
                <div className="shrink-0">
                  <span className="text-[4.5px] text-emerald-950 font-black uppercase tracking-wider block leading-none mb-0.5">
                    Nome do Titular:
                  </span>
                  <h2 className={`font-black text-slate-900 uppercase leading-tight tracking-tight break-words ${
                    member.fullName.length > 28 ? 'text-[7.2px]' : member.fullName.length > 20 ? 'text-[8px]' : 'text-[9px]'
                  }`}>
                    {member.fullName}
                  </h2>
                </div>

                {/* 3. Cargo / Função */}
                <div className="shrink-0">
                  <span className="text-[4.5px] text-slate-500 font-black uppercase tracking-wider block leading-none mb-0.5">
                    Cargo / Função:
                  </span>
                  <p className="text-[7.2px] font-black text-emerald-800 uppercase leading-normal tracking-tight">
                    Agente Comunitário de Saúde
                  </p>
                </div>

                {/* 4. Dados Pessoais em Grid (CPF, CNS, Nascimento) - Elevados e com margem limpa da tarja */}
                <div className="shrink-0 pt-1 border-t border-emerald-200">
                  <div className="grid grid-cols-3 gap-1">
                    <div>
                      <span className="text-[4.2px] text-slate-500 font-bold uppercase block leading-none">CPF</span>
                      <p className="text-[6.5px] font-black text-slate-800 tracking-tight leading-tight mt-0.5">{formatCPF(member.cpf)}</p>
                    </div>
                    <div>
                      <span className="text-[4.2px] text-slate-500 font-bold uppercase block leading-none">CNS (SUS)</span>
                      <p className="text-[6.5px] font-black text-slate-800 tracking-tight leading-tight mt-0.5">{member.cns || '---'}</p>
                    </div>
                    <div>
                      <span className="text-[4.2px] text-slate-500 font-bold uppercase block leading-none">Nascimento</span>
                      <p className="text-[6.5px] font-black text-slate-800 tracking-tight leading-tight mt-0.5">{formatBirthDate(member.birthDate)}</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Coluna Direita: Foto 3x4 Oficial */}
              <div className="w-[20mm] min-w-[20mm] h-[25.5mm] shrink-0 bg-white p-[0.4mm] rounded-[1.5mm] border-2 border-emerald-700 shadow-sm flex items-center justify-center overflow-hidden self-center">
                <div className="w-full h-full rounded-[1mm] overflow-hidden bg-slate-100 flex items-center justify-center">
                  {member.profileImage ? (
                    <img 
                      src={member.profileImage} 
                      alt={member.fullName} 
                      crossOrigin="anonymous" 
                      className="w-full h-full object-cover object-top" 
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-300 w-full h-full bg-slate-50">
                      <span className="text-xl leading-none">👤</span>
                      <span className="text-[5px] font-black uppercase text-slate-400 mt-1">FOTO 3x4</span>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Tarja Inferior Oficial - 100% visível, nunca cortada */}
            <div className="h-[3.2mm] bg-emerald-800 w-full relative z-10 shrink-0 flex items-center justify-between px-2.5 text-white">
              <span className="text-[4.2px] font-black tracking-wider uppercase leading-none">LEI FEDERAL Nº 11.350/2006</span>
              <span className="text-[4.2px] font-black tracking-wider uppercase leading-none">MULUNGU DO MORRO - BA</span>
            </div>
          </div>
        </div>

        {/* LADO VERSO */}
        <div className="space-y-2 text-center">
          <div className="flex items-center justify-center gap-2 no-print">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Verso do Documento (CR-80)</p>
          </div>

          <div 
            ref={backRef}
            className="card-face card-back w-[85.6mm] min-w-[85.6mm] max-w-[85.6mm] h-[53.98mm] min-h-[53.98mm] max-h-[53.98mm] box-border rounded-[3mm] overflow-hidden relative border border-emerald-400 flex flex-col justify-between mx-auto shadow-2xl bg-white select-none text-slate-800" 
            style={{ 
              background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 40%, #e6fced 75%, #ffffff 100%)' 
            }}
          >
            {/* Padrão de Segurança */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.035] bg-[radial-gradient(#065f46_1px,transparent_1px)] [background-size:6px_6px] z-0"></div>

            {/* Conteúdo Central Verso: flex-1 com margem de segurança para NÃO empurrar a tarja inferior */}
            <div className="flex-1 px-2.5 pt-1 pb-1.5 flex flex-col justify-between relative z-10">
              
              {/* Seção Superior: Dados Profissionais e ID */}
              <div className="text-left">
                <div className="flex justify-between items-center border-b border-emerald-300 pb-0.5 mb-1">
                  <div>
                    <h3 className="text-[7.8px] font-black text-emerald-950 uppercase tracking-tight leading-none">
                      Lotação Profissional
                    </h3>
                    <p className="text-[4.5px] text-emerald-700 font-bold uppercase mt-0.5">Vínculo Oficial & Atuação em Saúde</p>
                  </div>
                  <span className="text-[5.2px] font-black bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded border border-emerald-300">
                    ID: ACS-{displayId}
                  </span>
                </div>

                <div className="flex justify-between items-center gap-2 pt-0.5">
                  <div className="space-y-0.8 flex-1 min-w-0">
                    <div>
                      <span className="text-[4.2px] text-slate-500 font-bold uppercase block leading-none">Unidade Básica de Saúde / PSF</span>
                      <p className="text-[6.8px] font-black text-slate-900 uppercase leading-tight break-words">
                        {member.workplace || 'SECRETARIA MUNICIPAL DE SAÚDE'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-1">
                      <div>
                        <span className="text-[4.2px] text-slate-500 font-bold uppercase block leading-none">Equipe / Microárea</span>
                        <p className="text-[6.5px] font-black text-emerald-900 uppercase leading-tight break-words">
                          EQ. {member.team || '--'} • MA. {member.microArea || '--'}
                        </p>
                      </div>
                      <div>
                        <span className="text-[4.2px] text-slate-500 font-bold uppercase block leading-none">Zona de Atuação</span>
                        <p className="text-[6.5px] font-black text-slate-900 uppercase leading-tight">
                          {member.areaType ? member.areaType.toUpperCase() : 'URBANA'}
                        </p>
                      </div>
                    </div>

                    <div>
                      <span className="text-[4.2px] text-slate-500 font-bold uppercase block leading-none">Município / Estado</span>
                      <p className="text-[6.5px] font-bold text-slate-800 uppercase leading-tight">
                        Mulungu do Morro - Bahia
                      </p>
                    </div>
                  </div>

                  {/* QR Code de Validação Digital */}
                  <div className="bg-white p-0.5 rounded-lg border border-emerald-600 shadow-xs shrink-0 flex flex-col items-center">
                    {qrCodeDataUrl ? (
                      <img 
                        src={qrCodeDataUrl} 
                        className="w-[12.5mm] h-[12.5mm] object-contain" 
                        alt="QR Code de Verificação" 
                      />
                    ) : (
                      <div className="w-[12.5mm] h-[12.5mm] bg-slate-100 flex items-center justify-center text-[5px] text-slate-400">
                        QR CODE
                      </div>
                    )}
                    <span className="text-[3.6px] font-black text-emerald-900 uppercase tracking-tighter mt-0.5">VALIDAÇÃO DIGITAL</span>
                  </div>
                </div>
              </div>

              {/* Seção Inferior: Linhas de Assinatura e Fé Pública - Bem elevadas */}
              <div className="text-center border-t border-emerald-200 pt-0.5 pb-0.5">
                <div className="flex justify-around items-end mb-0.5">
                  <div className="flex flex-col items-center w-[27mm]">
                    <ExecutiveSignature />
                    <div className="w-full border-b border-slate-400 mb-0.5"></div>
                    <p className="text-[4.5px] font-black text-slate-700 uppercase leading-none">Diretoria Executiva</p>
                  </div>
                  <div className="flex flex-col items-center w-[27mm]">
                    <MemberSignature member={member} displayId={displayId} />
                    <div className="w-full border-b border-slate-400 mb-0.5"></div>
                    <p className="text-[4.5px] font-black text-slate-700 uppercase leading-none">Assinatura do Titular</p>
                  </div>
                </div>

                <p className="text-[3.6px] text-slate-500 font-medium tracking-tight text-center leading-tight">
                  Documento funcional e de identificação associativa pessoal e intransferível. Válido em todo território nacional acompanhado de documento oficial com foto.
                </p>
              </div>

            </div>

            {/* Tarja Inferior Oficial - 100% visível, nunca cortada */}
            <div className="h-[3.2mm] bg-emerald-800 w-full relative z-10 shrink-0 flex items-center justify-between px-2.5 text-white">
              <span className="text-[4.2px] font-black tracking-wider uppercase leading-none">AUTENTICIDADE VERIFICÁVEL VIA QR CODE</span>
              <span className="text-[4.2px] font-black tracking-wider uppercase leading-none">AACSM BAHIA</span>
            </div>
          </div>
        </div>

      </div>

      {/* Barra de Status ao Preparar */}
      {isPreparing && (
        <div className="no-print mb-6 p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl flex items-center gap-3 text-emerald-900 animate-pulse shadow-md">
          <span className="text-2xl animate-spin">⏳</span>
          <span className="text-xs font-black uppercase tracking-wider">{statusMessage || 'Processando em alta definição...'}</span>
        </div>
      )}

      {/* Botões de Ação para Exportação e Impressão */}
      {!hidePrintButton && (
        <div className="flex flex-col sm:flex-row gap-3 no-print w-full max-w-2xl justify-center">
          <button 
            onClick={handleExportPDF}
            disabled={isPreparing}
            className={`flex-1 bg-emerald-800 hover:bg-emerald-900 text-white px-6 py-4 rounded-2xl font-black uppercase text-[11px] tracking-wider shadow-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] ${isPreparing ? 'opacity-70 cursor-wait' : ''}`}
            title="Gera arquivo PDF em folha A4 com resolução de 400+ DPI e marcas de corte e dobra"
          >
            <span>📄</span>
            <span>{isPreparing ? 'Processando PDF...' : 'Baixar PDF Oficial A4 (Alta Definição)'}</span>
          </button>

          <button 
            onClick={handleDownloadPNG}
            disabled={isPreparing}
            className="bg-white hover:bg-slate-50 text-emerald-900 border-2 border-emerald-800 px-5 py-4 rounded-2xl font-black uppercase text-[11px] tracking-wider shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            title="Baixa a frente e o verso em imagens PNG nítidas em 600 DPI para impressoras térmicas de PVC ou gráficas"
          >
            <span>🖼️</span>
            <span>Salvar Imagens (600 DPI)</span>
          </button>

          <button 
            onClick={handleDirectPrint}
            disabled={isPreparing}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 px-5 py-4 rounded-2xl font-black uppercase text-[11px] tracking-wider shadow-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            title="Abre a tela de impressão do navegador"
          >
            <span>🖨️</span>
            <span>Imprimir</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default IDCard;
