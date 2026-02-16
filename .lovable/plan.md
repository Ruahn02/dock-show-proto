
# Instrucoes de Navegacao na Tela do Motorista

## Objetivo

Apos gerar a senha, exibir instrucoes claras de direcionamento ao motorista com base no estado atual da senha (atualizado em tempo real via Realtime):

- **Em doca**: "Dirija-se para a Doca X"
- **Em patio**: "Dirija-se para a Rua Y"

## Como funciona

A senha ja possui os campos `docaNumero`, `localAtual` e `rua`, que sao sincronizados automaticamente via Supabase Realtime. Basta adicionar blocos condicionais na UI.

## Alteracoes

### `src/pages/SenhaCaminhoneiro.tsx`

Adicionar um bloco visual logo abaixo do status, com a seguinte logica:

```text
Se senhaGerada.localAtual === 'em_doca' E senhaGerada.docaNumero existir:
  -> Card destaque: "DIRIJA-SE PARA A DOCA {docaNumero}"

Se senhaGerada.localAtual === 'em_patio' E senhaGerada.rua existir:
  -> Card destaque: "DIRIJA-SE PARA A RUA {rua}"
```

O bloco tera estilo visual grande e destacado (similar ao badge de status) para facil leitura em ambiente externo/mobile. Sera exibido apenas quando houver doca ou rua atribuida, e desaparece automaticamente quando o status muda (ex: conferido/recusado).

Nenhuma alteracao no banco de dados ou contexto necessaria - os dados ja existem e atualizam em tempo real.
