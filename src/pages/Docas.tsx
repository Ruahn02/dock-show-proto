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
import { Container, Plus, Coffee, Unlock, LogIn, CheckCircle } from 'lucide-react';

const statusStyles: Record<StatusDoca, string> = {
  livre: 'bg-green-100 text-green-800 border-green-300',
  ocupada: 'bg-yellow-100 text-yellow-800 border-yellow-300',
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
  const getConferente = (conferenteId?: string) => conferentes.find(c => c.id === conferenteId);
  const getFornecedor = (fornecedorId?: string) => fornecedores.find(f => f.id === fornecedorId);

  const cargasDisponiveis = useMemo(() => 
    cargas.filter(c => c.status === 'aguardando_chegada' || c.status === 'em_conferencia'),
  [cargas]);

  const handleClickDoca = (doca: Doca) => {
    if (doca.status === 'livre') {
      setSelectedDoca(doca);
      setAssociarModalOpen(true);
    } else if (doca.status === 'ocupada') {
      const carga = getCarga(doca.cargaId);
      if (carga?.status === 'em_conferencia') {
        setSelectedDoca(doca);
        setModalMode('finalizar');
        setModalOpen(true);
      } else {
        setSelectedDoca(doca);
        setModalMode('entrar');
        setModalOpen(true);
      }
    }
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
      setDocas(docas.map(d => 
        d.id === selectedDoca.id ? { 
          ...d, 
          conferenteId: data.conferenteId,
          rua: data.rua
        } : d
      ));
      
      if (selectedDoca.cargaId) {
        setCargas(cargas.map(c =>
          c.id === selectedDoca.cargaId ? { ...c, status: 'em_conferencia' as StatusCarga, conferenteId: data.conferenteId } : c
        ));
      }
      toast.success(`Conferência iniciada na Doca ${selectedDoca.numero}`);
    } else {
      if (data.status === 'conferido') {
        setDocas(docas.map(d => 
          d.id === selectedDoca.id ? { 
            ...d, 
            volumeConferido: data.volume,
            rua: data.rua
          } : d
        ));
        
        if (selectedDoca.cargaId) {
          setCargas(cargas.map(c =>
            c.id === selectedDoca.cargaId ? { 
              ...c, 
              status: 'conferido' as StatusCarga, 
              volumeConferido: data.volume,
              rua: data.rua,
              divergencia: data.divergencia
            } : c
          ));
        }
        toast.success(`Doca ${selectedDoca.numero} conferida com ${data.volume} volumes`);
      } else {
        // No Show ou Recusado - libera a doca mas mantém a carga com seu status
        setDocas(docas.map(d => 
          d.id === selectedDoca.id ? { 
            ...d, 
            status: 'livre' as StatusDoca,
            cargaId: undefined,
            conferenteId: undefined
          } : d
        ));
        
        if (selectedDoca.cargaId) {
          setCargas(cargas.map(c =>
            c.id === selectedDoca.cargaId ? { ...c, status: data.status } : c
          ));
        }
        toast.success(`Doca ${selectedDoca.numero} - ${data.status === 'no_show' ? 'No Show' : 'Recusado'}`);
      }
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
                <TableHead className="w-32">Status</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>NF(s)</TableHead>
                <TableHead className="text-right w-24">Volume</TableHead>
                <TableHead>Conferente</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {docas.map((doca) => {
                const carga = getCarga(doca.cargaId);
                const conferente = getConferente(doca.conferenteId);
                const fornecedor = carga ? getFornecedor(carga.fornecedorId) : undefined;

                return (
                  <TableRow 
                    key={doca.id}
                    className={doca.status === 'livre' ? 'cursor-pointer hover:bg-muted/50' : ''}
                    onClick={() => doca.status === 'livre' && handleClickDoca(doca)}
                  >
                    <TableCell className="font-bold text-lg">#{doca.numero}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusStyles[doca.status]}>
                        {statusDocaLabels[doca.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>{fornecedor?.nome || '-'}</TableCell>
                    <TableCell>{carga?.nfs.join(', ') || '-'}</TableCell>
                    <TableCell className="text-right">
                      {doca.volumeConferido ? (
                        <span className="font-bold text-primary">{doca.volumeConferido}</span>
                      ) : carga?.volumePrevisto || '-'}
                    </TableCell>
                    <TableCell>{conferente?.nome || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {doca.status === 'livre' && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => { e.stopPropagation(); handleClickDoca(doca); }}
                              title="Associar Carga"
                            >
                              <LogIn className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => { e.stopPropagation(); handleUsoConsumo(doca); }}
                              title="Uso e Consumo"
                            >
                              <Coffee className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {doca.status === 'ocupada' && (
                          <>
                            {carga?.status !== 'em_conferencia' && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleClickDoca(doca)}
                                title="Iniciar Conferência"
                              >
                                <LogIn className="h-4 w-4" />
                              </Button>
                            )}
                            {carga?.status === 'em_conferencia' && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleClickDoca(doca)}
                                title="Finalizar Conferência"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleLiberar(doca)}
                              className="text-green-600 hover:text-green-700"
                              title="Liberar"
                            >
                              <Unlock className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {doca.status === 'uso_consumo' && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleLiberar(doca)}
                            className="text-green-600 hover:text-green-700"
                            title="Liberar"
                          >
                            <Unlock className="h-4 w-4" />
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
