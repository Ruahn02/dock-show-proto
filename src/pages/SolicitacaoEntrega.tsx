import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { fornecedores, tipoCaminhaoLabels } from '@/data/mockData';
import { TipoCaminhao } from '@/types';
import { toast } from 'sonner';
import { Truck, CheckCircle2 } from 'lucide-react';

export default function SolicitacaoEntrega() {
  const [fornecedorId, setFornecedorId] = useState('');
  const [tipoCaminhao, setTipoCaminhao] = useState<TipoCaminhao | ''>('');
  const [quantidadeVeiculos, setQuantidadeVeiculos] = useState('1');
  const [volumePrevisto, setVolumePrevisto] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [enviado, setEnviado] = useState(false);

  const fornecedoresAtivos = useMemo(() => 
    fornecedores.filter(f => f.ativo), 
  []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fornecedorId || !tipoCaminhao || !volumePrevisto) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    // In a real app, this would call the context
    // For now, we simulate the submission
    setEnviado(true);
    toast.success('Solicitação enviada com sucesso!');
  };

  const resetForm = () => {
    setFornecedorId('');
    setTipoCaminhao('');
    setQuantidadeVeiculos('1');
    setVolumePrevisto('');
    setObservacoes('');
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2">
            <Truck className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Solicitação de Entrega</CardTitle>
          <CardDescription>
            Preencha os dados abaixo para solicitar uma entrega
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fornecedor">Fornecedor *</Label>
              <Select value={fornecedorId} onValueChange={setFornecedorId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o fornecedor" />
                </SelectTrigger>
                <SelectContent>
                  {fornecedoresAtivos.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipoCaminhao">Tipo de Caminhão *</Label>
              <Select value={tipoCaminhao} onValueChange={(v) => setTipoCaminhao(v as TipoCaminhao)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(tipoCaminhaoLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantidade">Quantidade de Veículos *</Label>
              <Input
                id="quantidade"
                type="number"
                min="1"
                value={quantidadeVeiculos}
                onChange={(e) => setQuantidadeVeiculos(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="volume">Volume Previsto *</Label>
              <Input
                id="volume"
                type="number"
                min="1"
                value={volumePrevisto}
                onChange={(e) => setVolumePrevisto(e.target.value)}
                placeholder="Quantidade de volumes"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Informações adicionais sobre a entrega..."
                rows={3}
              />
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
