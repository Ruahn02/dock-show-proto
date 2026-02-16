

# Ajustes no Painel de Senhas

## Situacao Atual

- O painel exibe 3 colunas: Senha, Fornecedor, Status
- Nao mostra o nome do motorista
- Senhas em `aguardando_doca` e no patio ja estao tecnicamente incluidas pelo filtro `getSenhasAtivas()` (que filtra apenas `liberada` e `recusado`), porem o status do patio nao tem representacao visual propria

## Alteracoes

### `src/pages/PainelSenhas.tsx`

**1. Adicionar coluna "Motorista"**

Alterar o grid de 3 para 4 colunas (`grid-cols-4`). Adicionar coluna "Motorista" entre "Fornecedor" e "Status", exibindo `senha.nomeMotorista`.

**2. Status visual para patio**

Adicionar entrada no `statusPainelMap` e logica condicional para exibir instrucao de patio:
- Quando `localAtual === 'em_patio'` e `rua` existir: mostrar "PATIO - RUA {rua}" com badge roxo
- Quando `localAtual === 'em_patio'` sem rua: mostrar "NO PATIO" com badge roxo

A logica de status fica:
```text
1. Se localAtual === 'em_patio' e rua: "PATIO - RUA {rua}"
2. Se localAtual === 'em_patio' sem rua: "NO PATIO"
3. Se status === 'em_doca' e docaNumero: "DIRIJA-SE A DOCA {docaNumero}"
4. Senao: usar statusPainelMap normalmente
```

### Layout final da tabela

| Senha | Fornecedor | Motorista | Status |
|-------|-----------|-----------|--------|
| 0001  | Fornec. A | Joao Silva | AGUARDANDO DOCA |
| 0002  | Fornec. B | Carlos    | DIRIJA-SE A DOCA 3 |
| 0003  | Fornec. C | Pedro     | PATIO - RUA 5 |

Nenhuma alteracao no banco de dados ou contexto necessaria.
