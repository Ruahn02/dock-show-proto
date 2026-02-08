import React, { createContext, useContext, ReactNode } from 'react';
import { SolicitacaoEntrega, StatusSolicitacao } from '@/types';
import { useSolicitacoesDB } from '@/hooks/useSolicitacoesDB';
import { useSenha } from './SenhaContext';

interface SolicitacaoContextType {
  solicitacoes: SolicitacaoEntrega[];
  criarSolicitacao: (data: Omit<SolicitacaoEntrega, 'id' | 'status' | 'dataSolicitacao'>) => Promise<void>;
  aprovarSolicitacao: (id: string, dataAgendada: string, horarioAgendado: string) => Promise<void>;
  recusarSolicitacao: (id: string) => Promise<void>;
  getSolicitacoesPendentes: () => SolicitacaoEntrega[];
}

const SolicitacaoContext = createContext<SolicitacaoContextType | undefined>(undefined);

export function SolicitacaoProvider({ children }: { children: ReactNode }) {
  const { solicitacoes, criarSolicitacao: criarDB, atualizarSolicitacao: atualizarDB } = useSolicitacoesDB();
  const { adicionarCarga } = useSenha();

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
      nfs: [],
      volumePrevisto: sol.volumePrevisto,
      horarioPrevisto: horarioAgendado,
      tipoCaminhao: sol.tipoCaminhao,
      quantidadeVeiculos: sol.quantidadeVeiculos,
      solicitacaoId: sol.id,
    });
  };

  const recusarSolicitacao = async (id: string) => {
    await atualizarDB(id, { status: 'recusada' as StatusSolicitacao });
  };

  const getSolicitacoesPendentes = () => {
    return solicitacoes.filter(sol => sol.status === 'pendente');
  };

  return (
    <SolicitacaoContext.Provider value={{
      solicitacoes,
      criarSolicitacao,
      aprovarSolicitacao,
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
