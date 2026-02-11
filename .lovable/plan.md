

# Correcao do Fluxo Completo: Agenda, Senhas e Docas

## Problemas Identificados

1. **Motorista gera senha mas carga nao e marcada como "chegou"**: `SenhaCaminhoneiro.tsx` chama `gerarSenha()` mas nunca chama `marcarChegada()`. Resultado: carga permanece com `chegou=false`, fornecedor nao fica verde na Agenda, e carga nao aparece em `getCargasDisponiveis()`.

2. **Vincular senha a doca nao atualiza a carga**: `ControleSenhas.tsx` `handleConfirmVincular` atualiza senha e doca, mas nao localiza a carga associada, nao preenche `doca.cargaId` e nao muda carga para `aguardando_conferencia`.

3. **Tipo `StatusCarga` nao possui `aguardando_conferencia`**: O tipo TypeScript so tem `aguardando_chegada | em_conferencia | conferido | no_show | recusado`. O fluxo correto exige o status intermediario `aguardando_conferencia`.

4. **Label incorreto**: `statusCargaLabels` mostra `aguardando_chegada` como "Aguardando Conferencia" quando deveria ser "Aguardando Chegada".

5. **Estilos faltando**: `Agenda.tsx` `statusStyles` nao tem estilo para `aguardando_conferencia`.

---

## Correcoes (em ordem)

### 1. Adicionar `aguardando_conferencia` ao tipo `StatusCarga`

**Arquivo:** `src/types/index.ts`

- Adicionar `'aguardando_conferencia'` ao union type `StatusCarga`
- Resultado: `'aguardando_chegada' | 'aguardando_conferencia' | 'em_conferencia' | 'conferido' | 'no_show' | 'recusado'`

### 2. Corrigir labels e estilos

**Arquivo:** `src/data/mockData.ts`

- Corrigir `statusCargaLabels`:
  - `aguardando_chegada` -> "Aguardando Chegada" (era "Aguardando Conferencia")
  - Adicionar `aguardando_conferencia` -> "Aguardando Conferencia"

**Arquivo:** `src/pages/Agenda.tsx`

- Adicionar estilo para `aguardando_conferencia` no objeto `statusStyles` (azul, consistente com visual padronizado)

### 3. Gerar senha marca chegada da carga

**Arquivo:** `src/pages/SenhaCaminhoneiro.tsx`

- Apos `gerarSenha()`, localizar a carga do dia para o fornecedor selecionado (primeira carga com `status === 'aguardando_chegada'` e `chegou !== true`)
- Chamar `marcarChegada(cargaId, senhaId)` para:
  - Definir `chegou = true` na carga
  - Vincular `senhaId` na carga
- Isso faz o fornecedor aparecer verde na Agenda

### 4. Vincular senha a doca atualiza carga para `aguardando_conferencia`

**Arquivo:** `src/pages/ControleSenhas.tsx`

- Em `handleConfirmVincular`:
  - Apos atualizar senha e doca, localizar a carga vinculada a essa senha (`cargas.find(c => c.senhaId === senhaId)`)
  - Atualizar `doca.cargaId` com o ID da carga encontrada
  - Atualizar `carga.status` para `aguardando_conferencia`
- Importar `cargas` e `atualizarCarga` do contexto `useSenha()`

- Em `handleConfirmRetomar`:
  - Mesma logica: localizar carga pela senha, atualizar `doca.cargaId` e carga status

### 5. Garantir que `getCargasDisponiveis()` inclua `aguardando_conferencia`

**Arquivo:** `src/contexts/SenhaContext.tsx`

- Nenhuma alteracao necessaria neste filtro. `getCargasDisponiveis()` e usado pela tela Docas para vincular carga a doca. Ele filtra `status === 'aguardando_chegada' && chegou === true`, que e o estado correto para cargas que chegaram mas ainda nao foram vinculadas a doca.

---

## Resumo de arquivos alterados

| Arquivo | Alteracao |
|---------|-----------|
| `src/types/index.ts` | Adicionar `aguardando_conferencia` ao tipo `StatusCarga` |
| `src/data/mockData.ts` | Corrigir label `aguardando_chegada`, adicionar label `aguardando_conferencia` |
| `src/pages/Agenda.tsx` | Adicionar estilo para `aguardando_conferencia` |
| `src/pages/SenhaCaminhoneiro.tsx` | Chamar `marcarChegada` ao gerar senha |
| `src/pages/ControleSenhas.tsx` | Vincular carga a doca e atualizar status da carga |

## O que NAO sera alterado

- Telas, layouts ou componentes visuais
- Dashboard
- Autenticacao
- Estrutura de tabelas no Supabase (coluna `status` ja e `text`)
- RLS, Realtime
- Nenhuma funcionalidade nova

