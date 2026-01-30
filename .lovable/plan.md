

# Plano - Sistema de Cross Docking

## Resumo do Objetivo

Criar um fluxo de Cross Docking integrado a conferencia de docas, onde cargas conferidas aparecem automaticamente para decisao administrativa (Armazenar ou Cross), e depois sao processadas pelo operacional (separacao).

---

## 1. NOVO TIPO: Cross

### Interface CrossDocking
```typescript
export type StatusCross = 
  | 'aguardando_decisao'   // Admin ainda nao decidiu
  | 'aguardando_separacao' // Admin marcou CROSS MONTADO
  | 'em_separacao'         // Operacional iniciou separacao
  | 'finalizado';          // Separacao concluida

export interface CrossDocking {
  id: string;
  cargaId: string;
  fornecedorId: string;
  nfs: string[];
  data: string;
  rua: string;
  volumeRecebido: number;
  status: StatusCross;
  numeroCross?: string;        // Preenchido ao montar
  separadorId?: string;        // Preenchido ao iniciar separacao
  temDivergencia?: boolean;    // Preenchido ao finalizar
  observacao?: string;         // Preenchido ao finalizar
}
```

### Arquivo a Modificar
- `src/types/index.ts`

---

## 2. NOVO CONTEXTO: CrossContext

### Funcionalidades
O contexto gerencia o estado das cargas cross:

| Funcao | Descricao |
|--------|-----------|
| `crossItems` | Lista de cargas aguardando decisao ou em processo |
| `adicionarCross(carga)` | Adiciona carga quando conferencia finaliza |
| `armazenarCarga(id)` | Remove da lista (nao e cross) |
| `confirmarCross(id)` | Marca como cross (aguardando numero) |
| `montarCross(id, numero)` | Define numero e libera para operacional |
| `iniciarSeparacao(id, separadorId)` | Operacional inicia separacao |
| `finalizarSeparacao(id, divergencia, obs)` | Finaliza processo |
| `getCrossParaAdmin()` | Retorna items aguardando_decisao |
| `getCrossParaOperacional()` | Retorna items aguardando_separacao ou em_separacao |

### Arquivo a Criar
- `src/contexts/CrossContext.tsx`

---

## 3. NOVA TELA: Cross Docking

### Comportamento por Perfil

**ADMINISTRADOR:**
- Ve cargas com status: `aguardando_decisao`
- Pode ver historico de cargas em processo
- Acoes: ARMAZENAR, CROSS, CROSS MONTADO

**OPERACIONAL:**
- Ve APENAS cargas com status: `aguardando_separacao` ou `em_separacao`
- Acoes: COMECAR SEPARACAO, FINALIZAR SEPARACAO

### Arquivo a Criar
- `src/pages/CrossDocking.tsx`

---

## 4. LAYOUT: VISAO ADMIN

### Tabela de Cargas Aguardando Decisao
```text
+----------+-----------------+----------+-------+--------+--------------+---------------------------+
| Data     | Fornecedor      | NF(s)    | Rua   | Volume | Status       | Acoes                     |
+----------+-----------------+----------+-------+--------+--------------+---------------------------+
| 24/01/26 | ABC Ltda        | NF-001   | A-15  | 148    | Aguardando   | [ARMAZENAR] [CROSS]       |
| 24/01/26 | Nacional SA     | NF-003   | B-08  | 80     | Cross        | [CROSS MONTADO]           |
| 24/01/26 | Express         | NF-007   | C-22  | 195    | Aguard. Sep. | (sem acoes - operacional) |
+----------+-----------------+----------+-------+--------+--------------+---------------------------+
```

### Fluxo de Status (Admin)
```text
AGUARDANDO DECISAO
      |
      +-- [ARMAZENAR] --> Remove da lista
      |
      +-- [CROSS] --> Status: "Cross" (botoes mudam)
                          |
                          +-- [CROSS MONTADO] --> Modal: Numero do Cross
                                                      |
                                                      v
                                              Status: AGUARDANDO SEPARACAO
                                              (aparece para operacional)
```

---

## 5. LAYOUT: VISAO OPERACIONAL

### Tabela de Cargas para Separacao
```text
+-----------------+-------+---------+--------+--------------+---------------------------+
| Fornecedor      | Rua   | Cross # | Volume | Status       | Acoes                     |
+-----------------+-------+---------+--------+--------------+---------------------------+
| ABC Ltda        | A-15  | 001     | 148    | Aguard. Sep. | [COMECAR SEPARACAO]       |
| Nacional SA     | B-08  | 002     | 80     | Em Separacao | [FINALIZAR SEPARACAO]     |
+-----------------+-------+---------+--------+--------------+---------------------------+
```

### Fluxo de Status (Operacional)
```text
AGUARDANDO SEPARACAO
        |
        +-- [COMECAR SEPARACAO] --> Modal: Selecionar Separador
                                        |
                                        v
                                 Status: EM SEPARACAO
                                        |
        +-- [FINALIZAR SEPARACAO] --> Modal: Divergencia? Observacao?
                                        |
                                        v
                                 Status: FINALIZADO
                                 (some da lista)
```

---

## 6. INTEGRACAO COM DOCAS

### Modificacao no Fluxo de Finalizacao
Quando a conferencia e finalizada na doca (handleModalConfirm, mode === 'finalizar'):

1. A doca e liberada (comportamento atual)
2. A carga e atualizada como conferida (comportamento atual)
3. **NOVO:** A carga e adicionada automaticamente a lista de Cross

### Dados Passados para Cross
| Campo | Origem |
|-------|--------|
| cargaId | selectedDoca.cargaId |
| fornecedorId | carga.fornecedorId |
| nfs | carga.nfs |
| data | carga.data |
| rua | doca.rua ou data.rua |
| volumeRecebido | data.volume |

### Arquivo a Modificar
- `src/pages/Docas.tsx`

---

## 7. MODAIS DO CROSS

### Modal 1: Montar Cross (Admin)
```text
+----------------------------------+
|      MONTAR CROSS                |
+----------------------------------+
|                                  |
|  Numero do Cross *               |
|  +----------------------------+  |
|  | [    ]                     |  |
|  +----------------------------+  |
|                                  |
|  [CANCELAR]  [MONTAR CROSS]      |
+----------------------------------+
```

### Modal 2: Iniciar Separacao (Operacional)
```text
+----------------------------------+
|    COMECAR SEPARACAO             |
+----------------------------------+
|                                  |
|  Separador *                     |
|  +----------------------------+  |
|  | [v] Selecione              |  |
|  +----------------------------+  |
|                                  |
|  [CANCELAR]  [INICIAR]           |
+----------------------------------+
```

### Modal 3: Finalizar Separacao (Operacional)
```text
+----------------------------------+
|    FINALIZAR SEPARACAO           |
+----------------------------------+
|                                  |
|  Houve divergencia?              |
|  [  ] Sim   [  ] Nao             |
|                                  |
|  Observacao (opcional)           |
|  +----------------------------+  |
|  |                            |  |
|  +----------------------------+  |
|                                  |
|  [CANCELAR]  [FINALIZAR]         |
+----------------------------------+
```

### Arquivos a Criar
- `src/components/cross/MontarCrossModal.tsx`
- `src/components/cross/SeparacaoModal.tsx`

---

## 8. MENU LATERAL

### Nova Posicao
Adicionar "Cross Docking" logo abaixo de "Docas":

| Posicao | Rota | Label | adminOnly |
|---------|------|-------|-----------|
| 1 | / | Dashboard | true |
| 2 | /agendamento | Agendamento | true |
| 3 | /docas | Docas | false |
| 4 | /cross | Cross Docking | false |
| 5 | /senhas | Controle de Senhas | true |
| 6 | /fornecedores | Fornecedores | true |
| 7 | /conferentes | Conferentes | true |

### Icone
Usar icone `ArrowRightLeft` do lucide-react (representa troca/cross).

### Arquivo a Modificar
- `src/components/layout/Sidebar.tsx`

---

## 9. ROTEAMENTO

### Nova Rota
- `/cross` - Acessivel por Admin e Operacional

### Arquivo a Modificar
- `src/App.tsx`

---

## 10. NOVO TIPO: Separador

Como separadores sao diferentes de conferentes, criar lista de separadores:

### Opcao 1: Reutilizar Conferentes
Usar a mesma lista de conferentes como separadores (simplificacao para prototipo).

### Opcao 2: Lista Separada
Criar `src/data/mockData.ts` com lista de separadores.

**Recomendacao:** Usar Opcao 1 para manter simplicidade do prototipo.

---

## 11. RESUMO DOS ARQUIVOS

### Arquivos a Criar
| Arquivo | Descricao |
|---------|-----------|
| `src/types/index.ts` | Adicionar StatusCross e interface CrossDocking |
| `src/contexts/CrossContext.tsx` | Contexto de gerenciamento do cross |
| `src/pages/CrossDocking.tsx` | Tela principal do cross docking |
| `src/components/cross/MontarCrossModal.tsx` | Modal para definir numero do cross |
| `src/components/cross/SeparacaoModal.tsx` | Modal para iniciar/finalizar separacao |

### Arquivos a Modificar
| Arquivo | Alteracao |
|---------|-----------|
| `src/components/layout/Sidebar.tsx` | Adicionar item Cross Docking |
| `src/App.tsx` | Adicionar rota /cross e CrossProvider |
| `src/pages/Docas.tsx` | Chamar adicionarCross ao finalizar conferencia |

---

## 12. STATUS E CORES

### Badges de Status
| Status | Texto | Cor |
|--------|-------|-----|
| aguardando_decisao | Aguardando Decisao | Amarelo |
| cross_confirmado | Cross | Azul |
| aguardando_separacao | Aguardando Separacao | Azul |
| em_separacao | Em Separacao | Verde |
| finalizado | Finalizado | Cinza |

---

## 13. CONFIRMACOES

### Dialogs de Confirmacao
1. **ARMAZENAR:** "Confirmar que esta carga sera ARMAZENADA?"
2. **CROSS:** "Confirmar que esta carga e CROSS?"

Ambos com botoes [Cancelar] e [Confirmar].

---

## 14. ORDEM DE IMPLEMENTACAO

1. Adicionar tipos em `src/types/index.ts`
2. Criar `src/contexts/CrossContext.tsx`
3. Criar modais em `src/components/cross/`
4. Criar pagina `src/pages/CrossDocking.tsx`
5. Atualizar `src/App.tsx` (rota + provider)
6. Atualizar `src/components/layout/Sidebar.tsx`
7. Atualizar `src/pages/Docas.tsx` para integrar com cross
8. Testar fluxo completo

---

## 15. FLUXO VISUAL COMPLETO

### Conferencia -> Cross -> Separacao
```text
DOCA (Operacional)
    |
    v
[TERMINAR CONFERENCIA]
    |
    v
Carga aparece automaticamente em CROSS (Admin)
    |
    +-- [ARMAZENAR] --> Carga removida (fim)
    |
    +-- [CROSS] --> Status: Cross
                        |
                        v
                   [CROSS MONTADO] (Admin)
                        |
                        v
                   Modal: Numero do Cross
                        |
                        v
                   Status: Aguardando Separacao
                   (Carga aparece para Operacional)
                        |
                        v
                   [COMECAR SEPARACAO] (Operacional)
                        |
                        v
                   Modal: Selecionar Separador
                        |
                        v
                   Status: Em Separacao
                        |
                        v
                   [FINALIZAR SEPARACAO] (Operacional)
                        |
                        v
                   Modal: Divergencia? Observacao?
                        |
                        v
                   Status: Finalizado (some da lista)
```

---

## 16. REGRAS IMPORTANTES

- Admin NAO escolhe separador (apenas Operacional)
- Separador so e definido ao COMECAR SEPARACAO
- Cross so aparece para operacional apos CROSS MONTADO
- Cargas armazenadas NAO sao guardadas
- Nao misturar status de cross com status de conferencia de doca
- Interface simples e objetiva

---

## 17. CONSIDERACOES FINAIS

### Prototipo Visual
Como e um prototipo sem backend, os dados sao gerenciados em contexto React. Em producao, seria necessario persistencia em banco.

### Separacao de Responsabilidades
- **Admin:** Decisao estrategica (cross ou armazenar)
- **Operacional:** Execucao (separacao)

### Sem Complexidade Adicional
Nao serao adicionadas telas ou fluxos alem do especificado.

