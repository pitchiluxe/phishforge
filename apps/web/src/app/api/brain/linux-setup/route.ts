import { NextResponse } from 'next/server';
import { searchYouTubeKeyless, type KeylessVideo } from '@/lib/youtube/keyless';

// Scoped strictly to "install/setup Linux for cybersecurity" — VMware, VirtualBox,
// WSL, and hacking-lab builds. Same keyless approach as the Tube/Mentorship tabs.
const SETUP_QUERIES = [
  'install kali linux on vmware workstation',
  'kali linux vmware installation tutorial cybersecurity',
  'install kali linux on virtualbox for hacking',
  'build a hacking lab vmware kali linux',
  'how to install kali linux for cybersecurity',
  'setup kali linux virtual machine step by step',
  'install kali linux and metasploitable vmware lab',
  'parrot os install vmware cybersecurity',
  'install kali linux windows 11 wsl',
  'kali linux setup for hack the box',
];

// Curated, verified pool of the most-watched Linux-setup-for-cybersecurity videos.
// Used when live scraping is unavailable so this section always has playable content.
interface Pool { id: string; title: string; channel: string; platform: Platform }
type Platform = 'VMware' | 'VirtualBox' | 'WSL' | 'Lab Build';

const FALLBACK: Pool[] = [
  { id: 'XzD8JIAOk2I', title: 'VMware Pro is FREE. Install Kali Linux on Windows 11 NOW', channel: 'David Bombal', platform: 'VMware' },
  { id: 'wX75Z-4MEoM', title: 'you need to learn Virtual Machines RIGHT NOW!! (Kali Linux VM, Ubuntu, Windows)', channel: 'NetworkChuck', platform: 'Lab Build' },
  { id: 'mvsiuLzpx2E', title: 'how to build a HACKING lab (to become a hacker)', channel: 'NetworkChuck', platform: 'Lab Build' },
  { id: 'AnwgxRtWXLI', title: 'Kali Linux Install: Ethical hacking getting started guide', channel: 'David Bombal', platform: 'VirtualBox' },
  { id: 'MPkni85O9JA', title: 'Install Kali Linux on Windows 11 for FREE', channel: 'David Bombal', platform: 'WSL' },
  { id: 'sAMnXte56yY', title: 'How To Install Kali Linux 2024 in VirtualBox | Kali Linux 2024.1', channel: 'Ksk Royal', platform: 'VirtualBox' },
  { id: 'ZJFu0AoAY_g', title: 'How to Install Kali Linux 2025 in VirtualBox | Kali Linux 2025.1', channel: 'Techy Druid', platform: 'VirtualBox' },
  { id: 'U0AMu3rznc4', title: 'How to Install Kali Linux in VMware Virtual Machine (2025)', channel: 'Crown GEEK', platform: 'VMware' },
  { id: 'A1Bm9KmPQ0o', title: 'How to Install Kali Linux on VMware Workstation 17 Pro', channel: 'GEEKrar Guides', platform: 'VMware' },
  { id: 'xaNacMxYaMo', title: 'Install Kali Linux In VirtualBox | Step-by-Step Guide (2025)', channel: 'Silent Tech', platform: 'VirtualBox' },
  { id: 'yf3jetn4tN8', title: 'Install Kali Linux & Metasploitable2 on VirtualBox 7 — Cyber Security Lab', channel: 'Sunny Dimalu The Cyborg', platform: 'Lab Build' },
  { id: 'Vos7DCTqvSM', title: 'Pro Tip: What to Do After Installing Kali Linux', channel: 'pwd {root}', platform: 'VirtualBox' },
  { id: 'l4SR8vlAt-o', title: 'How to setup Kali Linux for Hack The Box', channel: 'awakengaming', platform: 'Lab Build' },
  { id: 'U9tgf7Gr9lA', title: 'How to Install Kali Linux on VirtualBox in 2026 | Complete Guide', channel: 'WsCube Cyber Security', platform: 'VirtualBox' },
  { id: '4huDEcXFVQc', title: 'How to Install Kali Linux in VMware Workstation Pro [2025]', channel: 'CS CORNER Sunita Rai', platform: 'VMware' },
  { id: 'NNrnlXH6lbo', title: 'How to Install Kali Linux in VMware Workstation [2024]', channel: 'CS CORNER Sunita Rai', platform: 'VMware' },
  { id: 'wMmPtsASlGM', title: 'Install Kali Linux 2024.4 on VMware Workstation', channel: 'r2schools', platform: 'VMware' },
  { id: 'KYnp54I0Vck', title: 'How to Install Kali Linux and Metasploitable on VMware Workstation Pro', channel: 'François B. Arthanas', platform: 'Lab Build' },
  { id: 'oppgkgNpj58', title: 'How to Download and Install Kali Linux | Step-by-step guide', channel: 'CBT Nuggets', platform: 'VirtualBox' },
  { id: 'Bbe9YP86yoQ', title: 'How to install Kali Linux? | Cyber Security Training | Edureka', channel: 'edureka!', platform: 'VirtualBox' },
  { id: 'IDpoq8Cavjw', title: 'How to Install Kali Linux on VMware Workstation', channel: 'Techy Druid', platform: 'VMware' },
  { id: 'EvQLXtnb5mE', title: 'How to Install Kali Linux on VirtualBox (2026) | Step-by-Step', channel: 'Ksk Royal', platform: 'VirtualBox' },
];

// Only keep videos that are clearly about installing/setting up Linux for security work.
const RELEVANT = /(install|setup|set up|configur|virtual\s?machine|\bvm\b|vmware|virtualbox|wsl|hacking lab|cyber ?security|metasploitable)/i;
const LINUXY = /(kali|parrot|linux|ubuntu|metasploitable|vmware|virtualbox|wsl)/i;

function platformOf(title: string): Platform {
  const t = title.toLowerCase();
  if (/vmware|fusion|workstation/.test(t)) return 'VMware';
  if (/virtualbox|virtual box|\bvbox\b/.test(t)) return 'VirtualBox';
  if (/wsl|windows subsystem/.test(t)) return 'WSL';
  if (/lab|metasploitable|hack the box|hackthebox|tryhackme/.test(t)) return 'Lab Build';
  return 'VirtualBox';
}

function levelOf(title: string): string {
  const t = title.toLowerCase();
  if (/beginner|intro|start|basic|step.by.step|getting started|first|easy|guide/.test(t)) return 'Beginner';
  if (/advanced|expert|pro\b|master|complete/.test(t)) return 'Advanced';
  return 'Intermediate';
}

function toVideo(v: KeylessVideo) {
  return {
    id: v.id,
    title: v.title,
    channel: v.channel,
    description: (v.description ?? '').slice(0, 200) || `Linux setup walkthrough from ${v.channel}.`,
    thumbnail: v.thumbnail,
    platform: platformOf(v.title),
    difficulty: levelOf(v.title),
  };
}

export async function GET() {
  const query = SETUP_QUERIES[Math.floor(Math.random() * SETUP_QUERIES.length)];

  // 1) Keyless scrape — no API key needed. Keep only setup-for-security matches.
  const scraped = await searchYouTubeKeyless(query, 24);
  const filtered = scraped.filter((v) => LINUXY.test(v.title) && RELEVANT.test(v.title));
  if (filtered.length >= 6) {
    return NextResponse.json({ videos: filtered.slice(0, 18).map(toVideo), topic: query });
  }

  // 2) Curated verified pool — shuffled so "Fetch" always yields a fresh mix.
  const shuffled = [...FALLBACK].sort(() => Math.random() - 0.5).slice(0, 18);
  const pool: KeylessVideo[] = shuffled.map((p) => ({
    id: p.id,
    title: p.title,
    channel: p.channel,
    description: `${p.platform} — Linux setup for cybersecurity, from ${p.channel}.`,
    thumbnail: `https://i.ytimg.com/vi/${p.id}/hqdefault.jpg`,
    durationSec: 0,
  }));
  return NextResponse.json({ videos: pool.map(toVideo), topic: 'Curated Linux setup picks' });
}
