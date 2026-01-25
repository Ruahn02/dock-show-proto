export type Perfil = 'administrador' | 'operacional';

export type StatusDoca = 'livre' | 'ocupada' | 'uso_consumo';

export type StatusCarga = 'aguardando_chegada' | 'em_conferencia' | 'conferido' | 'no_show' | 'recusado';

export interface Fornecedor {
  id: string;
  nome: string;
  ativo: boolean;
}

export interface Conferente {
  id: string;
  nome: string;
  ativo: boolean;
}

export interface Carga {
  id: string;
  data: string;
  fornecedorId: string;
  nfs: string[];
  volumePrevisto: number;
  volumeConferido?: number;
  status: StatusCarga;
  docaId?: string;
  conferenteId?: string;
  rua?: string;
  divergencia?: string;
}

export interface Doca {
  id: string;
  numero: number;
  status: StatusDoca;
  cargaId?: string;
  conferenteId?: string;
  volumeConferido?: number;
  rua?: string;
}

export interface DashboardPorPeriodo {
  totalVolumes: number;
  cargasConferidas: number;
  docasLivres: number;
  docasOcupadas: number;
}
