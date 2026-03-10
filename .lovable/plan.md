

# Auditoria Completa de Bugs — Sistema de Entregas Multi-Caminhão

Após análise detalhada de todo o código (RPC, views, hooks, contextos e páginas), aqui estão os bugs e problemas identificados, organizados por gravidade.

---

## BUGS CRÍTICOS (Afetam dados / lógica de negócio)

### BUG 1 — `volumeJaConferido` usa dado desatualizado (stale state)

**Arquivo:** `src/pages/Docas.tsx`, linhas 593-597

**Problema:** O `volumeJaConferido` é lido de `carga.volumeConferido` via o estado local `cargas` do React. Porém, quando o conferente finaliza o caminhão 2, o estado `cargas` ainda contém o valor **antes** da atualização do caminhão 1 (porque o realtime pode não ter chegado ainda). Isso faz o modal mostrar "Já recebido: 0" quando deveria ser 20.

**Causa:** `cargas` vem do `useCargasDB` que faz polling a cada 15s e escuta realtime, mas entre a finalização de um caminhão e a abertura do modal para o próximo, o estado pode estar desatualizado.

**Correção:** Ao abrir o modal de finalização, calcular o volume já conferido diretamente das senhas (que são atualizadas na mesma transação), em vez de confiar no `carga.volumeConferido`:
```typescript
volumeJaConferido={(() => {
  if (modalMode !== 'finalizar' || !selectedDoca) return undefined;
  // Calcular da fonte mais confiável: as senhas já conferidas
  const senhasDaCarga = senhas.filter(s => 
    s.cargaId === selectedDoca.cargaId && 
    s.id !== selectedDoca.senhaId && 
    s.status === 'conferido'
  );
  return senhasDaCarga.reduce((sum, s) => sum + (s.volumeConferido || 0), 0);
})()}
```

### BUG 2 — Cross Docking criado com `volumeRecebido` usando dados stale

**Arquivo:** `src/pages/Docas.tsx`, linhas 271-296

**Problema:** A lógica de criação do cross docking calcula `totalVolume` usando `senhas` do estado React, que pode não refletir o volume recém-conferido (da senha atual). Na verdade o código tenta compensar isso (linha 274: `if (s.id === selectedDoca.senhaId) return sum + (data.volume || 0)`), mas a segunda chamada (linha 292-296) recalcula com o mesmo array stale. Isso pode gerar volumes incorretos no cross.

**Correção:** Mover o cálculo do `totalVolume` para fora e reutilizá-lo.

### BUG 3 — `retomarDoPatio` reseta status para `em_doca`, mas carga continua `em_conferencia`

**Arquivo:** `src/contexts/SenhaContext.tsx`, linha 105-112

**Problema:** Quando um caminhão conferido no pátio é "retomado" para uma doca, o status da senha é resetado para `em_doca` e o `rua` é limpo. Porém o status na tabela `cargas` não é alterado. Pior: na tela de Docas (linha 234-240), `handleConfirmRetomar` seta a doca como `ocupada` e, se tem carga, não atualiza o status da carga. Isso cria inconsistência entre doca (ocupada) e carga (em_conferencia ou conferido).

**Correção:** Ao retomar, verificar o status da senha. Se ela já foi `conferido`, não deveria ser retomável (ou deveria manter o status). Adicionar validação.

### BUG 4 — Senha conferida no Pátio não atualiza `local_atual`

**Arquivo:** `src/pages/Docas.tsx`, linhas 525-543

**Problema:** Quando se finaliza conferência no pátio via `docaVirtual`, o RPC `rpc_atualizar_fluxo_carga` com status `conferido` libera as docas (`WHERE senha_id = v_senha_id`), mas como é uma doca virtual, não existe doca real para liberar. O `local_atual` da senha permanece `em_patio` — correto. Mas o filtro de pátio (`s.status !== 'conferido'`) corretamente esconde. **Este caso funciona corretamente**, não é bug.

---

## BUGS MÉDIOS (UX / comportamento inesperado)

### BUG 5 — Limite de senhas não bloqueia corretamente quando `quantidadeVeiculos` é null

**Arquivo:** `src/pages/SenhaCaminhoneiro.tsx`, linhas 72-79

**Problema:** Se a carga foi criada sem `quantidadeVeiculos` (campo opcional), o if `if (cargaDisponivel && cargaDisponivel.quantidadeVeiculos)` é falso e não há limite. Isso permite gerar infinitas senhas para uma carga.

**Impacto:** Cargas sem quantidade definida aceitam caminhões ilimitados.

**Correção:** Decidir se isso é comportamento desejado ou se deveria ter um default de 1.

### BUG 6 — `getCargasDisponiveis` mostra carga mesmo se todos os caminhões já pegaram senha

**Arquivo:** `src/contexts/SenhaContext.tsx`, linha 151-156

**Problema:** `getCargasDisponiveis` filtra por `status === 'aguardando_chegada' && chegou === true`, mas não verifica se já foram emitidas todas as senhas possíveis. Isso permite vincular a mesma carga a múltiplas docas quando senhas já foram emitidas.

### BUG 7 — Tela Docas: `handleAssociarCarga` vincula apenas a primeira senha disponível

**Arquivo:** `src/pages/Docas.tsx`, linhas 117-135

**Problema:** Quando uma carga com 3 caminhões é associada via "Vincular Carga", o código pega apenas a primeira senha `aguardando_doca`. Se 2 senhas estão disponíveis, só a primeira vai para a doca, a segunda fica orphan. Isso **é o comportamento correto** — uma doca por vez. Não é bug.

### BUG 8 — `vincularCargaADoca` atualiza carga para `aguardando_conferencia` a cada vinculação

**Arquivo:** `src/contexts/SenhaContext.tsx`, linha 136

**Problema:** A cada vez que um caminhão é vinculado a uma doca, o status da carga é atualizado para `aguardando_conferencia`, mesmo que ela já esteja `em_conferencia` (porque outro caminhão já está sendo conferido). Isso regride o status.

**Correção:** Só atualizar para `aguardando_conferencia` se o status atual for `aguardando_chegada`.

---

## PROBLEMAS MENORES

### BUG 9 — RPC `conferido`: libera TODAS as docas da carga, não só a do caminhão atual

**Arquivo:** RPC `rpc_atualizar_fluxo_carga`, bloco `conferido`

**Problema:** Na linha `UPDATE docas SET status='livre'... WHERE (v_senha_id IS NOT NULL AND senha_id=v_senha_id) OR (v_carga_id IS NOT NULL AND carga_id=v_carga_id)`, o `OR carga_id = v_carga_id` libera TODAS as docas com aquela carga, não só a doca do caminhão que acabou de ser conferido. Se dois caminhões da mesma carga estão em docas diferentes e um termina, a doca do outro é liberada.

**Correção:** Remover a condição `OR carga_id=v_carga_id` do bloco `conferido`, mantendo apenas `senha_id=v_senha_id`.

---

## PLANO DE CORREÇÃO

### 1. RPC `rpc_atualizar_fluxo_carga` (migration SQL)
- No bloco `conferido`, alterar o `UPDATE docas` para liberar apenas pela `senha_id`, não pela `carga_id`.

### 2. `src/pages/Docas.tsx`
- Corrigir cálculo de `volumeJaConferido` para usar senhas conferidas em vez de `carga.volumeConferido`.
- Consolidar cálculo de `totalVolume` para o cross docking (evitar duplicação).

### 3. `src/contexts/SenhaContext.tsx`
- Em `vincularCargaADoca`: só atualizar status para `aguardando_conferencia` se status atual for `aguardando_chegada`.

### 4. `src/pages/SenhaCaminhoneiro.tsx`
- Definir comportamento quando `quantidadeVeiculos` é null (default 1 ou ilimitado).

Cada correção é cirúrgica e não afeta outras funcionalidades. A mais grave é o Bug 9 (RPC liberando docas de outros caminhões) que pode causar perda de dados em cenários reais com múltiplos caminhões simultâneos.

