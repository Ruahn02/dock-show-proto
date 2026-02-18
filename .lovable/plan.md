
# Auto-redirecionamento para usuarios ja autenticados

## Problema atual

O sistema ja salva a sessao no `localStorage` atraves do `ProfileContext`. Porem, as telas de login (`/login` e `/acesso`) nao verificam se o usuario ja esta autenticado. Resultado: mesmo com sessao ativa, o usuario ve o formulario de login ao acessar essas rotas.

## Solucao

Adicionar verificacao de autenticacao no inicio de cada tela de login. Se ja autenticado, redirecionar automaticamente para a pagina correta.

## Alteracoes

### 1. `src/pages/LoginAdmin.tsx`

Adicionar no inicio do componente:

```text
const { login, autenticado, isAdmin } = useProfile();

if (autenticado && isAdmin) {
  return <Navigate to="/" replace />;
}
```

Se o admin ja esta logado, vai direto pro Dashboard.

### 2. `src/pages/LoginOperacional.tsx`

Adicionar no inicio do componente:

```text
const { login, autenticado } = useProfile();

if (autenticado) {
  return <Navigate to="/docas" replace />;
}
```

Se o operacional ja esta logado, vai direto pra Docas.

## Arquivos modificados

| Arquivo | Alteracao |
|---|---|
| `src/pages/LoginAdmin.tsx` | Redireciona admin autenticado para `/` |
| `src/pages/LoginOperacional.tsx` | Redireciona operacional autenticado para `/docas` |

Nenhuma alteracao no banco de dados. A persistencia ja funciona via localStorage.
