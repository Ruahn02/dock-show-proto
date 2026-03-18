import { useState } from 'react';
import { MultiSelectStatus, StatusOption } from '@/components/ui/multi-select-status';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QRCodeSVG } from 'qrcode.react';
import { useSenha } from '@/contexts/SenhaContext';
import { useFluxoOperacional } from '@/hooks/useFluxoOperacional';
import { statusSenhaLabels, localSenhaLabels } from '@/data/mockData';
import { useTiposVeiculoDB } from '@/hooks/useTiposVeiculoDB';
import { useDocasDB } from '@/hooks/useDocasDB';
import { useFornecedoresDB } from '@/hooks/useFornecedoresDB';
import { Ticket, Link, MapPin, Unlock, RotateCcw, Monitor, Copy, XCircle } from 'lucide-react';
import { LocalSenha } from '@/types';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function ControleSenhas() {
  const { senhas, cargas, getSenhasAtivas, vincularSenhaADoca, liberarSenha, moverParaPatio, retomarDoPatio, atualizarCarga, recusarCarga } = useSenha();
  const { atualizarFluxo } = useFluxoOperacional();
  const { docas, atualizarDoca } = useDocasDB();
  const { fornecedores } = useFornecedoresDB();
  const { getLabelByNome } = useTiposVeiculoDB();
  
  const [vincularModalOpen, setVincularModalOpen] = useState(false);
  const [patioConfirmOpen, setPatioConfirmOpen] = useState(false);
  const [retomarModalOpen, setRetomarModalOpen] = useState(false);
  const [liberarConfirmOpen, setLiberarConfirmOpen] = useState(false);
  const [recusarConfirmOpen, setRecusarConfirmOpen] = useState(false);
  
  const [selectedSenhaId, setSelectedSenhaId] = useState<string | null>(null);
  const [selectedDoca, setSelectedDoca] = useState<string>('');

  const [filtroStatus, setFiltroStatus] = useState<string[]>([]);
  const statusOptionsSenha: StatusOption[] = [
    { value: 'aguardando_doca', label: 'Aguardando Doca' },
    { value: 'em_doca', label: 'Em Doca' },
    { value: 'em_conferencia', label: 'Em Conferência' },
    { value: 'conferido', label: 'Conferido' },
    { value: 'recusado', label: 'Recusado' },
  ];
  const [filtroFornecedor, setFiltroFornecedor] = useState<string>('todos');
  const [filtroLocal, setFiltroLocal] = useState<string>('todos');
  
  const senhaUrl = `${window.location.origin}/senha`;
  const painelUrl = `${window.location.origin}/painel`;
  const senhasAtivas = getSenhasAtivas();

  const senhasFiltradas = senhasAtivas
    .filter(s => s.status !== 'recusado')
    .filter(s => filtroStatus.length === 0 || filtroStatus.includes(s.status))
    .filter(s => filtroFornecedor === 'todos' || s.fornecedorId === filtroFornecedor)
    .filter(s => filtroLocal === 'todos' || s.localAtual === filtroLocal);
  
  const docasLivres = docas.filter(d => d.status === 'livre');

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'aguardando_doca': return 'bg-blue-100 text-blue-800';
      case 'em_doca':
      case 'aguardando_conferencia': return 'bg-yellow-100 text-yellow-800';
      case 'em_conferencia': return 'bg-green-100 text-green-800';
      case 'conferido': return 'bg-emerald-100 text-emerald-800';
      case 'recusado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLocalBadgeClass = (local: LocalSenha) => {
    switch (local) {
      case 'aguardando_doca': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'em_doca': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'em_patio': return 'bg-orange-50 text-orange-700 border-orange-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getFornecedorNome = (fornecedorId: string) => {
    return fornecedores.find(f => f.id === fornecedorId)?.nome || 'Desconhecido';
  };

  const handleOpenVincular = (senhaId: string) => {
    setSelectedSenhaId(senhaId);
    setSelectedDoca('');
    setVincularModalOpen(true);
  };

  const handleConfirmVincular = async () => {
    if (!selectedSenhaId || !selectedDoca) return;
    
    const docaNumero = parseInt(selectedDoca);
    await vincularSenhaADoca(selectedSenhaId, docaNumero);
    
    // Find carga linked to this senha via cargaId
    const senha = senhas.find(s => s.id === selectedSenhaId);
    const cargaVinculada = senha?.cargaId ? cargas.find(c => c.id === senha.cargaId) : undefined;
    
    const doca = docas.find(d => d.numero === docaNumero);
    if (doca) {
      await atualizarDoca(doca.id, { 
        status: 'ocupada', 
        senhaId: selectedSenhaId,
        cargaId: cargaVinculada?.id,
      });
    }
    
    if (cargaVinculada) {
      await atualizarCarga(cargaVinculada.id, { status: 'aguardando_conferencia' as any });
    }
    
    toast.success(`Senha vinculada à Doca ${docaNumero}`);
    setVincularModalOpen(false);
  };

  const handleOpenPatio = (senhaId: string) => {
    setSelectedSenhaId(senhaId);
    setPatioConfirmOpen(true);
  };

  const handleConfirmPatio = async () => {
    if (!selectedSenhaId) return;
    const doca = docas.find(d => d.senhaId === selectedSenhaId);
    if (doca) {
      await atualizarDoca(doca.id, { status: 'livre', cargaId: undefined, conferenteId: undefined, volumeConferido: undefined, rua: undefined, senhaId: undefined });
    }
    moverParaPatio(selectedSenhaId);
    toast.success(`Caminhão movido para o pátio`);
    setPatioConfirmOpen(false);
  };

  const handleOpenRetomar = (senhaId: string) => {
    setSelectedSenhaId(senhaId);
    setSelectedDoca('');
    setRetomarModalOpen(true);
  };

  const handleConfirmRetomar = async () => {
    if (!selectedSenhaId || !selectedDoca) return;
    const docaNumero = parseInt(selectedDoca);
    
    const senha = senhas.find(s => s.id === selectedSenhaId);
    const cargaVinculada = senha?.cargaId ? cargas.find(c => c.id === senha.cargaId) : undefined;
    
    const doca = docas.find(d => d.numero === docaNumero);
    if (doca) {
      await atualizarDoca(doca.id, { 
        status: 'ocupada', 
        senhaId: selectedSenhaId,
        cargaId: cargaVinculada?.id,
      });
    }
    
    if (cargaVinculada) {
      await atualizarCarga(cargaVinculada.id, { status: 'aguardando_conferencia' as any });
    }
    
    await retomarDoPatio(selectedSenhaId, docaNumero);
    toast.success(`Caminhão retomado para Doca ${docaNumero}`);
    setRetomarModalOpen(false);
  };

  const handleOpenLiberar = (senhaId: string) => {
    setSelectedSenhaId(senhaId);
    setLiberarConfirmOpen(true);
  };

  const handleOpenRecusar = (senhaId: string) => {
    setSelectedSenhaId(senhaId);
    setRecusarConfirmOpen(true);
  };

  const handleConfirmRecusar = async () => {
    if (!selectedSenhaId) return;
    const senha = senhas.find(s => s.id === selectedSenhaId);
    const cargaVinculada = senha?.cargaId ? cargas.find(c => c.id === senha.cargaId) : undefined;
    
    await atualizarFluxo({
      p_carga_id: cargaVinculada?.id || null,
      p_senha_id: selectedSenhaId,
      p_novo_status: 'recusado',
    });
    
    toast.success('Carga recusada');
    setRecusarConfirmOpen(false);
  };

  const handleConfirmLiberar = async () => {
    if (!selectedSenhaId) return;
    const senha = senhas.find(s => s.id === selectedSenhaId);
    
    if (senha?.status !== 'conferido') {
      const cargaVinculada = senha?.cargaId ? cargas.find(c => c.id === senha.cargaId) : undefined;
      await atualizarFluxo({
        p_carga_id: cargaVinculada?.id || null,
        p_senha_id: selectedSenhaId,
        p_novo_status: 'recusado',
      });
    } else {
      if (senha?.docaNumero) {
        const doca = docas.find(d => d.numero === senha.docaNumero);
        if (doca) {
          await atualizarDoca(doca.id, { status: 'livre', cargaId: undefined, conferenteId: undefined, volumeConferido: undefined, rua: undefined, senhaId: undefined });
        }
      }
    }
    
    await liberarSenha(selectedSenhaId);
    toast.success('Senha liberada - Caminhão pode sair');
    setLiberarConfirmOpen(false);
  };

  const selectedSenha = selectedSenhaId ? senhas.find(s => s.id === selectedSenhaId) : null;
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Ticket className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Controle de Senhas</h1>
              <p className="text-muted-foreground">Acompanhamento de chegadas</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.open('/senha', '_blank')}>
              <Ticket className="h-4 w-4 mr-2" />
              Gerar Senha
            </Button>
            <Button variant="outline" onClick={() => window.open('/painel', '_blank')}>
              <Monitor className="h-4 w-4 mr-2" />
              Painel de Senhas (TV)
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Lista de Senhas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3 mb-4">
                <div className="w-48">
                  <MultiSelectStatus options={statusOptionsSenha} selected={filtroStatus} onChange={setFiltroStatus} placeholder="Status" />
                </div>
                <div className="w-56">
                  <Select value={filtroFornecedor} onValueChange={setFiltroFornecedor}>
                    <SelectTrigger><SelectValue placeholder="Fornecedor" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os Fornecedores</SelectItem>
                      {fornecedores.filter(f => f.ativo).map(f => (
                        <SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-48">
                  <Select value={filtroLocal} onValueChange={setFiltroLocal}>
                    <SelectTrigger><SelectValue placeholder="Local" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os Locais</SelectItem>
                      <SelectItem value="aguardando_doca">Aguardando Doca</SelectItem>
                      <SelectItem value="em_doca">Em Doca</SelectItem>
                      <SelectItem value="em_patio">Pátio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {senhasFiltradas.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">Nenhuma senha ativa no momento</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Senha</TableHead>
                      <TableHead>Fornecedor</TableHead>
                      <TableHead>Motorista</TableHead>
                      <TableHead className="w-24">Chegada</TableHead>
                      <TableHead className="w-24">Veículo</TableHead>
                      <TableHead className="w-32">Status</TableHead>
                      <TableHead className="w-32">Local</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {senhasFiltradas.map((senha) => (
                      <TableRow key={senha.id}>
                        <TableCell className="font-mono font-semibold text-lg">
                          {String(senha.numero).padStart(4, '0')}
                        </TableCell>
                        <TableCell className="font-medium">{getFornecedorNome(senha.fornecedorId)}</TableCell>
                        <TableCell>{senha.nomeMotorista}</TableCell>
                        <TableCell>{senha.horaChegada}</TableCell>
                        <TableCell>{getLabelByNome(senha.tipoCaminhao)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={getStatusBadgeClass(senha.status)}>
                            {statusSenhaLabels[senha.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getLocalBadgeClass(senha.localAtual)}>
                            {senha.localAtual === 'em_patio' ? 'Pátio' : localSenhaLabels[senha.localAtual]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {senha.localAtual === 'aguardando_doca' && (
                              <Button variant="outline" size="sm" onClick={() => handleOpenVincular(senha.id)} title="Vincular à Doca">
                                <Link className="h-4 w-4" />
                              </Button>
                            )}
                            
                            {senha.localAtual === 'em_doca' && (
                              <Button variant="outline" size="sm" onClick={() => handleOpenPatio(senha.id)} title="Mover para Pátio">
                                <MapPin className="h-4 w-4" />
                              </Button>
                            )}

                            {senha.localAtual === 'em_doca' && (
                              <Button variant="destructive" size="sm" onClick={() => handleOpenRecusar(senha.id)} title="Recusar Carga">
                                <XCircle className="h-4 w-4" />
                              </Button>
                            )}
                            
                            {senha.localAtual === 'em_patio' && (
                              <Button variant="outline" size="sm" onClick={() => handleOpenRetomar(senha.id)} title="Retomar para Doca" className="gap-1">
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            )}
                            
                            <Button variant="ghost" size="sm" onClick={() => handleOpenLiberar(senha.id)} title="Liberar Senha">
                              <Unlock className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Modal: Vincular à Doca */}
        <Dialog open={vincularModalOpen} onOpenChange={setVincularModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Vincular à Doca</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {selectedSenha && (
                <p className="text-sm text-muted-foreground">
                  Senha: <strong>{String(selectedSenha.numero).padStart(4, '0')}</strong> - {getFornecedorNome(selectedSenha.fornecedorId)}
                </p>
              )}
              <div className="space-y-2">
                <Label>Selecione a Doca</Label>
                <Select value={selectedDoca} onValueChange={setSelectedDoca}>
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
              <Button variant="outline" onClick={() => setVincularModalOpen(false)}>Cancelar</Button>
              <Button onClick={handleConfirmVincular} disabled={!selectedDoca}>Vincular</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Pátio confirm */}
        <AlertDialog open={patioConfirmOpen} onOpenChange={setPatioConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Mover para Pátio</AlertDialogTitle>
              <AlertDialogDescription>
                Confirma mover este caminhão para o pátio?
                {selectedSenha && (
                  <span className="block mt-2 text-foreground">
                    Senha: {String(selectedSenha.numero).padStart(4, '0')} - {getFornecedorNome(selectedSenha.fornecedorId)}
                  </span>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmPatio}>Confirmar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Retomar modal */}
        <Dialog open={retomarModalOpen} onOpenChange={setRetomarModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Retomar para Doca</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {selectedSenha && (
                <p className="text-sm text-muted-foreground">
                  Senha: <strong>{String(selectedSenha.numero).padStart(4, '0')}</strong> - {getFornecedorNome(selectedSenha.fornecedorId)}
                </p>
              )}
              <div className="space-y-2">
                <Label>Selecione a Doca</Label>
                <Select value={selectedDoca} onValueChange={setSelectedDoca}>
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
              <Button onClick={handleConfirmRetomar} disabled={!selectedDoca}>Retomar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Liberar confirm */}
        <AlertDialog open={liberarConfirmOpen} onOpenChange={setLiberarConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Liberar Senha</AlertDialogTitle>
              <AlertDialogDescription>
                Confirma liberar esta senha?
                {selectedSenha && selectedSenha.status !== 'conferido' && (
                  <span className="block mt-2 text-red-600">
                    A conferência não foi finalizada. A carga será marcada como Recusada.
                  </span>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmLiberar}>Liberar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Recusar confirm */}
        <AlertDialog open={recusarConfirmOpen} onOpenChange={setRecusarConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Recusar Carga</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja recusar esta carga?
                {selectedSenha && (
                  <span className="block mt-2 text-foreground">
                    Senha: {String(selectedSenha.numero).padStart(4, '0')} - {getFornecedorNome(selectedSenha.fornecedorId)}
                  </span>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmRecusar} className="bg-red-600 hover:bg-red-700">Recusar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}
