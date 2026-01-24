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
  const [cnpj, setCnpj] = useState('');
  const [contato, setContato] = useState('');
  const [ativo, setAtivo] = useState(true);

  useEffect(() => {
    if (fornecedor) {
      setNome(fornecedor.nome);
      setCnpj(fornecedor.cnpj);
      setContato(fornecedor.contato);
      setAtivo(fornecedor.ativo);
    } else {
      setNome('');
      setCnpj('');
      setContato('');
      setAtivo(true);
    }
  }, [fornecedor, open]);

  const handleSave = () => {
    onSave({
      nome,
      cnpj,
      contato,
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

          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input
              id="cnpj"
              value={cnpj}
              onChange={(e) => setCnpj(e.target.value)}
              placeholder="00.000.000/0001-00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contato">Contato</Label>
            <Input
              id="contato"
              value={contato}
              onChange={(e) => setContato(e.target.value)}
              placeholder="(00) 00000-0000"
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
          <Button onClick={handleSave}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
