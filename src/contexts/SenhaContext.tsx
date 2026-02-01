import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Senha, StatusSenha, Carga, TipoCaminhao } from '@/types';
import { cargasIniciais, fornecedores } from '@/data/mockData';
import { format } from 'date-fns';

interface AdicionarCargaData {
  data: string;
  fornecedorId: string;
  nfs: string[];
  volumePrevisto: number;
  horarioPrevisto?: string;
  tipoCaminhao?: TipoCaminhao;
  quantidadeVeiculos?: number;
  solicitacaoId?: string;
}

interface SenhaContextType {
  senhas: Senha[];
  cargas: Carga[];
  gerarSenha: (fornecedorId: string) => Senha | null;
  atualizarSenha: (senhaId: string, updates: Partial<Senha>) => void;
  getSenhaById: (senhaId: string) => Senha | undefined;
  getSenhaByFornecedor: (fornecedorId: string) => Senha | undefined;
  vincularCargaADoca: (cargaId: string, docaNumero: number) => void;
  recusarCarga: (cargaId: string) => void;
  marcarChegada: (cargaId: string, senhaId: string) => void;
  atualizarCarga: (cargaId: string, updates: Partial<Carga>) => void;
  getCargasDisponiveis: () => Carga[];
  adicionarCarga: (data: AdicionarCargaData) => void;
}

const SenhaContext = createContext<SenhaContextType | undefined>(undefined);

let contadorSenha = 1;

export function SenhaProvider({ children }: { children: ReactNode }) {
  const [senhas, setSenhas] = useState<Senha[]>([]);
  const [cargas, setCargas] = useState<Carga[]>(cargasIniciais);

  const gerarSenha = useCallback((fornecedorId: string): Senha | null => {
    // Verificar se o fornecedor tem carga agendada para hoje
    const hoje = format(new Date(2026, 0, 24), 'yyyy-MM-dd'); // Data simulada
    const cargaHoje = cargas.find(
      c => c.fornecedorId === fornecedorId && 
           c.data === hoje && 
           c.status === 'aguardando_chegada' &&
           !c.chegou
    );

    if (!cargaHoje) {
      return null;
    }

    // Verificar se já existe senha ativa para este fornecedor
    const senhaExistente = senhas.find(
      s => s.fornecedorId === fornecedorId && s.status !== 'recusado'
    );

    if (senhaExistente) {
      return senhaExistente;
    }

    const novaSenha: Senha = {
      id: `s${Date.now()}`,
      numero: contadorSenha++,
      fornecedorId,
      cargaId: cargaHoje.id,
      status: 'aguardando',
      horaChegada: format(new Date(), 'HH:mm'),
    };

    setSenhas(prev => [...prev, novaSenha]);
    
    // Marcar a carga como "chegou"
    setCargas(prev => prev.map(c => 
      c.id === cargaHoje.id ? { ...c, chegou: true, senhaId: novaSenha.id } : c
    ));

    return novaSenha;
  }, [senhas, cargas]);

  const atualizarSenha = useCallback((senhaId: string, updates: Partial<Senha>) => {
    setSenhas(prev => prev.map(s => 
      s.id === senhaId ? { ...s, ...updates } : s
    ));
  }, []);

  const getSenhaById = useCallback((senhaId: string) => {
    return senhas.find(s => s.id === senhaId);
  }, [senhas]);

  const getSenhaByFornecedor = useCallback((fornecedorId: string) => {
    return senhas.find(
      s => s.fornecedorId === fornecedorId && s.status !== 'recusado'
    );
  }, [senhas]);

  const vincularCargaADoca = useCallback((cargaId: string, docaNumero: number) => {
    // Encontrar a senha relacionada a esta carga
    const carga = cargas.find(c => c.id === cargaId);
    if (carga?.senhaId) {
      setSenhas(prev => prev.map(s => 
        s.id === carga.senhaId 
          ? { ...s, status: 'chamado' as StatusSenha, docaNumero } 
          : s
      ));
    }
  }, [cargas]);

  const recusarCarga = useCallback((cargaId: string) => {
    // Atualizar a carga
    setCargas(prev => prev.map(c => 
      c.id === cargaId ? { ...c, status: 'recusado' } : c
    ));

    // Atualizar a senha se existir
    const carga = cargas.find(c => c.id === cargaId);
    if (carga?.senhaId) {
      setSenhas(prev => prev.map(s => 
        s.id === carga.senhaId ? { ...s, status: 'recusado' as StatusSenha } : s
      ));
    }
  }, [cargas]);

  const marcarChegada = useCallback((cargaId: string, senhaId: string) => {
    setCargas(prev => prev.map(c => 
      c.id === cargaId ? { ...c, chegou: true, senhaId } : c
    ));
  }, []);

  const atualizarCarga = useCallback((cargaId: string, updates: Partial<Carga>) => {
    setCargas(prev => prev.map(c => 
      c.id === cargaId ? { ...c, ...updates } : c
    ));
  }, []);

  const getCargasDisponiveis = useCallback(() => {
    const hoje = format(new Date(2026, 0, 24), 'yyyy-MM-dd');
    return cargas.filter(c => 
      c.data === hoje && 
      c.status === 'aguardando_chegada' &&
      c.chegou === true
    );
  }, [cargas]);

  const adicionarCarga = useCallback((data: AdicionarCargaData) => {
    const novaCarga: Carga = {
      id: `cg${Date.now()}`,
      data: data.data,
      fornecedorId: data.fornecedorId,
      nfs: data.nfs,
      volumePrevisto: data.volumePrevisto,
      status: 'aguardando_chegada',
      horarioPrevisto: data.horarioPrevisto,
      tipoCaminhao: data.tipoCaminhao,
      quantidadeVeiculos: data.quantidadeVeiculos,
      solicitacaoId: data.solicitacaoId,
    };
    setCargas(prev => [...prev, novaCarga]);
  }, []);

  return (
    <SenhaContext.Provider value={{
      senhas,
      cargas,
      gerarSenha,
      atualizarSenha,
      getSenhaById,
      getSenhaByFornecedor,
      vincularCargaADoca,
      recusarCarga,
      marcarChegada,
      atualizarCarga,
      getCargasDisponiveis,
      adicionarCarga,
    }}>
      {children}
    </SenhaContext.Provider>
  );
}

export function useSenha() {
  const context = useContext(SenhaContext);
  if (context === undefined) {
    throw new Error('useSenha must be used within a SenhaProvider');
  }
  return context;
}
