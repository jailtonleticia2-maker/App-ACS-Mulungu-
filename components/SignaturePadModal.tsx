import React, { useRef, useState, useEffect } from 'react';

interface SignaturePadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (signatureDataUrl: string | null) => void;
  memberName: string;
  currentSignature?: string;
}

const SignaturePadModal: React.FC<SignaturePadModalProps> = ({
  isOpen,
  onClose,
  onSave,
  memberName,
  currentSignature
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [penColor, setPenColor] = useState('#0c3666'); // Azul caneta padrão de documento

  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Ajustar resolução interna do canvas para alta definição
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 2;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = penColor;

    // Se já tinha assinatura desenhada, renderizar
    if (currentSignature && currentSignature.startsWith('data:image')) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
        setHasDrawn(true);
      };
      img.src = currentSignature;
    } else {
      ctx.clearRect(0, 0, rect.width, rect.height);
      setHasDrawn(false);
    }
  }, [isOpen, penColor, currentSignature]);

  if (!isOpen) return null;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.strokeStyle = penColor;
    ctx.lineWidth = 2.5;
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.closePath();
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!hasDrawn) {
      // Se não desenhou nada, retorna null (usará a assinatura caligráfica automática)
      onSave(null);
    } else {
      const dataUrl = canvas.toDataURL('image/png');
      onSave(dataUrl);
    }
    onClose();
  };

  const handleUseAuto = () => {
    onSave(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[500] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] p-6 md:p-8 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-xl font-black text-emerald-950 uppercase tracking-tight">Assinatura Digital</h3>
            <p className="text-slate-500 text-xs font-semibold mt-0.5">
              Titular: <span className="text-emerald-700 font-bold uppercase">{memberName || 'Associado(a)'}</span>
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Escolha de Cor da Caneta */}
        <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-2xl mb-4 border border-slate-100">
          <span className="text-[11px] font-bold text-slate-600 uppercase">Tinta da Caneta:</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPenColor('#0c3666')}
              className={`px-3 py-1 rounded-xl text-xs font-black uppercase flex items-center gap-1.5 transition-all ${
                penColor === '#0c3666' ? 'bg-[#0c3666] text-white shadow-sm scale-105' : 'bg-white text-slate-600'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
              Azul Caneta
            </button>
            <button
              type="button"
              onClick={() => setPenColor('#0f172a')}
              className={`px-3 py-1 rounded-xl text-xs font-black uppercase flex items-center gap-1.5 transition-all ${
                penColor === '#0f172a' ? 'bg-[#0f172a] text-white shadow-sm scale-105' : 'bg-white text-slate-600'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-slate-900 inline-block"></span>
              Preto
            </button>
          </div>
        </div>

        {/* Área do Canvas de Assinatura */}
        <div className="relative border-2 border-dashed border-emerald-300 rounded-3xl bg-slate-50/50 overflow-hidden shadow-inner touch-none">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full h-44 cursor-crosshair block"
          />

          {/* Linha guia de assinatura */}
          <div className="absolute bottom-8 left-8 right-8 border-b border-slate-300 pointer-events-none flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase">
            <span>✍️ Assine com o dedo ou mouse</span>
            <span>Linha de base</span>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center justify-between mt-4 gap-2">
          <button
            type="button"
            onClick={handleClear}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-[11px] font-black uppercase transition-colors"
          >
            Limpar Traço
          </button>
          <button
            type="button"
            onClick={handleUseAuto}
            className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-[11px] font-black uppercase transition-colors border border-emerald-200"
            title="Usa a rubrica caligráfica eletrônica oficial gerada pelo sistema"
          >
            Usar Caligrafia Automática
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black uppercase text-xs transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-2xl font-black uppercase text-xs shadow-lg transition-all"
          >
            Confirmar Assinatura
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignaturePadModal;