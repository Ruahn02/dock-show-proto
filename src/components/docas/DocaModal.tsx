import { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Doca, StatusCarga } from '@/types';
import { useConferentesDB } from '@/hooks/useConferentesDB';
import { AlertTriangle } from 'lucide-react';

interface DocaModalProps {
  open: boolean;
  onClose: () => void;
  doca: Doca | null;
  onConfirm: (data: FinalizacaoData) => void | Promise<void>;
  mode: 'entrar' | 'finalizar';
  volumePrevisto?: number;
}

interface FinalizacaoData {
  status: StatusCarga;
  volume?: number;
  rua?: string;
  divergencia?: string;
  conferenteId?: string;
}

export function DocaModal({ open, onClose, doca, onConfirm, mode, volumePrevisto }: DocaModalProps) {
  const [volume, setVolume] = useState('');
  const [rua, setRua] = useState('');
  const [divergencia, setDivergencia] = useState('');
  const [conferenteId, setConferenteId] = useState('');
  const [showDivergenciaAlert, setShowDivergenciaAlert] = useState(false);
  const { conferentes } = useConferentesDB();

  useEffect(() => {
    if (open) { resetForm(); }
  }, [open]);

  const executarConfirm = async () => {
    if (mode === 'entrar') {
      await onConfirm({ status: 'em_conferencia', conferenteId, rua: rua || undefined });
    } else {
      await onConfirm({ status: 'conferido', volume: volume ? parseInt(volume) : undefined, divergencia: divergencia || undefined });
    }
    resetForm();
    onClose();
  };

  const handleConfirm = async () => {
    if (mode === 'finalizar' && volumePrevisto !== undefined && volume && parseInt(volume) !== volumePrevisto) {
      setShowDivergenciaAlert(true);
      return;
    }
    await executarConfirm();
  };

  const handleConfirmarDivergencia = async () => {
    setShowDivergenciaAlert(false);
    await executarConfirm();
  };

  const resetForm = () => { setVolume(''); setRua(''); setDivergencia(''); setConferenteId(''); setShowDivergenciaAlert(false); };

  const conferentesAtivos = conferentes.filter(c => c.ativo);
  const isValid = mode === 'entrar' ? conferenteId !== '' : volume !== '';

  if (!doca) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) { resetForm(); onClose(); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {mode === 'entrar' 
                ? `Começar Conferência - Doca ${doca.numero}` 
                : `Terminar Conferência - Doca ${doca.numero}`}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {mode === 'entrar' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="conferente">Conferente *</Label>
                  <Select value={conferenteId} onValueChange={setConferenteId}>
                    <SelectTrigger><SelectValue placeholder="Selecione o conferente" /></SelectTrigger>
                    <SelectContent>
                      {conferentesAtivos.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rua">Rua</Label>
                  <Input id="rua" value={rua} onChange={(e) => setRua(e.target.value)} placeholder="Ex: A-15" />
                </div>
              </>
            )}
            {mode === 'finalizar' && (
              <>
                {volumePrevisto !== undefined && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
                    <span className="font-semibold">Volume previsto para este caminhão:</span>{' '}
                    {volumePrevisto} volumes
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="volume">Volume Recebido *</Label>
                  <Input id="volume" type="number" value={volume} onChange={(e) => setVolume(e.target.value)} placeholder="Quantidade de volumes recebidos" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="divergencia">Divergência (opcional)</Label>
                  <Textarea id="divergencia" value={divergencia} onChange={(e) => setDivergencia(e.target.value)} placeholder="Descreva qualquer divergência encontrada" rows={3} />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { resetForm(); onClose(); }}>Cancelar</Button>
            <Button onClick={handleConfirm} disabled={!isValid} className={mode === 'finalizar' ? 'bg-green-600 hover:bg-green-700' : ''}>
              {mode === 'entrar' ? 'Iniciar Conferência' : 'Finalizar Conferência'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDivergenciaAlert} onOpenChange={setShowDivergenciaAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              Divergência detectada
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2 pt-2">
              <p className="text-base">
                <span className="font-semibold">Volume previsto:</span> {volumePrevisto}
              </p>
              <p className="text-base">
                <span className="font-semibold">Volume informado:</span> {volume}
              </p>
              <p className="mt-3">Confirmar conferência mesmo assim?</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDivergenciaAlert(false)}>Voltar e corrigir</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmarDivergencia} className="bg-amber-600 hover:bg-amber-700">
              Confirmar divergência
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
