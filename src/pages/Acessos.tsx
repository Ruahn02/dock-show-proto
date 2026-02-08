import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, User, Truck, Copy } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';

const acessos = [
  {
    titulo: 'Acesso Administrativo',
    descricao: 'Login com email, senha e código de acesso (admin123). Para gestores e administradores do sistema.',
    path: '/login',
    icon: Shield,
  },
  {
    titulo: 'Acesso Operacional',
    descricao: 'Acesso simplificado com código ACESSO123. Para conferentes e equipe de operação.',
    path: '/acesso',
    icon: User,
  },
  {
    titulo: 'Solicitação de Senha',
    descricao: 'Acesso público sem login. Para caminhoneiros solicitarem senha de atendimento na portaria.',
    path: '/senha',
    icon: Truck,
  },
];

export default function Acessos() {
  const origin = window.location.origin;

  const copiar = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('Link copiado!');
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Acessos do Sistema</h1>
          <p className="text-muted-foreground mt-1">Links e QR Codes fixos para compartilhamento</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {acessos.map((item) => {
            const url = `${origin}${item.path}`;
            return (
              <Card key={item.path}>
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-2">
                    <item.icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{item.titulo}</CardTitle>
                  <CardDescription>{item.descricao}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                  <div className="bg-white p-4 rounded-lg">
                    <QRCodeSVG value={url} size={180} />
                  </div>
                  <code className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded break-all text-center">
                    {url}
                  </code>
                  <Button variant="outline" size="sm" onClick={() => copiar(url)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar link
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
