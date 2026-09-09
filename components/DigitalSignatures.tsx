import React from 'react';
import { Member } from '../types';

interface MemberSignatureProps {
  member: Member;
  displayId?: string;
  className?: string;
}

// Formatar o nome para estilo caligráfico de assinatura (ex: "Jailton Silva" ou "J. Silva")
export const formatSignatureName = (fullName: string): string => {
  if (!fullName) return 'Associado(a)';
  const parts = fullName.trim().split(/\s+/).map(p => 
    p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()
  );
  if (parts.length <= 2) return parts.join(' ');
  // Para nomes com mais de 2 partes: Primeiro nome + Inicial do meio + Último sobrenome
  return `${parts[0]} ${parts.slice(1, -1).map(p => p.length > 2 ? p[0] + '.' : '').filter(Boolean).join(' ')} ${parts[parts.length - 1]}`;
};

// Gera um hash digital determinístico curto para o certificado
export const generateSignatureHash = (member: Member, displayId: string = '001'): string => {
  const seed = `${member.id}-${member.cpf}-${displayId}-AACSM`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
  return `DIG-${hex.slice(0, 4)}-${hex.slice(4, 8)}`;
};

/**
 * Assinatura Digital da Diretoria Executiva da AACSM
 */
export const ExecutiveSignature: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-end w-full select-none ${className}`}>
      {/* Selo Digital Superior */}
      <div className="flex items-center gap-0.5 opacity-90 mb-[0.2mm]">
        <svg className="w-[2.2mm] h-[2.2mm] text-emerald-700" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
        </svg>
        <span className="text-[3.2px] font-black tracking-tighter text-emerald-950 uppercase leading-none">
          Certificado Digital AACSM
        </span>
      </div>

      {/* Rubrica Caligráfica em Traço Vetorial da Diretoria */}
      <div className="relative flex items-center justify-center w-full h-[5.2mm] overflow-visible">
        {/* Traço de assinatura manuscrita estilizada */}
        <span 
          className="font-signature text-[12.5px] font-bold text-[#0c3666] tracking-normal leading-none transform -rotate-1 select-none pointer-events-none drop-shadow-xs"
          style={{ textShadow: '0 0 0.5px rgba(12, 54, 102, 0.5)' }}
        >
          Diretoria Executiva
        </span>
        
        {/* Floreio / Rubrica elegante sob a assinatura */}
        <svg 
          className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-[22mm] h-[2.5mm] text-[#0c3666] pointer-events-none opacity-85" 
          viewBox="0 0 100 20" 
          fill="none" 
          stroke="currentColor"
        >
          <path 
            d="M 5 12 Q 25 2, 50 11 T 92 6 Q 60 18, 30 14" 
            strokeWidth="1.6" 
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Código de Segurança Criptográfico */}
      <div className="text-[2.9px] font-bold text-slate-500 uppercase tracking-tighter leading-none mt-0.5">
        Chave: DIR-EXEC-2026-BR
      </div>
    </div>
  );
};

/**
 * Assinatura Digital do Sócio / Titular
 */
export const MemberSignature: React.FC<MemberSignatureProps> = ({ member, displayId = '001', className = '' }) => {
  const sigName = formatSignatureName(member.fullName);
  const hash = generateSignatureHash(member, displayId);

  return (
    <div className={`flex flex-col items-center justify-end w-full select-none ${className}`}>
      {/* Selo de Assinatura Eletrônica do Titular */}
      <div className="flex items-center gap-0.5 opacity-90 mb-[0.2mm]">
        <svg className="w-[2.2mm] h-[2.2mm] text-blue-700" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        <span className="text-[3.2px] font-black tracking-tighter text-blue-950 uppercase leading-none">
          Assinado Digitalmente
        </span>
      </div>

      {/* Área da Assinatura: Desenhada ou Gerada com Caligrafia */}
      <div className="relative flex items-center justify-center w-full h-[5.2mm] overflow-visible">
        {member.signatureImage ? (
          <img 
            src={member.signatureImage} 
            alt={`Assinatura de ${member.fullName}`} 
            className="max-h-[5.2mm] max-w-[24mm] object-contain filter contrast-125 select-none pointer-events-none"
          />
        ) : (
          <>
            <span 
              className="font-signature text-[12.5px] font-bold text-[#0c2f5a] tracking-normal leading-none transform -rotate-1 select-none pointer-events-none drop-shadow-xs max-w-[26mm] truncate"
              style={{ textShadow: '0 0 0.5px rgba(12, 47, 90, 0.5)' }}
            >
              {sigName}
            </span>
            {/* Floreio característico de rubrica pessoal */}
            <svg 
              className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-[22mm] h-[2.5mm] text-[#0c2f5a] pointer-events-none opacity-85" 
              viewBox="0 0 100 20" 
              fill="none" 
              stroke="currentColor"
            >
              <path 
                d="M 8 10 Q 30 16, 55 8 T 90 12 Q 50 19, 20 12" 
                strokeWidth="1.5" 
                strokeLinecap="round"
              />
            </svg>
          </>
        )}
      </div>

      {/* Identificador Criptográfico com ID ACS e Hash */}
      <div className="text-[2.9px] font-bold text-slate-500 uppercase tracking-tighter leading-none mt-0.5">
        Validação: {hash}
      </div>
    </div>
  );
};