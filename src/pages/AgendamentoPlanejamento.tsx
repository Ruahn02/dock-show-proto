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
import { useSenha } from '@/contexts/SenhaContext';
import { useFornecedoresDB } from '@/hooks/useFornecedoresDB';
import { statusCargaLabels, tipoCaminhaoLabels } from '@/data/mockData';
import { Carga, StatusCarga } from '@/types';
import { toast } from 'sonner';
import { Plus, CalendarPlus, CalendarIcon, Check, ChevronsUpDown, X, Edit } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const statusStyles: Record<StatusCarga, string> = {
  aguardando_chegada: 'bg-blue-100 text-blue-800 border-blue-300',
  em_conferencia: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  conferido: 'bg-green-100 text-green-800 border-green-300',
  no_show: 'bg-gray-100 text-gray-800 border-gray-300',
  recusado: 'bg-red-100 text-red-800 border-red-300',
};

export default function AgendamentoPlanejamento() {
  const { cargas, adicionarCarga, atualizarCarga } = useSenha();
  const { fornecedores } = useFornecedoresDB();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  const [formData, setFormData] = useState<Date | undefined>(undefined);
  const [formFornecedorId, setFormFornecedorId] = useState('');
  const [formNfs, setFormNfs] = useState('');
  const [formVolume, setFormVolume] = useState('');
  const [formHorario, setFormHorario] = useState('08:00');
  const [openFornecedor, setOpenFornecedor] = useState(false);
  const [openCalendar, setOpenCalendar] = useState(false);
  const [editingCarga, setEditingCarga] = useState<Carga | null>(null);

  const getFornecedorNome = (id: string) => fornecedores.find(f => f.id === id)?.nome || 'N/A';
  const fornecedoresAtivos = useMemo(() => fornecedores.filter(f => f.ativo), [fornecedores]);
  const selectedFornecedor = useMemo(() => fornecedores.find(f => f.id === formFornecedorId), [formFornecedorId, fornecedores]);

  const cargasFiltradas = useMemo(() => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return cargas.filter(c => c.data === dateStr && c.status === 'aguardando_chegada');
  }, [cargas, selectedDate]);

  const datasComCargas = useMemo(() => {
    return cargas.filter(c => c.status === 'aguardando_chegada').map(c => parseISO(c.data));
  }, [cargas]);

  const handleNovo = () => {
    setEditingCarga(null); setFormData(selectedDate); setFormFornecedorId('');
    setFormNfs(''); setFormVolume(''); setFormHorario('08:00'); setModalOpen(true);
  };

  const handleEdit = (carga: Carga) => {
    setEditingCarga(carga); setFormData(parseISO(carga.data));
    setFormFornecedorId(carga.fornecedorId); setFormNfs(carga.nfs.join(', '));
    setFormVolume(carga.volumePrevisto.toString()); setFormHorario(carga.horarioPrevisto || '08:00');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData || !formFornecedorId || !formVolume) { toast.error('Preencha todos os campos obrigatórios'); return; }
    try {
      if (editingCarga) {
        await atualizarCarga(editingCarga.id, {
          data: format(formData, 'yyyy-MM-dd'),
          nfs: formNfs.split(',').map(nf => nf.trim()).filter(Boolean),
          volumePrevisto: parseInt(formVolume) || 0,
          horarioPrevisto: formHorario,
        });
        toast.success('Agendamento atualizado!');
      } else {
        await adicionarCarga({
          data: format(formData, 'yyyy-MM-dd'),
          fornecedorId: formFornecedorId,
          nfs: formNfs.split(',').map(nf => nf.trim()).filter(Boolean),
          volumePrevisto: parseInt(formVolume) || 0,
          horarioPrevisto: formHorario,
        });
        toast.success('Agendamento criado!');
      }
      setModalOpen(false);
    } catch { toast.error('Erro ao salvar'); }
  };

  const handleCancelar = async (carga: Carga) => {
    await atualizarCarga(carga.id, { status: 'recusado' });
    toast.success('Agendamento cancelado');
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
                  <TableHead>NF(s)</TableHead><TableHead className="text-right">Volume</TableHead>
                  <TableHead>Tipo</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cargasFiltradas.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Nenhum agendamento para esta data</TableCell></TableRow>
                ) : (
                  cargasFiltradas.map((carga) => (
                    <TableRow key={carga.id}>
                      <TableCell className="whitespace-nowrap">{format(parseISO(carga.data), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>{carga.horarioPrevisto || '-'}</TableCell>
                      <TableCell className="font-medium">{getFornecedorNome(carga.fornecedorId)}</TableCell>
                      <TableCell>{carga.nfs.length > 0 ? carga.nfs.join(', ') : '-'}</TableCell>
                      <TableCell className="text-right">{carga.volumePrevisto}</TableCell>
                      <TableCell>{carga.tipoCaminhao ? tipoCaminhaoLabels[carga.tipoCaminhao] : '-'}</TableCell>
                      <TableCell><Badge variant="outline" className={statusStyles[carga.status]}>Ativo</Badge></TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(carga)}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleCancelar(carga)}><X className="h-4 w-4" /></Button>
                        </div>
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
            <DialogHeader><DialogTitle>{editingCarga ? 'Editar Agendamento' : 'Novo Agendamento'}</DialogTitle></DialogHeader>
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
                    <Button variant="outline" role="combobox" disabled={!!editingCarga} aria-expanded={openFornecedor} className="w-full justify-between">
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
