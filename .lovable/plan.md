
# Plano de Ajuste Geral - Agendamento e Docas

## Resumo do Objetivo

Simplificar o fluxo do sistema com foco em:
- **Agendamento** como local central de todas as informacoes finais da carga
- **Docas** apenas para operacao da conferencia
- Fluxo claro: COMECAR -> TERMINAR conferencia
- Separacao de responsabilidades: Admin vincula cargas, Operacional confere

---

## 1. TELA AGENDAMENTO - Reestruturacao da Tabela

### Alteracoes na Tabela

**Nova Ordem das Colunas (9 colunas):**

| # | Coluna | Descricao |
|---|--------|-----------|
| 1 | Data | Data do agendamento |
| 2 | Fornecedor | Nome do fornecedor |
| 3 | NF(s) | Notas fiscais |
| 4 | Volume Previsto | Renomear de "Volume" |
| 5 | Volume Recebido | Novo campo - preenchido apos conferencia |
| 6 | Conferente | Novo campo - nome do conferente |
| 7 | Divergencia | Novo campo - texto da divergencia |
| 8 | Status | Badge colorido |
| 9 | Acoes | Botao unico "Acoes da Carga" |

### Padronizacao de Cores dos Status

| Status | Cor | CSS |
|--------|-----|-----|
| Aguardando Conferencia | Azul | bg-blue-100 text-blue-800 |
| Conferindo | Amarelo | bg-yellow-100 text-yellow-800 |
| Conferido | Verde | bg-green-100 text-green-800 |
| Recusado | Vermelho | bg-red-100 text-red-800 |
| No-show | Cinza | bg-gray-100 text-gray-800 |

### Simplificacao das Acoes

**Remover:**
- Icones confusos (AlertCircle, XCircle)
- Botoes individuais de No Show e Recusado

**Adicionar:**
- Botao unico "Acoes da Carga" usando DropdownMenu
- Ao clicar, exibir opcoes:
  - Marcar como No-show
  - Marcar como Recusado
- Cada acao abre dialogo de confirmacao:
  "Tem certeza que deseja marcar como [No-show / Recusado]?"

**Regras de Visibilidade:**
- Botao "Acoes da Carga" aparece apenas para status "Aguardando Conferencia" ou "Conferindo"
- Nao aparece para cargas ja finalizadas (Conferido, No-show, Recusado)

### Arquivo a Modificar
- `src/pages/Agendamento.tsx`

---

## 2. TELA DOCAS - Simplificacao do Fluxo

### Alteracoes na Tabela

**Colunas Simplificadas:**

| Coluna | Descricao |
|--------|-----------|
| Doca | Numero da doca |
| Fornecedor | Nome do fornecedor |
| NF(s) | Notas fiscais |
| Volume Previsto | Volume esperado |
| Status da Carga | Status atual |
| Acoes | Botoes contextuais |

**Remover coluna "Data"** - informacao menos relevante na operacao

### Regras de Acesso por Perfil

**ADMINISTRADOR:**
- Pode vincular carga do dia a uma doca livre
- Pode marcar doca como Uso e Consumo
- Pode liberar doca de Uso e Consumo

**OPERACIONAL:**
- NAO pode vincular carga a doca
- Pode apenas realizar a conferencia (COMECAR e TERMINAR)

### Novo Fluxo de Botoes

**Doca LIVRE:**
- Admin: Botao "Vincular Carga" (abre modal de selecao)
- Admin: Botao "Uso e Consumo"
- Operacional: Sem acoes

**Doca OCUPADA (carga vinculada):**
- Todos: Botao "COMECAR CONFERENCIA" (destaque visual)

**Doca EM CONFERENCIA:**
- Todos: Botao "TERMINAR CONFERENCIA" (destaque visual)

**Doca CONFERIDO:**
- Admin: Botao "Liberar Doca"
- Operacional: Sem acoes (doca liberada automaticamente)

**Doca USO E CONSUMO:**
- Admin: Botao "Liberar"
- Operacional: Sem acoes

### Fluxo Visual

```text
LIVRE
  |
  v (Admin vincula carga)
OCUPADA
  |
  v (Operacional clica "COMECAR")
  |-- Modal: Seleciona conferente + Informa rua
  |
  v
EM CONFERENCIA
  |
  v (Operacional clica "TERMINAR")
  |-- Modal: Informa volume recebido + divergencia
  |
  v
LIVRE (doca liberada automaticamente)
  |
  +-- Agendamento atualizado com:
      - Status: Conferido
      - Volume Recebido
      - Conferente
      - Divergencia
```

### Arquivos a Modificar
- `src/pages/Docas.tsx`
- `src/components/docas/DocaModal.tsx`

---

## 3. INTEGRACAO AGENDAMENTO <-> DOCAS

### Comportamento ao Finalizar Conferencia

Quando operacional clica "TERMINAR CONFERENCIA" e confirma:

1. **Na Doca:**
   - Status muda para LIVRE (doca liberada)
   - cargaId removido
   - conferenteId removido

2. **No Agendamento (Carga):**
   - Status muda para "Conferido"
   - volumeConferido = valor informado
   - conferenteId = conferente selecionado
   - divergencia = texto informado (se houver)

Isso garante que todas as informacoes finais ficam salvas no Agendamento.

---

## 4. ATUALIZACAO DE STATUS/LABELS

### Arquivo `src/data/mockData.ts`

**Alterar labels de status:**
- "Aguardando Chegada" -> "Aguardando Conferencia"

```typescript
export const statusCargaLabels: Record<string, string> = {
  aguardando_chegada: 'Aguardando Conferencia',  // ALTERADO
  em_conferencia: 'Conferindo',                   // ALTERADO
  conferido: 'Conferido',
  no_show: 'No-show',                             // ALTERADO (hifen)
  recusado: 'Recusado',
};
```

---

## 5. COMPONENTE DE CONFIRMACAO

### Novo Componente: ConfirmDialog

Criar um componente reutilizavel para confirmacao:

```text
src/components/ui/confirm-dialog.tsx
```

**Props:**
- open: boolean
- onClose: () => void
- onConfirm: () => void
- title: string
- message: string

**Uso:**
"Tem certeza que deseja marcar como No-show?"
[Cancelar] [Confirmar]

---

## 6. RESUMO DOS ARQUIVOS A MODIFICAR

| Arquivo | Alteracoes |
|---------|------------|
| `src/pages/Agendamento.tsx` | Nova estrutura de colunas, botao "Acoes da Carga" com DropdownMenu, dialogo de confirmacao |
| `src/pages/Docas.tsx` | Remover coluna Data, botoes contextuais por perfil, fluxo COMECAR/TERMINAR, liberacao automatica |
| `src/components/docas/DocaModal.tsx` | Ajustar titulo para "Comecar Conferencia" e "Terminar Conferencia" |
| `src/data/mockData.ts` | Atualizar labels de status |

---

## 7. DETALHES TECNICOS

### Botao "Acoes da Carga" - Implementacao

Usar componente DropdownMenu do shadcn/ui:

```typescript
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline" size="sm">
      Acoes da Carga
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem onClick={() => setConfirmNoShow(true)}>
      Marcar como No-show
    </DropdownMenuItem>
    <DropdownMenuItem onClick={() => setConfirmRecusado(true)}>
      Marcar como Recusado
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Dialogo de Confirmacao - Implementacao

Usar AlertDialog do shadcn/ui:

```typescript
<AlertDialog open={confirmNoShow} onOpenChange={setConfirmNoShow}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Confirmar acao</AlertDialogTitle>
      <AlertDialogDescription>
        Tem certeza que deseja marcar esta carga como No-show?
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancelar</AlertDialogCancel>
      <AlertDialogAction onClick={handleNoShow}>Confirmar</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### Controle de Acesso nas Docas

```typescript
// Em Docas.tsx
const { isAdmin } = useProfile();

// Doca livre - apenas admin pode vincular
{doca.status === 'livre' && isAdmin && (
  <Button onClick={() => handleVincularCarga(doca)}>
    Vincular Carga
  </Button>
)}

// Doca ocupada - todos podem comecar conferencia
{doca.status === 'ocupada' && (
  <Button variant="default" className="bg-blue-600">
    COMECAR CONFERENCIA
  </Button>
)}

// Doca em conferencia - todos podem terminar
{doca.status === 'em_conferencia' && (
  <Button variant="default" className="bg-green-600">
    TERMINAR CONFERENCIA
  </Button>
)}
```

---

## 8. VISUAL FINAL ESPERADO

### Tela Agendamento

```text
+------+-------------+--------+----------+----------+------------+------------+-----------+--------------+
| Data | Fornecedor  | NF(s)  | Vol.Prev | Vol.Rec  | Conferente | Divergencia| Status    | Acoes        |
+------+-------------+--------+----------+----------+------------+------------+-----------+--------------+
| 24/01| ABC Ltda    | NF-001 | 150      | 148      | Joao Silva | 2 faltando | Conferido | -            |
| 24/01| Nacional SA | NF-003 | 80       | -        | Maria S.   | -          | Conferindo| [Acoes ▼]    |
| 24/01| Express     | NF-004 | 250      | -        | -          | -          | Aguardando| [Acoes ▼]    |
+------+-------------+--------+----------+----------+------------+------------+-----------+--------------+
```

### Tela Docas (Admin)

```text
+------+-------------+--------+----------+-------------+---------------------------+
| Doca | Fornecedor  | NF(s)  | Vol.Prev | Status      | Acoes                     |
+------+-------------+--------+----------+-------------+---------------------------+
| #1   | ABC Ltda    | NF-001 | 150      | Conferindo  | [TERMINAR CONFERENCIA]    |
| #2   | -           | -      | -        | Livre       | [Vincular] [Uso Consumo]  |
| #3   | Nacional    | NF-003 | 80       | Ocupada     | [COMECAR CONFERENCIA]     |
| #4   | -           | -      | -        | Uso Consumo | [Liberar]                 |
+------+-------------+--------+----------+-------------+---------------------------+
```

### Tela Docas (Operacional)

```text
+------+-------------+--------+----------+-------------+---------------------------+
| Doca | Fornecedor  | NF(s)  | Vol.Prev | Status      | Acoes                     |
+------+-------------+--------+----------+-------------+---------------------------+
| #1   | ABC Ltda    | NF-001 | 150      | Conferindo  | [TERMINAR CONFERENCIA]    |
| #2   | -           | -      | -        | Livre       | -                         |
| #3   | Nacional    | NF-003 | 80       | Ocupada     | [COMECAR CONFERENCIA]     |
| #4   | -           | -      | -        | Uso Consumo | -                         |
+------+-------------+--------+----------+-------------+---------------------------+
```

---

## 9. ORDEM DE IMPLEMENTACAO

1. Atualizar labels em `src/data/mockData.ts`
2. Atualizar cores de status em ambas as telas
3. Reestruturar tabela de Agendamento (novas colunas)
4. Implementar botao "Acoes da Carga" com DropdownMenu
5. Implementar dialogos de confirmacao
6. Simplificar tabela de Docas (remover coluna Data)
7. Implementar controle de acesso por perfil
8. Ajustar botoes para COMECAR/TERMINAR CONFERENCIA
9. Garantir integracao: dados salvos no Agendamento ao finalizar
10. Testar fluxo completo

