
# Plano - Sistema de Senha para Caminhoneiros

## Resumo das Novas Funcionalidades

Este plano adiciona o controle de senha integrado ao agendamento, permitindo que caminhoneiros cheguem e gerem uma senha que atualiza automaticamente o status no agendamento e nas docas.

---

## 1. NOVA TELA: SENHA DO CAMINHONEIRO (Mobile)

### Descricao
Tela publica, sem login, acessivel por rota separada (`/senha`). Nao usa o Layout padrao (sem Header/Sidebar).

### Visual da Tela
```text
+----------------------------------+
|     CONTROLE DE DOCAS            |
|     Sistema de Senha             |
+----------------------------------+
|                                  |
|  Selecione o Fornecedor:         |
|  +----------------------------+  |
|  | [v] Distribuidora ABC      |  |
|  +----------------------------+  |
|                                  |
|  [  GERAR SENHA  ]               |
|                                  |
+----------------------------------+
```

### Apos Gerar Senha
```text
+----------------------------------+
|     CONTROLE DE DOCAS            |
+----------------------------------+
|                                  |
|  Fornecedor: ABC Ltda            |
|  Senha: 0042                     |
|                                  |
|  ┌────────────────────────────┐  |
|  │                            │  |
|  │   AGUARDANDO CHAMADO       │  |
|  │   (texto grande, azul)     │  |
|  │                            │  |
|  └────────────────────────────┘  |
|                                  |
|  [NOVA SENHA]                    |
+----------------------------------+
```

### Status Possiveis (Visual Grande)
| Status | Cor | Descricao |
|--------|-----|-----------|
| AGUARDANDO CHAMADO | Azul | Caminhoneiro aguarda |
| DIRIJA-SE A DOCA X | Verde | Admin vinculou a doca |
| CARGA RECUSADA | Vermelho | Carga foi recusada |

### Arquivos a Criar
- `src/pages/SenhaCaminhoneiro.tsx`

---

## 2. NOVOS TIPOS E ESTRUTURAS DE DADOS

### Interface Senha
```typescript
export interface Senha {
  id: string;
  numero: number;
  fornecedorId: string;
  cargaId?: string;
  docaNumero?: number;
  status: 'aguardando' | 'chamado' | 'recusado';
  horaChegada: string;
}
```

### Novo Campo na Carga
```typescript
// Adicionar ao tipo Carga
chegou?: boolean;  // Para controlar a cor do fornecedor no Agendamento
senhaId?: string;  // Referencia a senha gerada
```

### Arquivo a Modificar
- `src/types/index.ts`
- `src/data/mockData.ts` (dados mock de senhas)

---

## 3. CONTEXTO COMPARTILHADO (Estado Global Simulado)

### Problema
A tela do caminhoneiro precisa receber atualizacoes quando o admin vincula a carga a uma doca. Como e um prototipo visual sem backend, usaremos um contexto React para simular a comunicacao.

### Solucao
Criar `src/contexts/SenhaContext.tsx` para gerenciar:
- Lista de senhas geradas
- Funcao para gerar nova senha
- Funcao para atualizar status da senha
- Estado reativo para atualizacoes

### Arquivo a Criar
- `src/contexts/SenhaContext.tsx`

---

## 4. INTEGRACAO COM AGENDAMENTO

### Cores do Nome do Fornecedor

Regra de cores aplicada APENAS ao texto do nome do fornecedor:

| Situacao | Cor do Texto |
|----------|--------------|
| Nao chegou (chegou = false) | Preto (default) |
| Chegou (chegou = true) | Verde (text-green-600) |
| Recusado ou No-show | Vermelho (text-red-600) |

### Logica de Atualizacao
- Quando caminhoneiro gera senha -> `carga.chegou = true` -> texto verde
- Quando admin marca como Recusado/No-show -> texto vermelho

### Arquivo a Modificar
- `src/pages/Agendamento.tsx`

---

## 5. INTEGRACAO COM DOCAS

### Novo Status de Doca
Adicionar "Carga Disponivel" entre Livre e Conferindo:

| Status Atual | Novo Nome | Descricao |
|--------------|-----------|-----------|
| livre | Livre | Doca sem carga |
| ocupada | Carga Disponivel | Carga vinculada, nao conferindo ainda |
| em_conferencia | Conferindo | Em processo de conferencia |

### Fluxo Atualizado
```text
LIVRE
  |
  v (Admin vincula carga)
CARGA DISPONIVEL  <-- Caminhoneiro ve "DIRIJA-SE A DOCA X"
  |
  v (Operacional clica COMECAR)
CONFERINDO
  |
  v (Operacional clica TERMINAR)
LIVRE (liberada)
```

### Atualizacao do Status da Senha
Quando admin vincula carga a doca:
- Atualizar senha do caminhoneiro: `status = 'chamado'`, `docaNumero = X`
- Caminhoneiro ve automaticamente "DIRIJA-SE A DOCA X"

### Arquivo a Modificar
- `src/pages/Docas.tsx`
- `src/data/mockData.ts` (labels)

---

## 6. ROTEAMENTO

### Nova Rota
- `/senha` - Tela publica do caminhoneiro (sem Layout)

### Atualizacao do App.tsx
```typescript
<Route path="/senha" element={<SenhaCaminhoneiro />} />
```

### Arquivo a Modificar
- `src/App.tsx`

---

## 7. RESTRICAO DE RECUSA NA DOCA

### Regra
Apenas ADMIN pode marcar carga como Recusada quando esta na doca.

### Implementacao
Adicionar botao "Recusar Carga" nas acoes da doca (quando status = ocupada ou em_conferencia), visivel apenas para isAdmin.

Ao recusar:
- Status da carga muda para 'recusado'
- Senha do caminhoneiro muda para 'recusado'
- Doca volta para livre

### Arquivo a Modificar
- `src/pages/Docas.tsx`

---

## 8. RESUMO DOS ARQUIVOS

### Arquivos a Criar
| Arquivo | Descricao |
|---------|-----------|
| `src/pages/SenhaCaminhoneiro.tsx` | Tela mobile do caminhoneiro |
| `src/contexts/SenhaContext.tsx` | Contexto de gerenciamento de senhas |

### Arquivos a Modificar
| Arquivo | Alteracoes |
|---------|------------|
| `src/types/index.ts` | Adicionar interface Senha, campos chegou/senhaId em Carga |
| `src/data/mockData.ts` | Alterar label ocupada para "Carga Disponivel" |
| `src/App.tsx` | Adicionar rota /senha e SenhaProvider |
| `src/pages/Agendamento.tsx` | Cor do texto do fornecedor baseada em chegou/status |
| `src/pages/Docas.tsx` | Integracao com senhas, botao recusar para admin |

---

## 9. DETALHES TECNICOS

### Pagina SenhaCaminhoneiro.tsx
```typescript
// Estrutura basica
export default function SenhaCaminhoneiro() {
  const [fornecedorId, setFornecedorId] = useState<string>('');
  const [senhaGerada, setSenhaGerada] = useState<Senha | null>(null);
  
  // Selecao de fornecedor com Select
  // Botao GERAR SENHA
  // Exibicao do status em tela grande
  // Atualizacao visual quando status muda
  
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Conteudo mobile-first */}
    </div>
  );
}
```

### SenhaContext.tsx
```typescript
interface SenhaContextType {
  senhas: Senha[];
  gerarSenha: (fornecedorId: string, cargaId: string) => Senha;
  atualizarSenha: (senhaId: string, updates: Partial<Senha>) => void;
  getSenhaByFornecedor: (fornecedorId: string) => Senha | undefined;
}
```

### Cor do Fornecedor no Agendamento
```typescript
const getFornecedorColor = (carga: Carga) => {
  if (carga.status === 'recusado' || carga.status === 'no_show') {
    return 'text-red-600';
  }
  if (carga.chegou) {
    return 'text-green-600 font-semibold';
  }
  return '';  // preto default
};
```

---

## 10. FLUXO VISUAL COMPLETO

### Caminhoneiro
```text
1. Acessa /senha no celular
2. Seleciona seu fornecedor (lista)
3. Clica GERAR SENHA
4. Ve: Senha 0042 - AGUARDANDO CHAMADO
5. Fica aguardando (tela atualiza automaticamente)
6. Admin vincula -> Ve: DIRIJA-SE A DOCA 3
7. Vai ate a doca 3
```

### Admin + Operacional
```text
1. Admin ve no Agendamento: Fornecedor ABC (verde = chegou)
2. Admin vincula ABC a Doca 3 -> Status: Carga Disponivel
3. Operacional clica COMECAR CONFERENCIA
4. Operacional seleciona conferente, informa rua
5. Status: Conferindo
6. Operacional clica TERMINAR CONFERENCIA
7. Informa volume recebido, divergencia
8. Doca liberada, dados salvos no Agendamento
```

---

## 11. RESPONSIVIDADE DA TELA DE SENHA

### Design Mobile-First
- Layout centralizado
- Textos grandes e legiveis
- Botoes com area de toque ampla (min-h-14)
- Status com fonte grande (text-4xl ou text-5xl)
- Cores de alto contraste para visibilidade externa

### Sem Header/Sidebar
A tela /senha nao usa o Layout padrao, exibindo apenas o conteudo necessario para o caminhoneiro.

---

## 12. ORDEM DE IMPLEMENTACAO

1. Atualizar tipos em `src/types/index.ts`
2. Criar `src/contexts/SenhaContext.tsx`
3. Atualizar `src/data/mockData.ts` (labels e dados iniciais)
4. Criar `src/pages/SenhaCaminhoneiro.tsx`
5. Atualizar `src/App.tsx` (rota e provider)
6. Atualizar `src/pages/Agendamento.tsx` (cores do fornecedor)
7. Atualizar `src/pages/Docas.tsx` (integracao com senhas, botao recusar)
8. Testar fluxo completo

---

## 13. CONSIDERACOES FINAIS

### Prototipo Visual
Como e um prototipo sem backend, a "atualizacao automatica" sera simulada atraves de estado React compartilhado via contexto. Em producao real, isso seria feito com WebSockets ou polling.

### Acessibilidade
A tela do caminhoneiro usa cores de alto contraste e textos grandes para facilitar visualizacao em ambientes externos (patio).

### Sem Complexidade Adicional
Nao serao adicionadas telas ou estados visuais alem do especificado. O foco e na simplicidade e validacao do fluxo.
