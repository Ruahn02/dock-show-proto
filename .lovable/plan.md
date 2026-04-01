

# Plano: Sistema de carregamento inteligente por tela

## Diagnóstico real (baseado nos network logs de agora)

Os logs mostram que MESMO na rota `/login`, o app dispara **5 requisições + 5 canais Realtime** porque os 3 providers globais envolvem TODO o app:

```text
SEMPRE (qualquer rota, incluindo /login):
  SenhaProvider    → senhas + cargas           = 2 req + 2 canais
  CrossProvider    → cross_docking             = 1 req + 1 canal
  SolicitacaoProvider → solicitacoes + fornecedores = 2 req + 2 canais
                                          SUBTOTAL: 5 req + 5 canais

Página /docas (exemplo):
  + useFluxoOperacional → vw_carga_operacional  = 1 req + 1 canal
  + useDocasDB → docas                          = 1 req + 1 canal
  + useTiposVeiculoDB → tipos_veiculo           = 1 req + 1 canal
  + useDivergenciasDB → divergencias            = 1 req + 1 canal
                                          SUBTOTAL: 4 req + 4 canais

TOTAL na /docas: 9 requests + 9 canais Realtime simultâneos → 503
```

Além disso, `useFornecedoresDB()` é chamado em **8 páginas** além do provider — cada uma abre um canal Realtime separado.

## Sua proposta é viável? SIM, parcialmente

O hook genérico com chunked fetch + delay **resolve o 503**, mas tem trade-offs:
- Carregar 50 em 50 com delay de 500ms para 359 fornecedores = ~4 segundos para completar
- Reescrever TODOS os hooks e páginas é trabalho grande e arriscado

## Proposta otimizada (mesmo resultado, menos risco)

### Fase 1: Providers lazy — impacto imediato (resolve 503)

Mover os 3 providers para dentro das rotas protegidas. Nas rotas públicas (`/login`, `/solicitacao`, `/senha`, `/painel`, `/comprador`), não carregar providers.

**Arquivo: `src/App.tsx`**
- Criar componente `<ProvidersWrapper>` que envolve apenas as rotas admin/operacional
- Rotas públicas ficam FORA dos providers → zero requests no `/login`

Resultado: de 5 requests no login → 0 requests no login.

### Fase 2: Hooks com cache singleton (elimina duplicação)

Criar um cache simples em memória para cada tabela. Se `useFornecedoresDB()` é chamado em 8 páginas, o fetch real acontece **1 vez**. Os outros 7 recebem o cache.

**Arquivo: `src/lib/supabaseCache.ts`** (novo, ~40 linhas)
- Map simples: `{ fornecedores: { data, promise, timestamp } }`
- Se já tem dados em cache (< 30s), retorna direto
- Se já tem um fetch em andamento, aguarda a mesma promise
- Um único canal Realtime por tabela (não por hook)

**Todos os hooks (fornecedores, conferentes, tipos_veiculo, docas, divergencias):**
- Usar cache antes de fazer fetch
- Compartilhar canal Realtime entre instâncias

Resultado: de 4x `fornecedores` → 1x `fornecedores`.

### Fase 3: Realtime com debounce (reduz cascata)

**Todos os hooks que escutam Realtime:**
- Adicionar debounce de 2 segundos no handler
- Se receber 5 eventos em 2s, faz 1 refetch (não 5)

### Fase 4: Escalonamento entre providers

Os providers que restam dentro das rotas protegidas:
- SenhaProvider: imediato
- CrossProvider: 500ms delay (já implementado)
- SolicitacaoProvider: 1000ms delay (já implementado)

## Arquivos alterados

| Arquivo | Alteração |
|---|---|
| `src/App.tsx` | Mover providers para dentro das rotas protegidas |
| `src/lib/supabaseCache.ts` | Novo: cache singleton + canal Realtime compartilhado |
| `src/hooks/useFornecedoresDB.ts` | Usar cache singleton |
| `src/hooks/useConferentesDB.ts` | Usar cache singleton |
| `src/hooks/useTiposVeiculoDB.ts` | Usar cache singleton |
| `src/hooks/useDocasDB.ts` | Usar cache singleton |
| `src/hooks/useDivergenciasDB.ts` | Usar cache singleton |
| `src/hooks/useFluxoOperacional.ts` | Usar cache singleton |
| `src/hooks/useSenhasDB.ts` | Adicionar debounce no Realtime |
| `src/hooks/useCargasDB.ts` | Adicionar debounce no Realtime |
| `src/hooks/useCrossDB.ts` | Adicionar debounce no Realtime |
| `src/hooks/useSolicitacoesDB.ts` | Adicionar debounce no Realtime |

## Resultado esperado

- `/login`: 0 requests (antes: 5)
- Qualquer página admin: máx 4-5 requests únicas (antes: 9+)
- Zero duplicação de fetch
- Zero duplicação de canais Realtime
- Debounce evita cascata de refetch
- **Sem chunked loading** (as tabelas são pequenas, max 359 rows — chunk não ajuda aqui)
- Mantém toda a lógica de negócio, contexts e estrutura existente

## Por que NÃO usar chunk de 50 registros?

As tabelas são pequenas:
- fornecedores: 359 rows
- conferentes: ~10 rows
- docas: ~20 rows
- tipos_veiculo: ~10 rows

Carregar 50 por vez com delay seria MAIS lento que uma única query. O chunk só faz sentido para tabelas com 5000+ rows. O problema real é **quantidade de requests simultâneas**, não tamanho delas.

