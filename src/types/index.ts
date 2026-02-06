export type Perfil = 'administrador' | 'operacional';

export type StatusDoca = 'livre' | 'ocupada' | 'em_conferencia' | 'conferido' | 'uso_consumo';

export type StatusCarga = 'aguardando_chegada' | 'em_conferencia' | 'conferido' | 'no_show' | 'recusado';

// Status da senha do caminhoneiro
export type StatusSenha = 
  | 'aguardando_doca'        // Chegou, aguardando doca
  | 'em_doca'                // Vinculado a uma doca
  | 'aguardando_conferencia' // Na doca, aguardando iniciar
  | 'conferindo'             // Conferência em andamento
  | 'conferido'              // Conferência finalizada
  | 'recusado';              // Carga recusada

// Local atual do caminhão
export type LocalSenha = 'aguardando_doca' | 'em_doca' | 'em_patio';

export interface Fornecedor {
  id: string;
  nome: string;
  ativo: boolean;
  email?: string;
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
  senhaId?: string; // Referência à senha vinculada
}

export interface Senha {
  id: string;
  numero: number;
  fornecedorId: string;
  cargaId?: string;
  docaNumero?: number;
  status: StatusSenha;
  horaChegada: string;
  // Novos campos
  nomeMotorista: string;
  tipoCaminhao: TipoCaminhao;
  horarioPrevisto?: string;
  localAtual: LocalSenha;
  rua?: string;
  liberada: boolean;
}

export interface DashboardPorPeriodo {
  totalVolumes: number;
  cargasConferidas: number;
  cargasNoShow: number;
  cargasRecusadas: number;
  docasLivres: number;
  docasOcupadas: number;
  docasEmConferencia: number;
  totalCross?: number;
  crossFinalizados?: number;
  crossEmSeparacao?: number;
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
  emailContato: string;
}
