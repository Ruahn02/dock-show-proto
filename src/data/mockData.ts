import { Fornecedor, Conferente, Carga, Doca, DashboardIndicadores, ProdutividadeConferente } from '@/types';

export const fornecedores: Fornecedor[] = [
  { id: 'f1', nome: 'Distribuidora ABC Ltda', cnpj: '12.345.678/0001-90', contato: '(11) 99999-0001', ativo: true },
  { id: 'f2', nome: 'Atacado Nacional S.A.', cnpj: '23.456.789/0001-01', contato: '(11) 99999-0002', ativo: true },
  { id: 'f3', nome: 'Logística Express', cnpj: '34.567.890/0001-12', contato: '(11) 99999-0003', ativo: true },
  { id: 'f4', nome: 'Fornecedor Master', cnpj: '45.678.901/0001-23', contato: '(11) 99999-0004', ativo: true },
  { id: 'f5', nome: 'Central de Cargas', cnpj: '56.789.012/0001-34', contato: '(11) 99999-0005', ativo: true },
  { id: 'f6', nome: 'Transporte Rápido', cnpj: '67.890.123/0001-45', contato: '(11) 99999-0006', ativo: true },
  { id: 'f7', nome: 'Distribuidora Sul', cnpj: '78.901.234/0001-56', contato: '(11) 99999-0007', ativo: false },
  { id: 'f8', nome: 'Mega Atacado', cnpj: '89.012.345/0001-67', contato: '(11) 99999-0008', ativo: true },
  { id: 'f9', nome: 'Comércio Global', cnpj: '90.123.456/0001-78', contato: '(11) 99999-0009', ativo: true },
  { id: 'f10', nome: 'Norte Logística', cnpj: '01.234.567/0001-89', contato: '(11) 99999-0010', ativo: false },
];

export const conferentes: Conferente[] = [
  { id: 'c1', nome: 'João Silva', matricula: 'CONF001', ativo: true },
  { id: 'c2', nome: 'Maria Santos', matricula: 'CONF002', ativo: true },
  { id: 'c3', nome: 'Pedro Oliveira', matricula: 'CONF003', ativo: true },
  { id: 'c4', nome: 'Ana Costa', matricula: 'CONF004', ativo: true },
  { id: 'c5', nome: 'Carlos Ferreira', matricula: 'CONF005', ativo: true },
  { id: 'c6', nome: 'Juliana Lima', matricula: 'CONF006', ativo: true },
  { id: 'c7', nome: 'Roberto Alves', matricula: 'CONF007', ativo: false },
  { id: 'c8', nome: 'Fernanda Souza', matricula: 'CONF008', ativo: true },
];

export const cargasIniciais: Carga[] = [
  { id: 'cg1', data: '2026-01-24', fornecedorId: 'f1', nfs: ['NF-001', 'NF-002'], volumePrevisto: 150, status: 'conferido', volumeConferido: 148, docaId: 'd1', conferenteId: 'c1', rua: 'A-15' },
  { id: 'cg2', data: '2026-01-24', fornecedorId: 'f2', nfs: ['NF-003'], volumePrevisto: 80, status: 'em_conferencia', docaId: 'd2', conferenteId: 'c2' },
  { id: 'cg3', data: '2026-01-24', fornecedorId: 'f3', nfs: ['NF-004', 'NF-005', 'NF-006'], volumePrevisto: 250, status: 'agendado' },
  { id: 'cg4', data: '2026-01-24', fornecedorId: 'f4', nfs: ['NF-007'], volumePrevisto: 45, status: 'conferido', volumeConferido: 45, conferenteId: 'c3', rua: 'B-08' },
  { id: 'cg5', data: '2026-01-24', fornecedorId: 'f5', nfs: ['NF-008'], volumePrevisto: 120, status: 'no_show' },
  { id: 'cg6', data: '2026-01-24', fornecedorId: 'f6', nfs: ['NF-009', 'NF-010'], volumePrevisto: 200, status: 'conferido', volumeConferido: 195, conferenteId: 'c4', rua: 'C-22', divergencia: '5 volumes faltantes' },
  { id: 'cg7', data: '2026-01-24', fornecedorId: 'f8', nfs: ['NF-011'], volumePrevisto: 90, status: 'recusado' },
  { id: 'cg8', data: '2026-01-24', fornecedorId: 'f9', nfs: ['NF-012'], volumePrevisto: 175, status: 'agendado' },
  { id: 'cg9', data: '2026-01-24', fornecedorId: 'f1', nfs: ['NF-013', 'NF-014'], volumePrevisto: 130, status: 'conferido', volumeConferido: 130, conferenteId: 'c5', rua: 'A-03' },
  { id: 'cg10', data: '2026-01-24', fornecedorId: 'f2', nfs: ['NF-015'], volumePrevisto: 60, status: 'agendado' },
  { id: 'cg11', data: '2026-01-24', fornecedorId: 'f3', nfs: ['NF-016'], volumePrevisto: 85, status: 'conferido', volumeConferido: 85, conferenteId: 'c6', rua: 'D-11' },
  { id: 'cg12', data: '2026-01-24', fornecedorId: 'f4', nfs: ['NF-017', 'NF-018'], volumePrevisto: 110, status: 'no_show' },
  { id: 'cg13', data: '2026-01-24', fornecedorId: 'f5', nfs: ['NF-019'], volumePrevisto: 95, status: 'agendado' },
  { id: 'cg14', data: '2026-01-24', fornecedorId: 'f6', nfs: ['NF-020'], volumePrevisto: 70, status: 'conferido', volumeConferido: 70, conferenteId: 'c1', rua: 'B-15' },
  { id: 'cg15', data: '2026-01-24', fornecedorId: 'f8', nfs: ['NF-021', 'NF-022'], volumePrevisto: 220, status: 'agendado' },
];

export const docasIniciais: Doca[] = [
  { id: 'd1', numero: 1, status: 'conferido', cargaId: 'cg1', conferenteId: 'c1', volumeConferido: 148, rua: 'A-15' },
  { id: 'd2', numero: 2, status: 'conferindo', cargaId: 'cg2', conferenteId: 'c2' },
  { id: 'd3', numero: 3, status: 'livre' },
  { id: 'd4', numero: 4, status: 'uso_consumo' },
  { id: 'd5', numero: 5, status: 'livre' },
  { id: 'd6', numero: 6, status: 'conferido', cargaId: 'cg6', conferenteId: 'c4', volumeConferido: 195, rua: 'C-22' },
];

export const dashboardIndicadores: DashboardIndicadores = {
  totalVolumes: 1247,
  mediaVolumesConferente: 156,
  cargasConferidas: 12,
  cargasNoShow: 2,
  cargasRecusadas: 1,
  docasLivres: 2,
  docasOcupadas: 3,
  docasConferindo: 1,
};

export const produtividadeConferentes: ProdutividadeConferente[] = [
  { conferenteId: 'c1', nome: 'João Silva', volumes: 218 },
  { conferenteId: 'c2', nome: 'Maria Santos', volumes: 195 },
  { conferenteId: 'c4', nome: 'Ana Costa', volumes: 185 },
  { conferenteId: 'c3', nome: 'Pedro Oliveira', volumes: 172 },
  { conferenteId: 'c5', nome: 'Carlos Ferreira', volumes: 168 },
  { conferenteId: 'c6', nome: 'Juliana Lima', volumes: 155 },
  { conferenteId: 'c8', nome: 'Fernanda Souza', volumes: 154 },
];

export const statusCargaLabels: Record<string, string> = {
  agendado: 'Agendado',
  em_conferencia: 'Em Conferência',
  conferido: 'Conferido',
  no_show: 'No Show',
  recusado: 'Recusado',
};

export const statusDocaLabels: Record<string, string> = {
  livre: 'Livre',
  conferindo: 'Conferindo',
  conferido: 'Conferido',
  uso_consumo: 'Uso e Consumo',
};
