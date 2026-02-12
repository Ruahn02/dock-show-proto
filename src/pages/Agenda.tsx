import { useMemo, useState } from 'react';
import { useFluxoOperacional } from '@/hooks/useFluxoOperacional';
import { Layout } from '@/components/layout/Layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useSenha } from '@/contexts/SenhaContext';
import { useFornecedoresDB } from '@/hooks/useFornecedoresDB';
import { useConferentesDB } from '@/hooks/useConferentesDB';
import { statusCargaLabels } from '@/data/mockData';
import { Carga, StatusCarga } from '@/types';
import { toast } from 'sonner';
import { CalendarCheck, CalendarIcon, MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const statusStyles: Record<StatusCarga, string> = {
  aguardando_chegada: 'bg-blue-100 text-blue-800 border-blue-300',
  aguardando_conferencia: 'bg-cyan-100 text-cyan-800 border-cyan-300',
  em_conferencia: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  conferido: 'bg-green-100 text-green-800 border-green-300',
  no_show: 'bg-gray-100 text-gray-800 border-gray-300',
  recusado: 'bg-red-100 text-red-800 border-red-300',
};

export default function Agenda() {
  const { cargas, atualizarCarga, recusarCarga } = useSenha();
  const { atualizarFluxo } = useFluxoOperacional();
  const { fornecedores } = useFornecedoresDB();
  const { conferentes } = useConferentesDB();
  
  const [confirmNoShow, setConfirmNoShow] = useState(false);
  const [confirmRecusado, setConfirmRecusado] = useState(false);
  const [cargaToUpdate, setCargaToUpdate] = useState<Carga | null>(null);

  const [dataSelecionada, setDataSelecionada] = useState<Date>(new Date());
  const [popoverOpen, setPopoverOpen] = useState(false);
  const hojeStr = format(dataSelecionada, 'yyyy-MM-dd');

  const getFornecedorNome = (id: string) => fornecedores.find(f => f.id === id)?.nome || 'N/A';
  const getConferenteNome = (id?: string) => { if (!id) return '-'; return conferentes.find(c => c.id === id)?.nome || '-'; };

  const getFornecedorColor = (carga: Carga) => {
    if (carga.status === 'recusado' || carga.status === 'no_show') return 'text-red-600';
    if (carga.chegou) return 'text-green-600 font-semibold';
    return '';
  };

  const cargasDeHoje = useMemo(() => cargas.filter(c => c.data === hojeStr), [cargas, hojeStr]);

  const openNoShowConfirm = (carga: Carga) => { setCargaToUpdate(carga); setConfirmNoShow(true); };
  const openRecusadoConfirm = (carga: Carga) => { setCargaToUpdate(carga); setConfirmRecusado(true); };

  const handleNoShow = async () => {
    if (!cargaToUpdate) return;
    await atualizarFluxo({ p_carga_id: cargaToUpdate.id, p_novo_status: 'no_show' });
    toast.success(`Carga marcada como No-show`);
    setConfirmNoShow(false);
    setCargaToUpdate(null);
  };

  const handleRecusado = async () => {
    if (!cargaToUpdate) return;
    await atualizarFluxo({ p_carga_id: cargaToUpdate.id, p_senha_id: cargaToUpdate.senhaId || null, p_novo_status: 'recusado' });
    toast.success(`Carga marcada como Recusado`);
    setConfirmRecusado(false);
    setCargaToUpdate(null);
  };

  const canChangeStatus = (carga: Carga) => carga.status === 'aguardando_chegada' || carga.status === 'aguardando_conferencia' || carga.status === 'em_conferencia';

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CalendarCheck className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Agenda</h1>
              <p className="text-muted-foreground">
                {format(dataSelecionada, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
          </div>
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <CalendarIcon className="h-4 w-4" />
                {format(dataSelecionada, 'dd/MM/yyyy')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar mode="single" selected={dataSelecionada} onSelect={(date) => { if (date) { setDataSelecionada(date); setPopoverOpen(false); } }} initialFocus className={cn("p-3 pointer-events-auto")} />
            </PopoverContent>
          </Popover>
        </div>

        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Horário</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead className="text-right">Vol. Previsto</TableHead>
                <TableHead className="text-right">Vol. Recebido</TableHead>
                <TableHead>Conferente</TableHead>
                <TableHead>Rua</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cargasDeHoje.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Nenhuma entrega agendada para hoje</TableCell></TableRow>
              ) : (
                cargasDeHoje.map((carga) => (
                  <TableRow key={carga.id}>
                    <TableCell className="whitespace-nowrap">{carga.horarioPrevisto || '-'}</TableCell>
                    <TableCell className={`font-medium ${getFornecedorColor(carga)}`}>{getFornecedorNome(carga.fornecedorId)}</TableCell>
                    <TableCell className="text-right">{carga.volumePrevisto}</TableCell>
                    <TableCell className="text-right font-semibold">{carga.volumeConferido ?? '-'}</TableCell>
                    <TableCell>{getConferenteNome(carga.conferenteId)}</TableCell>
                    <TableCell>{carga.rua || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusStyles[carga.status]}>{statusCargaLabels[carga.status]}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {canChangeStatus(carga) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-1">Ações<MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openNoShowConfirm(carga)}>Marcar como No-show</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openRecusadoConfirm(carga)} className="text-red-600">Marcar como Recusado</DropdownMenuItem>
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

        <AlertDialog open={confirmNoShow} onOpenChange={setConfirmNoShow}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar ação</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja marcar esta carga como <strong>No-show</strong>?
                {cargaToUpdate && (<span className="block mt-2 text-foreground">Fornecedor: {getFornecedorNome(cargaToUpdate.fornecedorId)}</span>)}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleNoShow}>Confirmar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={confirmRecusado} onOpenChange={setConfirmRecusado}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar ação</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja marcar esta carga como <strong>Recusado</strong>?
                {cargaToUpdate && (<span className="block mt-2 text-foreground">Fornecedor: {getFornecedorNome(cargaToUpdate.fornecedorId)}</span>)}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleRecusado} className="bg-red-600 hover:bg-red-700">Confirmar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}
