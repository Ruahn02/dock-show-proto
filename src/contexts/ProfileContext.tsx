import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
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

const STORAGE_KEY = 'dock_show_session';

function getStoredSession(): { perfil: Perfil; autenticado: boolean } | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.autenticado && (parsed.perfil === 'administrador' || parsed.perfil === 'operacional')) {
        return parsed;
      }
    }
  } catch {}
  return null;
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const stored = getStoredSession();
  const [perfil, setPerfilState] = useState<Perfil>(stored?.perfil || 'administrador');
  const [autenticado, setAutenticado] = useState(stored?.autenticado || false);

  const login = (perfilAlvo: Perfil, codigo: string): boolean => {
    if (codigo === CODIGOS[perfilAlvo]) {
      setPerfilState(perfilAlvo);
      setAutenticado(true);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ perfil: perfilAlvo, autenticado: true }));
      return true;
    }
    return false;
  };

  const logout = () => {
    setAutenticado(false);
    setPerfilState('administrador');
    localStorage.removeItem(STORAGE_KEY);
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
