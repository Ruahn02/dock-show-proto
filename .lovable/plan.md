

# Implementar Paginacao Completa em Todos os Hooks

## Situacao Atual

Nenhum dos 8 hooks do sistema faz paginacao. Todos usam `.select('*')` que retorna no maximo 1000 registros pelo limite padrao do Supabase. Quando qualquer tabela ultrapassar 1000 registros, os dados excedentes simplesmente nao aparecem nas telas.

## Solucao

Criar uma funcao utilitaria generica de fetch paginado e aplicar em todos os hooks.

### 1. Criar funcao utilitaria de fetch paginado

**Novo arquivo:** `src/lib/supabasePagination.ts`

Funcao generica `fetchAllRows` que:
- Faz requisicoes em lotes de 1000 registros usando `.range(from, to)`
- Continua buscando enquanto o resultado retornar exatamente 1000 registros
- Combina todos os resultados em um unico array
- Aceita a query base (tabela, select, order) como parametros

```text
async function fetchAllRows(table, select, orderConfig):
  allRows = []
  from = 0
  pageSize = 1000
  loop:
    data = await supabase.from(table).select(select).order(...).range(from, from + pageSize - 1)
    allRows.push(...data)
    if data.length < pageSize: break
    from += pageSize
  return allRows
```

### 2. Atualizar cada hook para usar fetch paginado

Substituir o `.select('*')` simples pela funcao `fetchAllRows` nos seguintes hooks:

| Arquivo | Tabela |
|---------|--------|
| `src/hooks/useFluxoOperacional.ts` | `vw_carga_operacional` |
| `src/hooks/useDocasDB.ts` | `docas` |
| `src/hooks/useSenhasDB.ts` | `senhas` |
| `src/hooks/useCargasDB.ts` | `cargas` |
| `src/hooks/useCrossDB.ts` | `cross_docking` |
| `src/hooks/useFornecedoresDB.ts` | `fornecedores` |
| `src/hooks/useConferentesDB.ts` | `conferentes` |
| `src/hooks/useSolicitacoesDB.ts` | `solicitacoes` |

Cada hook tera seu `fetchXxx` alterado para chamar `fetchAllRows` com os parametros de ordenacao ja existentes (ex: `order('numero')` para docas, `order('nome')` para fornecedores, etc).

### 3. O que nao muda

- Realtime continua funcionando normalmente (ele dispara re-fetch, que agora sera paginado)
- Nenhuma tabela, coluna, view ou RPC e alterada
- Nenhum layout ou fluxo visual muda
- As telas recebem os dados exatamente como antes, so que agora completos

### Resumo de arquivos

| Arquivo | Alteracao |
|---------|-----------|
| `src/lib/supabasePagination.ts` | Novo - funcao utilitaria generica |
| `src/hooks/useFluxoOperacional.ts` | Usar fetch paginado |
| `src/hooks/useDocasDB.ts` | Usar fetch paginado |
| `src/hooks/useSenhasDB.ts` | Usar fetch paginado |
| `src/hooks/useCargasDB.ts` | Usar fetch paginado |
| `src/hooks/useCrossDB.ts` | Usar fetch paginado |
| `src/hooks/useFornecedoresDB.ts` | Usar fetch paginado |
| `src/hooks/useConferentesDB.ts` | Usar fetch paginado |
| `src/hooks/useSolicitacoesDB.ts` | Usar fetch paginado |

