
# Adição de Quantidade de Veículos no Agendamento Manual

## Análise

Na tela de Agendamento/Planejamento (`AgendamentoPlanejamento.tsx`), o usuário pode criar cargas manuais sem necessidade de uma Solicitação de Entrega prévia. Atualmente, o modal de criação captura a data, horário, fornecedor, notas fiscais e volume previsto. O banco de dados e o hook `useCargasDB` já possuem suporte ao campo `quantidade_veiculos` (opcional).

O objetivo é expor esse campo no modal e passá-lo ao banco de dados na criação e edição de agendamentos.

## Alterações Propostas

### 1. Estado do Modal (`src/pages/AgendamentoPlanejamento.tsx`)
Adicionar um novo estado para gerenciar o valor do input:
```typescript
const [formQuantidadeVeiculos, setFormQuantidadeVeiculos] = useState('');
```

### 2. Limpeza e Preenchimento
- Em `handleNovo`, zerar o estado: `setFormQuantidadeVeiculos('')`.
- Em `handleEdit`, preencher com os dados existentes da carga (caso existam): `setFormQuantidadeVeiculos(String(d.quantidade_veiculos || ''))`.

### 3. Submissão ao Banco (`handleSave`)
Incluir o campo no payload enviado para `criarCarga` e `atualizarCarga`:
```typescript
quantidadeVeiculos: formQuantidadeVeiculos ? parseInt(formQuantidadeVeiculos) : undefined,
```

### 4. Interface (Modal)
Adicionar o novo campo logo abaixo do campo de Volume Previsto no modal de Agendamento:
```tsx
<div className="space-y-2">
  <Label htmlFor="quantidadeVeiculos">Quantidade de Veículos (Opcional)</Label>
  <Input 
    id="quantidadeVeiculos" 
    type="number" 
    min="1" 
    value={formQuantidadeVeiculos} 
    onChange={(e) => setFormQuantidadeVeiculos(e.target.value)} 
    placeholder="Ex: 1" 
  />
</div>
```

### 5. Interface (Tabela)
Para manter a visibilidade do dado sem adicionar novas colunas (que já estão bem preenchidas), alterar a coluna "Tipo" para exibir a quantidade quando existir. Por exemplo, em vez de mostrar apenas `Truck`, mostrará `Truck (2)`.
```tsx
<TableCell>
  {d.tipo_veiculo ? (tipoCaminhaoLabels[d.tipo_veiculo] || d.tipo_veiculo) : '-'}
  {d.quantidade_veiculos && d.quantidade_veiculos > 1 ? ` (${d.quantidade_veiculos})` : ''}
</TableCell>
```
*(Para cargas sem tipo definido mas com quantidade, mostrará apenas a quantidade)*.

## Resumo
Não são necessárias alterações no banco de dados. Apenas o arquivo `AgendamentoPlanejamento.tsx` será editado para incluir o campo opcional e a visualização na tabela de planejamento.
