import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DocaStatusBadge } from './DocaStatusBadge';
import { Doca, Carga, Conferente, Fornecedor } from '@/types';
import { useProfile } from '@/contexts/ProfileContext';
import { Container, User, Package, MapPin, Edit, Unlock, Coffee } from 'lucide-react';

interface DocaCardProps {
  doca: Doca;
  carga?: Carga;
  conferente?: Conferente;
  fornecedor?: Fornecedor;
  onAlterarStatus: (doca: Doca) => void;
  onUsoConsumo: (doca: Doca) => void;
  onLiberar: (doca: Doca) => void;
  onEntrar: (doca: Doca) => void;
}

export function DocaCard({ 
  doca, 
  carga, 
  conferente, 
  fornecedor,
  onAlterarStatus,
  onUsoConsumo,
  onLiberar,
  onEntrar 
}: DocaCardProps) {
  const { isAdmin } = useProfile();

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Container className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Doca {doca.numero}</h3>
            </div>
          </div>
          <DocaStatusBadge status={doca.status} size="lg" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {fornecedor && (
          <div className="flex items-center gap-2 text-sm">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Fornecedor:</span>
            <span className="font-medium">{fornecedor.nome}</span>
          </div>
        )}

        {conferente && (
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Conferente:</span>
            <span className="font-medium">{conferente.nome}</span>
          </div>
        )}

        {carga && (
          <>
            <div className="flex items-center gap-2 text-sm">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">NFs:</span>
              <span className="font-medium">{carga.nfs.join(', ')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Volume Previsto:</span>
              <span className="font-medium">{carga.volumePrevisto}</span>
            </div>
          </>
        )}

        {doca.volumeConferido && (
          <div className="flex items-center gap-2 text-sm">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Volume Conferido:</span>
            <span className="font-bold text-primary">{doca.volumeConferido}</span>
          </div>
        )}

        {doca.rua && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Rua:</span>
            <span className="font-medium">{doca.rua}</span>
          </div>
        )}

        {doca.status === 'uso_consumo' && (
          <div className="p-3 bg-muted rounded-lg text-center">
            <Coffee className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Doca em uso interno</p>
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-2 border-t">
          {isAdmin ? (
            <>
              {doca.status !== 'uso_consumo' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onAlterarStatus(doca)}
                  className="gap-1"
                >
                  <Edit className="h-4 w-4" />
                  Alterar Status
                </Button>
              )}
              {doca.status === 'livre' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onUsoConsumo(doca)}
                  className="gap-1"
                >
                  <Coffee className="h-4 w-4" />
                  Uso e Consumo
                </Button>
              )}
              {(doca.status === 'conferido' || doca.status === 'uso_consumo') && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onLiberar(doca)}
                  className="gap-1 text-green-600 hover:text-green-700"
                >
                  <Unlock className="h-4 w-4" />
                  Liberar
                </Button>
              )}
            </>
          ) : (
            <>
              {doca.status === 'livre' && (
                <Button 
                  size="sm" 
                  onClick={() => onEntrar(doca)}
                  className="gap-1 w-full"
                >
                  <Container className="h-4 w-4" />
                  Entrar na Doca
                </Button>
              )}
              {doca.status === 'conferindo' && (
                <Button 
                  size="sm" 
                  onClick={() => onAlterarStatus(doca)}
                  className="gap-1 w-full"
                >
                  <Edit className="h-4 w-4" />
                  Finalizar Conferência
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
