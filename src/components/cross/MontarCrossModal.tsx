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

interface MontarCrossModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (numeroCross: string) => void;
}

export function MontarCrossModal({ open, onClose, onConfirm }: MontarCrossModalProps) {
  const [numeroCross, setNumeroCross] = useState('');

  const handleConfirm = () => {
    if (!numeroCross.trim()) return;
    onConfirm(numeroCross.trim());
    setNumeroCross('');
    onClose();
  };

  const handleClose = () => {
    setNumeroCross('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Montar Cross</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="numeroCross">Número do Cross *</Label>
            <Input
              id="numeroCross"
              value={numeroCross}
              onChange={(e) => setNumeroCross(e.target.value)}
              placeholder="Digite o número do cross"
              autoFocus
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!numeroCross.trim()}
          >
            Montar Cross
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
