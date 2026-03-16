

# Plano: Cadastro em massa de fornecedores + Filtro na tela de senha

## 1. Cadastro em massa de fornecedores

Inserir todos os ~300 fornecedores da lista via migração SQL, ignorando os que já existem (comparação por nome, case-insensitive).

**Abordagem:** Uma única migração SQL com `INSERT INTO fornecedores (nome, ativo) VALUES (...) ON CONFLICT` — mas como não há constraint unique em `nome`, usarei `WHERE NOT EXISTS (SELECT 1 FROM fornecedores WHERE LOWER(nome) = LOWER(...))` para cada fornecedor.

**Arquivo:** Migração SQL (via ferramenta de migração)

## 2. Filtro de fornecedor na tela de solicitar senha

**Problema:** Com ~300 fornecedores, o Select dropdown fica impraticável. O motorista precisa rolar muito para encontrar o fornecedor.

**Solução:** Adicionar um campo de busca (`Input`) acima do `Select` na view `formulario` de `SenhaCaminhoneiro.tsx`. O texto digitado filtra os `fornecedoresAgendados` exibidos no dropdown. Ao limpar o filtro, todos voltam a aparecer.

**Arquivo:** `src/pages/SenhaCaminhoneiro.tsx`
- Adicionar estado `filtroFornecedor`
- Filtrar `fornecedoresAgendados` pelo texto digitado antes de renderizar os `SelectItem`
- Input com placeholder "Buscar fornecedor..." acima do Select

## Resumo

| Ação | Tipo |
|---|---|
| Inserir ~300 fornecedores (ignorando existentes) | Migração SQL |
| Adicionar campo de busca de fornecedor na tela de senha | `SenhaCaminhoneiro.tsx` |

