
# Ajustes na Tela de Cross Docking: Divergencias, Filtros e Historico

## Resumo das Mudancas

6 ajustes em 5 arquivos, sem alteracao de tabelas no banco de dados.

---

## 1. Adicionar status "armazenado" ao tipo StatusCross

**Arquivo:** `src/types/index.ts`

Hoje quando o admin clica "Armazenar", o registro e DELETADO do banco. Para manter historico e permitir filtro por tipo de acao, o status `armazenado` sera adicionado ao tipo `StatusCross`.

```text
export type StatusCross = 
  | 'aguardando_decisao'
  | 'cross_confirmado'
  | 'aguardando_separacao'
  | 'em_separacao'
  | 'finalizado'
  | 'armazenado';     // NOVO
```

---

## 2. Mudar "Armazenar" de deletar para atualizar status

**Arquivo:** `src/contexts/CrossContext.tsx`

```text
Antes:
  const armazenarCarga = async (id: string) => {
    await deletarCross(id);  // DELETA o registro
  };

Depois:
  const armazenarCarga = async (id: string) => {
    await atualizarCross(id, { status: 'armazenado' as StatusCross });  // Mantém para histórico
  };
```

---

## 3. Separar divergencias em duas colunas

**Arquivo:** `src/pages/CrossDocking.tsx`

Na tabela, substituir a coluna unica "Divergencia" por duas colunas:

| Coluna | Origem | Descricao |
|---|---|---|
| Div. Receb. | `carga.divergencia` | Divergencia da conferencia de recebimento |
| Div. Cross | `cross.observacao` | Divergencia informada ao finalizar separacao |

A coluna "Div. Cross" mostra o conteudo do campo `observacao` que ja e salvo ao finalizar. Se vazio, mostra "-".

Na coluna de Acoes, remover a exibicao de `cross.observacao` que aparece hoje para itens finalizados - essa informacao agora fica na coluna propria.

---

## 4. Adicionar filtro por Status

**Arquivo:** `src/pages/CrossDocking.tsx`

Dropdown com opcoes:
- Todos
- Aguardando Decisao
- Cross Confirmado
- Aguard. Separacao
- Em Separacao
- Finalizado
- Armazenado

Novo estado: `statusSelecionado` (default: `'todos'`).

Aplicado no `useMemo` junto com os filtros de data e fornecedor.

---

## 5. Adicionar filtro por Tipo de Acao

**Arquivo:** `src/pages/CrossDocking.tsx`

Dropdown com opcoes:
- Todos
- Cross
- Armazenar

Logica de derivacao (sem campo novo no banco):
- `armazenado` = tipo "armazenar"
- qualquer outro status = tipo "cross"

Novo estado: `tipoSelecionado` (default: `'todos'`).

---

## 6. Atualizar estilos e labels para novo status

**Arquivo:** `src/pages/CrossDocking.tsx`

Adicionar `armazenado` aos mapas de estilos e labels:

```text
statusStyles:
  armazenado: 'bg-orange-100 text-orange-800 border-orange-300'

statusLabels:
  armazenado: 'Armazenado'
```

---

## Arquivos modificados

| Arquivo | Alteracao |
|---|---|
| `src/types/index.ts` | Adiciona `armazenado` ao StatusCross |
| `src/contexts/CrossContext.tsx` | Armazenar atualiza status em vez de deletar |
| `src/hooks/useCrossDB.ts` | Nenhuma (ja suporta update generico) |
| `src/pages/CrossDocking.tsx` | 2 colunas de divergencia, filtro status, filtro tipo, labels/estilos |
| `src/components/cross/SeparacaoModal.tsx` | Nenhuma (ja salva observacao como divergencia cross) |

Nenhuma alteracao em tabelas, views ou RPCs do banco de dados.
