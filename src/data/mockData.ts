import { DashboardPorPeriodo, ProdutividadeConferente, StatusCargaChart } from '@/types';

export const dashboardPorPeriodo: Record<'dia' | 'semana' | 'mes', DashboardPorPeriodo> = {
  dia: { 
    totalVolumes: 0, 
    cargasConferidas: 0, 
    cargasNoShow: 0,
    cargasRecusadas: 0,
    docasLivres: 0, 
    docasOcupadas: 0,
    docasEmConferencia: 0,
    totalCross: 0,
    crossFinalizados: 0,
    crossEmSeparacao: 0,
  },
  semana: { 
    totalVolumes: 0, 
    cargasConferidas: 0, 
    cargasNoShow: 0,
    cargasRecusadas: 0,
    docasLivres: 0, 
    docasOcupadas: 0,
    docasEmConferencia: 0,
    totalCross: 0,
    crossFinalizados: 0,
    crossEmSeparacao: 0,
  },
  mes: { 
    totalVolumes: 0, 
    cargasConferidas: 0, 
    cargasNoShow: 0,
    cargasRecusadas: 0,
    docasLivres: 0, 
    docasOcupadas: 0,
    docasEmConferencia: 0,
    totalCross: 0,
    crossFinalizados: 0,
    crossEmSeparacao: 0,
  },
};

export const produtividadeConferentes: Record<'dia' | 'semana' | 'mes', ProdutividadeConferente[]> = {
  dia: [],
  semana: [],
  mes: [],
};

export const statusCargasChart: Record<'dia' | 'semana' | 'mes', StatusCargaChart[]> = {
  dia: [],
  semana: [],
  mes: [],
};

export const statusCargaLabels: Record<string, string> = {
  aguardando_chegada: 'Aguardando Chegada',
  aguardando_conferencia: 'Aguardando Conferência',
  em_conferencia: 'Conferindo',
  conferido: 'Conferido',
  no_show: 'No-show',
  recusado: 'Recusado',
  atrasado: 'Atrasado',
};

export const statusDocaLabels: Record<string, string> = {
  livre: 'Livre',
  ocupada: 'Carga Disponível',
  em_conferencia: 'Conferindo',
  conferido: 'Conferido',
  uso_consumo: 'Uso e Consumo',
};

export const tipoCaminhaoLabels: Record<string, string> = {
  truck: 'Truck',
  carreta: 'Carreta',
  bi_truck: 'Bi-Truck',
  van: 'Van',
};

export const statusSolicitacaoLabels: Record<string, string> = {
  pendente: 'Pendente',
  aprovada: 'Aprovada',
  recusada: 'Recusada',
};

// Labels para status da senha (exibição caminhoneiro)
export const statusSenhaLabels: Record<string, string> = {
  aguardando_doca: 'Aguardando Doca',
  em_doca: 'Em Doca',
  aguardando_conferencia: 'Aguardando Conferência',
  em_conferencia: 'Em Conferência',
  conferido: 'Conferido',
  recusado: 'Recusado',
};

// Labels para local atual da senha
export const localSenhaLabels: Record<string, string> = {
  aguardando_doca: 'Aguardando Doca',
  em_doca: 'Em Doca',
  em_patio: 'Em Pátio',
};
