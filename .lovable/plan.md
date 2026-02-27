

# Adicionar Acesso Comprador na tela de Acessos e corrigir codigo

## O que sera feito

1. **Adicionar card do Comprador** na tela "Acessos do Sistema" com link para `/comprador`, QR Code e botao de copiar -- seguindo o mesmo padrao dos outros cards.
2. **Alterar codigo de acesso** de `COMPRADOR123` para `COMPRAS123` conforme solicitado.
3. **Corrigir bug de sessao do comprador** -- a funcao `getStoredSession` atualmente so restaura sessoes de `administrador` e `operacional`, ignorando o comprador (linha 40 do ProfileContext).
4. **Ajustar grid** de 4 para 5 colunas no desktop (`lg:grid-cols-5`) para acomodar o novo card.

## Alteracoes

| Arquivo | O que muda |
|---|---|
| `src/contexts/ProfileContext.tsx` | Alterar codigo do comprador de `COMPRADOR123` para `COMPRAS123`; incluir `parsed.perfil === 'comprador'` na validacao de `getStoredSession` |
| `src/pages/Acessos.tsx` | Adicionar item "Acesso Comprador" ao array `acessos` com path `/comprador`, icone `ShoppingCart` e descricao mencionando o codigo `COMPRAS123`; ajustar grid para `lg:grid-cols-5` |

