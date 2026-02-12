

# Estabilizacao do Sistema - Status Unificado e Recusa Consistente

## Problemas Identificados

### 1. Status duplicado "conferindo" vs "em_conferencia"
- `cargas.status` usa `em_conferencia`
- `senhas.status` usa `conferindo` (diferente!)
- Isso causa confusao visual e quebra filtros entre telas
- Locais afetados: Docas.tsx (linhas 320, 324, 594, 601, 609, 632), ControleSenhas.tsx (linha 81, 323), PainelSenhas.tsx (linha 9), SenhaCaminhoneiro.tsx (linha 99), mockData.ts (linha 182), types/index.ts

### 2. Recusa pela tela Docas nao passa senhaId
- `handleRecusarCarga` em Docas.tsx so passa `cargaId` -- se a carga no banco nao tiver `senha_id` preenchido (senha orfa vinculada direto a doca), a senha nao sera atualizada

### 3. Recusa pela tela Docas para docas virtuais (patio)
- Quando recusa do patio, `docaToRecusar` tem id `patio_xxx` que nao existe no banco, entao a query de limpeza de doca nao encontra nada

### 4. Doca mostrando dados do fornecedor depende de `getCarga()`
- Se a doca tem `senhaId` mas nao tem `cargaId`, o fornecedor mostra "-". Precisa fallback para buscar fornecedor via senha

### 5. Recusa via Agenda nao passa senhaId
- Linha 73: `recusarCarga(cargaToUpdate.id)` -- funciona parcialmente pois busca `senha_id` da carga no banco, mas se a carga nao tiver senha vinculada, a doca fica presa

---

## Correcoes

### Arquivo 1: `src/types/index.ts`
- Remover `'conferindo'` do tipo `StatusSenha`
- Adicionar `'em_conferencia'` no lugar
- Resultado: `StatusSenha` fica alinhado com `StatusCarga`

### Arquivo 2: `src/data/mockData.ts`
- Trocar label de `conferindo: 'Conferindo'` para `em_conferencia: 'Em Conferencia'` em `statusSenhaLabels`
- Trocar `conferindo` para `em_conferencia` em `statusPainelMap` equivalente

### Arquivo 3: `src/pages/Docas.tsx`
- Linha 320/324: trocar `'conferindo'` por `'em_conferencia'` ao iniciar conferencia
- Linha 191: passar `docaToRecusar.senhaId` como segundo parametro de `recusarCarga`
- Linha 416-417: adicionar fallback -- se nao tem `cargaId` mas tem `senhaId`, buscar fornecedor via senha
- Linhas 594, 601, 609, 632: trocar todas as referencias a `'conferindo'` por `'em_conferencia'`

### Arquivo 4: `src/pages/ControleSenhas.tsx`
- Linha 81: trocar `case 'conferindo'` por `case 'em_conferencia'`
- Linha 323: trocar filtro `conferindo` por `em_conferencia`

### Arquivo 5: `src/pages/PainelSenhas.tsx`
- Linha 9: trocar chave `conferindo` por `em_conferencia` no mapa de status

### Arquivo 6: `src/pages/SenhaCaminhoneiro.tsx`
- Linha 99: trocar `case 'conferindo'` por `case 'em_conferencia'`

### Arquivo 7: `src/contexts/SenhaContext.tsx`
- Nenhuma alteracao necessaria -- `recusarCarga` ja usa chamadas diretas ao Supabase

### Arquivo 8: `src/pages/Agenda.tsx`
- Linha 73: passar `cargaToUpdate.senhaId` como segundo parametro de `recusarCarga` para garantir que a senha e atualizada mesmo se o banco estiver dessincronizado

---

## Resumo visual das mudancas

| Arquivo | O que muda |
|---------|-----------|
| types/index.ts | `conferindo` vira `em_conferencia` no StatusSenha |
| mockData.ts | Labels atualizados para `em_conferencia` |
| Docas.tsx | Status unificado + recusa passa senhaId + fallback fornecedor via senha |
| ControleSenhas.tsx | Filtro e badge trocam `conferindo` por `em_conferencia` |
| PainelSenhas.tsx | Mapa de status atualizado |
| SenhaCaminhoneiro.tsx | Switch case atualizado |
| Agenda.tsx | recusarCarga passa senhaId |

## O que NAO sera alterado
- Estrutura de tabelas no Supabase
- Layout visual
- RLS policies
- Dashboard
- Fluxo de Cross Docking

