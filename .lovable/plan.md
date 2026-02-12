
# Correcao Critica do Fluxo de Recusa

## Bugs Encontrados

### Bug 1: `handleRecusarCarga` em Docas.tsx (linha 192)
`recusarCarga()` e chamado **sem `await`**. A limpeza da doca executa em paralelo com a atualizacao de carga/senha, causando race condition e estado inconsistente.

### Bug 2: Recusa pela Agenda (linhas 71-77) NAO limpa a doca
Quando o usuario recusa pela tela Agenda, `recusarCarga()` atualiza carga e senha, mas **nenhum codigo limpa a doca**. A doca permanece `ocupada` com `carga_id` e `senha_id` preenchidos. Resultado: doca travada com botoes de conferencia visiveis.

### Bug 3: ControleSenhas recusa sem carga (linhas 208-228)
Se a senha nao tem carga vinculada (senha orfa), `cargaVinculada` e null e `recusarCarga` nunca e chamado. A **senha nunca muda para `recusado`** — fica presa no estado anterior.

### Bug 4: `recusarCarga` no SenhaContext usa closure stale
A funcao usa `cargas.find()` da closure. Se o array `cargas` foi atualizado por Realtime entre o clique e a execucao, o `senhaId` pode nao ser encontrado.

---

## Correcoes

### Correcao 1: `recusarCarga` deve limpar a doca diretamente no banco

**Arquivo:** `src/contexts/SenhaContext.tsx`

O SenhaContext nao tem acesso a `useDocasDB`, e passar callbacks entre hooks cria acoplamento fragil. A solucao mais robusta: fazer `recusarCarga` limpar a doca diretamente via Supabase, sem depender do hook.

Alterar `recusarCarga` para:
1. Buscar a carga do banco (nao da closure) para garantir dados frescos
2. Atualizar `carga.status = 'recusado'`
3. Se houver `senhaId` na carga, atualizar `senha.status = 'recusado'`, `senha.local_atual = 'aguardando_doca'`, `senha.doca_numero = null`
4. Buscar a doca com `senha_id` ou `carga_id` correspondente e limpar: `status = 'livre'`, `carga_id = null`, `senha_id = null`, `conferente_id = null`, `volume_conferido = null`, `rua = null`

Todas as operacoes feitas via `supabase.from()` direto, nao via hooks. O Realtime propagara as mudancas para todas as telas automaticamente.

A assinatura muda para aceitar opcionalmente um `senhaId` para cobrir o caso de senhas orfas:
```
recusarCarga: (cargaId: string | null, senhaId?: string) => Promise<void>
```

### Correcao 2: Simplificar chamadas nas telas

**Arquivo:** `src/pages/Docas.tsx`

`handleRecusarCarga` (linha 188-200):
- Remover a limpeza manual da doca (ja feita dentro de `recusarCarga`)
- Adicionar `await` na chamada
- Resultado: apenas `await recusarCarga(docaToRecusar.cargaId)`

**Arquivo:** `src/pages/Agenda.tsx`

`handleRecusado` (linha 71-77):
- Nenhuma alteracao necessaria — `recusarCarga` agora limpa a doca internamente

**Arquivo:** `src/pages/ControleSenhas.tsx`

`handleConfirmRecusar` (linha 208-228):
- Remover limpeza manual da doca
- Chamar `recusarCarga(cargaId, senhaId)` passando ambos os IDs
- Se nao tem carga, passar `null` como cargaId e o `senhaId` da senha selecionada
- Resultado: cobre senhas orfas

### Correcao 3: Importar supabase no SenhaContext

**Arquivo:** `src/contexts/SenhaContext.tsx`

Adicionar `import { supabase } from '@/integrations/supabase/client'` para fazer queries diretas na tabela `docas` dentro de `recusarCarga`.

### Correcao 4: Atualizar interface do contexto

**Arquivo:** `src/contexts/SenhaContext.tsx`

Alterar a interface `SenhaContextType`:
```
recusarCarga: (cargaId: string | null, senhaId?: string) => Promise<void>
```

---

## Resumo de arquivos

| Arquivo | Alteracao |
|---------|-----------|
| `src/contexts/SenhaContext.tsx` | `recusarCarga` faz limpeza completa (carga + senha + doca) via Supabase direto; nova assinatura aceita senhaId |
| `src/pages/Docas.tsx` | `handleRecusarCarga` simplificado: apenas `await recusarCarga()`, sem limpeza manual |
| `src/pages/Agenda.tsx` | Nenhuma alteracao necessaria (ja chama `recusarCarga` corretamente) |
| `src/pages/ControleSenhas.tsx` | `handleConfirmRecusar` simplificado: passa senhaId, sem limpeza manual |

## O que NAO sera alterado

- Layout visual
- Estrutura de tabelas
- RLS, Realtime
- Dashboard
- Tela SenhaCaminhoneiro
- Nenhuma funcionalidade nova
