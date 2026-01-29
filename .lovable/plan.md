

# Plano - Tela de Controle de Senhas (Interna)

## Resumo do Objetivo

Criar uma nova tela interna "Controle de Senhas" para exibicao de QR Code e lista de senhas em espera. Tela apenas de leitura, sem acoes operacionais.

---

## 1. NOVA TELA: CONTROLE DE SENHAS

### Descricao
Tela interna acessivel apenas para administradores, posicionada no menu abaixo de "Docas" e acima de "Fornecedores".

### Layout da Tela
```text
+--------------------------------------------------+
|           CONTROLE DE SENHAS                     |
|           Acompanhamento de chegadas             |
+--------------------------------------------------+
|                                                  |
|  +------------------------+  +----------------+  |
|  |                        |  |                |  |
|  |       [QR CODE]        |  |  LISTA DE      |  |
|  |                        |  |  SENHAS        |  |
|  |  Escaneie para retirar |  |                |  |
|  |      sua senha         |  |  Tabela com    |  |
|  |                        |  |  senhas        |  |
|  +------------------------+  +----------------+  |
|                                                  |
+--------------------------------------------------+
```

### Estrutura Visual
A tela tera dois blocos principais lado a lado (em desktop):
1. **Card com QR Code** (lado esquerdo)
2. **Tabela de Senhas** (lado direito)

Em mobile, os blocos ficam empilhados (QR acima, tabela abaixo).

---

## 2. BLOCO 1: QR CODE

### Elementos
- QR Code grande apontando para `/senha` (URL completa)
- Texto abaixo: "Escaneie para retirar sua senha"
- Card destacado visualmente

### Implementacao
Usar biblioteca `qrcode.react` para gerar o QR Code:

```typescript
import { QRCodeSVG } from 'qrcode.react';

// URL dinamica baseada no dominio atual
const senhaUrl = `${window.location.origin}/senha`;

<QRCodeSVG 
  value={senhaUrl}
  size={200}
  level="H"
  includeMargin={true}
/>
```

### Dependencia a Instalar
```bash
npm install qrcode.react
```

---

## 3. BLOCO 2: LISTA DE SENHAS

### Colunas da Tabela
| Coluna | Descricao |
|--------|-----------|
| Senha | Numero formatado (ex: 0001) |
| Fornecedor | Nome do fornecedor |
| Hora Chegada | Horario que gerou a senha |
| Status | Badge colorido |

### Status Possiveis
| Status | Texto Exibido | Cor |
|--------|---------------|-----|
| aguardando | Aguardando Chamado | Azul |
| chamado | Chamado para Doca X | Verde |
| recusado | Recusado | Vermelho |

### Dados
Consumir `senhas` do SenhaContext existente.

---

## 4. RESTRICOES DA TELA

### Comportamento
- Apenas leitura (sem botoes de acao)
- Nao permite editar dados
- Nao permite chamar ou vincular doca
- Nao mistura com status de conferencia
- Atualiza automaticamente quando novos dados chegam

### Acesso
- Apenas ADMIN (adminOnly: true)
- Operacional nao visualiza esta tela

---

## 5. MENU LATERAL (SIDEBAR)

### Nova Ordem dos Itens
| Posicao | Rota | Label | adminOnly |
|---------|------|-------|-----------|
| 1 | / | Dashboard | true |
| 2 | /agendamento | Agendamento | true |
| 3 | /docas | Docas | false |
| 4 | /senhas | Controle de Senhas | true |
| 5 | /fornecedores | Fornecedores | true |
| 6 | /conferentes | Conferentes | true |

### Icone
Usar icone `Ticket` do lucide-react (representa senha/bilhete).

---

## 6. ARQUIVOS A CRIAR/MODIFICAR

### Arquivos Novos
| Arquivo | Descricao |
|---------|-----------|
| `src/pages/ControleSenhas.tsx` | Nova pagina de controle de senhas |

### Arquivos a Modificar
| Arquivo | Alteracao |
|---------|-----------|
| `src/components/layout/Sidebar.tsx` | Adicionar novo item de menu |
| `src/App.tsx` | Adicionar rota /senhas com ProtectedRoute |
| `package.json` | Adicionar dependencia qrcode.react |

---

## 7. DETALHES TECNICOS

### Pagina ControleSenhas.tsx
```typescript
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { QRCodeSVG } from 'qrcode.react';
import { useSenha } from '@/contexts/SenhaContext';
import { fornecedores } from '@/data/mockData';
import { Ticket } from 'lucide-react';

export default function ControleSenhas() {
  const { senhas } = useSenha();
  
  const senhaUrl = `${window.location.origin}/senha`;
  
  const getStatusDisplay = (status: string, docaNumero?: number) => {
    switch (status) {
      case 'aguardando':
        return { text: 'Aguardando Chamado', className: 'bg-blue-100 text-blue-800' };
      case 'chamado':
        return { text: `Chamado para Doca ${docaNumero}`, className: 'bg-green-100 text-green-800' };
      case 'recusado':
        return { text: 'Recusado', className: 'bg-red-100 text-red-800' };
      default:
        return { text: status, className: '' };
    }
  };
  
  return (
    <Layout>
      {/* Header + Grid com QR e Tabela */}
    </Layout>
  );
}
```

### Atualizacao do Sidebar
```typescript
import { Ticket } from 'lucide-react';

const menuItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, adminOnly: true },
  { to: '/agendamento', label: 'Agendamento', icon: Calendar, adminOnly: true },
  { to: '/docas', label: 'Docas', icon: Container, adminOnly: false },
  { to: '/senhas', label: 'Controle de Senhas', icon: Ticket, adminOnly: true },
  { to: '/fornecedores', label: 'Fornecedores', icon: Building2, adminOnly: true },
  { to: '/conferentes', label: 'Conferentes', icon: Users, adminOnly: true },
];
```

### Atualizacao do App.tsx
```typescript
import ControleSenhas from "./pages/ControleSenhas";

// Na lista de rotas:
<Route path="/senhas" element={
  <ProtectedRoute adminOnly>
    <ControleSenhas />
  </ProtectedRoute>
} />
```

---

## 8. LAYOUT RESPONSIVO

### Desktop (lg+)
```text
+------------------------+----------------------------------+
|      QR CODE           |         TABELA DE SENHAS         |
|   (1/3 da largura)     |        (2/3 da largura)          |
+------------------------+----------------------------------+
```

### Mobile/Tablet
```text
+----------------------------------+
|           QR CODE                |
|        (largura total)           |
+----------------------------------+
|        TABELA DE SENHAS          |
|        (largura total)           |
+----------------------------------+
```

### Implementacao com Grid
```typescript
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  {/* QR Code Card - 1 coluna */}
  <Card className="lg:col-span-1">
    ...
  </Card>
  
  {/* Tabela - 2 colunas */}
  <div className="lg:col-span-2">
    ...
  </div>
</div>
```

---

## 9. VISUAL FINAL ESPERADO

### QR Code Card
```text
+---------------------------+
|    ESCANEIE PARA GERAR    |
|        SUA SENHA          |
+---------------------------+
|                           |
|      +-------------+      |
|      |             |      |
|      |  [QR CODE]  |      |
|      |             |      |
|      +-------------+      |
|                           |
|  Aponte a camera do seu   |
|  celular para o codigo    |
+---------------------------+
```

### Tabela de Senhas
```text
+--------+------------------+--------+------------------------+
| Senha  | Fornecedor       | Hora   | Status                 |
+--------+------------------+--------+------------------------+
| 0001   | ABC Distribuidora| 08:45  | [Aguardando Chamado]   |
| 0002   | Nacional SA      | 09:12  | [Chamado para Doca 3]  |
| 0003   | Express Ltda     | 09:30  | [Recusado]             |
+--------+------------------+--------+------------------------+
```

---

## 10. ORDEM DE IMPLEMENTACAO

1. Instalar dependencia `qrcode.react`
2. Criar pagina `src/pages/ControleSenhas.tsx`
3. Atualizar `src/components/layout/Sidebar.tsx` com novo item de menu
4. Atualizar `src/App.tsx` com nova rota protegida
5. Testar visualizacao do QR Code e lista de senhas

---

## 11. CONSIDERACOES FINAIS

### Seguranca
- Tela protegida por ProtectedRoute (adminOnly)
- Operacional nao tem acesso

### Atualizacao em Tempo Real
- A tela consome `senhas` do SenhaContext
- Quando uma nova senha e gerada ou atualizada, a tabela reflete automaticamente

### QR Code Dinamico
- O QR Code aponta para a URL atual do projeto + `/senha`
- Funciona tanto em ambiente de desenvolvimento quanto em producao

