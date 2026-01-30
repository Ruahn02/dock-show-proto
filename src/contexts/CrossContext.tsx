import { createContext, useContext, useState, ReactNode } from 'react';
import { CrossDocking, StatusCross } from '@/types';

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
  adicionarCross: (data: NovoCrossData) => void;
  armazenarCarga: (id: string) => void;
  confirmarCross: (id: string) => void;
  montarCross: (id: string, numeroCross: string) => void;
  iniciarSeparacao: (id: string, separadorId: string) => void;
  finalizarSeparacao: (id: string, temDivergencia: boolean, observacao?: string) => void;
  getCrossParaAdmin: () => CrossDocking[];
  getCrossParaOperacional: () => CrossDocking[];
}

const CrossContext = createContext<CrossContextType | undefined>(undefined);

export function CrossProvider({ children }: { children: ReactNode }) {
  const [crossItems, setCrossItems] = useState<CrossDocking[]>([]);

  const adicionarCross = (data: NovoCrossData) => {
    const novoCross: CrossDocking = {
      id: `cross_${Date.now()}`,
      cargaId: data.cargaId,
      fornecedorId: data.fornecedorId,
      nfs: data.nfs,
      data: data.data,
      rua: data.rua,
      volumeRecebido: data.volumeRecebido,
      status: 'aguardando_decisao'
    };
    setCrossItems(prev => [...prev, novoCross]);
  };

  const armazenarCarga = (id: string) => {
    // Remove da lista - não é cross
    setCrossItems(prev => prev.filter(item => item.id !== id));
  };

  const confirmarCross = (id: string) => {
    setCrossItems(prev => prev.map(item => 
      item.id === id ? { ...item, status: 'cross_confirmado' as StatusCross } : item
    ));
  };

  const montarCross = (id: string, numeroCross: string) => {
    setCrossItems(prev => prev.map(item => 
      item.id === id ? { 
        ...item, 
        status: 'aguardando_separacao' as StatusCross,
        numeroCross 
      } : item
    ));
  };

  const iniciarSeparacao = (id: string, separadorId: string) => {
    setCrossItems(prev => prev.map(item => 
      item.id === id ? { 
        ...item, 
        status: 'em_separacao' as StatusCross,
        separadorId 
      } : item
    ));
  };

  const finalizarSeparacao = (id: string, temDivergencia: boolean, observacao?: string) => {
    setCrossItems(prev => prev.map(item => 
      item.id === id ? { 
        ...item, 
        status: 'finalizado' as StatusCross,
        temDivergencia,
        observacao 
      } : item
    ));
  };

  const getCrossParaAdmin = () => {
    return crossItems.filter(item => 
      item.status === 'aguardando_decisao' || 
      item.status === 'cross_confirmado' ||
      item.status === 'aguardando_separacao'
    );
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
