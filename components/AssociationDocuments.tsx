
import React, { useState, useEffect, useRef } from 'react';
import { databaseService } from '../services/databaseService';

interface AssociationDocumentsProps {
  isAdmin?: boolean;
}

const AssociationDocuments: React.FC<AssociationDocumentsProps> = ({ isAdmin = false }) => {
  const [dbDocs, setDbDocs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [targetDocId, setTargetDocId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = databaseService.subscribeDocuments((data) => {
      setDbDocs(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !targetDocId) return;

    if (file.type !== 'application/pdf') {
      alert("ERRO: O arquivo selecionado não é um PDF.\n\nSe você tirou foto do documento, use o aplicativo do scanner para salvar como PDF antes de enviar.");
      return;
    }

    // Limite técnico do Firestore é 1MB. 800KB original vira ~1MB em Base64.
    if (file.size > 850 * 1024) {
      alert("ERRO: O arquivo é muito grande (" + (file.size/1024).toFixed(0) + "KB).\n\nO banco de dados aceita no máximo 850KB. Como as fotos da Ata são pesadas, por favor use o site 'iLovePDF' para COMPRIMIR o PDF antes de enviar aqui.");
      return;
    }

    setUploadingId(targetDocId);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        await databaseService.saveDocument(targetDocId, reader.result as string);
        alert("Documento atualizado com sucesso!");
      } catch (err: any) {
        alert(err.message || "Erro ao salvar. O arquivo pode estar excedendo o limite de tamanho do banco de dados.");
      } finally {
        setUploadingId(null);
        setTargetDocId(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const triggerUpload = (docId: string) => {
    setTargetDocId(docId);
    fileInputRef.current?.click();
  };

  const handleDelete = async (docId: string, docTitle: string) => {
    if (!window.confirm(`ATENÇÃO: Deseja realmente EXCLUIR permanentemente o arquivo de "${docTitle}"?`)) {
      return;
    }

    setDeletingId(docId);
    
    // Atualização Otimista
    const newDocs = {...dbDocs};
    delete newDocs[docId];
    setDbDocs(newDocs);

    try {
      await databaseService.deleteDocument(docId);
    } catch (err) {
      console.error("Erro ao excluir documento:", err);
      alert("Erro ao remover o arquivo do servidor.");
    } finally {
      setDeletingId(null);
    }
  };

  const openPdf = (base64Data: string, fileName: string) => {
    try {
      if (!base64Data) return;
      
      if (base64Data.startsWith('http')) {
        window.open(base64Data, '_blank');
        return;
      }

      const base64Content = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
      const byteCharacters = atob(base64Content);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.target = '_blank';
      link.download = `${fileName.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
    } catch (error) {
      alert("Erro ao abrir arquivo. O PDF pode estar incompleto ou pesado demais para o navegador.");
    }
  };

  const documents = [
    {
      id: 'estatuto',
      title: 'Estatuto Social',
      description: 'Regimento interno e normas da associação AACSM.',
      icon: '📜',
      color: 'bg-emerald-50 text-emerald-600',
      url: dbDocs['estatuto'] || null,
    },
    {
      id: 'ata',
      title: 'Ata de Fundação',
      description: 'Documento completo da Ata nº 117 (Fundação e Eleição).',
      icon: '✍️',
      color: 'bg-blue-50 text-blue-600',
      url: dbDocs['ata'] || null,
    },
    {
      id: 'lei',
      title: 'Lei Ruth Brilhante',
      description: 'Lei nº 11.350/2006 - Marco legal da nossa categoria.',
      icon: '⚖️',
      color: 'bg-amber-50 text-amber-600',
      url: 'https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2006/lei/l11350.htm',
      isFixed: true
    }
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-emerald-900 font-black uppercase animate-pulse">
         <span className="text-4xl mb-4">📂</span>
         Sincronizando Arquivos...
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom duration-700 pb-12 text-left">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Repositório Oficial AACSM</span>
          </div>
          <h2 className="text-4xl font-black text-emerald-900 uppercase tracking-tighter leading-none">Documentos</h2>
          <p className="text-slate-500 font-medium mt-2">Repositório de arquivos oficiais para consulta da categoria.</p>
        </div>
        
        {isAdmin && (
          <div className="bg-emerald-900 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase shadow-lg animate-bounce">
            🔓 Modo Admin: Gestão Segura
          </div>
        )}
      </header>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="application/pdf" 
        className="hidden" 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.map((doc, idx) => (
          <div key={idx} className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-2xl transition-all group">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className={`w-16 h-16 ${doc.color} rounded-[1.5rem] flex items-center justify-center text-3xl shadow-inner`}>
                  {doc.icon}
                </div>
                {isAdmin && doc.url && !doc.isFixed && (
                  <button 
                    onClick={() => handleDelete(doc.id, doc.title)}
                    disabled={deletingId === doc.id}
                    className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shadow-sm active:scale-90"
                    title="Excluir Arquivo"
                  >
                    {deletingId === doc.id ? '...' : '🗑️'}
                  </button>
                )}
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter leading-tight">{doc.title}</h3>
                <p className="text-slate-500 text-[10px] font-bold uppercase mt-2 leading-relaxed">{doc.description}</p>
              </div>
            </div>
            
            <div className="mt-8 space-y-3">
              {doc.url ? (
                <button 
                  onClick={() => openPdf(doc.url!, doc.title)}
                  className="w-full bg-emerald-900 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest text-center shadow-lg hover:bg-black transition-all flex items-center justify-center gap-2"
                >
                  <span>Baixar Arquivo PDF</span>
                  <span>📄</span>
                </button>
              ) : (
                <div className="w-full bg-slate-100 text-slate-400 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest text-center border-2 border-dashed border-slate-200">
                  {doc.isFixed ? 'Link Externo' : 'Aguardando Arquivo'}
                </div>
              )}

              {isAdmin && !doc.isFixed && (
                <button 
                  onClick={() => triggerUpload(doc.id)}
                  disabled={uploadingId === doc.id}
                  className="w-full bg-blue-600 text-white py-3 rounded-2xl font-black uppercase text-[9px] tracking-widest text-center shadow-md hover:bg-blue-700 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  {uploadingId === doc.id ? 'Processando...' : 'Fazer Upload / Trocar 📤'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-100 p-8 rounded-[3rem] border-2 border-dashed border-slate-200 text-center">
        <p className="text-slate-400 font-bold italic text-[11px] uppercase tracking-widest">
          Arquivos de imagem (fotos) devem ser convertidos para PDF com tamanho reduzido.
        </p>
      </div>
    </div>
  );
};

export default AssociationDocuments;