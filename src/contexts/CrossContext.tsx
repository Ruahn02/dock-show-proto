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

// Dados iniciais de cross docking
const crossIniciais: CrossDocking[] = [
  { id: 'cross1', cargaId: 'cg1', fornecedorId: 'f4', nfs: ['NF-001'], data: '2026-02-04', rua: 'A-15', volumeRecebido: 180, status: 'aguardando_decisao' },
  { id: 'cross2', cargaId: 'cg2', fornecedorId: 'f6', nfs: ['NF-002'], data: '2026-02-04', rua: 'C-22', volumeRecebido: 215, status: 'cross_confirmado', numeroCross: 'CX-001' },
  { id: 'cross3', cargaId: 'cg10', fornecedorId: 'f1', nfs: ['NF-070'], data: '2026-02-03', rua: 'D-02', volumeRecebido: 130, status: 'aguardando_separacao', numeroCross: 'CX-002' },
  { id: 'cross4', cargaId: 'cg11', fornecedorId: 'f2', nfs: ['NF-071'], data: '2026-02-03', rua: 'E-10', volumeRecebido: 185, status: 'em_separacao', numeroCross: 'CX-003', separadorId: 'c6' },
  { id: 'cross5', cargaId: 'cg12', fornecedorId: 'f4', nfs: ['NF-072'], data: '2026-02-03', rua: 'A-08', volumeRecebido: 90, status: 'finalizado', numeroCross: 'CX-004', separadorId: 'c8', temDivergencia: false },
];

export function CrossProvider({ children }: { children: ReactNode }) {
  const [crossItems, setCrossItems] = useState<CrossDocking[]>(crossIniciais);

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
