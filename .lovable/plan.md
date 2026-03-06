

# Unificacao Automatica de Cargas no Agendamento

## Analise

O status "agendado" nao existe no sistema. O equivalente e `aguardando_chegada` — cargas criadas que ainda nao tiveram chegada de caminhao. A unificacao deve verificar esse status.

**Pontos de criacao de cargas:**
1. `AgendamentoPlanejamento.tsx` → chama `criarCarga` do hook
2. `SenhaContext.tsx` → `adicionarCarga` (aprovacao de solicitacoes)

Ambos passam por `useCargasDB.criarCarga`, entao a logica centralizada nesse hook cobre todos os casos.

**Impacto em outros fluxos:** Nenhum. Senhas, conferencia e cross docking trabalham com `carga_id` — se a carga e unificada antes de qualquer senha ser gerada, tudo funciona normalmente. As NFs tambem serao concatenadas para nao perder informacao.

## Alteracao

### `src/hooks/useCargasDB.ts` — funcao `criarCarga`

Antes do `insert`, adicionar verificacao:

```typescript
// 1. Buscar carga existente (mesmo fornecedor + mesma data + aguardando_chegada)
const { data: existente } = await supabase
  .from('cargas')
  .select('*')
  .eq('fornecedor_id', dados.fornecedorId)
  .eq('data', dados.data)
  .eq('status', 'aguardando_chegada')
  .order('created_at', { ascending: true })
  .limit(1)
  .maybeSingle();

// 2. Se existir, atualizar somando valores
if (existente) {
  const nfsAtualizadas = [...(existente.nfs || []), ...dados.nfs];
  const { data: atualizada, error } = await supabase
    .from('cargas')
    .update({
      volume_previsto: existente.volume_previsto + dados.volumePrevisto,
      quantidade_veiculos: (existente.quantidade_veiculos || 1) + (dados.quantidadeVeiculos || 1),
      nfs: nfsAtualizadas,
    })
    .eq('id', existente.id)
    .select()
    .single();
  // retornar carga atualizada
}

// 3. Se nao existir, insert normal (codigo atual)
```

Nenhuma alteracao em banco, RPCs, triggers ou outros arquivos.

