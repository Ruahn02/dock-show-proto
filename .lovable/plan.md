
## Problema identificado

Em `src/pages/Docas.tsx` linha 592, o volume passado ao modal é dividido pelo número de caminhões:
```typescript
return Math.round(carga.volumePrevisto / (carga.quantidadeVeiculos || 1));
```

Isso faz o modal mostrar "Volume previsto para este caminhão: 20" e dispara alerta quando o conferente digita qualquer valor diferente de 20 — mesmo que seja um valor parcialmente correto. O conferente não vê o total geral nem o quanto já foi recebido.

## Comportamento correto

- Carga: 60 volumes, 3 caminhões
- Caminhão 1 confere 20 → alerta: "20 recebido de 60 total. Ainda faltam 40."
- Caminhão 2 confere 20 → alerta: "Já recebido: 20. Você informou: 20. Total será: 40 de 60. Faltam 20."
- Caminhão 3 confere 20 → sem alerta (total 60 = 60 previsto, entrega completa).

## Alterações

### 1. `src/pages/Docas.tsx` — linha 588-593
Remover a divisão. Passar o volume total E o volume já conferido acumulado da carga:
```tsx
volumePrevisto={carga.volumePrevisto}
volumeJaConferido={carga.volumeConferido || 0}
```

### 2. `src/components/docas/DocaModal.tsx`

**Props**: Adicionar `volumeJaConferido?: number`.

**Info box** (substituir texto "Volume previsto para este caminhão"):
```
Volume total previsto: 60
Já recebido (outros caminhões): 20    ← mostrar só se > 0
Restante a receber: 40
```

**Lógica de divergência**: Comparar `entrada + jaConferido` vs `totalPrevisto`:
```typescript
const totalComEste = parseInt(volume) + (volumeJaConferido ?? 0);
if (totalComEste !== volumePrevisto) → mostrar alerta
```

**AlertDialog mensagem**:
- "Volume informado: 20"
- "Já recebido anteriormente: 20" (se > 0)
- "Total que seria recebido: 40 de 60 previstos"
- Descreve se é parcial (faltam X) ou excesso (+X)

Nenhuma mudança de banco ou RPC. Apenas os 2 arquivos acima.
