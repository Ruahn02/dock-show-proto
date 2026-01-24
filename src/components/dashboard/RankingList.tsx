import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Medal } from 'lucide-react';
import { produtividadeConferentes } from '@/data/mockData';

export function RankingList() {
  const ranking = [...produtividadeConferentes].sort((a, b) => b.volumes - a.volumes);

  const getMedalColor = (index: number) => {
    switch (index) {
      case 0: return 'text-yellow-500';
      case 1: return 'text-gray-400';
      case 2: return 'text-amber-600';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Ranking de Conferentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {ranking.map((conferente, index) => (
            <div 
              key={conferente.conferenteId}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${index < 3 ? 'bg-card' : ''}`}>
                  {index < 3 ? (
                    <Medal className={`h-5 w-5 ${getMedalColor(index)}`} />
                  ) : (
                    <span className="text-sm font-medium text-muted-foreground">{index + 1}º</span>
                  )}
                </div>
                <span className="font-medium">{conferente.nome}</span>
              </div>
              <span className="font-bold text-primary">{conferente.volumes} vol.</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
