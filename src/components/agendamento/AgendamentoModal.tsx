import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fornecedores } from '@/data/mockData';
import { Carga } from '@/types';

interface AgendamentoModalProps {
  open: boolean;
  onClose: () => void;
  carga?: Carga | null;
  onSave: (data: Partial<Carga>) => void;
}

export function AgendamentoModal({ open, onClose, carga, onSave }: AgendamentoModalProps) {
  const [data, setData] = useState(carga?.data || new Date().toISOString().split('T')[0]);
  const [fornecedorId, setFornecedorId] = useState(carga?.fornecedorId || '');
  const [nfs, setNfs] = useState(carga?.nfs.join(', ') || '');
  const [volumePrevisto, setVolumePrevisto] = useState(carga?.volumePrevisto?.toString() || '');

  const handleSave = () => {
    onSave({
      data,
      fornecedorId,
      nfs: nfs.split(',').map(nf => nf.trim()),
      volumePrevisto: parseInt(volumePrevisto) || 0,
    });
    onClose();
  };

  const fornecedoresAtivos = fornecedores.filter(f => f.ativo);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {carga ? 'Editar Agendamento' : 'Novo Agendamento'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="data">Data</Label>
            <Input
              id="data"
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fornecedor">Fornecedor</Label>
            <Select value={fornecedorId} onValueChange={setFornecedorId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o fornecedor" />
              </SelectTrigger>
              <SelectContent>
                {fornecedoresAtivos.map(f => (
                  <SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nfs">Notas Fiscais</Label>
            <Input
              id="nfs"
              value={nfs}
              onChange={(e) => setNfs(e.target.value)}
              placeholder="NF-001, NF-002, NF-003"
            />
            <p className="text-xs text-muted-foreground">Separe múltiplas NFs por vírgula</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="volume">Volume Previsto</Label>
            <Input
              id="volume"
              type="number"
              value={volumePrevisto}
              onChange={(e) => setVolumePrevisto(e.target.value)}
              placeholder="Quantidade de volumes"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
