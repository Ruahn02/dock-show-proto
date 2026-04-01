

# Plano: Eliminar requisições duplicadas e escalonar carregamento

## Diagnóstico (confirmado pelos logs e código)

Ao abrir `/agendamento`, o app dispara **9 requisições simultâneas**, sendo 2 duplicadas:

```text
PROVIDERS (sempre montados):
  SenhaProvider    → useSenhasDB()        → senhas
                   → useCargasDB()        → cargas          ← 1x
  CrossProvider    → useCrossDB()         → cross_docking
  SolicitacaoProvider → useSolicitacoesDB() → solicitacoes
                      → useFornecedoresDB() → fornecedores  ← 1x

PÁGINA AgendamentoPlanejamento:
  useFluxoOperacional()  → vw_carga_operacional
  useCargasDB()          → cargas              ← DUPLICADO!
  useFornecedoresDB()    → fornecedores        ← DUPLICADO!
  useTiposVeiculoDB()    → tipos_veiculo

TOTAL: 9 requests simultâneas (7 únicas + 2 duplicadas)
```

Mesma duplicação em outras páginas:
- **Docas.tsx**: `useFornecedoresDB()` duplicado (já está no SolicitacaoProvider)
- **Dashboard.tsx**: `useCrossDB()` duplicado (já está no CrossProvider)

O free tier do Supabase rejeita com 503 quando recebe 9+ requests simultâneas.

## Solução: 2 ações cirúrgicas

### 1) Eliminar hooks duplicados nas páginas

As páginas devem consumir dados dos contexts que já existem, em vez de chamar o hook novamente.

| Arquivo | Hook duplicado | Substituir por |
|---|---|---|
| `AgendamentoPlanejamento.tsx` | `useCargasDB()` | `useSenha()` → já expõe `cargas` |
| `AgendamentoPlanejamento.tsx` | `useFornecedoresDB()` | Expor `fornecedores` via `SolicitacaoContext` |
| `Docas.tsx` | `useFornecedoresDB()` | Idem |
| `Dashboard.tsx` | `useCrossDB()` | `useCross()` → já expõe `crossItems` |

**Resultado**: de 9 requests para **7 requests únicas**.

### 2) Escalonar os providers com delay simples

Os 3 providers disparam 5 requests no mesmo instante. Adicionar um delay simples no mount de `CrossProvider` e `SolicitacaoProvider` para escalonar:

- `SenhaProvider`: carrega imediato (senhas + cargas)
- `CrossProvider`: delay de 500ms antes do fetch
- `SolicitacaoProvider`: delay de 1000ms antes do fetch

Os hooks de página (`useFluxoOperacional`, `useTiposVeiculoDB`, `useDocasDB`) mantêm fetch imediato.

**Resultado**: máximo de 3-4 requests simultâneas em vez de 7+.

## Detalhes técnicos

### Arquivo: `src/contexts/SolicitacaoContext.tsx`
- Já importa `useFornecedoresDB()` internamente
- Expor `fornecedores` no context value (adicionar ao tipo e ao Provider value)

### Arquivo: `src/pages/AgendamentoPlanejamento.tsx`
- Remover `import { useCargasDB }` e `import { useFornecedoresDB }`
- Usar `const { cargas } = useSenha()` (já importa useSenha indiretamente)
- Usar `const { fornecedores } = useSolicitacao()` (novo campo exposto)

### Arquivo: `src/pages/Docas.tsx`
- Remover `import { useFornecedoresDB }`
- Usar `const { fornecedores } = useSolicitacao()` (ou importar do SolicitacaoContext)

### Arquivo: `src/pages/Dashboard.tsx`
- Remover `import { useCrossDB }`
- Usar `const { crossItems } = useCross()`

### Escalonamento nos providers
- `CrossProvider`: wrapping do fetch inicial com `setTimeout(() => refetch(), 500)`
- `SolicitacaoProvider`: wrapping do fetch inicial com `setTimeout(() => refetch(), 1000)`
- Implementado via flag `initialDelayDone` nos hooks internos, ou diretamente no useEffect do provider

## Arquivos alterados

| Arquivo | Alteração |
|---|---|
| `src/contexts/SolicitacaoContext.tsx` | Expor `fornecedores` no context |
| `src/pages/AgendamentoPlanejamento.tsx` | Remover hooks duplicados, usar contexts |
| `src/pages/Docas.tsx` | Remover `useFornecedoresDB`, usar context |
| `src/pages/Dashboard.tsx` | Remover `useCrossDB`, usar `useCross` |
| `src/contexts/CrossContext.tsx` | Delay de 500ms no fetch inicial |
| `src/contexts/SolicitacaoContext.tsx` | Delay de 1000ms no fetch inicial |

## Resultado esperado

- De 9 requests simultâneas para **máx 3-4 simultâneas**
- Zero duplicação
- Sem nova arquitetura, sem filas, sem abstrações
- O 503 deve desaparecer porque o gateway consegue lidar com 3-4 requests
- Sem alteração de lógica de negócio ou banco

