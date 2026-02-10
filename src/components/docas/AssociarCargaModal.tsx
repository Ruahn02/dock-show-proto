import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Doca, Carga, Fornecedor } from '@/types';
import { statusCargaLabels } from '@/data/mockData';
import { Package } from 'lucide-react';

interface AssociarCargaModalProps {
  open: boolean;
  onClose: () => void;
  doca: Doca | null;
  cargas: Carga[];
  fornecedores: Fornecedor[];
  onConfirm: (cargaId: string) => void;
}

const statusStyles: Record<string, string> = {
  aguardando_chegada: 'bg-purple-100 text-purple-800 border-purple-300',
  em_conferencia: 'bg-yellow-100 text-yellow-800 border-yellow-300',
};

export function AssociarCargaModal({ open, onClose, doca, cargas, fornecedores, onConfirm }: AssociarCargaModalProps) {
  const getFornecedorNome = (id: string) => fornecedores.find(f => f.id === id)?.nome || 'N/A';

  const handleSelect = (cargaId: string) => {
    onConfirm(cargaId);
    onClose();
  };

  if (!doca) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Associar Carga à Doca {doca.numero}</DialogTitle>
        </DialogHeader>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {cargas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma carga disponível</p>
            </div>
          ) : (
            cargas.map((carga) => (
              <Button
                key={carga.id}
                variant="outline"
                className="w-full justify-start h-auto py-3 px-4"
                onClick={() => handleSelect(carga.id)}
              >
                <div className="flex flex-col items-start gap-1 w-full">
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium">{getFornecedorNome(carga.fornecedorId)}</span>
                    <Badge variant="outline" className={statusStyles[carga.status]}>
                      {statusCargaLabels[carga.status]}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>NF: {carga.nfs.join(', ')}</span>
                    <span>Vol: {carga.volumePrevisto}</span>
                  </div>
                </div>
              </Button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
