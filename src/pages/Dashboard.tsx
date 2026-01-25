import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { StatCard } from '@/components/dashboard/StatCard';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { dashboardPorPeriodo } from '@/data/mockData';
import { Package, CheckCircle, Container } from 'lucide-react';

type Periodo = 'dia' | 'semana' | 'mes';

export default function Dashboard() {
  const [periodo, setPeriodo] = useState<Periodo>('dia');

  const indicadores = dashboardPorPeriodo[periodo];

  const getPeriodoLabel = () => {
    switch (periodo) {
      case 'dia': return 'Hoje - 24/01/2026';
      case 'semana': return 'Semana - 20/01 a 26/01/2026';
      case 'mes': return 'Mês - Janeiro/2026';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">{getPeriodoLabel()}</p>
          </div>
          <ToggleGroup 
            type="single" 
            value={periodo} 
            onValueChange={(value) => value && setPeriodo(value as Periodo)}
            className="bg-muted p-1 rounded-lg"
          >
            <ToggleGroupItem value="dia" className="px-4">Dia</ToggleGroupItem>
            <ToggleGroupItem value="semana" className="px-4">Semana</ToggleGroupItem>
            <ToggleGroupItem value="mes" className="px-4">Mês</ToggleGroupItem>
          </ToggleGroup>
        </div>

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
        </div>
      </div>
    </Layout>
  );
}
