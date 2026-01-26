import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { ProdutividadeConferente } from '@/types';

interface ProductivityChartProps {
  data: ProdutividadeConferente[];
}

const chartConfig = {
  volumes: {
    label: 'Volumes',
    color: 'hsl(221, 83%, 53%)',
  },
};

export function ProductivityChart({ data }: ProductivityChartProps) {
  const sortedData = [...data].sort((a, b) => b.volumes - a.volumes);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Produtividade por Conferente</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart
            data={sortedData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
          >
            <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis 
              type="category" 
              dataKey="nome" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false}
              width={75}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="volumes" radius={[0, 4, 4, 0]}>
              {sortedData.map((_, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={`hsl(221, 83%, ${53 + index * 8}%)`}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
