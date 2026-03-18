

# Plano: Tela de Armazenamento + Tipos de Veículo Dinâmicos

## Parte 1 — Tela de Armazenamento de Cargas

### Estrutura

Criar nova página `src/pages/Armazenamento.tsx` acessível apenas para admin, no menu lateral.

**Dados exibidos:** Cross docking items com status `armazenado` ou `finalizado` (cross finalizado = processo de cross concluído).

**Lógica de exibição:**
- **Azul** — status `finalizado` (cross finalizado, aguardando decisão de armazenamento) → botão "Marcar como Armazenado"
- **Verde** — status `armazenado` (já armazenado)

**Botão "Marcar como Armazenado":** Para itens com status `finalizado`, chama `atualizarCross(id, { status: 'armazenado' })`. Após marcar, o item muda de azul para verde na mesma tela.

**Nota sobre tela operacional:** Itens `finalizado` continuam visíveis na tela de Cross Docking operacional até serem marcados como armazenados. Uma vez `armazenado`, saem da tela operacional (já é o comportamento atual em `getCrossParaOperacional`).

### Arquivos

| Arquivo | Alteração |
|---|---|
| `src/pages/Armazenamento.tsx` | Nova página com listagem e ação |
| `src/App.tsx` | Nova rota `/armazenamento` (adminOnly) |
| `src/components/layout/Sidebar.tsx` | Novo item de menu "Armazenamento" |

---

## Parte 2 — Tipos de Veículo Dinâmicos

### Migração SQL

Criar tabela `tipos_veiculo`:

```sql
CREATE TABLE tipos_veiculo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL UNIQUE,
  ativo boolean NOT NULL DEFAULT true,
  ordem integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS aberta (mesmo padrão do projeto)
ALTER TABLE tipos_veiculo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_select_tipos_veiculo" ON tipos_veiculo FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_tipos_veiculo" ON tipos_veiculo FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_tipos_veiculo" ON tipos_veiculo FOR UPDATE TO anon USING (true);
CREATE POLICY "anon_delete_tipos_veiculo" ON tipos_veiculo FOR DELETE TO anon USING (true);

-- Inserir tipos iniciais (corrigindo bi_truck → bi_carreta)
INSERT INTO tipos_veiculo (nome, ordem) VALUES
  ('fiorino', 1),
  ('van', 2),
  ('toco', 3),
  ('truck', 4),
  ('carreta', 5),
  ('bi_carreta', 6);
```

### Hook `useTiposVeiculoDB`

Novo hook que carrega tipos ativos ordenados por `ordem`. Retorna array `{ id, nome, ativo, ordem }`.

### Alterações no Frontend

| Arquivo | Alteração |
|---|---|
| `src/hooks/useTiposVeiculoDB.ts` | Novo hook para carregar tipos |
| `src/data/mockData.ts` | Remover `tipoCaminhaoLabels` (substituído por dados do banco) |
| `src/pages/SenhaCaminhoneiro.tsx` | Usar hook em vez de labels fixos |
| `src/pages/Docas.tsx` | Usar hook em vez de labels fixos |
| `src/pages/AgendamentoPlanejamento.tsx` | Usar hook em vez de labels fixos |
| `src/types/index.ts` | `TipoCaminhao` passa a ser `string` (não mais enum restrito) |
| Demais arquivos que usam `tipoCaminhaoLabels` | Substituir por lookup dinâmico |

**Compatibilidade:** Registros antigos com `bi_truck` continuarão funcionando — o hook fornecerá um fallback que exibe o valor bruto quando não encontrado na tabela.

**UX:** O seletor de tipo de veículo será um dropdown simples ordenado por `ordem` (leves → pesados). Não precisa de busca embutida pois são poucos itens (~6).

### Resumo de Arquivos Impactados

| Arquivo | Tipo |
|---|---|
| Migração SQL | Criar tabela `tipos_veiculo` com dados iniciais |
| `src/hooks/useTiposVeiculoDB.ts` | Novo hook |
| `src/pages/Armazenamento.tsx` | Nova página |
| `src/App.tsx` | Nova rota |
| `src/components/layout/Sidebar.tsx` | Novo menu |
| `src/data/mockData.ts` | Remover `tipoCaminhaoLabels` |
| `src/types/index.ts` | Flexibilizar `TipoCaminhao` para `string` |
| `src/pages/SenhaCaminhoneiro.tsx` | Usar tipos dinâmicos |
| `src/pages/Docas.tsx` | Usar tipos dinâmicos |
| `src/pages/AgendamentoPlanejamento.tsx` | Usar tipos dinâmicos |
| Outros arquivos referenciando `tipoCaminhaoLabels` | Atualizar imports |

