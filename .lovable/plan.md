

# Corrigir Cross Docking: Visibilidade, Fluxo e Filtros

## Problemas Identificados

### 1. Cargas conferidas nao aparecem no Cross Docking
O codigo em `Docas.tsx` (linha 333-343) ja chama `adicionarCross` ao terminar conferencia. Porem, o filtro `getCrossParaAdmin()` no `CrossContext.tsx` exclui itens com status `em_separacao` e `finalizado`. Alem disso, o filtro de data padrao e "hoje" - se a carga tem data diferente, ela fica invisivel. A combinacao desses dois filtros esconde itens validos.

### 2. Itens somem apos decisao de Cross para o Admin
`getCrossParaAdmin()` so retorna: `aguardando_decisao`, `cross_confirmado`, `aguardando_separacao`. Quando o admin inicia separacao (status vira `em_separacao`) ou finaliza (`finalizado`), o item desaparece da visao admin.

### 3. Falta filtro de fornecedor
A tela so tem filtro de data. Precisa de filtro por fornecedor tambem.

---

## Alteracoes

### `src/contexts/CrossContext.tsx`

**getCrossParaAdmin**: Remover o filtro de status - admin ve TODOS os itens para consulta futura.

```text
Antes:
  return crossItems.filter(item =>
    item.status === 'aguardando_decisao' ||
    item.status === 'cross_confirmado' ||
    item.status === 'aguardando_separacao'
  );

Depois:
  return crossItems; // Admin ve todos os status
```

**getCrossParaOperacional**: Manter filtro atual (so itens acionaveis).

### `src/pages/CrossDocking.tsx`

1. **Adicionar filtro de fornecedor**: Dropdown com lista de fornecedores ao lado do filtro de data.

2. **Aplicar filtro de fornecedor no useMemo**: Filtrar `allCrossItems` por data E por fornecedor selecionado.

3. **Mostrar acoes corretas por status para Admin**:
   - `aguardando_decisao`: Armazenar / Cross (ja existe)
   - `cross_confirmado`: Cross Montado (ja existe)
   - `aguardando_separacao`: Comecar Separacao (ja existe)
   - `em_separacao`: Mostrar badge "Em Separacao" com nome do separador (sem acao, apenas consulta)
   - `finalizado`: Mostrar badge "Finalizado" (sem acao, apenas consulta)

4. **Adicionar colunas de separador e observacao** para itens finalizados na visao admin.

### Nenhuma alteracao no banco de dados

---

## Resumo das mudancas

| Arquivo | O que muda |
|---|---|
| `src/contexts/CrossContext.tsx` | `getCrossParaAdmin` retorna todos os itens sem filtro de status |
| `src/pages/CrossDocking.tsx` | Adiciona filtro de fornecedor, mostra itens em_separacao e finalizado para admin |

