
# Gerar PDF de Aprovacao e Recusa com Template Completo

## Resumo

Ao aprovar ou recusar uma solicitacao, o sistema gera automaticamente um PDF com o layout exato dos templates de e-mail fornecidos e inicia o download. Tambem serao adicionados novos campos no formulario de solicitacao (NF, Pedido, Comprador) e um campo de motivo obrigatorio no modal de recusa.

---

## Parte 1 - Novos campos na Solicitacao

### Banco de dados (migracao SQL)

Adicionar 3 colunas na tabela `solicitacoes`:

```text
ALTER TABLE solicitacoes ADD COLUMN nota_fiscal text;
ALTER TABLE solicitacoes ADD COLUMN numero_pedido text;
ALTER TABLE solicitacoes ADD COLUMN comprador text;
```

### Tipo TypeScript (`src/types/index.ts`)

Adicionar ao `SolicitacaoEntrega`:

```text
notaFiscal?: string;
numeroPedido?: string;
comprador?: string;
```

### Formulario do fornecedor (`src/pages/SolicitacaoEntrega.tsx`)

Adicionar 3 campos:
- **Nota Fiscal** (opcional)
- **Numero do Pedido** (obrigatorio)
- **Comprador** (obrigatorio)

### Hook (`src/hooks/useSolicitacoesDB.ts`)

Atualizar `mapFromDB` e `mapToDB` para incluir `nota_fiscal`, `numero_pedido` e `comprador`.

### Contexto (`src/contexts/SolicitacaoContext.tsx`)

Sem alteracao de logica, os novos campos passam automaticamente pelo `criarSolicitacao`.

---

## Parte 2 - Motivo da recusa (campo obrigatorio)

### Modal de recusa (`src/pages/Solicitacoes.tsx`)

Trocar o `AlertDialog` simples por um `Dialog` com:
- Campo **Motivo da Recusa** (textarea, obrigatorio)
- Botao desabilitado ate preencher o motivo

O motivo sera passado para a funcao de gerar PDF.

---

## Parte 3 - Geracao dos PDFs

### Novo arquivo: `src/lib/gerarPdfSolicitacao.ts`

Duas funcoes usando `jspdf` (ja instalado):

**`gerarPdfAprovacao(dados)`** - Layout:
- Cabecalho verde: "Agendamento de Entrega Confirmado"
- Texto introdutorio conforme template
- Bloco "Dados da Entrega": Empresa Centerlar, endereco, contato
- Bloco "Agendamento": data e horario
- Bloco "Informacoes do Pedido": NF e Pedido
- Bloco "Responsaveis": Compradores fixos + fornecedor
- Bloco "Detalhes da Carga": volumes
- Bloco "Regras e Procedimentos": 5 itens fixos
- Bloco "Politica de Comparecimento"
- Bloco "Envio antecipado de NF"

**`gerarPdfRecusa(dados)`** - Layout:
- Cabecalho vermelho: "Solicitacao de Agendamento - Nao Aprovada"
- Texto introdutorio
- Bloco "Informacoes da Solicitacao": fornecedor, pedido, NF, data/horario solicitados
- Bloco "Motivo da Recusa"
- Mensagem de orientacao
- Assinatura: Centerlar

### Integracao em `src/pages/Solicitacoes.tsx`

- Apos `handleAprovar` com sucesso: chamar `gerarPdfAprovacao(...)` com os dados da solicitacao
- Apos `handleRecusar` com sucesso: chamar `gerarPdfRecusa(...)` com os dados + motivo

---

## Arquivos modificados

| Arquivo | Alteracao |
|---|---|
| Migracao SQL | Adiciona colunas `nota_fiscal`, `numero_pedido`, `comprador` |
| `src/types/index.ts` | 3 campos opcionais no tipo `SolicitacaoEntrega` |
| `src/hooks/useSolicitacoesDB.ts` | Mapeamento dos novos campos |
| `src/pages/SolicitacaoEntrega.tsx` | 3 novos campos no formulario |
| `src/lib/gerarPdfSolicitacao.ts` | NOVO - funcoes de geracao de PDF |
| `src/pages/Solicitacoes.tsx` | Modal de recusa com motivo + chamada PDF apos aprovar/recusar |
