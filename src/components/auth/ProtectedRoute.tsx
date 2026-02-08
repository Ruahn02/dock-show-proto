import { Navigate } from 'react-router-dom';
import { useProfile } from '@/contexts/ProfileContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { autenticado, isAdmin } = useProfile();
  
  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/docas" replace />;
  }
  
  return <>{children}</>;
}
