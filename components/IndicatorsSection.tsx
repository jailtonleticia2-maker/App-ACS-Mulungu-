
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
  const [activeSubTab, setActiveSubTab] = useState<'aps' | 'dental' | 'ranking'>('aps');
  const [editingItem, setEditingItem] = useState<{ type: 'aps' | 'dental', data: any } | null>(null);
  
  // Estados para Ranking
  const [rankings, setRankings] = useState<PSFRankingData[]>([]);
  const [selectedPSFForEdit, setSelectedPSFForEdit] = useState<string | null>(null);
  const [editingPSFData, setEditingPSFData] = useState<PSFRankingData | null>(null);

  useEffect(() => {
    const unsub = databaseService.subscribePSFRankings((data) => {
      setRankings(data);
    });
    return () => unsub();
  }, []);

  const statusConfig: Record<string, { bg: string, text: string, border: string, bar: string, points: number }> = {
    'Ótimo': { 
      bg: 'bg-emerald-50', 
      text: 'text-emerald-700', 
      border: 'border-emerald-100',
      bar: 'bg-emerald-500',
      points: 4
    },
    'Bom': { 
      bg: 'bg-blue-50', 
      text: 'text-blue-700', 
      border: 'border-blue-100',
      bar: 'bg-blue-500',
      points: 3
    },
    'Suficiente': { 
      bg: 'bg-amber-50', 
      text: 'text-amber-700', 
      border: 'border-amber-100',
      bar: 'bg-amber-500',
      points: 2
    },
    'Regular': { 
      bg: 'bg-rose-50', 
      text: 'text-rose-700', 
      border: 'border-rose-100',
      bar: 'bg-rose-500',
      points: 1
    },
  };

  const sortedRankings = useMemo(() => {
    return [...rankings].sort((a, b) => b.totalScore - a.totalScore);
  }, [rankings]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    if (editingItem.type === 'aps') {
      await databaseService.updateAPS(editingItem.data);
      setApsIndicators(prev => prev.map(item => 
        item.code === editingItem.data.code ? editingItem.data : item
      ));
    } else {
      await databaseService.updateDental(editingItem.data);
      setDentalIndicators(prev => prev.map(item => 
        item.code === editingItem.data.code ? editingItem.data : item
      ));
    }
    setEditingItem(null);
  };

  const handleUpdatePSF = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPSFData) return;
    await databaseService.updatePSFRanking(editingPSFData.psfName, editingPSFData.indicators);
    setSelectedPSFForEdit(null);
    setEditingPSFData(null);
    alert("Ranking atualizado!");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <header className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monitoramento Saúde 360</span>
          </div>
          <h2 className="text-3xl font-black text-emerald-900 uppercase tracking-tighter">Indicadores e Ranking</h2>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full md:w-auto">
          <button onClick={() => setActiveSubTab('aps')} className={`flex-1 md:flex-none px-5 py-2.5 rounded-xl text-[9px] font-black uppercase transition-all ${activeSubTab === 'aps' ? 'bg-white shadow-sm text-emerald-700' : 'text-slate-400'}`}>Previne Brasil</button>
          <button onClick={() => setActiveSubTab('dental')} className={`flex-1 md:flex-none px-5 py-2.5 rounded-xl text-[9px] font-black uppercase transition-all ${activeSubTab === 'dental' ? 'bg-white shadow-sm text-emerald-700' : 'text-slate-400'}`}>Saúde Bucal</button>
          <button onClick={() => setActiveSubTab('ranking')} className={`flex-1 md:flex-none px-5 py-2.5 rounded-xl text-[9px] font-black uppercase transition-all ${activeSubTab === 'ranking' ? 'bg-white shadow-sm text-emerald-700' : 'text-slate-400'}`}>Ranking PSF</button>
        </div>
      </header>

      {activeSubTab === 'aps' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apsIndicators.map(indicator => {
            const config = statusConfig[indicator.status] || statusConfig['Regular'];
            const percentage = indicator.percentage || 0;
            return (
              <div key={indicator.code} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 relative group overflow-hidden">
                {isAdmin && <button onClick={() => setEditingItem({ type: 'aps', data: { ...indicator } })} className="absolute top-4 right-4 p-2.5 bg-emerald-900 text-white rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-all z-20">✏️</button>}
                <div className="flex justify-between items-start mb-6">
                  <span className="w-10 h-10 bg-emerald-900 text-white rounded-2xl flex items-center justify-center font-black text-sm">{indicator.code}</span>
                  <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black border uppercase ${config.bg} ${config.text} ${config.border}`}>{indicator.status}</span>
                </div>
                <h3 className="font-black text-slate-800 text-base mb-6 leading-tight min-h-[3rem] uppercase">{indicator.title}</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Atingimento</span>
                    <span className={`text-3xl font-black tracking-tighter ${config.text}`}>{indicator.cityValue}</span>
                  </div>
                  <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                    <div className={`h-full ${config.bar} transition-all duration-1000 ease-out`} style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeSubTab === 'dental' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dentalIndicators.map(indicator => {
            const config = statusConfig[indicator.status] || statusConfig['Regular'];
            const percentage = indicator.percentage || 0;
            return (
              <div key={indicator.code} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 relative group overflow-hidden">
                {isAdmin && <button onClick={() => setEditingItem({ type: 'dental', data: { ...indicator } })} className="absolute top-4 right-4 p-2.5 bg-emerald-900 text-white rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-all z-20">✏️</button>}
                <div className="flex justify-between items-start mb-6">
                  <span className="w-10 h-10 bg-blue-900 text-white rounded-2xl flex items-center justify-center font-black text-sm">{indicator.code}</span>
                  <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black border uppercase ${config.bg} ${config.text} ${config.border}`}>{indicator.status}</span>
                </div>
                <h3 className="font-black text-slate-800 text-base mb-6 leading-tight min-h-[3rem] uppercase">{indicator.title}</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Atingimento</span>
                    <span className={`text-3xl font-black tracking-tighter ${config.text}`}>{indicator.cityValue || '0%'}</span>
                  </div>
                  <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                    <div className={`h-full ${config.bar} transition-all duration-1000 ease-out`} style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeSubTab === 'ranking' && (
        <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
          {isAdmin && (
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
               <div>
                  <h4 className="text-sm font-black text-emerald-900 uppercase">Gerenciar Rankings Individuais</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Selecione uma unidade para atualizar os indicadores</p>
               </div>
               <select 
                 className="p-3 bg-slate-50 border-2 rounded-xl font-black text-xs uppercase outline-none focus:border-emerald-500"
                 onChange={(e) => {
                   const val = e.target.value;
                   if (val) {
                     const existing = rankings.find(r => r.psfName === val);
                     setSelectedPSFForEdit(val);
                     setEditingPSFData(existing || {
                        psfName: val,
                        indicators: apsIndicators.map(a => ({...a, status: 'Suficiente', cityValue: '0%'})),
                        totalScore: 0,
                        lastUpdate: ''
                     });
                   }
                 }}
               >
                 <option value="">SELECIONE O PSF...</option>
                 {PSF_LIST.map(p => <option key={p} value={p}>{p}</option>)}
               </select>
            </div>
          )}

          <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 p-8 md:p-12">
            <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-10 text-center md:text-left">Ranking de Desempenho por PSF</h3>
            
            <div className="space-y-8">
              {sortedRankings.length === 0 ? (
                <div className="text-center py-10 text-slate-300 font-black uppercase text-xs italic">Aguardando dados de ranking...</div>
              ) : (
                sortedRankings.map((psf, index) => {
                  const maxPossible = 7 * 4; // 7 indicadores * status 'Ótimo'(4)
                  const scorePerc = (psf.totalScore / maxPossible) * 100;
                  const isTop = index < 3;
                  
                  return (
                    <div key={psf.psfName} className="relative">
                      <div className="flex justify-between items-end mb-2">
                        <div className="flex items-center gap-3">
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${isTop ? 'bg-amber-100 text-amber-700 border-2 border-amber-200' : 'bg-slate-100 text-slate-400'}`}>
                            {index + 1}º
                          </span>
                          <h4 className="font-black text-slate-700 uppercase text-sm tracking-tight">{psf.psfName}</h4>
                        </div>
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{psf.totalScore} pts</span>
                      </div>
                      <div className="h-6 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-1">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ease-out flex items-center justify-end px-3 ${index === 0 ? 'bg-emerald-600' : index === 1 ? 'bg-blue-600' : 'bg-slate-400'}`}
                          style={{ width: `${Math.max(scorePerc, 5)}%` }}
                        >
                          <span className="text-[8px] font-black text-white">{Math.round(scorePerc)}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-12 p-6 bg-amber-50 rounded-[2rem] border border-amber-100 text-center">
               <p className="text-[10px] font-black text-amber-800 uppercase tracking-[0.2em] mb-2">Legenda de Pontuação</p>
               <div className="flex flex-wrap justify-center gap-4">
                  <span className="text-[9px] font-bold text-slate-500 uppercase">Ótimo: 4 pts</span>
                  <span className="text-[9px] font-bold text-slate-500 uppercase">Bom: 3 pts</span>
                  <span className="text-[9px] font-bold text-slate-500 uppercase">Suficiente: 2 pts</span>
                  <span className="text-[9px] font-bold text-slate-500 uppercase">Regular: 1 pt</span>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIÇÃO RANKING PSF */}
      {selectedPSFForEdit && editingPSFData && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-[300] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3.5rem] p-10 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in duration-300">
            <header className="flex justify-between items-center mb-8 sticky top-0 bg-white py-2 z-10 border-b border-slate-50">
               <div>
                  <h3 className="text-2xl font-black text-emerald-900 uppercase tracking-tighter">{selectedPSFForEdit}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Atualizar Indicadores Individuais</p>
               </div>
               <button onClick={() => setSelectedPSFForEdit(null)} className="text-slate-300 text-2xl">✕</button>
            </header>

            <form onSubmit={handleUpdatePSF} className="space-y-8">
              {editingPSFData.indicators.map((ind, idx) => (
                <div key={ind.code} className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black text-emerald-600 bg-white px-3 py-1 rounded-lg border border-emerald-100">{ind.code}</span>
                    <h5 className="font-black text-slate-700 uppercase text-[11px] leading-tight flex-1 ml-3">{ind.title}</h5>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {['Ótimo', 'Bom', 'Suficiente', 'Regular'].map(st => (
                      <button 
                        key={st}
                        type="button"
                        onClick={() => {
                          const newInds = [...editingPSFData.indicators];
                          newInds[idx].status = st as any;
                          setEditingPSFData({...editingPSFData, indicators: newInds});
                        }}
                        className={`py-2 rounded-xl text-[8px] font-black uppercase transition-all border-2 ${ind.status === st ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-400 border-slate-100'}`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex gap-4 sticky bottom-0 bg-white py-4 border-t border-slate-50">
                <button type="button" onClick={() => setSelectedPSFForEdit(null)} className="flex-1 font-black text-slate-400 uppercase text-[10px] tracking-widest">Cancelar</button>
                <button type="submit" className="flex-1 bg-emerald-900 text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl">Salvar Ranking</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE EDIÇÃO APS/DENTAL (EXISTENTE) */}
      {editingItem && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] p-10 w-full max-w-lg shadow-2xl animate-in zoom-in duration-300">
            <h3 className="text-2xl font-black text-emerald-900 mb-6 uppercase tracking-tight">Atualizar Indicador {editingItem.data.code}</h3>
            <form onSubmit={handleUpdate} className="space-y-6 text-left">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Valor Exibido (Ex: 85%)</label>
                  <input 
                    required 
                    value={editingItem.data.cityValue || ''} 
                    onChange={e => setEditingItem({...editingItem, data: {...editingItem.data, cityValue: e.target.value}})} 
                    className="w-full p-4 bg-slate-50 border-2 rounded-2xl font-black text-emerald-700" 
                    placeholder="Resultado Visível" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Porcentagem da Barra (0-100)</label>
                  <input 
                    type="number"
                    min="0"
                    max="100"
                    required 
                    value={editingItem.data.percentage || 0} 
                    onChange={e => setEditingItem({...editingItem, data: {...editingItem.data, percentage: parseInt(e.target.value)}})} 
                    className="w-full p-4 bg-slate-50 border-2 rounded-2xl font-black" 
                  />
                </div>
              </div>
              
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-3 block">Classificação de Desempenho</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Ótimo', 'Bom', 'Suficiente', 'Regular'].map(status => (
                    <button 
                      key={status} 
                      type="button" 
                      onClick={() => setEditingItem({...editingItem, data: {...editingItem.data, status}})} 
                      className={`py-3.5 rounded-xl text-[10px] font-black uppercase transition-all border-2 ${editingItem.data.status === status ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg' : 'bg-white text-slate-400 border-slate-100 hover:border-emerald-200'}`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setEditingItem(null)} className="flex-1 font-black text-slate-400 uppercase text-[10px] tracking-widest">Cancelar</button>
                <button type="submit" className="flex-1 bg-emerald-900 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl">Salvar Mudanças</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IndicatorsSection;
