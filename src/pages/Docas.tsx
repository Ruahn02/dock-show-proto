import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { DocaModal } from '@/components/docas/DocaModal';
import { AssociarCargaModal } from '@/components/docas/AssociarCargaModal';
import { useProfile } from '@/contexts/ProfileContext';
import { useSenha } from '@/contexts/SenhaContext';
import { useCross } from '@/contexts/CrossContext';
import { statusDocaLabels, tipoCaminhaoLabels } from '@/data/mockData';
import { useDocasDB } from '@/hooks/useDocasDB';
import { useFornecedoresDB } from '@/hooks/useFornecedoresDB';
import { Doca, StatusDoca, StatusCarga, Senha } from '@/types';
import { toast } from 'sonner';
import { Container, Plus, Coffee, Unlock, XCircle, MapPin, RotateCcw } from 'lucide-react';
import { useFluxoOperacional } from '@/hooks/useFluxoOperacional';

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
  const { 
    senhas, 
    cargas, 
    getCargasDisponiveis, 
    vincularCargaADoca, 
    recusarCarga, 
    atualizarCarga,
    moverParaPatio,
    retomarDoPatio,
    atualizarStatusSenha,
    vincularSenhaADoca
  } = useSenha();
  const { atualizarFluxo } = useFluxoOperacional();
  const { adicionarCross } = useCross();
  const { docas, atualizarDoca, criarDoca: criarDocaDB, refetch: refetchDocas } = useDocasDB();
  const { fornecedores } = useFornecedoresDB();
  const [modalOpen, setModalOpen] = useState(false);
  const [associarModalOpen, setAssociarModalOpen] = useState(false);
  const [selectedDoca, setSelectedDoca] = useState<Doca | null>(null);
  const [modalMode, setModalMode] = useState<'entrar' | 'finalizar'>('entrar');
  
  const [confirmRecusar, setConfirmRecusar] = useState(false);
  const [docaToRecusar, setDocaToRecusar] = useState<Doca | null>(null);
  
  const [gerenciarModalOpen, setGerenciarModalOpen] = useState(false);
  const [patioConfirmOpen, setPatioConfirmOpen] = useState(false);
  const [trocarDocaModalOpen, setTrocarDocaModalOpen] = useState(false);
  const [patioSenhaId, setPatioSenhaId] = useState<string | null>(null);
  const [docaToLiberar, setDocaToLiberar] = useState<Doca | null>(null);
  
  const [retomarModalOpen, setRetomarModalOpen] = useState(false);
  const [retomarSenhaId, setRetomarSenhaId] = useState<string | null>(null);
  const [selectedDocaNumero, setSelectedDocaNumero] = useState<string>('');

  const getCarga = (cargaId?: string) => cargas.find(c => c.id === cargaId);
  const getFornecedor = (fornecedorId?: string) => fornecedores?.find(f => f.id === fornecedorId);
  
  const senhasEmPatio = senhas.filter(s => s.localAtual === 'em_patio' && !s.liberada);
  const docasLivres = docas.filter(d => d.status === 'livre');
  const cargasDisponiveis = getCargasDisponiveis();

  // Senhas órfãs: aguardando doca sem carga vinculada
  const senhasOrfas = senhas.filter(s => 
    s.localAtual === 'aguardando_doca' && 
    !s.liberada && 
    !s.cargaId
  );

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
    
    // Find the senha for this carga that's aguardando_doca
    const senhaParaDoca = senhas.find(s => 
      s.cargaId === cargaId && 
      s.localAtual === 'aguardando_doca' && 
      !s.liberada
    );
    
    atualizarDoca(selectedDoca.id, { 
      status: 'ocupada', 
      cargaId, 
      senhaId: senhaParaDoca?.id 
    });
    
    vincularCargaADoca(cargaId, selectedDoca.numero);
    toast.success(`Carga associada à Doca ${selectedDoca.numero}`);
  };

  const handleAssociarSenha = (senhaId: string) => {
    if (!selectedDoca) return;
    atualizarDoca(selectedDoca.id, { 
      status: 'ocupada', 
      senhaId,
    });
    vincularSenhaADoca(senhaId, selectedDoca.numero);
    toast.success(`Senha vinculada à Doca ${selectedDoca.numero}`);
  };

  const handleUsoConsumo = (doca: Doca) => {
    atualizarDoca(doca.id, { status: 'uso_consumo' });
    toast.success(`Doca ${doca.numero} marcada como Uso e Consumo`);
  };

  const handleLiberar = (doca: Doca) => {
    atualizarDoca(doca.id, { status: 'livre', cargaId: undefined, conferenteId: undefined, volumeConferido: undefined, rua: undefined, senhaId: undefined });
    toast.success(`Doca ${doca.numero} liberada`);
  };

  const openRecusarConfirm = (doca: Doca) => {
    setDocaToRecusar(doca);
    setConfirmRecusar(true);
  };

  const handleRecusarCarga = async () => {
    if (!docaToRecusar) return;
    await atualizarFluxo({
      p_carga_id: docaToRecusar.cargaId || null,
      p_senha_id: docaToRecusar.senhaId || null,
      p_novo_status: 'recusado',
    });
    toast.success(`Carga recusada${docaToRecusar.numero ? ` - Doca ${docaToRecusar.numero} liberada` : ''}`);
    setConfirmRecusar(false);
    setDocaToRecusar(null);
  };

  const handleOpenGerenciarLocal = (doca: Doca) => {
    setPatioSenhaId(doca.senhaId || null);
    setDocaToLiberar(doca);
    setGerenciarModalOpen(true);
  };

  const handleConfirmPatio = () => {
    if (!docaToLiberar) return;
    if (patioSenhaId) {
      moverParaPatio(patioSenhaId);
    }
    atualizarDoca(docaToLiberar.id, { status: 'livre', cargaId: undefined, conferenteId: undefined, volumeConferido: undefined, rua: undefined, senhaId: undefined });
    toast.success(`Caminhão movido para pátio`);
    setPatioConfirmOpen(false);
    setGerenciarModalOpen(false);
    setPatioSenhaId(null);
  };

  const handleConfirmTrocarDoca = () => {
    if (!docaToLiberar || !selectedDocaNumero) return;
    const novaDocaNumero = parseInt(selectedDocaNumero);
    const novaDoca = docas.find(d => d.numero === novaDocaNumero);
    if (!novaDoca) return;
    
    atualizarDoca(docaToLiberar.id, { status: 'livre', cargaId: undefined, conferenteId: undefined, volumeConferido: undefined, rua: undefined, senhaId: undefined });
    atualizarDoca(novaDoca.id, {
      status: docaToLiberar.status,
      cargaId: docaToLiberar.cargaId,
      conferenteId: docaToLiberar.conferenteId,
      volumeConferido: docaToLiberar.volumeConferido,
      rua: docaToLiberar.rua,
      senhaId: docaToLiberar.senhaId
    });
    
    if (patioSenhaId) {
      vincularSenhaADoca(patioSenhaId, novaDocaNumero);
    }
    
    toast.success(`Carga movida para Doca ${novaDocaNumero}`);
    setTrocarDocaModalOpen(false);
    setGerenciarModalOpen(false);
    setSelectedDocaNumero('');
  };

  const handleOpenRetomar = (senhaId: string) => {
    setRetomarSenhaId(senhaId);
    setSelectedDocaNumero('');
    setRetomarModalOpen(true);
  };

  const handleConfirmRetomar = () => {
    if (!retomarSenhaId || !selectedDocaNumero) return;
    const docaNumero = parseInt(selectedDocaNumero);
    const doca = docas.find(d => d.numero === docaNumero);
    if (!doca) return;
    
    // Find carga linked to this senha
    const senhaDoPatio = senhas.find(s => s.id === retomarSenhaId);
    const cargaDaSenha = senhaDoPatio?.cargaId ? cargas.find(c => c.id === senhaDoPatio.cargaId) : undefined;
    
    atualizarDoca(doca.id, {
      status: 'ocupada',
      senhaId: retomarSenhaId,
      cargaId: cargaDaSenha?.id
    });
    
    retomarDoPatio(retomarSenhaId, docaNumero);
    toast.success(`Caminhão retomado para Doca ${docaNumero}`);
    setRetomarModalOpen(false);
  };

  const handleModalConfirm = async (data: FinalizacaoData) => {
    if (!selectedDoca) return;

    const isPatioConferencia = selectedDoca.id.startsWith('patio_');

    if (modalMode === 'entrar') {
      if (!isPatioConferencia && !selectedDoca.senhaId) return;
      
      await atualizarFluxo({
        p_carga_id: selectedDoca.cargaId || null,
        p_senha_id: selectedDoca.senhaId || null,
        p_novo_status: 'em_conferencia',
        p_conferente_id: data.conferenteId || null,
        p_rua: data.rua || null,
      });
      
      await refetchDocas();
      const localMsg = isPatioConferencia ? 'no Pátio' : `na Doca ${selectedDoca.numero}`;
      toast.success(`Conferência iniciada ${localMsg}`);
    } else {
      const carga = getCarga(selectedDoca.cargaId);
      const conferenteAtual = selectedDoca.conferenteId || data.conferenteId;
      const ruaAtual = selectedDoca.rua || data.rua;
      
      // Check if volume conferido >= volume previsto for cross docking creation
      let deveCriarCross = false;
      if (carga) {
        const senhasDaCarga = senhas.filter(s => s.cargaId === carga.id && s.status !== 'recusado');
        const totalVolume = senhasDaCarga.reduce((sum, s) => {
          if (s.id === selectedDoca.senhaId) return sum + (data.volume || 0);
          return sum + (s.volumeConferido || 0);
        }, 0);
        deveCriarCross = totalVolume >= carga.volumePrevisto;
      }
      
      await atualizarFluxo({
        p_carga_id: selectedDoca.cargaId || null,
        p_senha_id: selectedDoca.senhaId || null,
        p_novo_status: 'conferido',
        p_volume_conferido: data.volume ?? null,
        p_conferente_id: conferenteAtual || null,
        p_rua: ruaAtual || null,
        p_divergencia: data.divergencia || null,
      });
      
      // Only add to Cross Docking if volume conferido >= volume previsto
      if (carga && deveCriarCross) {
        const senhasDaCarga = senhas.filter(s => s.cargaId === carga.id && s.status !== 'recusado');
        const totalVolume = senhasDaCarga.reduce((sum, s) => {
          if (s.id === selectedDoca.senhaId) return sum + (data.volume || 0);
          return sum + (s.volumeConferido || 0);
        }, 0);
        
        try {
          await adicionarCross({
            cargaId: selectedDoca.cargaId!,
            fornecedorId: carga.fornecedorId,
            nfs: carga.nfs,
            data: carga.data,
            rua: ruaAtual || data.rua || '',
            volumeRecebido: totalVolume
          });
        } catch (err: any) {
          // Unique constraint violation — cross already registered by another operator
          console.warn('Cross Docking já registrado para esta carga:', err?.message);
        }
      }
      
      await refetchDocas();
      const localMsg = isPatioConferencia ? 'Pátio' : `Doca ${selectedDoca.numero}`;
      toast.success(`Conferência finalizada - ${localMsg}`);
    }
  };

  const handleCriarDoca = async () => {
    const novoNumero = docas.length > 0 ? Math.max(...docas.map(d => d.numero)) + 1 : 1;
    await criarDocaDB(novoNumero);
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
                <TableHead>Rua</TableHead>
                <TableHead className="w-36">Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {docas.map((doca) => {
                const carga = getCarga(doca.cargaId);
                const senha = doca.senhaId ? senhas.find(s => s.id === doca.senhaId) : undefined;
                const fornecedor = carga 
                  ? getFornecedor(carga.fornecedorId) 
                  : senha 
                    ? getFornecedor(senha.fornecedorId) 
                    : undefined;

                return (
                  <TableRow key={doca.id}>
                    <TableCell className="font-bold text-lg">#{doca.numero}</TableCell>
                    <TableCell>{fornecedor?.nome || '-'}</TableCell>
                    <TableCell>{carga?.nfs.join(', ') || '-'}</TableCell>
                    <TableCell className="text-right">{carga?.volumePrevisto || '-'}</TableCell>
                    <TableCell>{doca.rua || carga?.rua || senha?.rua || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusStyles[doca.status]}>
                        {statusDocaLabels[doca.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {doca.status === 'livre' && isAdmin && (
                          <>
                            <Button variant="outline" size="sm" onClick={() => handleVincularCarga(doca)}>
                              Vincular Carga
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleUsoConsumo(doca)} title="Uso e Consumo">
                              <Coffee className="h-4 w-4" />
                            </Button>
                          </>
                        )}

                        {doca.status === 'ocupada' && (
                          <>
                            {doca.senhaId && (
                              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold" onClick={() => handleComecarConferencia(doca)}>
                                COMEÇAR CONFERÊNCIA
                              </Button>
                            )}
                            {isAdmin && (
                              <>
                                <Button variant="outline" size="sm" onClick={() => handleOpenGerenciarLocal(doca)} title="Gerenciar Localização">
                                  <MapPin className="h-4 w-4" />
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => openRecusarConfirm(doca)} title="Recusar Carga">
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </>
                        )}

                        {doca.status === 'em_conferencia' && (
                          <>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white font-semibold" onClick={() => handleTerminarConferencia(doca)}>
                              TERMINAR CONFERÊNCIA
                            </Button>
                            {isAdmin && (
                              <>
                                <Button variant="outline" size="sm" onClick={() => handleOpenGerenciarLocal(doca)} title="Gerenciar Localização">
                                  <MapPin className="h-4 w-4" />
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => openRecusarConfirm(doca)} title="Recusar Carga">
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </>
                        )}

                        {doca.status === 'conferido' && isAdmin && (
                          <Button variant="outline" size="sm" onClick={() => handleLiberar(doca)} className="gap-1">
                            <Unlock className="h-4 w-4" />
                            Liberar Doca
                          </Button>
                        )}

                        {doca.status === 'uso_consumo' && isAdmin && (
                          <Button variant="outline" size="sm" onClick={() => handleLiberar(doca)} className="gap-1">
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

        {/* Cargas em Pátio */}
        {senhasEmPatio.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Cargas em Pátio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Senha</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>NF(s)</TableHead>
                    <TableHead className="text-right">Vol. Previsto</TableHead>
                    <TableHead>Motorista</TableHead>
                    <TableHead>Veículo</TableHead>
                    <TableHead>Rua</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {senhasEmPatio.map((senha) => {
                    const cargaDaSenha = senha.cargaId ? cargas.find(c => c.id === senha.cargaId) : undefined;
                    
                    return (
                      <TableRow key={senha.id}>
                        <TableCell className="font-mono font-semibold">
                          {String(senha.numero).padStart(4, '0')}
                        </TableCell>
                        <TableCell>{getFornecedor(senha.fornecedorId)?.nome || '-'}</TableCell>
                        <TableCell className="text-sm">{cargaDaSenha?.nfs?.join(', ') || '-'}</TableCell>
                        <TableCell className="text-right">{cargaDaSenha?.volumePrevisto || '-'}</TableCell>
                        <TableCell>{senha.nomeMotorista}</TableCell>
                        <TableCell>{tipoCaminhaoLabels[senha.tipoCaminhao]}</TableCell>
                        <TableCell>{cargaDaSenha?.rua || senha.rua || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            senha.status === 'em_conferencia' 
                              ? 'bg-blue-100 text-blue-800 border-blue-300'
                              : senha.status === 'conferido'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : 'bg-orange-50 text-orange-700 border-orange-200'
                          }>
                            {senha.status === 'em_conferencia' ? 'Em Conferência' 
                              : senha.status === 'conferido' ? 'Conferido' 
                              : 'Aguardando'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {senha.status !== 'em_conferencia' && senha.status !== 'conferido' && (
                              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={() => {
                                  const docaVirtual: Doca = {
                                    id: `patio_${senha.id}`,
                                    numero: 0,
                                    status: 'ocupada',
                                    cargaId: cargaDaSenha?.id,
                                    senhaId: senha.id
                                  };
                                  setSelectedDoca(docaVirtual);
                                  setModalMode('entrar');
                                  setModalOpen(true);
                                }}
                              >
                                Começar
                              </Button>
                            )}
                            
                            {senha.status === 'em_conferencia' && (
                              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => {
                                  const docaVirtual: Doca = {
                                    id: `patio_${senha.id}`,
                                    numero: 0,
                                    status: 'em_conferencia',
                                    cargaId: cargaDaSenha?.id,
                                    senhaId: senha.id,
                                    conferenteId: cargaDaSenha?.conferenteId,
                                    rua: cargaDaSenha?.rua
                                  };
                                  setSelectedDoca(docaVirtual);
                                  setModalMode('finalizar');
                                  setModalOpen(true);
                                }}
                              >
                                Terminar
                              </Button>
                            )}
                            
                            {isAdmin && senha.status !== 'conferido' && cargaDaSenha && (
                              <Button variant="destructive" size="sm"
                                onClick={() => {
                                  const docaVirtual: Doca = {
                                    id: `patio_${senha.id}`,
                                    numero: 0,
                                    status: 'ocupada',
                                    cargaId: cargaDaSenha?.id,
                                    senhaId: senha.id
                                  };
                                  setDocaToRecusar(docaVirtual);
                                  setConfirmRecusar(true);
                                }}
                                title="Recusar Carga"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            )}
                            
                            {isAdmin && (
                              <Button variant="outline" size="sm" onClick={() => handleOpenRetomar(senha.id)} className="gap-1">
                                <RotateCcw className="h-4 w-4" />
                                Retomar
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        <DocaModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          doca={selectedDoca}
          onConfirm={handleModalConfirm}
          mode={modalMode}
          volumePrevisto={(() => {
            if (modalMode !== 'finalizar' || !selectedDoca) return undefined;
            const carga = getCarga(selectedDoca.cargaId);
            return carga?.volumePrevisto;
          })()}
          volumeJaConferido={(() => {
            if (modalMode !== 'finalizar' || !selectedDoca) return undefined;
            const carga = getCarga(selectedDoca.cargaId);
            return carga?.volumeConferido || 0;
          })()}
        />

        <AssociarCargaModal
          open={associarModalOpen}
          onClose={() => setAssociarModalOpen(false)}
          doca={selectedDoca}
          cargas={cargasDisponiveis}
          fornecedores={fornecedores}
          onConfirm={handleAssociarCarga}
          senhasOrfas={senhasOrfas}
          onConfirmSenha={handleAssociarSenha}
        />

        {/* Confirmation Dialog - Recusar */}
        <AlertDialog open={confirmRecusar} onOpenChange={setConfirmRecusar}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Recusar Carga</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja <strong>recusar</strong> esta carga?
                {docaToRecusar && docaToRecusar.cargaId && (
                  <span className="block mt-2 text-foreground">
                    Doca: #{docaToRecusar.numero} - {getFornecedor(getCarga(docaToRecusar.cargaId)?.fornecedorId)?.nome}
                  </span>
                )}
                <span className="block mt-2 text-red-600">
                  O caminhoneiro será notificado que a carga foi recusada.
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleRecusarCarga} className="bg-red-600 hover:bg-red-700">
                Recusar Carga
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Modal: Gerenciar Localização */}
        <Dialog open={gerenciarModalOpen} onOpenChange={setGerenciarModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Gerenciar Localização</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">Escolha a ação para esta carga:</p>
              <div className="flex flex-col gap-2">
                <Button variant="outline" className="justify-start gap-2"
                  onClick={() => { setGerenciarModalOpen(false); setPatioConfirmOpen(true); }}>
                  <MapPin className="h-4 w-4" />
                  Mover para Pátio
                </Button>
                <Button variant="outline" className="justify-start gap-2"
                  onClick={() => { setGerenciarModalOpen(false); setSelectedDocaNumero(''); setTrocarDocaModalOpen(true); }}>
                  <RotateCcw className="h-4 w-4" />
                  Trocar de Doca
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setGerenciarModalOpen(false)}>Cancelar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal: Confirmação Pátio */}
        <AlertDialog open={patioConfirmOpen} onOpenChange={setPatioConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Mover para Pátio</AlertDialogTitle>
              <AlertDialogDescription>
                Confirma mover esta carga para o pátio?
                <span className="block mt-2 text-muted-foreground">A carga será removida da doca e ficará aguardando no pátio.</span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmPatio}>Confirmar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Modal: Trocar de Doca */}
        <Dialog open={trocarDocaModalOpen} onOpenChange={setTrocarDocaModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Trocar de Doca</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">Selecione a nova doca para esta carga:</p>
              <div className="space-y-2">
                <Label>Selecione a Doca</Label>
                <Select value={selectedDocaNumero} onValueChange={setSelectedDocaNumero}>
                  <SelectTrigger><SelectValue placeholder="Selecione uma doca livre..." /></SelectTrigger>
                  <SelectContent>
                    {docasLivres.length === 0 ? (
                      <SelectItem value="-" disabled>Nenhuma doca livre</SelectItem>
                    ) : (
                      docasLivres.map((doca) => (
                        <SelectItem key={doca.id} value={String(doca.numero)}>Doca {doca.numero}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setTrocarDocaModalOpen(false)}>Cancelar</Button>
              <Button onClick={handleConfirmTrocarDoca} disabled={!selectedDocaNumero}>Confirmar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal: Retomar do Pátio */}
        <Dialog open={retomarModalOpen} onOpenChange={setRetomarModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Retomar para Doca</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Selecione a Doca</Label>
                <Select value={selectedDocaNumero} onValueChange={setSelectedDocaNumero}>
                  <SelectTrigger><SelectValue placeholder="Selecione uma doca livre..." /></SelectTrigger>
                  <SelectContent>
                    {docasLivres.length === 0 ? (
                      <SelectItem value="-" disabled>Nenhuma doca livre</SelectItem>
                    ) : (
                      docasLivres.map((doca) => (
                        <SelectItem key={doca.id} value={String(doca.numero)}>Doca {doca.numero}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRetomarModalOpen(false)}>Cancelar</Button>
              <Button onClick={handleConfirmRetomar} disabled={!selectedDocaNumero}>Retomar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
