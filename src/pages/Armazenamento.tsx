import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useCross } from '@/contexts/CrossContext';
import { useFornecedoresDB } from '@/hooks/useFornecedoresDB';
import { useConferentesDB } from '@/hooks/useConferentesDB';
import { useSenha } from '@/contexts/SenhaContext';
import type { CrossDocking } from '@/types';
import { toast } from 'sonner';
import { Archive, Package, CheckCircle, Loader2 } from 'lucide-react';
import { ConnectionError } from '@/components/ui/ConnectionError';
import { format } from 'date-fns';

export default function Armazenamento() {
  const { crossItems, armazenarCarga, loading: loadingCross, error: errorCross, refetch: refetchCross } = useCross();
  const { fornecedores } = useFornecedoresDB();
  const { conferentes } = useConferentesDB();
  const { cargas } = useSenha();
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Show items that are finalizado (awaiting storage) or armazenado (already stored)
  const itensArmazenamento = crossItems.filter(
    c => c.status === 'finalizado' || c.status === 'armazenado'
  );

  const getFornecedor = (id: string) => fornecedores.find(f => f.id === id)?.nome || '-';
  const getConferente = (cargaId: string) => {
    const carga = cargas.find(c => c.id === cargaId);
    if (!carga?.conferenteId) return '-';
    return conferentes.find(c => c.id === carga.conferenteId)?.nome || '-';
  };
  const formatarData = (data: string) => {
    try { return format(new Date(data), 'dd/MM/yy'); } catch { return data; }
  };

  const handleMarcarArmazenado = async () => {
    if (!confirmId || isProcessing) return;
    setIsProcessing(true);
    try {
      await armazenarCarga(confirmId);
      toast.success('Carga marcada como armazenada');
    } catch {
      toast.error('Erro ao armazenar carga');
    } finally {
      setIsProcessing(false);
      setConfirmId(null);
    }
  };

  if (loadingCross) return <Layout><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div></Layout>;
  if (errorCross) return <Layout><ConnectionError message={errorCross} onRetry={refetchCross} /></Layout>;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Archive className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Armazenamento</h1>
            <p className="text-muted-foreground">Gestão de cargas finalizadas e armazenadas</p>
          </div>
        </div>

        {itensArmazenamento.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma carga para armazenamento</p>
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Data</TableHead>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>NF(s)</TableHead>
                  <TableHead>Rua</TableHead>
                  <TableHead>Conferente</TableHead>
                  <TableHead className="text-right w-28">Volume</TableHead>
                  <TableHead className="w-44">Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {itensArmazenamento.map((cross) => {
                  const isArmazenado = cross.status === 'armazenado';
                  return (
                    <TableRow key={cross.id}>
                      <TableCell>{formatarData(cross.data)}</TableCell>
                      <TableCell className="font-medium">{getFornecedor(cross.fornecedorId)}</TableCell>
                      <TableCell>{cross.nfs.join(', ') || '-'}</TableCell>
                      <TableCell>{cross.rua || '-'}</TableCell>
                      <TableCell>{getConferente(cross.cargaId)}</TableCell>
                      <TableCell className="text-right">{cross.volumeRecebido}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={isArmazenado
                            ? 'bg-green-100 text-green-800 border-green-300'
                            : 'bg-blue-100 text-blue-800 border-blue-300'
                          }
                        >
                          {isArmazenado ? 'Armazenado' : 'Aguardando Armazenamento'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {!isArmazenado ? (
                          <Button
                            size="sm"
                            className="gap-1 bg-green-600 hover:bg-green-700"
                            onClick={() => setConfirmId(cross.id)}
                          >
                            <CheckCircle className="h-4 w-4" />
                            Marcar como Armazenado
                          </Button>
                        ) : (
                          <span className="text-sm text-muted-foreground italic">Concluído</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        <AlertDialog open={!!confirmId} onOpenChange={(open) => !open && setConfirmId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Armazenamento</AlertDialogTitle>
              <AlertDialogDescription>
                Deseja marcar esta carga como armazenada? Ela sairá da lista de pendentes.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isProcessing}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleMarcarArmazenado} disabled={isProcessing}>
                {isProcessing ? 'Processando...' : 'Confirmar'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}
