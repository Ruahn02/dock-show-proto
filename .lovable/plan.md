

# Persistencia de Senhas no Dispositivo do Motorista

## Problema

Quando o motorista gera uma senha e acidentalmente sai da tela ou atualiza a pagina, ele perde a referencia da senha e volta para a tela de gerar nova senha.

## Solucao

Usar **localStorage** para identificar o dispositivo e guardar os IDs das senhas geradas nele. Ao acessar `/senha`, o sistema verifica se existem senhas ativas vinculadas ao dispositivo.

## Fluxo do usuario

```text
Motorista acessa /senha
        |
        v
  Tem senhas ativas no dispositivo?
        |
   SIM  |  NAO
   |         |
   v         v
 Tela com 2 botoes:          Vai direto para
 [Solicitar Nova Senha]      formulario de
 [Minhas Senhas]             gerar senha
        |
        v (Minhas Senhas)
 Lista de senhas do dia
 vinculadas ao dispositivo
 (clicando em uma, abre o
  acompanhamento em tempo real)
```

## Como funciona a identificacao do dispositivo

- Na primeira visita, gera um UUID aleatorio e salva no localStorage com a chave `dock_device_id`
- Cada vez que o motorista gera uma senha, o ID da senha e salvo em um array no localStorage: `dock_device_senhas`
- Nao precisa alterar o banco de dados -- tudo fica no navegador do motorista
- Como o localStorage persiste entre refreshes e fechamentos de aba, o motorista nunca perde suas senhas

## Telas

### 1. Tela inicial (quando tem senhas ativas)
- Header com icone do caminhao (igual ao atual)
- Dois botoes grandes:
  - "SOLICITAR NOVA SENHA" - vai para o formulario de gerar senha
  - "MINHAS SENHAS" - mostra lista de senhas do dispositivo

### 2. Tela "Minhas Senhas"
- Lista das senhas geradas neste dispositivo (filtradas pelo dia de hoje)
- Cada item mostra: numero da senha, fornecedor, status atual
- Senhas ativas (nao conferidas/recusadas) ficam destacadas
- Ao clicar em uma senha, abre a tela de acompanhamento (a mesma que ja existe)
- Botao "Voltar" para retornar a tela inicial

### 3. Formulario e acompanhamento
- Permanecem iguais ao atual
- Apos gerar senha, salva o ID no localStorage automaticamente

## Alteracoes tecnicas

### `src/pages/SenhaCaminhoneiro.tsx`

Refatorar o componente para ter 3 "views" controladas por estado:

1. **View "menu"**: Exibe os 2 botoes (solicitar nova / minhas senhas). So aparece se existem senhas salvas no dispositivo. Se nao existem, pula direto para "formulario".

2. **View "formulario"**: O formulario atual de gerar senha. Apos gerar, salva o ID da senha no localStorage e muda para view "acompanhamento".

3. **View "minhasSenhas"**: Lista de senhas do dispositivo. Ao clicar em uma, muda para view "acompanhamento" com aquele ID.

4. **View "acompanhamento"**: A tela de status atual (ja existe). Adiciona botao "Voltar" para ir ao menu.

Logica de localStorage:
- `getDeviceId()`: retorna ou cria UUID do dispositivo
- `saveDeviceSenha(senhaId)`: adiciona ID ao array salvo
- `getDeviceSenhas()`: retorna array de IDs salvos
- Filtrar senhas do contexto que pertencem ao dispositivo e sao do dia de hoje

### Nenhuma alteracao no banco de dados

Tudo e resolvido com localStorage no navegador. A tabela `senhas` nao precisa de coluna nova.

| Arquivo | Alteracao |
|---|---|
| `src/pages/SenhaCaminhoneiro.tsx` | Adicionar sistema de views com menu, lista de senhas e persistencia via localStorage |

