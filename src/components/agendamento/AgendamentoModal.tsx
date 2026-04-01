import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Carga, Fornecedor } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AgendamentoModalProps {
  open: boolean;
  onClose: () => void;
  carga?: Carga | null;
  onSave: (data: Partial<Carga>) => void;
  selectedDate?: Date;
  fornecedores: Fornecedor[];
}

export function AgendamentoModal({ open, onClose, carga, onSave, selectedDate, fornecedores }: AgendamentoModalProps) {
  const [data, setData] = useState<Date | undefined>(selectedDate || new Date());
  const [fornecedorId, setFornecedorId] = useState(carga?.fornecedorId || '');
  const [nfs, setNfs] = useState((carga?.nfs ?? []).join(', ') || '');
  const [volumePrevisto, setVolumePrevisto] = useState(carga?.volumePrevisto?.toString() || '');
  const [openFornecedor, setOpenFornecedor] = useState(false);
  const [openCalendar, setOpenCalendar] = useState(false);

  const fornecedoresAtivos = useMemo(() => 
    fornecedores.filter(f => f.ativo), 
  []);

  const selectedFornecedor = useMemo(() => 
    fornecedores.find(f => f.id === fornecedorId),
  [fornecedorId]);

  const handleSave = () => {
    onSave({
      data: data ? format(data, 'yyyy-MM-dd') : undefined,
      fornecedorId,
      nfs: nfs.split(',').map(nf => nf.trim()).filter(Boolean),
      volumePrevisto: parseInt(volumePrevisto) || 0,
    });
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setData(selectedDate || new Date());
    setFornecedorId('');
    setNfs('');
    setVolumePrevisto('');
  };

  const isEdit = !!carga;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) { resetForm(); onClose(); } }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Editar Agendamento' : 'Novo Agendamento'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Data</Label>
            <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  disabled={isEdit}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !data && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {data ? format(data, "PPP", { locale: ptBR }) : <span>Selecione a data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={data}
                  onSelect={(date) => { setData(date); setOpenCalendar(false); }}
                  locale={ptBR}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Fornecedor</Label>
            <Popover open={openFornecedor} onOpenChange={setOpenFornecedor}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  disabled={isEdit}
                  aria-expanded={openFornecedor}
                  className="w-full justify-between"
                >
                  {selectedFornecedor?.nome || "Buscar fornecedor..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput placeholder="Digite para buscar..." />
                  <CommandList>
                    <CommandEmpty>Nenhum fornecedor encontrado.</CommandEmpty>
                    <CommandGroup>
                      {fornecedoresAtivos.map((f) => (
                        <CommandItem
                          key={f.id}
                          value={f.nome}
                          onSelect={() => {
                            setFornecedorId(f.id);
                            setOpenFornecedor(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              fornecedorId === f.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {f.nome}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nfs">Notas Fiscais</Label>
            <Input
              id="nfs"
              value={nfs}
              onChange={(e) => setNfs(e.target.value)}
              placeholder="NF-001, NF-002, NF-003"
              disabled={isEdit}
            />
            <p className="text-xs text-muted-foreground">Separe múltiplas NFs por vírgula</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="volume">Volume Previsto</Label>
            <Input
              id="volume"
              type="number"
              value={volumePrevisto}
              onChange={(e) => setVolumePrevisto(e.target.value)}
              placeholder="Quantidade de volumes"
              disabled={isEdit}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => { resetForm(); onClose(); }}>Cancelar</Button>
          <Button onClick={handleSave} disabled={!fornecedorId || !nfs}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
