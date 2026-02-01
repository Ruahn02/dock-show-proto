export type Perfil = 'administrador' | 'operacional';

export type StatusDoca = 'livre' | 'ocupada' | 'em_conferencia' | 'conferido' | 'uso_consumo';

export type StatusCarga = 'aguardando_chegada' | 'em_conferencia' | 'conferido' | 'no_show' | 'recusado';

export type StatusSenha = 'aguardando' | 'chamado' | 'recusado';

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
  chegou?: boolean;
  senhaId?: string;
  horarioPrevisto?: string;
  tipoCaminhao?: TipoCaminhao;
  quantidadeVeiculos?: number;
  solicitacaoId?: string;
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

export interface Senha {
  id: string;
  numero: number;
  fornecedorId: string;
  cargaId?: string;
  docaNumero?: number;
  status: StatusSenha;
  horaChegada: string;
}

export interface DashboardPorPeriodo {
  totalVolumes: number;
  cargasConferidas: number;
  cargasNoShow: number;
  cargasRecusadas: number;
  docasLivres: number;
  docasOcupadas: number;
  docasEmConferencia: number;
}

export interface ProdutividadeConferente {
  id: string;
  nome: string;
  volumes: number;
}

export interface StatusCargaChart {
  name: string;
  value: number;
  color: string;
}

// Cross Docking Types
export type StatusCross = 
  | 'aguardando_decisao'
  | 'cross_confirmado'
  | 'aguardando_separacao'
  | 'em_separacao'
  | 'finalizado';

export interface CrossDocking {
  id: string;
  cargaId: string;
  fornecedorId: string;
  nfs: string[];
  data: string;
  rua: string;
  volumeRecebido: number;
  status: StatusCross;
  numeroCross?: string;
  separadorId?: string;
  temDivergencia?: boolean;
  observacao?: string;
}

// Solicitacao de Entrega Types
export type StatusSolicitacao = 'pendente' | 'aprovada' | 'recusada';

export type TipoCaminhao = 'truck' | 'carreta' | 'bi_truck' | 'van';

export interface SolicitacaoEntrega {
  id: string;
  fornecedorId: string;
  tipoCaminhao: TipoCaminhao;
  quantidadeVeiculos: number;
  volumePrevisto: number;
  observacoes?: string;
  status: StatusSolicitacao;
  dataSolicitacao: string;
  dataAgendada?: string;
  horarioAgendado?: string;
}
