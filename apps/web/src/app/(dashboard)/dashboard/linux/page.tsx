'use client';

import { Terminal } from 'lucide-react';
import { LinuxTerminal } from '@/components/training/linux-terminal';

const MONO = { fontFamily: 'var(--font-fira-code), monospace' } as const;

export default function LinuxPage() {
  return (
    <div className="flex-1 overflow-auto bg-[#080f1e]">

      {/* ── Header ── */}
      <div className="sticky top-0 z-20 bg-[#080f1e]/95 backdrop-blur-xl border-b border-white/5">
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #0a1a0a, #052905)', boxShadow: '0 0 18px rgba(0,255,65,0.25)', border: '1px solid rgba(0,255,65,0.3)' }}>
              <Terminal className="w-5 h-5" style={{ color: '#00ff41', filter: 'drop-shadow(0 0 6px rgba(0,255,65,0.7))' }} />
            </div>
            <div>
              <h1 className="text-xl font-black text-white flex items-center gap-2">
                Linux
                <span style={{ ...MONO, fontSize: 9, fontWeight: 700, color: '#00ff41', background: 'rgba(0,255,65,0.1)', border: '1px solid rgba(0,255,65,0.3)', borderRadius: 4, padding: '2px 6px', letterSpacing: '0.06em' }}>
                  TERMINAL DOJO
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                Master the Linux terminal hands-on — Terminal Mastery + Linux Basics for Hackers, with a live AI tutor on every command
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="px-6 py-6">
        <LinuxTerminal />
      </div>
    </div>
  );
}
