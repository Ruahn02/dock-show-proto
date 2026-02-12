import { Fornecedor, Conferente, Carga, Doca, DashboardPorPeriodo, ProdutividadeConferente, StatusCargaChart } from '@/types';

export const fornecedores: Fornecedor[] = [
  { id: 'f1', nome: 'Distribuidora ABC Ltda', ativo: true, email: 'contato@abc.com.br' },
  { id: 'f2', nome: 'Atacado Nacional S.A.', ativo: true, email: 'logistica@atacadonacional.com' },
  { id: 'f3', nome: 'Logística Express', ativo: true, email: 'agendamento@logexpress.com' },
  { id: 'f4', nome: 'Fornecedor Master', ativo: true, email: 'entregas@master.com.br' },
  { id: 'f5', nome: 'Central de Cargas', ativo: true, email: 'operacoes@centralcargas.com' },
  { id: 'f6', nome: 'Transporte Rápido', ativo: true, email: 'atendimento@transporterapido.com' },
  { id: 'f7', nome: 'Distribuidora Sul', ativo: false, email: 'contato@distsul.com.br' },
  { id: 'f8', nome: 'Mega Atacado', ativo: true, email: 'agendamento@megaatacado.com' },
  { id: 'f9', nome: 'Comércio Global', ativo: true, email: 'entregas@comercioglobal.com' },
  { id: 'f10', nome: 'Norte Logística', ativo: false, email: 'contato@nortelogistica.com' },
];

export const conferentes: Conferente[] = [
  { id: 'c1', nome: 'João Silva', ativo: true },
  { id: 'c2', nome: 'Maria Santos', ativo: true },
  { id: 'c3', nome: 'Pedro Oliveira', ativo: true },
  { id: 'c4', nome: 'Ana Costa', ativo: true },
  { id: 'c5', nome: 'Carlos Ferreira', ativo: true },
  { id: 'c6', nome: 'Juliana Lima', ativo: true },
  { id: 'c7', nome: 'Roberto Alves', ativo: false },
  { id: 'c8', nome: 'Fernanda Souza', ativo: true },
];

// Data atual do sistema: 2026-02-04
export const cargasIniciais: Carga[] = [
  // Cargas do dia atual (2026-02-04) vinculadas a senhas
  { id: 'cg_d2', data: '2026-02-04', fornecedorId: 'f1', nfs: ['NF-101'], volumePrevisto: 150, status: 'aguardando_chegada', chegou: true, senhaId: 's1', horarioPrevisto: '07:30' },
  { id: 'cg_d6', data: '2026-02-04', fornecedorId: 'f3', nfs: ['NF-102', 'NF-103'], volumePrevisto: 280, status: 'em_conferencia', chegou: true, senhaId: 's2', conferenteId: 'c2', rua: 'B-05', horarioPrevisto: '08:00' },
  { id: 'cg_ag1', data: '2026-02-04', fornecedorId: 'f5', nfs: ['NF-104'], volumePrevisto: 95, status: 'aguardando_chegada', chegou: true, senhaId: 's3', horarioPrevisto: '09:00' },
  { id: 'cg_patio', data: '2026-02-04', fornecedorId: 'f2', nfs: ['NF-105'], volumePrevisto: 120, status: 'aguardando_chegada', chegou: true, senhaId: 's4', horarioPrevisto: '08:30' },
  { id: 'cg_s5', data: '2026-02-04', fornecedorId: 'f4', nfs: ['NF-110'], volumePrevisto: 200, status: 'conferido', volumeConferido: 200, chegou: true, senhaId: 's5', conferenteId: 'c1', rua: 'A-15', horarioPrevisto: '07:00' },

  // Cargas conferidas do dia (sem senha)
  { id: 'cg1', data: '2026-02-04', fornecedorId: 'f4', nfs: ['NF-001'], volumePrevisto: 180, status: 'conferido', volumeConferido: 180, conferenteId: 'c1', rua: 'A-15' },
  { id: 'cg2', data: '2026-02-04', fornecedorId: 'f6', nfs: ['NF-002'], volumePrevisto: 220, status: 'conferido', volumeConferido: 215, conferenteId: 'c4', rua: 'C-22', divergencia: '5 volumes faltantes' },

  // No-show do dia
  { id: 'cg3', data: '2026-02-04', fornecedorId: 'f8', nfs: ['NF-003'], volumePrevisto: 75, status: 'no_show', horarioPrevisto: '10:00' },

  // Aguardando (sem chegada)
  { id: 'cg4', data: '2026-02-04', fornecedorId: 'f9', nfs: ['NF-006'], volumePrevisto: 160, status: 'aguardando_chegada', horarioPrevisto: '14:00' },

  // Cargas do dia anterior (2026-02-03) - para testar filtro de data na Agenda
  { id: 'cg10', data: '2026-02-03', fornecedorId: 'f1', nfs: ['NF-070'], volumePrevisto: 130, status: 'conferido', volumeConferido: 130, conferenteId: 'c3', rua: 'D-02', horarioPrevisto: '08:00', chegou: true },
  { id: 'cg11', data: '2026-02-03', fornecedorId: 'f2', nfs: ['NF-071'], volumePrevisto: 190, status: 'conferido', volumeConferido: 185, conferenteId: 'c5', rua: 'E-10', horarioPrevisto: '09:00', chegou: true },
  { id: 'cg12', data: '2026-02-03', fornecedorId: 'f4', nfs: ['NF-072'], volumePrevisto: 100, status: 'no_show', horarioPrevisto: '11:00' },

  // Cargas futuras
  { id: 'cg5', data: '2026-02-05', fornecedorId: 'f3', nfs: ['NF-016'], volumePrevisto: 85, status: 'aguardando_chegada', horarioPrevisto: '08:00' },
  { id: 'cg6', data: '2026-02-05', fornecedorId: 'f4', nfs: ['NF-017', 'NF-018'], volumePrevisto: 110, status: 'aguardando_chegada', horarioPrevisto: '10:30' },
  { id: 'cg7', data: '2026-02-06', fornecedorId: 'f5', nfs: ['NF-019'], volumePrevisto: 95, status: 'aguardando_chegada' },
];

export const docasIniciais: Doca[] = [
  { id: 'd1', numero: 1, status: 'livre' },
  { id: 'd2', numero: 2, status: 'ocupada', cargaId: 'cg_d2', senhaId: 's1' },
  { id: 'd3', numero: 3, status: 'conferido', cargaId: 'cg_s5', senhaId: 's5', conferenteId: 'c1', rua: 'A-15', volumeConferido: 200 },
  { id: 'd4', numero: 4, status: 'uso_consumo' },
  { id: 'd5', numero: 5, status: 'livre' },
  { id: 'd6', numero: 6, status: 'em_conferencia', cargaId: 'cg_d6', senhaId: 's2', conferenteId: 'c2', rua: 'B-05' },
];

export const dashboardPorPeriodo: Record<'dia' | 'semana' | 'mes', DashboardPorPeriodo> = {
  dia: { 
    totalVolumes: 518, 
    cargasConferidas: 4, 
    cargasNoShow: 1,
    cargasRecusadas: 1,
    docasLivres: 3, 
    docasOcupadas: 1,
    docasEmConferencia: 1,
    totalCross: 2,
    crossFinalizados: 1,
    crossEmSeparacao: 1,
  },
  semana: { 
    totalVolumes: 2850, 
    cargasConferidas: 28, 
    cargasNoShow: 3,
    cargasRecusadas: 2,
    docasLivres: 3, 
    docasOcupadas: 1,
    docasEmConferencia: 1,
    totalCross: 8,
    crossFinalizados: 5,
    crossEmSeparacao: 2,
  },
  mes: { 
    totalVolumes: 12400, 
    cargasConferidas: 145, 
    cargasNoShow: 12,
    cargasRecusadas: 8,
    docasLivres: 3, 
    docasOcupadas: 1,
    docasEmConferencia: 1,
    totalCross: 32,
    crossFinalizados: 24,
    crossEmSeparacao: 4,
  },
};

export const produtividadeConferentes: Record<'dia' | 'semana' | 'mes', ProdutividadeConferente[]> = {
  dia: [
    { id: 'c1', nome: 'João Silva', volumes: 180 },
    { id: 'c4', nome: 'Ana Costa', volumes: 215 },
    { id: 'c3', nome: 'Pedro Oliveira', volumes: 45 },
    { id: 'c5', nome: 'Carlos Ferreira', volumes: 130 },
    { id: 'c2', nome: 'Maria Santos', volumes: 0 },
  ],
  semana: [
    { id: 'c1', nome: 'João Silva', volumes: 680 },
    { id: 'c4', nome: 'Ana Costa', volumes: 620 },
    { id: 'c2', nome: 'Maria Santos', volumes: 540 },
    { id: 'c3', nome: 'Pedro Oliveira', volumes: 480 },
    { id: 'c5', nome: 'Carlos Ferreira', volumes: 530 },
  ],
  mes: [
    { id: 'c1', nome: 'João Silva', volumes: 2850 },
    { id: 'c2', nome: 'Maria Santos', volumes: 2640 },
    { id: 'c4', nome: 'Ana Costa', volumes: 2480 },
    { id: 'c3', nome: 'Pedro Oliveira', volumes: 2320 },
    { id: 'c5', nome: 'Carlos Ferreira', volumes: 2110 },
  ],
};

export const statusCargasChart: Record<'dia' | 'semana' | 'mes', StatusCargaChart[]> = {
  dia: [
    { name: 'Conferido', value: 4, color: '#3B82F6' },
    { name: 'No Show', value: 1, color: '#F97316' },
    { name: 'Recusado', value: 1, color: '#EF4444' },
  ],
  semana: [
    { name: 'Conferido', value: 28, color: '#3B82F6' },
    { name: 'No Show', value: 3, color: '#F97316' },
    { name: 'Recusado', value: 2, color: '#EF4444' },
  ],
  mes: [
    { name: 'Conferido', value: 145, color: '#3B82F6' },
    { name: 'No Show', value: 12, color: '#F97316' },
    { name: 'Recusado', value: 8, color: '#EF4444' },
  ],
};

export const statusCargaLabels: Record<string, string> = {
  aguardando_chegada: 'Aguardando Chegada',
  aguardando_conferencia: 'Aguardando Conferência',
  em_conferencia: 'Conferindo',
  conferido: 'Conferido',
  no_show: 'No-show',
  recusado: 'Recusado',
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
