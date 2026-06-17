import { NextResponse } from 'next/server';

const CYBER_QUERIES = [
  'ethical hacking tutorial 2024',
  'penetration testing kali linux',
  'malware analysis reverse engineering',
  'CTF capture the flag hacking walkthrough',
  'network security hacking tutorial',
  'OSINT open source intelligence techniques',
  'cybersecurity incident response blue team',
  'bug bounty hunting tutorial',
  'web application hacking OWASP',
  'kali linux hacking tools tutorial',
  'cybersecurity certifications OSCP CEH',
  'HackTheBox TryHackMe walkthrough',
  'ransomware analysis cybersecurity',
  'wireshark network analysis tutorial',
  'social engineering phishing cybersecurity',
];

function categorize(title: string, desc: string): string {
  const text = (title + ' ' + desc).toLowerCase();
  if (/ctf|capture.the.flag|hackthebox|tryhackme|challenge|wargame/.test(text)) return 'CTF';
  if (/malware|ransomware|reverse.engin|virus|trojan|decompil/.test(text)) return 'Malware';
  if (/osint|open.source.intel|recon|shodan|maltego/.test(text)) return 'OSINT';
  if (/network|wireshark|firewall|nmap|packet|sniff/.test(text)) return 'Network Security';
  if (/incident|forensic|blue.team|soc |dfir|log.analys/.test(text)) return 'Incident Response';
  if (/certif|cissp|ceh|oscp|security\+|comptia|cism/.test(text)) return 'Certifications';
  if (/kali|metasploit|burp.suite|nessus|tool|scanner/.test(text)) return 'Tools';
  return 'Hacking';
}

function levelOf(title: string): string {
  const t = title.toLowerCase();
  if (/beginner|intro|start|basic|fundamentals|101|crash.course|first.time/.test(t)) return 'Beginner';
  if (/advanced|expert|professional|deep.dive|master/.test(t)) return 'Advanced';
  return 'Intermediate';
}

export async function GET() {
  const apiKey = process.env.YOUTUBE_API_KEY?.trim();

  if (!apiKey) {
    return NextResponse.json(
      {
        error: 'YOUTUBE_API_KEY is not configured.',
        setup: true,
        hint: 'Add YOUTUBE_API_KEY to your Vercel project environment variables, then redeploy.',
      },
      { status: 503 },
    );
  }

  const query = CYBER_QUERIES[Math.floor(Math.random() * CYBER_QUERIES.length)];

  const params = new URLSearchParams({
    part: 'snippet',
    q: query,
    type: 'video',
    maxResults: '20',
    key: apiKey,
    videoEmbeddable: 'true',
    relevanceLanguage: 'en',
    safeSearch: 'none',
  });

  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?${params}`,
      { cache: 'no-store' },
    );
    const data = await res.json();

    if (!res.ok) {
      const errMsg = data.error?.message ?? `YouTube API error (${res.status})`;
      const isKeyError = res.status === 400 || res.status === 403;
      return NextResponse.json(
        { error: errMsg, setup: isKeyError },
        { status: res.status },
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const videos = (data.items ?? []).map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      description: (item.snippet.description ?? '').slice(0, 200) || 'No description available.',
      thumbnail:
        item.snippet.thumbnails?.high?.url ??
        item.snippet.thumbnails?.medium?.url ??
        `https://i.ytimg.com/vi/${item.id.videoId}/hqdefault.jpg`,
      category: categorize(item.snippet.title, item.snippet.description ?? ''),
      difficulty: levelOf(item.snippet.title),
    }));

    return NextResponse.json({ videos, topic: query });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to reach YouTube API' },
      { status: 500 },
    );
  }
}
