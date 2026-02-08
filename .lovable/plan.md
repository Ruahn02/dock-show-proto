
# Plano - Acesso ao Painel de Senhas (TV)

## Resumo

Adicionar duas formas de acesso ao Painel de Senhas que ja existe em `/painel`: um botao visivel para o admin na tela de Controle de Senhas e a exibicao do link publico copiavel.

---

## O QUE JA EXISTE

- Rota `/painel` registrada em App.tsx (publica, sem login)
- Componente PainelSenhas.tsx funcionando com tema escuro e leitura apenas
- QR Code para gerar senha ja presente em ControleSenhas.tsx

---

## 1. BOTAO "PAINEL DE SENHAS (TV)" NO HEADER

**Arquivo: src/pages/ControleSenhas.tsx**

Adicionar um botao ao lado do titulo (linha 168-173) que navega para `/painel`:

- Texto: "Painel de Senhas (TV)"
- Icone: `Monitor` (lucide-react)
- Acao: abre `/painel` em nova aba (`window.open('/painel', '_blank')`)
- Posicionamento: ao lado direito do header, usando `justify-between`

---

## 2. LINK PUBLICO COPIAVEL

**Arquivo: src/pages/ControleSenhas.tsx**

Abaixo do QR Code existente (linha 192-194), adicionar:

- Texto pequeno com o link publico do painel: `/painel`
- Botao de copiar (icone `Copy`) que copia a URL completa para a area de transferencia
- Toast de confirmacao: "Link copiado!"

---

## 3. ARQUIVOS ALTERADOS

| Arquivo | Alteracao |
|---------|-----------|
| src/pages/ControleSenhas.tsx | Botao no header + link copiavel abaixo do QR Code |

Nenhum outro arquivo sera alterado.

---

## 4. DETALHES TECNICOS

### Header atualizado
```text
[Icone Ticket] Controle de Senhas              [Painel de Senhas (TV)]
               Acompanhamento de chegadas
```

### Secao do QR Code atualizada
```text
[QR Code - Gerar Senha]
Escaneie para gerar senha

---

[QR Code - Painel TV]  (menor)
Link publico: /painel  [Copiar]
```

### Imports adicionados
- `Monitor`, `Copy` de lucide-react

---

## 5. RESTRICOES RESPEITADAS

- Nenhuma tela nova criada
- Nenhuma logica alterada
- Nenhum filtro ou acao nova
- Apenas exposicao de acesso ao que ja existe
