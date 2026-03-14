import { useState, useMemo, useEffect } from 'react';
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
import { TipoCaminhao } from '@/types';
import { Truck, RefreshCw, ArrowLeft, List, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { getDeviceSenhas, saveDeviceSenha } from '@/lib/deviceStorage';
import { Badge } from '@/components/ui/badge';

type View = 'menu' | 'formulario' | 'minhasSenhas' | 'acompanhamento';

export default function SenhaCaminhoneiro() {
  const { gerarSenha, getSenhaById, cargas, senhas, atualizarCarga } = useSenha();
  const { fornecedores } = useFornecedoresDB();

  const dataHoje = format(new Date(), 'yyyy-MM-dd');

  const deviceSenhaIds = getDeviceSenhas();
  const senhasDoDispositivo = useMemo(() => {
    return senhas.filter(s => deviceSenhaIds.includes(s.id));
  }, [senhas, deviceSenhaIds]);

  const temSenhasAtivas = senhasDoDispositivo.some(
    s => s.status !== 'conferido' && s.status !== 'recusado' && !s.liberada
  );

  const [view, setView] = useState<View>(() =>
    senhasDoDispositivo.length > 0 ? 'menu' : 'formulario'
  );
  const [senhaGeradaId, setSenhaGeradaId] = useState<string | null>(null);
  const [fornecedorId, setFornecedorId] = useState('');
  const [nomeMotorista, setNomeMotorista] = useState('');
  const [tipoCaminhao, setTipoCaminhao] = useState<TipoCaminhao | ''>('');

  useEffect(() => {
    if (view === 'formulario' && senhasDoDispositivo.length > 0 && !senhaGeradaId) {
      setView('menu');
    }
  }, [senhasDoDispositivo.length]);

  const senhaGerada = senhaGeradaId ? getSenhaById(senhaGeradaId) : null;

  const fornecedoresAgendados = fornecedores.filter(f =>
    f.ativo && cargas.some(c => c.fornecedorId === f.id && c.data === dataHoje)
  );

  const handleGerarSenha = async () => {
    if (!fornecedorId) { toast.error('Selecione um fornecedor'); return; }
    if (!nomeMotorista.trim()) { toast.error('Informe o nome do motorista'); return; }
    if (!tipoCaminhao) { toast.error('Selecione o tipo de veículo'); return; }

    // Find available carga for this fornecedor today
    const cargaDisponivel = cargas.find(
      c => c.fornecedorId === fornecedorId && c.data === dataHoje &&
           c.status !== 'conferido' && c.status !== 'recusado' && c.status !== 'no_show'
    );

    // BUG 5 fix: default to 1 vehicle when quantidadeVeiculos is null
    if (cargaDisponivel) {
      const limite = cargaDisponivel.quantidadeVeiculos || 1;
      const senhasEmitidas = senhas.filter(
        s => s.cargaId === cargaDisponivel.id && s.status !== 'recusado'
      ).length;
      if (senhasEmitidas >= limite) {
        toast.error('Limite de caminhões para esta entrega atingido.');
        return;
      }
    }

    try {
      const senha = await gerarSenha({
        fornecedorId,
        nomeMotorista: nomeMotorista.trim(),
        tipoCaminhao: tipoCaminhao as TipoCaminhao,
        cargaId: cargaDisponivel?.id,
      });

      saveDeviceSenha(senha.id);

      // Mark carga as arrived
      if (cargaDisponivel && !cargaDisponivel.chegou) {
        await atualizarCarga(cargaDisponivel.id, { chegou: true });
      }

      setSenhaGeradaId(senha.id);
      setView('acompanhamento');
      toast.success('Senha gerada com sucesso!');
    } catch {
      toast.error('Erro ao gerar senha');
    }
  };

  const handleVoltar = () => {
    setSenhaGeradaId(null);
    setFornecedorId('');
    setNomeMotorista('');
    setTipoCaminhao('');
    setView(senhasDoDispositivo.length > 0 ? 'menu' : 'formulario');
  };

  const handleAbrirSenha = (id: string) => {
    setSenhaGeradaId(id);
    setView('acompanhamento');
  };

  const getFornecedorNome = (id: string) =>
    fornecedores.find(f => f.id === id)?.nome || 'N/A';

  const getStatusDisplay = () => {
    if (!senhaGerada) return null;
    switch (senhaGerada.status) {
      case 'aguardando_doca': return { text: 'AGUARDANDO DOCA', bgColor: 'bg-blue-500', textColor: 'text-white' };
      case 'em_doca': return null; // Dock info shown in the dedicated block below
      case 'aguardando_conferencia': return { text: 'AGUARDANDO CONFERÊNCIA', bgColor: 'bg-yellow-500', textColor: 'text-white' };
      case 'em_conferencia': return { text: 'EM CONFERÊNCIA', bgColor: 'bg-green-500', textColor: 'text-white' };
      case 'conferido': return { text: 'CONFERIDO', bgColor: 'bg-green-600', textColor: 'text-white' };
      case 'recusado': return { text: 'CARGA RECUSADA', bgColor: 'bg-red-500', textColor: 'text-white' };
      default: return null;
    }
  };

  const statusDisplay = getStatusDisplay();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'aguardando_doca': return <Badge className="bg-blue-500 text-white">Aguardando</Badge>;
      case 'em_doca': return <Badge className="bg-yellow-500 text-white">Em Doca</Badge>;
      case 'conferido': return <Badge className="bg-green-600 text-white">Conferido</Badge>;
      case 'recusado': return <Badge className="bg-red-500 text-white">Recusado</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const header = (
    <div className="text-center mb-8">
      <div className="flex justify-center mb-4">
        <div className="bg-blue-600 rounded-full p-4">
          <Truck className="h-10 w-10 text-white" />
        </div>
      </div>
      <h1 className="text-3xl font-bold text-slate-800">SENHA DE ATENDIMENTO</h1>
      <p className="text-slate-600">Controle de Docas</p>
    </div>
  );

  // ===== VIEW: MENU =====
  if (view === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-slate-100 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          {header}
          <Card className="shadow-lg overflow-hidden">
            <div className="h-2 bg-blue-600" />
            <CardContent className="pt-6 space-y-4">
              <Button
                onClick={() => setView('formulario')}
                className="w-full h-16 text-lg font-semibold gap-3"
              >
                <PlusCircle className="h-6 w-6" />
                SOLICITAR NOVA SENHA
              </Button>
              <Button
                onClick={() => setView('minhasSenhas')}
                variant="outline"
                className="w-full h-16 text-lg font-semibold gap-3"
              >
                <List className="h-6 w-6" />
                MINHAS SENHAS
                {temSenhasAtivas && (
                  <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
                    {senhasDoDispositivo.filter(s => s.status !== 'conferido' && s.status !== 'recusado' && !s.liberada).length}
                  </span>
                )}
              </Button>
            </CardContent>
          </Card>
          <p className="text-center text-xs text-slate-500 mt-8">
            Aguarde seu chamado no painel de senhas
          </p>
        </div>
      </div>
    );
  }

  // ===== VIEW: MINHAS SENHAS =====
  if (view === 'minhasSenhas') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-slate-100 flex flex-col items-center p-4 pt-8">
        <div className="w-full max-w-md">
          {header}
          <Card className="shadow-lg overflow-hidden">
            <div className="h-2 bg-blue-600" />
            <CardHeader>
              <CardTitle className="text-center text-lg">Minhas Senhas de Hoje</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {senhasDoDispositivo.length === 0 ? (
                <p className="text-center text-slate-500 py-4">Nenhuma senha gerada hoje neste dispositivo.</p>
              ) : (
                senhasDoDispositivo.map(s => {
                  const isAtiva = s.status !== 'conferido' && s.status !== 'recusado' && !s.liberada;
                  return (
                    <button
                      key={s.id}
                      onClick={() => handleAbrirSenha(s.id)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        isAtiva
                          ? 'border-blue-400 bg-blue-50 hover:bg-blue-100'
                          : 'border-slate-200 bg-white hover:bg-slate-50 opacity-70'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-primary">
                            {String(s.numero).padStart(4, '0')}
                          </p>
                          <p className="text-sm text-slate-600">{getFornecedorNome(s.fornecedorId)}</p>
                          <p className="text-xs text-slate-400">Chegada: {s.horaChegada}</p>
                        </div>
                        <div>{getStatusBadge(s.status)}</div>
                      </div>
                    </button>
                  );
                })
              )}
            </CardContent>
          </Card>
          <Button
            onClick={handleVoltar}
            variant="ghost"
            className="w-full mt-4 gap-2 text-slate-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  // ===== VIEW: FORMULARIO =====
  if (view === 'formulario') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-slate-100 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          {header}
          <Card className="shadow-lg overflow-hidden">
            <div className="h-2 bg-blue-600" />
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
          {senhasDoDispositivo.length > 0 && (
            <Button
              onClick={handleVoltar}
              variant="ghost"
              className="w-full mt-4 gap-2 text-slate-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Menu
            </Button>
          )}
          <p className="text-center text-xs text-slate-500 mt-8">
            Aguarde seu chamado no painel de senhas
          </p>
        </div>
      </div>
    );
  }

  // ===== VIEW: ACOMPANHAMENTO =====
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-slate-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {header}
        {senhaGerada ? (
          <Card className="shadow-lg overflow-hidden">
            <div className="h-2 bg-blue-600" />
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
              {senhaGerada.localAtual === 'em_doca' && senhaGerada.docaNumero && senhaGerada.status !== 'conferido' && senhaGerada.status !== 'recusado' && (
                <div className="bg-primary text-primary-foreground rounded-xl p-6 text-center border-2 border-primary animate-pulse">
                  <p className="text-sm font-medium mb-1">DIRIJA-SE PARA A</p>
                  <p className="text-3xl md:text-4xl font-bold">DOCA {senhaGerada.docaNumero}</p>
                </div>
              )}
              {senhaGerada.localAtual === 'em_patio' && senhaGerada.rua && senhaGerada.status !== 'conferido' && senhaGerada.status !== 'recusado' && (
                <div className="bg-orange-500 text-white rounded-xl p-6 text-center border-2 border-orange-600 animate-pulse">
                  <p className="text-sm font-medium mb-1">DIRIJA-SE PARA A</p>
                  <p className="text-3xl md:text-4xl font-bold">RUA {senhaGerada.rua}</p>
                </div>
              )}
              <div className="text-center text-sm text-slate-500">
                Hora de chegada: {senhaGerada.horaChegada}
              </div>
              <Button onClick={handleVoltar} variant="outline" className="w-full h-12 gap-2">
                <ArrowLeft className="h-4 w-4" />
                VOLTAR AO MENU
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-lg">
            <CardContent className="pt-6 text-center space-y-4">
              <p className="text-slate-500">Senha não encontrada.</p>
              <Button onClick={handleVoltar} variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
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
