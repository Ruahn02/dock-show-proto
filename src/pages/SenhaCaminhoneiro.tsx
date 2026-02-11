import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useSenha } from '@/contexts/SenhaContext';
import { useFornecedoresDB } from '@/hooks/useFornecedoresDB';
import { tipoCaminhaoLabels } from '@/data/mockData';
import { Senha, TipoCaminhao } from '@/types';
import { Truck, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function SenhaCaminhoneiro() {
  const [fornecedorId, setFornecedorId] = useState<string>('');
  const [nomeMotorista, setNomeMotorista] = useState<string>('');
  const [tipoCaminhao, setTipoCaminhao] = useState<TipoCaminhao | ''>('');
  const [senhaGerada, setSenhaGerada] = useState<Senha | null>(null);
  const { gerarSenha, getSenhaById, senhas, cargas, marcarChegada } = useSenha();
  const { fornecedores } = useFornecedoresDB();

  // Atualizar senha quando houver mudanças no contexto
  useEffect(() => {
    if (senhaGerada) {
      const senhaAtualizada = getSenhaById(senhaGerada.id);
      if (senhaAtualizada) {
        setSenhaGerada(senhaAtualizada);
      }
    }
  }, [senhas, senhaGerada, getSenhaById]);

  const dataHoje = format(new Date(), 'yyyy-MM-dd');
  const fornecedoresAgendados = fornecedores.filter(f => 
    f.ativo && cargas.some(c => c.fornecedorId === f.id && c.data === dataHoje)
  );

  const handleGerarSenha = async () => {
    if (!fornecedorId) {
      toast.error('Selecione um fornecedor');
      return;
    }
    if (!nomeMotorista.trim()) {
      toast.error('Informe o nome do motorista');
      return;
    }
    if (!tipoCaminhao) {
      toast.error('Selecione o tipo de veículo');
      return;
    }

    try {
      const senha = await gerarSenha({
        fornecedorId,
        nomeMotorista: nomeMotorista.trim(),
        tipoCaminhao: tipoCaminhao as TipoCaminhao
      });
      
      // Marcar chegada na primeira carga disponível do fornecedor
      const dataHj = format(new Date(), 'yyyy-MM-dd');
      const cargaDisponivel = cargas.find(
        c => c.fornecedorId === fornecedorId && c.data === dataHj && c.status === 'aguardando_chegada' && !c.chegou
      );
      if (cargaDisponivel) {
        await marcarChegada(cargaDisponivel.id, senha.id);
      }
      
      setSenhaGerada(senha);
      toast.success('Senha gerada com sucesso!');
    } catch {
      toast.error('Erro ao gerar senha');
    }
  };

  const handleNovaSenha = () => {
    setSenhaGerada(null);
    setFornecedorId('');
    setNomeMotorista('');
    setTipoCaminhao('');
  };

  const getStatusDisplay = () => {
    if (!senhaGerada) return null;

    switch (senhaGerada.status) {
      case 'aguardando_doca':
        return { text: 'AGUARDANDO DOCA', bgColor: 'bg-blue-500', textColor: 'text-white' };
      case 'em_doca':
        return { text: 'EM DOCA', bgColor: 'bg-yellow-500', textColor: 'text-white' };
      case 'aguardando_conferencia':
        return { text: 'AGUARDANDO CONFERÊNCIA', bgColor: 'bg-yellow-500', textColor: 'text-white' };
      case 'conferindo':
        return { text: 'CONFERINDO', bgColor: 'bg-green-500', textColor: 'text-white' };
      case 'conferido':
        return { text: 'CONFERIDO', bgColor: 'bg-green-600', textColor: 'text-white' };
      case 'recusado':
        return { text: 'CARGA RECUSADA', bgColor: 'bg-red-500', textColor: 'text-white' };
      default:
        return null;
    }
  };

  const getFornecedorNome = (id: string) => {
    return fornecedores.find(f => f.id === id)?.nome || 'N/A';
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-primary rounded-full p-4">
              <Truck className="h-10 w-10 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">CONTROLE DE DOCAS</h1>
          <p className="text-slate-600">Sistema de Senha</p>
        </div>

        {!senhaGerada ? (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-center text-lg">Gerar Senha de Atendimento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="fornecedor">Fornecedor *</Label>
                <Select value={fornecedorId} onValueChange={setFornecedorId}>
                  <SelectTrigger id="fornecedor" className="h-14 text-base">
                    <SelectValue placeholder="Selecione o fornecedor..." />
                  </SelectTrigger>
                  <SelectContent>
                    {fornecedoresAgendados.map((f) => (
                      <SelectItem key={f.id} value={f.id} className="text-base py-3">
                        {f.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="motorista">Nome do Motorista *</Label>
                <Input
                  id="motorista"
                  value={nomeMotorista}
                  onChange={(e) => setNomeMotorista(e.target.value)}
                  placeholder="Digite seu nome..."
                  className="h-14 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipoCaminhao">Tipo de Veículo *</Label>
                <Select value={tipoCaminhao} onValueChange={(val) => setTipoCaminhao(val as TipoCaminhao)}>
                  <SelectTrigger id="tipoCaminhao" className="h-14 text-base">
                    <SelectValue placeholder="Selecione o tipo..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(tipoCaminhaoLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value} className="text-base py-3">
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleGerarSenha} 
                className="w-full h-14 text-lg font-semibold"
                disabled={!fornecedorId || !nomeMotorista.trim() || !tipoCaminhao || fornecedoresAgendados.length === 0}
              >
                GERAR SENHA
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-lg">
            <CardContent className="pt-6 space-y-6">
              <div className="text-center space-y-1">
                <p className="text-slate-600 text-sm">Fornecedor</p>
                <p className="font-semibold text-lg">{getFornecedorNome(senhaGerada.fornecedorId)}</p>
              </div>
              <div className="text-center space-y-1">
                <p className="text-slate-600 text-sm">Veículo</p>
                <p className="font-medium">{tipoCaminhaoLabels[senhaGerada.tipoCaminhao]}</p>
              </div>
              <div className="text-center">
                <p className="text-slate-600 text-sm">Sua Senha</p>
                <p className="font-bold text-5xl text-primary">
                  {String(senhaGerada.numero).padStart(4, '0')}
                </p>
              </div>
              {statusDisplay && (
                <div className={`${statusDisplay.bgColor} ${statusDisplay.textColor} rounded-xl p-6 text-center`}>
                  <p className="text-2xl md:text-3xl font-bold leading-tight">
                    {statusDisplay.text}
                  </p>
                </div>
              )}
              <div className="text-center text-sm text-slate-500">
                Hora de chegada: {senhaGerada.horaChegada}
              </div>
              {(senhaGerada.status === 'conferido' || senhaGerada.status === 'recusado') && (
                <Button onClick={handleNovaSenha} variant="outline" className="w-full h-12 gap-2">
                  <RefreshCw className="h-4 w-4" />
                  NOVA SENHA
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        <p className="text-center text-xs text-slate-500 mt-8">
          Aguarde seu chamado no painel de senhas
        </p>
      </div>
    </div>
  );
}
