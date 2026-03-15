

# Plano: Correção de Filtro de Senhas e Ordenação do Agendamento

## Correção 1 — Tela de Solicitação de Senhas (`SenhaCaminhoneiro.tsx`)

**Problema atual:** A lista de fornecedores disponíveis (linha 56-58) mostra qualquer fornecedor que tenha carga no dia, sem considerar se o limite de senhas foi atingido ou se a carga já foi finalizada. Além disso, o bloqueio de limite (linha 72-80) usa `quantidadeVeiculos || 1`, ou seja, cargas sem quantidade definida ficam travadas em 1.

**Correção:**
- Alterar `fornecedoresAgendados` para filtrar apenas cargas que ainda aceitam senhas:
  - Excluir cargas com status `conferido`, `recusado`, `no_show`
  - Para cargas **com** `quantidadeVeiculos` definido: excluir se senhas emitidas >= limite
  - Para cargas **sem** `quantidadeVeiculos`: manter disponível (ilimitado até finalização manual)
- Alterar o bloqueio em `handleGerarSenha` (linha 73): quando `quantidadeVeiculos` for `null`/`undefined`, não aplicar limite (permitir senhas ilimitadas)
- Manter o bloqueio apenas quando `quantidadeVeiculos` > 0

**Arquivo:** `src/pages/SenhaCaminhoneiro.tsx`

---

## Correção 2 — Ordenação no Agendamento (`AgendamentoPlanejamento.tsx`)

**Problema atual:** `cargasFiltradas` (linha 69-80) filtra por data e deduplica, mas não ordena. As cargas aparecem na ordem de retorno da view.

**Correção:**
- Adicionar `.sort()` após o filtro, ordenando por:
  1. `horario_previsto` ascendente (mais cedo primeiro; nulos ao final)
  2. `fornecedor_nome` alfabético para empate de horário

**Arquivo:** `src/pages/AgendamentoPlanejamento.tsx`

---

## Resumo de alterações

| Arquivo | Alteração |
|---|---|
| `src/pages/SenhaCaminhoneiro.tsx` | Filtrar fornecedores por disponibilidade real; permitir senhas ilimitadas quando `quantidadeVeiculos` é nulo |
| `src/pages/AgendamentoPlanejamento.tsx` | Ordenar cargas por horário previsto e depois por nome do fornecedor |

Nenhuma alteração em tabelas, RPCs, triggers ou lógica de docas.

