import { useSenha } from '@/contexts/SenhaContext';
import { useFornecedoresDB } from '@/hooks/useFornecedoresDB';
import { Truck } from 'lucide-react';

const statusPainelMap: Record<string, { text: string; bg: string }> = {
  aguardando_doca: { text: 'AGUARDANDO DOCA', bg: 'bg-blue-600' },
  em_doca: { text: 'DIRIJA-SE À DOCA', bg: 'bg-yellow-500' },
  aguardando_conferencia: { text: 'AGUARDANDO CONFERÊNCIA', bg: 'bg-orange-500' },
  em_conferencia: { text: 'EM CONFERÊNCIA', bg: 'bg-green-500' },
  conferido: { text: 'CONFERIDO', bg: 'bg-emerald-600' },
  recusado: { text: 'RECUSADO', bg: 'bg-red-600' },
};

export default function PainelSenhas() {
  const { getSenhasAtivas } = useSenha();
  const { fornecedores } = useFornecedoresDB();
  const senhasAtivas = getSenhasAtivas();

  const getFornecedorNome = (id: string) =>
    fornecedores.find(f => f.id === id)?.nome || 'N/A';

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Truck className="h-8 w-8 text-blue-400" />
          <h1 className="text-3xl md:text-4xl font-bold tracking-wide">PAINEL DE SENHAS</h1>
        </div>
        <p className="text-slate-400 text-sm">Atualização automática</p>
      </div>

      {senhasAtivas.length === 0 ? (
        <div className="text-center text-slate-500 text-xl mt-20">
          Nenhuma senha ativa no momento
        </div>
      ) : (
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-3 gap-4 px-4 py-3 bg-slate-800 rounded-t-lg text-slate-400 text-sm font-semibold uppercase tracking-wider">
            <div>Senha</div>
            <div>Fornecedor</div>
            <div className="text-center">Status</div>
          </div>

          {senhasAtivas.map((senha) => {
            const statusInfo = statusPainelMap[senha.status] || { text: senha.status, bg: 'bg-gray-600' };
            const statusText = senha.status === 'em_doca' && senha.docaNumero
              ? `DIRIJA-SE À DOCA ${senha.docaNumero}`
              : statusInfo.text;

            return (
              <div
                key={senha.id}
                className="grid grid-cols-3 gap-4 px-4 py-4 border-b border-slate-700 items-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-blue-300">
                  {String(senha.numero).padStart(4, '0')}
                </div>
                <div className="text-lg md:text-xl font-medium truncate">
                  {getFornecedorNome(senha.fornecedorId)}
                </div>
                <div className="text-center">
                  <span className={`${statusInfo.bg} text-white px-3 py-2 rounded-lg text-sm md:text-base font-bold inline-block min-w-[180px]`}>
                    {statusText}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
