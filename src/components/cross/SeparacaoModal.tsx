import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { conferentes } from '@/data/mockData';

interface IniciarSeparacaoModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (separadorId: string) => void;
}

export function IniciarSeparacaoModal({ open, onClose, onConfirm }: IniciarSeparacaoModalProps) {
  const [separadorId, setSeparadorId] = useState('');

  const handleConfirm = () => {
    if (!separadorId) return;
    onConfirm(separadorId);
    setSeparadorId('');
    onClose();
  };

  const handleClose = () => {
    setSeparadorId('');
    onClose();
  };

  // Usa conferentes como separadores (simplificação do protótipo)
  const separadoresAtivos = conferentes.filter(c => c.ativo);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Começar Separação</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="separador">Separador *</Label>
            <Select value={separadorId} onValueChange={setSeparadorId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o separador" />
              </SelectTrigger>
              <SelectContent>
                {separadoresAtivos.map(separador => (
                  <SelectItem key={separador.id} value={separador.id}>
                    {separador.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!separadorId}
          >
            Iniciar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface FinalizarSeparacaoModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (temDivergencia: boolean, observacao?: string) => void;
}

export function FinalizarSeparacaoModal({ open, onClose, onConfirm }: FinalizarSeparacaoModalProps) {
  const [temDivergencia, setTemDivergencia] = useState<string>('nao');
  const [observacao, setObservacao] = useState('');

  const handleConfirm = () => {
    onConfirm(temDivergencia === 'sim', observacao.trim() || undefined);
    setTemDivergencia('nao');
    setObservacao('');
    onClose();
  };

  const handleClose = () => {
    setTemDivergencia('nao');
    setObservacao('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Finalizar Separação</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <Label>Houve divergência?</Label>
            <RadioGroup value={temDivergencia} onValueChange={setTemDivergencia}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sim" id="sim" />
                <Label htmlFor="sim" className="font-normal">Sim</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="nao" id="nao" />
                <Label htmlFor="nao" className="font-normal">Não</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacao">Observação (opcional)</Label>
            <Textarea
              id="observacao"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Digite uma observação..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm}>
            Finalizar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
