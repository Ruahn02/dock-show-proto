

# Corrigir Comprador no PDF e Adicionar Botao de Re-download

## Problema 1: Comprador hardcoded no PDF

Na funcao `gerarPdfAprovacao` (linha 128 de `gerarPdfSolicitacao.ts`), o campo COMPRADOR esta fixo como `'DANIELE / JAQUELINE / LETICIA'` em vez de usar o valor `dados.comprador` que ja e passado corretamente pela pagina de Solicitacoes.

**Correcao**: Substituir o texto fixo por `dados.comprador || 'N/A'` na linha 128.

## Problema 2: Sem botao para re-download do PDF

Atualmente, o PDF so e gerado no momento da aprovacao/recusa. Para solicitacoes ja processadas (status `aprovada` ou `recusada`), a coluna de Acoes fica vazia -- nao ha como baixar o PDF novamente.

**Correcao**: Adicionar botoes de download na coluna de Acoes para solicitacoes ja processadas:
- Para **aprovadas**: botao "Baixar PDF" que chama `gerarPdfAprovacao` com os dados da solicitacao
- Para **recusadas**: botao "Baixar PDF" que chama `gerarPdfRecusa` com os dados da solicitacao

## Alteracoes tecnicas

### `src/lib/gerarPdfSolicitacao.ts`

- Linha 128: trocar `'DANIELE / JAQUELINE / LETICIA'` por `dados.comprador || 'N/A'`

### `src/pages/Solicitacoes.tsx`

- Importar icone `Download` do lucide-react
- No bloco da coluna Acoes (linhas 191-202), adicionar condicoes para `aprovada` e `recusada`:
  - Se `aprovada`: botao com icone Download que gera o PDF de aprovacao (usando `dataAgendada` e `horarioAgendado` da solicitacao)
  - Se `recusada`: botao com icone Download que gera o PDF de recusa
- Para recusa, o motivo nao esta salvo no banco atualmente, entao o PDF de recusa sera gerado com motivo generico "Solicitacao recusada" (limitacao dos dados atuais)

| Arquivo | Alteracao |
|---|---|
| `src/lib/gerarPdfSolicitacao.ts` | Usar `dados.comprador` em vez de texto fixo |
| `src/pages/Solicitacoes.tsx` | Adicionar botao "Baixar PDF" para solicitacoes aprovadas e recusadas |

