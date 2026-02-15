

# Exibir Status "Aguardando Doca" na Agenda

## Problema

Na tela Agenda, quando o motorista gera a senha (chegou = true), o nome do fornecedor fica verde (correto), mas o badge de status continua mostrando "Aguardando Chegada". Depois, quando vincula a doca, pula direto para "Aguardando Conferencia".

O usuario quer ver um status intermediario "Aguardando Doca" na Agenda, igual ao que aparece no Controle de Senhas, para refletir que o caminhao ja chegou mas ainda nao foi direcionado a uma doca.

## Solucao

Ajustar a **exibicao** do status na Agenda (sem mudar dados no banco). Quando a carga tem `chegou = true` e `status = 'aguardando_chegada'`, exibir "Aguardando Doca" em vez de "Aguardando Chegada".

## Alteracoes

### 1. `src/pages/Agenda.tsx` - Logica de status visual

Criar uma funcao auxiliar que determina o status exibido com base nos dados da carga:

```text
Se carga.chegou === true E carga.status === 'aguardando_chegada'
  -> Exibir "Aguardando Doca" (com cor azul/ciano diferenciada)
Senao
  -> Exibir o status normal da carga
```

Isso mantem o badge de status coerente com o que aparece no Controle de Senhas.

### 2. `src/pages/Agenda.tsx` - Estilo visual

Adicionar um estilo para o status "Aguardando Doca" (azul claro, similar ao usado no Controle de Senhas) para diferenciar visualmente de "Aguardando Chegada".

## Resultado esperado

```text
Motorista gera senha    -> Agenda mostra: nome verde + "Aguardando Doca"
Vincula a doca          -> Agenda mostra: "Aguardando Conferencia"
Inicia conferencia      -> Agenda mostra: "Em Conferencia"
```

## Arquivos modificados

- `src/pages/Agenda.tsx` (apenas logica de exibicao, sem alterar dados)

