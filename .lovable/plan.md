

# Plano: Remover fila e simplificar fetch

## Causa do loading infinito

`fetchAllRows` passa por `enqueue()` (fila com concorrência 2 + delay 300ms). Com 8-10 hooks + retry de 3 tentativas cada, as promises ficam enfileiradas e nunca resolvem a tempo. Além disso, se o Supabase retorna NetworkError, o retry segura a fila por mais tempo ainda.

## Alterações

### 1) `src/lib/supabasePagination.ts` — Remover enqueue e simplificar

- Remover import de `enqueue` e `supabaseQueue`
- Remover deduplicação (`inFlight` map)
- Remover retry/backoff interno
- `fetchAllRows` vira chamada direta: `supabase.from(table).select(select).order(...).range(...)`
- Em caso de erro, retorna `{ data: [], error }` imediatamente
- Sempre resolve a promise (nunca fica pendurada)

### 2) `src/lib/supabaseQueue.ts` — Remover arquivo ou deixar sem uso

Nenhum hook deve mais importar `enqueue`.

### 3) `src/hooks/useDivergenciasDB.ts` — Remover enqueue

- Trocar `enqueue(() => supabase.from('divergencias')...)` por chamada direta
- Garantir `setLoading(false)` em todos os paths

### 4) `src/hooks/useTiposVeiculoDB.ts` — Remover enqueue

- Trocar `enqueue(() => supabase.from('tipos_veiculo')...)` por chamada direta
- Garantir `setLoading(false)` em todos os paths

### 5) Todos os outros hooks (cargas, senhas, docas, fornecedores, conferentes, cross, solicitacoes, fluxo)

- Já usam `fetchAllRows` — a simplificação do passo 1 resolve automaticamente
- Verificar que `setLoading(false)` é chamado em sucesso E erro (já está OK em todos)

### 6) Manter `withRetry` apenas para operações de escrita

`withRetry` em `supabaseRetry.ts` continua sendo usado apenas em INSERT/UPDATE/DELETE. Não mexer.

## Arquivos alterados

| Arquivo | Alteração |
|---|---|
| `src/lib/supabasePagination.ts` | Remover enqueue, dedup, retry. Fetch direto. |
| `src/hooks/useDivergenciasDB.ts` | Remover import/uso de enqueue |
| `src/hooks/useTiposVeiculoDB.ts` | Remover import/uso de enqueue |

## Resultado

- Todas as 8-10 requisições disparam em paralelo direto ao Supabase
- Sem fila, sem delay artificial
- `setLoading(false)` garantido em todos os cenários
- Nenhuma promise pendurada

