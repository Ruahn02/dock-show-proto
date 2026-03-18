

# Polling de 15 segundos em todos os hooks de dados

Adicionar `setInterval` de 15 segundos em todos os hooks que fazem fetch de dados do Supabase, mantendo o Realtime existente como camada principal.

## Hooks que serao alterados

| Hook | Arquivo |
|---|---|
| `useFluxoOperacional` | `src/hooks/useFluxoOperacional.ts` |
| `useCargasDB` | `src/hooks/useCargasDB.ts` |
| `useSenhasDB` | `src/hooks/useSenhasDB.ts` |
| `useDocasDB` | `src/hooks/useDocasDB.ts` |
| `useCrossDB` | `src/hooks/useCrossDB.ts` |
| `useConferentesDB` | `src/hooks/useConferentesDB.ts` |
| `useFornecedoresDB` | `src/hooks/useFornecedoresDB.ts` |
| `useSolicitacoesDB` | `src/hooks/useSolicitacoesDB.ts` |

## O que muda em cada hook

Dentro do `useEffect` que ja faz o `fetchDados()` inicial e configura o Realtime, adicionar um `setInterval` de 15 segundos e limpa-lo no cleanup:

```typescript
useEffect(() => {
  fetchDados();
  const interval = setInterval(fetchDados, 15000);

  const channel = supabase
    .channel('...')
    .on('postgres_changes', { ... }, () => fetchDados())
    .subscribe();

  return () => {
    clearInterval(interval);
    supabase.removeChannel(channel);
  };
}, [fetchDados]);
```

Nenhuma outra alteracao -- a logica de Realtime continua identica, o polling apenas garante que os dados se atualizem mesmo se o WebSocket falhar.

