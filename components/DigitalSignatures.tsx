import React from 'react';
import { Member } from '../types';

interface MemberSignatureProps {
  member: Member;
  displayId?: string;
  className?: string;
}

// Formatar o nome para estilo caligráfico de assinatura
export const formatSignatureName = (fullName: string): string => {
  if (!fullName) return 'Associado(a)';

  const parts = fullName
    .trim()
    .split(/\s+/)
    .map(
      p =>
        p.charAt(0).toUpperCase() +
        p.slice(1).toLowerCase()
    );

  if (parts.length <= 2) return parts.join(' ');

  return `${parts[0]} ${parts
    .slice(1, -1)
    .map(p => (p.length > 2 ? p[0] + '.' : ''))
    .filter(Boolean)
    .join(' ')} ${parts[parts.length - 1]}`;
};

// Gera um hash digital determinístico curto para o certificado
export const generateSignatureHash = (
  member: Member,
  displayId: string = '001'
): string => {
  const seed = `${member.id}-${member.cpf}-${displayId}-AACSM`;

  let hash = 0;

  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }

  const hex = Math.abs(hash)
    .toString(16)
    .toUpperCase()
    .padStart(8, '0');

  return `DIG-${hex.slice(0, 4)}-${hex.slice(4, 8)}`;
};

/**
 * Assinatura Digital da Diretoria Executiva da AACSM
 */
export const ExecutiveSignature: React.FC<{
  className?: string;
}> = ({ className = '' }) => {
  return (
    <div
      className={`flex flex-col items-center justify-center w-full select-none ${className}`}
      style={{
        height: '7.2mm',
        overflow: 'visible'
      }}
    >
      {/* Selo digital */}
      <div className="flex items-center gap-0.5 opacity-90 mb-[0.2mm] shrink-0">
        <svg
          className="w-[2mm] h-[2mm] text-emerald-700"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
        </svg>

        <span className="text-[3px] font-black tracking-tighter text-emerald-950 uppercase leading-none">
          Certificado Digital AACSM
        </span>
      </div>

      {/* Assinatura */}
      <div
        className="relative flex items-center justify-center w-full overflow-visible"
        style={{
          height: '4.2mm',
          minHeight: '4.2mm'
        }}
      >
        <span
          className="font-signature font-bold text-[#0c3666] tracking-normal select-none pointer-events-none"
          style={{
            fontSize: '10px',
            lineHeight: '1.15',
            whiteSpace: 'nowrap',
            transform: 'rotate(-1deg)',
            display: 'inline-block',
            paddingTop: '1px',
            paddingBottom: '2px',
            textShadow: '0 0 0.4px rgba(12, 54, 102, 0.45)'
          }}
        >
          Diretoria Executiva
        </span>

        <svg
          className="absolute left-1/2 -translate-x-1/2 w-[20mm] h-[1.6mm] text-[#0c3666] pointer-events-none opacity-80"
          style={{
            bottom: '-0.2mm'
          }}
          viewBox="0 0 100 20"
          fill="none"
          stroke="currentColor"
        >
          <path
            d="M 5 12 Q 25 2, 50 11 T 92 6 Q 60 18, 30 14"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Chave */}
      <div
        className="font-bold text-slate-500 uppercase tracking-tighter text-center"
        style={{
          fontSize: '2.6px',
          lineHeight: '1',
          marginTop: '0.4mm'
        }}
      >
        Chave: DIR-EXEC-2026-BR
      </div>
    </div>
  );
};

/**
 * Assinatura Digital do Sócio / Titular
 */
export const MemberSignature: React.FC<MemberSignatureProps> = ({
  member,
  displayId = '001',
  className = ''
}) => {
  const sigName = formatSignatureName(member.fullName);
  const hash = generateSignatureHash(member, displayId);

  return (
    <div
      className={`flex flex-col items-center justify-center w-full select-none ${className}`}
      style={{
        height: '7.2mm',
        overflow: 'visible'
      }}
    >
      {/* Selo */}
      <div className="flex items-center gap-0.5 opacity-90 mb-[0.2mm] shrink-0">
        <svg
          className="w-[2mm] h-[2mm] text-blue-700"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>

        <span className="text-[3px] font-black tracking-tighter text-blue-950 uppercase leading-none">
          Assinado Digitalmente
        </span>
      </div>

      {/* Área da assinatura */}
      <div
        className="relative flex items-center justify-center w-full overflow-visible"
        style={{
          height: '4.2mm',
          minHeight: '4.2mm'
        }}
      >
        {member.signatureImage ? (
          <img
            src={member.signatureImage}
            alt={`Assinatura de ${member.fullName}`}
            className="object-contain select-none pointer-events-none"
            style={{
              maxWidth: '22mm',
              maxHeight: '4mm',
              width: 'auto',
              height: 'auto',
              display: 'block'
            }}
          />
        ) : (
          <>
            <span
              className="font-signature font-bold text-[#0c2f5a] tracking-normal select-none pointer-events-none"
              style={{
                fontSize:
                  sigName.length > 22
                    ? '8.5px'
                    : sigName.length > 17
                    ? '9px'
                    : '10px',
                lineHeight: '1.15',
                whiteSpace: 'nowrap',
                maxWidth: '24mm',
                overflow: 'visible',
                textOverflow: 'clip',
                transform: 'rotate(-1deg)',
                display: 'inline-block',
                paddingTop: '1px',
                paddingBottom: '2px',
                textShadow: '0 0 0.4px rgba(12, 47, 90, 0.45)'
              }}
            >
              {sigName}
            </span>

            <svg
              className="absolute left-1/2 -translate-x-1/2 w-[20mm] h-[1.6mm] text-[#0c2f5a] pointer-events-none opacity-80"
              style={{
                bottom: '-0.2mm'
              }}
              viewBox="0 0 100 20"
              fill="none"
              stroke="currentColor"
            >
              <path
                d="M 8 10 Q 30 16, 55 8 T 90 12 Q 50 19, 20 12"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </>
        )}
      </div>

      {/* Hash */}
      <div
        className="font-bold text-slate-500 uppercase tracking-tighter text-center"
        style={{
          fontSize: '2.6px',
          lineHeight: '1',
          marginTop: '0.4mm'
        }}
      >
        Validação: {hash}
      </div>
    </div>
  );
};