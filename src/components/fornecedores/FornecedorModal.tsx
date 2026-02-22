import { useState, useEffect, useMemo } from 'react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Fornecedor } from '@/types';

interface FornecedorModalProps {
  open: boolean;
  onClose: () => void;
  fornecedor?: Fornecedor | null;
  onSave: (data: Partial<Fornecedor>) => void;
  fornecedoresExistentes?: Fornecedor[];
}

export function FornecedorModal({ open, onClose, fornecedor, onSave, fornecedoresExistentes = [] }: FornecedorModalProps) {
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

  const isDuplicado = useMemo(() => {
    if (!nome.trim()) return false;
    return fornecedoresExistentes.some(
      f => f.nome.trim().toLowerCase() === nome.trim().toLowerCase() && f.id !== fornecedor?.id
    );
  }, [nome, fornecedoresExistentes, fornecedor]);

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
            {isDuplicado && (
              <Alert className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/30 text-yellow-800 dark:text-yellow-200 py-2">
                <AlertTriangle className="h-4 w-4 !text-yellow-600" />
                <AlertDescription className="text-sm">
                  Já existe um fornecedor com este nome.
                </AlertDescription>
              </Alert>
            )}
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
          <Button onClick={handleSave} disabled={!nome || isDuplicado}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
