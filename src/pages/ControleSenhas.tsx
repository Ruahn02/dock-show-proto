import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { QRCodeSVG } from 'qrcode.react';
import { useSenha } from '@/contexts/SenhaContext';
import { fornecedores } from '@/data/mockData';
import { Ticket } from 'lucide-react';

export default function ControleSenhas() {
  const { senhas } = useSenha();
  
  const senhaUrl = `${window.location.origin}/senha`;
  
  const getStatusDisplay = (status: string, docaNumero?: number) => {
    switch (status) {
      case 'aguardando':
        return { text: 'Aguardando Chamado', className: 'bg-blue-100 text-blue-800' };
      case 'chamado':
        return { text: `Chamado para Doca ${docaNumero}`, className: 'bg-green-100 text-green-800' };
      case 'recusado':
        return { text: 'Recusado', className: 'bg-red-100 text-red-800' };
      default:
        return { text: status, className: '' };
    }
  };

  const getFornecedorNome = (fornecedorId: string) => {
    const fornecedor = fornecedores.find(f => f.id === fornecedorId);
    return fornecedor?.nome || 'Desconhecido';
  };
  
  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Ticket className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Controle de Senhas</h1>
            <p className="text-muted-foreground">Acompanhamento de chegadas</p>
          </div>
        </div>

        {/* Grid: QR Code + Tabela */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* QR Code Card */}
          <Card className="lg:col-span-1">
            <CardHeader className="text-center">
              <CardTitle className="text-lg">Escaneie para Gerar sua Senha</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <div className="bg-white p-4 rounded-lg">
                <QRCodeSVG 
                  value={senhaUrl}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Aponte a câmera do seu celular para o código acima
              </p>
            </CardContent>
          </Card>
          
          {/* Tabela de Senhas */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Lista de Senhas</CardTitle>
            </CardHeader>
            <CardContent>
              {senhas.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma senha gerada ainda
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Senha</TableHead>
                      <TableHead>Fornecedor</TableHead>
                      <TableHead>Hora Chegada</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {senhas.map((senha) => {
                      const statusDisplay = getStatusDisplay(senha.status, senha.docaNumero);
                      return (
                        <TableRow key={senha.id}>
                          <TableCell className="font-mono font-semibold">
                            {String(senha.numero).padStart(4, '0')}
                          </TableCell>
                          <TableCell>{getFornecedorNome(senha.fornecedorId)}</TableCell>
                          <TableCell>{senha.horaChegada}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusDisplay.className}`}>
                              {statusDisplay.text}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
