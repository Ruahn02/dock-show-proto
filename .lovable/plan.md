
# Integrar Resend para Envio de E-mails nas Solicitacoes

## Resumo

Quando o admin aprovar ou recusar uma solicitacao de entrega, o sistema vai enviar automaticamente um e-mail para o endereco informado pelo fornecedor (`emailContato`), notificando sobre a decisao.

## O que voce precisa fazer

1. Ter a **API Key do Resend** em maos (voce ja tem)
2. Quando eu pedir, colar a chave no campo que vai aparecer no chat
3. Pronto - o resto eu faco

## Como vai funcionar

```text
Fornecedor faz solicitacao
        |
Admin aprova ou recusa
        |
Sistema chama Edge Function "send-email"
        |
Edge Function usa Resend API
        |
E-mail enviado para o emailContato da solicitacao
```

**E-mail de aprovacao**: Informa que a entrega foi aprovada, com data e horario agendados.

**E-mail de recusa**: Informa que a solicitacao foi recusada.

## Detalhes tecnicos

### 1. Salvar a API Key do Resend como secret

A chave sera armazenada de forma segura nos secrets do Supabase (nunca exposta no codigo frontend).

### 2. Criar Edge Function `send-email`

**Arquivo:** `supabase/functions/send-email/index.ts`

A funcao recebe via POST:
- `to`: e-mail destinatario
- `type`: "aprovada" ou "recusada"
- `fornecedorNome`: nome do fornecedor
- `dataAgendada`: data agendada (se aprovada)
- `horarioAgendado`: horario (se aprovada)

Usa a API do Resend (`https://api.resend.com/emails`) para enviar o e-mail com template HTML formatado.

**Remetente**: `onboarding@resend.dev` (dominio padrao gratuito do Resend). Caso voce tenha um dominio proprio verificado no Resend, podemos trocar depois.

**Config:** `supabase/config.toml` sera atualizado com `verify_jwt = false` para a funcao, com validacao no codigo.

### 3. Atualizar o contexto de Solicitacoes

**Arquivo:** `src/contexts/SolicitacaoContext.tsx`

Nas funcoes `aprovarSolicitacao` e `recusarSolicitacao`, apos atualizar o banco, chamar a Edge Function passando os dados do e-mail. O envio do e-mail sera feito em paralelo (nao bloqueia o fluxo - se falhar, mostra um aviso mas a aprovacao/recusa ja foi salva).

### 4. Buscar nome do fornecedor

O contexto ja tem acesso ao `fornecedorId`. Vou adicionar o hook `useFornecedoresDB` no `SolicitacaoContext` para pegar o nome do fornecedor e incluir no e-mail.

## Arquivos que serao criados/modificados

| Arquivo | Alteracao |
|---------|-----------|
| `supabase/functions/send-email/index.ts` | Novo - Edge Function de envio |
| `supabase/config.toml` | Adicionar config da funcao |
| `src/contexts/SolicitacaoContext.tsx` | Chamar Edge Function apos aprovar/recusar |

## Observacoes

- O plano gratuito do Resend permite 100 e-mails/dia e 3000/mes
- O remetente padrao `onboarding@resend.dev` funciona para testes, mas para producao e recomendado verificar um dominio proprio no painel do Resend
- Se o envio do e-mail falhar, a aprovacao/recusa nao e afetada (o banco ja foi atualizado)
