
import React, { useEffect, useState } from 'react';
import { fetchHealthNews } from '../services/geminiService';
import { NewsItem } from '../types';

const NewsSection: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  useEffect(() => {
    const loadNews = async () => {
      try {
        setLoading(true);
        const data = await fetchHealthNews();
        if (data && data.length > 0) {
          setNews(data);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Falha no componente de notícias:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    loadNews();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-xl">🌐</div>
        </div>
        <div className="text-center">
          <p className="text-emerald-900 font-black uppercase tracking-tighter text-lg">Atualizando Notícias</p>
          <p className="text-slate-400 text-sm font-medium">Conectando ao Radar de Informações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Sincronizado via Google Search</span>
          </div>
          <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Informativo ACS</h2>
          <p className="text-slate-500 font-medium">As notícias que impactam sua rotina profissional</p>
        </div>
      </header>

      {error && !news.length && (
        <div className="bg-amber-50 p-8 rounded-[2rem] border border-amber-100 text-center">
           <p className="text-amber-800 font-bold italic">Não foi possível carregar notícias em tempo real. Tente novamente em instantes.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {news.map((item, idx) => (
          <article 
            key={idx} 
            onClick={() => setSelectedNews(item)}
            className="group bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="px-4 py-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase rounded-xl border border-emerald-100">SAÚDE PÚBLICA</span>
                <span className="text-[11px] text-slate-400 font-black uppercase tracking-widest">{item.date}</span>
              </div>
              <h3 className="text-2xl font-black text-slate-800 group-hover:text-emerald-700 transition-colors mb-4 leading-tight">
                {item.title}
              </h3>
              <p className="text-slate-500 text-base leading-relaxed line-clamp-3 mb-8 font-medium italic">
                "{item.summary}"
              </p>
            </div>
            <div className="flex items-center justify-between pt-6 border-t border-slate-50">
              <span className="text-emerald-600 font-black text-[10px] uppercase tracking-widest">Ler Notícia Completa</span>
              <span className="text-slate-300 group-hover:text-emerald-500 transition-colors text-xl">→</span>
            </div>
          </article>
        ))}
      </div>

      <div className="bg-emerald-900 p-12 rounded-[4rem] text-white flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 text-center md:text-left">
          <h4 className="text-3xl font-black mb-4 leading-none">Canal de Notificações</h4>
          <p className="text-emerald-100/80 text-lg font-medium max-w-md">
            Receba as portarias do Ministério da Saúde direto no seu celular.
          </p>
        </div>
        <button className="bg-white text-emerald-900 px-10 py-5 rounded-2xl font-black uppercase text-xs shadow-xl relative z-10 w-full md:w-auto">
          Ativar Alertas
        </button>
      </div>

      {selectedNews && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-[150] flex items-center justify-center p-4" onClick={() => setSelectedNews(null)}>
          <div 
            className="bg-white rounded-[3.5rem] shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-in zoom-in duration-300"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white/90 backdrop-blur-md p-8 border-b border-slate-100 flex justify-between items-center z-10">
               <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Leitura Oficial</span>
               <button onClick={() => setSelectedNews(null)} className="w-10 h-10 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 transition-all text-xl">✕</button>
            </div>
            
            <div className="p-8 md:p-12">
               <div className="flex items-center gap-4 mb-8">
                 <div className="w-14 h-14 bg-emerald-900 text-white rounded-2xl flex items-center justify-center text-2xl">📰</div>
                 <div>
                   <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Fonte: {new URL(selectedNews.url).hostname}</p>
                   <p className="text-sm font-bold text-slate-500">{selectedNews.date}</p>
                 </div>
               </div>
               
               <h3 className="text-3xl font-black text-slate-900 mb-8 leading-tight">{selectedNews.title}</h3>
               
               <div className="space-y-6">
                  {selectedNews.content.split('\n\n').map((paragraph, i) => (
                    <p key={i} className="text-slate-600 text-lg leading-relaxed font-medium">
                      {paragraph}
                    </p>
                  ))}
               </div>

               <div className="mt-12 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
                  <p className="text-xs font-bold text-slate-400 uppercase">Conteúdo verificado em tempo real</p>
                  <a 
                    href={selectedNews.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg text-center w-full md:w-auto"
                  >
                    Ver Fonte Completa ↗
                  </a>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsSection;
