
# Plano - Correcao de Falhas Funcionais e Dados Ficticios

## Resumo

Este plano corrige tres problemas especificos:
1. Campo de e-mail faltante na Solicitacao de Entrega
2. Botao de Mover para Patio que nao executa acao corretamente
3. Dados ficticios desatualizados e inconsistentes

---

## 1. ADICIONAR CAMPO DE E-MAIL NA SOLICITACAO

### Problema Identificado
A tela de Solicitacao de Entrega nao possui campo de e-mail, impossibilitando contato com o fornecedor.

### Alteracoes Necessarias

**Arquivo: src/types/index.ts**
- Adicionar campo `emailContato: string` na interface `SolicitacaoEntrega`

**Arquivo: src/pages/SolicitacaoEntrega.tsx**
- Adicionar estado `email`
- Adicionar campo de input para e-mail (obrigatorio)
- Incluir validacao simples (campo nao vazio)
- Resetar campo no formulario

**Arquivo: src/pages/Solicitacoes.tsx (Admin)**
- Exibir e-mail na tabela
- Exibir e-mail no modal de aprovacao

**Arquivo: src/contexts/SolicitacaoContext.tsx**
- Atualizar mock data inicial com e-mails

---

## 2. CORRIGIR ACAO MOVER PARA PATIO

### Problema Identificado
O botao de mover para patio (icone MapPin) existe mas nao executa acao porque a funcao `handleOpenPatio` exige que a carga tenha `senhaId`. Se nao houver senha vinculada, nada acontece.

### Causa Raiz
```typescript
const handleOpenPatio = (doca: Doca) => {
  const carga = getCarga(doca.cargaId);
  if (carga?.senhaId) {  // <-- So abre se tiver senhaId
    // ...
  }
};
```

### Correcao Necessaria

**Arquivo: src/pages/Docas.tsx**

1. Modificar `handleOpenPatio` para funcionar mesmo sem senhaId
2. Se houver senhaId: mover senha para patio
3. Se nao houver senhaId: apenas liberar a doca (remover carga)
4. Em ambos os casos: abrir modal para confirmar e informar rua

O modal deve:
- Abrir sempre que houver carga na doca
- Pedir confirmacao
- Solicitar rua do patio
- Executar a acao apropriada

### Logica Corrigida
```text
Ao clicar em Mover para Patio:
  1. Abrir modal
  2. Solicitar rua
  3. Ao confirmar:
     - Se carga tem senhaId: mover senha para patio
     - Sempre: liberar a doca
  4. Carga aparece na secao "Cargas em Patio"
```

---

## 3. RECRIAR DADOS FICTICIOS

### Problema Identificado
Os dados atuais estao desconectados e nao permitem testes completos do sistema.

### Arquivos a Modificar

**Arquivo: src/data/mockData.ts**

Adicionar campo `email` na interface Fornecedor (apenas dados, nao tipo):

| ID | Nome | Email | Ativo |
|----|------|-------|-------|
| f1 | Distribuidora ABC Ltda | contato@abc.com.br | true |
| f2 | Atacado Nacional S.A. | logistica@atacadonacional.com | true |
| f3 | Logistica Express | agendamento@logexpress.com | true |
| f4 | Fornecedor Master | entregas@master.com.br | true |
| f5 | Central de Cargas | operacoes@centralcargas.com | true |
| f6 | Transporte Rapido | atendimento@transporterapido.com | true |
| f7 | Distribuidora Sul | contato@distsul.com.br | false |
| f8 | Mega Atacado | agendamento@megaatacado.com | true |

**Arquivo: src/types/index.ts**
Adicionar campo opcional `email?: string` na interface Fornecedor

**Arquivo: src/contexts/SenhaContext.tsx**
Adicionar senhas iniciais para permitir testes:

| Senha | Fornecedor | Motorista | Veiculo | Status | Local |
|-------|------------|-----------|---------|--------|-------|
| 0001 | f1 | Carlos Pereira | Truck | em_doca | em_doca (Doca 2) |
| 0002 | f3 | Roberto Mendes | Carreta | conferindo | em_doca (Doca 6) |
| 0003 | f5 | Antonio Lima | Bi-Truck | aguardando_doca | aguardando_doca |
| 0004 | f2 | Jose Santos | Van | em_patio | em_patio (Rua B-12) |

**Arquivo: src/data/mockData.ts - Docas**
Atualizar docas para refletir cenarios reais:

| Doca | Status | Carga | Senha |
|------|--------|-------|-------|
| 1 | livre | - | - |
| 2 | ocupada | cg_d2 | s1 |
| 3 | livre | - | - |
| 4 | uso_consumo | - | - |
| 5 | livre | - | - |
| 6 | em_conferencia | cg_d6 | s2 |

**Arquivo: src/data/mockData.ts - Cargas**
Criar cargas vinculadas a senhas:

| ID | Data | Fornecedor | NFs | Vol. Prev | Status | SenhaId |
|----|------|------------|-----|-----------|--------|---------|
| cg_d2 | 2026-02-04 | f1 | NF-101 | 150 | aguardando_chegada | s1 |
| cg_d6 | 2026-02-04 | f3 | NF-102,NF-103 | 280 | em_conferencia | s2 |
| cg_ag1 | 2026-02-04 | f5 | NF-104 | 95 | aguardando_chegada | s3 |
| cg_patio | 2026-02-04 | f2 | NF-105 | 120 | aguardando_chegada | s4 |
| cg1 | 2026-02-04 | f4 | NF-001 | 180 | conferido | - |
| cg2 | 2026-02-04 | f6 | NF-002 | 220 | conferido | - |
| cg3 | 2026-02-04 | f8 | NF-003 | 75 | no_show | - |

**Arquivo: src/contexts/SolicitacaoContext.tsx**
Atualizar solicitacoes iniciais com e-mail:

| ID | Fornecedor | Email | Tipo | Qtd | Volume | Status |
|----|------------|-------|------|-----|--------|--------|
| sol1 | f1 | contato@abc.com.br | truck | 1 | 180 | pendente |
| sol2 | f3 | agendamento@logexpress.com | carreta | 2 | 350 | pendente |
| sol3 | f8 | agendamento@megaatacado.com | bi_truck | 1 | 200 | pendente |

---

## 4. RESUMO DAS ALTERACOES

### Arquivos a Modificar
| Arquivo | Alteracao |
|---------|-----------|
| src/types/index.ts | Adicionar emailContato em SolicitacaoEntrega, email em Fornecedor |
| src/pages/SolicitacaoEntrega.tsx | Adicionar campo e-mail |
| src/pages/Solicitacoes.tsx | Exibir e-mail na tabela e modal |
| src/pages/Docas.tsx | Corrigir handleOpenPatio para funcionar sem senhaId |
| src/data/mockData.ts | Adicionar emails aos fornecedores, atualizar docas e cargas |
| src/contexts/SenhaContext.tsx | Adicionar senhas iniciais com cenarios de teste |
| src/contexts/SolicitacaoContext.tsx | Adicionar e-mail nas solicitacoes iniciais |

### Nenhum Arquivo Novo Sera Criado

### Nenhuma Tela Nova Sera Criada

### Nenhum Banco de Dados Sera Criado

---

## 5. CENARIOS DE TESTE HABILITADOS

Apos as correcoes, sera possivel testar:

1. **Solicitacao de Entrega**
   - Preencher formulario com e-mail
   - Ver e-mail na tela de aprovacao do admin

2. **Docas - Mover para Patio**
   - Doca 2 (ocupada): clicar MapPin, informar rua, confirmar
   - Carga move para secao "Cargas em Patio"

3. **Controle de Senhas**
   - 4 senhas ja disponiveis para teste
   - Senha em patio (Jose Santos) para testar retomar
   - Senhas em doca para testar mover para patio

4. **Fluxo Completo**
   - Senha 0003 aguardando doca - vincular
   - Senha 0001 em doca - mover para patio
   - Senha 0004 em patio - retomar para doca

---

## 6. ORDEM DE IMPLEMENTACAO

1. Alterar tipos (email em SolicitacaoEntrega e Fornecedor)
2. Atualizar mockData com fornecedores com email
3. Atualizar SenhaContext com senhas e cargas iniciais
4. Atualizar SolicitacaoContext com e-mails
5. Atualizar SolicitacaoEntrega.tsx (campo email)
6. Atualizar Solicitacoes.tsx (exibir email)
7. Corrigir Docas.tsx (handleOpenPatio)
8. Testar cenarios

---

## 7. RESTRICOES RESPEITADAS

- Nenhuma tela nova criada
- Nenhum layout alterado
- Nenhum banco de dados criado
- Nenhuma funcionalidade nova alem do solicitado
- Apenas correcoes e complementos operacionais
