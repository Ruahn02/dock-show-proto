
# Plano de Correcao - Inconsistencias Funcionais e de Persistencia

## Escopo

Corrigir 4 problemas identificados no relatorio tecnico, sem criar funcionalidades novas, telas, layouts ou regras de negocio.

---

## CORRECAO 1 - AssociarCargaModal.tsx (mock -> Supabase)

**Problema:** Importa `fornecedores` de `mockData.ts` (IDs `f1`, `f2`, etc.), impossibilitando resolucao de nomes com UUIDs reais do Supabase.

**Solucao:** Receber `fornecedores` via props (o componente pai `Docas.tsx` ja possui fornecedores do Supabase via `useFornecedoresDB()`).

**Alteracoes:**
- `src/components/docas/AssociarCargaModal.tsx`:
  - Remover `import { fornecedores, ... } from '@/data/mockData'`
  - Manter import de `statusCargaLabels` (e um label de UI, nao dado)
  - Adicionar `fornecedores: Fornecedor[]` na interface de props
  - Usar fornecedores recebidos por props em `getFornecedorNome`

- `src/pages/Docas.tsx`:
  - Passar `fornecedores={fornecedores}` ao renderizar `<AssociarCargaModal>`

---

## CORRECAO 2 - AgendamentoModal.tsx (mock -> Supabase)

**Problema:** Importa `fornecedores` de `mockData.ts` (IDs `f1`, `f2`, etc.), mesmo problema de cruzamento de IDs.

**Solucao:** Receber `fornecedores` via props (os componentes pais `Agenda.tsx` e `AgendamentoPlanejamento.tsx` ja possuem fornecedores do Supabase).

**Alteracoes:**
- `src/components/agendamento/AgendamentoModal.tsx`:
  - Remover `import { fornecedores } from '@/data/mockData'`
  - Adicionar `fornecedores: Fornecedor[]` na interface de props
  - Usar fornecedores recebidos por props em `fornecedoresAtivos` e `selectedFornecedor`
  - Importar tipo `Fornecedor` de `@/types`

- `src/pages/Agenda.tsx`:
  - Passar `fornecedores={fornecedores}` ao renderizar `<AgendamentoModal>`

- `src/pages/AgendamentoPlanejamento.tsx`:
  - Passar `fornecedores={fornecedores}` ao renderizar `<AgendamentoModal>`

---

## CORRECAO 3 - Vinculo Senha <-> Doca (ControleSenhas.tsx)

**Problema:** `handleConfirmVincular` em `ControleSenhas.tsx` chama `vincularSenhaADoca()` que atualiza APENAS a tabela `senhas`. A tabela `docas` nao e atualizada - a doca permanece `livre` mesmo com senha vinculada.

Mesmo problema em `handleConfirmRetomar`: atualiza senha mas nao atualiza doca.

E `handleConfirmPatio` e `handleConfirmLiberar`: atualizam senha mas nao limpam a doca correspondente.

**Solucao:** Adicionar chamadas `atualizarDoca()` nos handlers de `ControleSenhas.tsx` para manter consistencia bidirecional.

**Alteracoes em `src/pages/ControleSenhas.tsx`:**

- `handleConfirmVincular`:
  - Apos `vincularSenhaADoca(senhaId, docaNumero)`, localizar a doca pelo numero e chamar `atualizarDoca(doca.id, { status: 'ocupada', senhaId: selectedSenhaId })`

- `handleConfirmPatio`:
  - Apos `moverParaPatio(senhaId)`, localizar a doca com `senhaId` correspondente e chamar `atualizarDoca(doca.id, { status: 'livre', cargaId: undefined, conferenteId: undefined, volumeConferido: undefined, rua: undefined, senhaId: undefined })`

- `handleConfirmRetomar`:
  - Apos `retomarDoPatio(senhaId, docaNumero)`, localizar a doca pelo numero e chamar `atualizarDoca(doca.id, { status: 'ocupada', senhaId: selectedSenhaId })`

- `handleConfirmLiberar`:
  - Apos `liberarSenha(senhaId)`, se a senha tinha `docaNumero`, localizar a doca e libera-la

- Importar `atualizarDoca` do hook `useDocasDB` (ja importado, apenas precisa desestruturar `atualizarDoca`)

---

## CORRECAO 4 - Bloquear conferencia sem senha

**Problema:** Em `Docas.tsx`, `handleComecarConferencia` e chamado para docas com status `ocupada`, mas nao verifica se existe uma senha vinculada. Uma doca pode ter carga sem senha (ex: agendamento manual), e nesse cenario a conferencia avanca sem controle de presenca do caminhao.

**Solucao:** No `handleComecarConferencia` e no `handleModalConfirm` (modo 'entrar'), verificar se a doca tem `senhaId` OU se a carga vinculada tem `senhaId`. Se nenhum dos dois existir, retornar silenciosamente sem alterar nenhum status.

**Alteracoes em `src/pages/Docas.tsx`:**

- `handleModalConfirm` (modo `entrar`, linha ~273):
  - Antes de qualquer UPDATE, verificar: `const carga = getCarga(selectedDoca.cargaId); if (!selectedDoca.senhaId && !carga?.senhaId) return;`
  - Isso impede que o status da doca mude para `em_conferencia` e que a carga avance sem senha

---

## CORRECAO 5 - Filtro de cargas disponiveis

**Problema:** `getCargasDisponiveis()` em `SenhaContext.tsx` filtra por `c.data === hoje` onde `hoje = format(new Date(), 'yyyy-MM-dd')`. Isso esta correto. Porem tambem exige `c.chegou === true`, o que significa que cargas agendadas que ainda nao tiveram chegada marcada nao aparecem para vincular a docas. Isso e comportamento esperado.

O unico problema real e que o Supabase retorna `chegou` como `false` por default, e o filtro verifica `=== true`. Isso esta correto e nao precisa de alteracao.

**Verificacao:** Nenhuma alteracao necessaria neste filtro. O comportamento atual e coerente: so cargas que chegaram (marcadas via `marcarChegada`) aparecem como disponiveis.

---

## Resumo de arquivos alterados

| Arquivo | Alteracao |
|---------|-----------|
| `src/components/docas/AssociarCargaModal.tsx` | Remover import mock, receber fornecedores via props |
| `src/components/agendamento/AgendamentoModal.tsx` | Remover import mock, receber fornecedores via props |
| `src/pages/Docas.tsx` | Passar fornecedores para AssociarCargaModal + bloquear conferencia sem senha |
| `src/pages/Agenda.tsx` | Passar fornecedores para AgendamentoModal |
| `src/pages/AgendamentoPlanejamento.tsx` | Passar fornecedores para AgendamentoModal |
| `src/pages/ControleSenhas.tsx` | Atualizar doca ao vincular/patio/retomar/liberar senha |

---

## O que NAO sera alterado

- Dashboard (continua mock)
- Autenticacao (localStorage permanece)
- RLS policies
- Realtime
- Estrutura de tabelas
- Nomes de status
- Layout ou estilo visual
- Nenhuma funcionalidade nova
