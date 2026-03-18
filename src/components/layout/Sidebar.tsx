import { NavLink } from '@/components/NavLink';
import { useProfile } from '@/contexts/ProfileContext';
import { 
  LayoutDashboard, 
  ClipboardList,
  CalendarPlus, 
  CalendarCheck,
  Container, 
  Building2, 
  Users,
  Ticket,
  ArrowRightLeft,
  QrCode,
  Archive
} from 'lucide-react';

const menuItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, adminOnly: true },
  { to: '/solicitacoes', label: 'Solicitações de Entrega', icon: ClipboardList, adminOnly: true },
  { to: '/agendamento', label: 'Agendamento', icon: CalendarPlus, adminOnly: true },
  { to: '/agenda', label: 'Agenda', icon: CalendarCheck, adminOnly: true },
  { to: '/docas', label: 'Docas', icon: Container, adminOnly: false },
  { to: '/cross', label: 'Cross Docking', icon: ArrowRightLeft, adminOnly: false },
  { to: '/armazenamento', label: 'Armazenamento', icon: Archive, adminOnly: true },
  { to: '/senhas', label: 'Controle de Senhas', icon: Ticket, adminOnly: true },
  { to: '/fornecedores', label: 'Fornecedores', icon: Building2, adminOnly: true },
  { to: '/funcionarios', label: 'Funcionários', icon: Users, adminOnly: true },
  { to: '/acessos', label: 'Acessos do Sistema', icon: QrCode, adminOnly: true },
];

export function Sidebar() {
  const { isAdmin } = useProfile();

  const visibleItems = menuItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <aside className="w-64 bg-card border-r min-h-[calc(100vh-4rem)]">
      <nav className="p-4 space-y-2">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            activeClassName="bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
          >
            <item.icon className="h-5 w-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}

        {isAdmin && (
          <div className="pt-4 mt-4 border-t">
            <p className="px-4 text-xs text-muted-foreground uppercase tracking-wider mb-2">
              Área Administrativa
            </p>
          </div>
        )}
      </nav>
    </aside>
  );
}
