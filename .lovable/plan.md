

# Limpar Dados Operacionais do Supabase (manter Funcionarios e Fornecedores)

## Resumo

Apagar todos os registros das tabelas operacionais, mantendo intactos os cadastros de **Funcionarios (conferentes)** e **Fornecedores**. As tabelas, colunas e logica permanecem inalteradas.

## Tabelas que serao limpas

| Tabela | Acao |
|---|---|
| `cross_docking` | DELETE todos os registros |
| `cargas` | DELETE todos os registros |
| `senhas` | DELETE todos os registros |
| `solicitacoes` | DELETE todos os registros |
| `docas` | Resetar para estado livre (status='livre', limpar referencias) |

## Tabelas preservadas (sem alteracao)

- `conferentes` (Funcionarios)
- `fornecedores`

## Ordem de execucao

A limpeza precisa respeitar dependencias entre tabelas:

1. `cross_docking` (referencia cargas)
2. `docas` - resetar campos (carga_id, senha_id, conferente_id, volume_conferido, rua para NULL, status para 'livre')
3. `cargas` (referencia senhas e solicitacoes)
4. `senhas`
5. `solicitacoes`

## Detalhes tecnicos

Sera usado o insert tool (para operacoes de dados) com os seguintes comandos SQL:

```text
DELETE FROM cross_docking;

UPDATE docas SET status = 'livre', carga_id = NULL, senha_id = NULL, 
  conferente_id = NULL, volume_conferido = NULL, rua = NULL;

DELETE FROM cargas;
DELETE FROM senhas;
DELETE FROM solicitacoes;
```

Isso afeta apenas o ambiente de **teste**. O ambiente live nao sera alterado.

