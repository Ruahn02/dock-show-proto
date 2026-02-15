
# Corrigir Vinculação de Carga pela Tela DOCAS

## Problema

A tela DOCAS mostra o modal "Vincular Carga" vazio porque:

1. **Dados antigos com status errado**: Antes da correção anterior do `marcarChegada`, cargas eram automaticamente marcadas como `aguardando_conferencia` ao gerar senha. No banco, existe pelo menos 1 carga nessa situação: status `aguardando_conferencia` mas sem doca vinculada e com a senha ainda `aguardando_doca`.

2. **O filtro `getCargasDisponiveis`** busca `status === 'aguardando_chegada' AND chegou === true`. Cargas que ficaram presas com `aguardando_conferencia` nunca aparecem.

3. **O filtro de senhas órfãs** (`senhasOrfas`) exclui senhas que têm carga vinculada (`cargas.some(c => c.senhaId === s.id)`). Então a senha também não aparece.

Resultado: nem a carga nem a senha aparecem na lista do modal na tela DOCAS. Na tela CONTROLE DE SENHAS funciona porque ela lista TODAS as senhas ativas, independente do status da carga.

## Solução

Duas ações:

### 1. Corrigir dados existentes no banco (migração SQL)

Resetar cargas que ficaram presas com status `aguardando_conferencia` sem estarem vinculadas a nenhuma doca:

```sql
UPDATE cargas 
SET status = 'aguardando_chegada' 
WHERE status = 'aguardando_conferencia' 
  AND chegou = true 
  AND id NOT IN (SELECT carga_id FROM docas WHERE carga_id IS NOT NULL);
```

Isso corrige os dados que foram afetados pelo bug anterior do `marcarChegada`.

### 2. Melhorar o filtro `getCargasDisponiveis` (proteção extra)

Para evitar que isso aconteça novamente, ajustar o filtro em `src/contexts/SenhaContext.tsx` para também incluir cargas que estão com `aguardando_conferencia` mas NÃO estão associadas a nenhuma doca:

```typescript
const getCargasDisponiveis = useCallback(() => {
  return cargas.filter(c =>
    c.chegou === true &&
    (c.status === 'aguardando_chegada' || 
     (c.status === 'aguardando_conferencia' && !docas?.some(d => d.cargaId === c.id)))
  );
}, [cargas]);
```

Porém, como o contexto `SenhaContext` não tem acesso a `docas`, a abordagem mais limpa é manter o filtro simples e garantir que os dados estejam corretos (a migração resolve isso). O código anterior do `marcarChegada` já foi corrigido para não mudar o status prematuramente, então novos dados terão o status correto.

**Decisão**: Manter `getCargasDisponiveis` como está (já funciona corretamente para dados novos) e apenas corrigir os dados antigos via migração.

## Arquivos modificados

- **Migração SQL**: corrigir cargas presas com status errado no banco
- Nenhuma alteração de código necessária (a correção do `marcarChegada` da mensagem anterior já resolve para dados futuros)

## Resultado esperado

- Cargas com senha gerada e `chegou = true` voltam a ter `status = 'aguardando_chegada'`
- Aparecem corretamente no modal "Vincular Carga" da tela DOCAS
- Fluxo futuro funciona sem intervenção manual
