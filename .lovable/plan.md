

# Filtro por Fornecedor e Exportacao PDF/Excel na Agenda

## Alteracoes

### `src/pages/Agenda.tsx`

**1. Filtro por fornecedor**

Adicionar um `Select` ao lado do seletor de data, listando todos os fornecedores que aparecem nas cargas do dia (mais opcao "Todos"). O filtro sera aplicado sobre `cargasDeHoje`, gerando `cargasFiltradas` que alimenta tanto a tabela quanto as exportacoes.

```text
Estado: fornecedorFiltro (string | 'todos')
Lista de opcoes: fornecedores unicos extraidos de cargasDeHoje
Filtro: cargasFiltradas = fornecedorFiltro === 'todos' 
  ? cargasDeHoje 
  : cargasDeHoje.filter(c => c.fornecedorId === fornecedorFiltro)
```

**2. Exportar PDF**

Usar `jspdf` + `jspdf-autotable` para gerar um PDF com:
- Titulo: "Agenda - {data formatada}" + filtro aplicado
- Tabela com as mesmas colunas visiveis: Horario, Fornecedor, NF(s), Vol. Previsto, Vol. Recebido, Conferente, Rua, Divergencia, Status
- Dados de `cargasFiltradas` (respeitando filtro de data + fornecedor)

**3. Exportar Excel**

Usar `xlsx` (SheetJS) para gerar um arquivo .xlsx com:
- Nome da aba: "Agenda"
- Mesmas colunas e dados filtrados
- Nome do arquivo: `agenda_{data}.xlsx`

**4. Layout dos botoes**

Adicionar uma barra entre o header e a tabela com:
- Select de fornecedor (lado esquerdo)
- Botoes "Exportar PDF" e "Exportar Excel" (lado direito)

### Dependencias novas

- `jspdf` + `jspdf-autotable` - geracao de PDF
- `xlsx` - geracao de Excel

### Detalhes tecnicos

```text
Funcao exportarPDF(cargasFiltradas, dataSelecionada, fornecedorNome):
  1. new jsPDF()
  2. doc.text("Agenda - {data}")
  3. Se filtro != 'todos': doc.text("Fornecedor: {nome}")
  4. autoTable com headers e rows mapeados de cargasFiltradas
  5. doc.save("agenda_{data}.pdf")

Funcao exportarExcel(cargasFiltradas, dataSelecionada):
  1. Mapear cargasFiltradas para array de objetos com nomes de coluna em portugues
  2. XLSX.utils.json_to_sheet(dados)
  3. XLSX.utils.book_new() + book_append_sheet
  4. XLSX.writeFile(wb, "agenda_{data}.xlsx")
```

Nenhuma alteracao no banco de dados necessaria.

