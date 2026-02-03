import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Senha, StatusSenha, LocalSenha, Carga, TipoCaminhao } from '@/types';
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

interface GerarSenhaData {
  fornecedorId: string;
  nomeMotorista: string;
  tipoCaminhao: TipoCaminhao;
}

interface SenhaContextType {
  senhas: Senha[];
  cargas: Carga[];
  gerarSenha: (data: GerarSenhaData) => Senha;
  atualizarSenha: (senhaId: string, updates: Partial<Senha>) => void;
  getSenhaById: (senhaId: string) => Senha | undefined;
  getSenhaByFornecedor: (fornecedorId: string) => Senha | undefined;
  getSenhasAtivas: () => Senha[];
  vincularSenhaADoca: (senhaId: string, docaNumero: number) => void;
  liberarSenha: (senhaId: string) => void;
  moverParaPatio: (senhaId: string, rua: string) => void;
  retomarDoPatio: (senhaId: string, docaNumero: number) => void;
  atualizarLocalSenha: (senhaId: string, local: LocalSenha) => void;
  atualizarStatusSenha: (senhaId: string, status: StatusSenha) => void;
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

  // Gerar nova senha - permite múltiplas senhas do mesmo fornecedor
  const gerarSenha = useCallback((data: GerarSenhaData): Senha => {
    const novaSenha: Senha = {
      id: `s${Date.now()}`,
      numero: contadorSenha++,
      fornecedorId: data.fornecedorId,
      nomeMotorista: data.nomeMotorista,
      tipoCaminhao: data.tipoCaminhao,
      status: 'aguardando_doca',
      localAtual: 'aguardando_doca',
      horaChegada: format(new Date(), 'HH:mm'),
      liberada: false,
    };

    setSenhas(prev => [...prev, novaSenha]);
    return novaSenha;
  }, []);

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
      s => s.fornecedorId === fornecedorId && !s.liberada
    );
  }, [senhas]);

  // Retorna senhas que não foram liberadas (para controle admin)
  const getSenhasAtivas = useCallback(() => {
    return senhas.filter(s => !s.liberada);
  }, [senhas]);

  // Vincular senha a uma doca
  const vincularSenhaADoca = useCallback((senhaId: string, docaNumero: number) => {
    setSenhas(prev => prev.map(s => 
      s.id === senhaId 
        ? { ...s, status: 'em_doca' as StatusSenha, localAtual: 'em_doca' as LocalSenha, docaNumero } 
        : s
    ));
  }, []);

  // Liberar senha (ação final do admin)
  const liberarSenha = useCallback((senhaId: string) => {
    setSenhas(prev => prev.map(s => 
      s.id === senhaId ? { ...s, liberada: true } : s
    ));
  }, []);

  // Mover senha para pátio
  const moverParaPatio = useCallback((senhaId: string, rua: string) => {
    setSenhas(prev => prev.map(s => 
      s.id === senhaId 
        ? { ...s, localAtual: 'em_patio' as LocalSenha, rua, docaNumero: undefined } 
        : s
    ));
  }, []);

  // Retomar do pátio para doca
  const retomarDoPatio = useCallback((senhaId: string, docaNumero: number) => {
    setSenhas(prev => prev.map(s => 
      s.id === senhaId 
        ? { ...s, localAtual: 'em_doca' as LocalSenha, status: 'em_doca' as StatusSenha, docaNumero, rua: undefined } 
        : s
    ));
  }, []);

  // Atualizar local da senha
  const atualizarLocalSenha = useCallback((senhaId: string, local: LocalSenha) => {
    setSenhas(prev => prev.map(s => 
      s.id === senhaId ? { ...s, localAtual: local } : s
    ));
  }, []);

  // Atualizar status da senha
  const atualizarStatusSenha = useCallback((senhaId: string, status: StatusSenha) => {
    setSenhas(prev => prev.map(s => 
      s.id === senhaId ? { ...s, status } : s
    ));
  }, []);

  const vincularCargaADoca = useCallback((cargaId: string, docaNumero: number) => {
    // Encontrar a senha relacionada a esta carga
    const carga = cargas.find(c => c.id === cargaId);
    if (carga?.senhaId) {
      setSenhas(prev => prev.map(s => 
        s.id === carga.senhaId 
          ? { ...s, status: 'em_doca' as StatusSenha, localAtual: 'em_doca' as LocalSenha, docaNumero } 
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
      getSenhasAtivas,
      vincularSenhaADoca,
      liberarSenha,
      moverParaPatio,
      retomarDoPatio,
      atualizarLocalSenha,
      atualizarStatusSenha,
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
