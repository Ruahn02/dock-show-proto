import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { StatCard } from '@/components/dashboard/StatCard';
import { ProductivityChart } from '@/components/dashboard/ProductivityChart';
import { RankingList } from '@/components/dashboard/RankingList';
import { StatusChart } from '@/components/dashboard/StatusChart';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { dashboardPorPeriodo, produtividadeConferentes, statusCargasChart } from '@/data/mockData';
import { useProfile } from '@/contexts/ProfileContext';
import { Package, CheckCircle, AlertCircle, XCircle, Container, FileSpreadsheet, FileText, CalendarIcon, CalendarRange } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type Periodo = 'dia' | 'semana' | 'mes';
type FiltroPeriodo = 'hoje' | 'outro' | 'semana' | 'mes' | 'intervalo';

export default function Dashboard() {
  const { isAdmin } = useProfile();
  const [periodo, setPeriodo] = useState<Periodo>('dia');
  const [filtroPeriodo, setFiltroPeriodo] = useState<FiltroPeriodo>('hoje');
  const [dataSelecionada, setDataSelecionada] = useState<Date>(new Date());
  const [dataInicio, setDataInicio] = useState<Date>(new Date());
  const [dataFim, setDataFim] = useState<Date>(new Date());
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [intervaloPopoverOpen, setIntervaloPopoverOpen] = useState(false);

  const indicadores = dashboardPorPeriodo[periodo];
  const produtividade = produtividadeConferentes[periodo];
  const statusCargas = statusCargasChart[periodo];

  const handleFiltroPeriodo = (filtro: FiltroPeriodo) => {
    setFiltroPeriodo(filtro);
    switch (filtro) {
      case 'hoje':
        setPeriodo('dia');
        setDataSelecionada(new Date());
        break;
      case 'semana':
        setPeriodo('semana');
        break;
      case 'mes':
        setPeriodo('mes');
        break;
    }
  };

  const handleSelectOutroDia = (date: Date | undefined) => {
    if (date) {
      setDataSelecionada(date);
      setFiltroPeriodo('outro');
      setPeriodo('dia');
      setPopoverOpen(false);
    }
  };

  const handleSelectIntervalo = () => {
    setFiltroPeriodo('intervalo');
    setPeriodo('mes');
    setIntervaloPopoverOpen(false);
  };

  const getPeriodoLabel = () => {
    switch (filtroPeriodo) {
      case 'hoje':
        return `Hoje - ${format(new Date(), 'dd/MM/yyyy')}`;
      case 'outro':
        return format(dataSelecionada, "dd/MM/yyyy");
      case 'semana':
        return `Semana - ${format(new Date(), "'Semana' w 'de' yyyy", { locale: ptBR })}`;
      case 'mes':
        return format(new Date(), "MMMM 'de' yyyy", { locale: ptBR });
      case 'intervalo':
        return `${format(dataInicio, 'dd/MM')} a ${format(dataFim, 'dd/MM/yyyy')}`;
    }
  };

  const handleExportExcel = () => {
    toast.success('Exportando para Excel...', {
      description: 'O arquivo será baixado em instantes.',
    });
  };

  const handleExportPDF = () => {
    toast.success('Gerando PDF...', {
      description: 'O relatório será baixado em instantes.',
    });
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
          <StatCard
            title="Total de Volumes"
            value={indicadores.totalVolumes.toLocaleString()}
            icon={Package}
            color="info"
          />
          <StatCard
            title="Cargas Conferidas"
            value={indicadores.cargasConferidas}
            icon={CheckCircle}
            color="success"
          />
          <StatCard
            title="Cargas No Show"
            value={indicadores.cargasNoShow}
            icon={AlertCircle}
            color="warning"
          />
          <StatCard
            title="Cargas Recusadas"
            value={indicadores.cargasRecusadas}
            icon={XCircle}
            color="danger"
          />
        </div>

        {/* Indicadores - Segunda Linha (3 cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Docas Livres"
            value={indicadores.docasLivres}
            icon={Container}
            color="success"
          />
          <StatCard
            title="Docas Ocupadas"
            value={indicadores.docasOcupadas}
            icon={Container}
            color="warning"
          />
          <StatCard
            title="Docas em Conferência"
            value={indicadores.docasEmConferencia}
            icon={Container}
            color="info"
          />
        </div>

        {/* Gráficos - Apenas Admin vê ranking detalhado */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProductivityChart data={produtividade} />
          {isAdmin && <RankingList data={produtividade} />}
        </div>

        {/* Gráfico de Status */}
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
