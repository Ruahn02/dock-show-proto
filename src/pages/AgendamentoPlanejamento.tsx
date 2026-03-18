import { useState, useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFluxoOperacional, FluxoOperacional } from '@/hooks/useFluxoOperacional';
import { useCargasDB } from '@/hooks/useCargasDB';
import { useFornecedoresDB } from '@/hooks/useFornecedoresDB';
import { statusCargaLabels } from '@/data/mockData';
import { useTiposVeiculoDB } from '@/hooks/useTiposVeiculoDB';
import { StatusCarga } from '@/types';
import { toast } from 'sonner';
import { Plus, CalendarPlus, CalendarIcon, Check, ChevronsUpDown, X, Edit, Package, Truck, BarChart3, ClipboardCheck } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

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

export default function AgendamentoPlanejamento() {
  const { dados, atualizarFluxo } = useFluxoOperacional();
  const { criarCarga, atualizarCarga } = useCargasDB();
  const { fornecedores } = useFornecedoresDB();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const [formData, setFormData] = useState<Date | undefined>(undefined);
  const [formFornecedorId, setFormFornecedorId] = useState('');
  const [formNfs, setFormNfs] = useState('');
  const [formVolume, setFormVolume] = useState('');
  const [formQuantidadeVeiculos, setFormQuantidadeVeiculos] = useState('');
  const [formHorario, setFormHorario] = useState('08:00');
  const [openFornecedor, setOpenFornecedor] = useState(false);
  const [openCalendar, setOpenCalendar] = useState(false);
  const [editingCargaId, setEditingCargaId] = useState<string | null>(null);

  const fornecedoresAtivos = useMemo(() => fornecedores.filter(f => f.ativo), [fornecedores]);
  const selectedFornecedor = useMemo(() => fornecedores.find(f => f.id === formFornecedorId), [formFornecedorId, fornecedores]);

  const cargasFiltradas = useMemo(() => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const filtered = dados.filter(d => d.data_agendada === dateStr);
    // Deduplicate by carga_id — the view returns one row per senha (truck)
    const seen = new Set<string>();
    const deduped = filtered.filter(d => {
      if (!d.carga_id) return true;
      if (seen.has(d.carga_id)) return false;
      seen.add(d.carga_id);
      return true;
    });
    // Sort by horario_previsto (earliest first, nulls last), then by fornecedor_nome alphabetically
    return deduped.sort((a, b) => {
      const ha = a.horario_previsto || '';
      const hb = b.horario_previsto || '';
      if (!ha && hb) return 1;
      if (ha && !hb) return -1;
      if (ha !== hb) return ha.localeCompare(hb);
      return (a.fornecedor_nome || '').localeCompare(b.fornecedor_nome || '');
    });
  }, [dados, selectedDate]);

  const datasComCargas = useMemo(() => {
    const seenCargas = new Set<string>();
    const uniqueDates = new Set<string>();
    dados.forEach(d => {
      if (d.carga_id && seenCargas.has(d.carga_id)) return;
      if (d.carga_id) seenCargas.add(d.carga_id);
      if (d.data_agendada) uniqueDates.add(d.data_agendada);
    });
    return Array.from(uniqueDates).map(d => parseISO(d));
  }, [dados]);

  // Resumo do dia
  const resumo = useMemo(() => {
    const totalCargas = cargasFiltradas.length;
    const totalCaminhoes = cargasFiltradas.reduce((s, d) => s + (d.quantidade_veiculos || 1), 0);
    const volumePrevisto = cargasFiltradas.reduce((s, d) => s + (d.volume_previsto || 0), 0);
    const volumeConferido = cargasFiltradas.reduce((s, d) => s + (d.volume_conferido || 0), 0);
    return { totalCargas, totalCaminhoes, volumePrevisto, volumeConferido };
  }, [cargasFiltradas]);

  

  const handleNovo = () => {
    setEditingCargaId(null); setFormData(selectedDate); setFormFornecedorId('');
    setFormNfs(''); setFormVolume(''); setFormQuantidadeVeiculos(''); setFormHorario('08:00'); setModalOpen(true);
  };

  const handleEdit = (d: FluxoOperacional) => {
    setEditingCargaId(d.carga_id); setFormData(d.data_agendada ? parseISO(d.data_agendada) : new Date());
    setFormFornecedorId(d.fornecedor_id); setFormNfs(d.nota_fiscal?.join(', ') || '');
    setFormVolume(String(d.volume_previsto || '')); setFormQuantidadeVeiculos(String(d.quantidade_veiculos || ''));
    setFormHorario(d.horario_previsto || '08:00'); setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData || !formFornecedorId || !formVolume) { toast.error('Preencha todos os campos obrigatórios'); return; }
    try {
      if (editingCargaId) {
        await atualizarCarga(editingCargaId, {
          data: format(formData, 'yyyy-MM-dd'),
          nfs: formNfs.split(',').map(nf => nf.trim()).filter(Boolean),
          volumePrevisto: parseInt(formVolume) || 0,
          quantidadeVeiculos: formQuantidadeVeiculos ? parseInt(formQuantidadeVeiculos) : undefined,
          horarioPrevisto: formHorario,
        });
        toast.success('Agendamento atualizado!');
      } else {
        await criarCarga({
          data: format(formData, 'yyyy-MM-dd'),
          fornecedorId: formFornecedorId,
          nfs: formNfs.split(',').map(nf => nf.trim()).filter(Boolean),
          volumePrevisto: parseInt(formVolume) || 0,
          quantidadeVeiculos: formQuantidadeVeiculos ? parseInt(formQuantidadeVeiculos) : undefined,
          horarioPrevisto: formHorario,
        });
        toast.success('Agendamento criado!');
      }
      setModalOpen(false);
    } catch { toast.error('Erro ao salvar'); }
  };

  const handleCancelar = async (d: FluxoOperacional) => {
    try {
      await atualizarFluxo({ p_carga_id: d.carga_id, p_novo_status: 'recusado' });
      toast.success('Agendamento cancelado');
    } catch { toast.error('Erro ao cancelar'); }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CalendarPlus className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Agendamento</h1>
              <p className="text-muted-foreground">Planejamento de entregas futuras</p>
            </div>
          </div>
          <Button onClick={handleNovo} className="gap-2"><Plus className="h-4 w-4" />Novo Agendamento</Button>
        </div>

        {/* Resumo do dia */}
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
              <Calendar mode="single" selected={selectedDate} onSelect={(date) => date && setSelectedDate(date)} locale={ptBR}
                modifiers={{ hasCargas: datasComCargas }} modifiersStyles={{ hasCargas: { fontWeight: 'bold', textDecoration: 'underline' } }} className="pointer-events-auto" />
            </CardContent>
          </Card>

          <div className="lg:col-span-3 border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead><TableHead>Horário</TableHead><TableHead>Fornecedor</TableHead>
                  <TableHead>NF(s)</TableHead><TableHead className="text-right">Vol. Previsto</TableHead>
                  <TableHead className="text-right">Vol. Conferido</TableHead>
                  <TableHead>Tipo</TableHead><TableHead>Divergência</TableHead>
                  <TableHead>Status</TableHead><TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cargasFiltradas.length === 0 ? (
                  <TableRow><TableCell colSpan={10} className="text-center py-8 text-muted-foreground">Nenhum agendamento para esta data</TableCell></TableRow>
                ) : (
                  cargasFiltradas.map((d) => (
                    <TableRow key={d.carga_id || d.senha_id}>
                      <TableCell className="whitespace-nowrap">{d.data_agendada ? format(parseISO(d.data_agendada), 'dd/MM/yyyy') : '-'}</TableCell>
                      <TableCell>{d.horario_previsto || '-'}</TableCell>
                      <TableCell className="font-medium">{d.fornecedor_nome || '-'}</TableCell>
                      <TableCell>{d.nota_fiscal && d.nota_fiscal.length > 0 ? d.nota_fiscal.join(', ') : '-'}</TableCell>
                      <TableCell className="text-right">{d.volume_previsto ?? '-'}</TableCell>
                      <TableCell className="text-right">{d.volume_conferido ?? '-'}</TableCell>
                      <TableCell>
                        {d.tipo_veiculo ? (tipoCaminhaoLabels[d.tipo_veiculo] || d.tipo_veiculo) : '-'}
                        {d.quantidade_veiculos && d.quantidade_veiculos > 1 ? ` (${d.quantidade_veiculos})` : ''}
                      </TableCell>
                      <TableCell>{d.divergencia || '-'}</TableCell>
                      <TableCell>
                        {(() => { const s = getDisplayStatus(d); return (
                          <Badge variant="outline" className={statusStyles[s.key] || ''}>{s.label}</Badge>
                        ); })()}
                      </TableCell>
                      <TableCell className="text-right">
                        {d.status_carga === 'aguardando_chegada' && (
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(d)}><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleCancelar(d)}><X className="h-4 w-4" /></Button>
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

        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>{editingCargaId ? 'Editar Agendamento' : 'Novo Agendamento'}</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Data *</Label>
                <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !formData && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData ? format(formData, "PPP", { locale: ptBR }) : <span>Selecione a data</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={formData} onSelect={(date) => { setFormData(date); setOpenCalendar(false); }} locale={ptBR} className="pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="horario">Horário Previsto *</Label>
                <Input id="horario" type="time" value={formHorario} onChange={(e) => setFormHorario(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Fornecedor *</Label>
                <Popover open={openFornecedor} onOpenChange={setOpenFornecedor}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" disabled={!!editingCargaId} aria-expanded={openFornecedor} className="w-full justify-between">
                      {selectedFornecedor?.nome || "Buscar fornecedor..."}<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Digite para buscar..." />
                      <CommandList>
                        <CommandEmpty>Nenhum fornecedor encontrado.</CommandEmpty>
                        <CommandGroup>
                          {fornecedoresAtivos.map((f) => (
                            <CommandItem key={f.id} value={f.nome} onSelect={() => { setFormFornecedorId(f.id); setOpenFornecedor(false); }}>
                              <Check className={cn("mr-2 h-4 w-4", formFornecedorId === f.id ? "opacity-100" : "opacity-0")} />{f.nome}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nfs">Notas Fiscais (opcional)</Label>
                <Input id="nfs" value={formNfs} onChange={(e) => setFormNfs(e.target.value)} placeholder="NF-001, NF-002, NF-003" />
                <p className="text-xs text-muted-foreground">Separe múltiplas NFs por vírgula</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="volume">Volume Previsto *</Label>
                <Input id="volume" type="number" value={formVolume} onChange={(e) => setFormVolume(e.target.value)} placeholder="Quantidade de volumes" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantidadeVeiculos">Quantidade de Veículos (Opcional)</Label>
                <Input id="quantidadeVeiculos" type="number" min="1" value={formQuantidadeVeiculos} onChange={(e) => setFormQuantidadeVeiculos(e.target.value)} placeholder="Ex: 1" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={!formFornecedorId || !formVolume || !formData}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
