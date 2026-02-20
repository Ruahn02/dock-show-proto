
# Corrigir conflito de sessao entre abas Admin e Operacional

## Problema

O sistema usa uma unica chave no localStorage (`dock_show_session`) para guardar a sessao. Quando o usuario abre duas abas (uma como admin, outra como operacional), a ultima que fez login sobrescreve o valor. Ao atualizar qualquer aba, ela le o mesmo dado e assume o perfil errado.

```text
Aba 1: Login Admin   -> localStorage = { perfil: 'administrador', autenticado: true }
Aba 2: Login Operac. -> localStorage = { perfil: 'operacional', autenticado: true }  // sobrescreveu!
Aba 1: F5            -> le 'operacional' -> vira operacional!
```

## Solucao

Usar duas chaves separadas no localStorage, uma para cada perfil:

- `dock_show_session_admin` - sessao do administrador
- `dock_show_session_operacional` - sessao do operacional

Cada tela de login grava e le apenas sua propria chave. Assim, atualizar uma aba nao afeta a outra.

## Alteracoes

### 1. `src/contexts/ProfileContext.tsx`

Substituir a chave unica por duas chaves e ajustar a logica:

**Login:**
- Admin grava em `dock_show_session_admin`
- Operacional grava em `dock_show_session_operacional`

**Leitura inicial (ao carregar a pagina):**
- Verificar `window.location.pathname` para decidir qual chave ler:
  - Se a rota comeca com `/acesso` ou `/docas` ou `/cross`: ler chave operacional
  - Caso contrario: ler chave admin

**Logout:**
- Limpar apenas a chave correspondente ao perfil atual

### 2. Logica detalhada

```text
const STORAGE_KEY_ADMIN = 'dock_show_session_admin';
const STORAGE_KEY_OPERACIONAL = 'dock_show_session_operacional';

// Na inicializacao:
function getStoredSession(): { perfil: Perfil; autenticado: boolean } | null {
  const path = window.location.pathname;
  const isOperacionalRoute = ['/acesso', '/docas', '/cross'].some(r => path.startsWith(r));
  
  const key = isOperacionalRoute ? STORAGE_KEY_OPERACIONAL : STORAGE_KEY_ADMIN;
  const stored = localStorage.getItem(key);
  // ... parse e retorna
}

// No login:
const login = (perfilAlvo: Perfil, codigo: string): boolean => {
  if (codigo === CODIGOS[perfilAlvo]) {
    const key = perfilAlvo === 'administrador' ? STORAGE_KEY_ADMIN : STORAGE_KEY_OPERACIONAL;
    localStorage.setItem(key, JSON.stringify({ perfil: perfilAlvo, autenticado: true }));
    // ...
  }
};

// No logout:
const logout = () => {
  const key = perfil === 'administrador' ? STORAGE_KEY_ADMIN : STORAGE_KEY_OPERACIONAL;
  localStorage.removeItem(key);
  // ...
};
```

## Arquivos modificados

| Arquivo | Alteracao |
|---|---|
| `src/contexts/ProfileContext.tsx` | Separar chaves de sessao por perfil, ler com base na rota atual |

Nenhuma alteracao no banco de dados.

## Resultado esperado

- Aba admin atualizada continua admin
- Aba operacional atualizada continua operacional
- Login em uma aba nao afeta a outra
- Logout limpa apenas a sessao do perfil correspondente
