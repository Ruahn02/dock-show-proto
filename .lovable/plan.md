
Diagnóstico direto

Você tem razão em um ponto: a tela de fornecedores deveria buscar só fornecedores.

Hoje isso não acontece porque o erro está no nível da rota, não na página `Fornecedores.tsx`.

Evidência do código

- `src/pages/Fornecedores.tsx` usa só `useFornecedoresDB()`
- Mas `src/App.tsx` coloca `/fornecedores` dentro de `RoutesWithProviders`
- Esse wrapper monta sempre:
  - `SenhaProvider` → `useSenhasDB()` + `useCargasDB()`
  - `CrossProvider` → `useCrossDB()`
  - `SolicitacaoProvider` → `useSolicitacoesDB()` + `useFornecedoresDB()` + `useSenha()`

Então a rota real hoje é:

```text
/fornecedores
  -> RoutesWithProviders
     -> SenhaProvider        => senhas + cargas
     -> CrossProvider        => cross_docking
     -> SolicitacaoProvider  => solicitacoes + fornecedores
     -> Fornecedores page    => fornecedores
```

Ou seja: a tela que deveria fazer 1 request faz pelo menos 5 fetches lógicos.

Por que “colocar loading enquanto busca tudo” não resolve

- Loading é só UI
- Ele não reduz requests
- O burst continua acontecendo por trás
- E os hooks pesados ainda usam `fetchAllRows('*')`, então `senhas`, `cargas`, `solicitacoes` e `cross_docking` podem virar mais de 1 chamada HTTP cada se houver paginação interna

Então o problema da tela simples não é “fornecedores ser pesado”.
É ela estar herdando tabelas pesadas que não usa.

Onde a abordagem anterior ficou errada

- O corte foi feito no `/login`
- Mas não foi feito por tela simples
- Então `/fornecedores`, `/funcionarios` e `/acessos` continuam entrando no bloco pesado de providers

Plano de correção

1. Quebrar o `RoutesWithProviders` em grupos menores por necessidade real da rota

2. Tirar estas rotas de `SenhaProvider`, `CrossProvider` e `SolicitacaoProvider`:
   - `/fornecedores`
   - `/funcionarios`
   - `/acessos`

3. Manter cada uma com só o que já usa hoje:
   - `/fornecedores` → `useFornecedoresDB()`
   - `/funcionarios` → `useConferentesDB()`
   - `/acessos` → zero Supabase

4. Manter providers só nas rotas que realmente consomem contexto:
   - `SenhaProvider` apenas onde há `useSenha()`
   - `CrossProvider` apenas onde há `useCross()`
   - `SolicitacaoProvider` apenas onde há `useSolicitacao()`

5. Preservar a ordem obrigatória nas rotas que usam solicitação:
   - `SenhaProvider` deve ficar por fora de `SolicitacaoProvider`
   - Senão volta o erro: `useSenha must be used within a SenhaProvider`

Mapa de rota recomendado

```text
Sem providers:
- /login
- /acesso
- /comprador
- /comprador/agenda
- /fornecedores
- /funcionarios
- /acessos

Só SenhaProvider:
- /senha
- /painel

SenhaProvider + SolicitacaoProvider:
- /solicitacao
- /solicitacoes
- /agendamento
- /docas (se continuar usando useSolicitacao)

SenhaProvider + CrossProvider:
- /cross
- /armazenamento

Rotas operacionais completas:
- /
- /agenda
- /senhas
- /docas
```

O que isso resolve imediatamente

- `/fornecedores` passa a pedir só `fornecedores`
- `/funcionarios` passa a pedir só `conferentes`
- `/acessos` para de tocar no Supabase
- Os 503 dessas telas simples tendem a sumir porque elas deixam de carregar `senhas`, `cargas`, `cross_docking` e `solicitacoes` junto

Resumo honesto

O erro não é “faltou spinner”.
O erro é: a tela simples ainda está montando providers globais pesados.
Enquanto isso não for separado por rota, `/fornecedores` nunca vai se comportar como uma tela de 1 request.