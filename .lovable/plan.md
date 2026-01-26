
# Plano de Ajustes - Prototipo Visual Completo

## Resumo das Alteracoes Necessarias

O prototipo atual ja possui a estrutura base. Este plano detalha as melhorias para atender completamente aos requisitos visuais solicitados.

---

## 1. DASHBOARD - Adicionar Graficos e Mais Indicadores

### Estado Atual
- 4 indicadores basicos (volumes, conferidas, docas livres/ocupadas)
- Filtro simples de periodo (Dia, Semana, Mes)

### Alteracoes Necessarias

**Novos Filtros de Periodo:**
- Adicionar opcao "Outro Dia" com seletor de data
- Adicionar opcao "Intervalo de Datas" com dois datepickers (De/Ate)
- Manter visual compacto com Popover para selecao

**Novos Indicadores (7 total):**
| Indicador | Icone | Cor |
|-----------|-------|-----|
| Total de Volumes | Package | Azul |
| Cargas Conferidas | CheckCircle | Verde |
| Cargas No Show | AlertCircle | Laranja |
| Cargas Recusadas | XCircle | Vermelho |
| Docas Livres | Container | Verde |
| Docas Ocupadas | Container | Amarelo |
| Docas em Conferencia | Container | Azul |

**Novos Graficos (usar Recharts):**
1. BarChart - Produtividade por conferente (volumes)
2. Lista visual de ranking de conferentes (1º, 2º, 3º com icones)
3. PieChart - Status das cargas (conferido, no show, recusado)

**Botoes de Exportacao (simulados):**
- Botao "Exportar Excel" - exibe toast
- Botao "Exportar PDF" - exibe toast

**Diferenciacao por Perfil:**
- Admin: ve todos os graficos e ranking detalhado
- Operacional: ve apenas indicadores gerais, sem ranking

### Arquivos a Modificar
- `src/pages/Dashboard.tsx` - Adicionar graficos e filtros
- `src/data/mockData.ts` - Adicionar dados mock para graficos
- `src/types/index.ts` - Expandir tipo DashboardPorPeriodo
- Criar `src/components/dashboard/ProductivityChart.tsx`
- Criar `src/components/dashboard/RankingList.tsx`
- Criar `src/components/dashboard/StatusChart.tsx`

### Dados Mock para Graficos
```text
produtividadePorConferente: [
  { nome: 'Joao Silva', volumes: 450 },
  { nome: 'Maria Santos', volumes: 380 },
  { nome: 'Pedro Oliveira', volumes: 320 },
  ...
]

statusCargas: [
  { status: 'Conferido', quantidade: 12 },
  { status: 'No Show', quantidade: 2 },
  { status: 'Recusado', quantidade: 1 },
]
```

---

## 2. AGENDAMENTO - Ajustes Menores

### Estado Atual
- Calendario funcional
- Lista de agendamentos por data
- Botoes de No Show e Recusado na tabela
- Modal com autocomplete

### Verificacoes e Ajustes
- Confirmar que campo fornecedor nao e editavel ao editar (ja implementado)
- Confirmar status visuais corretos (ja implementado)
- Status "Conferido" aparece apenas quando finalizado na doca

### Nenhuma Alteracao Significativa Necessaria
A tela ja atende aos requisitos. Apenas garantir que:
- O status "em_conferencia" apareca visualmente
- Marcar No Show ou Recusado funcione direto da lista

---

## 3. DOCAS - Adicionar Status "Em Conferencia" e "Conferido"

### Estado Atual
- Layout em lista (correto)
- Status: Livre, Ocupada, Uso e Consumo
- Fluxo de associar carga e finalizar conferencia

### Alteracoes Necessarias

**Novos Status da Doca (5 total):**
| Status | Cor | Descricao |
|--------|-----|-----------|
| Livre | Verde | Doca disponivel |
| Ocupada | Amarelo | Carga associada, aguardando conferencia |
| Em Conferencia | Azul | Conferente trabalhando |
| Conferido | Verde escuro | Finalizado, aguardando liberacao |
| Uso e Consumo | Cinza | Uso interno |

**Alteracoes no Fluxo:**
1. Doca livre -> Clicar -> Associar carga -> Doca fica "Ocupada"
2. Doca ocupada -> Iniciar conferencia -> Doca fica "Em Conferencia"
3. Doca em conferencia -> Finalizar -> Doca fica "Conferido"
4. Doca conferido -> Liberar -> Doca volta a "Livre"

**Exibicao Visual:**
- Adicionar coluna "Data" na tabela
- Data vem do agendamento associado

### Arquivos a Modificar
- `src/types/index.ts` - Adicionar novos status de doca
- `src/data/mockData.ts` - Atualizar labels e dados
- `src/pages/Docas.tsx` - Atualizar fluxo e estilos
- `src/components/docas/DocaStatusBadge.tsx` - Atualizar cores

### Novos Status Visuais
```text
livre:          bg-green-100 text-green-800
ocupada:        bg-yellow-100 text-yellow-800
em_conferencia: bg-blue-100 text-blue-800
conferido:      bg-emerald-100 text-emerald-800
uso_consumo:    bg-gray-100 text-gray-600
```

---

## 4. USO E CONSUMO - Confirmar Comportamento

### Requisitos
- Marca doca como ocupada
- NAO aparece em indicadores do dashboard
- NAO conta volumes
- NAO conta produtividade

### Verificacao
- Dashboard ja exclui uso_consumo dos calculos (verificar mock data)
- Garantir que graficos nao incluam docas em uso_consumo

---

## 5. FORNECEDORES e CONFERENTES - Ja Simplificados

### Estado Atual
- Apenas Nome e Status (Ativo/Inativo)
- Sem CNPJ, Matricula ou outros campos

### Nenhuma Alteracao Necessaria
Telas ja atendem aos requisitos.

---

## Arquitetura de Arquivos

### Arquivos a Criar
```text
src/components/dashboard/ProductivityChart.tsx  # Grafico de barras
src/components/dashboard/RankingList.tsx        # Lista de ranking
src/components/dashboard/StatusChart.tsx        # Grafico de pizza
```

### Arquivos a Modificar
```text
src/types/index.ts                              # Adicionar status de doca
src/data/mockData.ts                            # Dados para graficos
src/pages/Dashboard.tsx                         # Novo layout com graficos
src/pages/Docas.tsx                             # Novos status visuais
src/components/docas/DocaStatusBadge.tsx        # Novas cores
```

---

## Detalhes Tecnicos

### Tipos Atualizados
```typescript
// src/types/index.ts
export type StatusDoca = 'livre' | 'ocupada' | 'em_conferencia' | 'conferido' | 'uso_consumo';

export interface DashboardPorPeriodo {
  totalVolumes: number;
  cargasConferidas: number;
  cargasNoShow: number;
  cargasRecusadas: number;
  docasLivres: number;
  docasOcupadas: number;
  docasEmConferencia: number;
}

export interface ProdutividadeConferente {
  id: string;
  nome: string;
  volumes: number;
}
```

### Dados Mock Expandidos
```typescript
// src/data/mockData.ts
export const produtividadeConferentes: ProdutividadeConferente[] = [
  { id: 'c1', nome: 'Joao Silva', volumes: 450 },
  { id: 'c2', nome: 'Maria Santos', volumes: 380 },
  { id: 'c3', nome: 'Pedro Oliveira', volumes: 320 },
  { id: 'c4', nome: 'Ana Costa', volumes: 290 },
  { id: 'c5', nome: 'Carlos Ferreira', volumes: 250 },
];

export const statusCargasChart = [
  { name: 'Conferido', value: 12, color: '#3B82F6' },
  { name: 'No Show', value: 2, color: '#F97316' },
  { name: 'Recusado', value: 1, color: '#EF4444' },
];
```

---

## Componentes de Graficos

### ProductivityChart.tsx
- Usar BarChart do Recharts
- Barras horizontais
- Nome do conferente no eixo Y
- Volumes no eixo X
- Cores em gradiente azul

### RankingList.tsx
- Lista ordenada por volumes
- Icones de medalha para top 3
- Numero de volumes ao lado
- Visual compacto

### StatusChart.tsx
- Usar PieChart do Recharts
- 3 fatias (Conferido, No Show, Recusado)
- Legenda abaixo
- Cores conforme status

---

## Filtros de Periodo do Dashboard

### Opcoes
1. **Hoje** - Data atual
2. **Outro Dia** - Abre datepicker simples
3. **Semana** - Semana atual
4. **Mes** - Mes atual
5. **Intervalo** - Abre dois datepickers (De/Ate)

### Implementacao Visual
- ToggleGroup para selecao rapida
- Popover com Calendar para selecao de datas
- Exibir periodo selecionado no subtitulo

---

## Ordem de Implementacao

1. Atualizar tipos em `src/types/index.ts`
2. Expandir dados mock em `src/data/mockData.ts`
3. Criar componentes de graficos (3 arquivos)
4. Refatorar Dashboard com graficos e novos filtros
5. Atualizar status de Docas (5 status)
6. Atualizar estilos e labels
7. Testar fluxo completo

---

## Visual Final Esperado

### Dashboard
```text
┌────────────────────────────────────────────────────────────┐
│ Dashboard                     [Hoje] [Outro] [Sem] [Mes]   │
│ Hoje - 24/01/2026                      [Excel] [PDF]       │
├────────────────────────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐            │
│ │ Volumes │ │ Conferi │ │ NoShow  │ │Recusado │            │
│ │   450   │ │    5    │ │    2    │ │    1    │            │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘            │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐                        │
│ │ D.Livre │ │D.Ocupada│ │D.Confer │                        │
│ │    2    │ │    3    │ │    1    │                        │
│ └─────────┘ └─────────┘ └─────────┘                        │
├────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────┐ ┌─────────────────────────┐    │
│ │ Produtividade           │ │ Ranking                 │    │
│ │ [========] Joao 450     │ │ 🥇 Joao Silva    450    │    │
│ │ [======] Maria 380      │ │ 🥈 Maria Santos  380    │    │
│ │ [=====] Pedro 320       │ │ 🥉 Pedro Oliveira 320   │    │
│ └─────────────────────────┘ └─────────────────────────┘    │
│ ┌─────────────────────────┐                                │
│ │ Status das Cargas       │                                │
│ │     [PIE CHART]         │                                │
│ │ ■ Conferido ■ NoShow    │                                │
│ └─────────────────────────┘                                │
└────────────────────────────────────────────────────────────┘
```

### Docas (Lista)
```text
┌────────────────────────────────────────────────────────────┐
│ Docas                                      [+ Nova Doca]   │
├──────┬────────────────┬────────────┬─────────┬─────────────┤
│ Doca │ Status         │ Fornecedor │ NF(s)   │ Volume      │
├──────┼────────────────┼────────────┼─────────┼─────────────┤
│ #1   │ [Em Conferencia] │ ABC Ltda │ NF-001  │ 150        │
│ #2   │ [Ocupada]       │ Nacional  │ NF-003  │ 80         │
│ #3   │ [Livre]         │ -         │ -       │ -          │
│ #4   │ [Uso e Consumo] │ -         │ -       │ -          │
│ #5   │ [Conferido]     │ Express   │ NF-004  │ 250 ✓      │
└──────┴────────────────┴────────────┴─────────┴─────────────┘
```
