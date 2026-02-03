

# Plano - Integracao Senhas, Controle e Docas

## Resumo das Alteracoes

Ajustar e integrar as tres telas que fazem parte do mesmo fluxo operacional:
1. **Senha (Caminhoneiro)** - Adicionar campos e status
2. **Controle de Senhas (Admin)** - Adicionar colunas e acoes
3. **Docas** - Adicionar secao de patio e acoes de movimentacao

---

## 1. ALTERACOES NO TIPO SENHA

### Interface Atual
```typescript
export interface Senha {
  id: string;
  numero: number;
  fornecedorId: string;
  cargaId?: string;
  docaNumero?: number;
  status: StatusSenha;
  horaChegada: string;
}
```

### Campos a Adicionar
| Campo | Tipo | Descricao |
|-------|------|-----------|
| nomeMotorista | string | Nome do motorista |
| tipoCaminhao | TipoCaminhao | Tipo do veiculo |
| horarioPrevisto | string? | Horario previsto da carga |
| localAtual | LocalSenha | Onde esta o caminhao |
| rua | string? | Quando em patio |
| liberada | boolean | Se a senha foi liberada pelo admin |

### Novo Tipo: StatusSenha (Expandido)
```typescript
export type StatusSenha = 
  | 'aguardando_doca'      // Chegou, aguardando doca
  | 'em_doca'              // Vinculado a uma doca
  | 'aguardando_conferencia' // Na doca, aguardando iniciar
  | 'conferindo'           // Conferencia em andamento
  | 'conferido'            // Conferencia finalizada
  | 'recusado';            // Carga recusada
```

### Novo Tipo: LocalSenha
```typescript
export type LocalSenha = 'aguardando_doca' | 'em_doca' | 'em_patio';
```

### Arquivo a Modificar
- `src/types/index.ts`

---

## 2. TELA SENHA CAMINHONEIRO - AJUSTES

### Campos Atuais
- Fornecedor (select)

### Campos a Adicionar
| Campo | Tipo | Obrigatorio |
|-------|------|-------------|
| Nome do Motorista | Input texto | SIM |
| Tipo de Veiculo | Select | SIM |

### Opcoes de Tipo de Veiculo
Reutilizar o `TipoCaminhao` ja existente: truck, carreta, bi_truck, van

### Status a Exibir (Apos Gerar Senha)
| Status | Texto Exibido | Cor |
|--------|---------------|-----|
| aguardando_doca | AGUARDANDO DOCA | Azul |
| em_doca | EM DOCA | Amarelo |
| aguardando_conferencia | AGUARDANDO CONFERENCIA | Amarelo |
| conferindo | CONFERINDO | Verde |
| conferido | CONFERIDO | Verde |
| recusado | CARGA RECUSADA | Vermelho |

### Informacoes Exibidas Apos Gerar
- Numero da senha
- Fornecedor
- Tipo de veiculo
- Status em tempo real

### O que NAO exibir
- Numero da doca
- Nome do conferente
- Rua

### Regras
- Mesmo fornecedor pode gerar mais de uma senha
- Senha NAO expira automaticamente
- Tela apenas de visualizacao apos gerar

### Arquivo a Modificar
- `src/pages/SenhaCaminhoneiro.tsx`

---

## 3. TELA CONTROLE DE SENHAS - AJUSTES

### Colunas Atuais
- Senha
- Fornecedor
- Hora Chegada
- Status

### Colunas a Adicionar
| Coluna | Descricao |
|--------|-----------|
| Horario Previsto | Do agendamento, se houver |
| Tipo de Veiculo | Informado pelo motorista |
| Local Atual | Aguardando Doca / Em Doca / Em Patio |

### Colunas Finais
1. Senha
2. Fornecedor
3. Horario Previsto
4. Hora Chegada
5. Tipo de Veiculo
6. Status
7. Local Atual
8. Acoes

### Acoes do Admin (Nova Coluna)
| Acao | Condicao | Descricao |
|------|----------|-----------|
| Vincular a Doca | Local = Aguardando | Abre modal para selecionar doca livre |
| Mover para Patio | Local = Em Doca | Com confirmacao |
| Retomar para Doca | Local = Em Patio | Abre modal para selecionar doca |
| Liberar Senha | Qualquer | Acao final - remove da lista |

### Regras Fundamentais
- Nenhuma senha some automaticamente
- Mesmo apos conferida, continua visivel
- Senha so some quando admin LIBERAR manualmente

### Modal: Vincular a Doca
Exibir lista de docas livres para selecao.

### Modal: Mover para Patio
Solicitar: Rua (onde sera estacionado)

### Arquivo a Modificar
- `src/pages/ControleSenhas.tsx`

---

## 4. TELA DOCAS - AJUSTES

### Layout Atual
Tabela unica com todas as docas.

### Novo Layout
Dividir visualmente em duas secoes:

**SECAO 1 - DOCAS**
Tabela com docas ocupadas e livres (comportamento atual)

**SECAO 2 - CARGAS EM PATIO**
Nova tabela abaixo das docas mostrando cargas movidas para o patio

### Colunas Secao Patio
| Coluna | Descricao |
|--------|-----------|
| Senha | Numero da senha |
| Fornecedor | Nome do fornecedor |
| Tipo Veiculo | Tipo do caminhao |
| Rua | Onde esta estacionado |
| Status | Status da carga |
| Acoes | Retomar para Doca |

### Nova Acao Admin: Mover para Patio
Nas docas ocupadas/em_conferencia, adicionar botao para mover carga para patio.
- Exige confirmacao
- Solicita rua
- Libera a doca
- Move a carga para secao de patio

### Nova Acao Admin: Retomar do Patio
Na secao de patio, botao para mover carga de volta para uma doca.
- Abre modal para selecionar doca livre

### Comportamento ao Finalizar Conferencia
- A doca e liberada
- O status da carga/senha e atualizado
- A senha NAO e liberada automaticamente (continua no Controle de Senhas)

### Arquivo a Modificar
- `src/pages/Docas.tsx`

---

## 5. CONTEXTO SENHA - NOVAS FUNCOES

### Funcoes a Adicionar
| Funcao | Descricao |
|--------|-----------|
| `liberarSenha(senhaId)` | Remove senha da lista (acao final) |
| `moverParaPatio(senhaId, rua)` | Move carga para patio |
| `retomarDoPatio(senhaId, docaNumero)` | Move carga de volta para doca |
| `atualizarLocalSenha(senhaId, local)` | Atualiza localizacao |

### Regra de Geracao de Senha
Alterar para permitir multiplas senhas do mesmo fornecedor (remover restricao atual).

### Arquivo a Modificar
- `src/contexts/SenhaContext.tsx`

---

## 6. FLUXO INTEGRADO

```text
CAMINHONEIRO (tela /senha)
    |
    v
[GERA SENHA]
- Seleciona fornecedor
- Informa nome do motorista
- Seleciona tipo de veiculo
    |
    v
Senha aparece no CONTROLE DE SENHAS
Status: aguardando_doca
Local: Aguardando Doca
    |
    v
ADMIN (Controle de Senhas)
    |
    +-- [VINCULAR A DOCA] --> Seleciona doca livre
    |                              |
    |                              v
    |                         Status: em_doca
    |                         Local: Em Doca
    |                         (Carga aparece em DOCAS)
    |
    +-- [MOVER PARA PATIO] --> Informa rua
                                   |
                                   v
                              Status: mantido
                              Local: Em Patio
                              (Aparece em secao Patio na tela Docas)
```

### Fluxo na Doca
```text
DOCA OCUPADA
    |
    v
[COMECAR CONFERENCIA] (Operacional)
- Seleciona conferente
- Informa rua
    |
    v
Status senha: conferindo
    |
    v
[TERMINAR CONFERENCIA] (Operacional)
- Informa volume recebido
- Divergencia (opcional)
    |
    v
Status senha: conferido
Doca: liberada
Senha: NAO e liberada (continua no Controle)
    |
    v
ADMIN (Controle de Senhas)
    |
    v
[LIBERAR SENHA] --> Senha some da lista
                    Fluxo finalizado
```

---

## 7. RESUMO DOS ARQUIVOS

### Arquivos a Modificar
| Arquivo | Alteracoes |
|---------|------------|
| `src/types/index.ts` | Expandir StatusSenha, adicionar LocalSenha, campos em Senha |
| `src/contexts/SenhaContext.tsx` | Novas funcoes, alterar geracao de senha |
| `src/pages/SenhaCaminhoneiro.tsx` | Adicionar campos motorista e tipo veiculo |
| `src/pages/ControleSenhas.tsx` | Adicionar colunas e acoes do admin |
| `src/pages/Docas.tsx` | Adicionar secao patio, acoes de movimentacao |
| `src/data/mockData.ts` | Labels para novos status e locais |

### Novos Modais/Componentes (se necessario)
| Componente | Descricao |
|------------|-----------|
| `VincularDocaModal` | Selecionar doca livre para vincular senha |
| `MoverPatioModal` | Confirmar e informar rua do patio |

---

## 8. STATUS E LOCAIS - MAPEAMENTO

### StatusSenha para Exibicao
| Status | Label Caminhoneiro | Label Admin |
|--------|-------------------|-------------|
| aguardando_doca | AGUARDANDO DOCA | Aguardando |
| em_doca | EM DOCA | Em Doca |
| aguardando_conferencia | AGUARDANDO CONFERENCIA | Aguard. Conf. |
| conferindo | CONFERINDO | Conferindo |
| conferido | CONFERIDO | Conferido |
| recusado | CARGA RECUSADA | Recusado |

### LocalSenha para Exibicao
| Local | Label |
|-------|-------|
| aguardando_doca | Aguardando Doca |
| em_doca | Em Doca |
| em_patio | Em Patio (Rua X) |

---

## 9. INTEGRACAO ENTRE TELAS

### Quando Admin Vincula Senha a Doca (Controle de Senhas)
1. Status senha = em_doca
2. Local senha = em_doca
3. Carga aparece na lista de cargas disponiveis para a doca
4. Doca muda status para "ocupada" se auto-associacao

### Quando Admin Move para Patio (Controle de Senhas ou Docas)
1. Local senha = em_patio
2. Rua e registrada
3. Doca e liberada (se estava vinculada)
4. Carga aparece na secao Patio da tela Docas

### Quando Operacional Finaliza Conferencia (Docas)
1. Doca e liberada
2. Status senha = conferido
3. Status carga = conferido
4. Senha continua visivel no Controle de Senhas
5. Carga vai para Cross Docking

### Quando Admin Libera Senha (Controle de Senhas)
1. Senha e removida da lista
2. Fluxo encerrado
3. Caminhao pode sair

---

## 10. RESTRICOES RESPEITADAS

- Nao criar banco de dados
- Nao criar novas telas fora das descritas
- Nao duplicar telas existentes
- Apenas ajustar logica e campos
- Nao inventar regras adicionais
- Nenhuma senha some automaticamente
- Toda liberacao e manual

---

## 11. ORDEM DE IMPLEMENTACAO

1. Modificar tipos em `src/types/index.ts`
2. Adicionar labels em `src/data/mockData.ts`
3. Atualizar contexto `src/contexts/SenhaContext.tsx`
4. Ajustar `src/pages/SenhaCaminhoneiro.tsx`
5. Ajustar `src/pages/ControleSenhas.tsx`
6. Ajustar `src/pages/Docas.tsx`
7. Testar fluxo completo integrado

