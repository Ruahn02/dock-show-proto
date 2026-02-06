

# Plano - Correcoes Funcionais, Filtros e Dados Ficticios

## Resumo

Corrigir 4 bugs/faltas funcionais e recriar dados ficticios coerentes:
1. Agenda: adicionar filtro por data
2. Docas: corrigir bug do botao de transferir (stale closure)
3. Controle de Senhas: adicionar filtros por status, fornecedor e local
4. Dashboard: adicionar visao de Cross Docking
5. Dados ficticios: recriar todos coerentes

---

## 1. AGENDA — FILTRO DE DATA

### Problema
A data esta hardcoded como `2026-01-24` (linha 55) e nao existe filtro.
Os dados sao de `2026-02-04`. Resultado: a tabela aparece vazia.

### Correcao

**Arquivo: src/pages/Agenda.tsx**

- Trocar data fixa por estado com `useState`
- Adicionar um seletor de data (Popover + Calendar, ja usado em outras telas)
- Ao selecionar data, atualizar o filtro da tabela
- Manter layout atual (titulo + tabela)

### Logica
```text
[Data selecionada: 04/02/2026]  [Icone calendario]
                |
                v
Tabela filtra cargas onde carga.data === dataSelecionada
```

### Componentes reutilizados
- `Calendar` (ja existe em @/components/ui/calendar)
- `Popover` (ja existe)
- Padrao identico ao usado em AgendamentoPlanejamento.tsx

---

## 2. DOCAS — BUG DO BOTAO TRANSFERIR

### Problema
Apos transferir uma carga para patio, o botao de gerenciamento para de funcionar.

### Causa Raiz
Stale closure: varios handlers usam `docas.map(d =>` diretamente em vez de `setDocas(prev => prev.map(...))`.

Handlers afetados:
- `handleConfirmPatio` (linha 216): usa `docas.map`
- `handleAssociarCarga` (linha 135): usa `docas.map`
- `handleUsoConsumo` (linha 147): usa `docas.map`
- `handleLiberar` (linha 153): usa `docas.map`
- `handleRecusarCarga` (linha 179): usa `docas.map`
- `handleComecarConferencia/handleModalConfirm` (linha 324): usa `docas.map`
- `handleTerminarConferencia/handleModalConfirm` (linha 361): usa `docas.map`

### Correcao

**Arquivo: src/pages/Docas.tsx**

Substituir todas as chamadas `setDocas(docas.map(...))` por `setDocas(prev => prev.map(...))`.

Isso garante que o estado mais recente seja sempre usado, evitando o bug de stale closure.

---

## 3. CONTROLE DE SENHAS — FILTROS

### Problema
Nao existe forma de filtrar senhas por status, fornecedor ou local.

### Correcao

**Arquivo: src/pages/ControleSenhas.tsx**

Adicionar 3 selects simples acima da tabela:

| Filtro | Opcoes |
|--------|--------|
| Status | Todos / Aguardando Doca / Em Doca / Conferindo / Conferido / Recusado |
| Fornecedor | Todos / Lista de fornecedores |
| Local | Todos / Aguardando Doca / Em Doca / Patio |

### Logica
```text
senhasFiltradas = senhasAtivas
  .filter(s => filtroStatus === 'todos' || s.status === filtroStatus)
  .filter(s => filtroFornecedor === 'todos' || s.fornecedorId === filtroFornecedor)
  .filter(s => filtroLocal === 'todos' || s.localAtual === filtroLocal)
```

### Componentes reutilizados
- `Select` (ja existe em @/components/ui/select)

---

## 4. DASHBOARD — FILTRO/VISAO DE CROSS

### Problema
O Dashboard nao exibe informacoes de Cross Docking.

### Correcao

**Arquivo: src/data/mockData.ts**

Adicionar dados de cross ao dashboard:
- Novos campos em `DashboardPorPeriodo`: `totalCross`, `crossFinalizados`, `crossEmSeparacao`
- Novo grafico: `statusCrossChart`

**Arquivo: src/types/index.ts**

Adicionar campos opcionais em `DashboardPorPeriodo`:
- `totalCross?: number`
- `crossFinalizados?: number`
- `crossEmSeparacao?: number`

**Arquivo: src/pages/Dashboard.tsx**

Adicionar uma terceira linha de cards com indicadores de Cross:
- Total Cross
- Cross Finalizados
- Cross em Separacao

Adicionar toggle ou secao visual "Conferencia | Cross" para separar as visoes dos graficos.

### Nao criar graficos novos
Apenas adicionar cards de indicadores e usar o StatusChart existente com dados de cross.

---

## 5. DADOS FICTICIOS — RECRIAR TODOS

### Data base do sistema: 2026-02-04

### Problema
- Agenda usa data `2026-01-24`, dados sao de `2026-02-04`
- Cross Docking comeca vazio (sem dados iniciais)
- Solicitacoes tem poucas entradas

### Correcao

**Arquivo: src/data/mockData.ts**

Manter fornecedores e conferentes atuais (ja estao bons).

Recriar cargas com datas variadas para testar filtro da Agenda:

| ID | Data | Fornecedor | Status | Horario | Chegou | SenhaId |
|----|------|------------|--------|---------|--------|---------|
| cg_d2 | 2026-02-04 | f1 | aguardando_chegada | 07:30 | true | s1 |
| cg_d6 | 2026-02-04 | f3 | em_conferencia | 08:00 | true | s2 |
| cg_ag1 | 2026-02-04 | f5 | aguardando_chegada | 09:00 | true | s3 |
| cg_patio | 2026-02-04 | f2 | aguardando_chegada | 08:30 | true | s4 |
| cg1 | 2026-02-04 | f4 | conferido | - | true | - |
| cg2 | 2026-02-04 | f6 | conferido | - | true | - |
| cg3 | 2026-02-04 | f8 | no_show | 10:00 | false | - |
| cg4 | 2026-02-04 | f9 | aguardando_chegada | 14:00 | false | - |
| cg10 | 2026-02-03 | f1 | conferido | 08:00 | true | - |
| cg11 | 2026-02-03 | f2 | conferido | 09:00 | true | - |
| cg12 | 2026-02-03 | f4 | no_show | 11:00 | false | - |
| cg5 | 2026-02-05 | f3 | aguardando_chegada | 08:00 | false | - |
| cg6 | 2026-02-05 | f4 | aguardando_chegada | 10:30 | false | - |
| cg7 | 2026-02-06 | f5 | aguardando_chegada | - | false | - |

**Arquivo: src/contexts/CrossContext.tsx**

Adicionar dados iniciais de cross para que a tela nao fique vazia:

| ID | Fornecedor | NFs | Rua | Volume | Status |
|----|------------|-----|-----|--------|--------|
| cross1 | f4 | NF-001 | A-15 | 180 | aguardando_decisao |
| cross2 | f6 | NF-002 | C-22 | 215 | cross_confirmado |
| cross3 | f9 | NF-050 | D-10 | 145 | aguardando_separacao |
| cross4 | f1 | NF-060 | A-08 | 90 | em_separacao |

**Arquivo: src/contexts/SolicitacaoContext.tsx**

Adicionar mais solicitacoes para variedade:

| ID | Fornecedor | Email | Status | Data |
|----|------------|-------|--------|------|
| sol1 | f1 | contato@abc.com.br | pendente | 2026-02-03 |
| sol2 | f3 | agendamento@logexpress.com | pendente | 2026-02-03 |
| sol3 | f8 | agendamento@megaatacado.com | pendente | 2026-02-04 |
| sol4 | f5 | operacoes@centralcargas.com | aprovada | 2026-02-01 |
| sol5 | f2 | logistica@atacadonacional.com | recusada | 2026-02-01 |

**Arquivo: src/contexts/SenhaContext.tsx**

Atualizar `getCargasDisponiveis` para usar `2026-02-04` em vez de `2026-01-24`.

Manter senhas iniciais existentes (s1-s4) mas adicionar mais uma para teste:

| Senha | Fornecedor | Motorista | Status | Local |
|-------|------------|-----------|--------|-------|
| s1 | f1 | Carlos Pereira | em_doca | em_doca (Doca 2) |
| s2 | f3 | Roberto Mendes | conferindo | em_doca (Doca 6) |
| s3 | f5 | Antonio Lima | aguardando_doca | aguardando_doca |
| s4 | f2 | Jose Santos | aguardando_doca | em_patio |
| s5 | f4 | Marcos Ribeiro | conferido | em_doca |

---

## 6. RESUMO DOS ARQUIVOS

| Arquivo | Alteracao |
|---------|-----------|
| src/pages/Agenda.tsx | Adicionar filtro de data, corrigir data base |
| src/pages/Docas.tsx | Corrigir stale closures (docas.map -> prev => prev.map) |
| src/pages/ControleSenhas.tsx | Adicionar 3 filtros (status, fornecedor, local) |
| src/pages/Dashboard.tsx | Adicionar secao Cross com cards de indicadores |
| src/types/index.ts | Adicionar campos de cross no DashboardPorPeriodo |
| src/data/mockData.ts | Recriar cargas com datas variadas, adicionar dados cross no dashboard |
| src/contexts/CrossContext.tsx | Adicionar dados iniciais de cross |
| src/contexts/SolicitacaoContext.tsx | Adicionar mais solicitacoes |
| src/contexts/SenhaContext.tsx | Corrigir data base, adicionar senha s5 |

---

## 7. ORDEM DE IMPLEMENTACAO

1. Corrigir tipos (DashboardPorPeriodo com campos cross)
2. Atualizar mockData (cargas, dashboard com cross)
3. Corrigir SenhaContext (data base + senha s5)
4. Atualizar CrossContext (dados iniciais)
5. Atualizar SolicitacaoContext (mais dados)
6. Corrigir Docas.tsx (stale closures)
7. Adicionar filtro na Agenda.tsx
8. Adicionar filtros no ControleSenhas.tsx
9. Adicionar secao Cross no Dashboard.tsx

---

## 8. RESTRICOES RESPEITADAS

- Nenhuma tela nova criada
- Nenhum layout alterado
- Nenhum banco de dados criado
- Apenas correcoes de bugs e complementos operacionais
- Filtros simples sem logica complexa

