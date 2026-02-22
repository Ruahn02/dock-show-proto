

# Filtro por nome e aviso de duplicidade na tela de Fornecedores

## O que sera feito

1. **Campo de busca por nome** acima da tabela -- o usuario digita e a lista filtra em tempo real (sem precisar arrastar ou selecionar de dropdown).
2. **Aviso de fornecedor duplicado** no modal de criacao -- ao digitar o nome, se ja existir um fornecedor com nome igual (ou muito similar), exibe um alerta antes de salvar.

## Alteracoes

### `src/pages/Fornecedores.tsx`

- Adicionar um estado `filtroNome` (string)
- Renderizar um `Input` com icone de busca (Search) entre o header e a tabela, onde o usuario digita o nome para filtrar
- Filtrar a lista `fornecedores` pelo texto digitado (case-insensitive, busca parcial) antes de renderizar na tabela
- Passar a lista completa de `fornecedores` para o `FornecedorModal` via nova prop `fornecedoresExistentes` (para validacao de duplicidade)

### `src/components/fornecedores/FornecedorModal.tsx`

- Receber nova prop `fornecedoresExistentes: Fornecedor[]`
- Ao digitar no campo "Nome", verificar se ja existe um fornecedor com o mesmo nome (comparacao case-insensitive, ignorando o proprio fornecedor em caso de edicao)
- Se existir duplicata, exibir um alerta amarelo abaixo do campo ("Ja existe um fornecedor com este nome")
- Desabilitar o botao "Salvar" quando houver duplicata exata

## Detalhes tecnicos

O filtro de busca usa `String.includes()` com `toLowerCase()` para busca parcial. A validacao de duplicidade usa `trim().toLowerCase()` para comparacao exata. Nenhuma alteracao no banco de dados.

| Arquivo | Alteracao |
|---|---|
| `src/pages/Fornecedores.tsx` | Adicionar campo de busca por nome e passar fornecedores ao modal |
| `src/components/fornecedores/FornecedorModal.tsx` | Adicionar validacao de nome duplicado com alerta visual |

