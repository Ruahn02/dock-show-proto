
# Corrigir Atualização em Tempo Real na Tela do Caminhoneiro

## Problema Identificado

Na pagina `SenhaCaminhoneiro.tsx`, o `useEffect` que monitora mudancas na senha tem `senhaGerada` como dependencia:

```typescript
useEffect(() => {
  if (senhaGerada) {
    const senhaAtualizada = getSenhaById(senhaGerada.id);
    if (senhaAtualizada) {
      setSenhaGerada(senhaAtualizada);
    }
  }
}, [senhas, senhaGerada, getSenhaById]); // <-- BUG AQUI
```

O que acontece:
1. O admin vincula a senha a uma doca no outro dispositivo
2. O Supabase Realtime detecta a mudanca e atualiza a lista `senhas`
3. O `useEffect` dispara e chama `setSenhaGerada(senhaAtualizada)`
4. Mas como `senhaGerada` esta nas dependencias, o efeito dispara DE NOVO
5. Isso cria um loop infinito de re-renders que trava a atualizacao

## Solucao

Trocar a abordagem: em vez de guardar o objeto inteiro `senhaGerada` no estado, guardar apenas o `senhaId` e derivar os dados diretamente da lista `senhas` (que ja atualiza via Realtime).

## Alteracoes

**Arquivo:** `src/pages/SenhaCaminhoneiro.tsx`

- Trocar o estado `senhaGerada` (objeto completo) por `senhaGeradaId` (apenas o ID)
- Derivar os dados da senha diretamente de `senhas` usando `getSenhaById(senhaGeradaId)`
- Remover o `useEffect` problematico (nao sera mais necessario)
- Ajustar o restante do componente para usar a senha derivada

## Detalhes tecnicos

O fluxo corrigido:

```text
Admin muda status no outro dispositivo
        |
Realtime atualiza array "senhas" no useSenhasDB
        |
SenhaContext propaga novo array
        |
SenhaCaminhoneiro re-renderiza automaticamente
        |
getSenhaById(senhaGeradaId) retorna dados atualizados
        |
Tela mostra novo status instantaneamente
```

Essa abordagem elimina o `useEffect` e deixa o React cuidar da reatividade naturalmente -- quando `senhas` muda, o componente re-renderiza e `getSenhaById` retorna os dados mais recentes.

Tambem vou verificar e garantir que o `PainelSenhas.tsx` funciona da mesma forma (ele ja usa `getSenhasAtivas()` diretamente, entao ja esta correto).
