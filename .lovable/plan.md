

# Corrigir NFs de cargas antigas (retroativo)

## Problema

O ajuste no codigo so se aplica a novas aprovacoes. Cargas criadas antes da correcao continuam com `nfs = '{}'` mesmo quando a solicitacao correspondente tem `nota_fiscal` preenchida.

Exemplo concreto: solicitacao `3a5dfb39` tem NF "5689", mas a carga `762c229d` criada a partir dela tem `nfs = '{}'`.

## Solucao

Executar uma migracao SQL que atualiza todas as cargas existentes, puxando a `nota_fiscal` da solicitacao vinculada para o campo `nfs` da carga.

## Alteracao

### Migracao SQL

```text
UPDATE cargas c
SET nfs = ARRAY[s.nota_fiscal]
FROM solicitacoes s
WHERE c.solicitacao_id = s.id
  AND s.nota_fiscal IS NOT NULL
  AND s.nota_fiscal <> ''
  AND c.nfs = '{}'::text[];
```

Esse comando:
- Encontra todas as cargas com `nfs` vazio que tem uma solicitacao vinculada
- Verifica se a solicitacao tem `nota_fiscal` preenchida
- Copia a NF para o array `nfs` da carga

Apos isso, as telas de Agenda e Agendamento vao exibir a NF corretamente para essas cargas, pois a view `vw_carga_operacional` le diretamente de `cargas.nfs`.

## Arquivos modificados

| Tipo | Alteracao |
|---|---|
| Migracao SQL | UPDATE retroativo das cargas com NF vazia |

Nenhum arquivo de codigo precisa ser alterado - o ajuste anterior no `SolicitacaoContext.tsx` ja garante que novas aprovacoes funcionam corretamente.
