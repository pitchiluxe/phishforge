import { NextResponse } from 'next/server';
import { searchYouTubeKeyless, fallbackVideos, type KeylessVideo } from '@/lib/youtube/keyless';

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

function toVideo(v: KeylessVideo) {
  return {
    id: v.id,
    title: v.title,
    channel: v.channel,
    description: (v.description ?? '').slice(0, 200) || 'No description available.',
    thumbnail: v.thumbnail,
    category: categorize(v.title, v.description ?? ''),
    difficulty: levelOf(v.title),
  };
}

export async function GET() {
  const query = CYBER_QUERIES[Math.floor(Math.random() * CYBER_QUERIES.length)];
  const apiKey = process.env.YOUTUBE_API_KEY?.trim();

  // 1) Preferred path — official Data API when a key is configured.
  if (apiKey) {
    const params = new URLSearchParams({
      part: 'snippet', q: query, type: 'video', maxResults: '20',
      key: apiKey, videoEmbeddable: 'true', relevanceLanguage: 'en', safeSearch: 'none',
    });
    try {
      const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`, { cache: 'no-store' });
      const data = await res.json();
      if (res.ok) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const videos = (data.items ?? []).map((item: any) => toVideo({
          id: item.id.videoId,
          title: item.snippet.title,
          channel: item.snippet.channelTitle,
          description: item.snippet.description ?? '',
          thumbnail: item.snippet.thumbnails?.high?.url ?? item.snippet.thumbnails?.medium?.url ?? `https://i.ytimg.com/vi/${item.id.videoId}/hqdefault.jpg`,
          durationSec: 0,
        }));
        if (videos.length) return NextResponse.json({ videos, topic: query });
      }
    } catch { /* fall through to keyless */ }
  }

  // 2) Keyless path — scrape public search results (no API key needed).
  const scraped = await searchYouTubeKeyless(query, 20);
  if (scraped.length) {
    return NextResponse.json({ videos: scraped.map(toVideo), topic: query });
  }

  // 3) Last resort — curated verified pool so the tab always has playable content.
  const shuffled = [...fallbackVideos()].sort(() => Math.random() - 0.5).slice(0, 20);
  return NextResponse.json({ videos: shuffled.map(toVideo), topic: 'Curated cybersecurity picks' });
}
