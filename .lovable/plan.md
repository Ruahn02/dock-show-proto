

# Plano: Escalonamento de requisições + proteção de estado

## Causa raiz confirmada

O App.tsx monta 3 providers globais que disparam 5 hooks simultâneos no mount:
- `SenhaProvider` → useSenhasDB + useCargasDB (2 requests)
- `CrossProvider` → useCrossDB (1 request)  
- `SolicitacaoProvider` → useSolicitacoesDB + useFornecedoresDB (2 requests)

Depois, a página ativa adiciona mais 3-5 hooks (conferentes, docas, divergencias, fluxo, tipos_veiculo). Total: **8-10 requests simultâneas**, causando 503 no free tier.

## Solução

### 1) Criar fila centralizada com concorrência limitada (`src/lib/supabaseQueue.ts`)

```text
Fila global com:
- Concorrência máx: 2 requests simultâneas
- Delay de 300ms entre cada request
- Prioridade: vw_carga_operacional primeiro
- Log de cada request (tabela, status, tempo)
```

Todas as chamadas `fetchAllRows` passarão automaticamente pela fila (modificar internamente, sem mudar assinatura).

### 2) Proteção de estado nos hooks

Em cada hook, ao receber erro, **manter último estado válido** em vez de sobrescrever com `[]`:

```typescript
// Antes (atual):
if (err) { setError(...); }
else if (data) { setDados(data); }

// Depois:
if (err) { 
  setError(...);
  // NÃO sobrescreve dados existentes
} else if (data) { 
  setDados(data); 
  setError(null); 
}
```

### 3) Retry progressivo já existente — ajustar tempos

O retry em `fetchAllRowsInternal` já existe com backoff. Ajustar para intervalos mais curtos (500ms, 1s, 2s) em vez dos atuais 3s-20s, pois a fila já controla a pressão.

### 4) Logs de debug

Adicionar console.log com `[Queue]` prefix mostrando: tabela, attempt, status code, tempo de resposta.

## Arquivos a alterar

| Arquivo | Alteração |
|---|---|
| `src/lib/supabaseQueue.ts` | **NOVO** — fila com concorrência 2 + delay 300ms |
| `src/lib/supabasePagination.ts` | Integrar fila na `fetchAllRows`, ajustar backoff |
| `src/hooks/useFornecedoresDB.ts` | Proteger estado contra sobrescrita em erro |
| `src/hooks/useConferentesDB.ts` | Idem |
| `src/hooks/useCargasDB.ts` | Idem |
| `src/hooks/useSenhasDB.ts` | Idem |
| `src/hooks/useDocasDB.ts` | Idem |
| `src/hooks/useCrossDB.ts` | Idem |
| `src/hooks/useSolicitacoesDB.ts` | Idem |
| `src/hooks/useDivergenciasDB.ts` | Idem |
| `src/hooks/useFluxoOperacional.ts` | Idem |
| `src/hooks/useTiposVeiculoDB.ts` | Idem |

Nenhuma alteração no banco, RPCs ou regras de negócio.

