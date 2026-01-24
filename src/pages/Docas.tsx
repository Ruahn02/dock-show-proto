import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { DocaCard } from '@/components/docas/DocaCard';
import { DocaModal } from '@/components/docas/DocaModal';
import { useProfile } from '@/contexts/ProfileContext';
import { docasIniciais, cargasIniciais, conferentes, fornecedores } from '@/data/mockData';
import { Doca, StatusCarga } from '@/types';
import { toast } from 'sonner';
import { Container, Plus } from 'lucide-react';

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
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDoca, setSelectedDoca] = useState<Doca | null>(null);
  const [modalMode, setModalMode] = useState<'entrar' | 'finalizar'>('entrar');

  const getCarga = (cargaId?: string) => {
    return cargasIniciais.find(c => c.id === cargaId);
  };

  const getConferente = (conferenteId?: string) => {
    return conferentes.find(c => c.id === conferenteId);
  };

  const getFornecedor = (carga: ReturnType<typeof getCarga>) => {
    if (!carga) return undefined;
    return fornecedores.find(f => f.id === carga.fornecedorId);
  };

  const handleAlterarStatus = (doca: Doca) => {
    if (isAdmin) {
      // Admin pode alterar diretamente
      setSelectedDoca(doca);
      setModalMode('finalizar');
      setModalOpen(true);
    } else {
      // Operacional finaliza conferência
      setSelectedDoca(doca);
      setModalMode('finalizar');
      setModalOpen(true);
    }
  };

  const handleUsoConsumo = (doca: Doca) => {
    setDocas(docas.map(d => 
      d.id === doca.id ? { ...d, status: 'uso_consumo' } : d
    ));
    toast.success(`Doca ${doca.numero} marcada como Uso e Consumo`);
  };

  const handleLiberar = (doca: Doca) => {
    setDocas(docas.map(d => 
      d.id === doca.id ? { 
        ...d, 
        status: 'livre', 
        cargaId: undefined, 
        conferenteId: undefined,
        volumeConferido: undefined,
        rua: undefined
      } : d
    ));
    toast.success(`Doca ${doca.numero} liberada`);
  };

  const handleEntrar = (doca: Doca) => {
    setSelectedDoca(doca);
    setModalMode('entrar');
    setModalOpen(true);
  };

  const handleModalConfirm = (data: FinalizacaoData) => {
    if (!selectedDoca) return;

    if (modalMode === 'entrar') {
      setDocas(docas.map(d => 
        d.id === selectedDoca.id ? { 
          ...d, 
          status: 'conferindo',
          conferenteId: data.conferenteId,
          rua: data.rua
        } : d
      ));
      toast.success(`Conferência iniciada na Doca ${selectedDoca.numero}`);
    } else {
      if (data.status === 'conferido') {
        setDocas(docas.map(d => 
          d.id === selectedDoca.id ? { 
            ...d, 
            status: 'conferido',
            volumeConferido: data.volume,
            rua: data.rua
          } : d
        ));
        toast.success(`Doca ${selectedDoca.numero} conferida com ${data.volume} volumes`);
      } else {
        setDocas(docas.map(d => 
          d.id === selectedDoca.id ? { 
            ...d, 
            status: 'livre',
            cargaId: undefined,
            conferenteId: undefined
          } : d
        ));
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {docas.map((doca) => {
            const carga = getCarga(doca.cargaId);
            const conferente = getConferente(doca.conferenteId);
            const fornecedor = getFornecedor(carga);

            return (
              <DocaCard
                key={doca.id}
                doca={doca}
                carga={carga}
                conferente={conferente}
                fornecedor={fornecedor}
                onAlterarStatus={handleAlterarStatus}
                onUsoConsumo={handleUsoConsumo}
                onLiberar={handleLiberar}
                onEntrar={handleEntrar}
              />
            );
          })}
        </div>

        <DocaModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          doca={selectedDoca}
          onConfirm={handleModalConfirm}
          mode={modalMode}
        />
      </div>
    </Layout>
  );
}
