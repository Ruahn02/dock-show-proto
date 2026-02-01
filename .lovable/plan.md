

# Plano - Reorganizacao de Telas: Agendamento, Agenda e Solicitacoes

## Resumo das Alteracoes

Este plano reorganiza o sistema de agendamento em tres camadas distintas:
1. **Solicitacao de Entrega** (Externa - Fornecedor)
2. **Agendamento** (Planejamento - Admin)
3. **Agenda** (Execucao do Dia - Admin)

---

## 1. ALTERACOES NA TELA EXISTENTE

### O que JA EXISTE (src/pages/Agendamento.tsx)
- Calendario com selecao de data
- Tabela com cargas filtradas por data
- Campos: Data, Fornecedor, NF(s), Vol. Previsto, Vol. Recebido, Conferente, Divergencia, Status
- Acoes: Marcar No-show, Marcar Recusado
- Botao "Novo Agendamento" (abre modal)

### ADAPTACAO - Renomear para AGENDA
A tela atual sera renomeada de "Agendamento" para "Agenda" e adaptada para ser exclusivamente de execucao do dia.

| Alteracao | Descricao |
|-----------|-----------|
| Titulo | Mudar de "Agendamento" para "Agenda" |
| Calendario | REMOVER - mostrar apenas data atual |
| Botao Novo | REMOVER - nao cria agendamentos |
| Coluna Data | REMOVER - e sempre o dia atual |
| Nova Coluna | ADICIONAR "Horario Previsto" |
| Nova Coluna | ADICIONAR "Rua" (ja existe no tipo, apenas exibir) |
| Filtro | Fixar em data atual (sem selecao) |
| Rota | Alterar de `/agendamento` para `/agenda` |

### Campos Finais da AGENDA
| Campo | Status |
|-------|--------|
| Horario Previsto | NOVO - adicionar ao tipo e exibir |
| Fornecedor | JA EXISTE |
| Volume Previsto | JA EXISTE |
| Volume Recebido | JA EXISTE |
| Conferente | JA EXISTE |
| Rua | JA EXISTE no tipo - apenas exibir |
| Status | JA EXISTE |

---

## 2. NOVO TIPO: Solicitacao

### Interface SolicitacaoEntrega
```typescript
export type StatusSolicitacao = 'pendente' | 'aprovada' | 'recusada';

export type TipoCaminhao = 'truck' | 'carreta' | 'bi_truck' | 'van';

export interface SolicitacaoEntrega {
  id: string;
  fornecedorId: string;
  tipoCaminhao: TipoCaminhao;
  quantidadeVeiculos: number;
  volumePrevisto: number;
  observacoes?: string;
  status: StatusSolicitacao;
  dataSolicitacao: string;
  // Preenchidos pelo admin ao aprovar
  dataAgendada?: string;
  horarioAgendado?: string;
}
```

### Arquivo a Modificar
- `src/types/index.ts`

---

## 3. MODIFICACAO NO TIPO CARGA

### Campos a Adicionar
```typescript
export interface Carga {
  // ... campos existentes ...
  horarioPrevisto?: string;    // NOVO - horario agendado
  tipoCaminhao?: TipoCaminhao; // NOVO - tipo do veiculo
  quantidadeVeiculos?: number; // NOVO - qtd de veiculos
  solicitacaoId?: string;      // NOVO - referencia a solicitacao original
}
```

---

## 4. NOVO CONTEXTO: SolicitacaoContext

### Funcionalidades
| Funcao | Descricao |
|--------|-----------|
| `solicitacoes` | Lista de solicitacoes |
| `criarSolicitacao(data)` | Fornecedor cria solicitacao |
| `aprovarSolicitacao(id, data, horario)` | Admin aprova e define data/hora |
| `recusarSolicitacao(id)` | Admin recusa |
| `getSolicitacoesPendentes()` | Retorna pendentes para admin |

### Arquivo a Criar
- `src/contexts/SolicitacaoContext.tsx`

---

## 5. NOVA TELA: SOLICITACAO DE ENTREGA (Externa)

### Descricao
Tela publica para fornecedores solicitarem entrega. Sem login, acessivel via `/solicitacao`.

### Layout
```text
+----------------------------------+
|    SOLICITACAO DE ENTREGA        |
+----------------------------------+
|                                  |
|  Fornecedor *                    |
|  [v] Selecione                   |
|                                  |
|  Tipo de Caminhao *              |
|  [v] Selecione                   |
|                                  |
|  Quantidade de Veiculos *        |
|  [ 1 ]                           |
|                                  |
|  Volume Previsto *               |
|  [    ]                          |
|                                  |
|  Observacoes                     |
|  [                           ]   |
|                                  |
|  [ENVIAR SOLICITACAO]            |
|                                  |
+----------------------------------+
```

### Apos Enviar
Exibir mensagem de confirmacao:
"Solicitacao enviada com sucesso! Aguarde aprovacao."

### Arquivo a Criar
- `src/pages/SolicitacaoEntrega.tsx`

---

## 6. NOVA TELA: SOLICITACOES (Admin)

### Descricao
Tela interna para admin visualizar e aprovar/recusar solicitacoes.

### Layout - Tabela
```text
+------------------+----------+----------+--------+------------+------------------+
| Fornecedor       | Tipo Cam.| Qtd Veic.| Volume | Data Solic.| Acoes            |
+------------------+----------+----------+--------+------------+------------------+
| ABC Ltda         | Truck    | 1        | 150    | 24/01/26   | [APROVAR][RECUSAR]|
| Nacional SA      | Carreta  | 2        | 300    | 24/01/26   | [APROVAR][RECUSAR]|
+------------------+----------+----------+--------+------------+------------------+
```

### Modal de Aprovacao
Ao clicar APROVAR:
```text
+----------------------------------+
|      APROVAR SOLICITACAO         |
+----------------------------------+
|                                  |
|  Fornecedor: ABC Ltda            |
|  Volume: 150 | Tipo: Truck       |
|                                  |
|  Data do Agendamento *           |
|  [Calendario]                    |
|                                  |
|  Horario Previsto *              |
|  [ 08:00 ]                       |
|                                  |
|  [CANCELAR]  [CONFIRMAR]         |
+----------------------------------+
```

### Arquivo a Criar
- `src/pages/Solicitacoes.tsx`

---

## 7. NOVA TELA: AGENDAMENTO (Planejamento)

### Descricao
Tela para planejamento de entregas futuras. Permite criar, editar e cancelar agendamentos.

### Diferenca para AGENDA
| AGENDAMENTO (Planejamento) | AGENDA (Execucao) |
|---------------------------|-------------------|
| Qualquer data futura | Apenas dia atual |
| Pode criar/editar/cancelar | Apenas visualizar |
| Sem volume recebido | Com volume recebido |
| Sem conferente | Com conferente |
| Sem rua | Com rua |

### Campos da Tabela
| Campo | Editavel |
|-------|----------|
| Data | SIM |
| Horario Previsto | SIM |
| Fornecedor | NAO (vem da solicitacao) |
| NF (opcional) | SIM |
| Volume Previsto | SIM |
| Tipo Caminhao | NAO (vem da solicitacao) |
| Qtd Veiculos | NAO (vem da solicitacao) |
| Status | Ativo/Cancelado |

### Arquivo a Criar
- `src/pages/AgendamentoPlanejamento.tsx`

---

## 8. MENU LATERAL (NOVA ORDEM)

### Estrutura Final
| Posicao | Rota | Label | Acesso |
|---------|------|-------|--------|
| 1 | / | Dashboard | Admin |
| 2 | /solicitacoes | Solicitacoes de Entrega | Admin |
| 3 | /agendamento | Agendamento | Admin |
| 4 | /agenda | Agenda | Admin |
| 5 | /docas | Docas | Todos |
| 6 | /cross | Cross Docking | Todos |
| 7 | /senhas | Controle de Senhas | Admin |
| 8 | /fornecedores | Fornecedores | Admin |
| 9 | /funcionarios | Funcionarios | Admin |

### Icones
| Tela | Icone |
|------|-------|
| Solicitacoes | ClipboardList |
| Agendamento | CalendarPlus |
| Agenda | CalendarCheck |
| Funcionarios | Users |

### Arquivos a Modificar
- `src/components/layout/Sidebar.tsx`

---

## 9. RENOMEAR CONFERENTES PARA FUNCIONARIOS

### Alteracao
A tela atual "Conferentes" sera renomeada para "Funcionarios" para abranger conferentes e separadores.

### Arquivos a Modificar
| Arquivo | Alteracao |
|---------|-----------|
| `src/pages/Conferentes.tsx` | Renomear para `Funcionarios.tsx` |
| `src/components/layout/Sidebar.tsx` | Alterar label e rota |
| `src/App.tsx` | Alterar rota de `/conferentes` para `/funcionarios` |

---

## 10. ROTEAMENTO FINAL

### Rotas do App.tsx
| Rota | Componente | Protegida |
|------|------------|-----------|
| `/` | Dashboard | Admin |
| `/solicitacao` | SolicitacaoEntrega | Publica |
| `/solicitacoes` | Solicitacoes | Admin |
| `/agendamento` | AgendamentoPlanejamento | Admin |
| `/agenda` | Agenda | Admin |
| `/docas` | Docas | Todos |
| `/cross` | CrossDocking | Todos |
| `/senhas` | ControleSenhas | Admin |
| `/fornecedores` | Fornecedores | Admin |
| `/funcionarios` | Funcionarios | Admin |
| `/senha` | SenhaCaminhoneiro | Publica |

---

## 11. RESUMO DOS ARQUIVOS

### Arquivos a CRIAR
| Arquivo | Descricao |
|---------|-----------|
| `src/contexts/SolicitacaoContext.tsx` | Gerenciamento de solicitacoes |
| `src/pages/SolicitacaoEntrega.tsx` | Tela externa para fornecedores |
| `src/pages/Solicitacoes.tsx` | Tela admin para aprovar/recusar |
| `src/pages/AgendamentoPlanejamento.tsx` | Tela de planejamento |
| `src/pages/Agenda.tsx` | Adaptacao da tela atual |

### Arquivos a MODIFICAR
| Arquivo | Alteracao |
|---------|-----------|
| `src/types/index.ts` | Adicionar SolicitacaoEntrega, TipoCaminhao, campos em Carga |
| `src/data/mockData.ts` | Adicionar tipos de caminhao e labels |
| `src/pages/Conferentes.tsx` | Renomear para Funcionarios |
| `src/components/layout/Sidebar.tsx` | Nova estrutura de menu |
| `src/App.tsx` | Novas rotas |

### Arquivos a REMOVER/SUBSTITUIR
| Arquivo | Acao |
|---------|------|
| `src/pages/Agendamento.tsx` | Adaptar para `Agenda.tsx` |

---

## 12. FLUXO COMPLETO

```text
FORNECEDOR (externo)
    |
    v
[SOLICITAR ENTREGA] --> /solicitacao
    |
    v
Status: PENDENTE DE APROVACAO
    |
    v
ADMIN (interno)
    |
    +-- [RECUSAR] --> Fluxo encerrado
    |
    +-- [APROVAR] --> Define data + horario
                          |
                          v
                   Cria AGENDAMENTO
                   (aparece em /agendamento)
                          |
                          v
                   No dia agendado:
                   Aparece na AGENDA
                   (/agenda)
                          |
                          v
                   Execucao normal
                   (Docas, Cross, etc.)
```

---

## 13. TIPOS DE CAMINHAO

### Opcoes
| Valor | Label |
|-------|-------|
| truck | Truck |
| carreta | Carreta |
| bi_truck | Bi-Truck |
| van | Van |

---

## 14. ORDEM DE IMPLEMENTACAO

1. Adicionar novos tipos em `src/types/index.ts`
2. Atualizar `src/data/mockData.ts` com labels
3. Criar `src/contexts/SolicitacaoContext.tsx`
4. Criar `src/pages/SolicitacaoEntrega.tsx` (tela externa)
5. Criar `src/pages/Solicitacoes.tsx` (admin)
6. Criar `src/pages/AgendamentoPlanejamento.tsx`
7. Adaptar `src/pages/Agendamento.tsx` para `src/pages/Agenda.tsx`
8. Renomear `Conferentes` para `Funcionarios`
9. Atualizar `src/components/layout/Sidebar.tsx`
10. Atualizar `src/App.tsx` com novas rotas
11. Testar fluxo completo

---

## 15. REGRAS IMPORTANTES RESPEITADAS

- Tela atual de Agendamento foi ADAPTADA, nao recriada
- Nenhum banco de dados foi criado
- Estrutura existente foi preservada
- Agenda nao se mistura com Agendamento
- Solicitacao nao vira agendamento automaticamente
- Admin sempre tem controle sobre aprovacao e datas

