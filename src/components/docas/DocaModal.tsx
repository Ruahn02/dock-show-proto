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
import { Textarea } from '@/components/ui/textarea';
import { Doca, StatusCarga } from '@/types';
import { conferentes } from '@/data/mockData';

interface DocaModalProps {
  open: boolean;
  onClose: () => void;
  doca: Doca | null;
  onConfirm: (data: FinalizacaoData) => void;
  mode: 'entrar' | 'finalizar';
}

interface FinalizacaoData {
  status: StatusCarga;
  volume?: number;
  rua?: string;
  divergencia?: string;
  conferenteId?: string;
}

export function DocaModal({ open, onClose, doca, onConfirm, mode }: DocaModalProps) {
  const [status, setStatus] = useState<StatusCarga>('conferido');
  const [volume, setVolume] = useState('');
  const [rua, setRua] = useState('');
  const [divergencia, setDivergencia] = useState('');
  const [conferenteId, setConferenteId] = useState('');

  const handleConfirm = () => {
    onConfirm({
      status,
      volume: volume ? parseInt(volume) : undefined,
      rua: rua || undefined,
      divergencia: divergencia || undefined,
      conferenteId: conferenteId || undefined,
    });
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setStatus('conferido');
    setVolume('');
    setRua('');
    setDivergencia('');
    setConferenteId('');
  };

  const conferentesAtivos = conferentes.filter(c => c.ativo);

  if (!doca) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) { resetForm(); onClose(); } }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'entrar' ? `Iniciar Conferência - Doca ${doca.numero}` : `Finalizar Conferência - Doca ${doca.numero}`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {mode === 'entrar' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="conferente">Conferente</Label>
                <Select value={conferenteId} onValueChange={setConferenteId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o conferente" />
                  </SelectTrigger>
                  <SelectContent>
                    {conferentesAtivos.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rua">Rua</Label>
                <Input
                  id="rua"
                  value={rua}
                  onChange={(e) => setRua(e.target.value)}
                  placeholder="Ex: A-15"
                />
              </div>
            </>
          )}

          {mode === 'finalizar' && (
            <>
              <div className="space-y-2">
                <Label>Status Final</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as StatusCarga)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conferido">Conferido</SelectItem>
                    <SelectItem value="no_show">No Show</SelectItem>
                    <SelectItem value="recusado">Recusado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {status === 'conferido' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="volume">Volume Recebido *</Label>
                    <Input
                      id="volume"
                      type="number"
                      value={volume}
                      onChange={(e) => setVolume(e.target.value)}
                      placeholder="Quantidade de volumes"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="divergencia">Divergência (opcional)</Label>
                    <Textarea
                      id="divergencia"
                      value={divergencia}
                      onChange={(e) => setDivergencia(e.target.value)}
                      placeholder="Descreva qualquer divergência encontrada"
                      rows={3}
                    />
                  </div>
                </>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => { resetForm(); onClose(); }}>Cancelar</Button>
          <Button onClick={handleConfirm} disabled={mode === 'entrar' && !conferenteId}>
            {mode === 'entrar' ? 'Iniciar Conferência' : 'Confirmar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
