import jsPDF from 'jspdf';

interface DadosAprovacao {
  fornecedorNome: string;
  dataAgendada: string;
  horarioAgendado: string;
  notaFiscal?: string;
  numeroPedido?: string;
  comprador?: string;
  volumePrevisto: number;
}

interface DadosRecusa {
  fornecedorNome: string;
  notaFiscal?: string;
  numeroPedido?: string;
  dataSolicitacao: string;
  motivoRecusa: string;
  volumePrevisto: number;
}

function addSection(doc: jsPDF, title: string, y: number, pageWidth: number): number {
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, margin + contentWidth, y);
  y += 8;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(50, 50, 50);
  doc.text(title, margin, y);
  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  return y;
}

function addText(doc: jsPDF, text: string, y: number, margin: number, maxWidth: number): number {
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, margin, y);
  return y + lines.length * 5;
}

function checkPage(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > 280) {
    doc.addPage();
    return 20;
  }
  return y;
}

export function gerarPdfAprovacao(dados: DadosAprovacao) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  // Header green
  doc.setFillColor(34, 139, 34);
  doc.rect(0, 0, pageWidth, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Agendamento de Entrega Confirmado', pageWidth / 2, 22, { align: 'center' });
  y = 45;

  // Intro
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  y = addText(doc, 'Prezados,', y, margin, contentWidth);
  y += 4;
  y = addText(doc, 'Segue a data e horário agendados para a entrega. Solicitamos que compareçam conforme o agendamento.', y, margin, contentWidth);
  y += 4;
  y = addText(doc, 'Caso não seja possível comparecer na data e horário informados, pedimos que comuniquem previamente por e-mail e solicitem o reagendamento por meio do formulário indicado no link disponibilizado.', y, margin, contentWidth);
  y += 6;

  // Dados da Entrega
  y = addSection(doc, 'Dados da Entrega', y, pageWidth);
  y = addText(doc, 'Empresa: Centerlar Comercial Utilidades Ltda', y, margin, contentWidth);
  y = addText(doc, 'Endereço: Avenida Monte Líbano, Lote 11, 11º Logis 1135 – Jd.', y, margin, contentWidth);
  y = addText(doc, 'Contato: (11) 98863-6873', y, margin, contentWidth);
  y += 6;

  // Agendamento
  y = checkPage(doc, y, 30);
  y = addSection(doc, 'Agendamento', y, pageWidth);
  y = addText(doc, `Data: ${dados.dataAgendada}`, y, margin, contentWidth);
  y = addText(doc, `Horário: ${dados.horarioAgendado}`, y, margin, contentWidth);
  y += 6;

  // Informações do Pedido
  y = checkPage(doc, y, 30);
  y = addSection(doc, 'Informações do Pedido', y, pageWidth);
  y = addText(doc, `Nota Fiscal: ${dados.notaFiscal || 'N/A'}`, y, margin, contentWidth);
  y = addText(doc, `Pedido: ${dados.numeroPedido || 'N/A'}`, y, margin, contentWidth);
  y += 6;

  // Responsáveis
  y = checkPage(doc, y, 30);
  y = addSection(doc, 'Responsáveis', y, pageWidth);
  y = addText(doc, 'Compradores: Daniele Nascimento / Jaqueline Oliveira / Letícia Brito', y, margin, contentWidth);
  y = addText(doc, `Fornecedor: ${dados.fornecedorNome}`, y, margin, contentWidth);
  y += 6;

  // Detalhes da Carga
  y = checkPage(doc, y, 20);
  y = addSection(doc, 'Detalhes da Carga', y, pageWidth);
  y = addText(doc, `Quantidade de volumes: ${dados.volumePrevisto}`, y, margin, contentWidth);
  y += 6;

  // Regras e Procedimentos
  y = checkPage(doc, y, 50);
  y = addSection(doc, 'Regras e Procedimentos para Entrega', y, pageWidth);
  const regras = [
    '• A descarga somente será realizada mediante conferência no ato da entrega',
    '• Uso obrigatório de EPI: calçado de segurança e colete refletivo',
    '• Separação de SKU por pallet',
    '• Altura máxima: 3 pallets',
    '• Peso máximo por pallet: 1.500 kg',
  ];
  for (const regra of regras) {
    y = addText(doc, regra, y, margin, contentWidth);
    y += 1;
  }
  y += 4;

  // Política de Comparecimento
  y = checkPage(doc, y, 20);
  y = addSection(doc, 'Política de Comparecimento', y, pageWidth);
  y = addText(doc, 'O não comparecimento no horário agendado implicará no cancelamento automático do agendamento.', y, margin, contentWidth);
  y += 6;

  // Envio antecipado de NF
  y = checkPage(doc, y, 20);
  y = addSection(doc, 'Envio antecipado de Nota Fiscal', y, pageWidth);
  y = addText(doc, 'Enviar a Nota Fiscal com no mínimo 24 horas de antecedência para validação.', y, margin, contentWidth);

  doc.save(`aprovacao_${dados.fornecedorNome.replace(/\s+/g, '_')}.pdf`);
}

export function gerarPdfRecusa(dados: DadosRecusa) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  // Header red
  doc.setFillColor(200, 30, 30);
  doc.rect(0, 0, pageWidth, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Solicitação de Agendamento - Não Aprovada', pageWidth / 2, 22, { align: 'center' });
  y = 45;

  // Intro
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  y = addText(doc, 'Prezados,', y, margin, contentWidth);
  y += 4;
  y = addText(doc, 'A solicitação de agendamento de entrega referente aos dados abaixo não pôde ser aprovada neste momento.', y, margin, contentWidth);
  y += 6;

  // Informações da Solicitação
  y = addSection(doc, 'Informações da Solicitação', y, pageWidth);
  y = addText(doc, `Fornecedor: ${dados.fornecedorNome}`, y, margin, contentWidth);
  y = addText(doc, `Pedido: ${dados.numeroPedido || 'N/A'}`, y, margin, contentWidth);
  y = addText(doc, `Nota Fiscal: ${dados.notaFiscal || 'N/A'}`, y, margin, contentWidth);
  y = addText(doc, `Data solicitada: ${dados.dataSolicitacao}`, y, margin, contentWidth);
  y = addText(doc, `Volume previsto: ${dados.volumePrevisto}`, y, margin, contentWidth);
  y += 6;

  // Motivo da Recusa
  y = addSection(doc, 'Motivo da Recusa', y, pageWidth);
  doc.setTextColor(180, 30, 30);
  y = addText(doc, dados.motivoRecusa, y, margin, contentWidth);
  y += 8;

  // Orientação
  doc.setTextColor(60, 60, 60);
  y = addText(doc, 'Orientamos que seja realizada uma nova solicitação de agendamento através do formulário, ajustando data e/ou horário conforme disponibilidade.', y, margin, contentWidth);
  y += 4;
  y = addText(doc, 'Em caso de dúvidas, favor entrar em contato com o setor responsável.', y, margin, contentWidth);
  y += 10;

  // Assinatura
  y = addText(doc, 'Atenciosamente,', y, margin, contentWidth);
  y += 2;
  doc.setFont('helvetica', 'bold');
  y = addText(doc, 'Centerlar Comercial Utilidades Ltda', y, margin, contentWidth);

  doc.save(`recusa_${dados.fornecedorNome.replace(/\s+/g, '_')}.pdf`);
}
