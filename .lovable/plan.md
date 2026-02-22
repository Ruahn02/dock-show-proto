

# Corrigir atualizacao em tempo real na tela de Agendamento

## Problema encontrado

No arquivo `AgendamentoPlanejamento.tsx`, o hook `useFluxoOperacional()` e chamado **duas vezes** (linhas 42 e 79), criando duas instancias independentes. A tabela usa `dados` da primeira instancia, mas `atualizarFluxo` vem da segunda. Quando o fluxo e atualizado, o re-fetch acontece na segunda instancia -- a primeira (que renderiza a tela) nao recebe os dados novos ate que o Realtime dispare o update (que pode demorar).

## Correcao

Uma unica alteracao no arquivo `src/pages/AgendamentoPlanejamento.tsx`:

- **Remover** a segunda chamada `const { atualizarFluxo } = useFluxoOperacional();` da linha 79
- **Incluir** `atualizarFluxo` na desestruturacao da primeira chamada na linha 42, ficando:
  `const { dados, atualizarFluxo } = useFluxoOperacional();`

| Arquivo | Alteracao |
|---|---|
| `src/pages/AgendamentoPlanejamento.tsx` | Unificar as duas chamadas de `useFluxoOperacional()` em uma so (linhas 42 e 79) |
