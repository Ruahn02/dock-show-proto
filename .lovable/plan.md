

# Exibir NF, Pedido e Comprador na tabela de Solicitacoes (Admin)

## O que sera feito

Adicionar 3 novas colunas na tabela de listagem de solicitacoes em `src/pages/Solicitacoes.tsx`:

- **Nota Fiscal** - exibe o valor de `sol.notaFiscal` ou "-" se vazio
- **N. Pedido** - exibe `sol.numeroPedido` ou "-"
- **Comprador** - exibe `sol.comprador` ou "-"

## Alteracao

### `src/pages/Solicitacoes.tsx`

Na secao `TableHeader`, adicionar 3 novos `TableHead` apos "Volume":
- Nota Fiscal
- N. Pedido
- Comprador

Na secao `TableBody`, adicionar 3 novos `TableCell` correspondentes em cada linha.

Atualizar o `colSpan` da mensagem "Nenhuma solicitacao encontrada" de 8 para 11.

## Detalhes tecnicos

| Arquivo | Alteracao |
|---|---|
| `src/pages/Solicitacoes.tsx` | Adicionar colunas NF, Pedido e Comprador na tabela |

Nenhuma alteracao no banco de dados.

