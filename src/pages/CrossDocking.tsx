import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MontarCrossModal } from '@/components/cross/MontarCrossModal';
import { IniciarSeparacaoModal, FinalizarSeparacaoModal } from '@/components/cross/SeparacaoModal';
import { useProfile } from '@/contexts/ProfileContext';
import { useCross } from '@/contexts/CrossContext';
import { useFornecedoresDB } from '@/hooks/useFornecedoresDB';
import { useConferentesDB } from '@/hooks/useConferentesDB';
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
  const { getCrossParaAdmin, getCrossParaOperacional, armazenarCarga, confirmarCross, montarCross, iniciarSeparacao, finalizarSeparacao } = useCross();
  const { fornecedores } = useFornecedoresDB();
  const { conferentes } = useConferentesDB();

  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; type: 'armazenar' | 'cross'; crossId: string } | null>(null);
  const [montarModalOpen, setMontarModalOpen] = useState(false);
  const [iniciarModalOpen, setIniciarModalOpen] = useState(false);
  const [finalizarModalOpen, setFinalizarModalOpen] = useState(false);
  const [selectedCross, setSelectedCross] = useState<CrossDockingType | null>(null);

  const crossItems = isAdmin ? getCrossParaAdmin() : getCrossParaOperacional();
  const getFornecedor = (id: string) => fornecedores.find(f => f.id === id);
  const getSeparador = (id?: string) => conferentes.find(c => c.id === id);

  const formatarData = (data: string) => { try { return format(new Date(data), 'dd/MM/yy'); } catch { return data; } };

  const handleArmazenar = (cross: CrossDockingType) => { setConfirmDialog({ open: true, type: 'armazenar', crossId: cross.id }); };
  const handleCross = (cross: CrossDockingType) => { setConfirmDialog({ open: true, type: 'cross', crossId: cross.id }); };

  const handleConfirmDialog = async () => {
    if (!confirmDialog) return;
    try {
      if (confirmDialog.type === 'armazenar') { await armazenarCarga(confirmDialog.crossId); toast.success('Carga marcada para armazenamento'); }
      else { await confirmarCross(confirmDialog.crossId); toast.success('Carga confirmada como Cross'); }
    } catch { toast.error('Erro'); }
    setConfirmDialog(null);
  };

  const handleMontarCross = (cross: CrossDockingType) => { setSelectedCross(cross); setMontarModalOpen(true); };
  const handleMontarConfirm = async (numeroCross: string) => {
    if (!selectedCross) return;
    await montarCross(selectedCross.id, numeroCross);
    toast.success(`Cross ${numeroCross} montado`); setSelectedCross(null);
  };

  const handleIniciarSeparacao = (cross: CrossDockingType) => { setSelectedCross(cross); setIniciarModalOpen(true); };
  const handleIniciarConfirm = async (separadorId: string) => {
    if (!selectedCross) return;
    const separador = getSeparador(separadorId);
    await iniciarSeparacao(selectedCross.id, separadorId);
    toast.success(`Separação iniciada por ${separador?.nome}`); setSelectedCross(null);
  };

  const handleFinalizarSeparacao = (cross: CrossDockingType) => { setSelectedCross(cross); setFinalizarModalOpen(true); };
  const handleFinalizarConfirm = async (temDivergencia: boolean, observacao?: string) => {
    if (!selectedCross) return;
    await finalizarSeparacao(selectedCross.id, temDivergencia, observacao);
    toast.success('Separação finalizada'); setSelectedCross(null);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <ArrowRightLeft className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Cross Docking</h1>
            <p className="text-muted-foreground">{isAdmin ? 'Decida o destino das cargas conferidas' : 'Gerencie a separação de cargas cross'}</p>
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
                      {isAdmin && <TableCell>{formatarData(cross.data)}</TableCell>}
                      <TableCell className="font-medium">{fornecedor?.nome || '-'}</TableCell>
                      {isAdmin && <TableCell>{cross.nfs.join(', ') || '-'}</TableCell>}
                      <TableCell>{cross.rua || '-'}</TableCell>
                      {!isAdmin && <TableCell className="font-bold">{cross.numeroCross || '-'}</TableCell>}
                      <TableCell className="text-right">{cross.volumeRecebido}</TableCell>
                      <TableCell><Badge variant="outline" className={statusStyles[cross.status]}>{statusLabels[cross.status]}</Badge></TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {isAdmin && cross.status === 'aguardando_decisao' && (
                            <>
                              <Button variant="outline" size="sm" onClick={() => handleArmazenar(cross)} className="gap-1"><Archive className="h-4 w-4" />Armazenar</Button>
                              <Button size="sm" onClick={() => handleCross(cross)}>Cross</Button>
                            </>
                          )}
                          {isAdmin && cross.status === 'cross_confirmado' && (
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => handleMontarCross(cross)}>Cross Montado</Button>
                          )}
                          {!isAdmin && cross.status === 'aguardando_separacao' && (
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => handleIniciarSeparacao(cross)}>Começar Separação</Button>
                          )}
                          {!isAdmin && cross.status === 'em_separacao' && (
                            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleFinalizarSeparacao(cross)}>Finalizar Separação</Button>
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

        <AlertDialog open={confirmDialog?.open ?? false} onOpenChange={(open) => !open && setConfirmDialog(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{confirmDialog?.type === 'armazenar' ? 'Confirmar Armazenamento' : 'Confirmar Cross'}</AlertDialogTitle>
              <AlertDialogDescription>{confirmDialog?.type === 'armazenar' ? 'Confirmar que esta carga será ARMAZENADA?' : 'Confirmar que esta carga é CROSS?'}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDialog}>Confirmar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <MontarCrossModal open={montarModalOpen} onClose={() => { setMontarModalOpen(false); setSelectedCross(null); }} onConfirm={handleMontarConfirm} />
        <IniciarSeparacaoModal open={iniciarModalOpen} onClose={() => { setIniciarModalOpen(false); setSelectedCross(null); }} onConfirm={handleIniciarConfirm} />
        <FinalizarSeparacaoModal open={finalizarModalOpen} onClose={() => { setFinalizarModalOpen(false); setSelectedCross(null); }} onConfirm={handleFinalizarConfirm} />
      </div>
    </Layout>
  );
}
