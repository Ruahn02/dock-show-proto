import { useState, useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useSolicitacao } from '@/contexts/SolicitacaoContext';
import { useSenha } from '@/contexts/SenhaContext';
import { useFornecedoresDB } from '@/hooks/useFornecedoresDB';
import { tipoCaminhaoLabels, statusSolicitacaoLabels } from '@/data/mockData';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, AlertTriangle } from 'lucide-react';
import { SolicitacaoEntrega, StatusSolicitacao } from '@/types';
import { toast } from 'sonner';
import { ClipboardList, CalendarIcon, Check, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const statusStyles: Record<StatusSolicitacao, string> = {
  pendente: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  aprovada: 'bg-green-100 text-green-800 border-green-300',
  recusada: 'bg-red-100 text-red-800 border-red-300',
};

export default function Solicitacoes() {
  const { solicitacoes, aprovarSolicitacao, aprovarSolicitacaoUnificada, recusarSolicitacao, getSolicitacoesPendentes } = useSolicitacao();
  const { cargas } = useSenha();
  const { fornecedores } = useFornecedoresDB();
  const [aprovarModalOpen, setAprovarModalOpen] = useState(false);
  const [recusarDialogOpen, setRecusarDialogOpen] = useState(false);
  const [selectedSolicitacao, setSelectedSolicitacao] = useState<SolicitacaoEntrega | null>(null);
  const [dataAgendada, setDataAgendada] = useState<Date | undefined>(undefined);
  const [horarioAgendado, setHorarioAgendado] = useState('08:00');
  const [openCalendar, setOpenCalendar] = useState(false);
  const [unificar, setUnificar] = useState(false);

  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [filtroData, setFiltroData] = useState<Date | undefined>(undefined);
  const [filtroDataOpen, setFiltroDataOpen] = useState(false);

  const pendentes = getSolicitacoesPendentes();
  const getFornecedorNome = (id: string) => fornecedores.find(f => f.id === id)?.nome || 'N/A';

  const solicitacoesFiltradas = useMemo(() => {
    return solicitacoes.filter(sol => {
      if (filtroStatus !== 'todos' && sol.status !== filtroStatus) return false;
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
  const handleOpenRecusar = (sol: SolicitacaoEntrega) => { setSelectedSolicitacao(sol); setRecusarDialogOpen(true); };

  const handleAprovar = async () => {
    if (!selectedSolicitacao || !dataAgendada) { toast.error('Selecione uma data para o agendamento'); return; }
    try {
      const dataStr = format(dataAgendada, 'yyyy-MM-dd');
      if (unificar && cargaDuplicada) {
        await aprovarSolicitacaoUnificada(selectedSolicitacao.id, cargaDuplicada.id, dataStr, horarioAgendado);
        toast.success('Solicitação aprovada e cargas unificadas!');
      } else {
        await aprovarSolicitacao(selectedSolicitacao.id, dataStr, horarioAgendado);
        toast.success('Solicitação aprovada e agendamento criado!');
      }
      setAprovarModalOpen(false); setSelectedSolicitacao(null);
    } catch { toast.error('Erro ao aprovar'); }
  };

  const handleRecusar = async () => {
    if (!selectedSolicitacao) return;
    try {
      await recusarSolicitacao(selectedSolicitacao.id);
      toast.success('Solicitação recusada');
      setRecusarDialogOpen(false); setSelectedSolicitacao(null);
    } catch { toast.error('Erro ao recusar'); }
  };

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
          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="aprovada">Aprovada</SelectItem>
              <SelectItem value="recusada">Recusada</SelectItem>
            </SelectContent>
          </Select>

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
                <TableHead className="text-right">Volume</TableHead><TableHead>Data Solicitação</TableHead>
                <TableHead>Status</TableHead><TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {solicitacoesFiltradas.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Nenhuma solicitação encontrada</TableCell></TableRow>
              ) : (
                solicitacoesFiltradas.map((sol) => (
                  <TableRow key={sol.id}>
                    <TableCell className="font-medium">{getFornecedorNome(sol.fornecedorId)}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{sol.emailContato}</TableCell>
                    <TableCell>{tipoCaminhaoLabels[sol.tipoCaminhao]}</TableCell>
                    <TableCell className="text-center">{sol.quantidadeVeiculos}</TableCell>
                    <TableCell className="text-right">{sol.volumePrevisto}</TableCell>
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
                  <p className="text-sm text-muted-foreground">Volume: {selectedSolicitacao.volumePrevisto} | Tipo: {tipoCaminhaoLabels[selectedSolicitacao.tipoCaminhao]}</p>
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

        <AlertDialog open={recusarDialogOpen} onOpenChange={setRecusarDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Recusar Solicitação</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja recusar esta solicitação de entrega?
                {selectedSolicitacao && (<span className="block mt-2 text-foreground">Fornecedor: {getFornecedorNome(selectedSolicitacao.fornecedorId)}</span>)}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleRecusar} className="bg-red-600 hover:bg-red-700">Recusar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}
