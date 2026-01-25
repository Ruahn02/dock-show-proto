import { Fornecedor, Conferente, Carga, Doca, DashboardPorPeriodo } from '@/types';

export const fornecedores: Fornecedor[] = [
  { id: 'f1', nome: 'Distribuidora ABC Ltda', ativo: true },
  { id: 'f2', nome: 'Atacado Nacional S.A.', ativo: true },
  { id: 'f3', nome: 'Logística Express', ativo: true },
  { id: 'f4', nome: 'Fornecedor Master', ativo: true },
  { id: 'f5', nome: 'Central de Cargas', ativo: true },
  { id: 'f6', nome: 'Transporte Rápido', ativo: true },
  { id: 'f7', nome: 'Distribuidora Sul', ativo: false },
  { id: 'f8', nome: 'Mega Atacado', ativo: true },
  { id: 'f9', nome: 'Comércio Global', ativo: true },
  { id: 'f10', nome: 'Norte Logística', ativo: false },
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

export const cargasIniciais: Carga[] = [
  { id: 'cg1', data: '2026-01-24', fornecedorId: 'f1', nfs: ['NF-001', 'NF-002'], volumePrevisto: 150, status: 'conferido', volumeConferido: 148, docaId: 'd1', conferenteId: 'c1', rua: 'A-15' },
  { id: 'cg2', data: '2026-01-24', fornecedorId: 'f2', nfs: ['NF-003'], volumePrevisto: 80, status: 'em_conferencia', docaId: 'd2', conferenteId: 'c2' },
  { id: 'cg3', data: '2026-01-24', fornecedorId: 'f3', nfs: ['NF-004', 'NF-005', 'NF-006'], volumePrevisto: 250, status: 'aguardando_chegada' },
  { id: 'cg4', data: '2026-01-24', fornecedorId: 'f4', nfs: ['NF-007'], volumePrevisto: 45, status: 'conferido', volumeConferido: 45, conferenteId: 'c3', rua: 'B-08' },
  { id: 'cg5', data: '2026-01-24', fornecedorId: 'f5', nfs: ['NF-008'], volumePrevisto: 120, status: 'no_show' },
  { id: 'cg6', data: '2026-01-24', fornecedorId: 'f6', nfs: ['NF-009', 'NF-010'], volumePrevisto: 200, status: 'conferido', volumeConferido: 195, conferenteId: 'c4', rua: 'C-22', divergencia: '5 volumes faltantes' },
  { id: 'cg7', data: '2026-01-24', fornecedorId: 'f8', nfs: ['NF-011'], volumePrevisto: 90, status: 'recusado' },
  { id: 'cg8', data: '2026-01-24', fornecedorId: 'f9', nfs: ['NF-012'], volumePrevisto: 175, status: 'aguardando_chegada' },
  { id: 'cg9', data: '2026-01-24', fornecedorId: 'f1', nfs: ['NF-013', 'NF-014'], volumePrevisto: 130, status: 'conferido', volumeConferido: 130, conferenteId: 'c5', rua: 'A-03' },
  { id: 'cg10', data: '2026-01-24', fornecedorId: 'f2', nfs: ['NF-015'], volumePrevisto: 60, status: 'aguardando_chegada' },
  { id: 'cg11', data: '2026-01-25', fornecedorId: 'f3', nfs: ['NF-016'], volumePrevisto: 85, status: 'aguardando_chegada' },
  { id: 'cg12', data: '2026-01-25', fornecedorId: 'f4', nfs: ['NF-017', 'NF-018'], volumePrevisto: 110, status: 'aguardando_chegada' },
  { id: 'cg13', data: '2026-01-26', fornecedorId: 'f5', nfs: ['NF-019'], volumePrevisto: 95, status: 'aguardando_chegada' },
  { id: 'cg14', data: '2026-01-26', fornecedorId: 'f6', nfs: ['NF-020'], volumePrevisto: 70, status: 'aguardando_chegada' },
  { id: 'cg15', data: '2026-01-27', fornecedorId: 'f8', nfs: ['NF-021', 'NF-022'], volumePrevisto: 220, status: 'aguardando_chegada' },
];

export const docasIniciais: Doca[] = [
  { id: 'd1', numero: 1, status: 'ocupada', cargaId: 'cg1', conferenteId: 'c1', volumeConferido: 148, rua: 'A-15' },
  { id: 'd2', numero: 2, status: 'ocupada', cargaId: 'cg2', conferenteId: 'c2' },
  { id: 'd3', numero: 3, status: 'livre' },
  { id: 'd4', numero: 4, status: 'uso_consumo' },
  { id: 'd5', numero: 5, status: 'livre' },
  { id: 'd6', numero: 6, status: 'ocupada', cargaId: 'cg6', conferenteId: 'c4', volumeConferido: 195, rua: 'C-22' },
];

export const dashboardPorPeriodo: Record<'dia' | 'semana' | 'mes', DashboardPorPeriodo> = {
  dia: { totalVolumes: 450, cargasConferidas: 5, docasLivres: 2, docasOcupadas: 4 },
  semana: { totalVolumes: 2850, cargasConferidas: 32, docasLivres: 2, docasOcupadas: 4 },
  mes: { totalVolumes: 12400, cargasConferidas: 145, docasLivres: 2, docasOcupadas: 4 },
};

export const statusCargaLabels: Record<string, string> = {
  aguardando_chegada: 'Aguardando Chegada',
  em_conferencia: 'Em Conferência',
  conferido: 'Conferido',
  no_show: 'No Show',
  recusado: 'Recusado',
};

export const statusDocaLabels: Record<string, string> = {
  livre: 'Livre',
  ocupada: 'Ocupada',
  uso_consumo: 'Uso e Consumo',
};
