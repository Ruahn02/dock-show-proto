
# Detectar Fornecedor Duplicado e Unificar Cargas na Aprovacao

## Resumo

Quando o admin aprovar uma solicitacao para um fornecedor que ja tem carga agendada no mesmo dia, o sistema vai:
1. Mostrar um alerta amarelo avisando que ja existe carga daquele fornecedor naquele dia
2. Dar a opcao de **unificar** (somar volumes e manter uma unica carga) ou **criar separado**
3. Se unificar: atualiza a carga existente somando os volumes, e marca a solicitacao como aprovada sem criar nova carga

Nao precisa mexer no banco de dados -- a logica e toda no frontend.

## Alteracoes

### 1. `src/pages/Solicitacoes.tsx` - Alerta de duplicidade + opcao de unificar

Quando o admin selecionar uma data no modal de aprovacao:
- Verificar se ja existe carga do **mesmo fornecedor** naquela data
- Se existir, mostrar um alerta amarelo/laranja com os detalhes da carga existente (volume, horario)
- Adicionar um checkbox "Unificar com a carga existente (somar volumes)"
- Se marcado, ao confirmar: atualiza a carga existente em vez de criar nova

### 2. `src/contexts/SolicitacaoContext.tsx` - Nova funcao `aprovarSolicitacaoUnificada`

Criar uma variante da aprovacao que, em vez de chamar `adicionarCarga`, chama `atualizarCarga` na carga existente:
- Soma `volumePrevisto` da solicitacao ao volume da carga existente
- Soma `quantidadeVeiculos`
- Marca a solicitacao como aprovada com a mesma data/horario
- Envia o e-mail normalmente

### 3. Interface do contexto - Expor a nova funcao

Adicionar `aprovarSolicitacaoUnificada(id, cargaExistenteId)` na interface `SolicitacaoContextType`.

## Detalhes tecnicos

### Fluxo de deteccao (no modal de aprovacao)

```text
Admin seleciona data no calendario
        |
Filtra cargas: mesmo fornecedorId + mesma data
        |
Se encontrar carga existente:
  -> Mostra alerta laranja: "Fornecedor X ja tem carga neste dia (Volume: Y)"
  -> Mostra checkbox: "Unificar cargas"
        |
Se checkbox marcado:
  -> Botao muda para "Confirmar e Unificar"
  -> Ao clicar: chama aprovarSolicitacaoUnificada()
        |
Se checkbox NAO marcado:
  -> Comportamento normal: cria nova carga separada
```

### Logica de unificacao (no contexto)

```typescript
const aprovarSolicitacaoUnificada = async (
  solicitacaoId: string, 
  cargaExistenteId: string,
  dataAgendada: string,
  horarioAgendado: string
) => {
  const sol = solicitacoes.find(s => s.id === solicitacaoId);
  const cargaExistente = cargas.find(c => c.id === cargaExistenteId);
  
  // 1. Marcar solicitacao como aprovada
  await atualizarDB(solicitacaoId, { status: 'aprovada', dataAgendada, horarioAgendado });
  
  // 2. Atualizar carga existente (somar volumes e veiculos)
  await atualizarCarga(cargaExistenteId, {
    volumePrevisto: (cargaExistente.volumePrevisto || 0) + (sol.volumePrevisto || 0),
    quantidadeVeiculos: (cargaExistente.quantidadeVeiculos || 0) + (sol.quantidadeVeiculos || 0),
  });
  
  // 3. Enviar e-mail
  enviarEmail({ ... });
};
```

### UI do alerta no modal

Quando detectar duplicidade, exibir abaixo do calendario:
- Alerta laranja com icone de atencao
- Texto: "O fornecedor **[nome]** ja possui **1 carga** agendada neste dia com **X volumes** previstos."
- Checkbox: "Unificar com a carga existente (os volumes serao somados)"

## Arquivos modificados

- `src/pages/Solicitacoes.tsx` -- alerta de duplicidade + checkbox de unificacao
- `src/contexts/SolicitacaoContext.tsx` -- nova funcao `aprovarSolicitacaoUnificada`
