

# Redesenhar PDF de Aprovacao para Layout Tabular (estilo da imagem)

## Objetivo

Recriar o layout do PDF `gerarPdfAprovacao` para ficar visualmente igual a imagem de referencia, com tabela azul escuro e campos organizados em grid.

## Layout baseado na imagem

O PDF tera a seguinte estrutura:

1. **Texto introdutorio** (sem fundo):
   - "Senhores,"
   - "Segue data para agendamento solicitado, favor comparecer no dia e horario agendado."
   - Paragrafo sobre reagendamento com link do formulario

2. **Tabela principal** com borda azul escura e fundo azul escuro nos rotulos:
   - Linha 1: EMPRESA | Centerlar Comercial Utilidades Ltda | telefone
   - Linha 2: ENDERECO | Avenida Monte Libano...
   - Linha 3: DATA AGENDAMENTO | valor (vermelho)
   - Linha 4: HORARIO | valor (vermelho) | COMPRADOR | nomes
   - Linha 5: NF | valor (vermelho) | VOLUMES | valor (vermelho)
   - Linha 6: PEDIDO | valor (vermelho) | FORNECEDOR | valor (vermelho)

3. **Secao "PONTOS DE ATENCAO"** (header centralizado azul):
   - Bullets com regras (rompimento lacre, EPI, SKU, ajudantes, palete)
   - "OBS:" em vermelho/negrito sobre cancelamento

4. **Rodape**: Texto sobre envio antecipado de NF

## Alteracoes tecnicas

### `src/lib/gerarPdfSolicitacao.ts`

Reescrever a funcao `gerarPdfAprovacao` usando `jspdf` com desenho manual de retangulos e texto posicionado para replicar o layout tabular:

- Usar `doc.setFillColor(0, 32, 96)` (azul escuro) para celulas de rotulo
- Texto branco nos rotulos, preto nos valores
- Valores dinamicos (data, horario, NF, pedido, volumes, fornecedor) em vermelho (`doc.setTextColor(255, 0, 0)`)
- Celulas desenhadas com `doc.rect()` para bordas
- Comprador fixo: "DANIELE NASCIMENTO/JAQUELINE OLIVEIRA/LETICIA BRITO"
- Secao "PONTOS DE ATENCAO" com header azul centralizado
- Regras atualizadas conforme imagem:
  - Rompimento do lacre mediante presenca do conferente
  - Obrigatorio uso de EPI (calcado de seguranca e colete c/ faixa refletiva)
  - Divisao de SKU por palete
  - Minimo de 3 ajudantes p/ descarregamento
  - Palete Padrao: PBR 1,5m de altura
- OBS em vermelho/negrito sobre cancelamento
- Rodape sobre envio de NF com 24h de antecedencia

A funcao `gerarPdfRecusa` permanece inalterada.

## Arquivos modificados

| Arquivo | Alteracao |
|---|---|
| `src/lib/gerarPdfSolicitacao.ts` | Reescrever `gerarPdfAprovacao` com layout tabular azul escuro igual a imagem |

