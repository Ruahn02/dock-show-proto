import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useSenha } from '@/contexts/SenhaContext';
import { fornecedores } from '@/data/mockData';
import { Senha } from '@/types';
import { Truck, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function SenhaCaminhoneiro() {
  const [fornecedorId, setFornecedorId] = useState<string>('');
  const [senhaGerada, setSenhaGerada] = useState<Senha | null>(null);
  const { gerarSenha, getSenhaById, senhas } = useSenha();

  // Atualizar senha quando houver mudanças no contexto
  useEffect(() => {
    if (senhaGerada) {
      const senhaAtualizada = getSenhaById(senhaGerada.id);
      if (senhaAtualizada) {
        setSenhaGerada(senhaAtualizada);
      }
    }
  }, [senhas, senhaGerada, getSenhaById]);

  const fornecedoresAtivos = fornecedores.filter(f => f.ativo);

  const handleGerarSenha = () => {
    if (!fornecedorId) {
      toast.error('Selecione um fornecedor');
      return;
    }

    const senha = gerarSenha(fornecedorId);
    if (senha) {
      setSenhaGerada(senha);
      toast.success('Senha gerada com sucesso!');
    } else {
      toast.error('Nenhum agendamento encontrado para este fornecedor hoje');
    }
  };

  const handleNovaSenha = () => {
    setSenhaGerada(null);
    setFornecedorId('');
  };

  const getStatusDisplay = () => {
    if (!senhaGerada) return null;

    switch (senhaGerada.status) {
      case 'aguardando':
        return {
          text: 'AGUARDANDO CHAMADO',
          bgColor: 'bg-blue-500',
          textColor: 'text-white',
        };
      case 'chamado':
        return {
          text: `DIRIJA-SE À DOCA ${senhaGerada.docaNumero}`,
          bgColor: 'bg-green-500',
          textColor: 'text-white',
        };
      case 'recusado':
        return {
          text: 'CARGA RECUSADA',
          bgColor: 'bg-red-500',
          textColor: 'text-white',
        };
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
          // Tela de seleção de fornecedor
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-center text-lg">Gerar Senha de Atendimento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fornecedor">Selecione o Fornecedor</Label>
                <Select value={fornecedorId} onValueChange={setFornecedorId}>
                  <SelectTrigger id="fornecedor" className="h-14 text-base">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {fornecedoresAtivos.map((f) => (
                      <SelectItem key={f.id} value={f.id} className="text-base py-3">
                        {f.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleGerarSenha} 
                className="w-full h-14 text-lg font-semibold"
                disabled={!fornecedorId}
              >
                GERAR SENHA
              </Button>
            </CardContent>
          </Card>
        ) : (
          // Tela de exibição da senha
          <Card className="shadow-lg">
            <CardContent className="pt-6 space-y-6">
              {/* Info do fornecedor e senha */}
              <div className="text-center space-y-1">
                <p className="text-slate-600 text-sm">Fornecedor</p>
                <p className="font-semibold text-lg">{getFornecedorNome(senhaGerada.fornecedorId)}</p>
              </div>

              <div className="text-center">
                <p className="text-slate-600 text-sm">Sua Senha</p>
                <p className="font-bold text-5xl text-primary">
                  {String(senhaGerada.numero).padStart(4, '0')}
                </p>
              </div>

              {/* Status grande */}
              {statusDisplay && (
                <div 
                  className={`${statusDisplay.bgColor} ${statusDisplay.textColor} rounded-xl p-6 text-center`}
                >
                  <p className="text-2xl md:text-3xl font-bold leading-tight">
                    {statusDisplay.text}
                  </p>
                </div>
              )}

              <div className="text-center text-sm text-slate-500">
                Hora de chegada: {senhaGerada.horaChegada}
              </div>

              {/* Botão Nova Senha - só mostra se não está aguardando */}
              {senhaGerada.status !== 'aguardando' && (
                <Button 
                  onClick={handleNovaSenha} 
                  variant="outline"
                  className="w-full h-12 gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  NOVA SENHA
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 mt-8">
          Aguarde seu chamado no painel de senhas
        </p>
      </div>
    </div>
  );
}
