import { useState, useMemo } from 'react';
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
import { DocaModal } from '@/components/docas/DocaModal';
import { AssociarCargaModal } from '@/components/docas/AssociarCargaModal';
import { useProfile } from '@/contexts/ProfileContext';
import { docasIniciais, cargasIniciais, conferentes, fornecedores, statusDocaLabels } from '@/data/mockData';
import { Doca, Carga, StatusDoca, StatusCarga } from '@/types';
import { toast } from 'sonner';
import { Container, Plus, Coffee, Unlock } from 'lucide-react';
import { format } from 'date-fns';

const statusStyles: Record<StatusDoca, string> = {
  livre: 'bg-green-100 text-green-800 border-green-300',
  ocupada: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  em_conferencia: 'bg-blue-100 text-blue-800 border-blue-300',
  conferido: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  uso_consumo: 'bg-gray-100 text-gray-600 border-gray-300',
};

interface FinalizacaoData {
  status: StatusCarga;
  volume?: number;
  rua?: string;
  divergencia?: string;
  conferenteId?: string;
}

export default function Docas() {
  const { isAdmin } = useProfile();
  const [docas, setDocas] = useState<Doca[]>(docasIniciais);
  const [cargas, setCargas] = useState<Carga[]>(cargasIniciais);
  const [modalOpen, setModalOpen] = useState(false);
  const [associarModalOpen, setAssociarModalOpen] = useState(false);
  const [selectedDoca, setSelectedDoca] = useState<Doca | null>(null);
  const [modalMode, setModalMode] = useState<'entrar' | 'finalizar'>('entrar');

  const getCarga = (cargaId?: string) => cargas.find(c => c.id === cargaId);
  const getFornecedor = (fornecedorId?: string) => fornecedores.find(f => f.id === fornecedorId);

  // Cargas disponíveis: apenas do dia atual e com status aguardando_chegada
  const cargasDisponiveis = useMemo(() => {
    const hoje = format(new Date(2026, 0, 24), 'yyyy-MM-dd'); // Data simulada
    return cargas.filter(c => c.data === hoje && c.status === 'aguardando_chegada');
  }, [cargas]);

  const handleVincularCarga = (doca: Doca) => {
    setSelectedDoca(doca);
    setAssociarModalOpen(true);
  };

  const handleComecarConferencia = (doca: Doca) => {
    setSelectedDoca(doca);
    setModalMode('entrar');
    setModalOpen(true);
  };

  const handleTerminarConferencia = (doca: Doca) => {
    setSelectedDoca(doca);
    setModalMode('finalizar');
    setModalOpen(true);
  };

  const handleAssociarCarga = (cargaId: string) => {
    if (!selectedDoca) return;
    
    setDocas(docas.map(d => 
      d.id === selectedDoca.id ? { ...d, status: 'ocupada' as StatusDoca, cargaId } : d
    ));
    toast.success(`Carga associada à Doca ${selectedDoca.numero}`);
  };

  const handleUsoConsumo = (doca: Doca) => {
    setDocas(docas.map(d => 
      d.id === doca.id ? { ...d, status: 'uso_consumo' as StatusDoca } : d
    ));
    toast.success(`Doca ${doca.numero} marcada como Uso e Consumo`);
  };

  const handleLiberar = (doca: Doca) => {
    setDocas(docas.map(d => 
      d.id === doca.id ? { 
        ...d, 
        status: 'livre' as StatusDoca, 
        cargaId: undefined, 
        conferenteId: undefined,
        volumeConferido: undefined,
        rua: undefined
      } : d
    ));
    toast.success(`Doca ${doca.numero} liberada`);
  };

  const handleModalConfirm = (data: FinalizacaoData) => {
    if (!selectedDoca) return;

    if (modalMode === 'entrar') {
      // COMEÇAR CONFERÊNCIA - muda status da doca para em_conferencia
      setDocas(docas.map(d => 
        d.id === selectedDoca.id ? { 
          ...d, 
          status: 'em_conferencia' as StatusDoca,
          conferenteId: data.conferenteId,
          rua: data.rua
        } : d
      ));
      
      if (selectedDoca.cargaId) {
        setCargas(cargas.map(c =>
          c.id === selectedDoca.cargaId ? { 
            ...c, 
            status: 'em_conferencia' as StatusCarga, 
            conferenteId: data.conferenteId,
            rua: data.rua
          } : c
        ));
      }
      toast.success(`Conferência iniciada na Doca ${selectedDoca.numero}`);
    } else {
      // TERMINAR CONFERÊNCIA - libera a doca e atualiza a carga no agendamento
      const conferenteAtual = selectedDoca.conferenteId;
      const ruaAtual = selectedDoca.rua;
      
      // Libera a doca (volta para livre)
      setDocas(docas.map(d => 
        d.id === selectedDoca.id ? { 
          ...d, 
          status: 'livre' as StatusDoca,
          cargaId: undefined,
          conferenteId: undefined,
          volumeConferido: undefined,
          rua: undefined
        } : d
      ));
      
      // Atualiza a carga no agendamento com todas as informações finais
      if (selectedDoca.cargaId) {
        setCargas(cargas.map(c =>
          c.id === selectedDoca.cargaId ? { 
            ...c, 
            status: 'conferido' as StatusCarga, 
            volumeConferido: data.volume,
            conferenteId: conferenteAtual,
            rua: ruaAtual,
            divergencia: data.divergencia
          } : c
        ));
      }
      toast.success(`Conferência finalizada - Doca ${selectedDoca.numero} liberada`);
    }
  };

  const handleCriarDoca = () => {
    const novoNumero = Math.max(...docas.map(d => d.numero)) + 1;
    const novaDoca: Doca = {
      id: `d${Date.now()}`,
      numero: novoNumero,
      status: 'livre'
    };
    setDocas([...docas, novaDoca]);
    toast.success(`Doca ${novoNumero} criada`);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Container className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Docas</h1>
              <p className="text-muted-foreground">Gerenciamento de docas de recebimento</p>
            </div>
          </div>
          {isAdmin && (
            <Button onClick={handleCriarDoca} className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Doca
            </Button>
          )}
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Doca</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>NF(s)</TableHead>
                <TableHead className="text-right w-28">Vol. Previsto</TableHead>
                <TableHead className="w-36">Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {docas.map((doca) => {
                const carga = getCarga(doca.cargaId);
                const fornecedor = carga ? getFornecedor(carga.fornecedorId) : undefined;

                return (
                  <TableRow key={doca.id}>
                    <TableCell className="font-bold text-lg">#{doca.numero}</TableCell>
                    <TableCell>{fornecedor?.nome || '-'}</TableCell>
                    <TableCell>{carga?.nfs.join(', ') || '-'}</TableCell>
                    <TableCell className="text-right">
                      {carga?.volumePrevisto || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusStyles[doca.status]}>
                        {statusDocaLabels[doca.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {/* Doca LIVRE - Admin: Vincular Carga + Uso e Consumo */}
                        {doca.status === 'livre' && isAdmin && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleVincularCarga(doca)}
                            >
                              Vincular Carga
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleUsoConsumo(doca)}
                              title="Uso e Consumo"
                            >
                              <Coffee className="h-4 w-4" />
                            </Button>
                          </>
                        )}

                        {/* Doca OCUPADA - Todos: Começar Conferência */}
                        {doca.status === 'ocupada' && (
                          <Button 
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                            onClick={() => handleComecarConferencia(doca)}
                          >
                            COMEÇAR CONFERÊNCIA
                          </Button>
                        )}

                        {/* Doca EM CONFERÊNCIA - Todos: Terminar Conferência */}
                        {doca.status === 'em_conferencia' && (
                          <Button 
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white font-semibold"
                            onClick={() => handleTerminarConferencia(doca)}
                          >
                            TERMINAR CONFERÊNCIA
                          </Button>
                        )}

                        {/* Doca CONFERIDO - Admin: Liberar (se não liberou automaticamente) */}
                        {doca.status === 'conferido' && isAdmin && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleLiberar(doca)}
                            className="gap-1"
                          >
                            <Unlock className="h-4 w-4" />
                            Liberar Doca
                          </Button>
                        )}

                        {/* Doca USO E CONSUMO - Admin: Liberar */}
                        {doca.status === 'uso_consumo' && isAdmin && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleLiberar(doca)}
                            className="gap-1"
                          >
                            <Unlock className="h-4 w-4" />
                            Liberar
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <DocaModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          doca={selectedDoca}
          onConfirm={handleModalConfirm}
          mode={modalMode}
        />

        <AssociarCargaModal
          open={associarModalOpen}
          onClose={() => setAssociarModalOpen(false)}
          doca={selectedDoca}
          cargas={cargasDisponiveis}
          onConfirm={handleAssociarCarga}
        />
      </div>
    </Layout>
  );
}
