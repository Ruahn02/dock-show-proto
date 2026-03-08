

# Correção da Regra de Finalização Automática de Entregas

## Função a ser alterada

**`rpc_atualizar_fluxo_carga`** — a RPC no Supabase que decide o status da carga após conferência de senha.

## Problema atual (na RPC, bloco `p_novo_status='conferido'`)

```sql
-- Código atual (linhas relevantes):
IF v_total_senhas > 0 AND v_conferidas = v_total_senhas THEN
  UPDATE cargas SET status='conferido', ...
ELSE
  UPDATE cargas SET status='em_conferencia', ...
END IF;
```

A carga é marcada como `conferido` quando **todas as senhas emitidas** estão conferidas, independentemente do volume. Isso permite finalizar com volume incompleto.

## Nova regra

Substituir a verificação por contagem de senhas por comparação de volume:

```sql
-- Buscar volume_previsto da carga
SELECT volume_previsto INTO v_volume_previsto FROM cargas WHERE id = v_carga_id;

IF v_total_volume >= v_volume_previsto THEN
  UPDATE cargas SET status='conferido', volume_conferido=v_total_volume, ...
ELSE
  UPDATE cargas SET status='em_conferencia', volume_conferido=v_total_volume, ...
END IF;
```

## Mesma correção no bloco `p_novo_status='recusado'`

O bloco de recusa também verifica `v_conferidas = v_total_senhas` para decidir se marca a carga como `conferido`. Aplicar a mesma regra baseada em volume.

## Alteração no frontend (`src/pages/Docas.tsx`)

A lógica de `isUltimaSenha` (linhas 269-274) é usada apenas para decidir quando criar o Cross Docking. Essa lógica deve mudar para verificar volume em vez de contagem de senhas:

```typescript
// Antes: isUltimaSenha baseado em senhas pendentes
// Depois: verificar se volume total >= volume_previsto
let deveCriarCross = false;
if (carga) {
  const senhasDaCarga = senhas.filter(s => s.cargaId === carga.id && s.status !== 'recusado');
  const totalVolume = senhasDaCarga.reduce((sum, s) => {
    if (s.id === selectedDoca.senhaId) return sum + (data.volume || 0);
    return sum + (s.volumeConferido || 0);
  }, 0);
  deveCriarCross = totalVolume >= carga.volumePrevisto;
}
```

## Resumo das alterações

| Arquivo/Recurso | Alteração |
|---|---|
| RPC `rpc_atualizar_fluxo_carga` | Migration SQL: trocar regra de `conferidas = total_senhas` por `volume >= volume_previsto` nos blocos `conferido` e `recusado` |
| `src/pages/Docas.tsx` | Trocar `isUltimaSenha` por verificação de volume para criação do Cross Docking |

Nenhuma alteração em tabelas, triggers, índices ou outras RPCs.

