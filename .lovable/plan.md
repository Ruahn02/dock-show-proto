
# Debug completo — causa raiz e plano de correção

## Causa raiz identificada (não é RLS)
Após inspecionar código + logs de rede + consultas no banco:

1. **O app está solicitando dados sim** (várias chamadas `GET /rest/v1/...`).
2. **As respostas estão falhando com `503` e `connection timeout`** (`upstream connect error`), então os arrays ficam vazios.
3. **Os hooks silenciam o erro**: padrão atual só faz `setDados(...)` quando sucesso e sempre faz `setLoading(false)` sem expor erro; resultado visual = “sem dados” sem diagnóstico.
4. **Há fan-out de requisições**: múltiplos hooks e contexts consultando as mesmas tabelas + polling de 15s em cada hook aumentam pressão e pioram instabilidade.
5. **RLS não bloqueia leitura**: políticas `anon_select_*` existem; consultas diretas mostram dados (`fornecedores`, `cargas`, `senhas`, `vw_carga_operacional` com registros).

## O que será corrigido

### 1) Camada de fetch (base única de robustez)
**Arquivo:** `src/lib/supabasePagination.ts`

- Adicionar **retry com backoff** para erro transitório (503/network timeout).
- Adicionar **deduplicação de chamadas simultâneas** por chave (tabela+select+order+range), evitando rajada duplicada.
- Padronizar retorno de erro com contexto (tabela, tentativa, mensagem).
- Adicionar logs de debug temporários controlados por flag (sem poluir produção).

### 2) Hooks (crítico) — parar erro silencioso
**Arquivos:**
- `src/hooks/useCargasDB.ts`
- `src/hooks/useSenhasDB.ts`
- `src/hooks/useFornecedoresDB.ts`
- `src/hooks/useSolicitacoesDB.ts`
- `src/hooks/useCrossDB.ts`
- `src/hooks/useDocasDB.ts`
- `src/hooks/useConferentesDB.ts`
- `src/hooks/useFluxoOperacional.ts`
- `src/hooks/useDivergenciasDB.ts`
- `src/hooks/useTiposVeiculoDB.ts`

**Ajustes padrão em todos:**
- Incluir estado `error` (ex.: `string | null`).
- Em falha: `console.error` estruturado + `setError(...)`.
- Em sucesso: limpar `error` e atualizar estado.
- Evitar “falso vazio”: diferenciar “sem dados reais” de “falha de carregamento”.
- Reduzir polling agressivo (15s) para estratégia mais estável:
  - priorizar realtime,
  - polling de fallback menos frequente (ou apenas quando necessário).

### 3) Reduzir fan-out de leitura entre telas/contexts
**Arquivos principais:** `src/App.tsx`, `src/contexts/*`, páginas que instanciam hooks repetidos

- Evitar múltiplas instâncias consultando o mesmo recurso em paralelo sem necessidade.
- Consolidar leitura compartilhada onde já existe provider/context.
- Manter regras de negócio intactas; ajuste apenas de carregamento/consumo de dados.

### 4) Exibição de erro e recuperação na UI
**Páginas prioritárias:**
- `src/pages/Fornecedores.tsx`
- `src/pages/Agenda.tsx`
- `src/pages/Docas.tsx`
- `src/pages/Dashboard.tsx`
- `src/pages/Solicitacoes.tsx`
- `src/pages/SenhaCaminhoneiro.tsx`

- Mostrar estado explícito:
  - `loading`,
  - `erro de conexão`,
  - `sem registros`.
- Adicionar ação de **“Tentar novamente”** chamando `refetch`.
- Garantir que, ao voltar a conectividade, os dados reapareçam automaticamente.

### 5) Verificações pedidas (checklist fechado)
1. **Conexão Supabase:** URL/KEY e client OK.
2. **Hooks:** queries corretas; sem erro silencioso; sem sobrescrita por mock.
3. **RLS:** SELECT permitido para anon nas tabelas usadas.
4. **Estrutura do banco:** tabelas/colunas batem com código; view operacional retorna dados.
5. **Páginas/componentes:** consumo de estado será corrigido para tratar erro vs vazio.
6. **Console:** erros de fetch/Supabase serão logados com contexto para diagnóstico real.

### 6) Entrega após implementação
Vou te devolver:
- **Causa raiz final** (com evidências).
- **Lista exata de arquivos alterados**.
- **Código final dos hooks corrigidos** (com tratamento de erro/retry).
- **Validação de pronto para teste** com roteiro E2E (carregamento normal + queda/retorno de conexão).
