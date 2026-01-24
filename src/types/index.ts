export type Perfil = 'administrador' | 'operacional';

export type StatusDoca = 'livre' | 'conferindo' | 'conferido' | 'uso_consumo';

export type StatusCarga = 'agendado' | 'em_conferencia' | 'conferido' | 'no_show' | 'recusado';

export interface Fornecedor {
  id: string;
  nome: string;
  cnpj: string;
  contato: string;
  ativo: boolean;
}

export interface Conferente {
  id: string;
  nome: string;
  matricula: string;
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

export interface DashboardIndicadores {
  totalVolumes: number;
  mediaVolumesConferente: number;
  cargasConferidas: number;
  cargasNoShow: number;
  cargasRecusadas: number;
  docasLivres: number;
  docasOcupadas: number;
  docasConferindo: number;
}

export interface ProdutividadeConferente {
  conferenteId: string;
  nome: string;
  volumes: number;
}
