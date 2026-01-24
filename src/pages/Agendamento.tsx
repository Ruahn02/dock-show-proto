import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Plus, Edit, Container, Calendar } from 'lucide-react';

const statusStyles: Record<StatusCarga, string> = {
  agendado: 'bg-purple-100 text-purple-800 border-purple-300',
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

  const getFornecedorNome = (id: string) => {
    return fornecedores.find(f => f.id === id)?.nome || 'N/A';
  };

  const handleNovo = () => {
    setSelectedCarga(null);
    setModalOpen(true);
  };

  const handleEdit = (carga: Carga) => {
    setSelectedCarga(carga);
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
        data: data.data || new Date().toISOString().split('T')[0],
        fornecedorId: data.fornecedorId || '',
        nfs: data.nfs || [],
        volumePrevisto: data.volumePrevisto || 0,
        status: 'agendado',
      };
      setCargas([...cargas, novaCarga]);
      toast.success('Agendamento criado!');
    }
  };

  const handleAssociarDoca = (carga: Carga) => {
    toast.success(`Carga ${carga.nfs[0]} associada à doca (simulado)`);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Agendamento</h1>
              <p className="text-muted-foreground">Cargas agendadas para hoje - 24/01/2026</p>
            </div>
          </div>
          {isAdmin && (
            <Button onClick={handleNovo} className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Agendamento
            </Button>
          )}
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>NF(s)</TableHead>
                <TableHead className="text-right">Volume Previsto</TableHead>
                <TableHead>Status</TableHead>
                {isAdmin && <TableHead className="text-right">Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {cargas.map((carga) => (
                <TableRow key={carga.id}>
                  <TableCell>{new Date(carga.data).toLocaleDateString('pt-BR')}</TableCell>
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
                  {isAdmin && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEdit(carga)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {carga.status === 'agendado' && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleAssociarDoca(carga)}
                          >
                            <Container className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <AgendamentoModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          carga={selectedCarga}
          onSave={handleSave}
        />
      </div>
    </Layout>
  );
}
