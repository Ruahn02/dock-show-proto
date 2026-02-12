import { createContext, useContext, useCallback, ReactNode } from 'react';
import { Senha, StatusSenha, LocalSenha, Carga, TipoCaminhao } from '@/types';
import { useSenhasDB } from '@/hooks/useSenhasDB';
import { useCargasDB } from '@/hooks/useCargasDB';
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
  gerarSenha: (data: GerarSenhaData) => Promise<Senha>;
  atualizarSenha: (senhaId: string, updates: Partial<Senha>) => Promise<void>;
  getSenhaById: (senhaId: string) => Senha | undefined;
  getSenhaByFornecedor: (fornecedorId: string) => Senha | undefined;
  getSenhasAtivas: () => Senha[];
  vincularSenhaADoca: (senhaId: string, docaNumero: number) => Promise<void>;
  liberarSenha: (senhaId: string) => Promise<void>;
  moverParaPatio: (senhaId: string) => Promise<void>;
  retomarDoPatio: (senhaId: string, docaNumero: number) => Promise<void>;
  atualizarLocalSenha: (senhaId: string, local: LocalSenha) => Promise<void>;
  atualizarStatusSenha: (senhaId: string, status: StatusSenha) => Promise<void>;
  vincularCargaADoca: (cargaId: string, docaNumero: number) => void;
  recusarCarga: (cargaId: string) => Promise<void>;
  marcarChegada: (cargaId: string, senhaId: string) => Promise<void>;
  atualizarCarga: (cargaId: string, updates: Partial<Carga>) => Promise<void>;
  getCargasDisponiveis: () => Carga[];
  adicionarCarga: (data: AdicionarCargaData) => Promise<void>;
}

const SenhaContext = createContext<SenhaContextType | undefined>(undefined);

export function SenhaProvider({ children }: { children: ReactNode }) {
  const { senhas, criarSenha: criarSenhaDB, atualizarSenha: atualizarSenhaDB } = useSenhasDB();
  const { cargas, criarCarga: criarCargaDB, atualizarCarga: atualizarCargaDB } = useCargasDB();

  const gerarSenha = useCallback(async (data: GerarSenhaData): Promise<Senha> => {
    const nova = await criarSenhaDB({
      fornecedorId: data.fornecedorId,
      nomeMotorista: data.nomeMotorista,
      tipoCaminhao: data.tipoCaminhao,
      horaChegada: format(new Date(), 'HH:mm'),
    });
    return nova;
  }, [criarSenhaDB]);

  const atualizarSenha = useCallback(async (senhaId: string, updates: Partial<Senha>) => {
    await atualizarSenhaDB(senhaId, updates);
  }, [atualizarSenhaDB]);

  const getSenhaById = useCallback((senhaId: string) => {
    return senhas.find(s => s.id === senhaId);
  }, [senhas]);

  const getSenhaByFornecedor = useCallback((fornecedorId: string) => {
    return senhas.find(s => s.fornecedorId === fornecedorId && !s.liberada);
  }, [senhas]);

  const getSenhasAtivas = useCallback(() => {
    return senhas.filter(s => !s.liberada);
  }, [senhas]);

  const vincularSenhaADoca = useCallback(async (senhaId: string, docaNumero: number) => {
    await atualizarSenhaDB(senhaId, {
      status: 'em_doca' as StatusSenha,
      localAtual: 'em_doca' as LocalSenha,
      docaNumero,
    });
  }, [atualizarSenhaDB]);

  const liberarSenha = useCallback(async (senhaId: string) => {
    await atualizarSenhaDB(senhaId, { liberada: true });
  }, [atualizarSenhaDB]);

  const moverParaPatio = useCallback(async (senhaId: string) => {
    await atualizarSenhaDB(senhaId, {
      localAtual: 'em_patio' as LocalSenha,
      docaNumero: undefined,
    });
  }, [atualizarSenhaDB]);

  const retomarDoPatio = useCallback(async (senhaId: string, docaNumero: number) => {
    await atualizarSenhaDB(senhaId, {
      localAtual: 'em_doca' as LocalSenha,
      status: 'em_doca' as StatusSenha,
      docaNumero,
      rua: undefined,
    });
  }, [atualizarSenhaDB]);

  const atualizarLocalSenha = useCallback(async (senhaId: string, local: LocalSenha) => {
    await atualizarSenhaDB(senhaId, { localAtual: local });
  }, [atualizarSenhaDB]);

  const atualizarStatusSenha = useCallback(async (senhaId: string, status: StatusSenha) => {
    await atualizarSenhaDB(senhaId, { status });
  }, [atualizarSenhaDB]);

  const vincularCargaADoca = useCallback((cargaId: string, docaNumero: number) => {
    const carga = cargas.find(c => c.id === cargaId);
    if (carga?.senhaId) {
      atualizarSenhaDB(carga.senhaId, {
        status: 'em_doca' as StatusSenha,
        localAtual: 'em_doca' as LocalSenha,
        docaNumero,
      });
    }
    // Atualizar status da carga para aguardando_conferencia
    atualizarCargaDB(cargaId, { status: 'aguardando_conferencia' });
  }, [cargas, atualizarSenhaDB, atualizarCargaDB]);

  const recusarCarga = useCallback(async (cargaId: string) => {
    await atualizarCargaDB(cargaId, { status: 'recusado' as any });
    const carga = cargas.find(c => c.id === cargaId);
    if (carga?.senhaId) {
      await atualizarSenhaDB(carga.senhaId, { 
        status: 'recusado' as StatusSenha,
        localAtual: 'aguardando_doca' as LocalSenha,
        docaNumero: undefined,
      });
    }
  }, [cargas, atualizarCargaDB, atualizarSenhaDB]);

  const marcarChegada = useCallback(async (cargaId: string, senhaId: string) => {
    await atualizarCargaDB(cargaId, { chegou: true, senhaId });
  }, [atualizarCargaDB]);

  const atualizarCargaFn = useCallback(async (cargaId: string, updates: Partial<Carga>) => {
    await atualizarCargaDB(cargaId, updates);
  }, [atualizarCargaDB]);

  const getCargasDisponiveis = useCallback(() => {
    return cargas.filter(c =>
      c.status === 'aguardando_chegada' &&
      c.chegou === true
    );
  }, [cargas]);

  const adicionarCarga = useCallback(async (data: AdicionarCargaData) => {
    await criarCargaDB({
      data: data.data,
      fornecedorId: data.fornecedorId,
      nfs: data.nfs,
      volumePrevisto: data.volumePrevisto,
      horarioPrevisto: data.horarioPrevisto,
      tipoCaminhao: data.tipoCaminhao,
      quantidadeVeiculos: data.quantidadeVeiculos,
      solicitacaoId: data.solicitacaoId,
    });
  }, [criarCargaDB]);

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
      atualizarCarga: atualizarCargaFn,
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
