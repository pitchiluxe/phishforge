'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Terminal, Loader2, RotateCcw, ChevronRight, Lightbulb, BookOpen,
  Copy, Check, FolderTree, FileText, Lock, Cog, Network, GitBranch,
  Package, Search, Shield, Wifi, Skull, Feather, KeyRound, HardDrive,
  ScrollText, GraduationCap, Sparkles, Wand2, RefreshCw, Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { addTokenUsage } from '@/hooks/use-ai-usage';
import { LinuxSetupVideos } from './linux-setup-videos';

const MONO = { fontFamily: 'var(--font-fira-code), monospace' } as const;

// ─── Types ─────────────────────────────────────────────────────────────────────

interface TermEntry {
  type: 'prompt' | 'output' | 'error' | 'lesson' | 'system';
  content: string;
  command?: string;
}

type Track = 'Terminal Mastery' | 'Linux Basics for Hackers';
type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

interface LinuxLab {
  id: string;
  track: Track | 'AI Generated';
  chapter: number;
  title: string;
  icon: React.ElementType;
  color: string;
  difficulty: Difficulty;
  objective: string;
  context: string;
  hints: string[];
  starterCommands: string[];
  isAI?: boolean;
}

// ─── Course content ─────────────────────────────────────────────────────────────
// Two tracks, each an ordered set of hands-on terminal labs. The AI tutor coaches
// the learner on every command so nobody gets lost.

const LABS: LinuxLab[] = [
  // ═══════════════ TRACK 1 — TERMINAL MASTERY (fundamentals) ═══════════════
  {
    id: 'tm-navigation',
    track: 'Terminal Mastery',
    chapter: 1,
    title: 'Navigating the Filesystem',
    icon: FolderTree,
    color: '#00ff41',
    difficulty: 'Beginner',
    objective: 'Move around the Linux filesystem with pwd, ls, cd, and understand absolute vs relative paths.',
    context: 'You just opened a fresh shell. Your goal: explore your home directory, list hidden files, and navigate into subdirectories without getting lost.',
    hints: ['pwd prints your current location', 'ls -la shows hidden files + permissions', 'cd .. goes up one level', 'cd with no argument returns home'],
    starterCommands: ['pwd', 'ls -la', 'cd Documents && ls', 'cd .. && pwd'],
  },
  {
    id: 'tm-files',
    track: 'Terminal Mastery',
    chapter: 2,
    title: 'Creating & Reading Files',
    icon: FileText,
    color: '#00ff41',
    difficulty: 'Beginner',
    objective: 'Create directories and files with mkdir and touch, then read them with cat, less, head, and tail.',
    context: 'Build a small project folder: make nested directories, create empty files, write text into them, and read the contents back.',
    hints: ['mkdir -p makes nested dirs', 'touch creates an empty file', 'echo text > file writes content', 'cat, less, head, and tail read files'],
    starterCommands: ['mkdir -p project/src', 'touch project/src/main.sh', 'echo "hello" > project/notes.txt', 'cat project/notes.txt'],
  },
  {
    id: 'tm-move-rename-delete',
    track: 'Terminal Mastery',
    chapter: 3,
    title: 'Moving, Renaming, Copying & Deleting Files',
    icon: Trash2,
    color: '#f97316',
    difficulty: 'Beginner',
    objective: 'Copy with cp, move and rename with mv, and delete safely with rm, rmdir — understanding recursive and force flags.',
    context: 'Reorganize a messy loot/ directory: copy files, rename them into a clean scheme, move them into subfolders, then delete the leftovers. rm has no undo, so learn to wield it carefully.',
    hints: ['cp -r copies directories recursively', 'mv old new renames; mv file dir/ moves it', 'rm deletes files, rm -r deletes directories', 'rmdir removes empty dirs; rm -i asks before each delete', 'Wildcards: mv *.txt notes/ moves all .txt files'],
    starterCommands: ['cp notes.txt loot/backup.txt', 'mv loot/backup.txt loot/creds.txt', 'mkdir loot/archive && mv loot/*.txt loot/archive/', 'rm -i loot/archive/creds.txt'],
  },
  {
    id: 'tm-permissions',
    track: 'Terminal Mastery',
    chapter: 4,
    title: 'File Permissions & Ownership',
    icon: Lock,
    color: '#facc15',
    difficulty: 'Beginner',
    objective: 'Read rwx permission strings and change them with chmod (symbolic + octal) and chown.',
    context: 'A script you wrote will not run. Inspect its permissions, understand the -rwxr-xr-x notation, and make it executable.',
    hints: ['ls -l shows the permission string', 'chmod +x adds execute', 'Octal: r=4 w=2 x=1 (755 = rwxr-xr-x)', 'chown user:group changes ownership'],
    starterCommands: ['ls -l scripts/', 'chmod +x scripts/scan.sh', 'chmod 640 notes.txt', 'ls -l notes.txt'],
  },
  {
    id: 'tm-pipes-grep',
    track: 'Terminal Mastery',
    chapter: 5,
    title: 'Pipes, Redirection & grep',
    icon: Search,
    color: '#34d399',
    difficulty: 'Intermediate',
    objective: 'Chain commands with pipes, redirect output to files, and filter text with grep.',
    context: 'targets.txt holds a messy list of hosts. Use pipes and grep to extract only the lines you care about and save the result.',
    hints: ['| sends stdout to the next command', '> overwrites, >> appends to a file', 'grep -i is case-insensitive, -v inverts', 'grep -E enables regex'],
    starterCommands: ['cat targets.txt | grep 10.10', 'grep -c "up" scan.log', 'grep -Ei "admin|root" users.txt > loot/hits.txt', 'wc -l targets.txt'],
  },
  {
    id: 'tm-textproc',
    track: 'Terminal Mastery',
    chapter: 6,
    title: 'Text Processing — sed, awk, cut, sort',
    icon: ScrollText,
    color: '#a78bfa',
    difficulty: 'Intermediate',
    objective: 'Slice and reshape text streams with cut, sort, uniq, sed, and awk.',
    context: 'You captured a log file. Extract specific columns, sort and de-duplicate entries, and rewrite fields on the fly.',
    hints: ['cut -d: -f1 splits on a delimiter', 'sort | uniq -c counts duplicates', "awk '{print $1}' prints column 1", "sed 's/old/new/g' substitutes text"],
    starterCommands: ["awk -F: '{print $1}' /etc/passwd", 'cut -d" " -f1 access.log | sort | uniq -c', "sed 's/http:/https:/g' urls.txt", 'sort -u targets.txt'],
  },
  {
    id: 'tm-processes',
    track: 'Terminal Mastery',
    chapter: 7,
    title: 'Processes & Job Control',
    icon: Cog,
    color: '#fb923c',
    difficulty: 'Intermediate',
    objective: 'Inspect running processes with ps/top, background and foreground jobs, and kill runaway processes.',
    context: 'Something is eating CPU. Find the process, understand PID vs PPID, and terminate it cleanly.',
    hints: ['ps aux lists every process', 'top / htop show live usage', 'kill -9 PID force-kills', 'command & runs in background, jobs lists them'],
    starterCommands: ['ps aux --sort=-%cpu | head', 'ps -ef | grep python', 'kill -15 1337', 'jobs'],
  },
  {
    id: 'tm-networking',
    track: 'Terminal Mastery',
    chapter: 8,
    title: 'Networking from the Terminal',
    icon: Network,
    color: '#60a5fa',
    difficulty: 'Intermediate',
    objective: 'Check interfaces, test connectivity, inspect open sockets, and fetch data with curl/wget.',
    context: 'Map your own machine: list IP addresses, see which ports are listening, and pull a page from a lab web server.',
    hints: ['ip a shows interfaces & IPs', 'ss -tulpn lists listening sockets', 'ping -c 4 tests reachability', 'curl -I fetches HTTP headers only'],
    starterCommands: ['ip a', 'ss -tulpn', 'ping -c 4 10.10.10.5', 'curl -I http://10.10.10.5'],
  },
  {
    id: 'tm-bash-scripting',
    track: 'Terminal Mastery',
    chapter: 9,
    title: 'Bash Scripting Basics',
    icon: GitBranch,
    color: '#4ade80',
    difficulty: 'Advanced',
    objective: 'Write your first bash scripts: variables, loops, conditionals, and the shebang line.',
    context: 'Automate a repetitive task. Build a small script that loops over a list and prints a message for each item.',
    hints: ['#!/bin/bash is the shebang', 'for i in $(cat list); do ... done', 'if [ -f file ]; then ... fi', 'chmod +x then ./script.sh to run'],
    starterCommands: ['echo \'#!/bin/bash\' > ping.sh', 'for ip in 1 2 3; do echo "host $ip"; done', 'chmod +x ping.sh', './ping.sh'],
  },

  // ═══════════════ TRACK 2 — LINUX BASICS FOR HACKERS ═══════════════
  {
    id: 'lbfh-01-basics',
    track: 'Linux Basics for Hackers',
    chapter: 1,
    title: 'Getting Started with the Basics',
    icon: Terminal,
    color: '#00ff41',
    difficulty: 'Beginner',
    objective: 'Learn the core hacker terminal commands: pwd, whoami, ls, cd, and getting help with man/--help.',
    context: 'Welcome to Kali. Every engagement starts at the terminal. Orient yourself: who are you, where are you, and what tools do you have?',
    hints: ['whoami confirms your user', 'man <cmd> opens the manual', '<cmd> --help gives quick usage', 'which <tool> shows if a tool is installed'],
    starterCommands: ['whoami', 'which nmap', 'man ls', 'ls --help'],
  },
  {
    id: 'lbfh-02-textman',
    track: 'Linux Basics for Hackers',
    chapter: 2,
    title: 'Text Manipulation',
    icon: FileText,
    color: '#34d399',
    difficulty: 'Beginner',
    objective: 'Pull intelligence out of files using cat, head, tail, grep, sed, and the pipe.',
    context: 'You obtained a config file from a recon step. Extract the interesting lines — usernames, IPs, and comments — without opening an editor.',
    hints: ['head -n 20 shows the top of a file', 'tail -f follows a live log', 'grep filters lines', "sed can delete or replace lines"],
    starterCommands: ['cat /etc/hosts', 'grep -i password config.conf', 'tail -n 5 /var/log/syslog', "sed -n '10,20p' config.conf"],
  },
  {
    id: 'lbfh-03-networks',
    track: 'Linux Basics for Hackers',
    chapter: 3,
    title: 'Analyzing & Managing Networks',
    icon: Network,
    color: '#60a5fa',
    difficulty: 'Intermediate',
    objective: 'Analyze networks with ip/ifconfig, change your DNS, spoof a MAC address, and scan with nmap.',
    context: 'Before attacking a network you must understand it. Enumerate your interfaces, look at routes, and run a quick discovery scan against the lab range.',
    hints: ['ip a / ifconfig show interfaces', 'ip route shows the gateway', 'nmap -sn does host discovery', 'macchanger spoofs your MAC'],
    starterCommands: ['ifconfig', 'ip route', 'nmap -sn 10.10.10.0/24', 'nmap -sV 10.10.10.5'],
  },
  {
    id: 'lbfh-04-software',
    track: 'Linux Basics for Hackers',
    chapter: 4,
    title: 'Adding & Removing Software',
    icon: Package,
    color: '#38bdf8',
    difficulty: 'Beginner',
    objective: 'Manage packages with apt: search, install, update, remove — and understand repositories.',
    context: 'Your target needs a tool you do not have yet. Practice the apt workflow to search for, install, and update software safely.',
    hints: ['apt update refreshes the package list', 'apt search <name> finds packages', 'apt install <name> installs', 'apt remove / purge uninstalls'],
    starterCommands: ['apt update', 'apt search gobuster', 'sudo apt install seclists', 'apt list --installed | grep nmap'],
  },
  {
    id: 'lbfh-05-permissions',
    track: 'Linux Basics for Hackers',
    chapter: 5,
    title: 'Controlling File & Directory Permissions',
    icon: Lock,
    color: '#facc15',
    difficulty: 'Intermediate',
    objective: 'Master chmod, chown, umask, and SUID bits — the foundation of Linux privilege escalation.',
    context: 'Privilege escalation often hinges on permissions. Learn to read and set them, and to hunt for dangerous SUID binaries.',
    hints: ['SUID bit shows as s in ls -l', 'find / -perm -4000 hunts SUID files', 'umask sets default permissions', 'chmod u+s sets SUID'],
    starterCommands: ['ls -l /usr/bin/passwd', 'find / -perm -4000 -type f 2>/dev/null', 'umask', 'chmod 700 loot/'],
  },
  {
    id: 'lbfh-06-processes',
    track: 'Linux Basics for Hackers',
    chapter: 6,
    title: 'Process Management',
    icon: Cog,
    color: '#fb923c',
    difficulty: 'Intermediate',
    objective: 'Find, prioritize, background, schedule, and kill processes — including hunting suspicious ones.',
    context: 'A compromised host is running an implant. Enumerate processes, spot the odd one out, adjust its priority, and terminate it.',
    hints: ['ps aux / top list processes', 'nice / renice change priority', 'nohup ... & keeps a process alive', 'kill and pkill terminate by PID/name'],
    starterCommands: ['ps aux | grep -v "\\[" | head', 'top -b -n1 | head -15', 'pkill -f miner', 'renice 19 -p 2048'],
  },
  {
    id: 'lbfh-07-env',
    track: 'Linux Basics for Hackers',
    chapter: 7,
    title: 'Managing Environment Variables',
    icon: KeyRound,
    color: '#a78bfa',
    difficulty: 'Intermediate',
    objective: 'View and change environment variables, tune the PATH, and understand why it matters for exploitation.',
    context: 'The PATH variable controls which binaries run. Inspect your environment, export a variable, and see how PATH hijacking becomes possible.',
    hints: ['env / printenv list variables', 'echo $PATH shows the search path', 'export VAR=value sets one', 'A writable dir early in PATH is dangerous'],
    starterCommands: ['env | head', 'echo $PATH', 'export TARGET=10.10.10.5', 'echo $TARGET'],
  },
  {
    id: 'lbfh-08-bash',
    track: 'Linux Basics for Hackers',
    chapter: 8,
    title: 'Bash Scripting for Hackers',
    icon: GitBranch,
    color: '#4ade80',
    difficulty: 'Advanced',
    objective: 'Build a working bash tool: variables, user input, loops, and conditionals — e.g. a simple port scanner.',
    context: 'Turn manual steps into a reusable tool. Draft a bash script that loops over ports and reports which are open, the way real recon scripts do.',
    hints: ['read -p prompts for input', 'for port in {1..1000}; do ... done', '/dev/tcp lets bash test ports', 'Redirect 2>/dev/null to hide errors'],
    starterCommands: ["echo '#!/bin/bash' > scanner.sh", 'for p in 22 80 443; do echo "check $p"; done', 'chmod +x scanner.sh', './scanner.sh 10.10.10.5'],
  },
  {
    id: 'lbfh-09-compression',
    track: 'Linux Basics for Hackers',
    chapter: 9,
    title: 'Compression & Archiving',
    icon: HardDrive,
    color: '#22d3ee',
    difficulty: 'Intermediate',
    objective: 'Bundle and compress data with tar, gzip, and bzip2 — key for exfiltrating loot efficiently.',
    context: 'You have gathered files to take with you. Archive the loot directory, compress it, and verify the archive contents.',
    hints: ['tar -cvf makes an archive', 'tar -czvf adds gzip compression', 'tar -tvf lists contents', 'gzip / gunzip compress single files'],
    starterCommands: ['tar -czvf loot.tar.gz loot/', 'tar -tvf loot.tar.gz', 'gzip notes.txt', 'du -h loot.tar.gz'],
  },
  {
    id: 'lbfh-10-logging',
    track: 'Linux Basics for Hackers',
    chapter: 10,
    title: 'Filesystems, Storage & Logging',
    icon: ScrollText,
    color: '#f472b6',
    difficulty: 'Advanced',
    objective: 'Inspect mounted devices, disk usage, and system logs — and understand log tampering as defenders see it.',
    context: 'Understand where the system records activity. Look at mounted filesystems, check disk space, and read the auth log to see what gets logged.',
    hints: ['df -h shows disk usage', 'mount / lsblk list devices', '/var/log/ holds system logs', 'journalctl reads systemd logs'],
    starterCommands: ['df -h', 'lsblk', 'tail -n 20 /var/log/auth.log', 'journalctl -u ssh --no-pager | tail'],
  },
  {
    id: 'lbfh-11-services',
    track: 'Linux Basics for Hackers',
    chapter: 11,
    title: 'Using & Abusing Services',
    icon: Shield,
    color: '#818cf8',
    difficulty: 'Advanced',
    objective: 'Start, stop, and enable services with systemctl — including SSH, Apache, and MySQL for lab work.',
    context: 'Attackers often need to spin up services (a web server to host a payload, SSH for persistence). Learn to control services and check their status.',
    hints: ['systemctl status <svc>', 'systemctl start/stop <svc>', 'systemctl enable persists across reboot', 'ss -tulpn confirms a service is listening'],
    starterCommands: ['systemctl status ssh', 'sudo systemctl start apache2', 'systemctl list-units --type=service --state=running | head', 'ss -tulpn | grep :80'],
  },
  {
    id: 'lbfh-12-wireless',
    track: 'Linux Basics for Hackers',
    chapter: 12,
    title: 'Wireless Networking',
    icon: Wifi,
    color: '#34d399',
    difficulty: 'Advanced',
    objective: 'Enumerate wireless interfaces, scan for networks, and understand monitor mode (lab-only, authorized).',
    context: 'In an authorized wireless assessment you must first understand your adapter. Enumerate wireless interfaces and scan for nearby lab access points.',
    hints: ['iwconfig lists wireless interfaces', 'airmon-ng enables monitor mode', 'iw dev scan finds networks', 'Only ever test networks you own/are authorized for'],
    starterCommands: ['iwconfig', 'sudo airmon-ng start wlan0', 'iw dev', 'sudo iw dev wlan0 scan | grep SSID'],
  },
  {
    id: 'lbfh-13-firewall',
    track: 'Linux Basics for Hackers',
    chapter: 13,
    title: 'Firewalls & Staying Anonymous',
    icon: Skull,
    color: '#f87171',
    difficulty: 'Advanced',
    objective: 'Configure iptables/ufw rules and route traffic through proxychains/Tor to reduce your footprint.',
    context: 'Both defenders and red teamers control traffic flow. Inspect firewall rules, add a rule with ufw, and understand how proxychains anonymizes tool traffic.',
    hints: ['ufw status shows rules', 'iptables -L lists the chains', 'proxychains <cmd> routes through proxies', 'Only for authorized engagements'],
    starterCommands: ['sudo ufw status verbose', 'sudo iptables -L -n', 'cat /etc/proxychains4.conf | grep -v "#" | tail', 'proxychains curl -s http://10.10.10.5'],
  },
  {
    id: 'lbfh-14-python',
    track: 'Linux Basics for Hackers',
    chapter: 14,
    title: 'Writing Python Tools',
    icon: Feather,
    color: '#38bdf8',
    difficulty: 'Advanced',
    objective: 'Run Python from the terminal and build a tiny network tool — the natural next step after bash.',
    context: 'Bash is great for glue; Python is great for real tools. Run a one-liner, then sketch a minimal TCP client the way security tools do.',
    hints: ['python3 -c "..." runs a one-liner', 'import socket for networking', 'python3 script.py runs a file', 'venv keeps dependencies clean'],
    starterCommands: ['python3 --version', 'python3 -c "print(2**32)"', 'python3 -c "import socket; print(socket.gethostbyname(\'localhost\'))"', 'python3 scanner.py 10.10.10.5'],
  },
];

const TRACKS: { id: Track; label: string; blurb: string; icon: React.ElementType; color: string }[] = [
  { id: 'Terminal Mastery',        label: 'Terminal Mastery',        blurb: 'Zero to confident — master the shell one hands-on lab at a time', icon: Terminal,      color: '#00ff41' },
  { id: 'Linux Basics for Hackers', label: 'Linux Basics for Hackers', blurb: 'The hacker curriculum — 14 chapters from filesystem to Python tooling', icon: Skull, color: '#f87171' },
];

const DIFF_STYLE: Record<Difficulty, { color: string; bg: string; border: string }> = {
  Beginner:     { color: '#00ff41', bg: 'rgba(0,255,65,0.08)',    border: 'rgba(0,255,65,0.25)' },
  Intermediate: { color: '#facc15', bg: 'rgba(250,204,21,0.08)',  border: 'rgba(250,204,21,0.25)' },
  Advanced:     { color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.25)' },
};

const PROGRESS_KEY = 'pf_linux_progress';

// ─── Copy button ────────────────────────────────────────────────────────────────

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

// ─── Main component ──────────────────────────────────────────────────────────────

export function LinuxTerminal() {
  const [activeTrack, setActiveTrack] = useState<Track>('Terminal Mastery');
  const [lab, setLab] = useState<LinuxLab | null>(null);
  const [entries, setEntries] = useState<TermEntry[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<{ role: string; content: string }[]>([]);
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [done, setDone] = useState<string[]>([]);
  const [aiLabs, setAiLabs] = useState<LinuxLab[]>([]);
  const [generating, setGenerating] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try { setDone(JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? '[]')); } catch {}
  }, []);

  const AI_ICONS = [Terminal, Search, Network, Cog, GitBranch, KeyRound, ScrollText, Shield, Package, Lock];

  async function generateLabs() {
    setGenerating(true);
    try {
      const res = await fetch('/api/linux/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: 6 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');

      const normalized: LinuxLab[] = (data.labs ?? []).map((l: any, i: number) => ({
        id: l.id ?? `ai-linux-${Date.now()}-${i}`,
        track: 'AI Generated' as const,
        chapter: i + 1,
        title: l.title,
        icon: AI_ICONS[i % AI_ICONS.length],
        color: l.color ?? '#a78bfa',
        difficulty: (['Beginner', 'Intermediate', 'Advanced'].includes(l.difficulty) ? l.difficulty : 'Intermediate') as Difficulty,
        objective: l.objective,
        context: l.context,
        hints: Array.isArray(l.hints) ? l.hints : [],
        starterCommands: Array.isArray(l.starterCommands) ? l.starterCommands : [],
        isAI: true,
      }));

      setAiLabs(normalized);
      addTokenUsage('training', 1500);
      toast.success(`Generated ${normalized.length} fresh labs`, {
        style: { background: '#0a0a0a', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.3)' },
      });
    } catch (e: any) {
      toast.error(e.message ?? 'Failed to generate labs', {
        style: { background: '#0a0a0a', color: '#f87171' },
      });
    } finally {
      setGenerating(false);
    }
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries, loading]);

  function markDone(id: string) {
    setDone(prev => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }

  function selectLab(l: LinuxLab) {
    setLab(l);
    setEntries([
      { type: 'system', content: `Kali GNU/Linux Rolling  \\l\n\nLast login: ${new Date().toUTCString()} on tty1\nType "help", "man <cmd>", or ask the AI tutor anything at any time.` },
      { type: 'system', content: `// LAB ${l.chapter} · ${l.track}\n// ${l.title}\n\nOBJECTIVE: ${l.objective}\n\n${l.context}` },
    ]);
    setHistory([]);
    setCmdHistory([]);
    setHistoryIdx(-1);
  }

  async function runCommand(cmd?: string) {
    const command = (cmd ?? input).trim();
    if (!command || loading || !lab) return;
    setInput('');
    setHistoryIdx(-1);
    setCmdHistory(prev => [command, ...prev.slice(0, 49)]);
    setEntries(prev => [...prev, { type: 'prompt', content: command, command }]);
    setLoading(true);

    try {
      const res = await fetch('/api/linux', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command,
          history,
          scenario: `${lab.track} — ${lab.title}`,
          scenarioContext: `Objective: ${lab.objective}\nContext: ${lab.context}`,
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
        { role: 'user', content: `hacker@kali:~$ ${command}` },
        { role: 'assistant', content: `<output>${data.output}</output><lesson>${data.lesson}</lesson>` },
      ]);
      addTokenUsage('training', 600);
      markDone(lab.id);
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

  function askTutor() {
    setInput('Tutor, I am stuck — what should I try next and why?');
    inputRef.current?.focus();
  }

  function resetTerminal() {
    setLab(null);
    setEntries([]);
    setHistory([]);
    setCmdHistory([]);
    setInput('');
  }

  const trackLabs = LABS.filter(l => l.track === activeTrack);
  const trackDoneCount = trackLabs.filter(l => done.includes(l.id)).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <AnimatePresence mode="wait">
        {/* ── Course selector ── */}
        {!lab && (
          <motion.div key="select" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Info banner */}
              <div style={{ padding: '14px 18px', background: 'rgba(0,255,65,0.04)', border: '1px solid rgba(0,255,65,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                <Terminal size={16} style={{ color: '#00ff41' }} />
                <div>
                  <div style={{ ...MONO, fontSize: 12, fontWeight: 700, color: '#00ff41' }}>Linux Terminal Dojo — hands-on labs with a live AI tutor</div>
                  <div style={{ ...MONO, fontSize: 10, color: '#00ff41', opacity: 0.55, marginTop: 2 }}>Type real Linux commands in a simulated Kali shell. The tutor explains every result so you never get lost.</div>
                </div>
              </div>

              {/* ── Linux Setup Videos (VMware / VirtualBox for cybersecurity) ── */}
              <LinuxSetupVideos />

              {/* ── AI Course Generator ── */}
              <div style={{ padding: '18px 20px', background: 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.22)', borderRadius: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <Sparkles size={14} style={{ color: '#a78bfa' }} />
                      <span style={{ ...MONO, fontSize: 13, fontWeight: 700, color: '#a78bfa' }}>AI Course Generator</span>
                      <span style={{ ...MONO, fontSize: 8, fontWeight: 700, color: '#a78bfa', background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.25)', borderRadius: 3, padding: '1px 6px', letterSpacing: '0.06em' }}>
                        6 LABS / RUN
                      </span>
                    </div>
                    <p style={{ ...MONO, fontSize: 10, color: '#94a3b8', margin: 0, lineHeight: 1.55 }}>
                      Generate a fresh set of randomized hands-on terminal labs — new topics, objectives, and commands every time. Each one drops you into the same AI-tutored Kali shell.
                    </p>
                  </div>
                  <button
                    onClick={generateLabs}
                    disabled={generating}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 7,
                      padding: '9px 18px', borderRadius: 7, cursor: generating ? 'not-allowed' : 'pointer',
                      ...MONO, fontSize: 11, fontWeight: 700, letterSpacing: '0.03em',
                      background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.4)',
                      color: '#a78bfa', boxShadow: '0 0 16px rgba(167,139,250,0.15)',
                      transition: 'all 150ms', flexShrink: 0,
                    }}
                  >
                    {generating ? (
                      <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />Generating labs…</>
                    ) : (
                      <><Wand2 size={13} />{aiLabs.length > 0 ? 'Regenerate Labs' : 'Generate Random Labs'}</>
                    )}
                  </button>
                </div>

                {/* Loading skeleton */}
                {generating && (
                  <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 8 }}>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} style={{ height: 96, borderRadius: 8, background: 'rgba(167,139,250,0.05)', border: '1px solid rgba(167,139,250,0.1)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                    ))}
                  </div>
                )}

                {/* Generated lab cards */}
                {!generating && aiLabs.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ ...MONO, fontSize: 9, color: '#a78bfa', opacity: 0.55, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>
                      // AI-generated — {aiLabs.length} labs ready
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
                      {aiLabs.map((l, idx) => {
                        const Icon = l.icon;
                        const ds = DIFF_STYLE[l.difficulty];
                        return (
                          <motion.button
                            key={l.id}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.04 }}
                            onClick={() => selectLab(l)}
                            style={{ padding: '14px', background: `${l.color}06`, border: `1px solid ${l.color}25`, borderRadius: 8, cursor: 'pointer', textAlign: 'left', transition: 'all 150ms' }}
                            onMouseEnter={e => { e.currentTarget.style.background = `${l.color}10`; e.currentTarget.style.borderColor = `${l.color}45`; e.currentTarget.style.boxShadow = `0 0 12px ${l.color}12`; }}
                            onMouseLeave={e => { e.currentTarget.style.background = `${l.color}06`; e.currentTarget.style.borderColor = `${l.color}25`; e.currentTarget.style.boxShadow = 'none'; }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
                              <Icon size={12} style={{ color: l.color, flexShrink: 0 }} />
                              <span style={{ ...MONO, fontSize: 10, fontWeight: 700, color: l.color, lineHeight: 1.35 }}>{l.title}</span>
                              <span style={{ marginLeft: 'auto', flexShrink: 0, ...MONO, fontSize: 7, fontWeight: 700, color: '#a78bfa', background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: 3, padding: '1px 4px', display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Sparkles size={6} /> AI
                              </span>
                            </div>
                            <div style={{ ...MONO, fontSize: 9, color: '#94a3b8', lineHeight: 1.5, marginBottom: 8 }}>{l.objective}</div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ ...MONO, fontSize: 7, color: ds.color, background: ds.bg, border: `1px solid ${ds.border}`, borderRadius: 3, padding: '1px 6px', textTransform: 'uppercase' }}>{l.difficulty}</span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: 3, ...MONO, fontSize: 8, color: l.color, opacity: 0.5 }}>
                                <ChevronRight size={8} />Launch
                              </span>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                    <button
                      onClick={generateLabs}
                      disabled={generating}
                      style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 5, ...MONO, fontSize: 9, color: 'rgba(167,139,250,0.55)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      <RefreshCw size={9} />Regenerate for a different set
                    </button>
                  </div>
                )}
              </div>

              {/* Track tabs */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {TRACKS.map(t => {
                  const active = t.id === activeTrack;
                  const TIcon = t.icon;
                  const labsInTrack = LABS.filter(l => l.track === t.id);
                  const doneInTrack = labsInTrack.filter(l => done.includes(l.id)).length;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveTrack(t.id)}
                      style={{
                        flex: '1 1 260px', textAlign: 'left', cursor: 'pointer',
                        padding: '14px 16px', borderRadius: 10,
                        background: active ? `${t.color}0d` : 'rgba(255,255,255,0.015)',
                        border: `1px solid ${active ? `${t.color}55` : 'rgba(0,255,65,0.1)'}`,
                        boxShadow: active ? `0 0 16px ${t.color}18` : 'none',
                        transition: 'all 150ms',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <TIcon size={15} style={{ color: t.color }} />
                        <span style={{ ...MONO, fontSize: 12, fontWeight: 700, color: t.color }}>{t.label}</span>
                        <span style={{ marginLeft: 'auto', ...MONO, fontSize: 9, color: t.color, opacity: 0.7, background: `${t.color}12`, border: `1px solid ${t.color}25`, borderRadius: 3, padding: '1px 6px' }}>
                          {doneInTrack}/{labsInTrack.length}
                        </span>
                      </div>
                      <div style={{ ...MONO, fontSize: 10, color: '#94a3b8', lineHeight: 1.55 }}>{t.blurb}</div>
                    </button>
                  );
                })}
              </div>

              {/* Progress line for active track */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ ...MONO, fontSize: 9, color: '#00ff41', opacity: 0.4, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                  // {activeTrack} — {trackDoneCount}/{trackLabs.length} labs started
                </span>
                <div style={{ flex: 1, height: 3, background: 'rgba(0,255,65,0.1)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ width: `${trackLabs.length ? (trackDoneCount / trackLabs.length) * 100 : 0}%`, height: '100%', background: '#00ff41', boxShadow: '0 0 8px rgba(0,255,65,0.6)', transition: 'width 300ms' }} />
                </div>
              </div>

              {/* Lab grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                {trackLabs.map(l => {
                  const Icon = l.icon;
                  const ds = DIFF_STYLE[l.difficulty];
                  const isDone = done.includes(l.id);
                  return (
                    <button
                      key={l.id}
                      onClick={() => selectLab(l)}
                      style={{ position: 'relative', padding: '16px', background: 'rgba(0,255,65,0.02)', border: `1px solid ${l.color}20`, borderRadius: 9, cursor: 'pointer', textAlign: 'left', transition: 'all 150ms' }}
                      onMouseEnter={e => { e.currentTarget.style.background = `${l.color}08`; e.currentTarget.style.borderColor = `${l.color}45`; e.currentTarget.style.boxShadow = `0 0 14px ${l.color}15`; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,255,65,0.02)'; e.currentTarget.style.borderColor = `${l.color}20`; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                      {isDone && (
                        <div style={{ position: 'absolute', top: 10, right: 12, ...MONO, fontSize: 8, color: '#00ff41', background: 'rgba(0,255,65,0.12)', border: '1px solid rgba(0,255,65,0.25)', borderRadius: 3, padding: '2px 6px', display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Check size={8} /> DONE
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <span style={{ ...MONO, fontSize: 9, color: l.color, opacity: 0.5, fontWeight: 700 }}>{String(l.chapter).padStart(2, '0')}</span>
                        <Icon size={14} style={{ color: l.color }} />
                        <span style={{ ...MONO, fontSize: 11, fontWeight: 700, color: l.color, lineHeight: 1.3 }}>{l.title}</span>
                      </div>
                      <div style={{ ...MONO, fontSize: 10, color: '#94a3b8', lineHeight: 1.55, marginBottom: 10 }}>{l.objective}</div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ ...MONO, fontSize: 8, color: ds.color, background: ds.bg, border: `1px solid ${ds.border}`, borderRadius: 3, padding: '2px 7px', textTransform: 'uppercase' }}>{l.difficulty}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, ...MONO, fontSize: 9, color: l.color, opacity: 0.5 }}>
                          <ChevronRight size={9} />Launch Terminal
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Active terminal ── */}
        {lab && (
          <motion.div key="terminal" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>

              {/* Main terminal panel */}
              <div style={{ flex: '1 1 480px', minWidth: 0 }}>
                {/* Title bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', background: '#0a1a0a', borderRadius: '8px 8px 0 0', border: '1px solid rgba(0,255,65,0.25)', borderBottom: 'none' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f87171' }} />
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#facc15' }} />
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#00ff41' }} />
                  </div>
                  <span style={{ ...MONO, fontSize: 10, color: '#00ff41', opacity: 0.7 }}>hacker@kali: ~ — {lab.title}</span>
                  <button onClick={resetTerminal} style={{ ...MONO, fontSize: 9, color: 'rgba(0,255,65,0.5)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <RotateCcw size={9} /> Exit
                  </button>
                </div>

                {/* Terminal body — old-school green CRT */}
                <div
                  onClick={() => inputRef.current?.focus()}
                  className="crt-screen"
                  style={{
                    position: 'relative',
                    background: '#020a02',
                    border: '1px solid rgba(0,255,65,0.25)',
                    borderTop: 'none',
                    borderRadius: '0 0 8px 8px',
                    padding: '16px',
                    minHeight: 400,
                    maxHeight: 580,
                    overflowY: 'auto',
                    cursor: 'text',
                    textShadow: '0 0 2px rgba(0,255,65,0.45)',
                    boxShadow: 'inset 0 0 60px rgba(0,255,65,0.06)',
                  }}
                >
                  {/* CRT scanline overlay */}
                  <div aria-hidden style={{
                    pointerEvents: 'none', position: 'absolute', inset: 0, borderRadius: '0 0 8px 8px', zIndex: 2,
                    background: 'repeating-linear-gradient(to bottom, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 2px, rgba(0,20,0,0.25) 3px, rgba(0,0,0,0) 4px)',
                  }} />
                  <div aria-hidden style={{
                    pointerEvents: 'none', position: 'absolute', inset: 0, borderRadius: '0 0 8px 8px', zIndex: 2,
                    background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 60%, rgba(0,0,0,0.35) 100%)',
                  }} />

                  <div style={{ position: 'relative', zIndex: 1 }}>
                    {entries.map((entry, i) => {
                      if (entry.type === 'system') return (
                        <pre key={i} style={{ ...MONO, fontSize: 11, color: 'rgba(0,255,65,0.55)', margin: '0 0 14px', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{entry.content}</pre>
                      );
                      if (entry.type === 'prompt') return (
                        <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 0, margin: '8px 0 2px' }}>
                          <span style={{ ...MONO, fontSize: 11, color: '#00ff41', whiteSpace: 'nowrap', fontWeight: 700 }}>hacker@kali:~$ </span>
                          <span style={{ ...MONO, fontSize: 11, color: '#d1ffd6' }}>{entry.content}</span>
                          <CopyButton text={entry.content} />
                        </div>
                      );
                      if (entry.type === 'output') return (
                        <pre key={i} style={{ ...MONO, fontSize: 11, color: '#8fffa3', margin: '2px 0 8px', whiteSpace: 'pre-wrap', lineHeight: 1.55 }}>{entry.content}</pre>
                      );
                      if (entry.type === 'error') return (
                        <pre key={i} style={{ ...MONO, fontSize: 11, color: '#f87171', margin: '2px 0 8px', whiteSpace: 'pre-wrap', textShadow: '0 0 2px rgba(248,113,113,0.5)' }}>{entry.content}</pre>
                      );
                      if (entry.type === 'lesson') return (
                        <div key={i} style={{ margin: '4px 0 12px', padding: '8px 12px', background: 'rgba(250,204,21,0.05)', borderLeft: '2px solid rgba(250,204,21,0.4)', borderRadius: '0 4px 4px 0', textShadow: 'none' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                            <Lightbulb size={9} style={{ color: '#facc15' }} />
                            <span style={{ ...MONO, fontSize: 9, color: '#facc15', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>AI Tutor</span>
                          </div>
                          <p style={{ ...MONO, fontSize: 10, color: '#fde68a', opacity: 0.9, margin: 0, lineHeight: 1.6 }}>{entry.content}</p>
                        </div>
                      );
                      return null;
                    })}

                    {loading && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '4px 0' }}>
                        <Loader2 size={11} style={{ color: '#00ff41', animation: 'spin 1s linear infinite' }} />
                        <span style={{ ...MONO, fontSize: 11, color: 'rgba(0,255,65,0.5)' }}>running...</span>
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', marginTop: 8 }}>
                      <span style={{ ...MONO, fontSize: 11, color: '#00ff41', whiteSpace: 'nowrap', fontWeight: 700 }}>hacker@kali:~$ </span>
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
                        style={{ flex: 1, background: 'none', border: 'none', outline: 'none', ...MONO, fontSize: 11, color: '#d1ffd6', caretColor: '#00ff41', marginLeft: 4, textShadow: '0 0 2px rgba(0,255,65,0.45)' }}
                        placeholder={loading ? '' : 'type a Linux command or a question for the tutor...'}
                      />
                    </div>
                    <div ref={bottomRef} />
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Objective */}
                <div style={{ padding: '12px 14px', background: `${lab.color}08`, border: `1px solid ${lab.color}20`, borderRadius: 8 }}>
                  <div style={{ ...MONO, fontSize: 9, color: lab.color, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                    <BookOpen size={9} style={{ display: 'inline', marginRight: 4 }} />Lab {lab.chapter} · Objective
                  </div>
                  <p style={{ ...MONO, fontSize: 10, color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>{lab.objective}</p>
                </div>

                {/* AI Tutor helper */}
                <button
                  onClick={askTutor}
                  disabled={loading}
                  style={{ padding: '11px 14px', background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.25)', borderRadius: 8, cursor: 'pointer', textAlign: 'left', transition: 'all 150ms' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(167,139,250,0.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(167,139,250,0.06)'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <GraduationCap size={11} style={{ color: '#a78bfa' }} />
                    <span style={{ ...MONO, fontSize: 10, fontWeight: 700, color: '#a78bfa' }}>Ask the AI Tutor</span>
                  </div>
                  <span style={{ ...MONO, fontSize: 9, color: '#94a3b8', lineHeight: 1.5 }}>Stuck? Get a hint on exactly what to type next.</span>
                </button>

                {/* Hints */}
                <div style={{ padding: '12px 14px', background: 'rgba(250,204,21,0.03)', border: '1px solid rgba(250,204,21,0.12)', borderRadius: 8 }}>
                  <div style={{ ...MONO, fontSize: 9, color: '#facc15', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                    <Lightbulb size={9} style={{ display: 'inline', marginRight: 4 }} />Hints
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {lab.hints.map((hint, i) => (
                      <div key={i} style={{ ...MONO, fontSize: 10, color: '#facc15', opacity: 0.65, lineHeight: 1.5 }}>• {hint}</div>
                    ))}
                  </div>
                </div>

                {/* Starter commands */}
                <div style={{ padding: '12px 14px', background: 'rgba(0,255,65,0.03)', border: '1px solid rgba(0,255,65,0.12)', borderRadius: 8 }}>
                  <div style={{ ...MONO, fontSize: 9, color: '#00ff41', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Try these commands</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {lab.starterCommands.map((cmd, i) => (
                      <button
                        key={i}
                        onClick={() => runCommand(cmd)}
                        disabled={loading}
                        title={cmd}
                        style={{ ...MONO, fontSize: 9, color: '#00ff41', background: 'rgba(0,255,65,0.05)', border: '1px solid rgba(0,255,65,0.15)', borderRadius: 4, padding: '5px 8px', cursor: 'pointer', textAlign: 'left', lineHeight: 1.4, transition: 'all 150ms', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,255,65,0.12)'; e.currentTarget.style.borderColor = 'rgba(0,255,65,0.3)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,255,65,0.05)'; e.currentTarget.style.borderColor = 'rgba(0,255,65,0.15)'; }}
                      >
                        {cmd.length > 38 ? cmd.slice(0, 38) + '…' : cmd}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ ...MONO, fontSize: 9, color: '#00ff41', opacity: 0.2, textAlign: 'center' }}>↑↓ arrow keys for history</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
