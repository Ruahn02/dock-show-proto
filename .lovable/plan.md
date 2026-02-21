
# Puxar NF da Solicitacao para Agenda e Agendamento

## Problema

Quando uma solicitacao e aprovada, a carga e criada com `nfs: []` (array vazio) no arquivo `src/contexts/SolicitacaoContext.tsx` (linha 65). A NF preenchida na solicitacao nao e repassada para a carga, e como a view `vw_carga_operacional` usa `c.nfs` como `nota_fiscal`, as telas de Agenda e Agendamento nunca recebem essa informacao.

## Solucao

Alterar a funcao `aprovarSolicitacao` em `src/contexts/SolicitacaoContext.tsx` para incluir a NF da solicitacao no array `nfs` da carga criada.

## Alteracao

### `src/contexts/SolicitacaoContext.tsx`

Na funcao `aprovarSolicitacao` (linha 62-71), mudar:

```text
nfs: [],
```

Para:

```text
nfs: sol.notaFiscal ? [sol.notaFiscal] : [],
```

Isso garante que, se a solicitacao tiver uma NF preenchida, ela sera incluida na carga e consequentemente aparecera nas telas de Agenda e Agendamento atraves da view `vw_carga_operacional`.

## Arquivos modificados

| Arquivo | Alteracao |
|---|---|
| `src/contexts/SolicitacaoContext.tsx` | Passar `notaFiscal` da solicitacao para o campo `nfs` da carga |
