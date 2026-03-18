import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { useFluxoOperacional, FluxoOperacional } from '@/hooks/useFluxoOperacional';
import { useProfile } from '@/contexts/ProfileContext';
import { statusCargaLabels } from '@/data/mockData';
import { useTiposVeiculoDB } from '@/hooks/useTiposVeiculoDB';
import { CalendarPlus, Package, Truck, BarChart3, ClipboardCheck, LogOut } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const statusStyles: Record<string, string> = {
  aguardando_chegada: 'bg-blue-100 text-blue-800 border-blue-300',
  aguardando_doca: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  aguardando_conferencia: 'bg-cyan-100 text-cyan-800 border-cyan-300',
  em_conferencia: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  conferido: 'bg-green-100 text-green-800 border-green-300',
  no_show: 'bg-gray-100 text-gray-800 border-gray-300',
  recusado: 'bg-red-100 text-red-800 border-red-300',
};

function getDisplayStatus(d: FluxoOperacional): { key: string; label: string } {
  if (d.chegou && d.status_carga === 'aguardando_chegada') {
    return { key: 'aguardando_doca', label: 'Aguardando Doca' };
  }
  return { key: d.status_carga || '', label: statusCargaLabels[d.status_carga || ''] || d.status_carga || '-' };
}

export default function AgendamentoComprador() {
  const { dados } = useFluxoOperacional();
  const { logout } = useProfile();
  const navigate = useNavigate();
  const { getLabelByNome } = useTiposVeiculoDB();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const cargasFiltradas = useMemo(() => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return dados.filter(d => d.data_agendada === dateStr);
  }, [dados, selectedDate]);

  const datasComCargas = useMemo(() => {
    const unique = new Set(dados.map(d => d.data_agendada).filter(Boolean));
    return Array.from(unique).map(d => parseISO(d!));
  }, [dados]);

  const resumo = useMemo(() => {
    const totalCargas = cargasFiltradas.length;
    const totalCaminhoes = cargasFiltradas.reduce((s, d) => s + (d.quantidade_veiculos || 1), 0);
    const volumePrevisto = cargasFiltradas.reduce((s, d) => s + (d.volume_previsto || 0), 0);
    const volumeConferido = cargasFiltradas.reduce((s, d) => s + (d.volume_conferido || 0), 0);
    return { totalCargas, totalCaminhoes, volumePrevisto, volumeConferido };
  }, [cargasFiltradas]);

  const handleLogout = () => {
    logout();
    navigate('/comprador', { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarPlus className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">Agendamentos</h1>
          <Badge variant="secondary">Somente Leitura</Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
          <LogOut className="h-4 w-4" /> Sair
        </Button>
      </header>

      <main className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Resumo */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Package className="h-8 w-8 text-primary shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">Cargas</p>
                <p className="text-2xl font-bold">{resumo.totalCargas}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Truck className="h-8 w-8 text-primary shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">Caminhões</p>
                <p className="text-2xl font-bold">{resumo.totalCaminhoes}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-primary shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">Vol. Previsto</p>
                <p className="text-2xl font-bold">{resumo.volumePrevisto}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <ClipboardCheck className="h-8 w-8 text-primary shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">Vol. Conferido</p>
                <p className="text-2xl font-bold">{resumo.volumeConferido}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-1">
            <CardContent className="p-3">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                locale={ptBR}
                modifiers={{ hasCargas: datasComCargas }}
                modifiersStyles={{ hasCargas: { fontWeight: 'bold', textDecoration: 'underline' } }}
                className="pointer-events-auto"
              />
            </CardContent>
          </Card>

          <div className="lg:col-span-3 border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Horário</TableHead>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>NF(s)</TableHead>
                  <TableHead className="text-right">Vol. Previsto</TableHead>
                  <TableHead className="text-right">Vol. Conferido</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cargasFiltradas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Nenhum agendamento para esta data
                    </TableCell>
                  </TableRow>
                ) : (
                  cargasFiltradas.map((d) => {
                    const s = getDisplayStatus(d);
                    return (
                      <TableRow key={d.carga_id || d.senha_id}>
                        <TableCell className="whitespace-nowrap">
                          {d.data_agendada ? format(parseISO(d.data_agendada), 'dd/MM/yyyy') : '-'}
                        </TableCell>
                        <TableCell>{d.horario_previsto || '-'}</TableCell>
                        <TableCell className="font-medium">{d.fornecedor_nome || '-'}</TableCell>
                        <TableCell>{d.nota_fiscal && d.nota_fiscal.length > 0 ? d.nota_fiscal.join(', ') : '-'}</TableCell>
                        <TableCell className="text-right">{d.volume_previsto ?? '-'}</TableCell>
                        <TableCell className="text-right">{d.volume_conferido ?? '-'}</TableCell>
                        <TableCell>{d.tipo_veiculo ? (tipoCaminhaoLabels[d.tipo_veiculo] || d.tipo_veiculo) : '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusStyles[s.key] || ''}>{s.label}</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
    </div>
  );
}
