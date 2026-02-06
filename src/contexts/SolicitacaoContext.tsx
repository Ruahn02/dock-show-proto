import React, { createContext, useContext, useState, ReactNode } from 'react';
import { SolicitacaoEntrega, StatusSolicitacao, TipoCaminhao } from '@/types';
import { useSenha } from './SenhaContext';
import { format } from 'date-fns';

interface SolicitacaoContextType {
  solicitacoes: SolicitacaoEntrega[];
  criarSolicitacao: (data: Omit<SolicitacaoEntrega, 'id' | 'status' | 'dataSolicitacao'>) => void;
  aprovarSolicitacao: (id: string, dataAgendada: string, horarioAgendado: string) => void;
  recusarSolicitacao: (id: string) => void;
  getSolicitacoesPendentes: () => SolicitacaoEntrega[];
}

const SolicitacaoContext = createContext<SolicitacaoContextType | undefined>(undefined);

// Mock initial data
const solicitacoesIniciais: SolicitacaoEntrega[] = [
  {
    id: 'sol1',
    fornecedorId: 'f1',
    tipoCaminhao: 'truck',
    quantidadeVeiculos: 1,
    volumePrevisto: 180,
    observacoes: 'Entregar pela manhã',
    status: 'pendente',
    dataSolicitacao: '2026-02-03',
    emailContato: 'contato@abc.com.br',
  },
  {
    id: 'sol2',
    fornecedorId: 'f3',
    tipoCaminhao: 'carreta',
    quantidadeVeiculos: 2,
    volumePrevisto: 350,
    status: 'pendente',
    dataSolicitacao: '2026-02-03',
    emailContato: 'agendamento@logexpress.com',
  },
  {
    id: 'sol3',
    fornecedorId: 'f8',
    tipoCaminhao: 'bi_truck',
    quantidadeVeiculos: 1,
    volumePrevisto: 200,
    observacoes: 'Carga frágil',
    status: 'pendente',
    dataSolicitacao: '2026-02-04',
    emailContato: 'agendamento@megaatacado.com',
  },
  {
    id: 'sol4',
    fornecedorId: 'f5',
    tipoCaminhao: 'truck',
    quantidadeVeiculos: 1,
    volumePrevisto: 150,
    status: 'aprovada',
    dataSolicitacao: '2026-02-01',
    dataAgendada: '2026-02-04',
    horarioAgendado: '14:00',
    emailContato: 'operacoes@centralcargas.com',
  },
  {
    id: 'sol5',
    fornecedorId: 'f2',
    tipoCaminhao: 'van',
    quantidadeVeiculos: 1,
    volumePrevisto: 60,
    observacoes: 'Volume incompatível',
    status: 'recusada',
    dataSolicitacao: '2026-02-01',
    emailContato: 'logistica@atacadonacional.com',
  },
];

export function SolicitacaoProvider({ children }: { children: ReactNode }) {
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoEntrega[]>(solicitacoesIniciais);
  const { adicionarCarga } = useSenha();

  const criarSolicitacao = (data: Omit<SolicitacaoEntrega, 'id' | 'status' | 'dataSolicitacao'>) => {
    const novaSolicitacao: SolicitacaoEntrega = {
      ...data,
      id: `sol${Date.now()}`,
      status: 'pendente',
      dataSolicitacao: format(new Date(), 'yyyy-MM-dd'),
    };
    setSolicitacoes(prev => [...prev, novaSolicitacao]);
  };

  const aprovarSolicitacao = (id: string, dataAgendada: string, horarioAgendado: string) => {
    setSolicitacoes(prev => prev.map(sol => {
      if (sol.id === id) {
        // Create a new Carga from the approved solicitation
        adicionarCarga({
          data: dataAgendada,
          fornecedorId: sol.fornecedorId,
          nfs: [],
          volumePrevisto: sol.volumePrevisto,
          horarioPrevisto: horarioAgendado,
          tipoCaminhao: sol.tipoCaminhao,
          quantidadeVeiculos: sol.quantidadeVeiculos,
          solicitacaoId: sol.id,
        });
        
        return {
          ...sol,
          status: 'aprovada' as StatusSolicitacao,
          dataAgendada,
          horarioAgendado,
        };
      }
      return sol;
    }));
  };

  const recusarSolicitacao = (id: string) => {
    setSolicitacoes(prev => prev.map(sol => 
      sol.id === id ? { ...sol, status: 'recusada' as StatusSolicitacao } : sol
    ));
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
