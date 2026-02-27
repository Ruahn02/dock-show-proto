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
  comprador: 'COMPRADOR123',
};

const STORAGE_KEY_ADMIN = 'dock_show_session_admin';
const STORAGE_KEY_OPERACIONAL = 'dock_show_session_operacional';
const STORAGE_KEY_COMPRADOR = 'dock_show_session_comprador';

function getStorageKey(perfil: Perfil): string {
  if (perfil === 'comprador') return STORAGE_KEY_COMPRADOR;
  if (perfil === 'operacional') return STORAGE_KEY_OPERACIONAL;
  return STORAGE_KEY_ADMIN;
}

function getStoredSession(): { perfil: Perfil; autenticado: boolean } | null {
  try {
    const path = window.location.pathname;
    const isCompradorRoute = path.startsWith('/comprador');
    const isOperacionalRoute = ['/acesso', '/docas', '/cross'].some(r => path.startsWith(r));
    const key = isCompradorRoute ? STORAGE_KEY_COMPRADOR : isOperacionalRoute ? STORAGE_KEY_OPERACIONAL : STORAGE_KEY_ADMIN;
    const stored = localStorage.getItem(key);
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
      const key = getStorageKey(perfilAlvo);
      localStorage.setItem(key, JSON.stringify({ perfil: perfilAlvo, autenticado: true }));
      return true;
    }
    return false;
  };

  const logout = () => {
    const key = getStorageKey(perfil);
    setAutenticado(false);
    setPerfilState('administrador');
    localStorage.removeItem(key);
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
