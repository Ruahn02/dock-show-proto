
# Plano - Login Simples com Codigos Fixos

## Resumo

Substituir o toggle de perfil (Admin/Operacional) no Header por um sistema de login simples com codigos fixos. Criar duas telas de login e ajustar o controle de acesso.

---

## ARQUITETURA ATUAL

- `ProfileContext` armazena o perfil em estado (`useState`), sem autenticacao
- O Header tem botoes para trocar perfil livremente
- `ProtectedRoute` redireciona para `/docas` se nao for admin
- Rotas publicas: `/senha`, `/painel`, `/solicitacao`

---

## 1. ATUALIZAR ProfileContext

**Arquivo: src/contexts/ProfileContext.tsx**

Adicionar:
- Estado `autenticado` (boolean, inicia `false`)
- Funcao `login(perfil, codigo)` que valida o codigo
- Funcao `logout()` que limpa o estado
- Validacao: admin requer codigo `admin123`, operacional requer `ACESSO123`

O contexto passa a expor:
```text
perfil, isAdmin, autenticado, login, logout
```

Estado inicial: `autenticado = false`, sem perfil definido.

---

## 2. CRIAR TELA DE LOGIN ADMIN

**Novo arquivo: src/pages/LoginAdmin.tsx**

- Rota: `/login`
- Campos: Email, Senha, Codigo de acesso
- Validacao: codigo deve ser exatamente `admin123`
- Erro: mensagem "Codigo de acesso invalido"
- Sucesso: chama `login('administrador')` e redireciona para `/`
- Email e senha sao apenas visuais (sem validacao real por enquanto)

Design: card centralizado, estilo consistente com o sistema.

---

## 3. CRIAR TELA DE LOGIN OPERACIONAL

**Novo arquivo: src/pages/LoginOperacional.tsx**

- Rota: `/acesso`
- Campo unico: Codigo de acesso
- Validacao: codigo deve ser exatamente `ACESSO123`
- Erro: mensagem "Codigo de acesso invalido"
- Sucesso: chama `login('operacional')` e redireciona para `/docas`

Design: card centralizado, simples, sem campos de email/senha.

---

## 4. ATUALIZAR ProtectedRoute

**Arquivo: src/components/auth/ProtectedRoute.tsx**

- Se `autenticado === false`: redirecionar para `/login`
- Se `autenticado === true` e `adminOnly && !isAdmin`: redirecionar para `/docas`
- Rotas de docas/cross: exigir autenticacao (qualquer perfil)

---

## 5. ATUALIZAR ROTAS (App.tsx)

**Arquivo: src/App.tsx**

Adicionar rotas:
- `/login` -> LoginAdmin
- `/acesso` -> LoginOperacional

Rotas publicas (sem autenticacao):
- `/senha` (caminhoneiro)
- `/painel` (TV)
- `/solicitacao` (fornecedor)
- `/login`
- `/acesso`

Rotas protegidas (qualquer perfil autenticado):
- `/docas`
- `/cross`

Rotas admin only (ja existem com ProtectedRoute):
- `/`, `/solicitacoes`, `/agendamento`, `/agenda`, `/senhas`, `/fornecedores`, `/funcionarios`

---

## 6. ATUALIZAR HEADER

**Arquivo: src/components/layout/Header.tsx**

- Remover botoes de toggle Admin/Operacional
- Exibir perfil atual como texto (ex: "Administrador" ou "Operacional")
- Adicionar botao "Sair" que chama `logout()` e redireciona para `/login`

---

## 7. RESUMO DOS ARQUIVOS

| Arquivo | Alteracao |
|---------|-----------|
| src/contexts/ProfileContext.tsx | Adicionar autenticado, login(), logout() |
| src/pages/LoginAdmin.tsx | NOVO - tela de login admin |
| src/pages/LoginOperacional.tsx | NOVO - tela de login operacional |
| src/components/auth/ProtectedRoute.tsx | Redirecionar para /login se nao autenticado |
| src/App.tsx | Adicionar rotas /login e /acesso, proteger /docas e /cross |
| src/components/layout/Header.tsx | Remover toggle, adicionar botao Sair |

---

## 8. ORDEM DE IMPLEMENTACAO

1. Atualizar ProfileContext (autenticacao)
2. Atualizar ProtectedRoute (exigir autenticacao)
3. Criar LoginAdmin.tsx
4. Criar LoginOperacional.tsx
5. Atualizar App.tsx (rotas)
6. Atualizar Header.tsx (remover toggle, adicionar logout)

---

## 9. RESTRICOES RESPEITADAS

- Codigos fixos hardcoded (admin123 e ACESSO123)
- Sem banco de dados
- Sem permissoes granulares
- Sem mistura de acessos
- Controle temporario e simples
