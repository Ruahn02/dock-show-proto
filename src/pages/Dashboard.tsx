import { useState, useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { StatCard } from '@/components/dashboard/StatCard';
import { ProductivityChart } from '@/components/dashboard/ProductivityChart';
import { RankingList } from '@/components/dashboard/RankingList';
import { StatusChart } from '@/components/dashboard/StatusChart';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { statusCargaLabels } from '@/data/mockData';
import { useProfile } from '@/contexts/ProfileContext';
import { useFluxoOperacional } from '@/hooks/useFluxoOperacional';
import { useDocasDB } from '@/hooks/useDocasDB';
import { useCrossDB } from '@/hooks/useCrossDB';
import { useConferentesDB } from '@/hooks/useConferentesDB';
import { Package, CheckCircle, AlertCircle, XCircle, Container, FileSpreadsheet, FileText, CalendarIcon, CalendarRange, ArrowRightLeft } from 'lucide-react';
import { format, startOfWeek, endOfWeek, isSameDay, isWithinInterval, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { DashboardPorPeriodo, ProdutividadeConferente, StatusCargaChart } from '@/types';

type FiltroPeriodo = 'hoje' | 'outro' | 'semana' | 'mes' | 'intervalo';

const statusColors: Record<string, string> = {
  aguardando_chegada: '#94a3b8',
  aguardando_conferencia: '#3b82f6',
  em_conferencia: '#eab308',
  conferido: '#22c55e',
  no_show: '#6b7280',
  recusado: '#ef4444',
};

export default function Dashboard() {
  const { isAdmin } = useProfile();
  const { dados } = useFluxoOperacional();
  const { docas } = useDocasDB();
  const { crossItems } = useCrossDB();
  const { conferentes } = useConferentesDB();

  const [filtroPeriodo, setFiltroPeriodo] = useState<FiltroPeriodo>('hoje');
  const [dataSelecionada, setDataSelecionada] = useState<Date>(new Date());
  const [dataInicio, setDataInicio] = useState<Date>(new Date());
  const [dataFim, setDataFim] = useState<Date>(new Date());
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [intervaloPopoverOpen, setIntervaloPopoverOpen] = useState(false);

  // Filter cargas by date period
  const cargasFiltradas = useMemo(() => {
    return dados.filter(d => {
      if (!d.carga_id || !d.data_agendada) return false;
      const dataStr = d.data_agendada;
      let dataDate: Date;
      try { dataDate = parseISO(dataStr); } catch { return false; }

      switch (filtroPeriodo) {
        case 'hoje':
          return isSameDay(dataDate, new Date());
        case 'outro':
          return isSameDay(dataDate, dataSelecionada);
        case 'semana': {
          const start = startOfWeek(dataSelecionada, { locale: ptBR });
          const end = endOfWeek(dataSelecionada, { locale: ptBR });
          return isWithinInterval(dataDate, { start, end });
        }
        case 'mes':
          return dataDate.getMonth() === dataSelecionada.getMonth() && dataDate.getFullYear() === dataSelecionada.getFullYear();
        case 'intervalo':
          return isWithinInterval(dataDate, { start: dataInicio, end: dataFim });
        default:
          return true;
      }
    });
  }, [dados, filtroPeriodo, dataSelecionada, dataInicio, dataFim]);

  // Cross filtered by date
  const crossFiltrados = useMemo(() => {
    return crossItems.filter(c => {
      let dataDate: Date;
      try { dataDate = parseISO(c.data); } catch { return false; }
      switch (filtroPeriodo) {
        case 'hoje': return isSameDay(dataDate, new Date());
        case 'outro': return isSameDay(dataDate, dataSelecionada);
        case 'semana': {
          const start = startOfWeek(dataSelecionada, { locale: ptBR });
          const end = endOfWeek(dataSelecionada, { locale: ptBR });
          return isWithinInterval(dataDate, { start, end });
        }
        case 'mes': return dataDate.getMonth() === dataSelecionada.getMonth() && dataDate.getFullYear() === dataSelecionada.getFullYear();
        case 'intervalo': return isWithinInterval(dataDate, { start: dataInicio, end: dataFim });
        default: return true;
      }
    });
  }, [crossItems, filtroPeriodo, dataSelecionada, dataInicio, dataFim]);

  // Indicadores
  const indicadores = useMemo<DashboardPorPeriodo>(() => {
    const conferidas = cargasFiltradas.filter(c => c.status_carga === 'conferido');
    return {
      totalVolumes: conferidas.reduce((sum, c) => sum + (c.volume_conferido || 0), 0),
      cargasConferidas: conferidas.length,
      cargasNoShow: cargasFiltradas.filter(c => c.status_carga === 'no_show').length,
      cargasRecusadas: cargasFiltradas.filter(c => c.status_carga === 'recusado').length,
      docasLivres: docas.filter(d => d.status === 'livre').length,
      docasOcupadas: docas.filter(d => d.status === 'ocupada').length,
      docasEmConferencia: docas.filter(d => d.status === 'em_conferencia').length,
      totalCross: crossFiltrados.length,
      crossFinalizados: crossFiltrados.filter(c => c.status === 'finalizado').length,
      crossEmSeparacao: crossFiltrados.filter(c => c.status === 'em_separacao').length,
    };
  }, [cargasFiltradas, docas, crossFiltrados]);

  // Produtividade por conferente
  const produtividade = useMemo<ProdutividadeConferente[]>(() => {
    const conferidas = cargasFiltradas.filter(c => c.status_carga === 'conferido' && c.conferente_id);
    const grouped: Record<string, number> = {};
    conferidas.forEach(c => {
      if (c.conferente_id) {
        grouped[c.conferente_id] = (grouped[c.conferente_id] || 0) + (c.volume_conferido || 0);
      }
    });
    return Object.entries(grouped).map(([id, volumes]) => {
      const conf = conferentes.find(c => c.id === id);
      return { id, nome: conf?.nome || 'Desconhecido', volumes };
    }).sort((a, b) => b.volumes - a.volumes);
  }, [cargasFiltradas, conferentes]);

  // Status chart
  const statusCargas = useMemo<StatusCargaChart[]>(() => {
    const counts: Record<string, number> = {};
    cargasFiltradas.forEach(c => {
      if (c.status_carga) {
        counts[c.status_carga] = (counts[c.status_carga] || 0) + 1;
      }
    });
    return Object.entries(counts).map(([status, value]) => ({
      name: statusCargaLabels[status] || status,
      value,
      color: statusColors[status] || '#94a3b8',
    }));
  }, [cargasFiltradas]);

  const handleFiltroPeriodo = (filtro: FiltroPeriodo) => {
    setFiltroPeriodo(filtro);
    if (filtro === 'hoje') setDataSelecionada(new Date());
  };

  const handleSelectOutroDia = (date: Date | undefined) => {
    if (date) {
      setDataSelecionada(date);
      setFiltroPeriodo('outro');
      setPopoverOpen(false);
    }
  };

  const handleSelectIntervalo = () => {
    setFiltroPeriodo('intervalo');
    setIntervaloPopoverOpen(false);
  };

  const getPeriodoLabel = () => {
    switch (filtroPeriodo) {
      case 'hoje': return `Hoje - ${format(new Date(), 'dd/MM/yyyy')}`;
      case 'outro': return format(dataSelecionada, "dd/MM/yyyy");
      case 'semana': return `Semana - ${format(dataSelecionada, "'Semana' w 'de' yyyy", { locale: ptBR })}`;
      case 'mes': return format(dataSelecionada, "MMMM 'de' yyyy", { locale: ptBR });
      case 'intervalo': return `${format(dataInicio, 'dd/MM')} a ${format(dataFim, 'dd/MM/yyyy')}`;
    }
  };

  const handleExportExcel = () => {
    toast.success('Exportando para Excel...', { description: 'O arquivo será baixado em instantes.' });
  };

  const handleExportPDF = () => {
    toast.success('Gerando PDF...', { description: 'O relatório será baixado em instantes.' });
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header com Filtros e Exportação */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground capitalize">{getPeriodoLabel()}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2" onClick={handleExportExcel}>
                <FileSpreadsheet className="h-4 w-4" />
                Excel
              </Button>
              <Button variant="outline" size="sm" className="gap-2" onClick={handleExportPDF}>
                <FileText className="h-4 w-4" />
                PDF
              </Button>
            </div>
          </div>

          {/* Filtros de Período */}
          <div className="flex flex-wrap items-center gap-2">
            <ToggleGroup 
              type="single" 
              value={filtroPeriodo} 
              onValueChange={(value) => value && handleFiltroPeriodo(value as FiltroPeriodo)}
              className="bg-muted p-1 rounded-lg"
            >
              <ToggleGroupItem value="hoje" className="px-4">Hoje</ToggleGroupItem>
              
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                  <ToggleGroupItem value="outro" className="px-4 gap-1">
                    <CalendarIcon className="h-3 w-3" />
                    Outro Dia
                  </ToggleGroupItem>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dataSelecionada}
                    onSelect={handleSelectOutroDia}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              
              <ToggleGroupItem value="semana" className="px-4">Semana</ToggleGroupItem>
              <ToggleGroupItem value="mes" className="px-4">Mês</ToggleGroupItem>
              
              <Popover open={intervaloPopoverOpen} onOpenChange={setIntervaloPopoverOpen}>
                <PopoverTrigger asChild>
                  <ToggleGroupItem value="intervalo" className="px-4 gap-1">
                    <CalendarRange className="h-3 w-3" />
                    Intervalo
                  </ToggleGroupItem>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4" align="start">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Data Início</p>
                      <Calendar
                        mode="single"
                        selected={dataInicio}
                        onSelect={(date) => date && setDataInicio(date)}
                        className="pointer-events-auto"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Data Fim</p>
                      <Calendar
                        mode="single"
                        selected={dataFim}
                        onSelect={(date) => date && setDataFim(date)}
                        className="pointer-events-auto"
                      />
                    </div>
                    <Button className="w-full" onClick={handleSelectIntervalo}>
                      Aplicar
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </ToggleGroup>
          </div>
        </div>

        {/* Indicadores - Primeira Linha (4 cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total de Volumes" value={indicadores.totalVolumes.toLocaleString()} icon={Package} color="info" />
          <StatCard title="Cargas Conferidas" value={indicadores.cargasConferidas} icon={CheckCircle} color="success" />
          <StatCard title="Cargas No Show" value={indicadores.cargasNoShow} icon={AlertCircle} color="warning" />
          <StatCard title="Cargas Recusadas" value={indicadores.cargasRecusadas} icon={XCircle} color="danger" />
        </div>

        {/* Indicadores - Segunda Linha (3 cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="Docas Livres" value={indicadores.docasLivres} icon={Container} color="success" />
          <StatCard title="Docas Ocupadas" value={indicadores.docasOcupadas} icon={Container} color="warning" />
          <StatCard title="Docas em Conferência" value={indicadores.docasEmConferencia} icon={Container} color="info" />
        </div>

        {/* Indicadores Cross Docking */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="Total Cross" value={indicadores.totalCross ?? 0} icon={ArrowRightLeft} color="info" />
          <StatCard title="Cross Finalizados" value={indicadores.crossFinalizados ?? 0} icon={CheckCircle} color="success" />
          <StatCard title="Cross em Separação" value={indicadores.crossEmSeparacao ?? 0} icon={ArrowRightLeft} color="warning" />
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProductivityChart data={produtividade} />
          {isAdmin && <RankingList data={produtividade} />}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StatusChart data={statusCargas} />
          {!isAdmin && (
            <div className="flex items-center justify-center p-8 bg-muted/30 rounded-lg">
              <p className="text-muted-foreground text-center">
                Ranking detalhado disponível apenas para administradores
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
