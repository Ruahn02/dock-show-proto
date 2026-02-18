
# Ocultar Divergencias do Cross para Usuario Operacional

## O que muda

### 1. `src/pages/CrossDocking.tsx` - Tabela
As colunas "Div. Receb." e "Div. Cross" ja estao condicionadas a `isAdmin` no estado atual. **Nenhuma alteracao necessaria na tabela.**

### 2. `src/components/cross/SeparacaoModal.tsx` - Modal de Finalizacao
O modal `FinalizarSeparacaoModal` hoje mostra os campos de divergencia (radio "Houve divergencia?" e textarea "Observacao") para todos os usuarios. Precisa receber uma prop `isAdmin` para ocultar esses campos do operacional.

**Alteracoes:**
- Adicionar prop `isAdmin` (default `false`) na interface `FinalizarSeparacaoModalProps`
- Envolver os campos de divergencia e observacao com `{isAdmin && (...)}`
- Quando operacional finalizar, chamar `onConfirm(false, undefined)` sem campos de divergencia

### 3. `src/pages/CrossDocking.tsx` - Passagem da prop
Passar `isAdmin={isAdmin}` ao renderizar `<FinalizarSeparacaoModal>`.

---

## Detalhes tecnicos

**SeparacaoModal.tsx:**
```text
interface FinalizarSeparacaoModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (temDivergencia: boolean, observacao?: string) => void;
  isAdmin?: boolean;  // NOVO
}

// Dentro do DialogContent:
{isAdmin && (
  <>
    <div> ... radio divergencia ... </div>
    <div> ... textarea observacao ... </div>
  </>
)}
```

**CrossDocking.tsx:**
```text
<FinalizarSeparacaoModal
  open={finalizarModalOpen}
  onClose={...}
  onConfirm={handleFinalizarConfirm}
  isAdmin={isAdmin}        // NOVO
/>
```

## Arquivos modificados

| Arquivo | Alteracao |
|---|---|
| `src/components/cross/SeparacaoModal.tsx` | Adiciona prop `isAdmin`, oculta campos de divergencia para operacional |
| `src/pages/CrossDocking.tsx` | Passa `isAdmin` para FinalizarSeparacaoModal |

Nenhuma alteracao no banco de dados.
