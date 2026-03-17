

# Plano: Ajustes de Interface e Funcionalidades

## 1) Ações na Tela de Agenda — "Atrasado" e "Excluir entrega"

**Onde:** `src/pages/Agenda.tsx` (menu de ações, linhas 344-365) e `src/types/index.ts`

**Alterações:**
- Adicionar `'atrasado'` ao tipo `StatusCarga` em `src/types/index.ts`
- Adicionar label `'atrasado': 'Atrasado'` em `src/data/mockData.ts` (statusCargaLabels)
- Adicionar estilo `atrasado: 'bg-orange-100 text-orange-800 border-orange-300'` nos statusStyles
- Adicionar estados `confirmAtrasado` e `confirmExcluir` com seus AlertDialogs
- "Atrasado": chama `atualizarFluxo({ p_carga_id, p_novo_status: 'atrasado' })` — mas como a RPC não conhece esse status, será feito via `atualizarCarga(id, { status: 'atrasado' })` diretamente
- "Excluir": deleta a carga do banco via `supabase.from('cargas').delete().eq('id', ...)` com confirmação prévia. Também exclui senhas vinculadas
- Ambas opções disponíveis no dropdown para cargas que não estejam finalizadas
- Adicionar função `excluirCarga` no hook `useCargasDB.ts`

**Migração SQL:** Nenhuma necessária — o campo `status` é `text`, não enum.

## 2) Filtro de Fornecedor Embutido no Select

**Onde:** `src/pages/SenhaCaminhoneiro.tsx` (linhas 284-303)

**Alterações:**
- Remover o `<Input>` separado de busca (linhas 286-291)
- Remover estado `filtroFornecedor`
- Substituir o `<Select>` por um Combobox usando `<Popover>` + `<Command>` (shadcn) com campo de busca integrado no dropdown
- Isso permite ao motorista digitar dentro do dropdown para filtrar, sem poluir a interface

## 3) Bloqueio de Múltiplos Cliques

**Onde:** `src/pages/SenhaCaminhoneiro.tsx` (botão GERAR SENHA) e `src/pages/Agenda.tsx` (botões de confirmação nos AlertDialogs)

**Alterações:**
- Adicionar estado `isProcessing` (boolean) em ambos os arquivos
- No `handleGerarSenha`: setar `isProcessing = true` antes do try, e `false` no finally
- No botão GERAR SENHA: adicionar `disabled={isProcessing}` e texto "Gerando..." quando processando
- Nos handlers `handleNoShow`, `handleRecusado`, `handleFinalizar`, `handleAtrasado`, `handleExcluir`: mesmo padrão de `isProcessing`
- Nos `AlertDialogAction`: adicionar `disabled={isProcessing}`

## 4) Filtro de Cargas na Solicitação de Senha

**Onde:** `src/pages/SenhaCaminhoneiro.tsx` (linhas 57-70)

**Status atual:** Já filtra `conferido`, `recusado`, `no_show` (linha 61). Falta filtrar `atrasado` (novo status).

**Alteração:**
- Adicionar `'atrasado'` à lista de exclusão na linha 61: `if (['conferido', 'recusado', 'no_show', 'atrasado'].includes(c.status)) return false;`
- Nota: "desconsideradas" = cargas excluídas (que serão deletadas pelo item 1), então já não aparecerão

## Resumo de Arquivos

| Arquivo | Alteração |
|---|---|
| `src/types/index.ts` | Adicionar `'atrasado'` ao tipo StatusCarga |
| `src/data/mockData.ts` | Adicionar label para status atrasado |
| `src/pages/Agenda.tsx` | Novas ações (Atrasado, Excluir), bloqueio de cliques, estilo atrasado |
| `src/pages/SenhaCaminhoneiro.tsx` | Combobox com busca embutida, bloqueio de cliques, filtro atrasado |
| `src/hooks/useCargasDB.ts` | Adicionar função `excluirCarga` |

