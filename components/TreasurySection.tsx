
import React, { useState, useEffect, useMemo } from 'react';
import { TreasuryData, MonthlyBalance, UserRole } from '../types';
import { databaseService } from '../services/databaseService';

interface TreasurySectionProps {
  isAdmin: boolean;
  userName: string;
}

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const TreasurySection: React.FC<TreasurySectionProps> = ({ isAdmin, userName }) => {
  const [summary, setSummary] = useState<TreasuryData | null>(null);
  const [history, setHistory] = useState<MonthlyBalance[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [view, setView] = useState<'summary' | 'history'>('summary');
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [newFee, setNewFee] = useState<number>(0);
  
  const [editForm, setEditForm] = useState<Partial<MonthlyBalance>>({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    income: 0,
    expense: 0,
    description: ''
  });

  useEffect(() => {
    const unsubSummary = databaseService.subscribeTreasury((data) => {
      setSummary(data);
      setNewFee(data.monthlyFee);
    });

    const unsubHistory = databaseService.subscribeMonthlyHistory(selectedYear, (data) => {
      setHistory(data);
    });

    return () => {
      unsubSummary();
      unsubHistory();
    };
  }, [selectedYear]);

  // Cálculos Derivados
  const currentMonthData = useMemo(() => 
    history.find(m => m.month === selectedMonth), 
    [history, selectedMonth]
  );

  const monthBalance = useMemo(() => {
    if (!currentMonthData) return 0;
    return currentMonthData.income - currentMonthData.expense;
  }, [currentMonthData]);

  const annualTotals = useMemo(() => {
    return history.reduce((acc, curr) => ({
      income: acc.income + curr.income,
      expense: acc.expense + curr.expense
    }), { income: 0, expense: 0 });
  }, [history]);

  const handleSaveBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = `${editForm.year}-${String(editForm.month).padStart(2, '0')}`;
    const fullBalance: MonthlyBalance = {
      id,
      year: editForm.year!,
      month: editForm.month!,
      income: editForm.income || 0,
      expense: editForm.expense || 0,
      description: editForm.description || '',
      updatedAt: new Date().toISOString()
    };

    await databaseService.saveMonthlyBalance(fullBalance);
    setShowEditModal(false);
  };

  const handleSaveFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (summary) {
      await databaseService.updateTreasury({ 
        ...summary, 
        monthlyFee: newFee,
        updatedBy: userName 
      });
      setShowFeeModal(false);
      alert("Valor da mensalidade atualizado!");
    }
  };

  const deleteHistoryItem = async (id: string) => {
    if (window.confirm("Deseja excluir este registro mensal?")) {
      await databaseService.deleteMonthlyBalance(id);
    }
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  if (!summary) return <div className="p-20 text-center animate-pulse font-black uppercase text-emerald-900">Carregando Tesouraria...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      <header className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Controle Financeiro AACSM</span>
          </div>
          <h2 className="text-4xl font-black text-emerald-900 uppercase tracking-tighter">Financeiro</h2>
          
          <div className="flex bg-slate-100 p-1 rounded-xl mt-4 w-fit mx-auto md:mx-0">
            <button onClick={() => setView('summary')} className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${view === 'summary' ? 'bg-white shadow-sm text-emerald-700' : 'text-slate-400'}`}>Resumo Geral</button>
            <button onClick={() => setView('history')} className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${view === 'history' ? 'bg-white shadow-sm text-emerald-700' : 'text-slate-400'}`}>Todos os Meses</button>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
             <select value={selectedMonth} onChange={e => setSelectedMonth(parseInt(e.target.value))} className="bg-transparent border-0 font-black text-emerald-900 text-[10px] uppercase outline-none">
               {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
             </select>
             <select value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))} className="bg-transparent border-0 font-black text-emerald-900 text-[10px] uppercase outline-none">
               {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
             </select>
          </div>
          {isAdmin && (
            <button 
              onClick={() => {
                setEditForm({ ...currentMonthData || { month: selectedMonth, year: selectedYear, income: 0, expense: 0, description: '' } });
                setShowEditModal(true);
              }}
              className="bg-emerald-900 text-white px-6 py-3 rounded-xl font-black uppercase text-[9px] tracking-widest shadow-xl hover:bg-black transition-all"
            >
              Editar Este Mês
            </button>
          )}
        </div>
      </header>

      {view === 'summary' ? (
        <div className="space-y-10">
          {/* SEÇÃO MENSAL SELECIONADA */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center md:text-left">Performance de {MONTHS[selectedMonth - 1]}</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-emerald-100 relative overflow-hidden">
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-4">Entrada no Mês</p>
                <h3 className="text-3xl font-black text-slate-800 tracking-tighter">
                  {formatCurrency(currentMonthData?.income || 0)}
                </h3>
                <div className="absolute top-0 right-0 p-6 text-emerald-50 text-5xl font-black opacity-40">↑</div>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-rose-100 relative overflow-hidden">
                <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-4">Saída no Mês</p>
                <h3 className="text-3xl font-black text-slate-800 tracking-tighter">
                  {formatCurrency(currentMonthData?.expense || 0)}
                </h3>
                <div className="absolute top-0 right-0 p-6 text-rose-50 text-5xl font-black opacity-40">↓</div>
              </div>
              <div className={`p-8 rounded-[2.5rem] shadow-sm border relative overflow-hidden transition-colors ${monthBalance >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
                <p className={`text-[10px] font-black uppercase tracking-widest mb-4 ${monthBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>Saldo do Mês</p>
                <h3 className={`text-3xl font-black tracking-tighter ${monthBalance >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {formatCurrency(monthBalance)}
                </h3>
                <div className="absolute top-0 right-0 p-6 text-slate-900/5 text-5xl font-black select-none">⚖️</div>
              </div>
            </div>
          </div>

          {/* SEÇÃO ANUAL ACUMULADA */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center md:text-left">Consolidado Anual {selectedYear}</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-200">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Total Entradas Ano</p>
                <h3 className="text-3xl font-black text-slate-700 tracking-tighter">{formatCurrency(annualTotals.income)}</h3>
              </div>
              <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-200">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Total Saídas Ano</p>
                <h3 className="text-3xl font-black text-slate-700 tracking-tighter">{formatCurrency(annualTotals.expense)}</h3>
              </div>
              <div className="bg-emerald-900 p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden">
                <p className="text-[9px] font-black text-emerald-300 uppercase tracking-widest mb-3">Saldo em Conta Anual</p>
                <h3 className="text-3xl font-black tracking-tighter">{formatCurrency(annualTotals.income - annualTotals.expense)}</h3>
                <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-white/5 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* INFORMAÇÕES EXTRAS COM EDIÇÃO DE MENSALIDADE */}
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-10">
            <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center text-3xl shadow-inner">💰</div>
            <div className="flex-1 text-center md:text-left">
              <h4 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Mensalidade Sócio</h4>
              <p className="text-slate-500 font-medium text-sm mt-1">Valor fixado em assembleia para todos os agentes associados.</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="text-3xl font-black text-emerald-600 bg-emerald-50 px-8 py-4 rounded-2xl border border-emerald-100">
                {formatCurrency(summary.monthlyFee)}
              </div>
              {isAdmin && (
                <button 
                  onClick={() => {
                    setNewFee(summary.monthlyFee);
                    setShowFeeModal(true);
                  }}
                  className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline"
                >
                  [ Editar Valor ]
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {history.length === 0 ? (
            <div className="col-span-full py-24 text-center text-slate-400 font-bold uppercase text-xs italic bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
              Nenhum lançamento encontrado para o ano de {selectedYear}.
            </div>
          ) : (
            history.map(item => (
              <div key={item.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-lg transition-all relative group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-xl font-black text-slate-800 leading-none">{MONTHS[item.month - 1]}</h4>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{item.year}</p>
                  </div>
                  {isAdmin && (
                    <button onClick={() => deleteHistoryItem(item.id)} className="text-slate-300 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100">✕</button>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-400 text-[9px] uppercase">Entradas</span>
                    <span className="font-black text-emerald-600">+{formatCurrency(item.income)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-400 text-[9px] uppercase">Saídas</span>
                    <span className="font-black text-rose-600">-{formatCurrency(item.expense)}</span>
                  </div>
                </div>
                {item.description && (
                  <p className="mt-4 text-[10px] text-slate-400 font-medium italic border-l-2 border-slate-100 pl-3 leading-tight line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* MODAL DE EDIÇÃO DA MENSALIDADE GLOBAL */}
      {showFeeModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[250] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] p-10 w-full max-w-sm shadow-2xl animate-in zoom-in duration-300">
            <h3 className="text-2xl font-black text-emerald-900 mb-6 uppercase tracking-tight text-center">Mensalidade Sócio</h3>
            <form onSubmit={handleSaveFee} className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center block mb-2">Novo Valor da Taxa (R$)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  required 
                  autoFocus
                  value={newFee} 
                  onChange={e => setNewFee(parseFloat(e.target.value))} 
                  className="w-full p-5 bg-slate-50 border-2 rounded-2xl font-black text-emerald-700 text-3xl text-center" 
                />
              </div>
              <div className="flex flex-col gap-3">
                <button type="submit" className="w-full bg-emerald-900 text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-black transition-all">Confirmar Novo Valor</button>
                <button type="button" onClick={() => setShowFeeModal(false)} className="w-full text-slate-400 font-bold uppercase text-[9px] tracking-widest py-2">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE EDIÇÃO MENSAL SELECIONADA */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] p-10 w-full max-w-lg shadow-2xl animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-black text-emerald-900 mb-8 uppercase tracking-tight text-left">Lançamento de {MONTHS[(editForm.month || 1) - 1]} / {editForm.year}</h3>
            <form onSubmit={handleSaveBalance} className="space-y-6 text-left">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mês Ref.</label>
                  <select value={editForm.month} onChange={e => setEditForm({...editForm, month: parseInt(e.target.value)})} className="w-full p-4 bg-slate-50 border-2 rounded-2xl font-black text-sm">
                    {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ano Ref.</label>
                  <select value={editForm.year} onChange={e => setEditForm({...editForm, year: parseInt(e.target.value)})} className="w-full p-4 bg-slate-50 border-2 rounded-2xl font-black text-sm">
                    {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Entradas no Mês (R$)</label>
                <input type="number" step="0.01" required value={editForm.income} onChange={e => setEditForm({...editForm, income: parseFloat(e.target.value)})} className="w-full p-4 bg-slate-50 border-2 rounded-2xl font-black text-emerald-700 text-xl" />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Saídas no Mês (R$)</label>
                <input type="number" step="0.01" required value={editForm.expense} onChange={e => setEditForm({...editForm, expense: parseFloat(e.target.value)})} className="w-full p-4 bg-slate-50 border-2 rounded-2xl font-black text-rose-700 text-xl" />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descrição / Detalhes</label>
                <textarea value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} className="w-full p-4 bg-slate-50 border-2 rounded-2xl font-medium text-xs h-24 resize-none" placeholder="Ex: Recebimento de mensalidades, pagamento de luz..." />
              </div>

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 font-black text-slate-400 uppercase text-[10px] tracking-widest">Cancelar</button>
                <button type="submit" className="flex-1 bg-emerald-900 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl">Salvar Lançamento</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TreasurySection;