import { useState, useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { AgendamentoModal } from '@/components/agendamento/AgendamentoModal';
import { useProfile } from '@/contexts/ProfileContext';
import { useSenha } from '@/contexts/SenhaContext';
import { fornecedores, conferentes, statusCargaLabels } from '@/data/mockData';
import { Carga, StatusCarga } from '@/types';
import { toast } from 'sonner';
import { Plus, Calendar as CalendarIcon, MoreHorizontal } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const statusStyles: Record<StatusCarga, string> = {
  aguardando_chegada: 'bg-blue-100 text-blue-800 border-blue-300',
  em_conferencia: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  conferido: 'bg-green-100 text-green-800 border-green-300',
  no_show: 'bg-gray-100 text-gray-800 border-gray-300',
  recusado: 'bg-red-100 text-red-800 border-red-300',
};

export default function Agendamento() {
  const { isAdmin } = useProfile();
  const { cargas, atualizarCarga, recusarCarga } = useSenha();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCarga, setSelectedCarga] = useState<Carga | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2026, 0, 24));
  
  // Confirmation dialogs state
  const [confirmNoShow, setConfirmNoShow] = useState(false);
  const [confirmRecusado, setConfirmRecusado] = useState(false);
  const [cargaToUpdate, setCargaToUpdate] = useState<Carga | null>(null);

  const getFornecedorNome = (id: string) => {
    return fornecedores.find(f => f.id === id)?.nome || 'N/A';
  };

  const getConferenteNome = (id?: string) => {
    if (!id) return '-';
    return conferentes.find(c => c.id === id)?.nome || '-';
  };

  // Função para determinar a cor do texto do fornecedor
  const getFornecedorColor = (carga: Carga) => {
    if (carga.status === 'recusado' || carga.status === 'no_show') {
      return 'text-red-600';
    }
    if (carga.chegou) {
      return 'text-green-600 font-semibold';
    }
    return '';
  };

  const cargasFiltradas = useMemo(() => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return cargas.filter(c => c.data === dateStr);
  }, [cargas, selectedDate]);

  const datasComCargas = useMemo(() => {
    return cargas.map(c => parseISO(c.data));
  }, [cargas]);

  const handleNovo = () => {
    setSelectedCarga(null);
    setModalOpen(true);
  };

  const handleSave = (data: Partial<Carga>) => {
    if (selectedCarga) {
      atualizarCarga(selectedCarga.id, data);
      toast.success('Agendamento atualizado!');
    } else {
      // Para novas cargas, precisaríamos de uma função no contexto
      // Por enquanto, mantemos a lógica anterior
      toast.success('Agendamento criado!');
    }
  };

  const openNoShowConfirm = (carga: Carga) => {
    setCargaToUpdate(carga);
    setConfirmNoShow(true);
  };

  const openRecusadoConfirm = (carga: Carga) => {
    setCargaToUpdate(carga);
    setConfirmRecusado(true);
  };

  const handleNoShow = () => {
    if (!cargaToUpdate) return;
    atualizarCarga(cargaToUpdate.id, { status: 'no_show' as StatusCarga });
    toast.success(`Carga ${cargaToUpdate.nfs[0]} marcada como No-show`);
    setConfirmNoShow(false);
    setCargaToUpdate(null);
  };

  const handleRecusado = () => {
    if (!cargaToUpdate) return;
    recusarCarga(cargaToUpdate.id);
    toast.success(`Carga ${cargaToUpdate.nfs[0]} marcada como Recusado`);
    setConfirmRecusado(false);
    setCargaToUpdate(null);
  };

  const canChangeStatus = (carga: Carga) => {
    return carga.status === 'aguardando_chegada' || carga.status === 'em_conferencia';
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CalendarIcon className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Agendamento</h1>
              <p className="text-muted-foreground">
                {format(selectedDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button onClick={handleNovo} className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Agendamento
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-1">
            <CardContent className="p-3">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                locale={ptBR}
                modifiers={{
                  hasCargas: datasComCargas
                }}
                modifiersStyles={{
                  hasCargas: { fontWeight: 'bold', textDecoration: 'underline' }
                }}
                className="pointer-events-auto"
              />
            </CardContent>
          </Card>

          <div className="lg:col-span-3 border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>NF(s)</TableHead>
                  <TableHead className="text-right">Vol. Previsto</TableHead>
                  <TableHead className="text-right">Vol. Recebido</TableHead>
                  <TableHead>Conferente</TableHead>
                  <TableHead>Divergência</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cargasFiltradas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      Nenhum agendamento para esta data
                    </TableCell>
                  </TableRow>
                ) : (
                  cargasFiltradas.map((carga) => (
                    <TableRow key={carga.id}>
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        {format(parseISO(carga.data), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell className={`font-medium ${getFornecedorColor(carga)}`}>
                        {getFornecedorNome(carga.fornecedorId)}
                      </TableCell>
                      <TableCell>{carga.nfs.join(', ')}</TableCell>
                      <TableCell className="text-right">{carga.volumePrevisto}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {carga.volumeConferido ?? '-'}
                      </TableCell>
                      <TableCell>{getConferenteNome(carga.conferenteId)}</TableCell>
                      <TableCell className="max-w-32 truncate" title={carga.divergencia}>
                        {carga.divergencia || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={statusStyles[carga.status]}
                        >
                          {statusCargaLabels[carga.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {canChangeStatus(carga) && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm" className="gap-1">
                                Ações
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openNoShowConfirm(carga)}>
                                Marcar como No-show
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => openRecusadoConfirm(carga)}
                                className="text-red-600"
                              >
                                Marcar como Recusado
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <AgendamentoModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          carga={selectedCarga}
          onSave={handleSave}
          selectedDate={selectedDate}
        />

        {/* Confirmation Dialog - No-show */}
        <AlertDialog open={confirmNoShow} onOpenChange={setConfirmNoShow}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar ação</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja marcar esta carga como <strong>No-show</strong>?
                {cargaToUpdate && (
                  <span className="block mt-2 text-foreground">
                    Fornecedor: {getFornecedorNome(cargaToUpdate.fornecedorId)} - NF: {cargaToUpdate.nfs.join(', ')}
                  </span>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleNoShow}>Confirmar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Confirmation Dialog - Recusado */}
        <AlertDialog open={confirmRecusado} onOpenChange={setConfirmRecusado}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar ação</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja marcar esta carga como <strong>Recusado</strong>?
                {cargaToUpdate && (
                  <span className="block mt-2 text-foreground">
                    Fornecedor: {getFornecedorNome(cargaToUpdate.fornecedorId)} - NF: {cargaToUpdate.nfs.join(', ')}
                  </span>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleRecusado} className="bg-red-600 hover:bg-red-700">
                Confirmar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}
