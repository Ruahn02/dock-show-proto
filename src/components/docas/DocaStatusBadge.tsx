import { Badge } from '@/components/ui/badge';
import { StatusDoca } from '@/types';
import { statusDocaLabels } from '@/data/mockData';

interface DocaStatusBadgeProps {
  status: StatusDoca;
  size?: 'sm' | 'lg';
}

const statusStyles: Record<StatusDoca, string> = {
  livre: 'bg-green-100 text-green-800 border-green-300 hover:bg-green-100',
  conferindo: 'bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-100',
  conferido: 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-100',
  uso_consumo: 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-100',
};

export function DocaStatusBadge({ status, size = 'sm' }: DocaStatusBadgeProps) {
  return (
    <Badge 
      variant="outline" 
      className={`${statusStyles[status]} ${size === 'lg' ? 'text-base px-4 py-1' : ''}`}
    >
      {statusDocaLabels[status]}
    </Badge>
  );
}
