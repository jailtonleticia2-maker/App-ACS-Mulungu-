
import React from 'react';

const BestPracticesSection: React.FC = () => {
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
          <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 flex items-center gap-6 hover:border-blue-200 transition-all hover:shadow-lg group">
            <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-[1.5rem] flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform">🤰</div>
            <div className="flex-1">
              <h4 className="text-blue-600 font-black text-xl md:text-2xl uppercase tracking-tighter leading-none mb-2">Gestação</h4>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5">✓</div>
                <p className="text-xs md:text-sm font-bold text-slate-600 leading-tight uppercase">Meta: Pelo menos 03 visitas durante a gestação.</p>
              </div>
              <p className="text-[8px] text-slate-400 font-black uppercase mt-2 italic leading-none">(Contagem inicia após a 1ª consulta com enfermeiro ou médico)</p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 flex items-center gap-6 hover:border-blue-200 transition-all hover:shadow-lg group">
            <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-[1.5rem] flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform">👩‍🍼</div>
            <div className="flex-1">
              <h4 className="text-blue-600 font-black text-xl md:text-2xl uppercase tracking-tighter leading-none mb-2">Puerpério</h4>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5">✓</div>
                <p className="text-xs md:text-sm font-bold text-slate-600 leading-tight uppercase">Meta: 01 visita no período pós-parto.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção 2: Desenvolvimento Infantil */}
      <section className="space-y-6">
        <div className="flex items-center gap-4 ml-2">
           <h3 className="text-blue-700 font-black text-3xl md:text-4xl italic tracking-tighter">Desenvolvimento infantil</h3>
           <div className="flex-1 h-[2px] bg-blue-100 rounded-full"></div>
        </div>
        
        <div className="bg-white p-12 rounded-[3.5rem] shadow-sm border border-slate-100 relative overflow-hidden">
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