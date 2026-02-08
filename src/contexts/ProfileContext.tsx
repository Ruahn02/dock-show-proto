import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Perfil } from '@/types';

interface ProfileContextType {
  perfil: Perfil;
  setPerfil: (perfil: Perfil) => void;
  isAdmin: boolean;
  autenticado: boolean;
  login: (perfil: Perfil, codigo: string) => boolean;
  logout: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

const CODIGOS: Record<Perfil, string> = {
  administrador: 'admin123',
  operacional: 'ACESSO123',
};

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [perfil, setPerfilState] = useState<Perfil>('administrador');
  const [autenticado, setAutenticado] = useState(false);

  const login = (perfilAlvo: Perfil, codigo: string): boolean => {
    if (codigo === CODIGOS[perfilAlvo]) {
      setPerfilState(perfilAlvo);
      setAutenticado(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setAutenticado(false);
    setPerfilState('administrador');
  };

  const value = {
    perfil,
    setPerfil: setPerfilState,
    isAdmin: perfil === 'administrador',
    autenticado,
    login,
    logout,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
