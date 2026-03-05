

# Ajuste de Logica -- Entregas com Multiplos Caminhoes

## Resumo do Problema

Hoje, a tabela `cargas` tem apenas 1 campo `senha_id`, entao quando 1 caminhao e conferido, a carga inteira vira "conferido" e o Cross Docking e liberado prematuramente. O volume recebido fica incorreto.

## Arquitetura Proposta

Manter a relacao **1 Carga : N Senhas**. A carga (entrega) continua sendo unica. Cada senha (caminhao) armazena seu proprio `volume_conferido`. O status da carga e derivado do estado agregado das senhas.

```text
Carga (entrega unica)
  ├── Senha 1 (caminhao 1) → volume_conferido, status individual
  ├── Senha 2 (caminhao 2) → volume_conferido, status individual
  └── Senha 3 (caminhao 3) → volume_conferido, status individual

Status da carga = f(status de todas as senhas)
```

## Alteracoes no Banco de Dados

### Migration 1 -- Adicionar campo `volume_conferido` na tabela `senhas`

```sql
ALTER TABLE senhas ADD COLUMN volume_conferido integer;
```

O campo `carga_id` ja existe na tabela `senhas` -- sera usado como `entrega_id` (a tabela `cargas` JA e a tabela de entregas).

### Migration 2 -- Remover campo `senha_id` da tabela `cargas`

O campo `cargas.senha_id` cria a relacao 1:1 incorreta. O vinculo correto e `senhas.carga_id` (N:1).

```sql
-- Migrar dados existentes: preencher senhas.carga_id onde cargas.senha_id existe
UPDATE senhas s SET carga_id = c.id
FROM cargas c WHERE c.senha_id = s.id AND s.carga_id IS NULL;

-- Remover a coluna
ALTER TABLE cargas DROP COLUMN senha_id;
```

### Migration 3 -- Atualizar RPC `rpc_atualizar_fluxo_carga`

A RPC precisa ser reescrita para:

1. **No `conferido`**: atualizar apenas a **senha** (nao a carga). Depois, verificar se TODAS as senhas da carga estao conferidas. So entao marcar a carga como `conferido`. Se ainda ha senhas pendentes, marcar a carga como `em_conferencia` (conferindo).

2. **No `em_conferencia`**: atualizar a senha E a carga para `em_conferencia`.

3. **Volume da carga**: `volume_conferido` da carga = `SUM(volume_conferido)` de todas as senhas vinculadas.

4. **No `recusado`**: atualizar a senha individual. Recalcular status da carga.

### Migration 4 -- Criar RPC `rpc_finalizar_entrega`

Para o caso de caminhoes que nao vieram (Regra 5):

```sql
CREATE OR REPLACE FUNCTION public.rpc_finalizar_entrega(p_carga_id uuid)
RETURNS void AS $$
BEGIN
  -- Verificar se todas as senhas emitidas estao conferidas
  IF EXISTS (
    SELECT 1 FROM senhas
    WHERE carga_id = p_carga_id AND status != 'conferido'
  ) THEN
    RAISE EXCEPTION 'Existem senhas nao conferidas para esta entrega';
  END IF;

  UPDATE cargas
  SET status = 'conferido',
      volume_conferido = (SELECT COALESCE(SUM(volume_conferido), 0) FROM senhas WHERE carga_id = p_carga_id)
  WHERE id = p_carga_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Alteracoes no Frontend

### 1. Tipos (`src/types/index.ts`)

- Adicionar `volumeConferido?: number` na interface `Senha`
- Remover `senhaId?: string` da interface `Carga`

### 2. Hooks de mapeamento

- **`useSenhasDB.ts`**: mapear `volume_conferido` no `mapSenhaFromDB` e `mapSenhaToDB`
- **`useCargasDB.ts`**: remover mapeamento de `senha_id`/`senhaId`

### 3. `SenhaContext.tsx`

- Remover `marcarChegada` que seta `senhaId` na carga
- Adicionar logica para vincular `carga_id` na **senha** ao inves de `senha_id` na carga
- Adicionar funcao `getSenhasByCarga(cargaId)` para obter todas as senhas de uma carga
- Adicionar `finalizarEntrega(cargaId)` que chama a nova RPC

### 4. `SenhaCaminhoneiro.tsx` -- Regra 1 (Limite de senhas)

Ao gerar senha:
- Contar senhas ja emitidas para a carga do fornecedor naquele dia
- Comparar com `carga.quantidadeVeiculos`
- Bloquear se limite atingido com mensagem "Limite de caminhoes para esta entrega atingido"
- Vincular `carga_id` na senha criada

### 5. `Docas.tsx` -- Conferencia

Na finalizacao da conferencia:
- Salvar `volume_conferido` na **senha** (via RPC atualizada)
- A RPC decide se a carga muda para `conferido` ou permanece `em_conferencia`
- Cross Docking so e adicionado se a RPC marcou a carga como `conferido` (verificar status apos RPC)

### 6. `Agenda.tsx` -- Exibicao

- Mostrar colunas: Caminhoes Previstos (`carga.quantidadeVeiculos`), Senhas Emitidas (count de senhas com `carga_id`)
- Volume Recebido = soma dos `volume_conferido` das senhas
- Adicionar botao "Finalizar Entrega" (so admin, so quando todas senhas emitidas estao conferidas mas `senhas_emitidas < quantidade_veiculos`)
- Status "Conferindo" quando ha senhas conferidas mas nao todas

### 7. `CrossDocking.tsx`

- Ao criar registro de cross, verificar se `carga.status === 'conferido'` antes de permitir

### 8. `ControleSenhas.tsx`

- Ajustar referencias de `cargas.find(c => c.senhaId === s.id)` para `cargas.find(c => c.id === s.cargaId)`

### 9. View `vw_carga_operacional`

Atualizar para refletir a relacao N:1 (senhas → cargas) em vez de 1:1 (cargas.senha_id).

## Resumo de Arquivos Afetados

| Arquivo | Tipo de Alteracao |
|---|---|
| Migration SQL | 4 migrations (schema + RPCs + view) |
| `src/types/index.ts` | Atualizar interfaces |
| `src/hooks/useSenhasDB.ts` | Mapear `volume_conferido` |
| `src/hooks/useCargasDB.ts` | Remover `senhaId` |
| `src/contexts/SenhaContext.tsx` | Inverter relacao, novas funcoes |
| `src/contexts/SolicitacaoContext.tsx` | Ajustar aprovacao |
| `src/pages/SenhaCaminhoneiro.tsx` | Limite de senhas, vincular carga_id |
| `src/pages/Docas.tsx` | Conferencia parcial, cross condicional |
| `src/pages/Agenda.tsx` | Novas colunas, botao Finalizar |
| `src/pages/ControleSenhas.tsx` | Ajustar busca carga por senha |
| `src/pages/CrossDocking.tsx` | Validar status antes de criar |
| `src/hooks/useFluxoOperacional.ts` | Sem mudanca estrutural |
| `src/data/mockData.ts` | Adicionar label "Conferindo" |

