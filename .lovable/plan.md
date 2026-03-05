

# Finalizar Entrega Forçada na Agenda

## Problema
Hoje o botao "Finalizar Entrega" so aparece quando **todas** as senhas emitidas estao conferidas. O usuario quer poder finalizar mesmo com senhas pendentes (caminhao que nao veio ou foi embora).

## Alteracoes

### 1. RPC `rpc_finalizar_entrega` (Migration SQL)
Remover a validacao que bloqueia se existem senhas nao conferidas. A nova logica:
- Marca senhas pendentes (nao conferidas/recusadas) como `no_show` ou as ignora
- Soma volume apenas das senhas conferidas
- Marca a carga como `conferido`

```sql
CREATE OR REPLACE FUNCTION public.rpc_finalizar_entrega(p_carga_id uuid)
RETURNS void AS $$
BEGIN
  -- Marcar senhas pendentes como recusado (caminhao nao veio)
  UPDATE senhas SET status = 'recusado'
  WHERE carga_id = p_carga_id AND status NOT IN ('conferido', 'recusado');

  -- Liberar docas vinculadas a essas senhas
  UPDATE docas SET status='livre', carga_id=NULL, senha_id=NULL, conferente_id=NULL, volume_conferido=NULL, rua=NULL
  WHERE carga_id = p_carga_id AND senha_id IN (
    SELECT id FROM senhas WHERE carga_id = p_carga_id AND status = 'recusado'
  );

  -- Finalizar a carga com volume das conferidas
  UPDATE cargas
  SET status = 'conferido',
      volume_conferido = (SELECT COALESCE(SUM(volume_conferido), 0) FROM senhas WHERE carga_id = p_carga_id AND status = 'conferido')
  WHERE id = p_carga_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';
```

### 2. `canFinalizarEntrega` em Agenda.tsx (linhas 92-102)
Relaxar a condicao: mostrar o botao sempre que a carga estiver em andamento (nao finalizada), houver pelo menos 1 senha emitida, e o usuario for admin. Remover a exigencia de `todasConferidas`.

```typescript
const canFinalizarEntrega = (carga: Carga) => {
  if (!isAdmin) return false;
  if (carga.status === 'conferido' || carga.status === 'recusado' || carga.status === 'no_show') return false;
  const senhasDaCarga = senhas.filter(s => s.cargaId === carga.id && s.status !== 'recusado');
  return senhasDaCarga.length > 0;
};
```

### 3. Mover "Finalizar Entrega" para dentro do dropdown de Acoes
Em vez de botao separado, colocar como item do dropdown junto com No-show e Recusado, para manter a UI limpa.

### 4. Atualizar dialogo de confirmacao
Ajustar a mensagem para informar quantas senhas estao pendentes e que serao marcadas como recusadas.

## Arquivos afetados

| Arquivo | Alteracao |
|---|---|
| Migration SQL | Atualizar RPC `rpc_finalizar_entrega` |
| `src/pages/Agenda.tsx` | Relaxar `canFinalizarEntrega`, mover botao para dropdown |

