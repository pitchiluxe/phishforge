'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { TrainingSimulator } from '@/components/training/training-simulator';
import { LabSimulator } from '@/components/training/lab-simulator';
import { InterviewSimulator } from '@/components/training/interview-simulator';
import { PowerShellTerminal } from '@/components/training/powershell-terminal';
import { Target, FlaskConical, Briefcase, Terminal } from 'lucide-react';

const MONO = { fontFamily: 'var(--font-fira-code), monospace' } as const;

const TABS = [
  { id: 'scenarios',  label: 'Scenarios',  icon: Target,       desc: 'Interactive attack simulations — AI plays the attacker, you respond' },
  { id: 'lab',        label: 'Lab',        icon: FlaskConical,  desc: 'Hands-on labs — AI instructor guides you step by step through real-world exercises' },
  { id: 'interview',  label: 'Interview',  icon: Briefcase,     desc: 'AI mock interviews — prepare for your next cybersecurity job with realistic practice and coaching' },
  { id: 'powershell', label: 'PowerShell', icon: Terminal,      desc: 'Virtual PowerShell terminal — learn security-focused PS commands in an AI-simulated Windows environment' },
] as const;

type TabId = typeof TABS[number]['id'];

export default function TrainingPage() {
  const [activeTab, setActiveTab] = useState<TabId>('scenarios');
  const tab = TABS.find(t => t.id === activeTab)!;

  return (
    <div className="animate-in">
      <Header
        title="AI Training"
        subtitle={tab.desc}
      />
      <div style={{ padding: '0 24px 24px' }}>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderBottom: '1px solid rgba(0,255,65,0.1)', paddingTop: 16 }}>
          {TABS.map(t => {
            const active = t.id === activeTab;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '8px 20px', marginBottom: -1,
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  borderBottom: active ? '2px solid #00ff41' : '2px solid transparent',
                  ...MONO, fontSize: 12, fontWeight: active ? 700 : 400,
                  color: active ? '#00ff41' : 'rgba(0,255,65,0.4)',
                  transition: 'all 150ms',
                  letterSpacing: '0.03em',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'rgba(0,255,65,0.8)'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'rgba(0,255,65,0.4)'; }}
              >
                <Icon size={13} />
                {t.label}
                {(t.id === 'interview' || t.id === 'powershell') && (
                  <span style={{ ...MONO, fontSize: 8, color: t.id === 'powershell' ? '#60a5fa' : '#a78bfa', background: t.id === 'powershell' ? 'rgba(96,165,250,0.12)' : 'rgba(167,139,250,0.12)', border: `1px solid ${t.id === 'powershell' ? 'rgba(96,165,250,0.3)' : 'rgba(167,139,250,0.3)'}`, borderRadius: 3, padding: '1px 5px', fontWeight: 700 }}>
                    NEW
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        {activeTab === 'scenarios'  && <TrainingSimulator />}
        {activeTab === 'lab'        && <LabSimulator />}
        {activeTab === 'interview'  && <InterviewSimulator />}
        {activeTab === 'powershell' && <PowerShellTerminal />}
      </div>
    </div>
  );
}
