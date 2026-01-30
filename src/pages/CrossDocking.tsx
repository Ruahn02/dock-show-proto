import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MontarCrossModal } from '@/components/cross/MontarCrossModal';
import { IniciarSeparacaoModal, FinalizarSeparacaoModal } from '@/components/cross/SeparacaoModal';
import { useProfile } from '@/contexts/ProfileContext';
import { useCross } from '@/contexts/CrossContext';
import { fornecedores, conferentes } from '@/data/mockData';
import type { CrossDocking as CrossDockingType, StatusCross } from '@/types';
import { toast } from 'sonner';
import { ArrowRightLeft, Package, Archive } from 'lucide-react';
import { format } from 'date-fns';

const statusStyles: Record<StatusCross, string> = {
  aguardando_decisao: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  cross_confirmado: 'bg-blue-100 text-blue-800 border-blue-300',
  aguardando_separacao: 'bg-blue-100 text-blue-800 border-blue-300',
  em_separacao: 'bg-green-100 text-green-800 border-green-300',
  finalizado: 'bg-gray-100 text-gray-600 border-gray-300',
};

const statusLabels: Record<StatusCross, string> = {
  aguardando_decisao: 'Aguardando Decisão',
  cross_confirmado: 'Cross',
  aguardando_separacao: 'Aguard. Separação',
  em_separacao: 'Em Separação',
  finalizado: 'Finalizado',
};

export default function CrossDocking() {
  const { isAdmin } = useProfile();
  const { 
    getCrossParaAdmin, 
    getCrossParaOperacional,
    armazenarCarga,
    confirmarCross,
    montarCross,
    iniciarSeparacao,
    finalizarSeparacao
  } = useCross();

  // State para modais
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'armazenar' | 'cross';
    crossId: string;
  } | null>(null);
  
  const [montarModalOpen, setMontarModalOpen] = useState(false);
  const [iniciarModalOpen, setIniciarModalOpen] = useState(false);
  const [finalizarModalOpen, setFinalizarModalOpen] = useState(false);
  const [selectedCross, setSelectedCross] = useState<CrossDockingType | null>(null);

  // Dados baseados no perfil
  const crossItems = isAdmin ? getCrossParaAdmin() : getCrossParaOperacional();

  const getFornecedor = (fornecedorId: string) => 
    fornecedores.find(f => f.id === fornecedorId);

  const getSeparador = (separadorId?: string) => 
    conferentes.find(c => c.id === separadorId);

  const formatarData = (data: string) => {
    try {
      return format(new Date(data), 'dd/MM/yy');
    } catch {
      return data;
    }
  };

  // Handlers Admin
  const handleArmazenar = (cross: CrossDockingType) => {
    setConfirmDialog({ open: true, type: 'armazenar', crossId: cross.id });
  };

  const handleCross = (cross: CrossDockingType) => {
    setConfirmDialog({ open: true, type: 'cross', crossId: cross.id });
  };

  const handleConfirmDialog = () => {
    if (!confirmDialog) return;

    if (confirmDialog.type === 'armazenar') {
      armazenarCarga(confirmDialog.crossId);
      toast.success('Carga marcada para armazenamento');
    } else {
      confirmarCross(confirmDialog.crossId);
      toast.success('Carga confirmada como Cross');
    }

    setConfirmDialog(null);
  };

  const handleMontarCross = (cross: CrossDockingType) => {
    setSelectedCross(cross);
    setMontarModalOpen(true);
  };

  const handleMontarConfirm = (numeroCross: string) => {
    if (!selectedCross) return;
    montarCross(selectedCross.id, numeroCross);
    toast.success(`Cross ${numeroCross} montado - Liberado para separação`);
    setSelectedCross(null);
  };

  // Handlers Operacional
  const handleIniciarSeparacao = (cross: CrossDockingType) => {
    setSelectedCross(cross);
    setIniciarModalOpen(true);
  };

  const handleIniciarConfirm = (separadorId: string) => {
    if (!selectedCross) return;
    const separador = getSeparador(separadorId);
    iniciarSeparacao(selectedCross.id, separadorId);
    toast.success(`Separação iniciada por ${separador?.nome}`);
    setSelectedCross(null);
  };

  const handleFinalizarSeparacao = (cross: CrossDockingType) => {
    setSelectedCross(cross);
    setFinalizarModalOpen(true);
  };

  const handleFinalizarConfirm = (temDivergencia: boolean, observacao?: string) => {
    if (!selectedCross) return;
    finalizarSeparacao(selectedCross.id, temDivergencia, observacao);
    toast.success('Separação finalizada com sucesso');
    setSelectedCross(null);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <ArrowRightLeft className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Cross Docking</h1>
            <p className="text-muted-foreground">
              {isAdmin 
                ? 'Decida o destino das cargas conferidas' 
                : 'Gerencie a separação de cargas cross'}
            </p>
          </div>
        </div>

        {crossItems.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma carga aguardando {isAdmin ? 'decisão' : 'separação'}</p>
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  {isAdmin && <TableHead className="w-24">Data</TableHead>}
                  <TableHead>Fornecedor</TableHead>
                  {isAdmin && <TableHead>NF(s)</TableHead>}
                  <TableHead>Rua</TableHead>
                  {!isAdmin && <TableHead>Cross #</TableHead>}
                  <TableHead className="text-right w-28">Volume</TableHead>
                  <TableHead className="w-36">Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {crossItems.map((cross) => {
                  const fornecedor = getFornecedor(cross.fornecedorId);

                  return (
                    <TableRow key={cross.id}>
                      {isAdmin && (
                        <TableCell>{formatarData(cross.data)}</TableCell>
                      )}
                      <TableCell className="font-medium">
                        {fornecedor?.nome || '-'}
                      </TableCell>
                      {isAdmin && (
                        <TableCell>{cross.nfs.join(', ') || '-'}</TableCell>
                      )}
                      <TableCell>{cross.rua || '-'}</TableCell>
                      {!isAdmin && (
                        <TableCell className="font-bold">
                          {cross.numeroCross || '-'}
                        </TableCell>
                      )}
                      <TableCell className="text-right">
                        {cross.volumeRecebido}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusStyles[cross.status]}>
                          {statusLabels[cross.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {/* Admin: Aguardando Decisão */}
                          {isAdmin && cross.status === 'aguardando_decisao' && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleArmazenar(cross)}
                                className="gap-1"
                              >
                                <Archive className="h-4 w-4" />
                                Armazenar
                              </Button>
                              <Button 
                                size="sm"
                                onClick={() => handleCross(cross)}
                              >
                                Cross
                              </Button>
                            </>
                          )}

                          {/* Admin: Cross Confirmado */}
                          {isAdmin && cross.status === 'cross_confirmado' && (
                            <Button 
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700"
                              onClick={() => handleMontarCross(cross)}
                            >
                              Cross Montado
                            </Button>
                          )}

                          {/* Operacional: Aguardando Separação */}
                          {!isAdmin && cross.status === 'aguardando_separacao' && (
                            <Button 
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700"
                              onClick={() => handleIniciarSeparacao(cross)}
                            >
                              Começar Separação
                            </Button>
                          )}

                          {/* Operacional: Em Separação */}
                          {!isAdmin && cross.status === 'em_separacao' && (
                            <Button 
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleFinalizarSeparacao(cross)}
                            >
                              Finalizar Separação
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Confirmation Dialog */}
        <AlertDialog 
          open={confirmDialog?.open ?? false} 
          onOpenChange={(open) => !open && setConfirmDialog(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {confirmDialog?.type === 'armazenar' 
                  ? 'Confirmar Armazenamento' 
                  : 'Confirmar Cross'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {confirmDialog?.type === 'armazenar'
                  ? 'Confirmar que esta carga será ARMAZENADA?'
                  : 'Confirmar que esta carga é CROSS?'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDialog}>
                Confirmar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Modais */}
        <MontarCrossModal
          open={montarModalOpen}
          onClose={() => {
            setMontarModalOpen(false);
            setSelectedCross(null);
          }}
          onConfirm={handleMontarConfirm}
        />

        <IniciarSeparacaoModal
          open={iniciarModalOpen}
          onClose={() => {
            setIniciarModalOpen(false);
            setSelectedCross(null);
          }}
          onConfirm={handleIniciarConfirm}
        />

        <FinalizarSeparacaoModal
          open={finalizarModalOpen}
          onClose={() => {
            setFinalizarModalOpen(false);
            setSelectedCross(null);
          }}
          onConfirm={handleFinalizarConfirm}
        />
      </div>
    </Layout>
  );
}
