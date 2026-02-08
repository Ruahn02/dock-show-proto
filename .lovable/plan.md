
# Plano - Conexao Supabase como Fonte Unica de Verdade

## Escopo

Substituir TODOS os dados em memoria (mockData + useState local) por leitura/escrita no Supabase, sem alterar nenhuma tela, layout, texto ou regra de negocio. Adicionar persistencia de login via localStorage. Adicionar Supabase Realtime para senhas, docas e painel TV.

---

## PARTE 1 - LOGIN PERSISTENTE VIA LOCALSTORAGE

### Arquivo: `src/contexts/ProfileContext.tsx`

Alteracoes:
- No `login()`: apos validar codigo, salvar no localStorage: `{ perfil, autenticado: true }`
- No `useState` inicial: ler localStorage para recuperar sessao existente
- No `logout()`: limpar localStorage
- Codigos fixos continuam iguais: `admin123` e `ACESSO123`
- Nenhuma tabela criada, nenhum Supabase Auth usado

Comportamento resultante:
- Primeiro acesso: pede login normalmente
- Reload: le localStorage, mantem sessao
- Logout: limpa localStorage, redireciona

---

## PARTE 2 - DADOS SEED NO SUPABASE

Antes de conectar os contexts, inserir dados iniciais nas tabelas via ferramenta de insercao:
- `fornecedores`: 10 registros (f1-f10 do mockData)
- `conferentes`: 8 registros (c1-c8 do mockData)
- `docas`: 6 registros (d1-d6, inicialmente todas com status 'livre')

Esses dados iniciais garantem que o sistema tenha dados para funcionar ao ser carregado pela primeira vez.

Nota: cargas, senhas, solicitacoes e cross_docking comecarao vazios (serao criados pelo fluxo real do sistema).

---

## PARTE 3 - HOOKS DE ACESSO AO SUPABASE

Criar hooks reutilizaveis para cada tabela. Esses hooks encapsulam SELECT, INSERT, UPDATE e subscribe (realtime).

### Arquivo: `src/hooks/useFornecedores.ts`
- `fetchFornecedores()`: SELECT * FROM fornecedores ORDER BY nome
- `criarFornecedor(data)`: INSERT + retorno
- `atualizarFornecedor(id, data)`: UPDATE + retorno
- Retorna `{ fornecedores, loading, criarFornecedor, atualizarFornecedor }`

### Arquivo: `src/hooks/useConferentes.ts`
- `fetchConferentes()`: SELECT * FROM conferentes ORDER BY nome
- `criarConferente(data)`: INSERT + retorno
- `atualizarConferente(id, data)`: UPDATE + retorno
- Retorna `{ conferentes, loading, criarConferente, atualizarConferente }`

### Arquivo: `src/hooks/useDocas.ts`
- `fetchDocas()`: SELECT * FROM docas ORDER BY numero
- `atualizarDoca(id, data)`: UPDATE + retorno
- `criarDoca(numero)`: INSERT + retorno
- Subscribe Realtime na tabela docas
- Retorna `{ docas, loading, atualizarDoca, criarDoca }`

### Arquivo: `src/hooks/useSolicitacoesDB.ts`
- `fetchSolicitacoes()`: SELECT * FROM solicitacoes ORDER BY created_at DESC
- `criarSolicitacao(data)`: INSERT + retorno
- `atualizarSolicitacao(id, data)`: UPDATE + retorno
- Retorna `{ solicitacoes, loading, criarSolicitacao, atualizarSolicitacao }`

### Arquivo: `src/hooks/useCargasDB.ts`
- `fetchCargas()`: SELECT * FROM cargas ORDER BY data, horario_previsto
- `criarCarga(data)`: INSERT + retorno
- `atualizarCarga(id, data)`: UPDATE + retorno
- Retorna `{ cargas, loading, criarCarga, atualizarCarga }`

### Arquivo: `src/hooks/useSenhasDB.ts`
- `fetchSenhas()`: SELECT * FROM senhas ORDER BY numero
- `criarSenha(data)`: INSERT + retorno (numero e auto via sequence)
- `atualizarSenha(id, data)`: UPDATE + retorno
- Subscribe Realtime na tabela senhas
- Retorna `{ senhas, loading, criarSenha, atualizarSenha }`

### Arquivo: `src/hooks/useCrossDB.ts`
- `fetchCross()`: SELECT * FROM cross_docking ORDER BY created_at DESC
- `criarCross(data)`: INSERT + retorno
- `atualizarCross(id, data)`: UPDATE + retorno
- `deletarCross(id)`: DELETE (para armazenar = remover da lista)
- Retorna `{ crossItems, loading, criarCross, atualizarCross, deletarCross }`

---

## PARTE 4 - REESCREVER CONTEXTS PARA USAR SUPABASE

### 4.1 `SenhaContext.tsx` (o maior e mais critico)

Estado atual: armazena senhas[] e cargas[] em memoria com dados mock.

Alteracao:
- Inicializacao: useEffect que chama fetchSenhas() e fetchCargas() do Supabase
- `gerarSenha()`: INSERT na tabela senhas no Supabase, aguardar retorno, atualizar state
- `atualizarSenha()`: UPDATE senhas no Supabase, aguardar, atualizar state
- `vincularSenhaADoca()`: UPDATE senhas (status, local_atual, doca_numero) no Supabase
- `liberarSenha()`: UPDATE senhas (liberada=true) no Supabase
- `moverParaPatio()`: UPDATE senhas (local_atual='em_patio', doca_numero=null) no Supabase
- `retomarDoPatio()`: UPDATE senhas (local_atual='em_doca', status='em_doca', doca_numero) no Supabase
- `atualizarStatusSenha()`: UPDATE senhas (status) no Supabase
- `atualizarLocalSenha()`: UPDATE senhas (local_atual) no Supabase
- `vincularCargaADoca()`: UPDATE senhas via carga.senha_id no Supabase
- `recusarCarga()`: UPDATE cargas (status='recusado') + UPDATE senhas (status='recusado') no Supabase
- `marcarChegada()`: UPDATE cargas (chegou=true, senha_id) no Supabase
- `atualizarCarga()`: UPDATE cargas no Supabase
- `adicionarCarga()`: INSERT cargas no Supabase
- `getCargasDisponiveis()`: filtrar cargas do state (data de hoje dinamica, nao hardcoded)
- Subscribe Realtime em senhas e cargas

Mapeamento de campos (TypeScript -> Supabase):
- `fornecedorId` -> `fornecedor_id`
- `nomeMotorista` -> `nome_motorista`
- `tipoCaminhao` -> `tipo_caminhao`
- `horaChegada` -> `hora_chegada`
- `localAtual` -> `local_atual`
- `docaNumero` -> `doca_numero`
- `horarioPrevisto` -> `horario_previsto`
- `volumePrevisto` -> `volume_previsto`
- `volumeConferido` -> `volume_conferido`
- `conferenteId` -> `conferente_id`
- `senhaId` -> `senha_id`
- `cargaId` -> `carga_id`
- `docaId` -> `doca_id`
- `solicitacaoId` -> `solicitacao_id`

Funcoes auxiliares de mapeamento:
- `mapSenhaFromDB(row)`: converte snake_case para camelCase
- `mapCargaFromDB(row)`: converte snake_case para camelCase

### 4.2 `SolicitacaoContext.tsx`

Estado atual: solicitacoes[] em memoria com dados mock.

Alteracao:
- Inicializacao: useEffect que chama SELECT * FROM solicitacoes
- `criarSolicitacao()`: INSERT no Supabase
- `aprovarSolicitacao()`: UPDATE solicitacoes (status='aprovada', data_agendada, horario_agendado) + INSERT cargas (via adicionarCarga do SenhaContext)
- `recusarSolicitacao()`: UPDATE solicitacoes (status='recusada')
- `getSolicitacoesPendentes()`: filtrar state local

### 4.3 `CrossContext.tsx`

Estado atual: crossItems[] em memoria com dados mock.

Alteracao:
- Inicializacao: useEffect que chama SELECT * FROM cross_docking
- `adicionarCross()`: INSERT no Supabase
- `armazenarCarga()`: DELETE no Supabase (remove da tabela)
- `confirmarCross()`: UPDATE status='cross_confirmado'
- `montarCross()`: UPDATE status='aguardando_separacao', numero_cross
- `iniciarSeparacao()`: UPDATE status='em_separacao', separador_id
- `finalizarSeparacao()`: UPDATE status='finalizado', tem_divergencia, observacao

Mapeamento:
- `cargaId` -> `carga_id`
- `fornecedorId` -> `fornecedor_id`
- `volumeRecebido` -> `volume_recebido`
- `numeroCross` -> `numero_cross`
- `separadorId` -> `separador_id`
- `temDivergencia` -> `tem_divergencia`

---

## PARTE 5 - REESCREVER PAGINAS QUE USAM ESTADO LOCAL

### 5.1 `Docas.tsx`

Estado atual: `useState<Doca[]>(docasIniciais)` - estado LOCAL, desconectado.

Alteracao:
- Remover `useState(docasIniciais)`
- Usar hook `useDocas` para ler/escrever docas do Supabase
- TODAS as funcoes que fazem `setDocas(...)` passam a fazer UPDATE na tabela docas via Supabase
- `handleCriarDoca()`: INSERT na tabela docas
- `handleAssociarCarga()`: UPDATE doca (status='ocupada', carga_id)
- `handleUsoConsumo()`: UPDATE doca (status='uso_consumo')
- `handleLiberar()`: UPDATE doca (todos campos limpos, status='livre')
- `handleRecusarCarga()`: UPDATE doca (limpar) + UPDATE carga (recusado)
- `handleConfirmPatio()`: UPDATE doca (limpar)
- `handleConfirmTrocarDoca()`: UPDATE doca antiga (limpar) + UPDATE doca nova (copiar dados)
- `handleConfirmRetomar()`: UPDATE doca (status='ocupada', senha_id, carga_id)
- `handleModalConfirm()` entrar: UPDATE doca (status='em_conferencia', conferente_id, rua)
- `handleModalConfirm()` finalizar: UPDATE doca (limpar, status='livre')

Leitura de fornecedores e conferentes: buscar do Supabase (via hooks), nao de mockData.

### 5.2 `Fornecedores.tsx`

Estado atual: `useState(fornecedoresIniciais)` - estado LOCAL.

Alteracao:
- Usar hook `useFornecedores`
- `handleSave()`: INSERT ou UPDATE no Supabase
- `handleToggleAtivo()`: UPDATE no Supabase

### 5.3 `Funcionarios.tsx`

Estado atual: `useState(conferentesIniciais)` - estado LOCAL.

Alteracao:
- Usar hook `useConferentes`
- `handleSave()`: INSERT ou UPDATE no Supabase
- `handleToggleAtivo()`: UPDATE no Supabase

### 5.4 `ControleSenhas.tsx`

Estado atual: `const [docas] = useState<Doca[]>(docasIniciais)` - copia estatica.

Alteracao:
- Usar hook `useDocas` para ter docas reais e sincronizadas
- Usar hook `useFornecedores` em vez de importar de mockData
- Realtime ja ativo via hook

### 5.5 `SenhaCaminhoneiro.tsx`

Alteracao:
- Buscar fornecedores do Supabase em vez de mockData
- Data de hoje: usar `format(new Date(), 'yyyy-MM-dd')` em vez de `'2026-02-04'` hardcoded
- Realtime: subscribe em senhas para atualizar status em tempo real

### 5.6 `PainelSenhas.tsx`

Alteracao:
- Buscar fornecedores do Supabase
- Realtime: subscribe em senhas para atualizar automaticamente

### 5.7 `Agenda.tsx`

Alteracao:
- Buscar fornecedores e conferentes do Supabase
- Data padrao: `new Date()` em vez de `new Date(2026, 1, 4)`

### 5.8 `AgendamentoPlanejamento.tsx`

Alteracao:
- Buscar fornecedores do Supabase

### 5.9 `Solicitacoes.tsx`

Alteracao:
- Buscar fornecedores do Supabase

### 5.10 `SolicitacaoEntrega.tsx`

Alteracao:
- Buscar fornecedores do Supabase
- Ao submeter: INSERT na tabela solicitacoes do Supabase (hoje nao salva em lugar nenhum)

### 5.11 `CrossDocking.tsx`

Alteracao:
- Buscar fornecedores e conferentes do Supabase

### 5.12 `Dashboard.tsx`

Alteracao:
- Continua usando mockData para indicadores (como definido na auditoria, dashboard usa dados mock 100%)
- Nenhuma alteracao nesta tela

### 5.13 Componentes modais

- `DocaModal.tsx`: buscar conferentes do Supabase
- `SeparacaoModal.tsx`: buscar conferentes do Supabase
- `AssociarCargaModal.tsx`: sem alteracao (recebe dados via props)

---

## PARTE 6 - REALTIME (SUBSCRIBE)

Tabelas com subscribe ativo:
- `senhas`: usado em PainelSenhas, ControleSenhas, SenhaCaminhoneiro
- `docas`: usado em Docas, ControleSenhas
- `cargas`: usado em SenhaContext (para refletir mudancas cross-tela)

Implementacao: dentro dos hooks (useDocas, useSenhasDB), usar `supabase.channel().on('postgres_changes', ...)` para detectar INSERT, UPDATE, DELETE e atualizar o state automaticamente.

---

## PARTE 7 - REMOCAO DE DEPENDENCIAS DE MOCKDATA

Apos todas as telas usarem Supabase:

Arquivos que DEIXAM de importar dados de mockData:
- SenhaContext.tsx (remove cargasIniciais, fornecedores)
- SolicitacaoContext.tsx (nada de mock)
- CrossContext.tsx (nada de mock)
- Docas.tsx (remove docasIniciais, conferentes, fornecedores)
- Fornecedores.tsx (remove fornecedoresIniciais)
- Funcionarios.tsx (remove conferentesIniciais)
- ControleSenhas.tsx (remove docasIniciais, fornecedores)
- SenhaCaminhoneiro.tsx (remove fornecedores)
- PainelSenhas.tsx (remove fornecedores)
- Agenda.tsx (remove fornecedores, conferentes)
- AgendamentoPlanejamento.tsx (remove fornecedores)
- Solicitacoes.tsx (remove fornecedores)
- SolicitacaoEntrega.tsx (remove fornecedores)
- CrossDocking.tsx (remove fornecedores, conferentes)
- DocaModal.tsx (remove conferentes)
- SeparacaoModal.tsx (remove conferentes)

mockData.ts MANTEM apenas:
- Labels (statusCargaLabels, statusDocaLabels, tipoCaminhaoLabels, etc.) - sao constantes de UI, nao dados
- dashboardPorPeriodo, produtividadeConferentes, statusCargasChart - dashboard continua mock

---

## PARTE 8 - DATA DINAMICA

Substituir todas as datas hardcoded `'2026-02-04'` por `format(new Date(), 'yyyy-MM-dd')`:
- SenhaContext.tsx: `getCargasDisponiveis()`
- SenhaCaminhoneiro.tsx: `dataHoje`
- Agenda.tsx: `dataSelecionada` inicial

---

## ORDEM DE EXECUCAO

1. Inserir dados seed (fornecedores, conferentes, docas) no Supabase
2. Criar hooks de acesso ao Supabase (7 hooks)
3. Atualizar ProfileContext (localStorage)
4. Atualizar SenhaContext (Supabase + realtime)
5. Atualizar SolicitacaoContext (Supabase)
6. Atualizar CrossContext (Supabase)
7. Atualizar paginas com estado local (Docas, Fornecedores, Funcionarios)
8. Atualizar paginas que importam dados de mockData (ControleSenhas, Agenda, etc.)
9. Atualizar SolicitacaoEntrega para salvar no Supabase
10. Configurar Realtime nos hooks criticos
11. Limpar imports de mockData

---

## O QUE NAO SERA FEITO

- Nenhuma tela nova
- Nenhum campo novo
- Nenhum botao novo
- Nenhuma tabela nova no Supabase
- Nenhuma alteracao de layout
- Nenhuma alteracao de regra de negocio
- Nenhuma alteracao no Dashboard (continua mock)
- Nenhum Supabase Auth
- Nenhuma tabela de roles
- Nenhuma refatoracao estetica

---

## RESULTADO ESPERADO

- Sistema visualmente identico
- Dados persistem apos reload
- Dados persistem ao trocar de tela
- Login persiste por dispositivo (localStorage)
- Painel TV atualiza em tempo real
- Controle de senhas atualiza em tempo real
- Docas sincronizadas entre telas
- Solicitacao do fornecedor (/solicitacao) salva dados reais
- Supabase e a fonte unica de verdade

---

## SECAO TECNICA - MAPEAMENTO COMPLETO DE CAMPOS

### Tabela fornecedores
| TypeScript | Supabase |
|------------|----------|
| id | id |
| nome | nome |
| ativo | ativo |
| email | email |

### Tabela conferentes
| TypeScript | Supabase |
|------------|----------|
| id | id |
| nome | nome |
| ativo | ativo |

### Tabela docas
| TypeScript | Supabase |
|------------|----------|
| id | id |
| numero | numero |
| status | status |
| cargaId | carga_id |
| conferenteId | conferente_id |
| volumeConferido | volume_conferido |
| rua | rua |
| senhaId | senha_id |

### Tabela solicitacoes
| TypeScript | Supabase |
|------------|----------|
| id | id |
| fornecedorId | fornecedor_id |
| tipoCaminhao | tipo_caminhao |
| quantidadeVeiculos | quantidade_veiculos |
| volumePrevisto | volume_previsto |
| observacoes | observacoes |
| status | status |
| dataSolicitacao | data_solicitacao |
| dataAgendada | data_agendada |
| horarioAgendado | horario_agendado |
| emailContato | email_contato |

### Tabela cargas
| TypeScript | Supabase |
|------------|----------|
| id | id |
| data | data |
| fornecedorId | fornecedor_id |
| nfs | nfs |
| volumePrevisto | volume_previsto |
| volumeConferido | volume_conferido |
| status | status |
| docaId | doca_id |
| conferenteId | conferente_id |
| rua | rua |
| divergencia | divergencia |
| chegou | chegou |
| senhaId | senha_id |
| horarioPrevisto | horario_previsto |
| tipoCaminhao | tipo_caminhao |
| quantidadeVeiculos | quantidade_veiculos |
| solicitacaoId | solicitacao_id |

### Tabela senhas
| TypeScript | Supabase |
|------------|----------|
| id | id |
| numero | numero |
| fornecedorId | fornecedor_id |
| cargaId | carga_id |
| docaNumero | doca_numero |
| status | status |
| horaChegada | hora_chegada |
| nomeMotorista | nome_motorista |
| tipoCaminhao | tipo_caminhao |
| horarioPrevisto | horario_previsto |
| localAtual | local_atual |
| rua | rua |
| liberada | liberada |

### Tabela cross_docking
| TypeScript | Supabase |
|------------|----------|
| id | id |
| cargaId | carga_id |
| fornecedorId | fornecedor_id |
| nfs | nfs |
| data | data |
| rua | rua |
| volumeRecebido | volume_recebido |
| status | status |
| numeroCross | numero_cross |
| separadorId | separador_id |
| temDivergencia | tem_divergencia |
| observacao | observacao |
