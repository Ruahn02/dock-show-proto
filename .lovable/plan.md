
# Plano de Ajuste de Permissoes - Perfil Operacional

## Resumo do Objetivo

Restringir completamente o acesso do perfil OPERACIONAL para que:
- Tenha acesso APENAS a tela de Docas
- Nao visualize Dashboard, Agendamento, ou telas administrativas
- Tenha permissoes limitadas mesmo dentro de Docas (apenas conferir)

---

## 1. SIDEBAR - Menu Restrito por Perfil

### Estado Atual
O Sidebar mostra Dashboard, Agendamento e Docas para todos os perfis.
Apenas Fornecedores e Conferentes sao restritos com `adminOnly: true`.

### Alteracoes Necessarias

Criar nova propriedade `operationalOnly` ou inverter a logica para que apenas Docas seja visivel para Operacional.

**Alteracao no array menuItems:**

| Rota | Admin | Operacional |
|------|-------|-------------|
| Dashboard | Visivel | Oculto |
| Agendamento | Visivel | Oculto |
| Docas | Visivel | Visivel |
| Fornecedores | Visivel | Oculto |
| Conferentes | Visivel | Oculto |

### Arquivo a Modificar
- `src/components/layout/Sidebar.tsx`

### Implementacao
```typescript
const menuItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, adminOnly: true },
  { to: '/agendamento', label: 'Agendamento', icon: Calendar, adminOnly: true },
  { to: '/docas', label: 'Docas', icon: Container, adminOnly: false },
  { to: '/fornecedores', label: 'Fornecedores', icon: Building2, adminOnly: true },
  { to: '/conferentes', label: 'Conferentes', icon: Users, adminOnly: true },
];
```

---

## 2. ROTAS - Bloqueio de Acesso Direto

### Estado Atual
Qualquer perfil pode acessar qualquer rota digitando a URL diretamente.

### Alteracoes Necessarias

Criar componente de protecao de rota que redireciona Operacional para /docas.

**Opcao 1: Componente ProtectedRoute**

Criar `src/components/auth/ProtectedRoute.tsx` que:
- Verifica se o perfil e admin
- Se nao for admin e a rota requer admin, redireciona para /docas

**Opcao 2: Verificacao direta nas paginas**

Adicionar verificacao no inicio de Dashboard e Agendamento:
- Se nao for admin, exibe mensagem de acesso restrito ou redireciona

### Arquivos a Modificar/Criar
- Criar `src/components/auth/ProtectedRoute.tsx`
- `src/App.tsx` - Envolver rotas com ProtectedRoute

### Implementacao do ProtectedRoute
```typescript
import { Navigate } from 'react-router-dom';
import { useProfile } from '@/contexts/ProfileContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { isAdmin } = useProfile();
  
  if (adminOnly && !isAdmin) {
    return <Navigate to="/docas" replace />;
  }
  
  return <>{children}</>;
}
```

### Atualizacao do App.tsx
```typescript
<Routes>
  <Route path="/" element={
    <ProtectedRoute adminOnly>
      <Dashboard />
    </ProtectedRoute>
  } />
  <Route path="/agendamento" element={
    <ProtectedRoute adminOnly>
      <Agendamento />
    </ProtectedRoute>
  } />
  <Route path="/docas" element={<Docas />} />
  <Route path="/fornecedores" element={
    <ProtectedRoute adminOnly>
      <Fornecedores />
    </ProtectedRoute>
  } />
  <Route path="/conferentes" element={
    <ProtectedRoute adminOnly>
      <Conferentes />
    </ProtectedRoute>
  } />
  <Route path="*" element={<NotFound />} />
</Routes>
```

---

## 3. HEADER - Ajuste Visual (Opcional)

### Estado Atual
O Header mostra os botoes de troca de perfil (Administrador / Operacional).

### Consideracao
Manter os botoes para fins de demonstracao (prototiipo), permitindo alternar entre perfis para testar as restricoes.

### Arquivo
- `src/components/layout/Header.tsx` - Nenhuma alteracao necessaria

---

## 4. TELA DOCAS - Restricoes Adicionais para Operacional

### Estado Atual
Operacional ja nao pode:
- Vincular carga a doca (isAdmin check)
- Usar e consumo (isAdmin check)
- Liberar doca manualmente (isAdmin check)

### Verificacoes Necessarias
Confirmar que o Operacional pode APENAS:
- Visualizar docas
- Ver fornecedor, NF(s) e volume previsto
- Iniciar conferencia (COMECAR CONFERENCIA)
- Finalizar conferencia (TERMINAR CONFERENCIA)

### Alteracoes Adicionais
- Remover botao "Nova Doca" para Operacional (ja implementado)
- Garantir que nenhuma metrica ou ranking apareca na tela

### Arquivo a Verificar
- `src/pages/Docas.tsx` - Confirmar restricoes existentes

### Codigo Existente (ja correto)
```typescript
// Doca LIVRE - Admin: Vincular Carga + Uso e Consumo
{doca.status === 'livre' && isAdmin && (...)}

// Doca OCUPADA - Todos: Comecar Conferencia
{doca.status === 'ocupada' && (...)}

// Doca EM CONFERENCIA - Todos: Terminar Conferencia
{doca.status === 'em_conferencia' && (...)}

// Doca USO E CONSUMO - Admin: Liberar
{doca.status === 'uso_consumo' && isAdmin && (...)}
```

---

## 5. RESUMO DOS ARQUIVOS A MODIFICAR

| Arquivo | Alteracao |
|---------|-----------|
| `src/components/layout/Sidebar.tsx` | Marcar Dashboard e Agendamento como adminOnly |
| `src/components/auth/ProtectedRoute.tsx` | Criar componente de protecao de rota |
| `src/App.tsx` | Envolver rotas restritas com ProtectedRoute |
| `src/pages/Docas.tsx` | Nenhuma alteracao (ja restrito corretamente) |

---

## 6. FLUXO VISUAL ESPERADO

### Operacional - Menu Lateral
```text
+------------------------+
| [Icon] DOCAS           |  <-- Unica opcao visivel
+------------------------+
```

### Operacional - Acesso Direto via URL
```text
Usuário digita: /dashboard
Sistema redireciona para: /docas

Usuário digita: /agendamento
Sistema redireciona para: /docas

Usuário digita: /fornecedores
Sistema redireciona para: /docas
```

### Operacional - Tela de Docas
```text
+------+-------------+--------+----------+-------------+---------------------------+
| Doca | Fornecedor  | NF(s)  | Vol.Prev | Status      | Acoes                     |
+------+-------------+--------+----------+-------------+---------------------------+
| #1   | ABC Ltda    | NF-001 | 150      | Conferindo  | [TERMINAR CONFERENCIA]    |
| #2   | -           | -      | -        | Livre       | -  (sem acoes)            |
| #3   | Nacional    | NF-003 | 80       | Ocupada     | [COMECAR CONFERENCIA]     |
| #4   | -           | -      | -        | Uso Consumo | -  (sem acoes)            |
+------+-------------+--------+----------+-------------+---------------------------+
```

---

## 7. ORDEM DE IMPLEMENTACAO

1. Criar componente `ProtectedRoute` para protecao de rotas
2. Atualizar `App.tsx` para usar ProtectedRoute nas rotas restritas
3. Atualizar `Sidebar.tsx` para marcar todas as rotas exceto Docas como adminOnly
4. Testar fluxo completo alternando entre perfis

---

## 8. TESTES DE VERIFICACAO

Apos implementacao, verificar:

**Como Operacional:**
- [ ] Menu mostra apenas "Docas"
- [ ] Acessar /dashboard redireciona para /docas
- [ ] Acessar /agendamento redireciona para /docas
- [ ] Acessar /fornecedores redireciona para /docas
- [ ] Acessar /conferentes redireciona para /docas
- [ ] Em Docas, nao aparece botao "Nova Doca"
- [ ] Em Docas livres, nao aparece opcao de vincular carga
- [ ] Em Docas com carga vinculada, pode iniciar conferencia
- [ ] Em Docas em conferencia, pode terminar conferencia
- [ ] Em Docas uso/consumo, nao aparece opcao de liberar

**Como Administrador:**
- [ ] Menu mostra todas as opcoes
- [ ] Pode acessar todas as telas
- [ ] Pode vincular cargas as docas
- [ ] Pode marcar uso e consumo
- [ ] Pode liberar docas
- [ ] Pode criar novas docas

---

## 9. CONSIDERACOES FINAIS

### Seguranca do Prototipo
Este e um prototipo visual sem backend real. As restricoes sao apenas visuais para demonstracao.
Em um sistema real, as permissoes seriam validadas no servidor.

### Troca de Perfil
O Header mantem os botoes de troca de perfil para facilitar a demonstracao.
Ao alternar perfis, o usuario vera imediatamente as mudancas no menu e nas permissoes.

### Experiencia do Operacional
O sistema fica simples e direto:
- Uma unica tela (Docas)
- Duas acoes principais: COMECAR e TERMINAR conferencia
- Sem distracao com metricas ou dados gerenciais
