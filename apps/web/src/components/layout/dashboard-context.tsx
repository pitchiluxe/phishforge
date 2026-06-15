'use client';
import { createContext, useContext, useState } from 'react';

interface DashboardCtx {
  mobileOpen: boolean;
  openMobile: () => void;
  closeMobile: () => void;
  brainOpen: boolean;
  toggleBrain: () => void;
  closeBrain: () => void;
}

const Ctx = createContext<DashboardCtx>({
  mobileOpen: false, openMobile: () => {}, closeMobile: () => {},
  brainOpen: false, toggleBrain: () => {}, closeBrain: () => {},
});

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [brainOpen, setBrainOpen] = useState(false);
  return (
    <Ctx.Provider value={{
      mobileOpen, openMobile: () => setMobileOpen(true), closeMobile: () => setMobileOpen(false),
      brainOpen, toggleBrain: () => setBrainOpen(b => !b), closeBrain: () => setBrainOpen(false),
    }}>
      {children}
    </Ctx.Provider>
  );
}

export const useDashboard = () => useContext(Ctx);
