import { createContext, useContext, ReactNode } from 'react';
import { CrossDocking, StatusCross } from '@/types';
import { useCrossDB } from '@/hooks/useCrossDB';

interface NovoCrossData {
  cargaId: string;
  fornecedorId: string;
  nfs: string[];
  data: string;
  rua: string;
  volumeRecebido: number;
}

interface CrossContextType {
  crossItems: CrossDocking[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  adicionarCross: (data: NovoCrossData) => Promise<void>;
  armazenarCarga: (id: string) => Promise<void>;
  confirmarCross: (id: string) => Promise<void>;
  montarCross: (id: string, numeroCross: string) => Promise<void>;
  iniciarSeparacao: (id: string, separadorId: string) => Promise<void>;
  finalizarSeparacao: (id: string, temDivergencia: boolean, observacao?: string) => Promise<void>;
  getCrossParaAdmin: () => CrossDocking[];
  getCrossParaOperacional: () => CrossDocking[];
}

const CrossContext = createContext<CrossContextType | undefined>(undefined);

export function CrossProvider({ children }: { children: ReactNode }) {
  const { crossItems, criarCross, atualizarCross, deletarCross, loading, error, refetch } = useCrossDB();

  const adicionarCross = async (data: NovoCrossData) => {
    await criarCross(data);
  };

  const armazenarCarga = async (id: string) => {
    await atualizarCross(id, { status: 'armazenado' as StatusCross });
  };

  const confirmarCross = async (id: string) => {
    await atualizarCross(id, { status: 'cross_confirmado' as StatusCross });
  };

  const montarCross = async (id: string, numeroCross: string) => {
    await atualizarCross(id, {
      status: 'aguardando_separacao' as StatusCross,
      numeroCross,
    });
  };

  const iniciarSeparacao = async (id: string, separadorId: string) => {
    await atualizarCross(id, {
      status: 'em_separacao' as StatusCross,
      separadorId,
    });
  };

  const finalizarSeparacao = async (id: string, temDivergencia: boolean, observacao?: string) => {
    await atualizarCross(id, {
      status: 'finalizado' as StatusCross,
      temDivergencia,
      observacao,
    });
  };

  const getCrossParaAdmin = () => {
    return crossItems;
  };

  const getCrossParaOperacional = () => {
    return crossItems.filter(item =>
      item.status === 'aguardando_separacao' ||
      item.status === 'em_separacao'
    );
  };

  return (
    <CrossContext.Provider value={{
      crossItems,
      adicionarCross,
      armazenarCarga,
      confirmarCross,
      montarCross,
      iniciarSeparacao,
      finalizarSeparacao,
      getCrossParaAdmin,
      getCrossParaOperacional
    }}>
      {children}
    </CrossContext.Provider>
  );
}

export function useCross() {
  const context = useContext(CrossContext);
  if (!context) {
    throw new Error('useCross must be used within a CrossProvider');
  }
  return context;
}
