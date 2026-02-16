

# Campo de Busca no Select de Fornecedor (Solicitacao de Entrega)

## Problema

Na tela de Solicitacao de Entrega (`/solicitacao-entrega`), o fornecedor precisa rolar uma lista potencialmente longa para encontrar seu nome no dropdown.

## Solucao

Substituir o `Select` por um `Popover` + `Command` (combobox com busca), que ja existe no projeto via shadcn. O fornecedor digita parte do nome e a lista filtra automaticamente.

## Alteracoes

### `src/pages/SolicitacaoEntrega.tsx`

- Importar `Popover`, `PopoverTrigger`, `PopoverContent` e `Command`, `CommandInput`, `CommandList`, `CommandEmpty`, `CommandGroup`, `CommandItem`
- Substituir o bloco do Select de fornecedor por um Combobox com campo de busca
- Exibir o nome do fornecedor selecionado no botao trigger
- Ao selecionar, fechar o popover e setar o `fornecedorId`

### Detalhes tecnicos

```text
Componente: Popover + Command (padrao shadcn combobox)
- PopoverTrigger: botao com texto do fornecedor selecionado ou placeholder
- CommandInput: campo de texto para filtrar
- CommandList > CommandGroup > CommandItem: lista filtrada de fornecedores ativos
- Ao clicar em um item: seta fornecedorId, fecha popover
- Icone Check ao lado do item selecionado
```

Nenhum arquivo novo, apenas alteracao em `src/pages/SolicitacaoEntrega.tsx`.

