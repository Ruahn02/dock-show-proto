

# Estabilizacao Completa -- Ajustes Frontend Restantes

## Contexto

A camada central de controle ja esta implementada:
- View `vw_carga_operacional` -- operacional no banco
- RPC `rpc_atualizar_fluxo_carga` -- operacional no banco
- Hook `useFluxoOperacional` -- operacional no frontend
- Limpeza de dados -- ja executada
- Dashboard -- ja zerado

O que resta sao **ajustes de interface** para exibir informacoes completas e corrigir inconsistencias visuais.

---

## Alteracoes Planejadas

### 1. Agenda (`src/pages/Agenda.tsx`)

**Adicionar colunas NF e Divergencia na tabela:**
- Nova coluna "NF(s)" entre Fornecedor e Vol. Previsto, exibindo `carga.nfs.join(', ')`
- Nova coluna "Divergencia" apos Rua, exibindo `carga.divergencia || '-'`

**Historico completo:** A tela ja possui seletor de data. Nenhuma alteracao necessaria -- o filtro por `hojeStr` ja funciona para qualquer data selecionada.

### 2. Patio em Docas (`src/pages/Docas.tsx`, linhas 535-676)

**Adicionar colunas informativas na tabela de Patio:**
- Coluna "NF(s)" -- buscando da carga vinculada (`cargaDaSenha?.nfs.join(', ')`)
- Coluna "Vol. Previsto" -- `cargaDaSenha?.volumePrevisto`
- Coluna "Rua" -- `cargaDaSenha?.rua || senha.rua`

Essas informacoes ja estao disponiveis nos dados, apenas nao sao exibidas.

### 3. Controle de Senhas (`src/pages/ControleSenhas.tsx`)

**Excluir senhas recusadas da lista ativa:**
- Alterar `getSenhasAtivas()` no `SenhaContext.tsx` para filtrar tambem `s.status !== 'recusado'`
- Isso garante que senhas recusadas nao aparecem como "aguardando doca"

### 4. Cross Docking (`src/pages/CrossDocking.tsx`)

**Adicionar filtro por data:**
- Adicionar seletor de data (Popover + Calendar) no header
- Filtrar `crossItems` pela data selecionada (padrao: hoje)
- Opcao "Todos" para ver historico completo

**Adicionar colunas de Conferente e Divergencia:**
- Na visao Admin: coluna "Conferente" (buscar nome pelo conferente_id da carga vinculada)
- Na visao Admin: coluna "Divergencia" (da carga vinculada)
- Na visao Operacional: coluna "Divergencia" e "Observacao" ja existem no fluxo de finalizacao

---

## Arquivos Modificados

| Arquivo | Alteracao |
|---------|-----------|
| `src/pages/Agenda.tsx` | +2 colunas (NF, Divergencia) |
| `src/pages/Docas.tsx` | +3 colunas no Patio (NF, Vol. Previsto, Rua) |
| `src/contexts/SenhaContext.tsx` | Filtrar recusados em `getSenhasAtivas` |
| `src/pages/CrossDocking.tsx` | Filtro por data + colunas Conferente/Divergencia |

## O que NAO muda

- Nenhuma tabela ou coluna no banco
- View e RPC permanecem intactas
- Layout geral e estilos visuais mantidos
- Hook `useFluxoOperacional` sem alteracoes
- Dashboard permanece com dados mock zerados

