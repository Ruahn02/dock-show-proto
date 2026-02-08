

# Plano - Ajustes Operacionais

## Resumo

Tres correcoes/complementos reais identificados apos analise do codigo atual. Varios itens solicitados ja estao implementados (filtros no Controle de Senhas, cards de Cross no Dashboard, acoes no patio, botao de transferencia). O foco sera nos itens que realmente faltam.

---

## O QUE JA EXISTE (NAO SERA ALTERADO)

- Filtros no Controle de Senhas (status, fornecedor, local) - linhas 53-64 e 205-247 de ControleSenhas.tsx
- Cards de Cross Docking no Dashboard - linhas 234-254 de Dashboard.tsx
- Acoes para cargas em patio (comecar, terminar, recusar) - linhas 645-724 de Docas.tsx
- Modal de gerenciamento de localizacao (mover patio / trocar doca) - linhas 778-876 de Docas.tsx
- Dados ficticios coerentes com data base 2026-02-04

---

## 1. ALERTA INFORMATIVO AO APROVAR AGENDAMENTO

### Problema
Ao aprovar uma solicitacao em Solicitacoes.tsx, o admin nao ve quanto volume ja esta comprometido no dia selecionado.

### Correcao

**Arquivo: src/pages/Solicitacoes.tsx**

- Importar `useSenha` para acessar cargas
- Quando o admin selecionar uma data no modal de aprovacao, calcular:
  - Total de cargas agendadas para aquele dia
  - Soma dos volumes previstos
- Exibir um alerta informativo (nao bloqueante) abaixo do seletor de data

### Exemplo visual
```text
[Data do Agendamento: 04/02/2026]

! Neste dia ja existem 5 cargas agendadas
  com total de 845 volumes previstos.

[Horario Previsto: 08:00]
```

### Componente usado
- `Alert` + `AlertDescription` (ja existe em @/components/ui/alert)

---

## 2. FORNECEDORES FILTRADOS NA TELA DO CAMINHONEIRO

### Problema
A tela /senha (SenhaCaminhoneiro.tsx) exibe TODOS os fornecedores ativos. Deveria exibir apenas fornecedores com cargas agendadas para o dia atual.

### Correcao

**Arquivo: src/pages/SenhaCaminhoneiro.tsx**

- Importar `useSenha` (ja importado) e usar `cargas`
- Filtrar fornecedores que possuem cargas agendadas para `2026-02-04`
- Se nenhum fornecedor tiver carga no dia, exibir mensagem informativa
- Manter a regra de permitir multiplas senhas do mesmo fornecedor

### Logica
```text
fornecedoresAgendados = fornecedoresAtivos.filter(f => 
  cargas.some(c => c.fornecedorId === f.id && c.data === '2026-02-04')
)
```

---

## 3. VISUALIZACAO PUBLICA DE SENHAS (PAINEL TV/CELULAR)

### Problema
Nao existe tela publica para acompanhamento de senhas em TV ou celular.

### Correcao

**Novo arquivo: src/pages/PainelSenhas.tsx**

Criar pagina publica (sem login, sem Layout) que exibe:
- Lista de todas as senhas ativas
- Colunas: Senha, Fornecedor, Status
- Status com cores claras e texto grande (otimizado para TV)
- Auto-refresh via useEffect que observa mudancas no contexto (ja reativo por usar useSenha)
- Sem acoes - somente leitura

### Status exibidos
| Status interno | Texto no painel |
|---------------|-----------------|
| aguardando_doca | AGUARDANDO DOCA |
| em_doca | DIRIJA-SE A DOCA X |
| conferindo | CONFERINDO |
| conferido | CONFERIDO |
| recusado | RECUSADO |

### Rota

**Arquivo: src/App.tsx**

Adicionar rota publica:
```text
/painel -> PainelSenhas (sem ProtectedRoute)
```

### Design
- Fundo escuro (dark) para visibilidade em TV
- Texto grande e contrastante
- Layout responsivo (funciona em celular e TV)
- Header simples: "Painel de Senhas"
- Sem sidebar, sem header de navegacao

---

## 4. PRESERVACAO DE DADOS AO MOVER CARGA (DOCAS)

### Problema identificado
Ao mover para patio em Docas.tsx (handleConfirmPatio, linha 216), a doca e limpa completamente (cargaId, conferenteId, etc). Porem, a carga no contexto SenhaContext NAO e alterada - apenas a senha muda de local. A carga continua existindo com todos os dados (fornecedor, NF, volumes, senhaId).

O problema real: quando a carga volta do patio para uma doca (handleConfirmRetomar), a doca recebe apenas `senhaId` mas NAO recebe `cargaId`. Isso faz com que a doca apareca "ocupada" mas sem dados de fornecedor/NF/volumes.

### Correcao

**Arquivo: src/pages/Docas.tsx**

No `handleConfirmRetomar` (linha 290), ao retomar do patio:
- Buscar a carga vinculada a senha (via cargas.find(c => c.senhaId === retomarSenhaId))
- Vincular o cargaId na doca junto com o senhaId

```text
// ANTES (linha 299-305)
setDocas(prev => prev.map(d => 
  d.id === doca.id ? { 
    ...d, 
    status: 'ocupada',
    senhaId: retomarSenhaId
  } : d
));

// DEPOIS
const cargaDaSenha = cargas.find(c => c.senhaId === retomarSenhaId);
setDocas(prev => prev.map(d => 
  d.id === doca.id ? { 
    ...d, 
    status: 'ocupada',
    senhaId: retomarSenhaId,
    cargaId: cargaDaSenha?.id
  } : d
));
```

---

## 5. RESUMO DOS ARQUIVOS

| Arquivo | Alteracao |
|---------|-----------|
| src/pages/Solicitacoes.tsx | Adicionar alerta informativo com cargas do dia ao aprovar |
| src/pages/SenhaCaminhoneiro.tsx | Filtrar fornecedores para apenas agendados no dia |
| src/pages/PainelSenhas.tsx | NOVO - visualizacao publica de senhas |
| src/App.tsx | Adicionar rota /painel |
| src/pages/Docas.tsx | Corrigir handleConfirmRetomar para preservar cargaId |

---

## 6. ORDEM DE IMPLEMENTACAO

1. Corrigir Docas.tsx (preservacao de dados)
2. Adicionar alerta em Solicitacoes.tsx
3. Filtrar fornecedores em SenhaCaminhoneiro.tsx
4. Criar PainelSenhas.tsx
5. Registrar rota em App.tsx

---

## 7. ITENS NAO ALTERADOS (JA FUNCIONAIS)

- Filtros no Controle de Senhas
- Cards de Cross no Dashboard
- Acoes no patio (conferencia, recusa)
- Botao de transferencia (gerenciar localizacao)
- Dados ficticios

---

## 8. RESTRICOES RESPEITADAS

- Nenhum layout alterado
- Nenhuma integracao externa (WhatsApp, SMS, email)
- Apenas 1 arquivo novo (PainelSenhas.tsx) para visualizacao publica
- Sem banco de dados
- Sem automacoes externas

