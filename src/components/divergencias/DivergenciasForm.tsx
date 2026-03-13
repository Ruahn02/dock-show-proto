import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus, Trash2 } from 'lucide-react';
import type { DivergenciaItem } from '@/types';

const TIPO_OPTIONS: { value: string; label: string }[] = [
  { value: 'falta', label: 'Falta' },
  { value: 'sobra', label: 'Sobra' },
  { value: 'recusa', label: 'Recusa' },
  { value: 'produto_errado', label: 'Produto errado' },
  { value: 'descricao_divergente', label: 'Descrição divergente' },
  { value: 'avaria', label: 'Avaria' },
];

interface DivergenciasFormProps {
  temDivergencia: string;
  onTemDivergenciaChange: (v: string) => void;
  items: DivergenciaItem[];
  onItemsChange: (items: DivergenciaItem[]) => void;
}

const emptyItem = (): DivergenciaItem => ({
  produto_codigo: '',
  produto_descricao: '',
  quantidade: 0,
  tipo_divergencia: '',
});

export function DivergenciasForm({ temDivergencia, onTemDivergenciaChange, items, onItemsChange }: DivergenciasFormProps) {
  const handleChange = (index: number, field: keyof DivergenciaItem, value: string | number) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    onItemsChange(updated);
  };

  const addItem = () => onItemsChange([...items, emptyItem()]);
  const removeItem = (index: number) => onItemsChange(items.filter((_, i) => i !== index));

  const handleToggle = (v: string) => {
    onTemDivergenciaChange(v);
    if (v === 'sim' && items.length === 0) {
      onItemsChange([emptyItem()]);
    }
    if (v === 'nao') {
      onItemsChange([]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label>Teve divergência?</Label>
        <RadioGroup value={temDivergencia} onValueChange={handleToggle} className="flex gap-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="nao" id="div-nao" />
            <Label htmlFor="div-nao" className="font-normal">Não</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="sim" id="div-sim" />
            <Label htmlFor="div-sim" className="font-normal">Sim</Label>
          </div>
        </RadioGroup>
      </div>

      {temDivergencia === 'sim' && (
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={idx} className="border rounded-md p-3 space-y-2 bg-muted/30">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Divergência {idx + 1}</span>
                {items.length > 1 && (
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => removeItem(idx)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Código do produto"
                  value={item.produto_codigo}
                  onChange={(e) => handleChange(idx, 'produto_codigo', e.target.value)}
                />
                <Input
                  placeholder="Descrição"
                  value={item.produto_descricao}
                  onChange={(e) => handleChange(idx, 'produto_descricao', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Quantidade"
                  value={item.quantidade || ''}
                  onChange={(e) => handleChange(idx, 'quantidade', parseFloat(e.target.value) || 0)}
                />
                <Select value={item.tipo_divergencia} onValueChange={(v) => handleChange(idx, 'tipo_divergencia', v)}>
                  <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
                  <SelectContent>
                    {TIPO_OPTIONS.map(o => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" className="gap-1" onClick={addItem}>
            <Plus className="h-3 w-3" />
            Adicionar divergência
          </Button>
        </div>
      )}
    </div>
  );
}
