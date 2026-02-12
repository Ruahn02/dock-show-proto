

# Correcao de Inconsistencia entre Controle de Senhas e Docas

## Diagnostico Detalhado

### Problema 1: Senha aparece no Controle de Senhas mas nao aparece na tela Docas

**Causa raiz:** Existem DOIS caminhos paralelos para vincular a doca, e eles operam sobre entidades diferentes:

- **Tela Docas** usa `AssociarCargaModal` que lista **cargas** filtradas por `getCargasDisponiveis()` (status=aguardando_chegada + chegou=true)
- **Tela ControleSenhas** lista **senhas** e permite vincular senha a doca

Quando o motorista gera senha mas NAO existe carga agendada para aquele fornecedor no dia (ex: data errada, carga ja foi vinculada a outra senha, etc.), `marcarChegada` nao e chamado. Resultado: a senha existe e aparece no ControleSenhas, mas nenhuma carga fica disponivel no modal de Docas.

Alem disso, quando se vincula pela tela ControleSenhas, a funcao `vincularSenhaADoca` atualiza a senha e a carga, mas a doca e atualizada separadamente. Se a carga nao estiver vinculada a senha (cenario sem match), a doca fica com `carga_id=null` e aparece como "ocupada" sem informacao.

### Problema 2: Recusar carga deixa estado inconsistente

**Causa raiz identificada em `recusarCarga()` (SenhaContext linha 127-133):**

```
recusarCarga:
  carga.status -> 'recusado'      (OK)
  senha.status -> 'recusado'      (OK)
  senha.localAtual -> NAO MUDA    (BUG: continua 'em_doca')
  senha.docaNumero -> NAO LIMPA   (BUG: continua com numero)
  doca -> NAO LIMPA               (BUG: continua 'ocupada')
```

Na tela Docas, `handleRecusarCarga` chama `recusarCarga()` E depois limpa a doca. Isso funciona parcialmente. Mas:
- A senha continua com `localAtual: 'em_doca'` e `docaNumero` preenchido
- No ControleSenhas, a senha recusada aparece como "Em Doca" no local, mesmo estando recusada
- O botao "Mover para Patio" aparece porque `localAtual === 'em_doca'`
- A doca na tela Docas mostra botoes de conferencia antes de receber o update assincrono

---

## Correcoes Propostas

### Correcao 1: `recusarCarga()` deve fazer limpeza completa

**Arquivo:** `src/contexts/SenhaContext.tsx`

Alterar `recusarCarga` para:
- Definir `carga.status = 'recusado'`
- Definir `senha.status = 'recusado'`
- Definir `senha.localAtual = 'aguardando_doca'` (volta ao estado neutro)
- Limpar `senha.docaNumero = undefined`
- Localizar a doca com `senhaId` correspondente e limpa-la (status='livre', carga_id=null, senha_id=null, conferente_id=null, volume_conferido=null, rua=null)

Para isso, `recusarCarga` precisa receber acesso a `docas` e `atualizarDoca`. Como o SenhaContext nao tem acesso ao hook `useDocasDB`, ha duas opcoes:

**Opcao escolhida:** Mover a limpeza da doca para dentro de `recusarCarga` passando uma callback, OU fazer `recusarCarga` aceitar um parametro opcional de `docaId` para limpeza. A abordagem mais simples: fazer o `recusarCarga` retornar o `senhaId` afetado e deixar as telas responsaveis por limpar a doca (como ja fazem), mas corrigir a senha.

Concretamente:
- `recusarCarga` no SenhaContext atualiza carga + senha (status, localAtual, docaNumero)
- As telas Docas e ControleSenhas continuam limpando a doca apos chamar `recusarCarga`

### Correcao 2: Adicionar acao de "Recusar" no ControleSenhas

**Arquivo:** `src/pages/ControleSenhas.tsx`

Atualmente a tela ControleSenhas NAO tem botao de recusar. Quando a carga e recusada pela tela Docas, a senha no ControleSenhas nao reflete corretamente porque `localAtual` nao foi atualizado.

Apos a Correcao 1, o status sera sincronizado automaticamente via Realtime. Mas para completude, adicionar um botao de recusar no ControleSenhas para senhas que estejam em doca (`localAtual === 'em_doca'`).

### Correcao 3: Tela Docas deve mostrar cargas disponiveis OU senhas sem carga

**Arquivo:** `src/pages/Docas.tsx` e `src/components/docas/AssociarCargaModal.tsx`

O modal `AssociarCargaModal` atualmente so mostra cargas com `chegou=true`. Quando uma senha existe sem carga vinculada, nada aparece.

Solucao: no modal, alem das cargas disponiveis, listar tambem senhas ativas que estejam em `aguardando_doca` e NAO tenham carga vinculada. Ao selecionar uma senha sem carga, a doca e vinculada apenas a senha (sem cargaId).

Isso resolve o caso em que o motorista chegou, gerou senha, mas nao havia carga agendada no dia.

### Correcao 4: Proteger botoes de conferencia contra estados invalidos

**Arquivo:** `src/pages/Docas.tsx`

Adicionar verificacao extra nos botoes de acao:
- "COMECAR CONFERENCIA" so aparece se `doca.status === 'ocupada'` E `doca.senhaId` existe (confirma presenca do motorista)
- "TERMINAR CONFERENCIA" so aparece se `doca.status === 'em_conferencia'`
- Se `carga.status === 'recusado'` e a doca ainda esta ocupada, nao mostrar botoes de conferencia

---

## Resumo de arquivos

| Arquivo | Alteracao |
|---------|-----------|
| `src/contexts/SenhaContext.tsx` | `recusarCarga` limpa senha.localAtual e senha.docaNumero |
| `src/pages/Docas.tsx` | Proteger botoes contra estado invalido; verificar senhaId antes de conferencia |
| `src/pages/ControleSenhas.tsx` | Adicionar botao de Recusar para senhas em doca |
| `src/components/docas/AssociarCargaModal.tsx` | Mostrar senhas sem carga vinculada como opcao de vinculacao |

## O que NAO sera alterado

- Layout visual
- Estrutura de tabelas no Supabase
- RLS, Realtime
- Dashboard
- Tela SenhaCaminhoneiro
- Tela Agenda

