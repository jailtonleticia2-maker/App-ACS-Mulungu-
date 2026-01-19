
import React, { useEffect, useState } from 'react';
import { fetchHealthNews } from '../services/geminiService';
import { NewsItem } from '../types';

const NewsSection: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  const INVESTSUS_URL = "https://investsuspaineis.saude.gov.br/extensions/CGIN_InvestsusPaineis/CGIN_InvestsusPaineis.html";
  const REPASSE_ACS_URL = "https://relatorioaps.saude.gov.br/gerenciaaps/pagamento/acs";

  const loadNews = async () => {
    try {
      setLoading(true);
      const data = await fetchHealthNews();
      setNews(data || []);
    } catch (err) {
      console.error("Falha ao carregar notícias:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-6">
        <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
        <p className="text-emerald-900 font-black uppercase tracking-tighter text-lg">Buscando Notícias...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12 text-left">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Informação em Tempo Real</span>
          </div>
          <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Notícias MS</h2>
          <p className="text-slate-500 font-medium">As últimas do Ministério da Saúde e SUS</p>
        </div>
        <button 
          onClick={loadNews}
          className="bg-emerald-900 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg"
        >
          Atualizar 🔄
        </button>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {/* DESTAQUE 1: PAINEL INVESTSUS */}
        <section className="bg-blue-900 rounded-[3rem] p-8 md:p-10 text-white shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 text-white/5 text-8xl font-black select-none pointer-events-none">📊</div>
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-3xl shadow-inner backdrop-blur-md shrink-0">
              🏛️
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-black uppercase tracking-tighter mb-1">Painéis InvestSUS</h3>
              <p className="text-blue-100 text-xs font-medium opacity-80 mb-4">
                Acompanhe os repasses financeiros e investimentos federais diretamente pelo portal oficial do MS.
              </p>
              <a 
                href={INVESTSUS_URL} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block bg-white text-blue-900 px-6 py-3 rounded-xl font-black uppercase text-[9px] tracking-widest shadow-lg hover:bg-blue-50 transition-all active:scale-95"
              >
                Abrir Painel Federal ↗
              </a>
            </div>
          </div>
        </section>

        {/* DESTAQUE 2: CONSULTE REPASSE ACS */}
        <section className="bg-emerald-800 rounded-[3rem] p-8 md:p-10 text-white shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 text-white/5 text-8xl font-black select-none pointer-events-none">💰</div>
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-3xl shadow-inner backdrop-blur-md shrink-0">
              🏦
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-black uppercase tracking-tighter mb-1">Consulte Repasse ACS</h3>
              <p className="text-emerald-100 text-xs font-medium opacity-80 mb-4">
                Gerencie e visualize os pagamentos e incentivos financeiros federais destinados aos ACS da região.
              </p>
              <a 
                href={REPASSE_ACS_URL} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block bg-white text-emerald-800 px-6 py-3 rounded-xl font-black uppercase text-[9px] tracking-widest shadow-lg hover:bg-emerald-50 transition-all active:scale-95"
              >
                Consultar Pagamentos ↗
              </a>
            </div>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
        {news.map((item, idx) => (
          <article 
            key={idx} 
            onClick={() => setSelectedNews(item)}
            className="group bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="px-4 py-1.5 bg-slate-50 text-slate-500 text-[10px] font-black uppercase rounded-xl border border-slate-100">SAÚDE</span>
                <span className="text-[11px] text-slate-400 font-black uppercase tracking-widest">{item.date}</span>
              </div>
              <h3 className="text-xl font-black text-slate-800 group-hover:text-emerald-700 transition-colors mb-4 leading-tight">
                {item.title}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-8 font-medium">
                {item.summary}
              </p>
            </div>
            <div className="flex items-center justify-between pt-6 border-t border-slate-50">
              <span className="text-emerald-600 font-black text-[10px] uppercase tracking-widest">Ler Completa</span>
              <span className="text-slate-300 group-hover:text-emerald-500 transition-colors text-xl">→</span>
            </div>
          </article>
        ))}
      </div>

      {selectedNews && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-[150] flex items-center justify-center p-4" onClick={() => setSelectedNews(null)}>
          <div 
            className="bg-white rounded-[3.5rem] shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-in zoom-in duration-300"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white/90 backdrop-blur-md p-8 border-b border-slate-100 flex justify-between items-center z-10">
               <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Leitura da Notícia</span>
               <button onClick={() => setSelectedNews(null)} className="w-10 h-10 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 transition-all text-xl">✕</button>
            </div>
            
            <div className="p-8 md:p-12">
               <h3 className="text-3xl font-black text-slate-900 mb-8 leading-tight">{selectedNews.title}</h3>
               <div className="space-y-6">
                  {selectedNews.content.split('\n\n').map((paragraph, i) => (
                    <p key={i} className="text-slate-600 text-lg leading-relaxed font-medium">
                      {paragraph}
                    </p>
                  ))}
               </div>
               <div className="mt-12 flex justify-end">
                  <a 
                    href={selectedNews.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg"
                  >
                    Ver na Fonte Original ↗
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