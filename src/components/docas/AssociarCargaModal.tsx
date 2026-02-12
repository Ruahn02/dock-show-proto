import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Doca, Carga, Fornecedor, Senha } from '@/types';
import { statusCargaLabels } from '@/data/mockData';
import { Package, User } from 'lucide-react';

interface AssociarCargaModalProps {
  open: boolean;
  onClose: () => void;
  doca: Doca | null;
  cargas: Carga[];
  fornecedores: Fornecedor[];
  onConfirm: (cargaId: string) => void;
  senhasOrfas?: Senha[];
  onConfirmSenha?: (senhaId: string) => void;
}

const statusStyles: Record<string, string> = {
  aguardando_chegada: 'bg-purple-100 text-purple-800 border-purple-300',
  aguardando_conferencia: 'bg-blue-100 text-blue-800 border-blue-300',
  em_conferencia: 'bg-yellow-100 text-yellow-800 border-yellow-300',
};

export function AssociarCargaModal({ open, onClose, doca, cargas, fornecedores, onConfirm, senhasOrfas = [], onConfirmSenha }: AssociarCargaModalProps) {
  const getFornecedorNome = (id: string) => fornecedores.find(f => f.id === id)?.nome || 'N/A';

  const handleSelect = (cargaId: string) => {
    onConfirm(cargaId);
    onClose();
  };

  const handleSelectSenha = (senhaId: string) => {
    if (onConfirmSenha) {
      onConfirmSenha(senhaId);
      onClose();
    }
  };

  if (!doca) return null;

  const hasItems = cargas.length > 0 || senhasOrfas.length > 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Associar Carga à Doca {doca.numero}</DialogTitle>
        </DialogHeader>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {!hasItems ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma carga ou senha disponível</p>
            </div>
          ) : (
            <>
              {cargas.map((carga) => (
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
              ))}

              {senhasOrfas.length > 0 && cargas.length > 0 && (
                <div className="border-t my-2 pt-2">
                  <p className="text-xs text-muted-foreground mb-2">Senhas sem carga agendada:</p>
                </div>
              )}

              {senhasOrfas.map((senha) => (
                <Button
                  key={senha.id}
                  variant="outline"
                  className="w-full justify-start h-auto py-3 px-4 border-dashed"
                  onClick={() => handleSelectSenha(senha.id)}
                >
                  <div className="flex flex-col items-start gap-1 w-full">
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium">
                        <User className="h-3 w-3 inline mr-1" />
                        {getFornecedorNome(senha.fornecedorId)}
                      </span>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Senha {String(senha.numero).padStart(4, '0')}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Motorista: {senha.nomeMotorista}</span>
                    </div>
                  </div>
                </Button>
              ))}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
