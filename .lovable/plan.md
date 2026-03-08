

# Alerta de Divergencia na Finalizacao de Separacao Cross Docking

## Analise

O sistema nao possui tabela `cross_docking_itens`. O volume relevante esta em:
- `cross_docking.volume_recebido` — volume recebido na conferencia
- `cargas.volume_conferido` — volume total conferido da carga

A comparacao sera entre esses dois valores. Se diferirem, exibir alerta antes de finalizar.

## Alteracoes

### 1. `src/pages/CrossDocking.tsx`

Passar o `volumeConferidoCarga` ao `FinalizarSeparacaoModal`:

```typescript
// Ao abrir o modal, buscar volume_conferido da carga associada
const carga = cargas.find(c => c.id === selectedCross.cargaId);
```

Passar duas props novas ao modal:
- `volumeRecebido`: `selectedCross.volumeRecebido`
- `volumeConferidoCarga`: `carga?.volumeConferido`

### 2. `src/components/cross/SeparacaoModal.tsx` — `FinalizarSeparacaoModal`

**Props**: Adicionar `volumeRecebido?: number` e `volumeConferidoCarga?: number`.

**UI**: Mostrar info box com volumes antes dos campos:
```
Volume recebido na conferência: X
Volume da carga conferida: Y
```

**Logica**: Adicionar estado `showDivergenciaAlert`. No `handleConfirm`:
- Calcular `divergencia = volumeRecebido - volumeConferidoCarga`
- Se `divergencia !== 0` e alert ainda nao foi mostrado, setar `showDivergenciaAlert = true` e retornar
- Se usuario confirmar no alert, prosseguir com `onConfirm`

**AlertDialog**: Renderizar dentro do componente com:
- Titulo: "Divergencia detectada na separacao"
- Mensagem com volume recebido, volume conferido e diferenca
- Botoes: "Cancelar" e "Finalizar mesmo assim"

### Nenhuma alteracao em banco, RPCs ou tabelas.

