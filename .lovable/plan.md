

# Limpeza dos Dados Mock do Dashboard

## O que sera feito

O arquivo `src/data/mockData.ts` contem dados simulados que ainda alimentam o Dashboard com numeros fictícios (volumes, cargas conferidas, rankings, graficos). Como o banco foi limpo, esses dados precisam ser zerados tambem.

## Alteracoes

### 1. `src/data/mockData.ts`

Remover completamente os seguintes arrays/objetos que nao sao mais usados em lugar nenhum:
- `fornecedores` (array mock -- o sistema usa `useFornecedoresDB`)
- `conferentes` (array mock -- o sistema usa `useConferentesDB`)
- `cargasIniciais` (array mock -- o sistema usa hooks de DB)
- `docasIniciais` (array mock -- o sistema usa hooks de DB)

Zerar os dados do dashboard (manter a estrutura para o codigo compilar):
- `dashboardPorPeriodo` -- todos os valores para 0
- `produtividadeConferentes` -- arrays vazios
- `statusCargasChart` -- arrays vazios

**Manter intactos** (sao constantes de UI usadas em varias telas):
- `statusCargaLabels`
- `statusDocaLabels`
- `tipoCaminhaoLabels`
- `statusSolicitacaoLabels`
- `statusSenhaLabels`
- `localSenhaLabels`

### 2. Nenhuma outra alteracao

- Dashboard.tsx continua funcionando (importa os mesmos exports, so que agora com valores zerados)
- Nenhum outro arquivo e afetado pois os arrays removidos nao eram importados em lugar nenhum

## Resultado

O Dashboard mostrara todos os indicadores em 0, graficos vazios, e ranking vazio -- refletindo corretamente que nao ha dados no sistema.

