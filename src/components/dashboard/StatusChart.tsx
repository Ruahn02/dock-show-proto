import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { StatusCargaChart } from '@/types';

interface StatusChartProps {
  data: StatusCargaChart[];
}

const chartConfig = {
  conferido: {
    label: 'Conferido',
    color: '#3B82F6',
  },
  no_show: {
    label: 'No Show',
    color: '#F97316',
  },
  recusado: {
    label: 'Recusado',
    color: '#EF4444',
  },
};

export function StatusChart({ data }: StatusChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Status das Cargas</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              nameKey="name"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value, entry: any) => (
                <span className="text-sm text-muted-foreground">
                  {value} ({entry.payload?.value || 0})
                </span>
              )}
            />
          </PieChart>
        </ChartContainer>
        <div className="text-center mt-2">
          <p className="text-sm text-muted-foreground">Total: {total} cargas</p>
        </div>
      </CardContent>
    </Card>
  );
}
