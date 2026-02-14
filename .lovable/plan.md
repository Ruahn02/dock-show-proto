
# Corrigir Inconsistencia de Status entre Agenda, Controle de Senhas e Docas

## Causa Raiz

Dois problemas no codigo atual:

### Problema 1: `marcarChegada` pula um passo no fluxo
Quando o motorista gera a senha, o codigo chama `marcarChegada` que faz:
```
carga.chegou = true
carga.status = 'aguardando_conferencia'  // ERRADO - deveria continuar 'aguardando_chegada'
```

O status correto ao gerar senha deveria permanecer como `aguardando_chegada` (apenas marcando `chegou = true`), pois o caminhao ainda nao foi vinculado a nenhuma doca.

### Problema 2: `getCargasDisponiveis` usa filtro que nao encontra nada
Na tela Docas, o filtro para listar cargas disponiveis e:
```
status === 'aguardando_chegada' AND chegou === true
```

Porem como `marcarChegada` ja muda o status para `aguardando_conferencia`, a carga sai do filtro e nao aparece na lista de vinculacao.

## Fluxo Correto de Status

```text
Agendamento criado    -> status = 'aguardando_chegada', chegou = false
Motorista gera senha  -> status = 'aguardando_chegada', chegou = true   (APENAS marca chegada)
Vincula a doca        -> status = 'aguardando_conferencia'              (agora sim muda status)
Inicia conferencia    -> status = 'em_conferencia'
Finaliza              -> status = 'conferido'
```

## Alteracoes

### 1. `src/contexts/SenhaContext.tsx` - Corrigir `marcarChegada`

Mudar para apenas marcar `chegou = true` e vincular `senhaId`, sem alterar o status da carga:

```typescript
const marcarChegada = useCallback(async (cargaId: string, senhaId: string) => {
  await atualizarCargaDB(cargaId, { chegou: true, senhaId });
  // NÃO muda status - continua 'aguardando_chegada'
}, [atualizarCargaDB]);
```

### 2. `src/contexts/SenhaContext.tsx` - Ajustar `getCargasDisponiveis`

O filtro ja esta correto (`status === 'aguardando_chegada' && chegou === true`), pois com a correcao acima, a carga permanecera com esse status ate ser vinculada a uma doca.

### 3. `src/pages/Docas.tsx` - Ajustar filtro de `senhasOrfas`

Atualmente filtra senhas que NAO tem carga vinculada. Porem, senhas com carga agendada tambem precisam aparecer na lista de vinculacao. O filtro de `senhasOrfas` continuara funcionando apenas para senhas sem agendamento previo, e as cargas com `chegou = true` aparecerao na lista principal de `cargasDisponiveis`.

### 4. `src/contexts/SenhaContext.tsx` - Ajustar `vincularCargaADoca`

Garantir que o status muda para `aguardando_conferencia` SOMENTE quando a carga e vinculada a uma doca (ja esta correto, apenas validar).

## Resultado

- Ao gerar senha: Agenda mostra "Aguardando Chegada" com nome verde (chegou), Controle de Senhas mostra "Aguardando Doca"
- Tela Docas lista a carga em "Vincular Carga" (pois status = aguardando_chegada E chegou = true)
- Ao vincular doca: TODAS as telas mudam para "Aguardando Conferencia"
- Fluxo 100% consistente entre as tres telas

## Arquivos Modificados

- `src/contexts/SenhaContext.tsx` (corrigir `marcarChegada`)
