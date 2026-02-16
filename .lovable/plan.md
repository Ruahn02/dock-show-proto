

# Adicionar "Começar Separação" na visão Admin do Cross Docking

## O que muda

Atualmente, o botão "Começar Separação" só aparece na visão Operacional. A alteração adiciona esse mesmo botão na visão Admin para itens com status `aguardando_separacao`, permitindo que o administrador também inicie a separação sem precisar trocar de perfil.

## Alteração

### `src/pages/CrossDocking.tsx`

Na seção de ações do Admin dentro da tabela, adicionar uma condição para o status `aguardando_separacao`:

```text
Atual (Admin):
- aguardando_decisao -> Armazenar / Cross
- cross_confirmado -> Cross Montado

Novo (Admin):
- aguardando_decisao -> Armazenar / Cross
- cross_confirmado -> Cross Montado
- aguardando_separacao -> Começar Separação  (NOVO)
```

O botão reutiliza o mesmo `handleIniciarSeparacao` e o modal `IniciarSeparacaoModal` que já existem na página.

Nenhuma alteração no banco de dados.

