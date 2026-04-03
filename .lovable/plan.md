

# Plano: Corrigir frontend que não exibe dados

## Problema confirmado

O `cachedFetch` em `src/lib/supabaseCache.ts` mascara erros 503: retorna `{ data: [], error: null }` quando a request falha e não há cache anterior. Os hooks acham que foi sucesso e renderizam lista vazia.

Além disso, 3 providers globais (`SenhaProvider`, `CrossProvider`, `SolicitacaoProvider`) disparam 5 requests + 5 canais Realtime em TODAS as rotas, incluindo `/login` e `/acesso`, que não precisam de dados.

## Complicação identificada

Algumas rotas "públicas" USAM os providers:
- `/solicitacao` → `useSolicitacao()`
- `/senha` → `useSenha()`
- `/painel` → `useSenha()`

Portanto, não é possível simplesmente tirar os providers de todas as rotas públicas. Apenas `/login`, `/acesso`, `/comprador` e `/comprador/agenda` ficam sem providers.

## Etapas (na ordem exata pedida)

### ETAPA 1 — Parar falha silenciosa em `cachedFetch`

**Arquivo: `src/lib/supabaseCache.ts`**

Alterar `cachedFetch` para:
- Se a request falhar E `entry.data` estiver vazio → retornar `{ data: [], error: erroReal }`
- Se a request falhar E `entry.data` tiver dados anteriores → retornar `{ data: dadosAntigos, error: erroReal }`
- NUNCA retornar `error: null` quando houve erro

Isso faz com que os hooks recebam o erro real e possam mostrar `ConnectionError` em vez de lista vazia.

### ETAPA 2 — Mover providers para fora das rotas que não precisam

**Arquivo: `src/App.tsx`**

Criar estrutura onde:
- Rotas `/login`, `/acesso`, `/comprador`, `/comprador/agenda` ficam FORA dos providers
- Todas as outras rotas (incluindo `/solicitacao`, `/senha`, `/painel`) ficam DENTRO dos providers

Isso elimina 5 requests + 5 canais no `/login`.

### ETAPA 3 — Proteger hooks contra sobrescrita de dados em erro

**Arquivos: todos os hooks que usam `cachedFetch`**

Em cada hook (`useFornecedoresDB`, `useDocasDB`, `useConferentesDB`, `useTiposVeiculoDB`, `useDivergenciasDB`, `useFluxoOperacional`):
- Se `cachedFetch` retornar `error` não-nulo → NÃO chamar `setData(novoValor)`, manter estado anterior
- Só atualizar estado quando `error` for null E data for válido
- Garantir `setLoading(false)` sempre

Mesma proteção nos hooks que usam `fetchAllRows` (`useSenhasDB`, `useCargasDB`, `useCrossDB`, `useSolicitacoesDB`): já fazem `else if (data)` — verificar que não sobrescrevem em erro.

### ETAPA 4 — Logs temporários

Adicionar em cada hook:
- `console.log("[FETCH START]", tabela)` antes do fetch
- `console.error("[FETCH ERROR]", tabela, error)` em erro
- `console.log("[FETCH SUCCESS]", tabela, rows.length)` em sucesso

## Arquivos alterados

| Arquivo | Alteração |
|---|---|
| `src/lib/supabaseCache.ts` | Propagar erro real em vez de mascarar |
| `src/App.tsx` | Separar rotas com/sem providers |
| `src/hooks/useFornecedoresDB.ts` | Proteger estado + logs |
| `src/hooks/useConferentesDB.ts` | Proteger estado + logs |
| `src/hooks/useTiposVeiculoDB.ts` | Proteger estado + logs |
| `src/hooks/useDocasDB.ts` | Proteger estado + logs |
| `src/hooks/useDivergenciasDB.ts` | Proteger estado + logs |
| `src/hooks/useFluxoOperacional.ts` | Proteger estado + logs |
| `src/hooks/useSenhasDB.ts` | Logs |
| `src/hooks/useCargasDB.ts` | Logs |
| `src/hooks/useCrossDB.ts` | Logs |
| `src/hooks/useSolicitacoesDB.ts` | Logs |

## Resultado esperado

- Se backend responder: dados aparecem normalmente
- Se backend falhar: tela mostra erro visível, não lista vazia
- `/login`: zero requests ao Supabase
- Nenhuma alteração de arquitetura, banco ou lógica de negócio

