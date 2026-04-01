

# Plano: Null Safety Global em Arrays

## O problema real

Os logs mostram dois problemas simultâneos:
1. **Supabase 503 (connection timeout)** — o banco às vezes não responde, hooks ficam com arrays vazios
2. **Crash de renderização** — quando dados chegam, campos como `nfs` vêm como `null` e o código chama `.join()` direto, causando crash que impede toda a tela de renderizar

A correção de null safety **não resolve o 503**, mas **garante que quando os dados chegarem, a tela renderize sem crash**. Hoje, mesmo quando o Supabase responde, um único campo `null` derruba a tela inteira.

## Locais a corrigir

| Arquivo | Linha | Código atual | Correção |
|---|---|---|---|
| `src/pages/Docas.tsx` | 410 | `carga?.nfs.join(', ')` | `(carga?.nfs ?? []).join(', ') \|\| '-'` |
| `src/pages/Armazenamento.tsx` | 100 | `cross.nfs.join(', ')` | `(cross.nfs ?? []).join(', ') \|\| '-'` |
| `src/pages/Agenda.tsx` | 230 | `carga.nfs?.join(', ')` | `(carga.nfs ?? []).join(', ') \|\| '-'` |
| `src/pages/Agenda.tsx` | 261 | `c.nfs?.join(', ')` | `(c.nfs ?? []).join(', ') \|\| '-'` |
| `src/pages/Agenda.tsx` | 394 | `carga.nfs?.join(', ')` | `(carga.nfs ?? []).join(', ') \|\| '-'` |

Os seguintes já estão corretos (já usam `?? []`):
- `CrossDocking.tsx:253` — OK
- `AssociarCargaModal.tsx:79` — OK
- `AgendamentoModal.tsx:44` — OK
- `AgendamentoPlanejamento.tsx:247` — tem check de length antes — OK

## Escopo

- **5 substituições pontuais** nos 3 arquivos acima
- Zero alteração em lógica de negócio, queries, ou estrutura de dados
- Apenas adicionar `?? []` antes de `.join()`

## Resultado

Quando `nfs` vier como `null` do banco, a tela continua renderizando normalmente mostrando `'-'` no lugar.

