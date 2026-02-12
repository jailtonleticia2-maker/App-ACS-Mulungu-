
import React, { useState, useEffect, useRef } from 'react';
import { databaseService } from '../services/databaseService';

interface AssociationDocumentsProps {
  isAdmin?: boolean;
}

const AssociationDocuments: React.FC<AssociationDocumentsProps> = ({ isAdmin = false }) => {
  const [dbDocs, setDbDocs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  
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
      alert("ERRO: O arquivo selecionado não é um PDF.");
      return;
    }

    if (file.size > 1024 * 1024) {
      alert("ERRO: O arquivo é muito grande. Limite 1MB.");
      return;
    }

    setUploadingId(targetDocId);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        await databaseService.saveDocument(targetDocId, reader.result as string);
        alert("Documento atualizado!");
      } catch (err: any) {
        alert("Erro ao salvar.");
      } finally {
        setUploadingId(null);
        setTargetDocId(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const openPdf = (base64Data: string, fileName: string) => {
    try {
      if (!base64Data) return;
      if (base64Data.startsWith('http')) {
        window.open(base64Data, '_blank');
        return;
      }
      const base64Content = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
      const byteCharacters = atob(base64Content.replace(/\s/g, ''));
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
    } catch (error) {
      alert("Erro ao abrir PDF.");
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
      description: 'Ata nº 117 de constituição da entidade.',
      icon: '✍️',
      color: 'bg-blue-50 text-blue-600',
      url: dbDocs['ata'] || null,
    },
    {
      id: 'lei',
      title: 'Lei Ruth Brilhante',
      description: 'Lei nº 11.350/2006 - Marco legal da categoria.',
      icon: '⚖️',
      color: 'bg-amber-50 text-amber-600',
      url: 'https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2006/lei/l11350.htm',
      isFixed: true
    }
  ];

  if (loading) return <div className="py-20 text-center font-black uppercase text-emerald-900">Sincronizando...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12 text-left">
      <header>
        <h2 className="text-4xl font-black text-emerald-900 uppercase tracking-tighter">Documentos Oficiais</h2>
        <p className="text-slate-500 font-medium">Arquivos e registros da associação.</p>
      </header>

      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="application/pdf" className="hidden" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.map((doc, idx) => (
          <div key={idx} className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-2xl transition-all">
            <div className="space-y-4">
              <div className={`w-16 h-16 ${doc.color} rounded-[1.5rem] flex items-center justify-center text-3xl shadow-inner`}>
                {doc.icon}
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 uppercase leading-tight">{doc.title}</h3>
                <p className="text-slate-500 text-[10px] font-bold uppercase mt-2">{doc.description}</p>
              </div>
            </div>
            
            <div className="mt-8 space-y-3">
              {doc.url && (
                <button onClick={() => openPdf(doc.url!, doc.title)} className="w-full bg-emerald-900 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest text-center shadow-lg">
                  Baixar PDF 📄
                </button>
              )}
              {isAdmin && !doc.isFixed && (
                <button 
                  onClick={() => { setTargetDocId(doc.id); fileInputRef.current?.click(); }}
                  className="w-full bg-blue-600 text-white py-3 rounded-2xl font-black uppercase text-[9px] tracking-widest text-center"
                >
                  {uploadingId === doc.id ? 'Subindo...' : 'Atualizar PDF 📤'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssociationDocuments;