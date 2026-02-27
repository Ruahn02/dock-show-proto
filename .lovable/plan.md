
# Login de Comprador (somente leitura) e Correcao de Status

## 1. Correcao do bug de status na tela de Agendamento

Na tela de Agendamento (`AgendamentoPlanejamento.tsx`), quando o caminhao chega e pega senha, o campo `chegou` fica `true` mas o status exibido continua "Aguardando Chegada" porque nao existe a mesma logica de mapeamento visual que a tela de Agenda usa.

**Correcao**: Adicionar a mesma funcao `getDisplayStatus` que ja existe na Agenda, verificando se `chegou === true` e `status_carga === 'aguardando_chegada'` para exibir "Aguardando Doca" com o estilo correto. Tambem adicionar o estilo `aguardando_doca` ao mapa de estilos.

## 2. Acesso de Comprador (somente leitura)

Criar um novo perfil "comprador" com acesso somente leitura a uma versao simplificada da tela de Agendamento (sem botoes de acao).

### Fluxo

```text
Comprador acessa /comprador
        |
        v
  Tela de login com codigo
  (similar ao login operacional)
        |
        v
  Tela de Agendamento somente leitura:
  - Calendario para filtrar por dia
  - Tabela com cargas, horarios, status
  - SEM botoes de Novo, Editar, Cancelar
  - SEM sidebar nem menu admin
```

### Alteracoes

| Arquivo | O que muda |
|---|---|
| `src/types/index.ts` | Adicionar `'comprador'` ao tipo `Perfil` |
| `src/contexts/ProfileContext.tsx` | Adicionar codigo de acesso para comprador e storage key separada |
| `src/pages/LoginComprador.tsx` | **Novo** - Tela de login para comprador (similar a LoginOperacional) |
| `src/pages/AgendamentoComprador.tsx` | **Novo** - Versao somente leitura do Agendamento (tabela + calendario, sem acoes) |
| `src/components/auth/ProtectedRoute.tsx` | Suportar perfil comprador (redirecionar para rota correta) |
| `src/App.tsx` | Adicionar rotas `/comprador` (login) e `/comprador/agenda` (tela read-only) |
| `src/pages/AgendamentoPlanejamento.tsx` | Corrigir exibicao do status "Aguardando Doca" |

### Detalhes tecnicos

**Perfil comprador**: Segue o mesmo padrao dos perfis existentes (administrador/operacional) com codigo de acesso proprio. O comprador so tera acesso a rota `/comprador/agenda`. Se tentar acessar qualquer outra rota protegida, sera redirecionado.

**Tela somente leitura**: Usa os mesmos dados da view `vw_carga_operacional` mas renderiza apenas calendario, resumo e tabela -- sem nenhum botao de acao (Novo, Editar, Cancelar, No-show, Recusado). O layout sera simplificado (sem sidebar completa).

**Codigo de acesso**: Sera adicionado um codigo fixo para o perfil comprador (ex: `COMPRADOR123`), seguindo o mesmo padrao dos outros perfis.
