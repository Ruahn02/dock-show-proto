import { useState, useEffect } from 'react';
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
import { Switch } from '@/components/ui/switch';
import { Fornecedor } from '@/types';

interface FornecedorModalProps {
  open: boolean;
  onClose: () => void;
  fornecedor?: Fornecedor | null;
  onSave: (data: Partial<Fornecedor>) => void;
}

export function FornecedorModal({ open, onClose, fornecedor, onSave }: FornecedorModalProps) {
  const [nome, setNome] = useState('');
  const [ativo, setAtivo] = useState(true);

  useEffect(() => {
    if (fornecedor) {
      setNome(fornecedor.nome);
      setAtivo(fornecedor.ativo);
    } else {
      setNome('');
      setAtivo(true);
    }
  }, [fornecedor, open]);

  const handleSave = () => {
    onSave({
      nome,
      ativo,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {fornecedor ? 'Editar Fornecedor' : 'Novo Fornecedor'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome do fornecedor"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="ativo">Ativo</Label>
            <Switch
              id="ativo"
              checked={ativo}
              onCheckedChange={setAtivo}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={!nome}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
