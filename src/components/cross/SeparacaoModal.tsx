import { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useConferentesDB } from '@/hooks/useConferentesDB';
import { DivergenciasForm } from '@/components/divergencias/DivergenciasForm';
import type { DivergenciaItem } from '@/types';

interface IniciarSeparacaoModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (separadorId: string) => void;
}

export function IniciarSeparacaoModal({ open, onClose, onConfirm }: IniciarSeparacaoModalProps) {
  const [separadorId, setSeparadorId] = useState('');
  const { conferentes } = useConferentesDB();

  const handleConfirm = () => {
    if (!separadorId) return;
    onConfirm(separadorId);
    setSeparadorId('');
    onClose();
  };

  const handleClose = () => { setSeparadorId(''); onClose(); };
  const separadoresAtivos = conferentes.filter(c => c.ativo);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Começar Separação</DialogTitle></DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="separador">Separador *</Label>
            <Select value={separadorId} onValueChange={setSeparadorId}>
              <SelectTrigger><SelectValue placeholder="Selecione o separador" /></SelectTrigger>
              <SelectContent>
                {separadoresAtivos.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleConfirm} disabled={!separadorId}>Iniciar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface FinalizarSeparacaoModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (temDivergencia: boolean, observacao?: string, divergencias?: DivergenciaItem[]) => void;
  isAdmin?: boolean;
  volumeRecebido?: number;
  volumeConferidoCarga?: number;
}

export function FinalizarSeparacaoModal({ open, onClose, onConfirm, isAdmin = false, volumeRecebido, volumeConferidoCarga }: FinalizarSeparacaoModalProps) {
  const [temDivergencia, setTemDivergencia] = useState<string>('nao');
  const [divergenciaItems, setDivergenciaItems] = useState<DivergenciaItem[]>([]);
  const [showDivergenciaAlert, setShowDivergenciaAlert] = useState(false);

  const divergencia = (volumeRecebido ?? 0) - (volumeConferidoCarga ?? 0);
  const hasDivergencia = volumeRecebido !== undefined && volumeConferidoCarga !== undefined && divergencia !== 0;

  const doFinalize = () => {
    const validItems = divergenciaItems.filter(d => d.produto_codigo && d.tipo_divergencia);
    onConfirm(temDivergencia === 'sim', undefined, temDivergencia === 'sim' ? validItems : undefined);
    setTemDivergencia('nao');
    setDivergenciaItems([]);
    setShowDivergenciaAlert(false);
    onClose();
  };

  const handleConfirm = () => {
    if (hasDivergencia) {
      setShowDivergenciaAlert(true);
      return;
    }
    doFinalize();
  };

  const handleClose = () => { setTemDivergencia('nao'); setDivergenciaItems([]); setShowDivergenciaAlert(false); onClose(); };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Finalizar Separação</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            {volumeRecebido !== undefined && volumeConferidoCarga !== undefined && (
              <div className="rounded-md border p-3 space-y-1 text-sm bg-muted/50">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Volume recebido (cross):</span>
                  <span className="font-medium">{volumeRecebido}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Volume conferido (carga):</span>
                  <span className="font-medium">{volumeConferidoCarga}</span>
                </div>
                {divergencia !== 0 && (
                  <div className="flex justify-between pt-1 border-t text-destructive font-medium">
                    <span>Diferença:</span>
                    <span>{divergencia > 0 ? `+${divergencia}` : divergencia}</span>
                  </div>
                )}
              </div>
            )}
            <DivergenciasForm
              temDivergencia={temDivergencia}
              onTemDivergenciaChange={setTemDivergencia}
              items={divergenciaItems}
              onItemsChange={setDivergenciaItems}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>Cancelar</Button>
            <Button onClick={handleConfirm}>Finalizar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDivergenciaAlert} onOpenChange={setShowDivergenciaAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Divergência detectada na separação</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm">
                <p>Os volumes não conferem:</p>
                <div className="rounded-md border p-3 space-y-1 bg-muted/50">
                  <div className="flex justify-between"><span>Volume recebido:</span><span className="font-medium">{volumeRecebido}</span></div>
                  <div className="flex justify-between"><span>Volume conferido:</span><span className="font-medium">{volumeConferidoCarga}</span></div>
                  <div className="flex justify-between pt-1 border-t text-destructive font-medium"><span>Diferença:</span><span>{divergencia > 0 ? `+${divergencia}` : divergencia}</span></div>
                </div>
                <p>Deseja finalizar a separação mesmo assim?</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={doFinalize}>Finalizar mesmo assim</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
