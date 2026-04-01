

# Plano: Estabilizar carregamento de dados

## O que mudou / causa raiz

O app sempre buscou dados do Supabase REST. Mas as últimas alterações adicionaram:
- Retry com 3 tentativas por hook (bom em teoria, mas multiplica a pressão)
- 10+ hooks disparando em paralelo no mount (mesmo com random delay de 0-2s)
- Polling de 120s mantendo pressão contínua
- Providers globais (SenhaProvider, CrossProvider, SolicitacaoProvider) cada um instanciando hooks separados, todos no root do App

Resultado: ao abrir o app, ~10 hooks × 4 tentativas = ~40 requests em cascata. O Supabase free tier não aguenta e retorna 503 em tudo.

## Correção em 3 frentes

### 1) Serializar o carregamento inicial (principal)
**Arquivo:** `src/lib/supabasePagination.ts`

Em vez de disparar 10 hooks em paralelo (mesmo com concurrency=3), implementar uma **fila de inicialização sequencial** com prioridade:
- Primeiro: tabelas essenciais (fornecedores, conferentes, tipos_veiculo) — catálogos leves
- Depois: tabelas operacionais (cargas, senhas, docas) — dados maiores
- Por último: tabelas secundárias (cross_docking, solicitacoes, divergencias)

Cada fetch só começa após o anterior terminar com sucesso. Se falhar, espera mais tempo antes de tentar o próximo.

### 2) Remover polling de 120s de todos os hooks
**Arquivos:** Todos os 10 hooks (useCargasDB, useSenhasDB, useFornecedoresDB, useDocasDB, useCrossDB, useConferentesDB, useSolicitacoesDB, useDivergenciasDB, useFluxoOperacional, useTiposVeiculoDB)

Remover `setInterval(..., 120000)`. Manter apenas:
- 1 fetch inicial (via fila serializada)
- Realtime para atualizações subsequentes
- `refetch` manual via botão "Tentar novamente"

### 3) Reduzir retries agressivos no carregamento inicial
**Arquivo:** `src/lib/supabasePagination.ts`

- Aumentar backoff mínimo de 1s para 3s no primeiro retry
- Aumentar backoff máximo de 10s para 20s
- Adicionar jitter maior (0-2s em vez de 0-500ms)

Isso dá tempo ao Supabase de se recuperar entre tentativas.

### 4) UI de erro em todas as páginas principais
**Arquivos:** Dashboard, Agenda, Docas, Solicitacoes, SenhaCaminhoneiro, CrossDocking, Armazenamento, AgendamentoPlanejamento

Já existe o componente `ConnectionError`. Falta usá-lo nessas páginas para mostrar erro + botão "Tentar novamente" em vez de tela vazia.

## Resumo de arquivos

| Arquivo | Alteração |
|---|---|
| `src/lib/supabasePagination.ts` | Fila sequencial, backoff mais longo |
| `src/hooks/useCargasDB.ts` | Remover polling 120s |
| `src/hooks/useSenhasDB.ts` | Remover polling 120s |
| `src/hooks/useFornecedoresDB.ts` | Remover polling 120s |
| `src/hooks/useDocasDB.ts` | Remover polling 120s |
| `src/hooks/useCrossDB.ts` | Remover polling 120s |
| `src/hooks/useConferentesDB.ts` | Remover polling 120s |
| `src/hooks/useSolicitacoesDB.ts` | Remover polling 120s |
| `src/hooks/useDivergenciasDB.ts` | Remover polling 120s |
| `src/hooks/useFluxoOperacional.ts` | Remover polling 120s |
| `src/hooks/useTiposVeiculoDB.ts` | Remover polling 120s |
| `src/pages/Dashboard.tsx` | Adicionar ConnectionError |
| `src/pages/Agenda.tsx` | Adicionar ConnectionError |
| `src/pages/Docas.tsx` | Adicionar ConnectionError |
| `src/pages/Solicitacoes.tsx` | Adicionar ConnectionError |
| `src/pages/SenhaCaminhoneiro.tsx` | Adicionar ConnectionError |
| `src/pages/CrossDocking.tsx` | Adicionar ConnectionError |
| `src/pages/Armazenamento.tsx` | Adicionar ConnectionError |
| `src/pages/AgendamentoPlanejamento.tsx` | Adicionar ConnectionError |

Nenhuma alteração em tabelas, RPCs, triggers ou regras de negócio.

## Aviso importante

Se mesmo após essa correção o Supabase continuar retornando 503, o problema é do lado do servidor (plano free tier pausado, ou instância sobrecarregada). Nesse caso, seria necessário verificar o status do projeto no painel do Supabase em https://supabase.com/dashboard/project/nsfenjymbpkhiiwqbqeo.

