
# Plano - Tela "Acessos do Sistema"

## Resumo

Criar uma nova pagina admin-only que centraliza links fixos e QR Codes para os tres tipos de acesso do sistema: Administrativo, Operacional e Caminhoneiro.

---

## 1. NOVA PAGINA

**Novo arquivo: src/pages/Acessos.tsx**

Pagina com Layout padrao (Header + Sidebar), acessivel somente por admin.

Estrutura visual com 3 cards organizados em grid:

```text
+---------------------------+---------------------------+---------------------------+
| Acesso Administrativo     | Acesso Operacional        | Solicitacao de Senha       |
|                           |                           |                           |
| [QR Code -> /login]       | [QR Code -> /acesso]      | [QR Code -> /senha]       |
|                           |                           |                           |
| Link: /login              | Link: /acesso             | Link: /senha              |
| [Copiar]                  | [Copiar]                  | [Copiar]                  |
|                           |                           |                           |
| Descricao: Email + Senha  | Descricao: Codigo de      | Descricao: Acesso publico |
| + Codigo admin123         | acesso ACESSO123          | sem login                 |
+---------------------------+---------------------------+---------------------------+
```

Cada card contem:
- Icone identificador (Shield, User, Truck)
- Titulo da secao
- QR Code fixo gerado com `QRCodeSVG` (biblioteca `qrcode.react` ja instalada)
- URL completa exibida em texto
- Botao "Copiar" que copia para clipboard com toast de confirmacao
- Breve descricao do tipo de acesso

---

## 2. ROTA E NAVEGACAO

**Arquivo: src/App.tsx**
- Adicionar rota `/acessos` protegida com `adminOnly`

**Arquivo: src/components/layout/Sidebar.tsx**
- Adicionar item de menu "Acessos do Sistema" com icone `QrCode` (lucide-react)
- Posicionar apos "Funcionarios", `adminOnly: true`

---

## 3. ARQUIVOS ALTERADOS

| Arquivo | Alteracao |
|---------|-----------|
| src/pages/Acessos.tsx | NOVO - tela com 3 cards de QR Codes fixos |
| src/App.tsx | Adicionar rota /acessos (adminOnly) |
| src/components/layout/Sidebar.tsx | Adicionar item "Acessos do Sistema" no menu |

---

## 4. DETALHES TECNICOS

- QR Codes gerados com `QRCodeSVG` de `qrcode.react` (ja instalado)
- URLs construidas com `window.location.origin` + path fixo
- Clipboard via `navigator.clipboard.writeText()`
- Toast via `sonner` (ja configurado)
- Componentes usados: Card, CardHeader, CardContent, CardTitle, CardDescription, Button
- Icones: Shield, User, Truck, QrCode, Copy (lucide-react)
