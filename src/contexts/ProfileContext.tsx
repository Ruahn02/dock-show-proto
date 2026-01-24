import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Perfil } from '@/types';

interface ProfileContextType {
  perfil: Perfil;
  setPerfil: (perfil: Perfil) => void;
  isAdmin: boolean;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [perfil, setPerfil] = useState<Perfil>('administrador');

  const value = {
    perfil,
    setPerfil,
    isAdmin: perfil === 'administrador',
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
