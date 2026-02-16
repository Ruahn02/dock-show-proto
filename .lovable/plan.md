

# Ajustes no Controle de Senhas

## 1. Aviso ao liberar sem conferencia finalizada

Atualmente, o botao "Liberar" simplesmente marca `liberada: true` e libera a doca, sem verificar se a conferencia foi concluida. A mudanca e:

- No `handleOpenLiberar`, verificar o status da senha selecionada
- Se o status for `conferido`, manter o comportamento atual (liberar normalmente)
- Se o status NAO for `conferido`, exibir um aviso diferente no AlertDialog:
  - Titulo: "Liberar sem Conferencia"
  - Mensagem: "Ao liberar sem finalizar a conferencia, a carga sera marcada como recusada. Deseja continuar?"
  - Botao vermelho "Liberar e Recusar"
- Se confirmar nesse caso:
  1. Chamar `atualizarFluxo` com `p_novo_status: 'recusado'` (que libera a doca e marca carga/senha como recusado via RPC)
  2. Em seguida, chamar `liberarSenha` para marcar `liberada: true`

### Detalhes tecnicos

No `handleConfirmLiberar`, adicionar logica condicional:

```text
Se senha.status !== 'conferido':
  - Buscar carga vinculada
  - Chamar atualizarFluxo({ p_carga_id, p_senha_id, p_novo_status: 'recusado' })
  - Chamar liberarSenha(senhaId)
Se nao:
  - Manter comportamento atual (liberar doca manualmente + liberarSenha)
```

No AlertDialog de liberacao, renderizar mensagem condicional baseada em `selectedSenha?.status !== 'conferido'`.

## 2. Senhas recusadas fora da lista ativa

O filtro `getSenhasAtivas()` no `SenhaContext` ja exclui senhas com `status === 'recusado'`. Porem, para garantir que nao haja brecha, sera adicionado um filtro extra diretamente na pagina `ControleSenhas.tsx` para excluir senhas recusadas da lista filtrada, como camada de seguranca adicional.

## Arquivo alterado

- `src/pages/ControleSenhas.tsx`

Nenhuma alteracao no banco de dados necessaria.
