
import React, { useState, useEffect, useMemo } from 'react';
import { APSIndicator, DentalIndicator, PSFRankingData, PSF_LIST, SystemConfig } from '../types';
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
  const [config, setConfig] = useState<SystemConfig>({ q1Label: 'Q1/25', q2Label: 'Q2/25', q3Label: 'Q3/25' });
  const [selectedPSFForEdit, setSelectedPSFForEdit] = useState<string | null>(null);
  const [editingPSFData, setEditingPSFData] = useState<PSFRankingData | null>(null);

  useEffect(() => {
    const unsubConfig = databaseService.subscribeSystemConfig(setConfig);
    const unsubRankings = databaseService.subscribePSFRankings((data) => {
      const filtered = data.filter(d => PSF_LIST.includes(d.psfName));
      if (filtered.length === 0) {
        setRankings(PSF_LIST.map(p => ({ 
          psfName: p, eSusCount: 0, siapsCount: 0, 
          esfQ1Score: 0, esfQ1Class: 'Regular', esfQ2Score: 0, esfQ2Class: 'Regular', esfQ3Score: 0, esfQ3Class: 'Regular',
          dentalQ1Score: 0, dentalQ1Class: 'Regular', dentalQ2Score: 0, dentalQ2Class: 'Regular', dentalQ3Score: 0, dentalQ3Class: 'Regular',
          territorialQ1Score: 0, territorialQ1Class: 'Regular', territorialQ2Score: 0, territorialQ2Class: 'Regular', territorialQ3Score: 0, territorialQ3Class: 'Regular',
          lastUpdate: '' 
        })));
      } else {
        const sorted = [...filtered].sort((a, b) => PSF_LIST.indexOf(a.psfName) - PSF_LIST.indexOf(b.psfName));
        setRankings(sorted);
      }
    });
    return () => { unsubConfig(); unsubRankings(); };
  }, []);

  const sortedRanking = useMemo(() => {
    return [...rankings].sort((a, b) => {
      const scoreA = (a.esfQ3Score || a.esfQ2Score || 0) + (a.dentalQ3Score || a.dentalQ2Score || 0) + (a.territorialQ3Score || a.territorialQ2Score || 0);
      const scoreB = (b.esfQ3Score || b.esfQ2Score || 0) + (b.dentalQ3Score || b.dentalQ2Score || 0) + (b.territorialQ3Score || b.territorialQ2Score || 0);
      return scoreB - scoreA;
    });
  }, [rankings]);

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
      esfQ3Class: getClass(editingPSFData.esfQ3Score || 0),
      dentalQ1Class: getClass(editingPSFData.dentalQ1Score || 0),
      dentalQ2Class: getClass(editingPSFData.dentalQ2Score || 0),
      dentalQ3Class: getClass(editingPSFData.dentalQ3Score || 0),
      territorialQ1Class: getClass(editingPSFData.territorialQ1Score || 0),
      territorialQ2Class: getClass(editingPSFData.territorialQ2Score || 0),
      territorialQ3Class: getClass(editingPSFData.territorialQ3Score || 0)
    };
    await databaseService.updatePSFRanking(editingPSFData.psfName, finalData);
    setSelectedPSFForEdit(null);
    setEditingPSFData(null);
    alert("Dados atualizados com sucesso!");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12 text-left">
      <header className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monitoramento Profissional</span>
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
                          <th colSpan={2} className="px-4 py-4 text-center text-blue-800 font-black text-xl border-b border-r border-slate-100 uppercase tracking-tighter">{config.q1Label}</th>
                          <th colSpan={2} className="px-4 py-4 text-center text-blue-800 font-black text-xl border-b border-r border-slate-100 uppercase tracking-tighter">{config.q2Label}</th>
                          <th colSpan={2} className="px-4 py-4 text-center text-blue-800 font-black text-xl border-b border-slate-100 uppercase tracking-tighter">{config.q3Label}</th>
                       </tr>
                       <tr className="bg-slate-50/80 text-[10px] font-black text-blue-800 uppercase tracking-widest text-center border-b border-slate-100">
                          <th className="px-4 py-6 border-r border-slate-100">Nota</th>
                          <th className="px-4 py-6 border-r border-slate-100">Classe</th>
                          <th className="px-4 py-6 border-r border-slate-100">Nota</th>
                          <th className="px-4 py-6 border-r border-slate-100">Classe</th>
                          <th className="px-4 py-6 border-r border-slate-100">Nota</th>
                          <th className="px-4 py-6">Classe</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {rankings.map((row, idx) => (
                           <tr key={idx} className="hover:bg-slate-50/30 transition-all group">
                              <td className="px-6 py-8 font-black text-slate-800 text-[11px] uppercase border-r border-slate-100 leading-tight">
                                {row.psfName}
                                {isAdmin && <button onClick={() => { setEditingPSFData(row); setSelectedPSFForEdit(row.psfName); }} className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600">✏️</button>}
                              </td>
                              <td className="px-4 py-8 text-center font-black text-slate-800 text-xl border-r border-slate-100">{(row.territorialQ1Score ?? 0).toString().replace('.', ',')}</td>
                              <td className={`px-4 py-8 text-center font-black text-[10px] uppercase border-r border-slate-100 ${colorMap[row.territorialQ1Class || 'Regular']?.text}`}>{row.territorialQ1Class}</td>
                              <td className="px-4 py-8 text-center font-black text-slate-800 text-xl border-r border-slate-100">{(row.territorialQ2Score ?? 0).toString().replace('.', ',')}</td>
                              <td className={`px-4 py-8 text-center font-black text-[10px] uppercase border-r border-slate-100 ${colorMap[row.territorialQ2Class || 'Regular']?.text}`}>{row.territorialQ2Class}</td>
                              <td className="px-4 py-8 text-center font-black text-slate-800 text-xl border-r border-slate-100">{(row.territorialQ3Score ?? 0).toString().replace('.', ',')}</td>
                              <td className={`px-4 py-8 text-center font-black text-[10px] uppercase ${colorMap[row.territorialQ3Class || 'Regular']?.text}`}>{row.territorialQ3Class}</td>
                           </tr>
                       ))}
                    </tbody>
                  </table>
                </div>
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
                        <th colSpan={2} className="px-4 py-4 text-center text-slate-800 font-black text-xl border-b border-r border-slate-100 uppercase tracking-tighter">{config.q1Label}</th>
                        <th colSpan={2} className="px-4 py-4 text-center text-slate-800 font-black text-xl border-b border-r border-slate-100 uppercase tracking-tighter">{config.q2Label}</th>
                        <th colSpan={2} className="px-4 py-4 text-center text-slate-800 font-black text-xl border-b border-slate-100 uppercase tracking-tighter">{config.q3Label}</th>
                     </tr>
                     <tr className="bg-slate-50/80 text-[10px] font-black text-slate-800 uppercase tracking-widest text-center border-b border-slate-100">
                        <th className="px-4 py-6 border-r border-slate-100">Nota</th>
                        <th className="px-4 py-6 border-r border-slate-100">Classe</th>
                        <th className="px-4 py-6 border-r border-slate-100">Nota</th>
                        <th className="px-4 py-6 border-r border-slate-100">Classe</th>
                        <th className="px-4 py-6 border-r border-slate-100">Nota</th>
                        <th className="px-4 py-6">Classe</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rankings.map((row, idx) => {
                      const q1S = activeSubTab === 'qualidade-esf' ? (row.esfQ1Score ?? 0) : (row.dentalQ1Score ?? 0);
                      const q2S = activeSubTab === 'qualidade-esf' ? (row.esfQ2Score ?? 0) : (row.dentalQ2Score ?? 0);
                      const q3S = activeSubTab === 'qualidade-esf' ? (row.esfQ3Score ?? 0) : (row.dentalQ3Score ?? 0);
                      const q1C = activeSubTab === 'qualidade-esf' ? (row.esfQ1Class ?? 'Regular') : (row.dentalQ1Class ?? 'Regular');
                      const q2C = activeSubTab === 'qualidade-esf' ? (row.esfQ2Class ?? 'Regular') : (row.dentalQ2Class ?? 'Regular');
                      const q3C = activeSubTab === 'qualidade-esf' ? (row.esfQ3Class ?? 'Regular') : (row.dentalQ3Class ?? 'Regular');
                      return (
                        <tr key={idx} className="hover:bg-slate-50/30 transition-all group">
                          <td className="px-6 py-8 font-black text-slate-800 text-[11px] uppercase border-r border-slate-100">
                            {row.psfName}
                            {isAdmin && <button onClick={() => { setEditingPSFData(row); setSelectedPSFForEdit(row.psfName); }} className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-600">✏️</button>}
                          </td>
                          <td className="px-4 py-8 text-center font-black text-slate-800 text-xl border-r border-slate-100">{q1S.toString().replace('.', ',')}</td>
                          <td className={`px-4 py-8 text-center font-black text-[10px] uppercase border-r border-slate-100 ${colorMap[q1C]?.text}`}>{q1C}</td>
                          <td className="px-4 py-8 text-center font-black text-slate-800 text-xl border-r border-slate-100">{q2S.toString().replace('.', ',')}</td>
                          <td className={`px-4 py-8 text-center font-black text-[10px] uppercase border-r border-slate-100 ${colorMap[q2C]?.text}`}>{q2C}</td>
                          <td className="px-4 py-8 text-center font-black text-slate-800 text-xl border-r border-slate-100">{q3S.toString().replace('.', ',')}</td>
                          <td className={`px-4 py-8 text-center font-black text-[10px] uppercase ${colorMap[q3C]?.text}`}>{q3C}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
           </div>
        </div>
      )}

      {activeSubTab === 'ranking' && (
        <div className="space-y-8 animate-in slide-in-from-bottom">
           <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-[0.03] text-9xl font-black pointer-events-none">🏆</div>
              <div className="text-center mb-12">
                 <h3 className="text-3xl font-black text-emerald-900 uppercase tracking-tighter mb-2">Placar Global</h3>
                 <p className="text-slate-400 text-xs font-black uppercase tracking-[0.3em]">Consolidado {config.q3Label} (Melhor Score)</p>
              </div>
              <div className="space-y-4">
                 {sortedRanking.map((row, idx) => {
                   const totalScore = (row.esfQ3Score || row.esfQ2Score || 0) + (row.dentalQ3Score || row.dentalQ2Score || 0) + (row.territorialQ3Score || row.territorialQ2Score || 0);
                   const isTop3 = idx < 3;
                   const medals = ['🥇', '🥈', '🥉'];
                   return (
                     <div key={idx} className={`flex items-center gap-4 p-6 rounded-[2rem] border transition-all ${isTop3 ? 'bg-emerald-50/50 border-emerald-100 shadow-md scale-[1.02]' : 'bg-slate-50 border-slate-100 opacity-80'}`}>
                        <div className="w-12 h-12 flex items-center justify-center text-2xl bg-white rounded-2xl shadow-sm border border-slate-100 font-black text-emerald-900">{isTop3 ? medals[idx] : idx + 1}</div>
                        <div className="flex-1">
                           <h4 className="font-black text-slate-800 uppercase text-xs md:text-sm">{row.psfName}</h4>
                           <div className="flex gap-4 mt-2">
                              <div className="flex items-center gap-1.5"><span className="text-[8px] font-black text-slate-400 uppercase">SF:</span><span className="text-[10px] font-black text-blue-600">{(row.esfQ3Score || row.esfQ2Score || 0).toString().replace('.', ',')}</span></div>
                              <div className="flex items-center gap-1.5"><span className="text-[8px] font-black text-slate-400 uppercase">Territorial:</span><span className="text-[10px] font-black text-blue-600">{(row.territorialQ3Score || row.territorialQ2Score || 0).toString().replace('.', ',')}</span></div>
                              <div className="flex items-center gap-1.5"><span className="text-[8px] font-black text-slate-400 uppercase">Bucal:</span><span className="text-[10px] font-black text-emerald-600">{(row.dentalQ3Score || row.dentalQ2Score || 0).toString().replace('.', ',')}</span></div>
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

      {activeSubTab === 'populacao' && (
        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl text-center animate-in slide-in-from-bottom">
          <h3 className="text-xl md:text-2xl font-black text-blue-800 uppercase tracking-tight mb-8">TOTAL DE PESSOAS VINCULADAS NO SIAPS</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b-2 border-slate-100">
                <tr className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                  <th className="px-6 py-6">Estabelecimento</th>
                  <th className="px-6 py-6 text-center text-blue-600">e-SUS Atual</th>
                  <th className="px-6 py-6 text-center text-emerald-600">SIAPS Consolidado</th>
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

      {selectedPSFForEdit && editingPSFData && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-[300] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3.5rem] p-8 md:p-10 w-full max-w-2xl shadow-2xl animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-blue-900 uppercase tracking-tighter">{selectedPSFForEdit}</h3>
              <button onClick={() => setSelectedPSFForEdit(null)} className="text-slate-300 text-2xl">✕</button>
            </div>
            
            <form onSubmit={handleSavePSFData} className="space-y-6">
              <div className="space-y-6">
                <div className="p-5 bg-blue-50/50 rounded-3xl border border-blue-100">
                  <p className="text-[10px] font-black text-blue-800 uppercase mb-4 tracking-widest">Componente de Qualidade (eSF)</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[8px] font-black text-slate-400 uppercase">{config.q1Label}</label>
                      <input type="number" step="0.01" className="w-full p-3 border-2 rounded-xl" value={editingPSFData.esfQ1Score || 0} onChange={e => setEditingPSFData({...editingPSFData, esfQ1Score: parseFloat(e.target.value)})} />
                    </div>
                    <div>
                      <label className="text-[8px] font-black text-slate-400 uppercase">{config.q2Label}</label>
                      <input type="number" step="0.01" className="w-full p-3 border-2 rounded-xl" value={editingPSFData.esfQ2Score || 0} onChange={e => setEditingPSFData({...editingPSFData, esfQ2Score: parseFloat(e.target.value)})} />
                    </div>
                    <div className="bg-blue-100/50 p-2 rounded-xl">
                      <label className="text-[8px] font-black text-blue-600 uppercase">{config.q3Label}</label>
                      <input type="number" step="0.01" className="w-full p-3 border-2 border-blue-200 rounded-xl font-black" value={editingPSFData.esfQ3Score || 0} onChange={e => setEditingPSFData({...editingPSFData, esfQ3Score: parseFloat(e.target.value)})} />
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-emerald-50/50 rounded-3xl border border-emerald-100">
                  <p className="text-[10px] font-black text-emerald-800 uppercase mb-4 tracking-widest">Componente de Qualidade (eSB)</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[8px] font-black text-slate-400 uppercase">{config.q1Label}</label>
                      <input type="number" step="0.01" className="w-full p-3 border-2 rounded-xl" value={editingPSFData.dentalQ1Score || 0} onChange={e => setEditingPSFData({...editingPSFData, dentalQ1Score: parseFloat(e.target.value)})} />
                    </div>
                    <div>
                      <label className="text-[8px] font-black text-slate-400 uppercase">{config.q2Label}</label>
                      <input type="number" step="0.01" className="w-full p-3 border-2 rounded-xl" value={editingPSFData.dentalQ2Score || 0} onChange={e => setEditingPSFData({...editingPSFData, dentalQ2Score: parseFloat(e.target.value)})} />
                    </div>
                    <div className="bg-emerald-100/50 p-2 rounded-xl">
                      <label className="text-[8px] font-black text-emerald-600 uppercase">{config.q3Label}</label>
                      <input type="number" step="0.01" className="w-full p-3 border-2 border-emerald-200 rounded-xl font-black" value={editingPSFData.dentalQ3Score || 0} onChange={e => setEditingPSFData({...editingPSFData, dentalQ3Score: parseFloat(e.target.value)})} />
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-indigo-50/50 rounded-3xl border border-indigo-100">
                  <p className="text-[10px] font-black text-indigo-800 uppercase mb-4 tracking-widest">Vínculo Territorial</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[8px] font-black text-slate-400 uppercase">{config.q1Label}</label>
                      <input type="number" step="0.01" className="w-full p-3 border-2 rounded-xl" value={editingPSFData.territorialQ1Score || 0} onChange={e => setEditingPSFData({...editingPSFData, territorialQ1Score: parseFloat(e.target.value)})} />
                    </div>
                    <div>
                      <label className="text-[8px] font-black text-slate-400 uppercase">{config.q2Label}</label>
                      <input type="number" step="0.01" className="w-full p-3 border-2 rounded-xl" value={editingPSFData.territorialQ2Score || 0} onChange={e => setEditingPSFData({...editingPSFData, territorialQ2Score: parseFloat(e.target.value)})} />
                    </div>
                    <div className="bg-indigo-100/50 p-2 rounded-xl">
                      <label className="text-[8px] font-black text-indigo-600 uppercase">{config.q3Label}</label>
                      <input type="number" step="0.01" className="w-full p-3 border-2 border-indigo-200 rounded-xl font-black" value={editingPSFData.territorialQ3Score || 0} onChange={e => setEditingPSFData({...editingPSFData, territorialQ3Score: parseFloat(e.target.value)})} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3 pt-4">
                <button type="submit" className="w-full bg-emerald-900 text-white py-5 rounded-2xl font-black uppercase text-[11px] shadow-xl hover:bg-black transition-all">Salvar Dados do PSF</button>
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