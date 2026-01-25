import { useState, useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AgendamentoModal } from '@/components/agendamento/AgendamentoModal';
import { useProfile } from '@/contexts/ProfileContext';
import { cargasIniciais, fornecedores, statusCargaLabels } from '@/data/mockData';
import { Carga, StatusCarga } from '@/types';
import { toast } from 'sonner';
import { Plus, Calendar as CalendarIcon, AlertCircle, XCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const statusStyles: Record<StatusCarga, string> = {
  aguardando_chegada: 'bg-purple-100 text-purple-800 border-purple-300',
  em_conferencia: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  conferido: 'bg-blue-100 text-blue-800 border-blue-300',
  no_show: 'bg-orange-100 text-orange-800 border-orange-300',
  recusado: 'bg-red-100 text-red-800 border-red-300',
};

export default function Agendamento() {
  const { isAdmin } = useProfile();
  const [cargas, setCargas] = useState<Carga[]>(cargasIniciais);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCarga, setSelectedCarga] = useState<Carga | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2026, 0, 24));

  const getFornecedorNome = (id: string) => {
    return fornecedores.find(f => f.id === id)?.nome || 'N/A';
  };

  const cargasFiltradas = useMemo(() => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return cargas.filter(c => c.data === dateStr);
  }, [cargas, selectedDate]);

  const datasComCargas = useMemo(() => {
    return cargas.map(c => parseISO(c.data));
  }, [cargas]);

  const handleNovo = () => {
    setSelectedCarga(null);
    setModalOpen(true);
  };

  const handleSave = (data: Partial<Carga>) => {
    if (selectedCarga) {
      setCargas(cargas.map(c => 
        c.id === selectedCarga.id ? { ...c, ...data } : c
      ));
      toast.success('Agendamento atualizado!');
    } else {
      const novaCarga: Carga = {
        id: `cg${Date.now()}`,
        data: data.data || format(selectedDate, 'yyyy-MM-dd'),
        fornecedorId: data.fornecedorId || '',
        nfs: data.nfs || [],
        volumePrevisto: data.volumePrevisto || 0,
        status: 'aguardando_chegada',
      };
      setCargas([...cargas, novaCarga]);
      toast.success('Agendamento criado!');
    }
  };

  const handleNoShow = (carga: Carga) => {
    setCargas(cargas.map(c => 
      c.id === carga.id ? { ...c, status: 'no_show' as StatusCarga } : c
    ));
    toast.success(`Carga ${carga.nfs[0]} marcada como No Show`);
  };

  const handleRecusado = (carga: Carga) => {
    setCargas(cargas.map(c => 
      c.id === carga.id ? { ...c, status: 'recusado' as StatusCarga } : c
    ));
    toast.success(`Carga ${carga.nfs[0]} marcada como Recusado`);
  };

  const canChangeStatus = (carga: Carga) => {
    return carga.status === 'aguardando_chegada' || carga.status === 'em_conferencia';
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CalendarIcon className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Agendamento</h1>
              <p className="text-muted-foreground">
                {format(selectedDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button onClick={handleNovo} className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Agendamento
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-1">
            <CardContent className="p-3">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                locale={ptBR}
                modifiers={{
                  hasCargas: datasComCargas
                }}
                modifiersStyles={{
                  hasCargas: { fontWeight: 'bold', textDecoration: 'underline' }
                }}
                className="pointer-events-auto"
              />
            </CardContent>
          </Card>

          <div className="lg:col-span-3 border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>NF(s)</TableHead>
                  <TableHead className="text-right">Volume</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cargasFiltradas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Nenhum agendamento para esta data
                    </TableCell>
                  </TableRow>
                ) : (
                  cargasFiltradas.map((carga) => (
                    <TableRow key={carga.id}>
                      <TableCell className="font-medium">{getFornecedorNome(carga.fornecedorId)}</TableCell>
                      <TableCell>{carga.nfs.join(', ')}</TableCell>
                      <TableCell className="text-right">{carga.volumePrevisto}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={statusStyles[carga.status]}
                        >
                          {statusCargaLabels[carga.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {canChangeStatus(carga) && (
                          <div className="flex justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleNoShow(carga)}
                              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                              title="Marcar No Show"
                            >
                              <AlertCircle className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleRecusado(carga)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Marcar Recusado"
                            >
                              <XCircle className="h-4 w-4" />
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
        </div>

        <AgendamentoModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          carga={selectedCarga}
          onSave={handleSave}
          selectedDate={selectedDate}
        />
      </div>
    </Layout>
  );
}
