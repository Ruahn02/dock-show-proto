import { useState, useMemo } from 'react';
import { MultiSelectStatus, StatusOption } from '@/components/ui/multi-select-status';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useSolicitacao } from '@/contexts/SolicitacaoContext';
import { useSenha } from '@/contexts/SenhaContext';
import { useFornecedoresDB } from '@/hooks/useFornecedoresDB';
import { statusSolicitacaoLabels } from '@/data/mockData';
import { useTiposVeiculoDB } from '@/hooks/useTiposVeiculoDB';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, AlertTriangle, Loader2 } from 'lucide-react';
import { ConnectionError } from '@/components/ui/ConnectionError';
import { SolicitacaoEntrega, StatusSolicitacao } from '@/types';
import { toast } from 'sonner';
import { ClipboardList, CalendarIcon, Check, X, Download } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { gerarPdfAprovacao, gerarPdfRecusa } from '@/lib/gerarPdfSolicitacao';

const statusStyles: Record<StatusSolicitacao, string> = {
  pendente: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  aprovada: 'bg-green-100 text-green-800 border-green-300',
  recusada: 'bg-red-100 text-red-800 border-red-300',
};

export default function Solicitacoes() {
  const { solicitacoes, aprovarSolicitacao, aprovarSolicitacaoUnificada, recusarSolicitacao, getSolicitacoesPendentes, loading, error, refetch } = useSolicitacao();
  const { cargas } = useSenha();
  const { fornecedores } = useFornecedoresDB();
  const { getLabelByNome } = useTiposVeiculoDB();
  const [aprovarModalOpen, setAprovarModalOpen] = useState(false);
  const [recusarDialogOpen, setRecusarDialogOpen] = useState(false);
  const [selectedSolicitacao, setSelectedSolicitacao] = useState<SolicitacaoEntrega | null>(null);
  const [dataAgendada, setDataAgendada] = useState<Date | undefined>(undefined);
  const [horarioAgendado, setHorarioAgendado] = useState('08:00');
  const [openCalendar, setOpenCalendar] = useState(false);
  const [unificar, setUnificar] = useState(false);
  const [motivoRecusa, setMotivoRecusa] = useState('');

  const [filtroStatus, setFiltroStatus] = useState<string[]>([]);
  const [filtroData, setFiltroData] = useState<Date | undefined>(undefined);
  const [filtroDataOpen, setFiltroDataOpen] = useState(false);

  const pendentes = getSolicitacoesPendentes();
  const getFornecedorNome = (id: string) => fornecedores.find(f => f.id === id)?.nome || 'N/A';

  const statusOptionsSolicitacao: StatusOption[] = [
    { value: 'pendente', label: 'Pendente' },
    { value: 'aprovada', label: 'Aprovada' },
    { value: 'recusada', label: 'Recusada' },
  ];

  const solicitacoesFiltradas = useMemo(() => {
    return solicitacoes.filter(sol => {
      if (filtroStatus.length > 0 && !filtroStatus.includes(sol.status)) return false;
      if (filtroData) {
        const dataStr = format(filtroData, 'yyyy-MM-dd');
        if (sol.dataSolicitacao !== dataStr) return false;
      }
      return true;
    });
  }, [solicitacoes, filtroStatus, filtroData]);

  // Detect duplicate: same supplier + same date
  const cargaDuplicada = useMemo(() => {
    if (!selectedSolicitacao || !dataAgendada) return null;
    const dataSel = format(dataAgendada, 'yyyy-MM-dd');
    return cargas.find(c => c.fornecedorId === selectedSolicitacao.fornecedorId && c.data === dataSel) || null;
  }, [selectedSolicitacao, dataAgendada, cargas]);

  const handleOpenAprovar = (sol: SolicitacaoEntrega) => { setSelectedSolicitacao(sol); setDataAgendada(undefined); setHorarioAgendado('08:00'); setUnificar(false); setAprovarModalOpen(true); };
  const handleOpenRecusar = (sol: SolicitacaoEntrega) => { setSelectedSolicitacao(sol); setMotivoRecusa(''); setRecusarDialogOpen(true); };

  const handleAprovar = async () => {
    if (!selectedSolicitacao || !dataAgendada) { toast.error('Selecione uma data para o agendamento'); return; }
    try {
      const dataStr = format(dataAgendada, 'yyyy-MM-dd');
      const dataFormatada = format(dataAgendada, 'dd/MM/yyyy');
      if (unificar && cargaDuplicada) {
        await aprovarSolicitacaoUnificada(selectedSolicitacao.id, cargaDuplicada.id, dataStr, horarioAgendado);
        toast.success('Solicitação aprovada e cargas unificadas!');
      } else {
        await aprovarSolicitacao(selectedSolicitacao.id, dataStr, horarioAgendado);
        toast.success('Solicitação aprovada e agendamento criado!');
      }
      gerarPdfAprovacao({
        fornecedorNome: getFornecedorNome(selectedSolicitacao.fornecedorId),
        dataAgendada: dataFormatada,
        horarioAgendado,
        notaFiscal: selectedSolicitacao.notaFiscal,
        numeroPedido: selectedSolicitacao.numeroPedido,
        comprador: selectedSolicitacao.comprador,
        volumePrevisto: selectedSolicitacao.volumePrevisto,
      });
      setAprovarModalOpen(false); setSelectedSolicitacao(null);
    } catch { toast.error('Erro ao aprovar'); }
  };

  const handleRecusar = async () => {
    if (!selectedSolicitacao || !motivoRecusa.trim()) return;
    try {
      await recusarSolicitacao(selectedSolicitacao.id);
      gerarPdfRecusa({
        fornecedorNome: getFornecedorNome(selectedSolicitacao.fornecedorId),
        notaFiscal: selectedSolicitacao.notaFiscal,
        numeroPedido: selectedSolicitacao.numeroPedido,
        dataSolicitacao: format(parseISO(selectedSolicitacao.dataSolicitacao), 'dd/MM/yyyy'),
        motivoRecusa: motivoRecusa.trim(),
        volumePrevisto: selectedSolicitacao.volumePrevisto,
      });
      toast.success('Solicitação recusada');
      setRecusarDialogOpen(false); setSelectedSolicitacao(null);
    } catch { toast.error('Erro ao recusar'); }
  };

  if (loading) return <Layout><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div></Layout>;
  if (error) return <Layout><ConnectionError message={error} onRetry={refetch} /></Layout>;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <ClipboardList className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Solicitações de Entrega</h1>
            <p className="text-muted-foreground">{pendentes.length} solicitação(ões) pendente(s)</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <MultiSelectStatus
            options={statusOptionsSolicitacao}
            selected={filtroStatus}
            onChange={setFiltroStatus}
            placeholder="Status"
            className="w-[200px]"
          />

          <Popover open={filtroDataOpen} onOpenChange={setFiltroDataOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-[200px] justify-start text-left font-normal", !filtroData && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filtroData ? format(filtroData, 'dd/MM/yyyy') : 'Filtrar por data'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={filtroData} onSelect={(date) => { setFiltroData(date); setFiltroDataOpen(false); }} locale={ptBR} className={cn("p-3 pointer-events-auto")} />
            </PopoverContent>
          </Popover>

          {filtroData && (
            <Button variant="ghost" size="sm" onClick={() => setFiltroData(undefined)}>Limpar data</Button>
          )}
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fornecedor</TableHead><TableHead>E-mail Contato</TableHead>
                <TableHead>Tipo Caminhão</TableHead><TableHead className="text-center">Qtd Veículos</TableHead>
                <TableHead className="text-right">Volume</TableHead><TableHead>Nota Fiscal</TableHead><TableHead>N. Pedido</TableHead><TableHead>Comprador</TableHead><TableHead>Data Solicitação</TableHead>
                <TableHead>Status</TableHead><TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {solicitacoesFiltradas.length === 0 ? (
                <TableRow><TableCell colSpan={11} className="text-center py-8 text-muted-foreground">Nenhuma solicitação encontrada</TableCell></TableRow>
              ) : (
                solicitacoesFiltradas.map((sol) => (
                  <TableRow key={sol.id}>
                    <TableCell className="font-medium">{getFornecedorNome(sol.fornecedorId)}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{sol.emailContato}</TableCell>
                    <TableCell>{getLabelByNome(sol.tipoCaminhao)}</TableCell>
                    <TableCell className="text-center">{sol.quantidadeVeiculos}</TableCell>
                    <TableCell className="text-right">{sol.volumePrevisto}</TableCell>
                    <TableCell>{sol.notaFiscal || '-'}</TableCell>
                    <TableCell>{sol.numeroPedido || '-'}</TableCell>
                    <TableCell>{sol.comprador || '-'}</TableCell>
                    <TableCell>{format(parseISO(sol.dataSolicitacao), 'dd/MM/yyyy')}</TableCell>
                    <TableCell><Badge variant="outline" className={statusStyles[sol.status]}>{statusSolicitacaoLabels[sol.status]}</Badge></TableCell>
                    <TableCell className="text-right">
                      {sol.status === 'pendente' && (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" className="gap-1 text-green-600 border-green-300 hover:bg-green-50" onClick={() => handleOpenAprovar(sol)}>
                            <Check className="h-4 w-4" />Aprovar
                          </Button>
                          <Button size="sm" variant="outline" className="gap-1 text-red-600 border-red-300 hover:bg-red-50" onClick={() => handleOpenRecusar(sol)}>
                            <X className="h-4 w-4" />Recusar
                          </Button>
                        </div>
                      )}
                      {sol.status === 'aprovada' && (
                        <Button size="sm" variant="outline" className="gap-1" onClick={() => {
                          gerarPdfAprovacao({
                            fornecedorNome: getFornecedorNome(sol.fornecedorId),
                            dataAgendada: sol.dataAgendada ? format(parseISO(sol.dataAgendada), 'dd/MM/yyyy') : 'N/A',
                            horarioAgendado: sol.horarioAgendado || 'N/A',
                            notaFiscal: sol.notaFiscal,
                            numeroPedido: sol.numeroPedido,
                            comprador: sol.comprador,
                            volumePrevisto: sol.volumePrevisto,
                          });
                        }}>
                          <Download className="h-4 w-4" />Baixar PDF
                        </Button>
                      )}
                      {sol.status === 'recusada' && (
                        <Button size="sm" variant="outline" className="gap-1" onClick={() => {
                          gerarPdfRecusa({
                            fornecedorNome: getFornecedorNome(sol.fornecedorId),
                            notaFiscal: sol.notaFiscal,
                            numeroPedido: sol.numeroPedido,
                            dataSolicitacao: format(parseISO(sol.dataSolicitacao), 'dd/MM/yyyy'),
                            motivoRecusa: 'Solicitação recusada',
                            volumePrevisto: sol.volumePrevisto,
                          });
                        }}>
                          <Download className="h-4 w-4" />Baixar PDF
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <Dialog open={aprovarModalOpen} onOpenChange={setAprovarModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Aprovar Solicitação</DialogTitle></DialogHeader>
            {selectedSolicitacao && (
              <div className="space-y-4 py-4">
                <div className="bg-muted p-3 rounded-lg space-y-1">
                  <p className="font-medium">{getFornecedorNome(selectedSolicitacao.fornecedorId)}</p>
                  <p className="text-sm text-muted-foreground">Volume: {selectedSolicitacao.volumePrevisto} | Tipo: {getLabelByNome(selectedSolicitacao.tipoCaminhao)}</p>
                  <p className="text-sm text-muted-foreground">E-mail: {selectedSolicitacao.emailContato}</p>
                  {selectedSolicitacao.observacoes && <p className="text-sm text-muted-foreground">Obs: {selectedSolicitacao.observacoes}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Data do Agendamento *</Label>
                  <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !dataAgendada && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dataAgendada ? format(dataAgendada, "PPP", { locale: ptBR }) : <span>Selecione a data</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={dataAgendada} onSelect={(date) => { setDataAgendada(date); setOpenCalendar(false); }} locale={ptBR} className="pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                  {dataAgendada && (() => {
                    const dataSelecionada = format(dataAgendada, 'yyyy-MM-dd');
                    const cargasDoDia = cargas.filter(c => c.data === dataSelecionada);
                    const totalVolumes = cargasDoDia.reduce((acc, c) => acc + (c.volumePrevisto || 0), 0);
                    return cargasDoDia.length > 0 ? (
                      <Alert className="border-blue-200 bg-blue-50">
                        <Info className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-800 text-sm">
                          Neste dia já existem <strong>{cargasDoDia.length} carga(s)</strong> agendadas com total de <strong>{totalVolumes} volumes</strong> previstos.
                        </AlertDescription>
                      </Alert>
                    ) : null;
                  })()}
                  {cargaDuplicada && (
                    <>
                      <Alert className="border-orange-300 bg-orange-50">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                        <AlertDescription className="text-orange-800 text-sm">
                          O fornecedor <strong>{getFornecedorNome(selectedSolicitacao!.fornecedorId)}</strong> já possui <strong>1 carga</strong> agendada neste dia com <strong>{cargaDuplicada.volumePrevisto} volumes</strong> previstos.
                        </AlertDescription>
                      </Alert>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="unificar" checked={unificar} onCheckedChange={(checked) => setUnificar(checked === true)} />
                        <Label htmlFor="unificar" className="text-sm font-normal cursor-pointer">
                          Unificar com a carga existente (os volumes serão somados)
                        </Label>
                      </div>
                    </>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="horario">Horário Previsto *</Label>
                  <Input id="horario" type="time" value={horarioAgendado} onChange={(e) => setHorarioAgendado(e.target.value)} />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setAprovarModalOpen(false)}>Cancelar</Button>
              <Button onClick={handleAprovar} disabled={!dataAgendada}>
                {unificar && cargaDuplicada ? 'Confirmar e Unificar' : 'Confirmar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={recusarDialogOpen} onOpenChange={setRecusarDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Recusar Solicitação</DialogTitle>
            </DialogHeader>
            {selectedSolicitacao && (
              <div className="space-y-4 py-2">
                <p className="text-sm text-muted-foreground">
                  Fornecedor: <strong>{getFornecedorNome(selectedSolicitacao.fornecedorId)}</strong>
                </p>
                <div className="space-y-2">
                  <Label htmlFor="motivoRecusa">Motivo da Recusa *</Label>
                  <Textarea
                    id="motivoRecusa"
                    value={motivoRecusa}
                    onChange={(e) => setMotivoRecusa(e.target.value)}
                    placeholder="Informe o motivo da recusa..."
                    rows={4}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setRecusarDialogOpen(false)}>Cancelar</Button>
              <Button
                variant="destructive"
                onClick={handleRecusar}
                disabled={!motivoRecusa.trim()}
              >
                Recusar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
