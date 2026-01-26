import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Medal, Award } from 'lucide-react';
import { ProdutividadeConferente } from '@/types';

interface RankingListProps {
  data: ProdutividadeConferente[];
}

const positionConfig = [
  { icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-50', label: '1º' },
  { icon: Medal, color: 'text-gray-400', bg: 'bg-gray-50', label: '2º' },
  { icon: Award, color: 'text-amber-600', bg: 'bg-amber-50', label: '3º' },
];

export function RankingList({ data }: RankingListProps) {
  const sortedData = [...data]
    .sort((a, b) => b.volumes - a.volumes)
    .slice(0, 5);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Ranking de Conferentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedData.map((conferente, index) => {
            const config = positionConfig[index];
            const Icon = config?.icon;

            return (
              <div 
                key={conferente.id}
                className={`flex items-center justify-between p-3 rounded-lg ${config?.bg || 'bg-muted/30'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${config?.bg || 'bg-muted'}`}>
                    {Icon ? (
                      <Icon className={`h-5 w-5 ${config.color}`} />
                    ) : (
                      <span className="text-sm font-bold text-muted-foreground">{index + 1}º</span>
                    )}
                  </div>
                  <span className="font-medium">{conferente.nome}</span>
                </div>
                <span className="font-bold text-primary">{conferente.volumes.toLocaleString()} vol</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
