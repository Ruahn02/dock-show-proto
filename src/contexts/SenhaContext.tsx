import { createContext, useContext, useCallback, ReactNode } from 'react';
import { Senha, StatusSenha, LocalSenha, Carga, TipoCaminhao } from '@/types';
import { useSenhasDB } from '@/hooks/useSenhasDB';
import { useCargasDB } from '@/hooks/useCargasDB';
import { supabase } from '@/integrations/supabase/client';
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
  cargaId?: string;
}

interface SenhaContextType {
  senhas: Senha[];
  cargas: Carga[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  gerarSenha: (data: GerarSenhaData) => Promise<Senha>;
  atualizarSenha: (senhaId: string, updates: Partial<Senha>) => Promise<void>;
  getSenhaById: (senhaId: string) => Senha | undefined;
  getSenhaByFornecedor: (fornecedorId: string) => Senha | undefined;
  getSenhasAtivas: () => Senha[];
  getSenhasByCarga: (cargaId: string) => Senha[];
  vincularSenhaADoca: (senhaId: string, docaNumero: number) => Promise<void>;
  liberarSenha: (senhaId: string) => Promise<void>;
  moverParaPatio: (senhaId: string) => Promise<void>;
  retomarDoPatio: (senhaId: string, docaNumero: number) => Promise<void>;
  atualizarLocalSenha: (senhaId: string, local: LocalSenha) => Promise<void>;
  atualizarStatusSenha: (senhaId: string, status: StatusSenha) => Promise<void>;
  vincularCargaADoca: (cargaId: string, docaNumero: number) => void;
  recusarCarga: (cargaId: string | null, senhaId?: string) => Promise<void>;
  atualizarCarga: (cargaId: string, updates: Partial<Carga>) => Promise<void>;
  getCargasDisponiveis: () => Carga[];
  adicionarCarga: (data: AdicionarCargaData) => Promise<void>;
  finalizarEntrega: (cargaId: string) => Promise<void>;
  excluirCarga: (cargaId: string) => Promise<void>;
}

const SenhaContext = createContext<SenhaContextType | undefined>(undefined);

export function SenhaProvider({ children }: { children: ReactNode }) {
  const { senhas, criarSenha: criarSenhaDB, atualizarSenha: atualizarSenhaDB, loading: loadingSenhas, error: errorSenhas, refetch: refetchSenhas } = useSenhasDB();
  const { cargas, criarCarga: criarCargaDB, atualizarCarga: atualizarCargaDB, excluirCarga: excluirCargaDB, loading: loadingCargas, error: errorCargas, refetch: refetchCargas } = useCargasDB();

  const loading = loadingSenhas || loadingCargas;
  const error = errorSenhas || errorCargas;
  const refetch = useCallback(() => { refetchSenhas(); refetchCargas(); }, [refetchSenhas, refetchCargas]);

  const gerarSenha = useCallback(async (data: GerarSenhaData): Promise<Senha> => {
    const nova = await criarSenhaDB({
      fornecedorId: data.fornecedorId,
      nomeMotorista: data.nomeMotorista,
      tipoCaminhao: data.tipoCaminhao,
      horaChegada: format(new Date(), 'HH:mm'),
      cargaId: data.cargaId,
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
    return senhas.filter(s => !s.liberada && s.status !== 'recusado');
  }, [senhas]);

  const getSenhasByCarga = useCallback((cargaId: string) => {
    return senhas.filter(s => s.cargaId === cargaId);
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
    // Find the senha for this carga that is aguardando_doca
    const senhaParaDoca = senhas.find(s =>
      s.cargaId === cargaId &&
      s.localAtual === 'aguardando_doca' &&
      !s.liberada
    );
    if (senhaParaDoca) {
      atualizarSenhaDB(senhaParaDoca.id, {
        status: 'em_doca' as StatusSenha,
        localAtual: 'em_doca' as LocalSenha,
        docaNumero,
      });
    }
    // BUG 8 fix: only update to aguardando_conferencia if not already in a more advanced state
    const cargaAtual = cargas.find(c => c.id === cargaId);
    if (cargaAtual && (cargaAtual.status === 'aguardando_chegada' || cargaAtual.status === 'aguardando_conferencia')) {
      atualizarCargaDB(cargaId, { status: 'aguardando_conferencia' });
    }
  }, [senhas, cargas, atualizarSenhaDB, atualizarCargaDB]);

  const recusarCarga = useCallback(async (cargaId: string | null, senhaId?: string) => {
    await supabase.rpc('rpc_atualizar_fluxo_carga', {
      p_carga_id: cargaId || null,
      p_senha_id: senhaId || null,
      p_novo_status: 'recusado',
    });
  }, []);

  const atualizarCargaFn = useCallback(async (cargaId: string, updates: Partial<Carga>) => {
    await atualizarCargaDB(cargaId, updates);
  }, [atualizarCargaDB]);

  const getCargasDisponiveis = useCallback(() => {
    return cargas.filter(c => {
      if (c.status !== 'aguardando_chegada' || !c.chegou) return false;
      // BUG 6 fix: hide cargas that already have all senhas emitted
      const limite = c.quantidadeVeiculos || 1;
      const senhasEmitidas = senhas.filter(
        s => s.cargaId === c.id && s.status !== 'recusado'
      ).length;
      return senhasEmitidas < limite;
    });
  }, [cargas, senhas]);

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

  const finalizarEntrega = useCallback(async (cargaId: string) => {
    const { error } = await supabase.rpc('rpc_finalizar_entrega', {
      p_carga_id: cargaId,
    });
    if (error) {
      console.error('Erro ao finalizar entrega:', error);
      throw error;
    }
  }, []);

  return (
    <SenhaContext.Provider value={{
      senhas,
      cargas,
      loading,
      error,
      refetch,
      gerarSenha,
      atualizarSenha,
      getSenhaById,
      getSenhaByFornecedor,
      getSenhasAtivas,
      getSenhasByCarga,
      vincularSenhaADoca,
      liberarSenha,
      moverParaPatio,
      retomarDoPatio,
      atualizarLocalSenha,
      atualizarStatusSenha,
      vincularCargaADoca,
      recusarCarga,
      atualizarCarga: atualizarCargaFn,
      getCargasDisponiveis,
      adicionarCarga,
      finalizarEntrega,
      excluirCarga: excluirCargaDB,
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
