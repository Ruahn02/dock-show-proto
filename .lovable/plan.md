
# Limpeza Completa dos Dados do Banco

## Situacao Atual

| Tabela | Registros |
|--------|-----------|
| fornecedores | 10 |
| conferentes | 8 |
| solicitacoes | 1 |
| cargas | 15 |
| senhas | 8 |
| docas | 8 |
| cross_docking | 1 |

## Problema: Foreign Keys Circulares

Existem referencias circulares entre as tabelas:
- `cargas.senha_id` -> `senhas` e `senhas.carga_id` -> `cargas`
- `cargas.doca_id` -> `docas` e `docas.carga_id` -> `cargas`

Isso impede um DELETE simples em qualquer ordem. A solucao e quebrar os ciclos primeiro com UPDATE SET NULL, depois deletar na ordem correta.

## Plano de Execucao

Sera executado via ferramenta de insercao/atualizacao de dados (nao migration, pois nao altera schema):

**Passo 1 -- Quebrar ciclos (NULL nas FKs circulares)**
```text
UPDATE cargas SET senha_id = NULL, doca_id = NULL;
UPDATE senhas SET carga_id = NULL;
UPDATE docas SET carga_id = NULL, senha_id = NULL, conferente_id = NULL;
```

**Passo 2 -- Deletar tabelas dependentes primeiro**
```text
DELETE FROM cross_docking;
DELETE FROM docas;
DELETE FROM senhas;
DELETE FROM cargas;
DELETE FROM solicitacoes;
DELETE FROM conferentes;
DELETE FROM fornecedores;
```

**Passo 3 -- Verificar que todas as tabelas estao vazias**

Consulta SELECT count para confirmar zero registros em todas.

## O que NAO sera alterado

- Estrutura de tabelas (colunas, tipos, defaults)
- Foreign keys
- RLS policies
- Triggers
- View `vw_carga_operacional`
- RPC `rpc_atualizar_fluxo_carga`
- Sequences (ex: `senhas_numero_seq` continuara de onde parou)

## Resultado esperado

Todas as 7 tabelas com zero registros, schema 100% intacto, pronto para receber dados novos.
