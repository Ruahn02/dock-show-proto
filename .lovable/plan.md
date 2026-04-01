

# Plano: Remover fila sequencial + Null safety + Campo legado + Isolamento de erros

## Alterações

### 1) Remover `enqueueInitialFetch` de `supabasePagination.ts`
Apagar `initQueue`, `initRunning`, `processInitQueue` e a função exportada `enqueueInitialFetch` (linhas 17-43). Manter `fetchAllRows` com retry e deduplicação intactos.

### 2) Todos os hooks: fetch direto no mount
Em cada um dos 10 hooks, trocar:
```typescript
import { enqueueInitialFetch } from '@/lib/supabasePagination';
// ...
enqueueInitialFetch(fetchXxx);
```
por:
```typescript
fetchXxx();
```

**Hooks afetados:** `useFornecedoresDB`, `useConferentesDB`, `useCargasDB`, `useSenhasDB`, `useDocasDB`, `useCrossDB`, `useSolicitacoesDB`, `useDivergenciasDB`, `useFluxoOperacional`, `useTiposVeiculoDB`.

### 3) Null safety na renderização — campos da view
Locais já identificados que precisam de fallback seguro:

| Arquivo | Campo | Correção |
|---|---|---|
| `AgendamentoPlanejamento.tsx:247` | `d.nota_fiscal` | Já tem check — OK |
| `AgendamentoPlanejamento.tsx:254` | `d.divergencia` | Substituir por `'-'` (item 4) |
| `CrossDocking.tsx:253` | `cross.nfs.join(...)` | `(cross.nfs ?? []).join(', ') \|\| '-'` |
| `Agenda.tsx:230,261,394` | `carga.nfs?.join(...)` | Já tem `?.` — OK |
| `AgendamentoComprador.tsx:165` | `d.nota_fiscal` | Já tem check — OK |
| `AssociarCargaModal.tsx:79` | `carga.nfs.join(...)` | `(carga.nfs ?? []).join(', ')` |
| `AgendamentoModal.tsx:44` | `carga?.nfs.join(...)` | `(carga?.nfs ?? []).join(', ')` |

### 4) Remover uso do campo legado `divergencia`
- `AgendamentoPlanejamento.tsx:254`: trocar `d.divergencia || '-'` por `'-'` (ou remover a coluna da tabela)
- `Docas.tsx:298`: `p_divergencia: data.divergencia || null` — manter no RPC call pois o campo ainda existe no banco, mas usar `null` como default
- `useCargasDB.ts:19,39`: manter o mapeamento (campo existe no banco), mas não exibir em telas

### 5) Isolamento de erros por hook
Cada hook já tem seu próprio `error` state independente. O problema atual é que o `enqueueInitialFetch` serializa tudo — se um falha, atrasa todos os seguintes. Ao remover a fila (item 1), cada hook carrega independentemente e seu erro não afeta os outros.

Nas páginas que usam múltiplos hooks, verificar que o `ConnectionError` só aparece quando **todos** os hooks relevantes falharem, não quando apenas um falhou:
- `Agenda.tsx`: usa `useSenha()` (que tem `error`) + `useFornecedoresDB` + `useConferentesDB` + `useDivergenciasDB` — cada um independente
- `Dashboard.tsx`, `Docas.tsx`, etc. — mesmo padrão

## Arquivos a alterar

| Arquivo | Alteração |
|---|---|
| `src/lib/supabasePagination.ts` | Remover fila (linhas 17-43) |
| `src/hooks/useFornecedoresDB.ts` | `fetchFornecedores()` direto |
| `src/hooks/useConferentesDB.ts` | `fetchConferentes()` direto |
| `src/hooks/useCargasDB.ts` | `fetchCargas()` direto |
| `src/hooks/useSenhasDB.ts` | `fetchSenhas()` direto |
| `src/hooks/useDocasDB.ts` | `fetchDocas()` direto |
| `src/hooks/useCrossDB.ts` | `fetchCross()` direto |
| `src/hooks/useSolicitacoesDB.ts` | `fetchSolicitacoes()` direto |
| `src/hooks/useDivergenciasDB.ts` | `fetchDivergencias()` direto |
| `src/hooks/useFluxoOperacional.ts` | `fetchDados()` direto |
| `src/hooks/useTiposVeiculoDB.ts` | `fetchTipos()` direto |
| `src/pages/AgendamentoPlanejamento.tsx` | Remover exibição de `d.divergencia` |
| `src/pages/CrossDocking.tsx` | Null safety em `cross.nfs` |
| `src/components/docas/AssociarCargaModal.tsx` | Null safety em `carga.nfs` |
| `src/components/agendamento/AgendamentoModal.tsx` | Null safety em `carga?.nfs` |

Nenhuma alteração em banco, RPCs, triggers ou regras de negócio.

