

# Plano: Divergências Estruturadas (Recebimento e Cross Docking)

## 1. Migration SQL — Nova tabela `divergencias`

```sql
CREATE TABLE public.divergencias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  carga_id uuid NOT NULL REFERENCES public.cargas(id) ON DELETE CASCADE,
  senha_id uuid REFERENCES public.senhas(id) ON DELETE SET NULL,
  cross_id uuid REFERENCES public.cross_docking(id) ON DELETE SET NULL,
  origem text NOT NULL CHECK (origem IN ('recebimento', 'cross')),
  produto_codigo text NOT NULL,
  produto_descricao text NOT NULL,
  quantidade numeric NOT NULL,
  tipo_divergencia text NOT NULL CHECK (tipo_divergencia IN ('falta','sobra','recusa','produto_errado','descricao_divergente','avaria')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.divergencias ENABLE ROW LEVEL SECURITY;
-- RLS policies for anon (matching existing pattern)
CREATE POLICY "anon_select_divergencias" ON public.divergencias FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_divergencias" ON public.divergencias FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_divergencias" ON public.divergencias FOR UPDATE TO anon USING (true);
CREATE POLICY "anon_delete_divergencias" ON public.divergencias FOR DELETE TO anon USING (true);
```

Nenhuma tabela existente será alterada.

---

## 2. Alterações nos Modais

### DocaModal (Finalizar Conferência)
- Remover o campo `Textarea` de divergência texto livre
- Adicionar toggle "Teve divergência?" (Não / Sim)
- Quando "Sim": formulário dinâmico com linhas de divergência
  - Campos: `produto_codigo`, `produto_descricao`, `quantidade`, `tipo_divergencia` (dropdown)
  - Botão "+ Adicionar divergência" para novas linhas
- O `onConfirm` passará um array de divergências junto com os dados existentes
- Após confirmar, inserir cada divergência na tabela `divergencias` com `origem='recebimento'`

### FinalizarSeparacaoModal (Cross Docking)
- Remover o campo de observação/divergência texto
- Adicionar o mesmo formulário dinâmico de divergências
- Ao confirmar, inserir com `origem='cross'` e `cross_id`

### Interface compartilhada (novo tipo)
```typescript
interface DivergenciaItem {
  produto_codigo: string;
  produto_descricao: string;
  quantidade: number;
  tipo_divergencia: string;
}
```

Componente reutilizável `DivergenciasForm` usado em ambos os modais.

---

## 3. Busca e Exibição nas Tabelas

### Hook `useDivergenciasDB`
- Busca divergências da tabela `divergencias` via Supabase client
- Agrupa por `carga_id` e `origem`
- Formata como texto multi-linha: `codigo - descricao - quantidade - tipo`

### Tela CrossDocking (`CrossDocking.tsx`)
- Coluna "Div. Receb." → busca divergências com `origem='recebimento'` e `carga_id` do cross
- Coluna "Div. Cross" → busca divergências com `origem='cross'` e `cross_id`
- Ambas lado a lado (já estão posicionadas assim na tabela atual)
- CSS nas células: `whitespace-pre-line` e `break-words` para texto multi-linha

### Tela Docas (se exibir divergências)
- Mesmo padrão de formatação

---

## 4. Arquivos a criar/modificar

| Arquivo | Ação |
|---|---|
| `supabase/migrations/...` | Criar tabela `divergencias` |
| `src/types/index.ts` | Adicionar tipo `DivergenciaItem` |
| `src/components/divergencias/DivergenciasForm.tsx` | **Novo** — componente reutilizável do formulário |
| `src/hooks/useDivergenciasDB.ts` | **Novo** — hook CRUD + agrupamento |
| `src/components/docas/DocaModal.tsx` | Substituir textarea por formulário estruturado |
| `src/components/cross/SeparacaoModal.tsx` | Substituir observação por formulário estruturado |
| `src/pages/Docas.tsx` | Passar callback para salvar divergências após confirmar |
| `src/pages/CrossDocking.tsx` | Usar hook para exibir divergências nas colunas |

Nenhuma alteração em RPCs, triggers, tabelas existentes, ou lógica de volumes/finalização.

