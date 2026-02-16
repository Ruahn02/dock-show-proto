

# Ajustes na Tela de Agendamento

## Problemas Identificados

### 1. Cargas sumindo quando motorista pega senha
A linha de filtro atual e:
```
cargas.filter(c => c.data === dateStr && c.status === 'aguardando_chegada')
```
Isso descarta qualquer carga cujo status mudou (ex: `aguardando_conferencia`, `em_conferencia`, `conferido`). Ao remover o filtro de status, todas as cargas do dia selecionado serao exibidas independentemente do fluxo.

### 2. Nome do fornecedor sumindo em dias anteriores
A tela usa `useSenha()` que le da tabela `cargas` e depois busca o nome do fornecedor via `useFornecedoresDB()` com um join manual por ID. Se o fornecedor_id nao bater, mostra "N/A". A solucao e usar `useFluxoOperacional()` que le da view `vw_carga_operacional`, onde `fornecedor_nome` ja vem preenchido. Se vier vazio, exibe "-".

### 3. Colunas NF(s) e Divergencia
NF(s) ja existe. Divergencia sera adicionada como nova coluna.

### 4. Resumo do dia no topo
Cards com totais filtrados pela data selecionada usando dados da view.

## Alteracoes

### `src/pages/AgendamentoPlanejamento.tsx`

**Fonte de dados**: Trocar de `useSenha()` + `useFornecedoresDB()` para `useFluxoOperacional()`.

**Filtro**: Remover filtro por status. Manter apenas filtro por data:
```
dados.filter(d => d.data_agendada === dateStr)
```

**Calendario**: Marcar todas as datas que tem cargas (sem filtro de status).

**Tabela**: Usar `fornecedor_nome` direto da view. Adicionar coluna Divergencia. Manter colunas: Data, Horario, Fornecedor, NF(s), Volume Previsto, Volume Conferido, Tipo, Divergencia, Status, Acoes.

**Resumo do dia**: 4 cards no topo (entre calendario e tabela):
- Total de cargas agendadas (contagem de registros do dia)
- Total de caminhoes (soma de quantidade_veiculos)
- Volume previsto (soma)
- Volume conferido (soma)

**Status badge**: Exibir o status real da carga (usando statusCargaLabels) em vez de sempre "Ativo". Manter os estilos de cores por status.

**Acoes**: Permitir editar/cancelar apenas cargas com status `aguardando_chegada`. Para outros status, nao exibir botoes.

### Detalhes tecnicos

```text
Imports:
- Adicionar useFluxoOperacional
- Remover useSenha e useFornecedoresDB

Dados:
- const { dados } = useFluxoOperacional()
- cargasFiltradas = dados.filter(d => d.data_agendada === dateStr)
- datasComCargas = Set de todas datas unicas dos dados

Resumo:
- totalCargas = cargasFiltradas.length
- totalCaminhoes = soma de quantidade_veiculos (default 1)
- volumePrevisto = soma de volume_previsto
- volumeConferido = soma de volume_conferido

Tabela:
- fornecedor: d.fornecedor_nome || '-'
- nfs: d.nota_fiscal?.join(', ') || '-'
- divergencia: d.divergencia || '-' (nova coluna)
- volume conferido: d.volume_conferido ?? '-'
- status: statusCargaLabels[d.status_carga] com badge colorido

Acoes (editar/cancelar):
- Manter apenas para status === 'aguardando_chegada'
- Editar usa atualizarCarga do useCargasDB
- Cancelar usa atualizarFluxo com status 'recusado'
```

Nenhuma alteracao no banco de dados necessaria.
