'use client';
import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import type { Baby } from '@prisma/client';

interface BabyContextType {
  activeBaby: Baby | null;
  setActiveBaby: (baby: Baby) => void;
  babies: Baby[];
  setBabies: (babies: Baby[]) => void;
}

const BabyContext = createContext<BabyContextType | undefined>(undefined);

export function BabyProvider({ children, initialBabies }: { children: ReactNode; initialBabies: Baby[] }) {
  const [babies, setBabies] = useState<Baby[]>(initialBabies);
  const [activeBaby, setActiveBabyState] = useState<Baby | null>(null);

  useEffect(() => {
    if (babies.length > 0 && !activeBaby) {
      const savedId = typeof window !== 'undefined' ? localStorage.getItem('active-baby-id') : null;
      const saved = savedId ? babies.find((b) => b.id === savedId) : null;
      setActiveBabyState(saved || babies[0]);
    }
  }, [babies, activeBaby]);

  const setActiveBaby = useCallback((baby: Baby) => {
    setActiveBabyState(baby);
    if (typeof window !== 'undefined') {
      localStorage.setItem('active-baby-id', baby.id);
    }
  }, []);

  return (
    <BabyContext.Provider value={{ activeBaby, setActiveBaby, babies, setBabies }}>
      {children}
    </BabyContext.Provider>
  );
}

export function useBaby() {
  const context = useContext(BabyContext);
  if (!context) throw new Error('useBaby must be used within BabyProvider');
  return context;
}
