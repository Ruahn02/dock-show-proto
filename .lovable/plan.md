

# Correcao - Adicionar link de Solicitacao de Entrega na tela Acessos

## Problema

A tela "Acessos do Sistema" (`src/pages/Acessos.tsx`) lista 3 links publicos com QR Code:
- Acesso Administrativo (`/login`)
- Acesso Operacional (`/acesso`)
- Solicitacao de Senha (`/senha`)

A rota `/solicitacao` (Solicitacao de Entrega) ja existe e funciona, mas nao aparece nesta tela.

## Correcao

**Arquivo:** `src/pages/Acessos.tsx`

Adicionar um 4o item ao array `acessos`:

```
{
  titulo: 'Solicitação de Entrega',
  descricao: 'Acesso público sem login. Para fornecedores solicitarem agendamento de entrega.',
  path: '/solicitacao',
  icon: ClipboardList,
}
```

Importar o icone `ClipboardList` de `lucide-react` (mesmo icone usado no menu lateral para Solicitacoes).

Ajustar o grid de `md:grid-cols-3` para `md:grid-cols-4` para acomodar o 4o card sem quebrar o layout.

## Resultado

- 4 cards com QR Code na tela Acessos
- Link da Solicitacao de Entrega visivel e copiavel
- Nenhuma tela nova, nenhuma rota nova, nenhuma funcionalidade nova

