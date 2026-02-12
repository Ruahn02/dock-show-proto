
# Ativar Realtime em Todo o Sistema

## Problema Raiz

As tabelas do banco de dados **nao estao adicionadas** a publicacao `supabase_realtime`. Isso significa que, apesar de o codigo dos hooks estar correto (escutando `postgres_changes`), o Supabase nunca envia os eventos. O resultado: nada atualiza automaticamente.

Alem disso, 3 hooks nao possuem subscriptions de Realtime no codigo, e o modal de conferencia nao espera a operacao terminar antes de fechar.

---

## Alteracoes

### 1. Migracao SQL: Adicionar tabelas a publicacao Realtime

Criar migracao para adicionar todas as tabelas operacionais a publicacao `supabase_realtime`:

- `cargas`
- `senhas`
- `docas`
- `cross_docking`
- `fornecedores`
- `conferentes`

Isso e o que faz o Supabase realmente enviar eventos quando os dados mudam.

### 2. Adicionar Realtime nos hooks que faltam

**`src/hooks/useFornecedoresDB.ts`** -- adicionar channel de Realtime no `useEffect`, igual ao padrao dos outros hooks.

**`src/hooks/useCrossDB.ts`** -- adicionar channel de Realtime no `useEffect`.

**`src/hooks/useConferentesDB.ts`** -- adicionar channel de Realtime no `useEffect`.

### 3. Corrigir DocaModal para aguardar operacao

**`src/components/docas/DocaModal.tsx`** -- tornar `handleConfirm` async e aguardar `onConfirm` antes de fechar o modal:

```text
Antes:  onConfirm(data); resetForm(); onClose();
Depois: await onConfirm(data); resetForm(); onClose();
```

Isso garante que a RPC termine antes do modal fechar, e o Realtime (agora ativo) atualize a tela imediatamente.

### 4. Garantir re-fetch apos RPC no Docas

**`src/pages/Docas.tsx`** -- apos chamar `atualizarFluxo` em `handleModalConfirm`, tambem chamar `refetch` do `useDocasDB` como seguranca adicional para atualizar o estado local imediatamente, sem depender apenas do Realtime.

---

## Resumo dos arquivos

| Arquivo | Alteracao |
|---------|-----------|
| Nova migracao SQL | Adicionar 6 tabelas a `supabase_realtime` |
| `src/hooks/useFornecedoresDB.ts` | Adicionar subscription Realtime |
| `src/hooks/useCrossDB.ts` | Adicionar subscription Realtime |
| `src/hooks/useConferentesDB.ts` | Adicionar subscription Realtime |
| `src/components/docas/DocaModal.tsx` | Tornar `handleConfirm` async com await |
| `src/pages/Docas.tsx` | Chamar `refetch` apos `atualizarFluxo` |

## O que NAO muda

- Nenhuma tabela ou coluna criada/removida
- View e RPC permanecem intactas
- Layout visual mantido
- Fluxos operacionais inalterados
