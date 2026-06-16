'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Terminal, Loader2, RotateCcw, Search, Network, Shield,
  Database, Bug, FileSearch, Server, ChevronRight, Lightbulb,
  BookOpen, Copy, Check,
} from 'lucide-react';
import toast from 'react-hot-toast';

const MONO = { fontFamily: 'var(--font-fira-code), monospace' } as const;

interface TermEntry {
  type: 'prompt' | 'output' | 'error' | 'lesson' | 'system';
  content: string;
  command?: string;
}

interface PSScenario {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  objective: string;
  context: string;
  hints: string[];
  starterCommands: string[];
}

const SCENARIOS: PSScenario[] = [
  {
    id: 'ad-audit',
    title: 'Active Directory Security Audit',
    icon: Database,
    color: '#60a5fa',
    objective: 'Enumerate domain users, privileged groups, stale accounts, and service accounts with security gaps',
    context: 'You have been tasked with performing a security audit of the CONTOSO.LOCAL Active Directory environment. The CISO suspects over-privileged accounts and stale credentials.',
    hints: ['Check Domain Admins membership', 'Find accounts with password never expires', 'Look for disabled accounts still in security groups', 'Audit service account SPNs'],
    starterCommands: ['Get-ADUser -Filter * -Properties PasswordNeverExpires,LastLogonDate,Enabled', 'Get-ADGroupMember "Domain Admins"', 'Get-ADUser -Filter {Enabled -eq $false} -Properties MemberOf', 'Get-ADServiceAccount -Filter *'],
  },
  {
    id: 'threat-hunting',
    title: 'Threat Hunting — Process & Registry',
    icon: Search,
    color: '#f87171',
    objective: 'Hunt for malware artifacts in running processes, scheduled tasks, registry run keys, and startup locations',
    context: 'An EDR alert flagged unusual PowerShell activity on WIN-WKS04. The host is now isolated. You have a remote session via WinRM. Hunt for persistence mechanisms and lateral movement indicators.',
    hints: ['Check all running processes and their parent PIDs', 'Look for scheduled tasks pointing to temp directories', 'Examine common autorun registry keys', 'Check recently modified files in TEMP and AppData'],
    starterCommands: ['Get-Process | Select-Object Name,Id,Path,Company | Sort-Object Name', 'Get-ScheduledTask | Where-Object {$_.TaskPath -notlike "\\Microsoft\\*"}', 'Get-ItemProperty "HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Run"', 'Get-ChildItem $env:TEMP -Recurse | Where-Object {$_.CreationTime -gt (Get-Date).AddDays(-7)}'],
  },
  {
    id: 'event-log',
    title: 'Event Log Analysis & Threat Hunting',
    icon: FileSearch,
    color: '#facc15',
    objective: 'Analyze Windows Security and System event logs to detect brute force, privilege escalation, and lateral movement',
    context: 'The SOC received alerts about multiple failed logins and a suspicious admin account creation. You need to investigate the event logs on WIN-DC01 to reconstruct the attack timeline.',
    hints: ['4625 = failed logon', '4624 = successful logon', '4672 = special privileges assigned', '4688 = process creation', '7045 = new service installed'],
    starterCommands: ['Get-WinEvent -LogName Security -FilterHashtable @{Id=4625} | Select-Object -First 20', 'Get-WinEvent -LogName Security -FilterHashtable @{Id=4624;StartTime=(Get-Date).AddHours(-24)}', 'Get-WinEvent -LogName Security -FilterHashtable @{Id=4672} | Select-Object -First 15', 'Get-WinEvent -LogName System -FilterHashtable @{Id=7045}'],
  },
  {
    id: 'network-recon',
    title: 'Network Reconnaissance',
    icon: Network,
    color: '#34d399',
    objective: 'Map the network, identify open ports, active connections, and discover lateral movement paths',
    context: 'You are a red team operator (authorized simulation). Perform network reconnaissance from WIN-WKS01 to map internal services, identify attack paths, and find misconfigured exposed services.',
    hints: ['Enumerate active TCP connections', 'Scan common service ports on nearby hosts', 'Resolve internal hostnames', 'Check listening services on this host'],
    starterCommands: ['Get-NetTCPConnection -State Listen | Select-Object LocalPort,OwningProcess | Sort-Object LocalPort', 'Test-NetConnection -ComputerName WIN-DC01 -Port 445', '1..254 | ForEach-Object { Test-Connection -ComputerName "10.0.1.$_" -Count 1 -Quiet }', 'Resolve-DnsName -Name WIN-SRV01.CONTOSO.LOCAL'],
  },
  {
    id: 'dfir',
    title: 'Digital Forensics & Incident Response',
    icon: Shield,
    color: '#fb923c',
    objective: 'Collect forensic artifacts, preserve evidence, identify the attack timeline, and scope the breach',
    context: 'A ransomware variant has been detected on WIN-WKS07. The machine has NOT yet been isolated. You have 10 minutes to collect volatile evidence before imaging. Move fast.',
    hints: ['Capture running processes immediately', 'Document active network connections', 'Collect recent PowerShell history', 'Check recently accessed files and credentials in memory artifacts'],
    starterCommands: ['Get-Process | Select-Object Name,Id,StartTime,Path | Sort-Object StartTime -Descending', 'Get-NetTCPConnection | Where-Object {$_.State -eq "Established"}', 'Get-Content (Get-PSReadlineOption).HistorySavePath | Select-Object -Last 50', 'Get-ChildItem C:\\Users -Recurse -Filter "*.encrypted" | Select-Object -First 20'],
  },
  {
    id: 'defense-hardening',
    title: 'PowerShell Defense & Hardening',
    icon: Server,
    color: '#a78bfa',
    objective: 'Configure PowerShell security controls: ScriptBlock Logging, AMSI, Constrained Language Mode, and execution policy',
    context: 'You are hardening the PowerShell configuration on WIN-DC01 as part of a CIS benchmark implementation. Configure logging, restrict dangerous cmdlets, and verify controls are working.',
    hints: ['Enable ScriptBlock Logging via registry', 'Check current Execution Policy', 'Verify AMSI is active', 'Test Constrained Language Mode'],
    starterCommands: ['Get-ExecutionPolicy -List', '$PSVersionTable', 'Get-ItemProperty "HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\PowerShell\\ScriptBlockLogging"', '[System.Management.Automation.AmsiUtils]::ScanContent("AmsiTest", "AMSI Test Sample")'],
  },
];

const CMD_SUGGESTIONS: Record<string, string[]> = {
  'ad-audit': ['Get-ADUser -Filter * -Properties *', 'Get-ADGroupMember "Domain Admins" -Recursive', 'Search-ADAccount -PasswordNeverExpires', 'Get-ADComputer -Filter * -Properties LastLogonDate', 'Get-ADObject -Filter {ObjectClass -eq "trustedDomain"}'],
  'threat-hunting': ['Get-CimInstance Win32_Process | Select-Object Name,ParentProcessId,CommandLine', 'Get-WmiObject Win32_StartupCommand', 'reg query HKLM\\System\\CurrentControlSet\\Services /s | findstr /i "imagepath"', 'Get-ChildItem -Path C:\\Users -Recurse -Filter "*.ps1" -ErrorAction SilentlyContinue'],
  'event-log': ['Get-EventLog -LogName Security -EntryType FailureAudit -Newest 50', 'Get-WinEvent -FilterHashtable @{LogName="Security";Id=4648}', '(Get-WinEvent -ListLog Security).RecordCount', 'Get-WinEvent -LogName "Microsoft-Windows-PowerShell/Operational" | Select-Object -First 20'],
  'network-recon': ['Get-NetAdapter | Select-Object Name,Status,LinkSpeed', 'Get-NetIPAddress | Where-Object {$_.AddressFamily -eq "IPv4"}', 'Get-DnsClientServerAddress', 'netstat -anob | Select-String "ESTABLISHED"'],
  'dfir': ['Get-Process | Where-Object {$_.Path -like "*Temp*" -or $_.Path -like "*AppData*"}', 'Get-WmiObject Win32_NetworkConnection', 'Copy-Item C:\\Windows\\System32\\winevt\\Logs -Recurse -Destination D:\\Evidence\\', 'systeminfo | Out-File D:\\Evidence\\systeminfo.txt'],
  'defense-hardening': ['Set-ExecutionPolicy RemoteSigned -Scope LocalMachine', 'Enable-WindowsOptionalFeature -Online -FeatureName MicrosoftWindowsPowerShell', 'Set-ItemProperty "HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\PowerShell\\ScriptBlockLogging" -Name EnableScriptBlockLogging -Value 1', '$ExecutionContext.SessionState.LanguageMode'],
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', color: copied ? '#00ff41' : 'rgba(0,255,65,0.3)', transition: 'color 150ms' }}
      title="Copy command"
    >
      {copied ? <Check size={10} /> : <Copy size={10} />}
    </button>
  );
}

export function PowerShellTerminal() {
  const [scenario, setScenario] = useState<PSScenario | null>(null);
  const [entries, setEntries] = useState<TermEntry[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<{ role: string; content: string }[]>([]);
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries, loading]);

  function selectScenario(s: PSScenario) {
    setScenario(s);
    setEntries([
      { type: 'system', content: `Windows PowerShell 7.4.0\nCopyright (C) Microsoft Corporation. All rights reserved.\n\nTry the new cross-platform PowerShell https://aka.ms/pscore6` },
      { type: 'system', content: `// SCENARIO: ${s.title}\n// ${s.objective}\n\n${s.context}` },
    ]);
    setHistory([]);
    setCmdHistory([]);
    setHistoryIdx(-1);
  }

  async function runCommand(cmd?: string) {
    const command = (cmd ?? input).trim();
    if (!command || loading || !scenario) return;
    setInput('');
    setHistoryIdx(-1);
    setCmdHistory(prev => [command, ...prev.slice(0, 49)]);

    setEntries(prev => [...prev, { type: 'prompt', content: command, command }]);
    setLoading(true);

    try {
      const res = await fetch('/api/powershell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command,
          history,
          scenario: scenario.title,
          scenarioContext: `Objective: ${scenario.objective}\nContext: ${scenario.context}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const newEntries: TermEntry[] = [];
      if (data.output) newEntries.push({ type: 'output', content: data.output });
      if (data.lesson) newEntries.push({ type: 'lesson', content: data.lesson });
      setEntries(prev => [...prev, ...newEntries]);

      setHistory(prev => [
        ...prev,
        { role: 'user', content: `PS C:\\Users\\SecAnalyst> ${command}` },
        { role: 'assistant', content: `<output>${data.output}</output><lesson>${data.lesson}</lesson>` },
      ]);
    } catch (e: any) {
      setEntries(prev => [...prev, { type: 'error', content: `Error: ${e.message}` }]);
      toast.error(e.message);
    } finally { setLoading(false); inputRef.current?.focus(); }
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') { runCommand(); return; }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const idx = historyIdx + 1;
      if (idx < cmdHistory.length) { setHistoryIdx(idx); setInput(cmdHistory[idx]); }
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const idx = historyIdx - 1;
      if (idx < 0) { setHistoryIdx(-1); setInput(''); }
      else { setHistoryIdx(idx); setInput(cmdHistory[idx]); }
    }
  }

  function resetTerminal() {
    setScenario(null);
    setEntries([]);
    setHistory([]);
    setCmdHistory([]);
    setInput('');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <AnimatePresence mode="wait">
        {/* ── Scenario selector ── */}
        {!scenario && (
          <motion.div key="select" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ padding: '14px 18px', background: 'rgba(96,165,250,0.05)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                <Terminal size={16} style={{ color: '#60a5fa' }} />
                <div>
                  <div style={{ ...MONO, fontSize: 12, fontWeight: 700, color: '#60a5fa' }}>Virtual PowerShell Terminal</div>
                  <div style={{ ...MONO, fontSize: 10, color: '#60a5fa', opacity: 0.55, marginTop: 2 }}>AI-simulated Windows Server environment — type real PS commands, get real output + coaching</div>
                </div>
              </div>

              <div style={{ ...MONO, fontSize: 9, color: '#00ff41', opacity: 0.4, textTransform: 'uppercase', letterSpacing: '0.12em' }}>// Choose a Training Scenario</div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                {SCENARIOS.map(s => {
                  const Icon = s.icon;
                  return (
                    <button
                      key={s.id}
                      onClick={() => selectScenario(s)}
                      style={{ padding: '16px', background: 'rgba(0,255,65,0.02)', border: `1px solid ${s.color}20`, borderRadius: 9, cursor: 'pointer', textAlign: 'left', transition: 'all 150ms' }}
                      onMouseEnter={e => { e.currentTarget.style.background = `${s.color}08`; e.currentTarget.style.borderColor = `${s.color}40`; e.currentTarget.style.boxShadow = `0 0 14px ${s.color}15`; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,255,65,0.02)'; e.currentTarget.style.borderColor = `${s.color}20`; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <Icon size={14} style={{ color: s.color }} />
                        <span style={{ ...MONO, fontSize: 11, fontWeight: 700, color: s.color }}>{s.title}</span>
                      </div>
                      <div style={{ ...MONO, fontSize: 10, color: '#94a3b8', lineHeight: 1.55 }}>{s.objective}</div>
                      <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 5, ...MONO, fontSize: 9, color: '#00ff41', opacity: 0.4 }}>
                        <ChevronRight size={9} />Launch Terminal
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Terminal ── */}
        {scenario && (
          <motion.div key="terminal" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>

              {/* Main terminal panel */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Terminal header bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', background: '#1a1a2e', borderRadius: '8px 8px 0 0', border: '1px solid rgba(96,165,250,0.2)', borderBottom: 'none' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f87171' }} />
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#facc15' }} />
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#00ff41' }} />
                  </div>
                  <span style={{ ...MONO, fontSize: 10, color: '#60a5fa', opacity: 0.7 }}>Windows PowerShell — {scenario.title}</span>
                  <button onClick={resetTerminal} style={{ ...MONO, fontSize: 9, color: '#475569', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <RotateCcw size={9} /> Exit
                  </button>
                </div>

                {/* Terminal body */}
                <div
                  onClick={() => inputRef.current?.focus()}
                  style={{ background: '#0c0c0c', border: '1px solid rgba(96,165,250,0.2)', borderTop: 'none', borderRadius: '0 0 8px 8px', padding: '16px', minHeight: 380, maxHeight: 560, overflowY: 'auto', cursor: 'text' }}
                >
                  {entries.map((entry, i) => {
                    if (entry.type === 'system') return (
                      <pre key={i} style={{ ...MONO, fontSize: 11, color: '#94a3b8', margin: '0 0 14px', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{entry.content}</pre>
                    );
                    if (entry.type === 'prompt') return (
                      <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 0, margin: '8px 0 2px' }}>
                        <span style={{ ...MONO, fontSize: 11, color: '#60a5fa', whiteSpace: 'nowrap' }}>PS C:\Users\SecAnalyst{'>'} </span>
                        <span style={{ ...MONO, fontSize: 11, color: '#ffffff' }}>{entry.content}</span>
                        <CopyButton text={entry.content} />
                      </div>
                    );
                    if (entry.type === 'output') return (
                      <pre key={i} style={{ ...MONO, fontSize: 11, color: '#d1d5db', margin: '2px 0 8px', whiteSpace: 'pre-wrap', lineHeight: 1.55 }}>{entry.content}</pre>
                    );
                    if (entry.type === 'error') return (
                      <pre key={i} style={{ ...MONO, fontSize: 11, color: '#f87171', margin: '2px 0 8px', whiteSpace: 'pre-wrap' }}>{entry.content}</pre>
                    );
                    if (entry.type === 'lesson') return (
                      <div key={i} style={{ margin: '4px 0 12px', padding: '8px 12px', background: 'rgba(250,204,21,0.05)', borderLeft: '2px solid rgba(250,204,21,0.4)', borderRadius: '0 4px 4px 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                          <Lightbulb size={9} style={{ color: '#facc15' }} />
                          <span style={{ ...MONO, fontSize: 9, color: '#facc15', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Coach</span>
                        </div>
                        <p style={{ ...MONO, fontSize: 10, color: '#facc15', opacity: 0.8, margin: 0, lineHeight: 1.6 }}>{entry.content}</p>
                      </div>
                    );
                    return null;
                  })}

                  {loading && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '4px 0' }}>
                      <Loader2 size={11} style={{ color: '#60a5fa', animation: 'spin 1s linear infinite' }} />
                      <span style={{ ...MONO, fontSize: 11, color: '#475569' }}>Executing...</span>
                    </div>
                  )}

                  {/* Active input line */}
                  <div style={{ display: 'flex', alignItems: 'center', marginTop: 8 }}>
                    <span style={{ ...MONO, fontSize: 11, color: '#60a5fa', whiteSpace: 'nowrap' }}>PS C:\Users\SecAnalyst{'>'} </span>
                    <input
                      ref={inputRef}
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={handleKey}
                      disabled={loading}
                      autoFocus
                      spellCheck={false}
                      autoCorrect="off"
                      autoCapitalize="off"
                      style={{ flex: 1, background: 'none', border: 'none', outline: 'none', ...MONO, fontSize: 11, color: '#ffffff', caretColor: '#60a5fa', marginLeft: 4 }}
                      placeholder={loading ? '' : 'Type a PowerShell command...'}
                    />
                  </div>
                  <div ref={bottomRef} />
                </div>
              </div>

              {/* Sidebar */}
              <div style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Objective */}
                <div style={{ padding: '12px 14px', background: `${scenario.color}08`, border: `1px solid ${scenario.color}20`, borderRadius: 8 }}>
                  <div style={{ ...MONO, fontSize: 9, color: scenario.color, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                    <BookOpen size={9} style={{ display: 'inline', marginRight: 4 }} />Objective
                  </div>
                  <p style={{ ...MONO, fontSize: 10, color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>{scenario.objective}</p>
                </div>

                {/* Hints */}
                <div style={{ padding: '12px 14px', background: 'rgba(250,204,21,0.03)', border: '1px solid rgba(250,204,21,0.12)', borderRadius: 8 }}>
                  <div style={{ ...MONO, fontSize: 9, color: '#facc15', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                    <Lightbulb size={9} style={{ display: 'inline', marginRight: 4 }} />Investigation Hints
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {scenario.hints.map((hint, i) => (
                      <div key={i} style={{ ...MONO, fontSize: 10, color: '#facc15', opacity: 0.6, lineHeight: 1.5 }}>• {hint}</div>
                    ))}
                  </div>
                </div>

                {/* Starter commands */}
                <div style={{ padding: '12px 14px', background: 'rgba(96,165,250,0.03)', border: '1px solid rgba(96,165,250,0.12)', borderRadius: 8 }}>
                  <div style={{ ...MONO, fontSize: 9, color: '#60a5fa', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Quick Commands</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {scenario.starterCommands.map((cmd, i) => (
                      <button
                        key={i}
                        onClick={() => runCommand(cmd)}
                        disabled={loading}
                        style={{ ...MONO, fontSize: 9, color: '#60a5fa', background: 'rgba(96,165,250,0.05)', border: '1px solid rgba(96,165,250,0.15)', borderRadius: 4, padding: '5px 8px', cursor: 'pointer', textAlign: 'left', lineHeight: 1.4, transition: 'all 150ms', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(96,165,250,0.12)'; e.currentTarget.style.borderColor = 'rgba(96,165,250,0.3)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(96,165,250,0.05)'; e.currentTarget.style.borderColor = 'rgba(96,165,250,0.15)'; }}
                        title={cmd}
                      >
                        {cmd.length > 38 ? cmd.slice(0, 38) + '…' : cmd}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Extra commands */}
                {CMD_SUGGESTIONS[scenario.id]?.length > 0 && (
                  <div style={{ padding: '12px 14px', background: 'rgba(0,255,65,0.02)', border: '1px solid rgba(0,255,65,0.1)', borderRadius: 8 }}>
                    <div style={{ ...MONO, fontSize: 9, color: '#00ff41', opacity: 0.4, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>More Commands</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {CMD_SUGGESTIONS[scenario.id].map((cmd, i) => (
                        <button
                          key={i}
                          onClick={() => { setInput(cmd); inputRef.current?.focus(); }}
                          disabled={loading}
                          style={{ ...MONO, fontSize: 9, color: 'rgba(0,255,65,0.5)', background: 'none', border: '1px solid rgba(0,255,65,0.08)', borderRadius: 4, padding: '4px 8px', cursor: 'pointer', textAlign: 'left', lineHeight: 1.4, transition: 'all 150ms', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                          onMouseEnter={e => { e.currentTarget.style.color = '#00ff41'; e.currentTarget.style.borderColor = 'rgba(0,255,65,0.2)'; }}
                          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(0,255,65,0.5)'; e.currentTarget.style.borderColor = 'rgba(0,255,65,0.08)'; }}
                          title={`Insert: ${cmd}`}
                        >
                          {cmd.length > 38 ? cmd.slice(0, 38) + '…' : cmd}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ ...MONO, fontSize: 9, color: '#00ff41', opacity: 0.2, textAlign: 'center' }}>↑↓ Arrow keys for history</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
