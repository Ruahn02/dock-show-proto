
# Ajustes Operacionais e Interface

## 1. Remover campo "Observacoes" na Solicitacao de Entrega

**Arquivo:** `src/pages/SolicitacaoEntrega.tsx`

- Remover o state `observacoes` e `setObservacoes`
- Remover o campo `<Textarea>` de observacoes do formulario (linhas 142-145)
- Remover `observacoes` do `resetForm`
- Remover `observacoes` do `handleSubmit` (na chamada `criarSolicitacao`)

## 2. Coluna "Rua" na tabela principal de Docas

**Arquivo:** `src/pages/Docas.tsx`

A tabela principal de docas (linhas 376-532) ja tem NF(s) e Vol. Previsto mas nao exibe a Rua do conferente.

- Adicionar `<TableHead>Rua</TableHead>` no header da tabela de docas
- Adicionar celula com `{carga?.rua || (senha ? senha.rua : undefined) || '-'}` usando dados ja disponiveis (carga e senha ja sao buscados no mesmo `.map`)

## 3. Dashboard em tempo real

**Arquivo:** `src/pages/Dashboard.tsx`

Substituir o consumo de dados mock por dados reais da view `vw_carga_operacional` e da tabela `docas`.

- Importar `useFluxoOperacional` e `useDocasDB` e `useCrossDB`
- Calcular indicadores dinamicamente via `useMemo`:
  - `totalVolumes` = soma de `volume_conferido` das cargas conferidas (filtradas por periodo)
  - `cargasConferidas` = contagem de cargas com status `conferido`
  - `cargasNoShow` = contagem com status `no_show`
  - `cargasRecusadas` = contagem com status `recusado`
  - `docasLivres/Ocupadas/EmConferencia` = contagem direta da tabela `docas` por status (sem filtro de data, pois reflete estado atual)
  - `totalCross/crossFinalizados/crossEmSeparacao` = contagem da tabela `cross_docking` filtrada por data
- Para produtividade: agrupar cargas conferidas por `conferente_id`, buscar nome do conferente, somar volumes
- Para status chart: contar cargas por status e montar array `StatusCargaChart`
- Filtro por data:
  - "Hoje"/"Outro dia": filtra `data_agendada === dataSelecionada`
  - "Semana": filtra por semana da data selecionada (usando `startOfWeek`/`endOfWeek` do date-fns)
  - "Mes": filtra por mes/ano
  - "Intervalo": filtra entre `dataInicio` e `dataFim`
- Remover imports de `dashboardPorPeriodo`, `produtividadeConferentes`, `statusCargasChart` do mockData
- Realtime ja vem automaticamente via `useFluxoOperacional` (escuta cargas, senhas, docas)

## 4. Sincronizacao de status: Agenda vs Controle de Senhas

**Problema identificado:** Quando o motorista gera a senha em `SenhaCaminhoneiro.tsx`, a funcao `marcarChegada` (linha 71) apenas faz `chegou: true` e `senhaId`, mas NAO altera o `status` da carga. A carga permanece em `aguardando_chegada` na Agenda, enquanto a senha ja aparece como `aguardando_doca` no Controle de Senhas.

**Solucao:**

**Arquivo:** `src/contexts/SenhaContext.tsx` -- funcao `marcarChegada`

Alterar de:
```typescript
await atualizarCargaDB(cargaId, { chegou: true, senhaId });
```
Para:
```typescript
await atualizarCargaDB(cargaId, { 
  chegou: true, 
  senhaId, 
  status: 'aguardando_conferencia' 
});
```

Isso garante que ao gerar a senha (chegada do motorista), a carga muda para `aguardando_conferencia` na Agenda, ficando consistente com o status `aguardando_doca` da senha no Controle de Senhas. Ambos indicam que o caminhao chegou e aguarda ser direcionado a uma doca.

Nenhuma alteracao na RPC ou na view e necessaria -- o problema era exclusivamente no frontend.

---

## Resumo dos arquivos modificados

| Arquivo | Alteracao |
|---------|-----------|
| `src/pages/SolicitacaoEntrega.tsx` | Remover campo Observacoes |
| `src/pages/Docas.tsx` | Adicionar coluna Rua na tabela de docas |
| `src/pages/Dashboard.tsx` | Consumir dados reais via hooks (tempo real) |
| `src/contexts/SenhaContext.tsx` | Alterar `marcarChegada` para sincronizar status |

## O que NAO muda

- Nenhuma tabela ou coluna no banco de dados
- View `vw_carga_operacional` e RPC `rpc_atualizar_fluxo_carga` permanecem intactas
- Layout visual geral mantido
- Fluxos de vinculacao, patio, cross docking inalterados
