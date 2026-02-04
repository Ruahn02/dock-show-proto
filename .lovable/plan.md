

# Plano - Correcao da Logica de Patio e Gerenciamento de Doca

## Resumo

Corrigir a logica de gerenciamento de docas e patio, removendo o conceito incorreto de "rua do patio" e adicionando a opcao de "Trocar de doca".

---

## 1. REMOVER CONCEITO DE RUA DO PATIO

### Problema Identificado
O sistema atualmente solicita "Rua do Patio" ao mover uma carga, mas PATIO e apenas um estado de localizacao, nao possui rua.

### Arquivos Afetados

**src/pages/Docas.tsx**
- Remover campo de input "Rua do Patio" do modal (linhas 635-641)
- Alterar modal para apenas confirmacao simples: "Mover carga para patio?"
- Remover validacao `!ruaPatio.trim()` do handleConfirmPatio
- Remover estado `ruaPatio` e `setRuaPatio`
- Remover coluna "Rua" da secao "Cargas em Patio" (linhas 544 e 557-559)

**src/pages/ControleSenhas.tsx**
- Remover campo "Rua do Patio" do modal de patio (linhas 352-359)
- Alterar para confirmacao simples
- Remover estado `ruaPatio`
- Remover exibicao de rua na coluna Local (linha 236-238): alterar para apenas "Patio"

**src/contexts/SenhaContext.tsx**
- Alterar funcao `moverParaPatio` para nao receber parametro `rua`
- Remover atribuicao de `rua` ao mover para patio
- Assinatura nova: `moverParaPatio(senhaId: string) => void`

**src/types/index.ts**
- Campo `rua` na interface Senha deve permanecer (usado para conferencia, nao patio)
- Nao alterar tipos

---

## 2. ADICIONAR OPCAO "TROCAR DE DOCA"

### Problema Identificado
O botao MapPin apenas abre modal de "Mover para Patio", mas deveria oferecer duas opcoes.

### Solucao

**src/pages/Docas.tsx**

Criar novo modal de gerenciamento com duas opcoes:
1. "Mover para Patio"
2. "Trocar de Doca"

Ao clicar no botao MapPin:
- Abrir modal com as duas opcoes (nao dropdown, um modal simples)

**Mover para Patio:**
- Modal de confirmacao: "Mover carga para patio?"
- Ao confirmar: doca = null, local = patio, manter demais dados

**Trocar de Doca:**
- Modal com lista de docas livres
- Ao confirmar: atualizar doca da carga, manter status atual

### Logica do Modal
```text
[Botao MapPin clicado]
         |
         v
+---------------------------+
|   GERENCIAR LOCALIZACAO   |
+---------------------------+
|                           |
|  [Mover para Patio]       |
|  [Trocar de Doca]         |
|                           |
|  [Cancelar]               |
+---------------------------+
```

---

## 3. ACOES PARA CARGA EM PATIO

### Problema Identificado
Cargas em patio so podem "Retomar para Doca", mas deveriam permitir conferencia e recusa.

### Solucao

**src/pages/Docas.tsx - Secao Cargas em Patio**

Adicionar acoes para cada carga em patio:
- Comecar Conferencia (abre DocaModal no modo 'entrar')
- Terminar Conferencia (se ja estiver conferindo)
- Recusar Carga

As acoes funcionam igual as de docas, porem sem vincular a uma doca fisica.

### Logica de Conferencia em Patio
- Conferencia em patio funciona igual a doca
- Nao precisa vincular a doca para conferir
- Apos conferir, carga continua visivel no Controle de Senhas

---

## 4. RESUMO DAS ALTERACOES

### Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| src/contexts/SenhaContext.tsx | Alterar moverParaPatio para nao receber rua |
| src/pages/Docas.tsx | Remover rua, adicionar modal de gerenciamento, acoes em patio |
| src/pages/ControleSenhas.tsx | Remover campo rua do modal |
| src/data/mockData.ts | Remover rua dos dados ficticios de senhas em patio |

### Nao Alterar
- Layout visual
- Design de telas
- Tipos existentes (exceto assinatura de funcao)
- Outras funcionalidades

---

## 5. DETALHES TECNICOS

### Alteracao no SenhaContext

```typescript
// ANTES
const moverParaPatio = useCallback((senhaId: string, rua: string) => {
  setSenhas(prev => prev.map(s => 
    s.id === senhaId 
      ? { ...s, localAtual: 'em_patio' as LocalSenha, rua, docaNumero: undefined } 
      : s
  ));
}, []);

// DEPOIS
const moverParaPatio = useCallback((senhaId: string) => {
  setSenhas(prev => prev.map(s => 
    s.id === senhaId 
      ? { ...s, localAtual: 'em_patio' as LocalSenha, docaNumero: undefined } 
      : s
  ));
}, []);
```

### Modal de Gerenciamento de Local (Docas.tsx)

Novo modal com opcoes:
- Titulo: "Gerenciar Localizacao"
- Opcao 1: Botao "Mover para Patio"
- Opcao 2: Botao "Trocar de Doca"
- Botao "Cancelar"

### Confirmacao de Mover para Patio

Modal simples de confirmacao:
- Titulo: "Mover para Patio"
- Texto: "Confirma mover esta carga para o patio?"
- Botoes: "Cancelar" | "Confirmar"

### Modal Trocar de Doca

Modal com select de docas livres:
- Titulo: "Trocar de Doca"
- Select: "Selecione a nova doca"
- Botoes: "Cancelar" | "Confirmar"

---

## 6. ACOES NA SECAO PATIO

### Colunas Atualizadas (sem Rua)
| Coluna | Descricao |
|--------|-----------|
| Senha | Numero da senha |
| Fornecedor | Nome do fornecedor |
| Motorista | Nome do motorista |
| Veiculo | Tipo do caminhao |
| Status | Status atual (aguardando/conferindo/conferido) |
| Acoes | Botoes de acao |

### Botoes de Acao por Status

**Se status = aguardando_doca ou em_doca:**
- Comecar Conferencia
- Recusar Carga
- Retomar para Doca

**Se status = conferindo:**
- Terminar Conferencia
- Recusar Carga
- Retomar para Doca

**Se status = conferido:**
- Retomar para Doca (para vincular a outra doca)

---

## 7. DADOS FICTICIOS

### Atualizar senha em patio (s4)

```typescript
// ANTES
{ id: 's4', ..., rua: 'B-12', liberada: false }

// DEPOIS
{ id: 's4', ..., liberada: false }
// Sem campo rua
```

---

## 8. ORDEM DE IMPLEMENTACAO

1. Alterar SenhaContext.tsx (remover rua do moverParaPatio)
2. Atualizar dados ficticios (remover rua de senha em patio)
3. Alterar Docas.tsx:
   - Remover campo rua do modal
   - Adicionar modal de gerenciamento com opcoes
   - Adicionar modal de trocar doca
   - Adicionar acoes na secao patio
   - Remover coluna rua da secao patio
4. Alterar ControleSenhas.tsx:
   - Remover campo rua do modal
   - Alterar exibicao de local para "Patio" sem rua

---

## 9. RESTRICOES RESPEITADAS

- Nenhuma tela nova criada
- Nenhum layout alterado
- Nenhum campo desnecessario adicionado
- Apenas correcao de comportamento
- Patio e apenas estado de localizacao
- Nada some automaticamente
- Toda acao exige confirmacao

