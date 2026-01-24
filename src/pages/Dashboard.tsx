import { Layout } from '@/components/layout/Layout';
import { StatCard } from '@/components/dashboard/StatCard';
import { ProductivityChart } from '@/components/dashboard/ProductivityChart';
import { RankingList } from '@/components/dashboard/RankingList';
import { StatusChart } from '@/components/dashboard/StatusChart';
import { Button } from '@/components/ui/button';
import { useProfile } from '@/contexts/ProfileContext';
import { dashboardIndicadores } from '@/data/mockData';
import { toast } from 'sonner';
import { 
  Package, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Container,
  Clock,
  FileSpreadsheet,
  FileText
} from 'lucide-react';

export default function Dashboard() {
  const { isAdmin } = useProfile();

  const handleExportExcel = () => {
    toast.success('Exportação Excel simulada com sucesso!');
  };

  const handleExportPDF = () => {
    toast.success('Exportação PDF simulada com sucesso!');
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Indicadores do dia - 24/01/2026</p>
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportExcel} className="gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                Exportar Excel
              </Button>
              <Button variant="outline" onClick={handleExportPDF} className="gap-2">
                <FileText className="h-4 w-4" />
                Exportar PDF
              </Button>
            </div>
          )}
        </div>

        {/* Indicadores principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total de Volumes"
            value={dashboardIndicadores.totalVolumes.toLocaleString()}
            icon={Package}
            color="info"
          />
          {isAdmin && (
            <StatCard
              title="Média por Conferente"
              value={dashboardIndicadores.mediaVolumesConferente}
              icon={Users}
              color="default"
            />
          )}
          <StatCard
            title="Cargas Conferidas"
            value={dashboardIndicadores.cargasConferidas}
            icon={CheckCircle}
            color="success"
          />
          <StatCard
            title="Cargas No Show"
            value={dashboardIndicadores.cargasNoShow}
            icon={AlertCircle}
            color="warning"
          />
        </div>

        {/* Segunda linha de indicadores */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Cargas Recusadas"
            value={dashboardIndicadores.cargasRecusadas}
            icon={XCircle}
            color="danger"
          />
          <StatCard
            title="Docas Livres"
            value={dashboardIndicadores.docasLivres}
            icon={Container}
            color="success"
          />
          <StatCard
            title="Docas Ocupadas"
            value={dashboardIndicadores.docasOcupadas}
            icon={Container}
            color="warning"
          />
          <StatCard
            title="Docas em Conferência"
            value={dashboardIndicadores.docasConferindo}
            icon={Clock}
            color="info"
          />
        </div>

        {/* Gráficos - apenas para Admin */}
        {isAdmin && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ProductivityChart />
            <RankingList />
          </div>
        )}

        {/* Gráfico de status - visível para todos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StatusChart />
          {!isAdmin && (
            <div className="flex items-center justify-center p-8 border rounded-lg bg-muted/30">
              <div className="text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  O ranking detalhado de conferentes está disponível apenas para administradores.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
