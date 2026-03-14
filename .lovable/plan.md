

# Correção de Divergências, Cross Docking e Agenda

## Resumo dos 4 problemas e correções

### PROBLEMA 1 — Agenda não exibe divergências estruturadas

**Atual:** Linha 305 de `Agenda.tsx` lê `carga.divergencia` (campo texto antigo). Linha 162 no mapeamento PDF/Excel também usa `carga.divergencia`.

**Correção:**
- Importar `useDivergenciasDB` na Agenda
- Substituir a coluna única "Divergência" por duas colunas: "Div. Receb." e "Div. Cross"
- Usar `getDivergenciasRecebimento(carga.id)` e `getDivergenciasCross` (buscar cross_id pela carga)
- CSS: `whitespace-pre-line break-words` nas células
- Atualizar exports PDF/Excel para incluir as duas colunas

---

### PROBLEMA 2 — Cross não é criado quando volume < previsto

**Atual:** Em `Docas.tsx` linha 273: `deveCriarCross = totalVolume >= carga.volumePrevisto`. Só cria cross quando o volume total atinge o previsto.

**Correção:**
- Mudar a lógica: criar cross **sempre que a carga atingir status `conferido`** (ou seja, quando o RPC decide que a carga está conferida)
- Na prática, como a RPC determina isso internamente, a abordagem mais simples é: **sempre criar o cross após finalizar conferência**, desde que não exista um cross para essa carga
- Alterar a condição de `totalVolume >= carga.volumePrevisto` para `true` (sempre tentar criar)
- O `volumeRecebido` do cross será o `totalVolume` real (soma das senhas)
- A proteção contra duplicatas já existe (catch no unique constraint)

Também precisa cobrir o caso do **"Finalizar Entrega"** na Agenda (admin finaliza manualmente via `rpc_finalizar_entrega`):
- Após chamar `finalizarEntrega()`, verificar se já existe cross para a carga; se não, criar com o volume total das senhas conferidas

---

### PROBLEMA 3 — Cross não pergunta sobre divergência na separação

**Atual:** O `FinalizarSeparacaoModal` em `SeparacaoModal.tsx` já tem o `DivergenciasForm` integrado. Verificando o código, ele **já está implementado** com o toggle "Teve divergência?" e o formulário dinâmico. O `CrossDocking.tsx` já salva as divergências em `handleFinalizarConfirm`.

**Status:** Já implementado. Vou verificar se está funcionando corretamente.

---

### PROBLEMA 4 — Divergências no Cross Docking lado a lado

**Atual:** Já implementado em `CrossDocking.tsx` linhas 232-253 com colunas "Div. Receb." e "Div. Cross" usando `getDivergenciasRecebimento` e `getDivergenciasCross`.

**Status:** Já implementado.

---

## Alterações necessárias

### 1. `src/pages/Agenda.tsx`
- Importar `useDivergenciasDB`
- Substituir coluna "Divergência" por "Div. Receb." e "Div. Cross"
- Buscar divergências via hook em vez de `carga.divergencia`
- Aplicar CSS multi-linha nas células
- Atualizar `mapCargaParaLinha` e exports (PDF/Excel) para as duas colunas
- Para "Div. Cross": precisar buscar o cross_id associado à carga (via `useCross` ou passando carga_id para `getDivergenciasRecebimento`)

### 2. `src/pages/Docas.tsx`
- Remover condição `totalVolume >= carga.volumePrevisto` para criação do cross
- Sempre tentar criar cross ao finalizar conferência (a proteção contra duplicatas já existe)
- O volume será o real (`totalVolume` das senhas)

### 3. `src/pages/Agenda.tsx` (Finalizar Entrega)
- Após `finalizarEntrega()`, criar cross se não existir ainda
- Importar `useCross` para acessar `criarCross` e `crossItems`
- Calcular volume das senhas conferidas

### 4. `src/hooks/useDivergenciasDB.ts`
- Adicionar helper para buscar divergências de cross por `carga_id` (não só por `cross_id`), útil para a Agenda que não tem o cross_id diretamente

