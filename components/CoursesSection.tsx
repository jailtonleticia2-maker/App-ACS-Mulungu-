
import React from 'react';

const CoursesSection: React.FC = () => {
  const courses = [
    {
      title: 'Saúde com Agente',
      provider: 'MS / CONASEMS',
      description: 'Curso técnico para Agentes Comunitários de Saúde e de Combate às Endemias.',
      icon: '🎓',
      url: 'https://avasus.ufrn.br/',
      category: 'Técnico'
    },
    {
      title: 'Previne Brasil para ACS',
      provider: 'Ministério da Saúde',
      description: 'Entenda como funcionam as metas e indicadores do novo modelo de financiamento.',
      icon: '📊',
      url: 'https://www.gov.br/saude/pt-br/assuntos/atencao-primaria/previne-brasil',
      category: 'Indicadores'
    },
    {
      title: 'Saúde da Família 360',
      provider: 'AVA-SUS',
      description: 'Capacitação multiprofissional para atuação na Estratégia Saúde da Família.',
      icon: '🏘️',
      url: 'https://avasus.ufrn.br/local/avasus_courses/courses.php',
      category: 'Estratégia'
    }
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom duration-700 pb-20 text-left">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Educação Continuada</span>
          </div>
          <h2 className="text-4xl font-black text-emerald-900 uppercase tracking-tighter">Cursos e Trilhas</h2>
          <p className="text-slate-500 font-medium italic">Capacitação constante para o fortalecimento da categoria</p>
        </div>
      </header>

      {/* VÍDEO EM DESTAQUE */}
      <section className="bg-white p-6 md:p-12 rounded-[3.5rem] shadow-xl border border-slate-100 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 text-emerald-50 text-9xl font-black select-none pointer-events-none opacity-50">📹</div>
        
        <div className="relative z-10 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div>
                <span className="bg-emerald-900 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 inline-block shadow-lg">Vídeo Aula em Destaque</span>
                <h3 className="text-2xl md:text-3xl font-black text-slate-800 uppercase tracking-tighter leading-tight">Agente Comunitário: Rotina e Qualificação</h3>
             </div>
             <a 
               href="https://www.youtube.com/watch?v=HAqPPDh7oqs" 
               target="_blank" 
               rel="noopener noreferrer"
               className="bg-red-600 text-white px-6 py-3 rounded-2xl font-black uppercase text-[9px] tracking-widest shadow-lg hover:bg-red-700 transition-all flex items-center justify-center gap-2 shrink-0"
             >
               Assistir no YouTube ↗
             </a>
          </div>

          <div className="w-full relative bg-black rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white aspect-video">
            <iframe 
              className="absolute top-0 left-0 w-full h-full"
              src="https://www.youtube-nocookie.com/embed/HAqPPDh7oqs?rel=0&modestbranding=1" 
              title="Agente Comunitário: Rotina e Qualificação" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              allowFullScreen
            ></iframe>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Conteúdo</p>
                <p className="text-xs font-bold text-slate-700">Material essencial sobre a atuação do ACS no programa Saúde Com Agente e Previne Brasil.</p>
             </div>
             <div className="bg-emerald-50 px-6 py-4 rounded-2xl border border-emerald-100">
                <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Status</p>
                <p className="text-xs font-bold text-emerald-800 uppercase">Disponível para todos os sócios</p>
             </div>
          </div>
        </div>
      </section>

      {/* OUTRAS TRILHAS */}
      <section className="space-y-6">
        <h3 className="text-2xl font-black text-emerald-900 uppercase tracking-tighter ml-2">Trilhas de Estudo</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, idx) => (
            <a 
              key={idx}
              href={course.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all group"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-3xl shadow-inner group-hover:bg-emerald-900 group-hover:text-white transition-all">
                  {course.icon}
                </div>
                <span className="bg-slate-50 text-slate-400 px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border border-slate-100">
                  {course.category}
                </span>
              </div>
              <h4 className="text-xl font-black text-slate-800 uppercase tracking-tighter leading-tight mb-2">{course.title}</h4>
              <p className="text-[10px] font-black text-emerald-600 uppercase mb-4">{course.provider}</p>
              <p className="text-slate-500 text-xs font-medium leading-relaxed">
                {course.description}
              </p>
              <div className="mt-8 flex items-center justify-between">
                <span className="text-emerald-700 font-black text-[10px] uppercase tracking-widest group-hover:underline">Acessar Plataforma</span>
                <span className="text-xl group-hover:translate-x-1 transition-transform">↗️</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* MENSAGEM FINAL */}
      <div className="bg-emerald-900 rounded-[3rem] p-10 text-center text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 100 Q 50 0 100 100" fill="white" />
          </svg>
        </div>
        <div className="relative z-10">
          <h4 className="text-2xl font-black uppercase tracking-tighter mb-4">Conhecimento é Poder</h4>
          <p className="text-emerald-300 font-medium italic text-sm">"A educação é o principal instrumento para a transformação da saúde da nossa comunidade."</p>
        </div>
      </div>
    </div>
  );
};

export default CoursesSection;