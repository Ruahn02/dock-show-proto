import React, { createContext, useContext, ReactNode } from 'react';
import { SolicitacaoEntrega, StatusSolicitacao } from '@/types';
import { useSolicitacoesDB } from '@/hooks/useSolicitacoesDB';
import { useFornecedoresDB } from '@/hooks/useFornecedoresDB';
import { useSenha } from './SenhaContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SolicitacaoContextType {
  solicitacoes: SolicitacaoEntrega[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  criarSolicitacao: (data: Omit<SolicitacaoEntrega, 'id' | 'status' | 'dataSolicitacao'>) => Promise<void>;
  aprovarSolicitacao: (id: string, dataAgendada: string, horarioAgendado: string) => Promise<void>;
  aprovarSolicitacaoUnificada: (solicitacaoId: string, cargaExistenteId: string, dataAgendada: string, horarioAgendado: string) => Promise<void>;
  recusarSolicitacao: (id: string) => Promise<void>;
  getSolicitacoesPendentes: () => SolicitacaoEntrega[];
}

const SolicitacaoContext = createContext<SolicitacaoContextType | undefined>(undefined);

async function enviarEmail(params: {
  to: string;
  type: 'aprovada' | 'recusada';
  fornecedorNome: string;
  dataAgendada?: string;
  horarioAgendado?: string;
}) {
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: params,
    });
    if (error) {
      console.error('Erro ao enviar e-mail:', error);
      toast.warning('A solicitação foi processada, mas o e-mail de notificação falhou.');
    }
  } catch (err) {
    console.error('Erro ao chamar edge function:', err);
    toast.warning('A solicitação foi processada, mas o e-mail de notificação falhou.');
  }
}

export function SolicitacaoProvider({ children }: { children: ReactNode }) {
  const { solicitacoes, criarSolicitacao: criarDB, atualizarSolicitacao: atualizarDB } = useSolicitacoesDB();
  const { fornecedores } = useFornecedoresDB();
  const { adicionarCarga, atualizarCarga, cargas } = useSenha();

  const getFornecedorNome = (id: string) => fornecedores.find(f => f.id === id)?.nome || 'Fornecedor';

  const criarSolicitacao = async (data: Omit<SolicitacaoEntrega, 'id' | 'status' | 'dataSolicitacao'>) => {
    await criarDB(data);
  };

  const aprovarSolicitacao = async (id: string, dataAgendada: string, horarioAgendado: string) => {
    const sol = solicitacoes.find(s => s.id === id);
    if (!sol) return;

    await atualizarDB(id, {
      status: 'aprovada' as StatusSolicitacao,
      dataAgendada,
      horarioAgendado,
    });

    await adicionarCarga({
      data: dataAgendada,
      fornecedorId: sol.fornecedorId,
      nfs: sol.notaFiscal ? [sol.notaFiscal] : [],
      volumePrevisto: sol.volumePrevisto,
      horarioPrevisto: horarioAgendado,
      tipoCaminhao: sol.tipoCaminhao,
      quantidadeVeiculos: sol.quantidadeVeiculos,
      solicitacaoId: sol.id,
    });

    // Enviar e-mail em paralelo (não bloqueia)
    enviarEmail({
      to: sol.emailContato,
      type: 'aprovada',
      fornecedorNome: getFornecedorNome(sol.fornecedorId),
      dataAgendada,
      horarioAgendado,
    });
  };

  const recusarSolicitacao = async (id: string) => {
    const sol = solicitacoes.find(s => s.id === id);
    if (!sol) return;

    await atualizarDB(id, { status: 'recusada' as StatusSolicitacao });

    // Enviar e-mail em paralelo (não bloqueia)
    enviarEmail({
      to: sol.emailContato,
      type: 'recusada',
      fornecedorNome: getFornecedorNome(sol.fornecedorId),
    });
  };

  const getSolicitacoesPendentes = () => {
    return solicitacoes.filter(sol => sol.status === 'pendente');
  };

  const aprovarSolicitacaoUnificada = async (
    solicitacaoId: string,
    cargaExistenteId: string,
    dataAgendada: string,
    horarioAgendado: string
  ) => {
    const sol = solicitacoes.find(s => s.id === solicitacaoId);
    if (!sol) return;

    const cargaExistente = cargas.find(c => c.id === cargaExistenteId);
    if (!cargaExistente) return;

    await atualizarDB(solicitacaoId, {
      status: 'aprovada' as StatusSolicitacao,
      dataAgendada,
      horarioAgendado,
    });

    await atualizarCarga(cargaExistenteId, {
      volumePrevisto: (cargaExistente.volumePrevisto || 0) + (sol.volumePrevisto || 0),
      quantidadeVeiculos: (cargaExistente.quantidadeVeiculos || 0) + (sol.quantidadeVeiculos || 0),
    });

    enviarEmail({
      to: sol.emailContato,
      type: 'aprovada',
      fornecedorNome: getFornecedorNome(sol.fornecedorId),
      dataAgendada,
      horarioAgendado,
    });
  };

  return (
    <SolicitacaoContext.Provider value={{
      solicitacoes,
      criarSolicitacao,
      aprovarSolicitacao,
      aprovarSolicitacaoUnificada,
      recusarSolicitacao,
      getSolicitacoesPendentes,
    }}>
      {children}
    </SolicitacaoContext.Provider>
  );
}

export function useSolicitacao() {
  const context = useContext(SolicitacaoContext);
  if (context === undefined) {
    throw new Error('useSolicitacao must be used within a SolicitacaoProvider');
  }
  return context;
}
