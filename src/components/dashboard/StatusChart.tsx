import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const data = [
  { name: 'Conferido', value: 12, color: '#3b82f6' },
  { name: 'Agendado', value: 5, color: '#8b5cf6' },
  { name: 'Em Conferência', value: 1, color: '#eab308' },
  { name: 'No Show', value: 2, color: '#f97316' },
  { name: 'Recusado', value: 1, color: '#ef4444' },
];

export function StatusChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Status das Cargas</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
