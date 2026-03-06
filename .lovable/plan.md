

# Alerta de Divergencia na Finalizacao de Conferencia

## Arquivo principal: `src/components/docas/DocaModal.tsx`

Toda a implementacao sera neste unico arquivo, com uma pequena alteracao em `src/pages/Docas.tsx` para passar o volume previsto.

## Alteracoes

### 1. `src/pages/Docas.tsx` — Passar volume previsto ao modal

Quando `modalMode === 'finalizar'`, calcular o volume previsto por caminhao:

```
volumePrevisto = carga.volumePrevisto / (carga.quantidadeVeiculos || 1)
```

Passar como nova prop `volumePrevisto` ao `DocaModal`.

### 2. `src/components/docas/DocaModal.tsx` — Duas alteracoes

**Props**: Adicionar `volumePrevisto?: number` na interface `DocaModalProps`.

**Parte 1 — Mostrar volume previsto**: No modo `finalizar`, antes do campo de input de volume, exibir um texto informativo:

```
Volume previsto para este caminhão: X volumes
```

Usar um `div` com `bg-blue-50 border border-blue-200 rounded p-3` para destacar visualmente.

**Parte 2 — Alerta de divergencia**: Adicionar estado `showDivergenciaAlert` (boolean). No `handleConfirm`:

- Se `mode === 'finalizar'` e `volumePrevisto` existe e `parseInt(volume) !== volumePrevisto`:
  - Setar `showDivergenciaAlert = true` e retornar (nao salvar)
- Se `showDivergenciaAlert === true` (usuario ja viu o alerta e confirmou), prosseguir normalmente

Renderizar um `AlertDialog` com:
- Titulo: "Divergencia detectada"
- Mensagem: "Volume previsto: X | Volume informado: Y"
- Botao "Confirmar divergencia" (prossegue)
- Botao "Voltar e corrigir" (fecha o alert)

### Nenhuma alteracao em backend, RPCs, triggers ou tabelas.

