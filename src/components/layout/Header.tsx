import { useProfile } from '@/contexts/ProfileContext';
import { Button } from '@/components/ui/button';
import { Warehouse, Shield, User } from 'lucide-react';

export function Header() {
  const { perfil, setPerfil, isAdmin } = useProfile();

  return (
    <header className="h-16 border-b bg-card px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Warehouse className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-xl font-bold text-foreground">Controle de Docas</h1>
          <p className="text-xs text-muted-foreground">Sistema de Gestão de Recebimento</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground mr-2">Perfil:</span>
        <Button
          variant={isAdmin ? 'default' : 'outline'}
          size="sm"
          onClick={() => setPerfil('administrador')}
          className="gap-2"
        >
          <Shield className="h-4 w-4" />
          Administrador
        </Button>
        <Button
          variant={!isAdmin ? 'default' : 'outline'}
          size="sm"
          onClick={() => setPerfil('operacional')}
          className="gap-2"
        >
          <User className="h-4 w-4" />
          Operacional
        </Button>
      </div>
    </header>
  );
}
