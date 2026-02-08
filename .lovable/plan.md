
# Plano - Criar Banco de Dados Supabase como Espelho do Sistema Atual

## ETAPA 1 - CONFIRMACAO DA AUDITORIA

A auditoria funcional existente e aceita como fonte da verdade. Nenhuma tela, fluxo, regra ou campo sera alterado. O banco de dados sera criado para refletir exatamente o que existe hoje nos tipos TypeScript, contextos e dados mock.

---

## ETAPA 2 - CRIACAO DO BANCO DE DADOS

### Tabelas a Criar

Todas as tabelas seguem exatamente os campos definidos em `src/types/index.ts` e os dados em `src/data/mockData.ts`.

---

### Tabela: fornecedores

| Campo | Tipo | Obrigatorio | Default |
|-------|------|-------------|---------|
| id | uuid (PK) | sim | gen_random_uuid() |
| nome | text | sim | - |
| ativo | boolean | sim | true |
| email | text | nao | null |
| created_at | timestamptz | sim | now() |

---

### Tabela: conferentes

| Campo | Tipo | Obrigatorio | Default |
|-------|------|-------------|---------|
| id | uuid (PK) | sim | gen_random_uuid() |
| nome | text | sim | - |
| ativo | boolean | sim | true |
| created_at | timestamptz | sim | now() |

---

### Tabela: docas

| Campo | Tipo | Obrigatorio | Default |
|-------|------|-------------|---------|
| id | uuid (PK) | sim | gen_random_uuid() |
| numero | integer | sim | - |
| status | text | sim | 'livre' |
| carga_id | uuid (FK -> cargas) | nao | null |
| conferente_id | uuid (FK -> conferentes) | nao | null |
| volume_conferido | integer | nao | null |
| rua | text | nao | null |
| senha_id | uuid (FK -> senhas) | nao | null |
| created_at | timestamptz | sim | now() |

Valores validos para status: 'livre', 'ocupada', 'em_conferencia', 'conferido', 'uso_consumo'

---

### Tabela: solicitacoes

| Campo | Tipo | Obrigatorio | Default |
|-------|------|-------------|---------|
| id | uuid (PK) | sim | gen_random_uuid() |
| fornecedor_id | uuid (FK -> fornecedores) | sim | - |
| tipo_caminhao | text | sim | - |
| quantidade_veiculos | integer | sim | 1 |
| volume_previsto | integer | sim | - |
| observacoes | text | nao | null |
| status | text | sim | 'pendente' |
| data_solicitacao | date | sim | current_date |
| data_agendada | date | nao | null |
| horario_agendado | text | nao | null |
| email_contato | text | sim | - |
| created_at | timestamptz | sim | now() |

Valores validos para status: 'pendente', 'aprovada', 'recusada'
Valores validos para tipo_caminhao: 'truck', 'carreta', 'bi_truck', 'van'

---

### Tabela: cargas

| Campo | Tipo | Obrigatorio | Default |
|-------|------|-------------|---------|
| id | uuid (PK) | sim | gen_random_uuid() |
| data | date | sim | - |
| fornecedor_id | uuid (FK -> fornecedores) | sim | - |
| nfs | text[] | sim | '{}' |
| volume_previsto | integer | sim | - |
| volume_conferido | integer | nao | null |
| status | text | sim | 'aguardando_chegada' |
| doca_id | uuid (FK -> docas) | nao | null |
| conferente_id | uuid (FK -> conferentes) | nao | null |
| rua | text | nao | null |
| divergencia | text | nao | null |
| chegou | boolean | nao | false |
| senha_id | uuid (FK -> senhas) | nao | null |
| horario_previsto | text | nao | null |
| tipo_caminhao | text | nao | null |
| quantidade_veiculos | integer | nao | null |
| solicitacao_id | uuid (FK -> solicitacoes) | nao | null |
| created_at | timestamptz | sim | now() |

Valores validos para status: 'aguardando_chegada', 'em_conferencia', 'conferido', 'no_show', 'recusado'

---

### Tabela: senhas

| Campo | Tipo | Obrigatorio | Default |
|-------|------|-------------|---------|
| id | uuid (PK) | sim | gen_random_uuid() |
| numero | serial | sim | auto |
| fornecedor_id | uuid (FK -> fornecedores) | sim | - |
| carga_id | uuid (FK -> cargas) | nao | null |
| doca_numero | integer | nao | null |
| status | text | sim | 'aguardando_doca' |
| hora_chegada | text | sim | - |
| nome_motorista | text | sim | - |
| tipo_caminhao | text | sim | - |
| horario_previsto | text | nao | null |
| local_atual | text | sim | 'aguardando_doca' |
| rua | text | nao | null |
| liberada | boolean | sim | false |
| created_at | timestamptz | sim | now() |

Valores validos para status: 'aguardando_doca', 'em_doca', 'aguardando_conferencia', 'conferindo', 'conferido', 'recusado'
Valores validos para local_atual: 'aguardando_doca', 'em_doca', 'em_patio'

---

### Tabela: cross_docking

| Campo | Tipo | Obrigatorio | Default |
|-------|------|-------------|---------|
| id | uuid (PK) | sim | gen_random_uuid() |
| carga_id | uuid (FK -> cargas) | sim | - |
| fornecedor_id | uuid (FK -> fornecedores) | sim | - |
| nfs | text[] | sim | '{}' |
| data | date | sim | - |
| rua | text | sim | - |
| volume_recebido | integer | sim | - |
| status | text | sim | 'aguardando_decisao' |
| numero_cross | text | nao | null |
| separador_id | uuid (FK -> conferentes) | nao | null |
| tem_divergencia | boolean | nao | null |
| observacao | text | nao | null |
| created_at | timestamptz | sim | now() |

Valores validos para status: 'aguardando_decisao', 'cross_confirmado', 'aguardando_separacao', 'em_separacao', 'finalizado'

---

## RLS (Row Level Security)

Todas as tabelas terao RLS habilitado. Como o sistema atual usa codigos fixos (sem autenticacao Supabase Auth), as politicas iniciais permitirao acesso publico para leitura e escrita (anon role), espelhando o comportamento atual do sistema.

Politicas para cada tabela:
- SELECT: permitido para anon (qualquer usuario)
- INSERT: permitido para anon
- UPDATE: permitido para anon
- DELETE: permitido para anon

Isso reflete exatamente o comportamento atual onde nao ha autenticacao real via Supabase.

---

## O QUE NAO SERA FEITO

- Nenhuma tela sera alterada
- Nenhum contexto sera alterado para usar Supabase (ainda)
- Nenhuma funcionalidade nova sera adicionada
- Nenhum campo sera adicionado alem dos que existem nos tipos
- Nenhum fluxo sera modificado
- A tabela user_roles NAO sera criada (o sistema usa codigos fixos, nao Supabase Auth)
- O Dashboard NAO tera tabela propria (usa dados calculados/mock)

---

## ORDEM DE EXECUCAO

1. Criar tabela fornecedores (sem dependencias)
2. Criar tabela conferentes (sem dependencias)
3. Criar tabela solicitacoes (depende de fornecedores)
4. Criar tabela cargas (depende de fornecedores) - sem FK para senhas ainda (circular)
5. Criar tabela senhas (depende de fornecedores, cargas)
6. Criar tabela docas (depende de cargas, conferentes, senhas)
7. Criar tabela cross_docking (depende de cargas, fornecedores, conferentes)
8. Adicionar FK de cargas.senha_id -> senhas (resolver circular)
9. Habilitar RLS em todas as tabelas
10. Criar politicas de acesso publico em todas as tabelas
11. Inserir dados mock iniciais (fornecedores, conferentes, docas) para manter paridade com o sistema atual

---

## RESULTADO ESPERADO

- Banco criado no Supabase com schema identico ao sistema atual
- Nenhuma mudanca visivel para o usuario
- Sistema continua funcionando com dados em memoria (contexts)
- Banco pronto para ser conectado numa etapa futura
