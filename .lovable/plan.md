

# Plano: Corrigir erros de renderização (null safety) sem alterar arquitetura

## Diagnóstico

Analisei todos os arquivos de páginas e hooks. O código já tem a maioria dos `.join()` protegidos com `?? []`, e os hooks já protegem contra sobrescrita de estado. Os pontos que ainda podem causar crash de renderização são:

### Problemas encontrados

| Arquivo | Linha | Problema | Correção |
|---|---|---|---|
| `src/pages/Docas.tsx` | 525 | `cargaDaSenha?.nfs?.join(', ')` — se `nfs` vier `null`, `?.join` funciona, mas se `cargaDaSenha` existir e `nfs` for `null`, o `?.` no `nfs` retorna `undefined` e `join` não é chamado. Seguro, mas inconsistente com padrão `?? []`. | `(cargaDaSenha?.nfs ?? []).join(', ') \|\| '-'` |
| `src/pages/AgendamentoPlanejamento.tsx` | 123 | `d.nota_fiscal?.join(', ')` — se `nota_fiscal` for `null`, `?.join` funciona mas melhor padronizar | `(d.nota_fiscal ?? []).join(', ') \|\| ''` |
| `src/pages/Fornecedores.tsx` | 29 | `f.nome.toLowerCase()` — se `nome` vier `null` do banco, crash direto | `(f.nome ?? '').toLowerCase()` |
| `src/hooks/useCargasDB.ts` | 12 | `nfs: row.nfs \|\| []` — usa `\|\|` que falha se `nfs` for `0` (improvável mas inconsistente) | `nfs: row.nfs ?? []` (menor risco) |
| `src/hooks/useDivergenciasDB.ts` | 42-48 | `enqueue` retorna `{data, error}` mas o `as any` cast mascara. Se Supabase retornar erro com `data: null`, `data` é `null` e `setDivergencias(null)` quebraria `.filter()` depois | Adicionar `setDivergencias((data ?? []) as ...)` |
| `src/hooks/useTiposVeiculoDB.ts` | 33 | Mesmo problema: `setTipos(data as TipoVeiculo[])` sem null check | `setTipos((data ?? []) as TipoVeiculo[])` |

### Estado nos hooks — proteção contra sobrescrita com `[]`

Nos hooks `useSenhasDB`, `useDocasDB`, `useConferentesDB`, `useFornecedoresDB`, `useFluxoOperacional`: quando `err` acontece, o hook faz `setError(...)` mas **não** limpa o array de dados. Isso já está correto. Porém, falta garantir que o `else if (data)` não sete arrays vazios quando `data` é `[]` vs `null`.

### console.error nos pontos críticos

Adicionar `console.error` em cada catch/error path que ainda não tem.

## Alterações pontuais (sem refatoração)

1. **`src/pages/Docas.tsx` L525** — padronizar null safety no `.join`
2. **`src/pages/AgendamentoPlanejamento.tsx` L123** — padronizar null safety
3. **`src/pages/Fornecedores.tsx` L29** — proteger `.toLowerCase()` contra nome null
4. **`src/hooks/useDivergenciasDB.ts` L54** — proteger `setDivergencias` contra data null
5. **`src/hooks/useTiposVeiculoDB.ts` L33** — proteger `setTipos` contra data null
6. **`src/hooks/useCargasDB.ts` L12** — usar `??` em vez de `||` para `nfs`

Total: 6 correções cirúrgicas. Zero alteração de arquitetura, hooks, queries ou lógica de negócio.

