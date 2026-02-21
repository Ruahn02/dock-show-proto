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
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  const darkBlue: [number, number, number] = [0, 32, 96];
  const white: [number, number, number] = [255, 255, 255];
  const red: [number, number, number] = [255, 0, 0];
  const black: [number, number, number] = [0, 0, 0];

  // --- Texto introdutório ---
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...black);
  doc.text('Senhores,', margin, y);
  y += 7;
  const intro1 = doc.splitTextToSize(
    'Segue data para agendamento solicitado, favor comparecer no dia e horário agendado.',
    contentWidth
  );
  doc.text(intro1, margin, y);
  y += intro1.length * 5 + 3;
  const intro2 = doc.splitTextToSize(
    'Caso não seja possível comparecer na data e horário informados, pedimos que comuniquem previamente por e-mail e solicitem o reagendamento por meio do formulário indicado no link disponibilizado.',
    contentWidth
  );
  doc.text(intro2, margin, y);
  y += intro2.length * 5 + 8;

  // --- Tabela principal ---
  const rowH = 10;
  const labelCol = 40;
  const tableX = margin;

  function drawLabelCell(x: number, cy: number, w: number, h: number, text: string) {
    doc.setFillColor(...darkBlue);
    doc.rect(x, cy, w, h, 'FD');
    doc.setTextColor(...white);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(text, x + 2, cy + h / 2 + 1, { baseline: 'middle' });
  }

  function drawValueCell(x: number, cy: number, w: number, h: number, text: string, color: [number, number, number] = black) {
    doc.setDrawColor(...darkBlue);
    doc.rect(x, cy, w, h, 'S');
    doc.setTextColor(...color);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(text, x + 2, cy + h / 2 + 1, { baseline: 'middle' });
  }

  // Row 1: EMPRESA | valor | telefone
  drawLabelCell(tableX, y, labelCol, rowH, 'EMPRESA');
  drawValueCell(tableX + labelCol, y, contentWidth - labelCol - 45, rowH, 'Centerlar Comercial Utilidades Ltda');
  drawValueCell(tableX + contentWidth - 45, y, 45, rowH, '(11) 98863-6873');
  y += rowH;

  // Row 2: ENDEREÇO | valor
  drawLabelCell(tableX, y, labelCol, rowH, 'ENDEREÇO');
  drawValueCell(tableX + labelCol, y, contentWidth - labelCol, rowH, 'Av. Monte Líbano, Lote 11, 11º Logis 1135 – Jd.');
  y += rowH;

  // Row 3: DATA AGENDAMENTO | valor (vermelho, full width)
  drawLabelCell(tableX, y, labelCol, rowH, 'DATA AGENDAMENTO');
  drawValueCell(tableX + labelCol, y, contentWidth - labelCol, rowH, dados.dataAgendada, red);
  y += rowH;

  // Row 4: HORÁRIO | valor | COMPRADOR | nomes
  const halfVal = (contentWidth - labelCol * 2) / 2;
  drawLabelCell(tableX, y, labelCol, rowH, 'HORÁRIO');
  drawValueCell(tableX + labelCol, y, halfVal, rowH, dados.horarioAgendado, red);
  drawLabelCell(tableX + labelCol + halfVal, y, labelCol, rowH, 'COMPRADOR');
  drawValueCell(tableX + labelCol * 2 + halfVal, y, halfVal, rowH, dados.comprador || 'N/A');
  y += rowH;

  // Row 5: NF | valor | VOLUMES | valor
  drawLabelCell(tableX, y, labelCol, rowH, 'NF');
  drawValueCell(tableX + labelCol, y, halfVal, rowH, dados.notaFiscal || 'N/A', red);
  drawLabelCell(tableX + labelCol + halfVal, y, labelCol, rowH, 'VOLUMES');
  drawValueCell(tableX + labelCol * 2 + halfVal, y, halfVal, rowH, String(dados.volumePrevisto), red);
  y += rowH;

  // Row 6: PEDIDO | valor | FORNECEDOR | valor
  drawLabelCell(tableX, y, labelCol, rowH, 'PEDIDO');
  drawValueCell(tableX + labelCol, y, halfVal, rowH, dados.numeroPedido || 'N/A', red);
  drawLabelCell(tableX + labelCol + halfVal, y, labelCol, rowH, 'FORNECEDOR');
  drawValueCell(tableX + labelCol * 2 + halfVal, y, halfVal, rowH, dados.fornecedorNome, red);
  y += rowH + 10;

  // --- PONTOS DE ATENÇÃO ---
  doc.setFillColor(...darkBlue);
  doc.rect(tableX, y, contentWidth, 8, 'F');
  doc.setTextColor(...white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('PONTOS DE ATENÇÃO', pageWidth / 2, y + 4.5, { align: 'center', baseline: 'middle' });
  y += 12;

  doc.setTextColor(...black);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const regras = [
    '• Rompimento do lacre somente mediante presença do conferente;',
    '• Obrigatório uso de EPI: calçado de segurança e colete c/ faixa refletiva;',
    '• Divisão de SKU por palete;',
    '• Mínimo de 3 ajudantes p/ descarregamento;',
    '• Palete Padrão: PBR 1,5m de altura.',
  ];
  for (const regra of regras) {
    doc.text(regra, margin + 2, y);
    y += 5;
  }
  y += 3;

  // OBS em vermelho/negrito
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...red);
  doc.setFontSize(8);
  const obs = doc.splitTextToSize(
    'OBS: O não comparecimento no horário agendado implicará no cancelamento automático do agendamento, sendo necessário realizar nova solicitação.',
    contentWidth - 4
  );
  doc.text(obs, margin + 2, y);
  y += obs.length * 5 + 8;

  // --- Rodapé ---
  doc.setTextColor(...black);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const rodape = doc.splitTextToSize(
    'Solicitamos o envio da Nota Fiscal com no mínimo 24 horas de antecedência para validação prévia.',
    contentWidth
  );
  doc.text(rodape, margin, y);

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
