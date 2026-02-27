import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useProfile } from '@/contexts/ProfileContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShoppingCart, AlertCircle } from 'lucide-react';

export default function LoginComprador() {
  const [codigo, setCodigo] = useState('');
  const [erro, setErro] = useState('');
  const { login, autenticado, perfil } = useProfile();
  const navigate = useNavigate();

  if (autenticado && perfil === 'comprador') {
    return <Navigate to="/comprador/agenda" replace />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    if (!codigo.trim()) {
      setErro('Informe o código de acesso');
      return;
    }

    const sucesso = login('comprador', codigo);
    if (sucesso) {
      navigate('/comprador/agenda', { replace: true });
    } else {
      setErro('Código de acesso inválido');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2">
          <ShoppingCart className="h-12 w-12 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Controle de Docas</h1>
          <p className="text-sm text-muted-foreground">Acesso Comprador</p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Acesso Comprador</CardTitle>
            </div>
            <CardDescription>Digite o código de acesso para visualizar os agendamentos</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="codigo">Código de acesso</Label>
                <Input
                  id="codigo"
                  type="password"
                  placeholder="Digite o código de acesso"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  autoFocus
                />
              </div>

              {erro && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{erro}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full">
                Entrar
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
