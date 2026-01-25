
# Plano de Ajustes - Prototipo Visual de Controle de Docas

## Resumo das Alteracoes

Este plano detalha os ajustes necessarios para simplificar o prototipo, focando em um sistema operacional de uso em docas.

---

## 1. DASHBOARD - Simplificacao

### Remover Componentes
- Remover `ProductivityChart.tsx` (grafico de produtividade)
- Remover `RankingList.tsx` (ranking de conferentes)
- Remover `StatusChart.tsx` (grafico de status)
- Remover botoes de exportacao Excel/PDF

### Adicionar Filtro de Periodo
- Criar seletor visual com opcoes: **Dia**, **Semana**, **Mes**
- Filtro apenas simula mudanca de valores mock (cada selecao mostra valores diferentes)
- Valores resetam visualmente conforme periodo

### Manter Apenas 4 Indicadores
| Indicador | Icone |
|-----------|-------|
| Total de Volumes Recebidos | Package |
| Cargas Conferidas | CheckCircle |
| Docas Livres | Container |
| Docas Ocupadas | Container |

### Arquivos a Modificar
- `src/pages/Dashboard.tsx` - Reescrever com layout simplificado
- `src/data/mockData.ts` - Adicionar dados mock por periodo

---

## 2. AGENDAMENTO - Calendario e Novo Fluxo

### Adicionar Calendario Visual
- Usar componente `Calendar` do shadcn/ui para selecao de datas
- Exibir calendario lateral ou superior para navegacao
- Permitir agendar para datas futuras

### Novo Status de Agendamento
| Status | Cor |
|--------|-----|
| Aguardando chegada | Roxo |
| Em conferencia | Amarelo |
| Conferido | Azul |
| No show | Laranja |
| Recusado | Vermelho |

### Fornecedor com Autocomplete
- Substituir Select por input com busca/digitacao
- Usar componente `Command` (cmdk) do shadcn para autocomplete

### Restricao de Edicao
- **Novo agendamento**: todos os campos editaveis
- **Edicao**: bloquear fornecedor e dados basicos
- Permitir apenas alterar status para no_show ou recusado

### Botoes Rapidos na Lista
- Adicionar botoes "No Show" e "Recusado" diretamente na tabela
- Remover botao "Associar a Doca" (associacao sera feita na tela de Docas)

### Arquivos a Modificar
- `src/pages/Agendamento.tsx` - Adicionar calendario e botoes rapidos
- `src/components/agendamento/AgendamentoModal.tsx` - Autocomplete e restricoes
- `src/types/index.ts` - Atualizar status para "aguardando_chegada"

---

## 3. DOCAS - Layout em Lista

### Substituir Cards por Tabela/Lista
- Remover grid de cards
- Exibir docas em formato de linhas (lista)
- Cada linha mostra: Numero | Status | Fornecedor | NF(s) | Volume Previsto

### Status da Doca (simplificado)
| Status | Cor |
|--------|-----|
| Livre | Verde |
| Ocupada | Amarelo |
| Uso e Consumo | Cinza |

### Novo Fluxo de Associacao
1. Clicar em doca livre
2. Modal exibe lista de cargas disponiveis (aguardando ou em conferencia)
3. Selecionar carga para associar a doca
4. Doca fica "Ocupada"

### Operacao na Doca
1. Conferente entra na doca
2. Seleciona seu nome (lista simples)
3. Marca como "Em conferencia"
4. Informa rua

### Finalizacao
- **Conferido**: Volume recebido + Divergencia (opcional)
- **No Show**: Sem campos
- **Recusado**: Sem campos

### Regra Importante
- Ao finalizar, doca pode voltar a Livre
- Carga pode continuar como "Em conferencia" (mesma carga em multiplas docas)

### Arquivos a Modificar
- `src/pages/Docas.tsx` - Substituir grid por lista
- `src/components/docas/DocaCard.tsx` - Converter para linha de tabela ou remover
- `src/components/docas/DocaModal.tsx` - Ajustar fluxo de selecao de carga
- `src/types/index.ts` - Simplificar StatusDoca para livre/ocupada/uso_consumo

---

## 4. USO E CONSUMO

### Comportamento
- Marcar doca como ocupada para uso interno
- NAO entra em metricas do dashboard
- Pode ser liberada manualmente

### Implementacao
- Manter botao "Uso e Consumo" para docas livres
- Manter botao "Liberar" para docas em uso e consumo
- Garantir que Dashboard nao conta uso_consumo

---

## 5. FORNECEDORES - Simplificar

### Remover Campos
- Remover CNPJ
- Remover Contato

### Manter Apenas
- Nome do fornecedor
- Status (Ativo/Inativo)

### Layout
- Lista simples
- Botao adicionar
- Botao editar

### Arquivos a Modificar
- `src/types/index.ts` - Remover cnpj e contato do tipo Fornecedor
- `src/data/mockData.ts` - Simplificar dados de fornecedores
- `src/pages/Fornecedores.tsx` - Remover colunas CNPJ e Contato
- `src/components/fornecedores/FornecedorModal.tsx` - Remover campos

---

## 6. CONFERENTES - Simplificar

### Remover Campos
- Remover Matricula

### Manter Apenas
- Nome do conferente
- Status (Ativo/Inativo)

### Layout
- Lista simples
- Botao adicionar
- Botao editar

### Arquivos a Modificar
- `src/types/index.ts` - Remover matricula do tipo Conferente
- `src/data/mockData.ts` - Simplificar dados de conferentes
- `src/pages/Conferentes.tsx` - Remover coluna Matricula
- `src/components/conferentes/ConferenteModal.tsx` - Remover campo

---

## 7. TIPOS E DADOS

### Atualizar `src/types/index.ts`

```typescript
// Fornecedor simplificado
export interface Fornecedor {
  id: string;
  nome: string;
  ativo: boolean;
}

// Conferente simplificado
export interface Conferente {
  id: string;
  nome: string;
  ativo: boolean;
}

// Status da doca simplificado
export type StatusDoca = 'livre' | 'ocupada' | 'uso_consumo';

// Status da carga atualizado
export type StatusCarga = 'aguardando_chegada' | 'em_conferencia' | 'conferido' | 'no_show' | 'recusado';
```

### Atualizar `src/data/mockData.ts`
- Remover campos desnecessarios dos fornecedores
- Remover matriculas dos conferentes
- Adicionar dados mock para diferentes periodos (dia/semana/mes)
- Atualizar labels de status

---

## 8. ORDEM DE IMPLEMENTACAO

1. Atualizar tipos em `src/types/index.ts`
2. Atualizar dados mock em `src/data/mockData.ts`
3. Simplificar pagina Fornecedores e modal
4. Simplificar pagina Conferentes e modal
5. Refatorar Dashboard com filtro de periodo
6. Refatorar Agendamento com calendario e autocomplete
7. Refatorar Docas para layout de lista
8. Testar fluxo completo

---

## Detalhes Tecnicos

### Componentes shadcn/ui a Utilizar
- `Calendar` - Para selecao de datas no agendamento
- `Command` - Para autocomplete de fornecedores
- `Popover` - Para exibir calendario e autocomplete
- `Tabs` ou `ToggleGroup` - Para filtro de periodo no dashboard
- `Table` - Para lista de docas

### Estado Local
- Todos os dados continuam em `useState`
- Nenhuma persistencia
- Dados resetam ao recarregar pagina

### Dados Mock por Periodo
```typescript
export const dashboardPorPeriodo = {
  dia: { totalVolumes: 450, cargasConferidas: 5, docasLivres: 3, docasOcupadas: 3 },
  semana: { totalVolumes: 2850, cargasConferidas: 32, docasLivres: 2, docasOcupadas: 4 },
  mes: { totalVolumes: 12400, cargasConferidas: 145, docasLivres: 3, docasOcupadas: 3 },
};
```

---

## Interface Visual

### Principios Mantidos
- Visual limpo e simples
- Leitura rapida
- Foco no uso em doca
- Sem telas administrativas complexas

### Cores de Status (Docas)
```
Livre:         bg-green-100 text-green-800
Ocupada:       bg-yellow-100 text-yellow-800
Uso e Consumo: bg-gray-100 text-gray-600
```

### Cores de Status (Cargas)
```
Aguardando:    bg-purple-100 text-purple-800
Em Conferencia: bg-yellow-100 text-yellow-800
Conferido:     bg-blue-100 text-blue-800
No Show:       bg-orange-100 text-orange-800
Recusado:      bg-red-100 text-red-800
```
