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
import { Conferente } from '@/types';

interface ConferenteModalProps {
  open: boolean;
  onClose: () => void;
  conferente?: Conferente | null;
  onSave: (data: Partial<Conferente>) => void;
}

export function ConferenteModal({ open, onClose, conferente, onSave }: ConferenteModalProps) {
  const [nome, setNome] = useState('');
  const [matricula, setMatricula] = useState('');
  const [ativo, setAtivo] = useState(true);

  useEffect(() => {
    if (conferente) {
      setNome(conferente.nome);
      setMatricula(conferente.matricula);
      setAtivo(conferente.ativo);
    } else {
      setNome('');
      setMatricula('');
      setAtivo(true);
    }
  }, [conferente, open]);

  const handleSave = () => {
    onSave({
      nome,
      matricula,
      ativo,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {conferente ? 'Editar Conferente' : 'Novo Conferente'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome do conferente"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="matricula">Matrícula</Label>
            <Input
              id="matricula"
              value={matricula}
              onChange={(e) => setMatricula(e.target.value)}
              placeholder="CONF000"
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
