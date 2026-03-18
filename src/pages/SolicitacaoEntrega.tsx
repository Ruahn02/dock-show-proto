import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { useFornecedoresDB } from '@/hooks/useFornecedoresDB';
import { useSolicitacao } from '@/contexts/SolicitacaoContext';
import { useTiposVeiculoDB } from '@/hooks/useTiposVeiculoDB';
import { TipoCaminhao } from '@/types';
import { toast } from 'sonner';
import { PackageCheck, CheckCircle2, Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SolicitacaoEntrega() {
  const [fornecedorId, setFornecedorId] = useState('');
  const [tipoCaminhao, setTipoCaminhao] = useState<TipoCaminhao | ''>('');
  const [quantidadeVeiculos, setQuantidadeVeiculos] = useState('1');
  const [volumePrevisto, setVolumePrevisto] = useState('');
  const [emailContato, setEmailContato] = useState('');
  const [notaFiscal, setNotaFiscal] = useState('');
  const [numeroPedido, setNumeroPedido] = useState('');
  const [comprador, setComprador] = useState('');
  const [openFornecedor, setOpenFornecedor] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const { fornecedores } = useFornecedoresDB();
  const { criarSolicitacao } = useSolicitacao();
  const { tipos: tiposVeiculo, getLabelByNome } = useTiposVeiculoDB();

  const fornecedoresAtivos = useMemo(() => 
    fornecedores.filter(f => f.ativo), 
  [fornecedores]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fornecedorId || !tipoCaminhao || !volumePrevisto || !emailContato || !numeroPedido || !comprador) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      await criarSolicitacao({
        fornecedorId,
        tipoCaminhao: tipoCaminhao as TipoCaminhao,
        quantidadeVeiculos: parseInt(quantidadeVeiculos) || 1,
        volumePrevisto: parseInt(volumePrevisto) || 0,
        emailContato,
        notaFiscal: notaFiscal || undefined,
        numeroPedido,
        comprador,
      });
      setEnviado(true);
      toast.success('Solicitação enviada com sucesso!');
    } catch {
      toast.error('Erro ao enviar solicitação');
    }
  };

  const resetForm = () => {
    setFornecedorId('');
    setTipoCaminhao('');
    setQuantidadeVeiculos('1');
    setVolumePrevisto('');
    setEmailContato('');
    setNotaFiscal('');
    setNumeroPedido('');
    setComprador('');
    setEnviado(false);
  };

  if (enviado) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8 space-y-4">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold">Solicitação Enviada!</h2>
            <p className="text-muted-foreground">
              Sua solicitação de entrega foi recebida com sucesso. Aguarde a aprovação do administrador.
            </p>
            <Button onClick={resetForm} variant="outline" className="mt-4">
              Nova Solicitação
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-lg overflow-hidden">
        <div className="h-2 bg-amber-500" />
        <CardHeader className="text-center">
          <div className="mx-auto mb-2">
            <div className="bg-amber-500 rounded-full p-3 inline-flex">
              <PackageCheck className="h-10 w-10 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl">SOLICITAÇÃO DE ENTREGA</CardTitle>
          <CardDescription>
            Agende sua entrega com antecedência
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fornecedor">Fornecedor *</Label>
              <Popover open={openFornecedor} onOpenChange={setOpenFornecedor}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openFornecedor}
                    className="w-full justify-between font-normal"
                  >
                    {fornecedorId
                      ? fornecedoresAtivos.find(f => f.id === fornecedorId)?.nome
                      : "Selecione o fornecedor"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="Buscar fornecedor..." />
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
                            <Check className={cn("mr-2 h-4 w-4", fornecedorId === f.id ? "opacity-100" : "opacity-0")} />
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
              <Label htmlFor="tipoCaminhao">Tipo de Caminhão *</Label>
              <Select value={tipoCaminhao} onValueChange={(v) => setTipoCaminhao(v as TipoCaminhao)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {tiposVeiculo.map((tipo) => (
                    <SelectItem key={tipo.nome} value={tipo.nome}>{getLabelByNome(tipo.nome)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantidade">Quantidade de Veículos *</Label>
              <Input id="quantidade" type="number" min="1" value={quantidadeVeiculos} onChange={(e) => setQuantidadeVeiculos(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="volume">Volume Previsto *</Label>
              <Input id="volume" type="number" min="1" value={volumePrevisto} onChange={(e) => setVolumePrevisto(e.target.value)} placeholder="Quantidade de volumes" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail para Contato *</Label>
              <Input id="email" type="email" value={emailContato} onChange={(e) => setEmailContato(e.target.value)} placeholder="email@exemplo.com" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notaFiscal">Nota Fiscal</Label>
              <Input id="notaFiscal" value={notaFiscal} onChange={(e) => setNotaFiscal(e.target.value)} placeholder="Número da NF (opcional)" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numeroPedido">Número do Pedido *</Label>
              <Input id="numeroPedido" value={numeroPedido} onChange={(e) => setNumeroPedido(e.target.value)} placeholder="Número do pedido" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="comprador">Comprador *</Label>
              <Input id="comprador" value={comprador} onChange={(e) => setComprador(e.target.value)} placeholder="Nome do comprador" />
            </div>

            <Button type="submit" className="w-full">
              Enviar Solicitação
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
