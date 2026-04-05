

# Plano: Adicionar `quantidade_docas` à tabela `tipos_veiculo` + tela de gestão

## O que será feito

1. **Migration**: Adicionar coluna `quantidade_docas INTEGER NOT NULL DEFAULT 1` na tabela `tipos_veiculo`
2. **Nova página**: Criar `src/pages/TiposVeiculo.tsx` — tela CRUD para gerenciar tipos de veículo (nome, ordem, ativo, quantidade de docas)
3. **Modal de edição**: Criar `src/components/tipos-veiculo/TipoVeiculoModal.tsx` para adicionar/editar tipos
4. **Rota no App.tsx**: Adicionar rota `/tipos-veiculo` (sem providers, igual a `/fornecedores`)
5. **Sidebar**: Adicionar link "Tipos de Veículo" no menu lateral (admin only)
6. **Hook**: Atualizar `useTiposVeiculoDB.ts` para incluir `quantidade_docas` no tipo e expor funções de criar/atualizar

## Detalhes

### Migration SQL
```sql
ALTER TABLE tipos_veiculo ADD COLUMN quantidade_docas INTEGER NOT NULL DEFAULT 1;
```

### Tela de gestão (`TiposVeiculo.tsx`)
- Tabela listando: Nome, Quantidade de Docas, Ordem, Status (ativo/inativo)
- Botão "Novo Tipo" abre modal
- Botão editar em cada linha
- Switch para ativar/desativar
- Padrão visual igual à tela de Fornecedores

### Modal (`TipoVeiculoModal.tsx`)
- Campos: Nome (texto), Quantidade de Docas (número, min 1), Ordem (número)
- Validação: nome obrigatório, quantidade >= 1

### Hook atualizado
- Tipo `TipoVeiculo` ganha campo `quantidade_docas: number`
- Novas funções: `criarTipo()`, `atualizarTipo()`

### Rota
- `/tipos-veiculo` sem providers (hook direto como `/fornecedores`)
- Admin only

## Arquivos alterados/criados

| Arquivo | Ação |
|---|---|
| Migration SQL | Adicionar coluna `quantidade_docas` |
| `src/hooks/useTiposVeiculoDB.ts` | Adicionar campo + CRUD |
| `src/pages/TiposVeiculo.tsx` | Criar página |
| `src/components/tipos-veiculo/TipoVeiculoModal.tsx` | Criar modal |
| `src/App.tsx` | Adicionar rota |
| `src/components/layout/Sidebar.tsx` | Adicionar link no menu |

