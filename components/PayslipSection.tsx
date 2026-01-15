
import React from 'react';

const PayslipSection: React.FC = () => {
  const PAYSLIP_URL = "https://pmmulungumorro.ccweb.srv.br/";

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-3xl font-bold text-slate-800">Contracheque Online</h2>
        <p className="text-slate-500">Acesse seus comprovantes de rendimento do município</p>
      </header>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 max-w-2xl mx-auto">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-4xl">
            🏦
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Portal de Transparência Mulungu</h3>
            <p className="text-slate-600">
              Você será redirecionado para o sistema oficial da Prefeitura de Mulungu do Morro 
              para consulta e impressão do seu contracheque.
            </p>
          </div>

          <div className="w-full bg-slate-50 p-6 rounded-2xl text-left border border-slate-200">
            <h4 className="font-bold text-slate-800 mb-3 flex items-center space-x-2">
              <span>💡</span>
              <span>Como acessar?</span>
            </h4>
            <ol className="text-sm text-slate-600 space-y-2 list-decimal list-inside">
              <li>Clique no botão "Abrir Portal" abaixo.</li>
              <li>Informe seu <strong>CPF</strong> e sua <strong>Senha</strong> do portal municipal.</li>
              <li>Vá na aba "Pessoal" e depois em "Contracheque".</li>
              <li>Selecione o mês desejado e clique em imprimir.</li>
            </ol>
          </div>

          <a 
            href={PAYSLIP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full block bg-emerald-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-emerald-700 hover:shadow-lg transition-all"
          >
            Abrir Portal Municipal ↗️
          </a>
          
          <p className="text-xs text-slate-400">
            Link oficial: {PAYSLIP_URL}
          </p>
        </div>
      </div>

      <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
        <div className="flex space-x-3">
          <span className="text-xl">⚠️</span>
          <div>
            <h4 className="font-bold text-amber-800 text-sm">Problemas com o acesso?</h4>
            <p className="text-sm text-amber-700">
              Caso não lembre sua senha ou o site da prefeitura esteja fora do ar, 
              entre em contato com o RH da Secretaria de Saúde de Mulungu do Morro.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayslipSection;
