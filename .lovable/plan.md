

# Diferenciar visualmente as telas de Senha e Solicitacao de Entrega

As duas telas (`/senha` e `/solicitacao`) sao muito parecidas: ambas usam o mesmo icone de caminhao, layout centralizado com card branco, e titulos de tamanho similar. A ideia e dar uma identidade visual distinta a cada uma.

## Mudancas propostas

### Tela de Senha do Caminhoneiro (`/senha`)
- Manter o icone de **Truck** mas com fundo **azul** (em vez de primary/amarelo)
- Titulo maior e mais destacado: **"SENHA DE ATENDIMENTO"** em tamanho `text-3xl`
- Subtitulo: "Controle de Docas"
- Fundo com gradiente **azul** (`from-blue-50 to-slate-100`)
- Barra colorida azul no topo do card como identificador visual

### Tela de Solicitacao de Entrega (`/solicitacao`)
- Trocar icone de **Truck** para **PackageCheck** (caixa com check, representa entrega/mercadoria)
- Titulo maior: **"SOLICITACAO DE ENTREGA"** em tamanho `text-3xl`
- Subtitulo: "Agende sua entrega com antecedencia"
- Fundo com gradiente **amarelo/dourado** (`from-amber-50 to-orange-50`)
- Barra colorida amarela/dourada no topo do card como identificador visual

## Resumo visual

```text
/senha (Caminhoneiro)          /solicitacao (Fornecedor)
+-------------------------+    +-------------------------+
| ===== BARRA AZUL ====== |    | ==== BARRA DOURADA ==== |
|                         |    |                         |
|      [Truck azul]       |    |   [PackageCheck amber]  |
|  SENHA DE ATENDIMENTO   |    | SOLICITACAO DE ENTREGA  |
|   Controle de Docas     |    | Agende sua entrega com  |
|                         |    |     antecedencia        |
|   [ formulario... ]     |    |   [ formulario... ]     |
+-------------------------+    +-------------------------+
   fundo azul claro              fundo amber claro
```

## Arquivos modificados

- `src/pages/SenhaCaminhoneiro.tsx` - gradiente azul, titulo maior, barra azul no card
- `src/pages/SolicitacaoEntrega.tsx` - icone diferente, gradiente amber, titulo maior, barra dourada no card

Nenhuma alteracao no banco de dados.

