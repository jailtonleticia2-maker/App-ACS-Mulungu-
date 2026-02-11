
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
  const [activeSubTab, setActiveSubTab] = useState<'populacao' | 'qualidade-esf' | 'qualidade-esb'>('populacao');
  
  const [rankings, setRankings] = useState<PSFRankingData[]>([]);
  const [selectedPSFForEdit, setSelectedPSFForEdit] = useState<string | null>(null);
  const [editingPSFData, setEditingPSFData] = useState<PSFRankingData | null>(null);

  useEffect(() => {
    const unsub = databaseService.subscribePSFRankings((data) => {
      // FILTRO RIGOROSO: Só permite equipes que estejam na PSF_LIST
      const filtered = data.filter(d => PSF_LIST.includes(d.psfName));
      
      if (filtered.length === 0) {
        setRankings(PSF_LIST.map(p => ({ 
          psfName: p, 
          eSusCount: 0, siapsCount: 0, 
          esfQ1Score: 0, esfQ1Class: 'Regular', esfQ2Score: 0, esfQ2Class: 'Regular',
          dentalQ1Score: 0, dentalQ1Class: 'Regular', dentalQ2Score: 0, dentalQ2Class: 'Regular',
          lastUpdate: '' 
        })));
      } else {
        // Ordenar conforme a lista padrão
        const sorted = [...filtered].sort((a, b) => PSF_LIST.indexOf(a.psfName) - PSF_LIST.indexOf(b.psfName));
        setRankings(sorted);
      }
    });
    return () => unsub();
  }, []);

  const totals = useMemo(() => {
    return rankings.reduce((acc, curr) => ({
      eSus: acc.eSus + (curr.eSusCount || 0),
      siaps: acc.siaps + (curr.siapsCount || 0)
    }), { eSus: 0, siaps: 0 });
  }, [rankings]);

  // Escala de cores conforme imagem oficial
  const colorMap: Record<string, { text: string, bg: string }> = {
    'Ótimo': { text: 'text-blue-600', bg: 'bg-blue-600' },
    'Bom': { text: 'text-green-600', bg: 'bg-green-600' },
    'Suficiente': { text: 'text-yellow-500', bg: 'bg-yellow-400' },
    'Regular': { text: 'text-red-600', bg: 'bg-red-600' },
  };

  const getClass = (score: number): 'Ótimo' | 'Bom' | 'Suficiente' | 'Regular' => {
    if (score > 7.5) return 'Ótimo';
    if (score >= 5.0) return 'Bom';
    if (score >= 2.6) return 'Suficiente';
    return 'Regular';
  };

  const handleSavePSFData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPSFData) return;
    
    const finalData = {
      ...editingPSFData,
      esfQ1Class: getClass(editingPSFData.esfQ1Score),
      esfQ2Class: getClass(editingPSFData.esfQ2Score),
      dentalQ1Class: getClass(editingPSFData.dentalQ1Score),
      dentalQ2Class: getClass(editingPSFData.dentalQ2Score)
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
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monitoramento APS Mulungu 2025</span>
          </div>
          <h2 className="text-3xl font-black text-emerald-900 uppercase tracking-tighter leading-none">Resultados por Equipe</h2>
        </div>
        
        <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full md:w-auto overflow-x-auto no-scrollbar">
          <button onClick={() => setActiveSubTab('populacao')} className={`whitespace-nowrap px-5 py-2.5 rounded-xl text-[9px] font-black uppercase transition-all ${activeSubTab === 'populacao' ? 'bg-white shadow-sm text-emerald-700' : 'text-slate-400'}`}>População SIAPS</button>
          <button onClick={() => setActiveSubTab('qualidade-esf')} className={`whitespace-nowrap px-5 py-2.5 rounded-xl text-[9px] font-black uppercase transition-all ${activeSubTab === 'qualidade-esf' ? 'bg-white shadow-sm text-emerald-700' : 'text-slate-400'}`}>Qualidade eSF</button>
          <button onClick={() => setActiveSubTab('qualidade-esb')} className={`whitespace-nowrap px-5 py-2.5 rounded-xl text-[9px] font-black uppercase transition-all ${activeSubTab === 'qualidade-esb' ? 'bg-white shadow-sm text-emerald-700' : 'text-slate-400'}`}>Qualidade eSB</button>
        </div>
      </header>

      {/* ABA 1: POPULAÇÃO */}
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

      {/* TABELAS DE QUALIDADE (eSF / eSB) */}
      {(activeSubTab === 'qualidade-esf' || activeSubTab === 'qualidade-esb') && (
        <div className="space-y-8 animate-in slide-in-from-bottom">
           <div className={`p-8 rounded-[3.5rem] border shadow-xl relative overflow-hidden ${activeSubTab === 'qualidade-esf' ? 'bg-blue-50/50 border-blue-100' : 'bg-emerald-50/50 border-emerald-100'}`}>
              <div className="text-center mb-10">
                 <h3 className={`px-10 py-4 rounded-full inline-block text-xl md:text-2xl font-black uppercase tracking-tight shadow-sm border ${activeSubTab === 'qualidade-esf' ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-emerald-100 text-emerald-800 border-emerald-200'}`}>
                    Resultados do componente de qualidade <span className="opacity-70">({activeSubTab === 'qualidade-esf' ? 'Equipes de Saúde da Família' : 'Equipes de Saúde Bucal'})</span>
                 </h3>
              </div>

              <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1 overflow-x-auto bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="bg-slate-50/50">
                          <th rowSpan={2} className="px-6 py-10 text-center border-r border-slate-100 text-blue-800 font-black text-lg uppercase tracking-tighter">Equipe</th>
                          <th colSpan={2} className="px-4 py-4 text-center text-blue-800 font-black text-xl border-b border-r border-slate-100 uppercase tracking-tighter">Q1/25</th>
                          <th rowSpan={2} className="px-4 py-4 text-center text-blue-800 font-black text-[9px] uppercase border-r border-slate-100 leading-tight">Comparação<br/>entre<br/>quadrimestres</th>
                          <th colSpan={2} className="px-4 py-4 text-center text-blue-800 font-black text-xl border-b border-slate-100 uppercase tracking-tighter">Q2/25</th>
                       </tr>
                       <tr className="bg-slate-50/80 text-[10px] font-black text-blue-800 uppercase tracking-widest text-center border-b border-slate-100">
                          <th className="px-4 py-6 border-r border-slate-100">Nota final</th>
                          <th className="px-4 py-6 border-r border-slate-100">Classificação</th>
                          <th className="px-4 py-6 border-r border-slate-100">Nota final</th>
                          <th className="px-4 py-6">Classificação</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {rankings.map((row, idx) => {
                         const q1S = activeSubTab === 'qualidade-esf' ? row.esfQ1Score : row.dentalQ1Score;
                         const q2S = activeSubTab === 'qualidade-esf' ? row.esfQ2Score : row.dentalQ2Score;
                         const q1C = activeSubTab === 'qualidade-esf' ? row.esfQ1Class : row.dentalQ1Class;
                         const q2C = activeSubTab === 'qualidade-esf' ? row.esfQ2Class : row.dentalQ2Class;
                         
                         const trend = q2S > q1S ? '↑' : q2S < q1S ? '↓' : '•';
                         const trendColor = trend === '↑' ? 'text-emerald-500' : trend === '↓' ? 'text-rose-500' : 'text-slate-300';

                         return (
                           <tr key={idx} className="hover:bg-slate-50/30 transition-all group">
                              <td className="px-6 py-8 font-black text-slate-800 text-[10px] uppercase border-r border-slate-100 leading-tight">
                                {row.psfName}
                                {isAdmin && <button onClick={() => { setEditingPSFData(row); setSelectedPSFForEdit(row.psfName); }} className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600">✏️</button>}
                              </td>
                              <td className="px-4 py-8 text-center font-black text-slate-700 text-xl border-r border-slate-100">{q1S?.toString().replace('.', ',')}</td>
                              <td className={`px-4 py-8 text-center font-black text-[11px] uppercase tracking-tighter border-r border-slate-100 ${colorMap[q1C || 'Regular'].text}`}>{q1C || 'REGULAR'}</td>
                              <td className={`px-4 py-8 text-center font-black text-3xl border-r border-slate-100 ${trendColor}`}>{trend}</td>
                              <td className="px-4 py-8 text-center font-black text-slate-700 text-xl border-r border-slate-100">{q2S?.toString().replace('.', ',')}</td>
                              <td className={`px-4 py-8 text-center font-black text-[11px] uppercase tracking-tighter ${colorMap[q2C || 'Regular'].text}`}>{q2C || 'REGULAR'}</td>
                           </tr>
                         );
                       })}
                    </tbody>
                  </table>
                </div>

                {/* Legenda Oficial */}
                <div className="w-full lg:w-56 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm shrink-0 flex flex-col justify-between">
                   <h4 className="text-[10px] font-black text-blue-600 uppercase text-center mb-6 tracking-widest border-b pb-2 leading-none">Nota e Classificação</h4>
                   <div className="space-y-4">
                      <div className="flex flex-col">
                        <div className="w-full h-2 bg-red-600 rounded-t-lg"></div>
                        <div className="p-4 bg-slate-50 border-x border-b border-slate-100 flex justify-between items-center">
                          <p className="text-red-600 font-black text-[9px] uppercase">Regular</p>
                          <p className="text-slate-400 font-black text-[11px]">≤ 2,5</p>
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <div className="w-full h-2 bg-yellow-400"></div>
                        <div className="p-4 bg-slate-50 border-x border-b border-slate-100 flex justify-between items-center">
                          <p className="text-yellow-600 font-black text-[9px] uppercase">Suficiente</p>
                          <p className="text-slate-400 font-black text-[11px]">2,6 a 4,9</p>
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <div className="w-full h-2 bg-green-500"></div>
                        <div className="p-4 bg-slate-50 border-x border-b border-slate-100 flex justify-between items-center">
                          <p className="text-green-600 font-black text-[9px] uppercase">Bom</p>
                          <p className="text-slate-400 font-black text-[11px]">5 a 7,5</p>
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <div className="w-full h-2 bg-blue-600 rounded-b-lg"></div>
                        <div className="p-4 bg-slate-50 border-x border-b border-slate-100 rounded-b-xl flex justify-between items-center">
                          <p className="text-blue-600 font-black text-[9px] uppercase">Ótimo</p>
                          <p className="text-slate-400 font-black text-[11px]">&gt; 7,5</p>
                        </div>
                      </div>
                   </div>
                </div>
              </div>

              <div className="mt-12 h-4 w-full flex rounded-full overflow-hidden shadow-inner border border-white/10">
                 <div className="h-full bg-red-600" style={{ width: '25%' }}></div>
                 <div className="h-full bg-green-500" style={{ width: '25%' }}></div>
                 <div className="h-full bg-blue-600" style={{ width: '25%' }}></div>
                 <div className="h-full bg-yellow-400" style={{ width: '25%' }}></div>
              </div>
           </div>
        </div>
      )}

      {/* MODAL EDIÇÃO (ADMIN) */}
      {selectedPSFForEdit && editingPSFData && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-[300] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3.5rem] p-10 w-full max-w-xl shadow-2xl animate-in zoom-in duration-300">
            <h3 className="text-2xl font-black text-blue-900 uppercase tracking-tighter mb-8 text-center">{selectedPSFForEdit}</h3>
            <form onSubmit={handleSavePSFData} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-black text-blue-600 uppercase mb-2">Saúde da Família (eSF)</p>
                  <label className="text-[8px] font-black text-slate-400 uppercase">Q1</label>
                  <input type="number" step="0.01" className="w-full p-3 border-2 rounded-xl mb-2" value={editingPSFData.esfQ1Score} onChange={e => setEditingPSFData({...editingPSFData, esfQ1Score: parseFloat(e.target.value)})} />
                  <label className="text-[8px] font-black text-slate-400 uppercase">Q2</label>
                  <input type="number" step="0.01" className="w-full p-3 border-2 rounded-xl" value={editingPSFData.esfQ2Score} onChange={e => setEditingPSFData({...editingPSFData, esfQ2Score: parseFloat(e.target.value)})} />
                </div>
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <p className="text-[9px] font-black text-emerald-600 uppercase mb-2">Saúde Bucal (eSB)</p>
                  <label className="text-[8px] font-black text-slate-400 uppercase">Q1</label>
                  <input type="number" step="0.01" className="w-full p-3 border-2 rounded-xl mb-2" value={editingPSFData.dentalQ1Score} onChange={e => setEditingPSFData({...editingPSFData, dentalQ1Score: parseFloat(e.target.value)})} />
                  <label className="text-[8px] font-black text-slate-400 uppercase">Q2</label>
                  <input type="number" step="0.01" className="w-full p-3 border-2 rounded-xl" value={editingPSFData.dentalQ2Score} onChange={e => setEditingPSFData({...editingPSFData, dentalQ2Score: parseFloat(e.target.value)})} />
                </div>
              </div>
              <div className="flex flex-col gap-3 pt-4">
                <button type="submit" className="w-full bg-blue-900 text-white py-5 rounded-2xl font-black uppercase text-[11px] shadow-xl">Salvar Pontuações</button>
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