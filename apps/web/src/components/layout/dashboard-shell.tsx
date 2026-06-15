'use client';

import { useState } from 'react';
import { Sidebar } from './sidebar';
import { DashboardProvider, useDashboard } from './dashboard-context';
import { CyberBrainPanel } from '@/components/brain/cyber-brain-panel';

function ShellInner({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const { mobileOpen, closeMobile, brainOpen, closeBrain } = useDashboard();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      height: '100vh',
      overflow: 'hidden',
      background: '#080808',
      position: 'relative',
    }}>
      {/* Scanlines overlay */}
      <div
        style={{
          position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 50,
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.12) 2px, rgba(0,0,0,0.12) 4px)',
        }}
        aria-hidden="true"
      />

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={closeMobile}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.75)', zIndex: 39,
            backdropFilter: 'blur(2px)',
          }}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div className={`pf-sidebar-wrapper${mobileOpen ? ' pf-sidebar-open' : ''}`}>
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </div>

      {/* Main content */}
      <main style={{ flex: 1, overflowY: 'auto', minWidth: 0, position: 'relative' }}>
        {children}
      </main>

      {/* CyberBrain — rendered at root level to escape sidebar stacking context */}
      <CyberBrainPanel isOpen={brainOpen} onClose={closeBrain} />

      <style>{`
        .pf-sidebar-wrapper {
          position: relative;
          z-index: 40;
          flex-shrink: 0;
        }
        @media (max-width: 767px) {
          .pf-sidebar-wrapper {
            position: fixed !important;
            top: 0; left: 0; bottom: 0;
            transform: translateX(-100%);
            transition: transform 280ms cubic-bezier(0.4,0,0.2,1);
            z-index: 40;
          }
          .pf-sidebar-wrapper.pf-sidebar-open {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <ShellInner>{children}</ShellInner>
    </DashboardProvider>
  );
}
