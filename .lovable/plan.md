
# Correcao Estrutural de Status e Permanencia de Cargas

## Problemas Identificados

### 1. `getCargasDisponiveis()` filtra por data atual
Em `SenhaContext.tsx` linha 142, o filtro exige `c.data === hoje`. Isso causa:
- Cargas de dias anteriores que chegaram (`chegou=true`) mas nunca foram vinculadas a uma doca desaparecem da lista de cargas disponiveis no dia seguinte
- O modal "Associar Carga" na tela Docas nao mostra essas cargas

### 2. `handleAssociarCarga` em Docas.tsx incompleto
Quando o usuario vincula uma carga a uma doca pela tela Docas (linha 135-143):
- NAO define `senhaId` na doca
- NAO atualiza o status da carga para `aguardando_conferencia`
- Resultado: doca fica `ocupada` mas carga permanece como `aguardando_chegada`

### 3. `vincularCargaADoca` no SenhaContext incompleto
A funcao (linha 114-123) so atualiza a senha. NAO atualiza o status da carga para `aguardando_conferencia`. Isso cria inconsistencia quando a vinculacao e feita pela tela Docas.

### 4. `fornecedoresAgendados` em SenhaCaminhoneiro.tsx filtra por data
Linha 40-42: filtra fornecedores por cargas do dia. Isso e correto para gerar senhas (so fornecedores com entrega agendada para hoje). NAO sera alterado.

### 5. AssociarCargaModal falta estilo para `aguardando_conferencia`
O objeto `statusStyles` (linha 22-25) nao tem entrada para `aguardando_conferencia`.

---

## Correcoes

### Correcao 1: Remover filtro de data em `getCargasDisponiveis()`

**Arquivo:** `src/contexts/SenhaContext.tsx`

Alterar `getCargasDisponiveis()` para nao filtrar por data. O criterio correto e:
- `status === 'aguardando_chegada'` (ainda nao vinculada a doca)
- `chegou === true` (motorista ja chegou)

Isso garante que cargas de qualquer data que chegaram mas nao foram vinculadas continuem disponiveis.

### Correcao 2: Completar `handleAssociarCarga` em Docas.tsx

**Arquivo:** `src/pages/Docas.tsx`

Ao associar carga a doca:
- Localizar a senha vinculada a carga (`carga.senhaId`)
- Definir `senhaId` na doca junto com `status: 'ocupada'` e `cargaId`
- Atualizar o status da carga para `aguardando_conferencia`
- Chamar `vincularCargaADoca` para atualizar a senha

### Correcao 3: Atualizar `vincularCargaADoca` no SenhaContext

**Arquivo:** `src/contexts/SenhaContext.tsx`

Alem de atualizar a senha, tambem atualizar o status da carga para `aguardando_conferencia` usando `atualizarCargaDB`.

### Correcao 4: Adicionar estilo faltante no AssociarCargaModal

**Arquivo:** `src/components/docas/AssociarCargaModal.tsx`

Adicionar `aguardando_conferencia` ao objeto `statusStyles`.

---

## Resumo de arquivos

| Arquivo | Alteracao |
|---------|-----------|
| `src/contexts/SenhaContext.tsx` | Remover filtro de data em `getCargasDisponiveis()` + atualizar cargo em `vincularCargaADoca()` |
| `src/pages/Docas.tsx` | Completar `handleAssociarCarga` com senhaId na doca e status da carga |
| `src/components/docas/AssociarCargaModal.tsx` | Adicionar estilo para `aguardando_conferencia` |

## O que NAO sera alterado

- Telas, layouts, componentes visuais
- Dashboard (mock)
- Autenticacao
- RLS, Realtime
- Estrutura de tabelas
- Nomes de status
- Nenhuma funcionalidade nova
