

# Correção de Regressão — Vínculo de Carga com Doca

## Causa Raiz

O problema está em `handleAssociarSenha` (linha 140-148 de `Docas.tsx`). Quando uma senha **com carga** é vinculada à doca por esse caminho, apenas `senhaId` é definido na doca — o `cargaId` **não é propagado**. Isso causa os 3 problemas:

1. **Info da carga não aparece na doca** — `getCarga(doca.cargaId)` retorna `undefined` porque `cargaId` não foi setado
2. **Volumes não aparecem no modal** — `volumePrevisto` e `volumeJaConferido` dependem de `selectedDoca.cargaId`, que é `undefined`
3. **Alerta de divergência não aparece** — sem `volumePrevisto`, a comparação nunca é feita

## Correção (1 arquivo)

### `src/pages/Docas.tsx` — `handleAssociarSenha` (linha 140-148)

Buscar o `cargaId` da senha e incluí-lo na atualização da doca:

```typescript
const handleAssociarSenha = (senhaId: string) => {
  if (!selectedDoca) return;
  const senha = senhas.find(s => s.id === senhaId);
  atualizarDoca(selectedDoca.id, { 
    status: 'ocupada', 
    senhaId,
    cargaId: senha?.cargaId,  // <-- ADICIONAR ISTO
  });
  vincularSenhaADoca(senhaId, selectedDoca.numero);
  toast.success(`Senha vinculada à Doca ${selectedDoca.numero}`);
};
```

Essa única mudança restaura os 3 comportamentos, pois:
- O card da doca volta a encontrar a carga via `getCarga(doca.cargaId)` e exibir fornecedor, NFs, volume previsto
- O modal de finalização recebe `volumePrevisto` e `volumeJaConferido` corretamente
- O alerta de divergência volta a funcionar porque a comparação `volume + jaConferido !== previsto` tem dados válidos

Nenhuma alteração em RPCs, triggers, tabelas ou lógica de criação de senhas.

