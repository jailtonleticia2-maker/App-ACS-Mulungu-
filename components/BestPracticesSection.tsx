
import React, { useState } from 'react';

const BestPracticesSection: React.FC = () => {
  const [showPregnancyDetail, setShowPregnancyDetail] = useState(false);
  const [showPuerperioDetail, setShowPuerperioDetail] = useState(false);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom duration-700 pb-16 text-left">
      {/* Cabeçalho de Identidade Visual */}
      <header className="flex flex-col items-center mb-12">
         <div className="bg-yellow-400 px-12 py-6 rounded-[2.5rem] shadow-xl border-b-8 border-blue-900/10 text-center w-full max-w-2xl transform -rotate-1">
            <h2 className="text-blue-900 font-black text-3xl md:text-5xl uppercase tracking-tighter leading-none">Boas Práticas</h2>
            <div className="h-1 bg-blue-900/20 w-32 mx-auto my-3 rounded-full"></div>
            <p className="text-blue-800 text-xs md:text-sm font-black uppercase tracking-[0.2em]">Indicadores de Visita Domiciliar</p>
         </div>
      </header>

      {/* Seção 1: Gestante e Puérpera */}
      <section className="space-y-6">
        <div className="flex items-center gap-4 ml-2">
           <h3 className="text-blue-700 font-black text-3xl md:text-4xl italic tracking-tighter">Gestante e puérpera</h3>
           <div className="flex-1 h-[2px] bg-blue-100 rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card Gestação */}
          <button 
            onClick={() => setShowPregnancyDetail(true)}
            className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 flex items-center gap-6 hover:border-pink-300 transition-all hover:shadow-lg group text-left w-full relative overflow-hidden"
          >
            <div className="w-20 h-20 bg-pink-50 text-pink-500 rounded-[1.5rem] flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform">🤰</div>
            <div className="flex-1">
              <h4 className="text-blue-600 font-black text-xl md:text-2xl uppercase tracking-tighter leading-none mb-2">Gestação</h4>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5">✓</div>
                <p className="text-xs md:text-sm font-bold text-slate-600 leading-tight uppercase">Meta: Pelo menos 03 visitas durante a gestação.</p>
              </div>
              <p className="text-[9px] text-pink-500 font-black uppercase mt-3 flex items-center gap-1">
                Toque para ver o guia <span className="animate-bounce">→</span>
              </p>
            </div>
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-pink-50 rounded-full opacity-50"></div>
          </button>

          {/* Card Puerpério */}
          <button 
            onClick={() => setShowPuerperioDetail(true)}
            className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 flex items-center gap-6 hover:border-purple-300 transition-all hover:shadow-lg group text-left w-full relative overflow-hidden"
          >
            <div className="w-20 h-20 bg-purple-50 text-purple-500 rounded-[1.5rem] flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform">👩‍🍼</div>
            <div className="flex-1">
              <h4 className="text-blue-600 font-black text-xl md:text-2xl uppercase tracking-tighter leading-none mb-2">Puerpério</h4>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5">✓</div>
                <p className="text-xs md:text-sm font-bold text-slate-600 leading-tight uppercase">Meta: 01 visita no período pós-parto.</p>
              </div>
              <p className="text-[9px] text-purple-500 font-black uppercase mt-3 flex items-center gap-1">
                Toque para ver o guia <span className="animate-bounce">→</span>
              </p>
            </div>
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-purple-50 rounded-full opacity-50"></div>
          </button>
        </div>
      </section>

      {/* MODAL DETALHADO DE GESTAÇÃO */}
      {showPregnancyDetail && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[300] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#fdf7ff] rounded-[3.5rem] w-full max-w-2xl shadow-2xl my-8 animate-in zoom-in duration-300 relative overflow-hidden">
            <header className="bg-white p-8 border-b border-pink-100 flex justify-between items-center sticky top-0 z-10">
               <div className="flex items-center gap-3">
                 <span className="text-3xl">🤰</span>
                 <div>
                   <h3 className="text-2xl font-black text-pink-600 uppercase tracking-tighter">Guia de Gestação</h3>
                   <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Cronograma de Visitas ACS</p>
                 </div>
               </div>
               <button onClick={() => setShowPregnancyDetail(false)} className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center text-xl hover:bg-rose-50 hover:text-rose-600 transition-all">✕</button>
            </header>

            <div className="p-8 space-y-8">
              <div className="bg-purple-600 p-6 rounded-[2rem] text-center shadow-lg transform -rotate-1">
                <h4 className="text-white font-black text-xl uppercase tracking-tight">Faça pelo menos 3 visitas durante a gestação!</h4>
                <p className="text-purple-100 text-[9px] font-bold uppercase mt-1 tracking-widest">(Contagem inicia após a 1ª consulta com enfermeiro ou médico)</p>
              </div>

              <div className="space-y-6">
                {[
                  { title: '1ª Visita Preferencial', time: 'Até 12 semanas', icon: '📝', color: 'bg-indigo-50 text-indigo-600' },
                  { title: '2ª Visita', time: 'Entre 20 e 28 semanas', icon: '🩺', color: 'bg-purple-50 text-purple-600' },
                  { title: '3ª Visita', time: 'Entre 30 e 40 semanas', icon: '🏠', color: 'bg-pink-50 text-pink-600' },
                ].map((v, i) => (
                  <div key={i} className="flex items-center gap-4 group">
                    <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-2xl shadow-sm shrink-0 ${v.color}`}>
                      {v.icon}
                    </div>
                    <div className="flex-1 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm group-hover:border-pink-200 transition-colors">
                      <h5 className="font-black text-slate-800 uppercase text-xs">{v.title}</h5>
                      <p className="text-slate-500 font-black text-sm uppercase tracking-tighter">{v.time}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-white p-4 rounded-2xl border-2 border-dashed border-purple-200 text-center">
                    <span className="text-xl block mb-2">❓</span>
                    <p className="text-[9px] font-black text-purple-900 uppercase">Esclareça dúvidas da gestante!</p>
                 </div>
                 <div className="bg-white p-4 rounded-2xl border-2 border-dashed border-emerald-200 text-center">
                    <span className="text-xl block mb-2">📸</span>
                    <p className="text-[9px] font-black text-emerald-900 uppercase">Oriente sobre o pré-natal!</p>
                 </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 ml-2">
                  <span className="text-pink-500">❤️</span>
                  <h5 className="text-pink-600 font-black uppercase text-sm italic">Ações Importantes:</h5>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                      <span className="text-3xl mb-3">🩺</span>
                      <p className="text-[9px] font-bold text-slate-600 uppercase leading-tight">Aferir pressão e acompanhar saúde da gestante!</p>
                   </div>
                   <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                      <span className="text-3xl mb-3">💊</span>
                      <p className="text-[9px] font-bold text-slate-600 uppercase leading-tight">Verificar uso de suplementos e vacinas!</p>
                   </div>
                   <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                      <span className="text-3xl mb-3">🏘️</span>
                      <p className="text-[9px] font-bold text-slate-600 uppercase leading-tight">Orientar sobre sinais de alerta e cuidados!</p>
                   </div>
                </div>
              </div>
            </div>

            <footer className="p-8 bg-pink-50 text-center">
               <button onClick={() => setShowPregnancyDetail(false)} className="bg-pink-600 text-white px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg">Entendido, Voltar</button>
            </footer>
          </div>
        </div>
      )}

      {/* MODAL DETALHADO DE PUERPÉRIO */}
      {showPuerperioDetail && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[300] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#f9f5ff] rounded-[3.5rem] w-full max-w-2xl shadow-2xl my-8 animate-in zoom-in duration-300 relative overflow-hidden">
            <header className="bg-white p-8 border-b border-purple-100 flex justify-between items-center sticky top-0 z-10">
               <div className="flex items-center gap-3">
                 <span className="text-3xl">👩‍🍼</span>
                 <div>
                   <h3 className="text-2xl font-black text-purple-600 uppercase tracking-tighter">Guia de Puerpério</h3>
                   <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Acompanhamento Pós-Parto</p>
                 </div>
               </div>
               <button onClick={() => setShowPuerperioDetail(false)} className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center text-xl hover:bg-rose-50 hover:text-rose-600 transition-all">✕</button>
            </header>

            <div className="p-8 space-y-8">
              {/* Banner de Meta */}
              <div className="bg-purple-500 p-6 rounded-[2.5rem] text-center shadow-lg transform rotate-1">
                <h4 className="text-white font-black text-xl uppercase tracking-tight">Meta: 01 visita no período pós-parto!</h4>
                <p className="text-purple-100 text-[9px] font-bold uppercase mt-1 tracking-widest">(Contagem inicia após a 1ª semana após o parto)</p>
              </div>

              {/* Seção Central: Prazos Críticos */}
              <div className="bg-white p-8 rounded-[3rem] border border-purple-100 shadow-sm flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                <div className="flex flex-col items-center bg-purple-50 p-6 rounded-[2rem] border-2 border-purple-100">
                   <div className="text-4xl mb-2">📅</div>
                   <p className="text-[10px] font-black text-purple-800 uppercase text-center">1ª Semana</p>
                </div>
                <div className="flex-1">
                   <h5 className="text-purple-900 font-black text-lg uppercase tracking-tight mb-2 leading-tight">Orientada pós-parto até a 2ª semana do bebê!</h5>
                   <p className="text-slate-600 text-sm font-bold uppercase leading-tight">
                     Visita de preferência na <span className="text-purple-600 underline">1ª semana</span> após o parto.
                   </p>
                </div>
                {/* Ícone de casa decorativo */}
                <div className="absolute top-0 right-0 p-4 text-purple-100 text-6xl opacity-20 pointer-events-none">🏠</div>
              </div>

              {/* Grid de Ações Importantes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                 <div className="bg-pink-50 p-6 rounded-[2.5rem] border border-pink-100 flex flex-col items-center text-center group hover:bg-pink-100 transition-colors">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-xl shadow-sm mb-4">❗️</div>
                    <p className="text-[10px] font-black text-pink-800 uppercase leading-tight">Orientar sobre sinais de alerta!</p>
                 </div>
                 <div className="bg-emerald-50 p-6 rounded-[2.5rem] border border-emerald-100 flex flex-col items-center text-center group hover:bg-emerald-100 transition-colors">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-xl shadow-sm mb-4">🍼</div>
                    <p className="text-[10px] font-black text-emerald-800 uppercase leading-tight">Acompanhar cuidados com o bebê e amamentação!</p>
                 </div>
                 <div className="bg-amber-50 p-6 rounded-[2.5rem] border border-amber-100 flex flex-col items-center text-center group hover:bg-amber-100 transition-colors">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-xl shadow-sm mb-4">💊</div>
                    <p className="text-[10px] font-black text-amber-800 uppercase leading-tight">Verificar uso de suplementos e saúde da mãe!</p>
                 </div>
              </div>

              {/* Mensagem de Atenção */}
              <div className="bg-purple-900 p-8 rounded-[2.5rem] text-center shadow-xl">
                 <p className="text-purple-200 font-black uppercase text-xs tracking-widest leading-relaxed">
                   O puerperal e o recém-nascido precisam de muita atenção e carinho!
                 </p>
                 <div className="flex justify-center gap-4 mt-6">
                    <span className="text-2xl animate-pulse">❤️</span>
                    <span className="text-2xl">👩‍🍼</span>
                    <span className="text-2xl">📋</span>
                    <span className="text-2xl">💊</span>
                 </div>
              </div>
            </div>

            <footer className="p-8 bg-purple-50 text-center">
               <button onClick={() => setShowPuerperioDetail(false)} className="bg-purple-600 text-white px-12 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg">Entendido, Finalizar</button>
            </footer>
          </div>
        </div>
      )}

      {/* Seção 2: Desenvolvimento Infantil */}
      <section className="space-y-6">
        <div className="flex items-center gap-4 ml-2">
           <h3 className="text-blue-700 font-black text-3xl md:text-4xl italic tracking-tighter">Desenvolvimento infantil</h3>
           <div className="flex-1 h-[2px] bg-blue-100 rounded-full"></div>
        </div>
        
        <div className="bg-white p-12 rounded-[3.5rem] shadow-sm border border-slate-100 relative overflow-hidden text-center md:text-left">
          <div className="flex flex-col md:flex-row justify-between items-center relative z-10 gap-10">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-900 text-white rounded-2xl flex items-center justify-center text-3xl shadow-xl transform hover:rotate-6 transition-transform">👶</div>
              <p className="text-[10px] font-black text-slate-400 uppercase mt-3 tracking-widest">Nascimento</p>
            </div>
            
            <div className="hidden md:block flex-1 h-[3px] bg-blue-50 relative">
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-blue-100 rounded-full"></div>
            </div>

            <div className="flex flex-col items-center group">
              <div className="bg-emerald-500 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase mb-3 shadow-md group-hover:-translate-y-1 transition-transform">1ª Visita</div>
              <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center text-3xl border-2 border-emerald-100 shadow-inner">✓</div>
              <p className="text-[11px] font-black text-slate-700 uppercase mt-3 text-center">Até 30 dias de vida</p>
            </div>

            <div className="hidden md:block flex-1 h-[3px] bg-blue-50"></div>

            <div className="flex flex-col items-center group">
              <div className="bg-emerald-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase mb-3 shadow-md group-hover:-translate-y-1 transition-transform">2ª Visita</div>
              <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center text-3xl border-2 border-emerald-100 shadow-inner">✓</div>
              <p className="text-[11px] font-black text-slate-700 uppercase mt-3 text-center">Até 06 meses</p>
            </div>
          </div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-50/50 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Seção 3: Crônicos e Idosos */}
      <section className="space-y-6">
        <div className="flex items-center gap-4 ml-2">
           <h3 className="text-blue-700 font-black text-3xl md:text-4xl italic tracking-tighter">Crônicos e idosos</h3>
           <div className="flex-1 h-[2px] bg-blue-100 rounded-full"></div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/3 flex flex-col gap-4">
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-5 hover:translate-x-2 transition-transform">
              <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-2xl">💉</div>
              <p className="text-xs font-black text-slate-700 uppercase">Diabetes</p>
            </div>
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-5 hover:translate-x-2 transition-transform">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl">💙</div>
              <p className="text-xs font-black text-slate-700 uppercase">Hipertensão</p>
            </div>
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-5 hover:translate-x-2 transition-transform">
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-2xl">👵</div>
              <p className="text-xs font-black text-slate-700 uppercase">Pessoa Idosa</p>
            </div>
          </div>

          <div className="flex-1 bg-white p-10 rounded-[3rem] border-2 border-blue-50 shadow-inner flex flex-col justify-center relative">
            <div className="absolute -left-3 top-1/2 -translate-y-1/2 text-blue-100 text-6xl hidden lg:block opacity-50">{'}'}</div>
            <h5 className="text-blue-900 font-black text-2xl uppercase tracking-tighter mb-8 flex items-center gap-3">
              <span className="w-2 h-10 bg-blue-900 rounded-full"></span>
              Regra Unificada de Acompanhamento
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs shrink-0 mt-1 shadow-md">✓</div>
                <div>
                  <p className="font-black text-slate-800 uppercase text-[11px] tracking-widest mb-1">Frequência</p>
                  <p className="text-slate-500 text-[13px] font-bold uppercase leading-tight">Pelo menos 02 visitas nos últimos 12 meses.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs shrink-0 mt-1 shadow-md">✓</div>
                <div>
                  <p className="font-black text-slate-800 uppercase text-[11px] tracking-widest mb-1">Intervalo Crítico</p>
                  <p className="text-slate-500 text-[13px] font-bold uppercase leading-tight">Deve haver um intervalo mínimo de 30 dias entre as visitas.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Banner de Rodapé */}
      <div className="bg-yellow-400 p-10 rounded-[3.5rem] shadow-xl border-b-[12px] border-blue-900/10">
         <h3 className="text-blue-900 font-black text-2xl md:text-3xl text-center leading-tight uppercase tracking-tighter">
           Trata-se de número de visitas para fins de indicadores. Não é critério assistencial.
         </h3>
      </div>

      {/* Seção 4: Fluxo de Boas Práticas */}
      <section className="pt-10 space-y-10">
        <div className="bg-blue-800 p-4 rounded-2xl text-center shadow-lg inline-block w-full">
          <h3 className="text-white font-black text-xl uppercase tracking-[0.3em]">Fluxo de Boas Práticas</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: '📱', label: 'Visita Realizada', color: 'bg-slate-50' },
            { icon: '📋', label: 'Registro Correto', color: 'bg-blue-50' },
            { icon: '📊', label: 'Indicador Atingido', color: 'bg-emerald-50' },
            { icon: '🛡️', label: 'Melhor Saúde Pública', color: 'bg-emerald-100' }
          ].map((step, i, arr) => (
            <div key={i} className="flex flex-col items-center">
              <div className={`${step.color} w-full p-8 rounded-[3rem] shadow-sm border border-white flex flex-col items-center group hover:scale-105 transition-transform`}>
                <span className="text-5xl mb-4 group-hover:rotate-12 transition-transform">{step.icon}</span>
                <p className="text-[11px] font-black text-blue-900 uppercase text-center leading-tight">{step.label}</p>
              </div>
              {i < arr.length - 1 && (
                <div className="flex items-center justify-center h-10">
                  <span className="md:hidden text-3xl text-blue-200">↓</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default BestPracticesSection;