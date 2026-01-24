
# Plano de Implementacao - Prototipo Visual de Controle de Docas

## Resumo do Projeto

Criar um prototipo visual navegavel para demonstracao de um sistema de controle de docas, agendamentos e conferencia de cargas. O sistema utilizara apenas dados simulados (mock), sem banco de dados, autenticacao real ou persistencia de dados.

## Arquitetura Proposta

```text
src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx           # Cabecalho com seletor de perfil
│   │   ├── Sidebar.tsx          # Menu lateral de navegacao
│   │   └── Layout.tsx           # Layout principal
│   ├── dashboard/
│   │   ├── StatCard.tsx         # Card de indicador
│   │   ├── ProductivityChart.tsx # Grafico de barras
│   │   ├── RankingList.tsx      # Ranking de conferentes
│   │   └── StatusChart.tsx      # Grafico de status
│   ├── docas/
│   │   ├── DocaCard.tsx         # Card individual de doca
│   │   ├── DocaStatusBadge.tsx  # Badge colorido de status
│   │   └── DocaModal.tsx        # Modal de acoes da doca
│   ├── agendamento/
│   │   └── AgendamentoModal.tsx # Modal de agendamento
│   ├── fornecedores/
│   │   └── FornecedorModal.tsx  # Modal de fornecedor
│   └── conferentes/
│       └── ConferenteModal.tsx  # Modal de conferente
├── contexts/
│   └── ProfileContext.tsx       # Contexto para perfil ativo
├── data/
│   └── mockData.ts              # Dados simulados
├── pages/
│   ├── Dashboard.tsx            # Tela 1
│   ├── Agendamento.tsx          # Tela 2
│   ├── Docas.tsx                # Tela 3
│   ├── Fornecedores.tsx         # Tela 4
│   └── Conferentes.tsx          # Tela 5
└── types/
    └── index.ts                 # Tipos TypeScript
```

## Etapas de Implementacao

### Etapa 1: Estrutura Base e Dados Mock

**Arquivo: `src/types/index.ts`**
- Definir tipos para: Perfil, Doca, Carga, Fornecedor, Conferente, StatusDoca

**Arquivo: `src/data/mockData.ts`**
- Dados ficticios de fornecedores (10 itens)
- Dados ficticios de conferentes (8 itens)
- Dados ficticios de cargas/agendamentos (15 itens)
- Dados ficticios de docas (6 docas)
- Indicadores do dashboard

**Arquivo: `src/contexts/ProfileContext.tsx`**
- Contexto React para gerenciar perfil ativo (Administrador/Operacional)
- Hook `useProfile` para acesso facil

### Etapa 2: Layout e Navegacao

**Arquivo: `src/components/layout/Header.tsx`**
- Logo do sistema
- Seletor visual de perfil (Administrador/Operacional)
- Indicador visual do perfil ativo

**Arquivo: `src/components/layout/Sidebar.tsx`**
- Menu com links para as 5 telas
- Itens visiveis conforme perfil:
  - Todos: Dashboard, Agendamento, Docas
  - Apenas Admin: Fornecedores, Conferentes
- Icones lucide-react para cada item

**Arquivo: `src/components/layout/Layout.tsx`**
- Wrapper com Header + Sidebar + Conteudo

**Arquivo: `src/App.tsx`**
- Atualizar rotas para todas as paginas
- Envolver com ProfileProvider

### Etapa 3: Dashboard (Tela 1)

**Arquivo: `src/pages/Dashboard.tsx`**
- Grid de cards com indicadores do dia
- Graficos usando Recharts (ja instalado)
- Botoes de exportacao (simulados)
- Conteudo diferenciado por perfil

**Cards de Indicadores (Admin):**
| Indicador | Valor Mock |
|-----------|------------|
| Total de volumes recebidos | 1.247 |
| Media por conferente | 156 |
| Cargas conferidas | 12 |
| Cargas no show | 2 |
| Cargas recusadas | 1 |
| Docas livres | 2 |
| Docas ocupadas | 3 |
| Docas em conferencia | 1 |

**Graficos:**
- Barras: Produtividade por conferente (BarChart)
- Ranking: Lista ordenada com medalhas
- Pizza: Status das cargas (PieChart)

**Perfil Operacional:**
- Mostra apenas indicadores gerais
- Mostra status das docas
- Oculta ranking individual

### Etapa 4: Agendamento (Tela 2)

**Arquivo: `src/pages/Agendamento.tsx`**
- Tabela com lista de cargas do dia
- Colunas: Data, Fornecedor, NF(s), Volume Previsto, Status
- Badges coloridos para status

**Acoes (apenas Admin):**
- Botao "Novo Agendamento" abre modal
- Botao "Editar" em cada linha
- Botao "Associar a Doca"

**Modal de Agendamento:**
- Campos: Data, Fornecedor (select), NFs, Volume previsto
- Botoes Salvar/Cancelar (apenas visuais)

### Etapa 5: Docas (Tela 3)

**Arquivo: `src/pages/Docas.tsx`**
- Grid de cards grandes (otimizado para uso em doca)
- Cada card representa uma doca

**Status com cores:**
| Status | Cor |
|--------|-----|
| Livre | Verde (green-500) |
| Conferindo | Amarelo (yellow-500) |
| Conferido | Azul (blue-500) |
| Uso e consumo | Cinza (gray-400) |

**Card da Doca (Admin):**
- Numero da doca
- Status colorido
- Fornecedor associado
- Conferente (quando aplicavel)
- Volume (quando conferido)
- Botoes: Alterar Status, Uso e Consumo, Liberar

**Card da Doca (Operacional):**
- Numero, Status, Fornecedor, NFs, Volume previsto
- Botoes: Entrar na Doca, Marcar Em Conferencia

**Modal de Finalizacao:**
- Opcoes: Conferido, No Show, Recusado
- Campos condicionais para "Conferido": Volume, Rua, Divergencia

### Etapa 6: Fornecedores (Tela 4) - Apenas Admin

**Arquivo: `src/pages/Fornecedores.tsx`**
- Tabela com lista de fornecedores
- Colunas: Nome, CNPJ, Status (Ativo/Inativo)
- Botoes: Adicionar, Editar, Ativar/Desativar

**Modal de Fornecedor:**
- Campos: Nome, CNPJ, Contato
- Toggle de status

### Etapa 7: Conferentes (Tela 5) - Apenas Admin

**Arquivo: `src/pages/Conferentes.tsx`**
- Tabela com lista de conferentes
- Colunas: Nome, Matricula, Status
- Botoes: Adicionar, Editar, Ativar/Desativar

**Modal de Conferente:**
- Campos: Nome, Matricula
- Toggle de status

### Etapa 8: Estilizacao e Ajustes Finais

**Arquivo: `src/index.css`**
- Variaveis CSS customizadas para cores de status
- Ajustes para cards grandes e legibilidade

**Refinamentos:**
- Responsividade para tablets
- Transicoes suaves
- Feedback visual nas acoes

## Cores e Design

**Paleta de Status:**
```text
Livre:          bg-green-100 text-green-800 border-green-300
Conferindo:     bg-yellow-100 text-yellow-800 border-yellow-300
Conferido:      bg-blue-100 text-blue-800 border-blue-300
Uso e Consumo:  bg-gray-100 text-gray-600 border-gray-300
No Show:        bg-orange-100 text-orange-800 border-orange-300
Recusado:       bg-red-100 text-red-800 border-red-300
```

**Principios de Design:**
- Cards grandes com texto legivel
- Espacamento generoso
- Cores claras e distintas para status
- Interface limpa sem elementos desnecessarios

## Componentes Utilizados

Todos os componentes shadcn/ui ja estao disponiveis no projeto:
- Card, CardHeader, CardContent, CardTitle
- Button (variantes: default, outline, ghost, destructive)
- Badge (para status)
- Dialog (para modais)
- Select (para dropdowns)
- Table (para listas)
- Input, Label (para formularios)
- Switch (para ativar/desativar)
- Tabs (se necessario)
- Toast/Sonner (para feedback visual)

Biblioteca de graficos:
- Recharts (ja instalada) para BarChart, PieChart

## Fluxo de Navegacao

```text
┌─────────────────────────────────────────────────────────────┐
│                         HEADER                              │
│  [Logo]              [Perfil: Admin ▼] [Operacional]        │
├──────────────┬──────────────────────────────────────────────┤
│   SIDEBAR    │              CONTEUDO                        │
│              │                                              │
│ > Dashboard  │  ┌─────────────────────────────────────────┐ │
│   Agendamento│  │                                         │ │
│   Docas      │  │     Pagina Selecionada                  │ │
│   ---------- │  │                                         │ │
│   Fornecedor*│  │                                         │ │
│   Conferente*│  │                                         │ │
│              │  └─────────────────────────────────────────┘ │
│   *só Admin  │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

## Detalhes Tecnicos

**Gerenciamento de Estado:**
- React Context para perfil ativo
- useState local para dados mock (simula alteracoes visuais)
- Nenhuma persistencia - dados resetam ao recarregar

**Rotas (react-router-dom):**
```text
/              -> Dashboard
/agendamento   -> Agendamento
/docas         -> Docas
/fornecedores  -> Fornecedores (redireciona se Operacional)
/conferentes   -> Conferentes (redireciona se Operacional)
```

**Exportacao Simulada:**
- Botoes "Exportar Excel" e "Exportar PDF"
- Ao clicar: exibe toast "Exportacao simulada com sucesso!"
- Nenhum arquivo e gerado

## Resultado Esperado

Um prototipo visual que:
- Abre sem erros
- Permite navegacao fluida entre telas
- Demonstra o fluxo operacional completo
- Possui visual profissional e apresentavel
- Diferencia claramente os dois perfis
- Funciona completamente sem backend
- Serve para validacao com a gestao

## Ordem de Implementacao

1. Tipos e dados mock
2. Contexto de perfil
3. Layout (Header, Sidebar, Layout wrapper)
4. Atualizacao do App.tsx com rotas
5. Pagina Dashboard com indicadores e graficos
6. Pagina Agendamento com tabela e modal
7. Pagina Docas com cards e acoes
8. Pagina Fornecedores com CRUD visual
9. Pagina Conferentes com CRUD visual
10. Ajustes finais de estilo e responsividade
