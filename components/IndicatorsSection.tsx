
import React, { useState, useEffect, useMemo } from 'react';
import { APSIndicator, DentalIndicator, PSFRankingData, PSF_LIST } from '../types';
import { databaseService } from '../services/databaseService';

interface IndicatorsSectionProps {
  apsIndicators: APSIndicator[];
  setApsIndicators: React.Dispatch<React.SetStateAction<APSIndicator[]>>;
  dentalIndicators: DentalIndicator[];
  setDentalIndicators: React.Dispatch<React.SetStateAction<DentalIndicator[]>>;
  isAdmin: boolean;
}

const IndicatorsSection: React.FC<IndicatorsSectionProps> = ({ 
  apsIndicators, 
  setApsIndicators, 
  dentalIndicators, 
  setDentalIndicators,
  isAdmin 
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'ranking' | 'vinculo-territorial' | 'qualidade-esf' | 'qualidade-esb' | 'populacao'>('vinculo-territorial');
  
  const [rankings, setRankings] = useState<PSFRankingData[]>([]);
  const [selectedPSFForEdit, setSelectedPSFForEdit] = useState<string | null>(null);
  const [editingPSFData, setEditingPSFData] = useState<PSFRankingData | null>(null);

  useEffect(() => {
    const unsub = databaseService.subscribePSFRankings((data) => {
      const filtered = data.filter(d => PSF_LIST.includes(d.psfName));
      
      if (filtered.length === 0) {
        setRankings(PSF_LIST.map(p => ({ 
          psfName: p, 
          eSusCount: 0, siapsCount: 0, 
          esfQ1Score: 0, esfQ1Class: 'Regular', esfQ2Score: 0, esfQ2Class: 'Regular',
          dentalQ1Score: 0, dentalQ1Class: 'Regular', dentalQ2Score: 0, dentalQ2Class: 'Regular',
          territorialQ1Score: 0, territorialQ1Class: 'Regular', territorialQ2Score: 0, territorialQ2Class: 'Regular',
          lastUpdate: '' 
        })));
      } else {
        const sorted = [...filtered].sort((a, b) => PSF_LIST.indexOf(a.psfName) - PSF_LIST.indexOf(b.psfName));
        setRankings(sorted);
      }
    });
    return () => unsub();
  }, []);

  const sortedRanking = useMemo(() => {
    return [...rankings].sort((a, b) => {
      const scoreA = (a.esfQ2Score || 0) + (a.dentalQ2Score || 0) + (a.territorialQ2Score || 0);
      const scoreB = (b.esfQ2Score || 0) + (b.dentalQ2Score || 0) + (b.territorialQ2Score || 0);
      return scoreB - scoreA;
    });
  }, [rankings]);

  // Escala de cores baseada na imagem: Red, Yellow, Green, Blue
  const colorMap: Record<string, { text: string, bg: string }> = {
    'Ótimo': { text: 'text-blue-600', bg: 'bg-blue-600' },
    'Bom': { text: 'text-emerald-600', bg: 'bg-emerald-600' },
    'Suficiente': { text: 'text-amber-500', bg: 'bg-amber-400' },
    'Regular': { text: 'text-rose-600', bg: 'bg-rose-600' },
  };

  const getClass = (score: number): 'Ótimo' | 'Bom' | 'Suficiente' | 'Regular' => {
    if (score > 8.5) return 'Ótimo';
    if (score >= 7.0) return 'Bom';
    if (score >= 5.0) return 'Suficiente';
    return 'Regular';
  };

  const handleSavePSFData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPSFData) return;
    
    const finalData = {
      ...editingPSFData,
      esfQ1Class: getClass(editingPSFData.esfQ1Score || 0),
      esfQ2Class: getClass(editingPSFData.esfQ2Score || 0),
      dentalQ1Class: getClass(editingPSFData.dentalQ1Score || 0),
      dentalQ2Class: getClass(editingPSFData.dentalQ2Score || 0),
      territorialQ1Class: getClass(editingPSFData.territorialQ1Score || 0),
      territorialQ2Class: getClass(editingPSFData.territorialQ2Score || 0)
    };

    await databaseService.updatePSFRanking(editingPSFData.psfName, finalData);
    setSelectedPSFForEdit(null);
    setEditingPSFData(null);
    alert("Dados atualizados!");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12 text-left">
      <header className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monitoramento APS 2025</span>
          </div>
          <h2 className="text-3xl font-black text-emerald-900 uppercase tracking-tighter leading-none">Resultados por Equipe</h2>
        </div>
        
        <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full md:w-auto overflow-x-auto no-scrollbar">
          <button onClick={() => setActiveSubTab('vinculo-territorial')} className={`whitespace-nowrap px-5 py-2.5 rounded-xl text-[9px] font-black uppercase transition-all ${activeSubTab === 'vinculo-territorial' ? 'bg-blue-900 shadow-lg text-white' : 'text-slate-400'}`}>Vínculo Territorial</button>
          <button onClick={() => setActiveSubTab('ranking')} className={`whitespace-nowrap px-5 py-2.5 rounded-xl text-[9px] font-black uppercase transition-all ${activeSubTab === 'ranking' ? 'bg-emerald-900 shadow-lg text-white' : 'text-slate-400'}`}>Ranking 360</button>
          <button onClick={() => setActiveSubTab('qualidade-esf')} className={`whitespace-nowrap px-5 py-2.5 rounded-xl text-[9px] font-black uppercase transition-all ${activeSubTab === 'qualidade-esf' ? 'bg-white shadow-sm text-emerald-700' : 'text-slate-400'}`}>Qualidade eSF</button>
          <button onClick={() => setActiveSubTab('qualidade-esb')} className={`whitespace-nowrap px-5 py-2.5 rounded-xl text-[9px] font-black uppercase transition-all ${activeSubTab === 'qualidade-esb' ? 'bg-white shadow-sm text-emerald-700' : 'text-slate-400'}`}>Qualidade eSB</button>
          <button onClick={() => setActiveSubTab('populacao')} className={`whitespace-nowrap px-5 py-2.5 rounded-xl text-[9px] font-black uppercase transition-all ${activeSubTab === 'populacao' ? 'bg-white shadow-sm text-emerald-700' : 'text-slate-400'}`}>População</button>
        </div>
      </header>

      {/* ABA: VÍNCULO E ACOMPANHAMENTO TERRITORIAL */}
      {activeSubTab === 'vinculo-territorial' && (
        <div className="space-y-8 animate-in slide-in-from-bottom">
           <div className="bg-white p-6 md:p-10 rounded-[3.5rem] border border-slate-100 shadow-xl relative overflow-hidden">
              <div className="text-center mb-10">
                 <div className="inline-flex items-center gap-4 bg-blue-50 px-8 py-3 rounded-full border border-blue-100 mb-2">
                    <img src="https://investsuspaineis.saude.gov.br/extensions/CGIN_InvestsusPaineis/img/saude-brasil-logo.png" className="h-6" alt="Saúde Brasil" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    <h3 className="text-xl md:text-2xl font-black text-blue-800 uppercase tracking-tighter">Vínculo e acompanhamento Territorial</h3>
                 </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1 overflow-x-auto bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="bg-slate-50/50">
                          <th rowSpan={2} className="px-6 py-10 text-center border-r border-slate-100 text-blue-800 font-black text-lg uppercase tracking-tighter min-w-[200px]">Equipe</th>
                          <th colSpan={2} className="px-4 py-4 text-center text-blue-800 font-black text-xl border-b border-r border-slate-100 uppercase tracking-tighter">Q1/25</th>
                          <th rowSpan={2} className="px-4 py-4 text-center text-blue-800 font-black text-[9px] uppercase border-r border-slate-100 leading-tight">Comparação<br/>entre<br/>quadrimestres</th>
                          <th colSpan={2} className="px-4 py-4 text-center text-blue-800 font-black text-xl border-b border-slate-100 uppercase tracking-tighter">Q2/25</th>
                       </tr>
                       <tr className="bg-slate-50/80 text-[10px] font-black text-blue-800 uppercase tracking-widest text-center border-b border-slate-100">
                          <th className="px-4 py-6 border-r border-slate-100">Nota final</th>
                          <th className="px-4 py-6 border-r border-slate-100">Classificação Final</th>
                          <th className="px-4 py-6 border-r border-slate-100">Nota final</th>
                          <th className="px-4 py-6">Classificação Final</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {rankings.map((row, idx) => {
                         const q1S = row.territorialQ1Score ?? 0;
                         const q2S = row.territorialQ2Score ?? 0;
                         const q1C = row.territorialQ1Class ?? 'Regular';
                         const q2C = row.territorialQ2Class ?? 'Regular';
                         return (
                           <tr key={idx} className="hover:bg-slate-50/30 transition-all group">
                              <td className="px-6 py-8 font-black text-slate-800 text-[11px] uppercase border-r border-slate-100 leading-tight">
                                {row.psfName}
                                {isAdmin && <button onClick={() => { setEditingPSFData(row); setSelectedPSFForEdit(row.psfName); }} className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600">✏️</button>}
                              </td>
                              <td className="px-4 py-8 text-center font-black text-slate-800 text-xl border-r border-slate-100">{q1S.toString().replace('.', ',')}</td>
                              <td className={`px-4 py-8 text-center font-black text-[12px] uppercase tracking-tighter border-r border-slate-100 ${colorMap[q1C]?.text || 'text-slate-400'}`}>{q1C.toUpperCase()}</td>
                              <td className="px-4 py-8 text-center font-black border-r border-slate-100">
                                <div className="w-6 h-6 bg-slate-900 text-white rounded flex items-center justify-center mx-auto text-[10px]">✓</div>
                              </td>
                              <td className="px-4 py-8 text-center font-black text-slate-800 text-xl border-r border-slate-100">{q2S.toString().replace('.', ',')}</td>
                              <td className={`px-4 py-8 text-center font-black text-[12px] uppercase tracking-tighter ${colorMap[q2C]?.text || 'text-slate-400'}`}>{q2C.toUpperCase()}</td>
                           </tr>
                         );
                       })}
                    </tbody>
                  </table>
                </div>
                {/* Legenda Lateral */}
                <div className="w-full lg:w-64 shrink-0">
                  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
                    <h4 className="text-[11px] font-black text-blue-800 uppercase text-center mb-6 tracking-widest border-b pb-2">Legenda</h4>
                    {['Ótimo', 'Bom', 'Suficiente', 'Regular'].map(c => (
                      <div key={c} className="flex flex-col">
                        <div className={`h-2 w-full rounded-t-lg ${colorMap[c].bg}`}></div>
                        <div className="p-3 bg-slate-50 border-x border-b border-slate-100 flex justify-between items-center rounded-b-xl">
                          <p className={`font-black text-[9px] uppercase ${colorMap[c].text}`}>{c}</p>
                          <p className="text-slate-400 font-black text-[10px]">{c === 'Ótimo' ? '> 8,5' : c === 'Bom' ? '7 a 8,5' : c === 'Suficiente' ? '5 a 6,9' : '< 5'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
           </div>
        </div>
      )}

      {/* ABAS: QUALIDADE eSF / QUALIDADE eSB (RESTAURADAS) */}
      {(activeSubTab === 'qualidade-esf' || activeSubTab === 'qualidade-esb') && (
        <div className="space-y-8 animate-in slide-in-from-bottom">
           <div className={`bg-white p-6 md:p-10 rounded-[3.5rem] border border-slate-100 shadow-xl relative overflow-hidden`}>
              <div className="text-center mb-10">
                 <h3 className={`px-8 py-3 rounded-full inline-block text-xl font-black uppercase tracking-tighter border ${activeSubTab === 'qualidade-esf' ? 'bg-blue-50 text-blue-800 border-blue-100' : 'bg-emerald-50 text-emerald-800 border-emerald-100'}`}>
                    Componente de Qualidade <span className="opacity-70">({activeSubTab === 'qualidade-esf' ? 'eSF' : 'eSB'})</span>
                 </h3>
              </div>
              <div className="overflow-x-auto bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-slate-50/50">
                        <th rowSpan={2} className="px-6 py-10 text-center border-r border-slate-100 text-slate-800 font-black text-lg uppercase tracking-tighter min-w-[200px]">Equipe</th>
                        <th colSpan={2} className="px-4 py-4 text-center text-slate-800 font-black text-xl border-b border-r border-slate-100 uppercase tracking-tighter">Q1/25</th>
                        <th rowSpan={2} className="px-4 py-4 text-center text-slate-800 font-black text-[9px] uppercase border-r border-slate-100 leading-tight">Tendência</th>
                        <th colSpan={2} className="px-4 py-4 text-center text-slate-800 font-black text-xl border-b border-slate-100 uppercase tracking-tighter">Q2/25</th>
                     </tr>
                     <tr className="bg-slate-50/80 text-[10px] font-black text-slate-800 uppercase tracking-widest text-center border-b border-slate-100">
                        <th className="px-4 py-6 border-r border-slate-100">Nota final</th>
                        <th className="px-4 py-6 border-r border-slate-100">Classificação</th>
                        <th className="px-4 py-6 border-r border-slate-100">Nota final</th>
                        <th className="px-4 py-6">Classificação</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rankings.map((row, idx) => {
                      const q1S = activeSubTab === 'qualidade-esf' ? (row.esfQ1Score ?? 0) : (row.dentalQ1Score ?? 0);
                      const q2S = activeSubTab === 'qualidade-esf' ? (row.esfQ2Score ?? 0) : (row.dentalQ2Score ?? 0);
                      const q1C = activeSubTab === 'qualidade-esf' ? (row.esfQ1Class ?? 'Regular') : (row.dentalQ1Class ?? 'Regular');
                      const q2C = activeSubTab === 'qualidade-esf' ? (row.esfQ2Class ?? 'Regular') : (row.dentalQ2Class ?? 'Regular');
                      const trend = q2S > q1S ? '↑' : q2S < q1S ? '↓' : '•';
                      const trendColor = trend === '↑' ? 'text-emerald-500' : trend === '↓' ? 'text-rose-500' : 'text-slate-300';
                      return (
                        <tr key={idx} className="hover:bg-slate-50/30 transition-all group">
                          <td className="px-6 py-8 font-black text-slate-800 text-[11px] uppercase border-r border-slate-100">{row.psfName}</td>
                          <td className="px-4 py-8 text-center font-black text-slate-800 text-xl border-r border-slate-100">{q1S.toString().replace('.', ',')}</td>
                          <td className={`px-4 py-8 text-center font-black text-[12px] uppercase border-r border-slate-100 ${colorMap[q1C]?.text || 'text-slate-400'}`}>{q1C.toUpperCase()}</td>
                          <td className={`px-4 py-8 text-center font-black text-3xl border-r border-slate-100 ${trendColor}`}>{trend}</td>
                          <td className="px-4 py-8 text-center font-black text-slate-800 text-xl border-r border-slate-100">{q2S.toString().replace('.', ',')}</td>
                          <td className={`px-4 py-8 text-center font-black text-[12px] uppercase ${colorMap[q2C]?.text || 'text-slate-400'}`}>{q2C.toUpperCase()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
           </div>
        </div>
      )}

      {/* ABA: RANKING GERAL */}
      {activeSubTab === 'ranking' && (
        <div className="space-y-8 animate-in slide-in-from-bottom">
           <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-[0.03] text-9xl font-black pointer-events-none">🏆</div>
              <div className="text-center mb-12">
                 <h3 className="text-3xl font-black text-emerald-900 uppercase tracking-tighter mb-2">Placar Global</h3>
                 <p className="text-slate-400 text-xs font-black uppercase tracking-[0.3em]">Consolidado Q2/2025 (Soma de todos os componentes)</p>
              </div>
              <div className="space-y-4">
                 {sortedRanking.map((row, idx) => {
                   const totalScore = (row.esfQ2Score || 0) + (row.dentalQ2Score || 0) + (row.territorialQ2Score || 0);
                   const isTop3 = idx < 3;
                   const medals = ['🥇', '🥈', '🥉'];
                   return (
                     <div key={idx} className={`flex items-center gap-4 p-6 rounded-[2rem] border transition-all ${isTop3 ? 'bg-emerald-50/50 border-emerald-100 shadow-md scale-[1.02]' : 'bg-slate-50 border-slate-100 opacity-80'}`}>
                        <div className="w-12 h-12 flex items-center justify-center text-2xl bg-white rounded-2xl shadow-sm border border-slate-100 font-black text-emerald-900">{isTop3 ? medals[idx] : idx + 1}</div>
                        <div className="flex-1">
                           <h4 className="font-black text-slate-800 uppercase text-xs md:text-sm">{row.psfName}</h4>
                           <div className="flex gap-4 mt-2">
                              <div className="flex items-center gap-1.5"><span className="text-[8px] font-black text-slate-400 uppercase">SF:</span><span className="text-[10px] font-black text-blue-600">{(row.esfQ2Score || 0).toString().replace('.', ',')}</span></div>
                              <div className="flex items-center gap-1.5"><span className="text-[8px] font-black text-slate-400 uppercase">Territorial:</span><span className="text-[10px] font-black text-blue-600">{(row.territorialQ2Score || 0).toString().replace('.', ',')}</span></div>
                              <div className="flex items-center gap-1.5"><span className="text-[8px] font-black text-slate-400 uppercase">Bucal:</span><span className="text-[10px] font-black text-emerald-600">{(row.dentalQ2Score || 0).toString().replace('.', ',')}</span></div>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">Score Geral</p>
                           <p className="text-2xl font-black text-emerald-900 tracking-tighter">{totalScore.toFixed(2).replace('.', ',')}</p>
                        </div>
                     </div>
                   );
                 })}
              </div>
           </div>
        </div>
      )}

      {/* ABA: POPULAÇÃO */}
      {activeSubTab === 'populacao' && (
        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl text-center animate-in slide-in-from-bottom">
          <h3 className="text-xl md:text-2xl font-black text-blue-800 uppercase tracking-tight mb-8">TOTAL DE PESSOAS VINCULADAS NO SIAPS</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b-2 border-slate-100">
                <tr className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                  <th className="px-6 py-6">Estabelecimento</th>
                  <th className="px-6 py-6 text-center text-blue-600">e-SUS 01-2026</th>
                  <th className="px-6 py-6 text-center text-emerald-600">SIAPS 11-2025</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {rankings.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-all">
                    <td className="px-6 py-6 font-black text-slate-800 text-sm uppercase">{row.psfName}</td>
                    <td className="px-6 py-6 text-center text-blue-700 font-black text-lg">{(row.eSusCount || 0).toLocaleString('pt-BR')}</td>
                    <td className="px-6 py-6 text-center text-emerald-700 font-black text-lg">{(row.siapsCount || 0).toLocaleString('pt-BR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL EDIÇÃO */}
      {selectedPSFForEdit && editingPSFData && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-[300] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3.5rem] p-10 w-full max-w-xl shadow-2xl animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-black text-blue-900 uppercase tracking-tighter mb-8 text-center">{selectedPSFForEdit}</h3>
            <form onSubmit={handleSavePSFData} className="space-y-6">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[9px] font-black text-blue-600 uppercase mb-4">Notas do Q2/25</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[8px] font-black text-slate-400 uppercase">Qualidade eSF</label>
                    <input type="number" step="0.01" className="w-full p-3 border-2 rounded-xl mb-2" value={editingPSFData.esfQ2Score || 0} onChange={e => setEditingPSFData({...editingPSFData, esfQ2Score: parseFloat(e.target.value)})} />
                  </div>
                  <div>
                    <label className="text-[8px] font-black text-slate-400 uppercase">Qualidade eSB</label>
                    <input type="number" step="0.01" className="w-full p-3 border-2 rounded-xl mb-2" value={editingPSFData.dentalQ2Score || 0} onChange={e => setEditingPSFData({...editingPSFData, dentalQ2Score: parseFloat(e.target.value)})} />
                  </div>
                  <div>
                    <label className="text-[8px] font-black text-slate-400 uppercase">Territorial</label>
                    <input type="number" step="0.01" className="w-full p-3 border-2 rounded-xl" value={editingPSFData.territorialQ2Score || 0} onChange={e => setEditingPSFData({...editingPSFData, territorialQ2Score: parseFloat(e.target.value)})} />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3 pt-4">
                <button type="submit" className="w-full bg-blue-900 text-white py-5 rounded-2xl font-black uppercase text-[11px] shadow-xl">Salvar Notas</button>
                <button type="button" onClick={() => setSelectedPSFForEdit(null)} className="w-full text-slate-400 font-bold uppercase text-[9px] py-2">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IndicatorsSection;
