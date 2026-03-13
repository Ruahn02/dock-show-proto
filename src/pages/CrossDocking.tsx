import { useState, useMemo } from 'react';
import { MultiSelectStatus, StatusOption } from '@/components/ui/multi-select-status';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MontarCrossModal } from '@/components/cross/MontarCrossModal';
import { IniciarSeparacaoModal, FinalizarSeparacaoModal } from '@/components/cross/SeparacaoModal';
import { useProfile } from '@/contexts/ProfileContext';
import { useCross } from '@/contexts/CrossContext';
import { useSenha } from '@/contexts/SenhaContext';
import { useFornecedoresDB } from '@/hooks/useFornecedoresDB';
import { useConferentesDB } from '@/hooks/useConferentesDB';
import { useDivergenciasDB } from '@/hooks/useDivergenciasDB';
import type { CrossDocking as CrossDockingType, StatusCross, DivergenciaItem } from '@/types';
import { toast } from 'sonner';
import { ArrowRightLeft, Package, Archive, CalendarIcon, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const statusStyles: Record<StatusCross, string> = {
  aguardando_decisao: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  cross_confirmado: 'bg-blue-100 text-blue-800 border-blue-300',
  aguardando_separacao: 'bg-blue-100 text-blue-800 border-blue-300',
  em_separacao: 'bg-green-100 text-green-800 border-green-300',
  finalizado: 'bg-gray-100 text-gray-600 border-gray-300',
  armazenado: 'bg-orange-100 text-orange-800 border-orange-300',
};

const statusLabels: Record<StatusCross, string> = {
  aguardando_decisao: 'Aguardando Decisão',
  cross_confirmado: 'Cross',
  aguardando_separacao: 'Aguard. Separação',
  em_separacao: 'Em Separação',
  finalizado: 'Finalizado',
  armazenado: 'Armazenado',
};

export default function CrossDocking() {
  const { isAdmin } = useProfile();
  const { getCrossParaAdmin, getCrossParaOperacional, armazenarCarga, confirmarCross, montarCross, iniciarSeparacao, finalizarSeparacao } = useCross();
  const { cargas } = useSenha();
  const { fornecedores } = useFornecedoresDB();
  const { conferentes } = useConferentesDB();
  const { getDivergenciasRecebimento, getDivergenciasCross, salvarDivergencias } = useDivergenciasDB();

  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; type: 'armazenar' | 'cross'; crossId: string } | null>(null);
  const [montarModalOpen, setMontarModalOpen] = useState(false);
  const [iniciarModalOpen, setIniciarModalOpen] = useState(false);
  const [finalizarModalOpen, setFinalizarModalOpen] = useState(false);
  const [selectedCross, setSelectedCross] = useState<CrossDockingType | null>(null);
  const [dataSelecionada, setDataSelecionada] = useState<Date | null>(new Date());
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState<string>('todos');
  const [statusSelecionado, setStatusSelecionado] = useState<string[]>([]);

  const statusOptionsCross: StatusOption[] = [
    { value: 'aguardando_decisao', label: 'Aguardando Decisão' },
    { value: 'cross_confirmado', label: 'Cross Confirmado' },
    { value: 'aguardando_separacao', label: 'Aguard. Separação' },
    { value: 'em_separacao', label: 'Em Separação' },
    { value: 'finalizado', label: 'Finalizado' },
    { value: 'armazenado', label: 'Armazenado' },
  ];
  const [tipoSelecionado, setTipoSelecionado] = useState<string>('todos');

  const allCrossItems = isAdmin ? getCrossParaAdmin() : getCrossParaOperacional();
  const crossItems = useMemo(() => {
    let items = allCrossItems;
    if (dataSelecionada) {
      const dateStr = format(dataSelecionada, 'yyyy-MM-dd');
      items = items.filter(c => c.data === dateStr);
    }
    if (fornecedorSelecionado && fornecedorSelecionado !== 'todos') {
      items = items.filter(c => c.fornecedorId === fornecedorSelecionado);
    }
    if (statusSelecionado.length > 0) {
      items = items.filter(c => statusSelecionado.includes(c.status));
    }
    if (tipoSelecionado && tipoSelecionado !== 'todos') {
      if (tipoSelecionado === 'armazenar') {
        items = items.filter(c => c.status === 'armazenado');
      } else {
        items = items.filter(c => c.status !== 'armazenado');
      }
    }
    return items;
  }, [allCrossItems, dataSelecionada, fornecedorSelecionado, statusSelecionado, tipoSelecionado]);

  const getFornecedor = (id: string) => fornecedores.find(f => f.id === id);
  const getSeparador = (id?: string) => conferentes.find(c => c.id === id);
  const getConferenteNome = (cargaId: string) => {
    const carga = cargas.find(c => c.id === cargaId);
    if (!carga?.conferenteId) return '-';
    return conferentes.find(c => c.id === carga.conferenteId)?.nome || '-';
  };
  // getDivergenciaRecebimento now uses the structured hook
  // getDivergenciaCross now uses the structured hook

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
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <ArrowRightLeft className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Cross Docking</h1>
              <p className="text-muted-foreground">{isAdmin ? 'Decida o destino das cargas conferidas' : 'Gerencie a separação de cargas cross'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={tipoSelecionado} onValueChange={setTipoSelecionado}>
              <SelectTrigger className="w-[140px] gap-2">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos tipos</SelectItem>
                <SelectItem value="cross">Cross</SelectItem>
                <SelectItem value="armazenar">Armazenar</SelectItem>
              </SelectContent>
            </Select>
            <MultiSelectStatus
              options={statusOptionsCross}
              selected={statusSelecionado}
              onChange={setStatusSelecionado}
              placeholder="Status"
              className="w-[200px]"
            />
            <Select value={fornecedorSelecionado} onValueChange={setFornecedorSelecionado}>
              <SelectTrigger className="w-[200px] gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Fornecedor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os fornecedores</SelectItem>
                {fornecedores.map(f => (
                  <SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {dataSelecionada ? format(dataSelecionada, 'dd/MM/yyyy') : 'Todos'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar mode="single" selected={dataSelecionada ?? undefined} onSelect={(date) => { setDataSelecionada(date ?? null); setPopoverOpen(false); }} initialFocus className={cn("p-3 pointer-events-auto")} />
              </PopoverContent>
            </Popover>
            <Button variant="ghost" size="sm" onClick={() => setDataSelecionada(null)} className={!dataSelecionada ? 'font-bold' : ''}>
              Todos
            </Button>
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
                  {isAdmin && <TableHead>Conferente</TableHead>}
                  {isAdmin && <TableHead>Div. Receb.</TableHead>}
                  {isAdmin && <TableHead>Div. Cross</TableHead>}
                  {!isAdmin && <TableHead>Cross #</TableHead>}
                  {isAdmin && <TableHead>Separador</TableHead>}
                  <TableHead className="text-right w-28">Volume</TableHead>
                  <TableHead className="w-36">Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {crossItems.map((cross) => {
                  const fornecedor = getFornecedor(cross.fornecedorId);
                  const separador = getSeparador(cross.separadorId);
                  return (
                    <TableRow key={cross.id}>
                      {isAdmin && <TableCell>{formatarData(cross.data)}</TableCell>}
                      <TableCell className="font-medium">{fornecedor?.nome || '-'}</TableCell>
                      {isAdmin && <TableCell>{cross.nfs.join(', ') || '-'}</TableCell>}
                      <TableCell>{cross.rua || '-'}</TableCell>
                      {isAdmin && <TableCell>{getConferenteNome(cross.cargaId)}</TableCell>}
                      {isAdmin && <TableCell>{getDivergenciaRecebimento(cross.cargaId)}</TableCell>}
                      {isAdmin && <TableCell>{cross.observacao || '-'}</TableCell>}
                      {!isAdmin && <TableCell className="font-bold">{cross.numeroCross || '-'}</TableCell>}
                      {isAdmin && <TableCell>{separador?.nome || '-'}</TableCell>}
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
                          {isAdmin && cross.status === 'aguardando_separacao' && (
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => handleIniciarSeparacao(cross)}>Começar Separação</Button>
                          )}
                          {isAdmin && cross.status === 'em_separacao' && (
                            <>
                              <span className="text-sm text-muted-foreground italic">{separador?.nome || '...'}</span>
                              <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleFinalizarSeparacao(cross)}>Finalizar Separação</Button>
                            </>
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
        <FinalizarSeparacaoModal
          open={finalizarModalOpen}
          onClose={() => { setFinalizarModalOpen(false); setSelectedCross(null); }}
          onConfirm={handleFinalizarConfirm}
          isAdmin={isAdmin}
          volumeRecebido={selectedCross?.volumeRecebido}
          volumeConferidoCarga={selectedCross ? cargas.find(c => c.id === selectedCross.cargaId)?.volumeConferido : undefined}
        />
      </div>
    </Layout>
  );
}
