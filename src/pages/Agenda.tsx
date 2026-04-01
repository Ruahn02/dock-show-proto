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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useSenha } from '@/contexts/SenhaContext';
import { useProfile } from '@/contexts/ProfileContext';
import { useFornecedoresDB } from '@/hooks/useFornecedoresDB';
import { useConferentesDB } from '@/hooks/useConferentesDB';
import { useDivergenciasDB } from '@/hooks/useDivergenciasDB';
import { useCross } from '@/contexts/CrossContext';
import { statusCargaLabels } from '@/data/mockData';
import { Carga, StatusCarga } from '@/types';
import { toast } from 'sonner';
import { CalendarCheck, CalendarIcon, Download, FileSpreadsheet, MoreHorizontal, CheckCircle, Clock, Trash2, Loader2 } from 'lucide-react';
import { ConnectionError } from '@/components/ui/ConnectionError';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const statusStyles: Record<string, string> = {
  aguardando_chegada: 'bg-blue-100 text-blue-800 border-blue-300',
  aguardando_doca: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  aguardando_conferencia: 'bg-cyan-100 text-cyan-800 border-cyan-300',
  em_conferencia: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  conferido: 'bg-green-100 text-green-800 border-green-300',
  no_show: 'bg-gray-100 text-gray-800 border-gray-300',
  recusado: 'bg-red-100 text-red-800 border-red-300',
  atrasado: 'bg-orange-100 text-orange-800 border-orange-300',
};

const getDisplayStatus = (carga: Carga): { label: string; styleKey: string } => {
  if (carga.chegou && carga.status === 'aguardando_chegada') {
    return { label: 'Aguardando Doca', styleKey: 'aguardando_doca' };
  }
  return { label: statusCargaLabels[carga.status], styleKey: carga.status };
};

export default function Agenda() {
  const { cargas, senhas, atualizarCarga, recusarCarga, finalizarEntrega, excluirCarga, loading, error, refetch } = useSenha();
  const { isAdmin } = useProfile();
  const { atualizarFluxo } = useFluxoOperacional();
  const { fornecedores } = useFornecedoresDB();
  const { conferentes } = useConferentesDB();
  const { getDivergenciasRecebimento, getDivergenciasCrossByCarga } = useDivergenciasDB();
  const { adicionarCross, crossItems } = useCross();
  
  const [confirmNoShow, setConfirmNoShow] = useState(false);
  const [confirmRecusado, setConfirmRecusado] = useState(false);
  const [confirmFinalizar, setConfirmFinalizar] = useState(false);
  const [confirmAtrasado, setConfirmAtrasado] = useState(false);
  const [confirmExcluir, setConfirmExcluir] = useState(false);
  const [cargaToUpdate, setCargaToUpdate] = useState<Carga | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [dataSelecionada, setDataSelecionada] = useState<Date>(new Date());
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [fornecedorFiltro, setFornecedorFiltro] = useState<string>('todos');
  const hojeStr = format(dataSelecionada, 'yyyy-MM-dd');

  const getFornecedorNome = (id: string) => fornecedores.find(f => f.id === id)?.nome || 'N/A';
  const getConferenteNome = (id?: string) => { if (!id) return '-'; return conferentes.find(c => c.id === id)?.nome || '-'; };

  const getFornecedorColor = (carga: Carga) => {
    if (carga.status === 'recusado' || carga.status === 'no_show') return 'text-red-600';
    if (carga.status === 'atrasado') return 'text-orange-600';
    if (carga.chegou) return 'text-green-600 font-semibold';
    return '';
  };

  // Helper: count senhas emitidas for a carga
  const getSenhasEmitidas = (cargaId: string) => {
    return senhas.filter(s => s.cargaId === cargaId && s.status !== 'recusado').length;
  };

  // Helper: sum volume_conferido from senhas
  const getVolumeRecebido = (carga: Carga) => {
    const senhasDaCarga = senhas.filter(s => s.cargaId === carga.id && s.status !== 'recusado');
    if (senhasDaCarga.length === 0) return carga.volumeConferido ?? undefined;
    const total = senhasDaCarga.reduce((sum, s) => sum + (s.volumeConferido || 0), 0);
    return total > 0 ? total : (carga.volumeConferido ?? undefined);
  };

  // Check if "Finalizar Entrega" should be shown
  const canFinalizarEntrega = (carga: Carga) => {
    if (!isAdmin) return false;
    if (carga.status === 'conferido' || carga.status === 'recusado' || carga.status === 'no_show') return false;
    const senhasDaCarga = senhas.filter(s => s.cargaId === carga.id && s.status !== 'recusado');
    return senhasDaCarga.length > 0;
  };

  const getSenhasPendentes = (cargaId: string) => {
    return senhas.filter(s => s.cargaId === cargaId && s.status !== 'conferido' && s.status !== 'recusado').length;
  };

  const canChangeStatus = (carga: Carga) => carga.status === 'aguardando_chegada' || carga.status === 'aguardando_conferencia' || carga.status === 'em_conferencia' || carga.status === 'atrasado';

  const canExcluir = (carga: Carga) => carga.status !== 'conferido';

  const cargasDeHoje = useMemo(() => cargas.filter(c => c.data === hojeStr), [cargas, hojeStr]);

  const fornecedoresDoDia = useMemo(() => {
    const ids = [...new Set(cargasDeHoje.map(c => c.fornecedorId))];
    return ids.map(id => ({ id, nome: getFornecedorNome(id) })).sort((a, b) => a.nome.localeCompare(b.nome));
  }, [cargasDeHoje, fornecedores]);

  const cargasFiltradas = useMemo(() => {
    if (fornecedorFiltro === 'todos') return cargasDeHoje;
    return cargasDeHoje.filter(c => c.fornecedorId === fornecedorFiltro);
  }, [cargasDeHoje, fornecedorFiltro]);

  const openNoShowConfirm = (carga: Carga) => { setCargaToUpdate(carga); setConfirmNoShow(true); };
  const openRecusadoConfirm = (carga: Carga) => { setCargaToUpdate(carga); setConfirmRecusado(true); };
  const openFinalizarConfirm = (carga: Carga) => { setCargaToUpdate(carga); setConfirmFinalizar(true); };
  const openAtrasadoConfirm = (carga: Carga) => { setCargaToUpdate(carga); setConfirmAtrasado(true); };
  const openExcluirConfirm = (carga: Carga) => { setCargaToUpdate(carga); setConfirmExcluir(true); };

  const handleNoShow = async () => {
    if (!cargaToUpdate || isProcessing) return;
    setIsProcessing(true);
    try {
      await atualizarFluxo({ p_carga_id: cargaToUpdate.id, p_novo_status: 'no_show' });
      toast.success(`Carga marcada como No-show`);
    } catch { toast.error('Erro ao atualizar'); } finally {
      setIsProcessing(false);
      setConfirmNoShow(false);
      setCargaToUpdate(null);
    }
  };

  const handleRecusado = async () => {
    if (!cargaToUpdate || isProcessing) return;
    setIsProcessing(true);
    try {
      await atualizarFluxo({ p_carga_id: cargaToUpdate.id, p_novo_status: 'recusado' });
      toast.success(`Carga marcada como Recusado`);
    } catch { toast.error('Erro ao atualizar'); } finally {
      setIsProcessing(false);
      setConfirmRecusado(false);
      setCargaToUpdate(null);
    }
  };

  const handleAtrasado = async () => {
    if (!cargaToUpdate || isProcessing) return;
    setIsProcessing(true);
    try {
      await atualizarCarga(cargaToUpdate.id, { status: 'atrasado' as any });
      toast.success('Carga marcada como Atrasado');
    } catch { toast.error('Erro ao atualizar'); } finally {
      setIsProcessing(false);
      setConfirmAtrasado(false);
      setCargaToUpdate(null);
    }
  };

  const handleExcluir = async () => {
    if (!cargaToUpdate || isProcessing) return;
    setIsProcessing(true);
    try {
      await excluirCarga(cargaToUpdate.id);
      toast.success('Entrega excluída com sucesso');
    } catch { toast.error('Erro ao excluir'); } finally {
      setIsProcessing(false);
      setConfirmExcluir(false);
      setCargaToUpdate(null);
    }
  };

  const handleFinalizar = async () => {
    if (!cargaToUpdate || isProcessing) return;
    setIsProcessing(true);
    try {
      await finalizarEntrega(cargaToUpdate.id);
      
      // Create cross if it doesn't exist yet
      const crossJaExiste = crossItems.some(c => c.cargaId === cargaToUpdate.id);
      if (!crossJaExiste) {
        const senhasDaCarga = senhas.filter(s => s.cargaId === cargaToUpdate.id && s.status === 'conferido');
        const totalVolume = senhasDaCarga.reduce((sum, s) => sum + (s.volumeConferido || 0), 0);
        if (totalVolume > 0) {
          try {
            await adicionarCross({
              cargaId: cargaToUpdate.id,
              fornecedorId: cargaToUpdate.fornecedorId,
              nfs: cargaToUpdate.nfs || [],
              data: cargaToUpdate.data,
              rua: cargaToUpdate.rua || '',
              volumeRecebido: totalVolume,
            });
          } catch (err: any) {
            console.warn('Cross já registrado:', err?.message);
          }
        }
      }
      
      toast.success('Entrega finalizada com sucesso');
    } catch {
      toast.error('Erro ao finalizar entrega');
    } finally {
      setIsProcessing(false);
      setConfirmFinalizar(false);
      setCargaToUpdate(null);
    }
  };

  const mapCargaParaLinha = (carga: Carga) => {
    const display = getDisplayStatus(carga);
    const volRecebido = getVolumeRecebido(carga);
    return {
      'Horário': carga.horarioPrevisto || '-',
      'Fornecedor': getFornecedorNome(carga.fornecedorId),
      'NF(s)': carga.nfs?.join(', ') || '-',
      'Cam. Prev.': carga.quantidadeVeiculos || 1,
      'Senhas': getSenhasEmitidas(carga.id),
      'Vol. Previsto': carga.volumePrevisto,
      'Vol. Recebido': volRecebido ?? '-',
      'Conferente': getConferenteNome(carga.conferenteId),
      'Rua': carga.rua || '-',
      'Div. Receb.': getDivergenciasRecebimento(carga.id),
      'Div. Cross': getDivergenciasCrossByCarga(carga.id),
      'Status': display.label,
    };
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    const dataFormatada = format(dataSelecionada, "dd/MM/yyyy");
    doc.setFontSize(16);
    doc.text(`Agenda - ${dataFormatada}`, 14, 15);

    if (fornecedorFiltro !== 'todos') {
      doc.setFontSize(11);
      doc.text(`Fornecedor: ${getFornecedorNome(fornecedorFiltro)}`, 14, 23);
    }

    const headers = ['Horário', 'Fornecedor', 'NF(s)', 'Cam.', 'Senhas', 'Vol. Prev.', 'Vol. Rec.', 'Conferente', 'Rua', 'Div. Receb.', 'Div. Cross', 'Status'];
    const rows = cargasFiltradas.map(c => {
      const display = getDisplayStatus(c);
      const volRecebido = getVolumeRecebido(c);
      return [
        c.horarioPrevisto || '-',
        getFornecedorNome(c.fornecedorId),
        c.nfs?.join(', ') || '-',
        String(c.quantidadeVeiculos || 1),
        String(getSenhasEmitidas(c.id)),
        String(c.volumePrevisto),
        volRecebido != null ? String(volRecebido) : '-',
        getConferenteNome(c.conferenteId),
        c.rua || '-',
        getDivergenciasRecebimento(c.id),
        getDivergenciasCrossByCarga(c.id),
        display.label,
      ];
    });

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: fornecedorFiltro !== 'todos' ? 28 : 22,
      styles: { fontSize: 7 },
      headStyles: { fillColor: [59, 130, 246] },
    });

    doc.save(`agenda_${format(dataSelecionada, 'yyyy-MM-dd')}.pdf`);
    toast.success('PDF exportado com sucesso');
  };

  const exportarExcel = () => {
    const dados = cargasFiltradas.map(mapCargaParaLinha);
    const ws = XLSX.utils.json_to_sheet(dados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Agenda');
    XLSX.writeFile(wb, `agenda_${format(dataSelecionada, 'yyyy-MM-dd')}.xlsx`);
    toast.success('Excel exportado com sucesso');
  };

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

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="w-64">
            <Select value={fornecedorFiltro} onValueChange={setFornecedorFiltro}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por fornecedor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os fornecedores</SelectItem>
                {fornecedoresDoDia.map(f => (
                  <SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={exportarPDF}>
              <Download className="h-4 w-4" />
              Exportar PDF
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={exportarExcel}>
              <FileSpreadsheet className="h-4 w-4" />
              Exportar Excel
            </Button>
          </div>
        </div>

        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Horário</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>NF(s)</TableHead>
                <TableHead className="text-center">Cam. Prev.</TableHead>
                <TableHead className="text-center">Senhas</TableHead>
                <TableHead className="text-right">Vol. Previsto</TableHead>
                <TableHead className="text-right">Vol. Recebido</TableHead>
                <TableHead>Conferente</TableHead>
                <TableHead>Rua</TableHead>
                <TableHead>Div. Receb.</TableHead>
                <TableHead>Div. Cross</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cargasFiltradas.length === 0 ? (
                <TableRow><TableCell colSpan={13} className="text-center py-8 text-muted-foreground">Nenhuma entrega agendada para esta data</TableCell></TableRow>
              ) : (
                cargasFiltradas.map((carga) => {
                  const volRecebido = getVolumeRecebido(carga);
                  return (
                    <TableRow key={carga.id}>
                      <TableCell className="whitespace-nowrap">{carga.horarioPrevisto || '-'}</TableCell>
                      <TableCell className={`font-medium ${getFornecedorColor(carga)}`}>{getFornecedorNome(carga.fornecedorId)}</TableCell>
                      <TableCell className="text-sm">{carga.nfs?.join(', ') || '-'}</TableCell>
                      <TableCell className="text-center">{carga.quantidadeVeiculos || 1}</TableCell>
                      <TableCell className="text-center">{getSenhasEmitidas(carga.id)}</TableCell>
                      <TableCell className="text-right">{carga.volumePrevisto}</TableCell>
                      <TableCell className="text-right font-semibold">{volRecebido ?? '-'}</TableCell>
                      <TableCell>{getConferenteNome(carga.conferenteId)}</TableCell>
                      <TableCell>{carga.rua || '-'}</TableCell>
                      <TableCell className="whitespace-pre-line break-words max-w-[200px] text-sm">{getDivergenciasRecebimento(carga.id)}</TableCell>
                      <TableCell className="whitespace-pre-line break-words max-w-[200px] text-sm">{getDivergenciasCrossByCarga(carga.id)}</TableCell>
                      <TableCell>
                        {(() => {
                          const display = getDisplayStatus(carga);
                          return (
                            <Badge variant="outline" className={statusStyles[display.styleKey]}>{display.label}</Badge>
                          );
                        })()}
                      </TableCell>
                      <TableCell className="text-right">
                         {(canChangeStatus(carga) || canFinalizarEntrega(carga) || canExcluir(carga)) && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-1">Ações<MoreHorizontal className="h-4 w-4" /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {canFinalizarEntrega(carga) && (
                                  <DropdownMenuItem onClick={() => openFinalizarConfirm(carga)} className="text-green-700">
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Finalizar Entrega
                                  </DropdownMenuItem>
                                )}
                                {canChangeStatus(carga) && (
                                  <>
                                    <DropdownMenuItem onClick={() => openAtrasadoConfirm(carga)} className="text-orange-600">
                                      <Clock className="h-4 w-4 mr-2" />
                                      Marcar como Atrasado
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => openNoShowConfirm(carga)}>Marcar como No-show</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => openRecusadoConfirm(carga)} className="text-red-600">Marcar como Recusado</DropdownMenuItem>
                                  </>
                                )}
                                {canExcluir(carga) && (
                                  <DropdownMenuItem onClick={() => openExcluirConfirm(carga)} className="text-red-600">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Excluir Entrega
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                      </TableCell>
                    </TableRow>
                  );
                })
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
              <AlertDialogCancel disabled={isProcessing}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleNoShow} disabled={isProcessing}>{isProcessing ? 'Processando...' : 'Confirmar'}</AlertDialogAction>
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
              <AlertDialogCancel disabled={isProcessing}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleRecusado} disabled={isProcessing} className="bg-red-600 hover:bg-red-700">{isProcessing ? 'Processando...' : 'Confirmar'}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={confirmAtrasado} onOpenChange={setConfirmAtrasado}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar ação</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja marcar esta carga como <strong>Atrasado</strong>?
                {cargaToUpdate && (<span className="block mt-2 text-foreground">Fornecedor: {getFornecedorNome(cargaToUpdate.fornecedorId)}</span>)}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isProcessing}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleAtrasado} disabled={isProcessing} className="bg-orange-600 hover:bg-orange-700">{isProcessing ? 'Processando...' : 'Confirmar'}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={confirmExcluir} onOpenChange={setConfirmExcluir}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir Entrega</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja <strong>excluir</strong> esta entrega? Esta ação não pode ser desfeita.
                {cargaToUpdate && (<span className="block mt-2 text-foreground">Fornecedor: {getFornecedorNome(cargaToUpdate.fornecedorId)}</span>)}
                {cargaToUpdate && getSenhasEmitidas(cargaToUpdate.id) > 0 && (
                  <span className="block mt-1 text-amber-600">
                    Atenção: {getSenhasEmitidas(cargaToUpdate.id)} senha(s) vinculada(s) também serão removidas.
                  </span>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isProcessing}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleExcluir} disabled={isProcessing} className="bg-red-600 hover:bg-red-700">{isProcessing ? 'Excluindo...' : 'Excluir'}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={confirmFinalizar} onOpenChange={setConfirmFinalizar}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Finalizar Entrega</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja <strong>finalizar</strong> esta entrega?
                {cargaToUpdate && (
                  <>
                    <span className="block mt-2 text-foreground">Fornecedor: {getFornecedorNome(cargaToUpdate.fornecedorId)}</span>
                    <span className="block mt-1 text-muted-foreground">
                      Senhas emitidas: {getSenhasEmitidas(cargaToUpdate.id)} / Caminhões previstos: {cargaToUpdate.quantidadeVeiculos || 1}
                    </span>
                    {getSenhasPendentes(cargaToUpdate.id) > 0 && (
                      <span className="block mt-1 text-amber-600">
                        Atenção: {getSenhasPendentes(cargaToUpdate.id)} senha(s) pendente(s) serão marcadas como recusadas. A entrega será finalizada com os volumes já conferidos.
                      </span>
                    )}
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isProcessing}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleFinalizar} disabled={isProcessing} className="bg-green-600 hover:bg-green-700">{isProcessing ? 'Finalizando...' : 'Finalizar Entrega'}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}
