
import React, { useState } from 'react';
import { APSIndicator, DentalIndicator } from '../types';
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
  const [activeSubTab, setActiveSubTab] = useState<'aps' | 'dental'>('aps');
  const [editingItem, setEditingItem] = useState<{ type: 'aps' | 'dental', data: any } | null>(null);

  const statusConfig: Record<string, { bg: string, text: string, border: string, bar: string }> = {
    'Ótimo': { 
      bg: 'bg-emerald-50', 
      text: 'text-emerald-700', 
      border: 'border-emerald-100',
      bar: 'bg-emerald-500'
    },
    'Bom': { 
      bg: 'bg-blue-50', 
      text: 'text-blue-700', 
      border: 'border-blue-100',
      bar: 'bg-blue-500'
    },
    'Suficiente': { 
      bg: 'bg-amber-50', 
      text: 'text-amber-700', 
      border: 'border-amber-100',
      bar: 'bg-amber-500'
    },
    'Regular': { 
      bg: 'bg-rose-50', 
      text: 'text-rose-700', 
      border: 'border-rose-100',
      bar: 'bg-rose-500'
    },
  };

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

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <header className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Painel de Desempenho Saúde 360</span>
          </div>
          <h2 className="text-3xl font-black text-emerald-900 uppercase tracking-tighter">Indicadores de Saúde</h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Sincronizado com Ministério da Saúde</p>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full md:w-auto">
          <button onClick={() => setActiveSubTab('aps')} className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${activeSubTab === 'aps' ? 'bg-white shadow-sm text-emerald-700' : 'text-slate-400'}`}>Previne Brasil (APS)</button>
          <button onClick={() => setActiveSubTab('dental')} className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${activeSubTab === 'dental' ? 'bg-white shadow-sm text-emerald-700' : 'text-slate-400'}`}>Saúde Bucal</button>
        </div>
      </header>

      {activeSubTab === 'aps' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apsIndicators.map(indicator => {
            const config = statusConfig[indicator.status] || statusConfig['Regular'];
            const percentage = indicator.percentage || 0;
            
            return (
              <div key={indicator.code} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 relative group overflow-hidden">
                {isAdmin && (
                  <button onClick={() => setEditingItem({ type: 'aps', data: { ...indicator } })} className="absolute top-4 right-4 p-2.5 bg-emerald-900 text-white rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-all z-20">✏️</button>
                )}
                
                <div className="flex justify-between items-start mb-6">
                  <span className="w-10 h-10 bg-emerald-900 text-white rounded-2xl flex items-center justify-center font-black text-sm">{indicator.code}</span>
                  <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black border uppercase ${config.bg} ${config.text} ${config.border}`}>
                    {indicator.status}
                  </span>
                </div>

                <h3 className="font-black text-slate-800 text-base mb-6 leading-tight min-h-[3rem] uppercase">{indicator.title}</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Atingimento</span>
                    <span className={`text-3xl font-black tracking-tighter ${config.text}`}>{indicator.cityValue}</span>
                  </div>
                  
                  <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                    <div 
                      className={`h-full ${config.bar} transition-all duration-1000 ease-out`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                <p className="mt-6 text-[11px] text-slate-400 font-medium leading-relaxed italic">
                  {indicator.description}
                </p>
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
                {isAdmin && (
                  <button onClick={() => setEditingItem({ type: 'dental', data: { ...indicator } })} className="absolute top-4 right-4 p-2.5 bg-emerald-900 text-white rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-all z-20">✏️</button>
                )}
                
                <div className="flex justify-between items-start mb-6">
                  <span className="w-10 h-10 bg-blue-900 text-white rounded-2xl flex items-center justify-center font-black text-sm">{indicator.code}</span>
                  <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black border uppercase ${config.bg} ${config.text} ${config.border}`}>
                    {indicator.status}
                  </span>
                </div>

                <h3 className="font-black text-slate-800 text-base mb-6 leading-tight min-h-[3rem] uppercase">{indicator.title}</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Atingimento</span>
                    <span className={`text-3xl font-black tracking-tighter ${config.text}`}>{indicator.cityValue || '0%'}</span>
                  </div>
                  
                  <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                    <div 
                      className={`h-full ${config.bar} transition-all duration-1000 ease-out`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL DE EDIÇÃO ATUALIZADO */}
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
