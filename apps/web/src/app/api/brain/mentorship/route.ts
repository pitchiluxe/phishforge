import { NextResponse } from 'next/server';

type Level = 'Beginner' | 'Intermediate' | 'Advanced';
type CourseCategory =
  | 'Fundamentals'
  | 'Penetration Testing'
  | 'Bug Bounty'
  | 'CTF Training'
  | 'Blue Team'
  | 'Malware Analysis'
  | 'Certifications'
  | 'Web Hacking';

interface CourseQuery {
  q: string;
  level: Level;
  category: CourseCategory;
}

const COURSE_QUERIES: CourseQuery[] = [
  // ── Beginner ────────────────────────────────────────────────────────────────
  { q: 'cybersecurity full course for beginners 2024',          level: 'Beginner',     category: 'Fundamentals' },
  { q: 'ethical hacking course beginner to advanced',           level: 'Beginner',     category: 'Penetration Testing' },
  { q: 'TryHackMe beginner learning path walkthrough',          level: 'Beginner',     category: 'CTF Training' },
  { q: 'networking basics for hackers cybersecurity',           level: 'Beginner',     category: 'Fundamentals' },
  { q: 'linux fundamentals for cybersecurity course',           level: 'Beginner',     category: 'Fundamentals' },
  { q: 'CompTIA Security+ full course study guide',             level: 'Beginner',     category: 'Certifications' },
  { q: 'how to get started in cybersecurity career path',       level: 'Beginner',     category: 'Fundamentals' },
  { q: 'OWASP top 10 explained course beginners',              level: 'Beginner',     category: 'Web Hacking' },
  // ── Intermediate ─────────────────────────────────────────────────────────────
  { q: 'penetration testing complete course kali linux 2024',   level: 'Intermediate', category: 'Penetration Testing' },
  { q: 'bug bounty hunting course intermediate methodology',     level: 'Intermediate', category: 'Bug Bounty' },
  { q: 'web application hacking course Burp Suite',             level: 'Intermediate', category: 'Web Hacking' },
  { q: 'HackTheBox walkthrough machine course 2024',            level: 'Intermediate', category: 'CTF Training' },
  { q: 'SOC analyst course blue team defense',                  level: 'Intermediate', category: 'Blue Team' },
  { q: 'malware analysis course reverse engineering 2024',      level: 'Intermediate', category: 'Malware Analysis' },
  { q: 'network penetration testing course full',               level: 'Intermediate', category: 'Penetration Testing' },
  { q: 'OSCP certification course complete preparation',         level: 'Intermediate', category: 'Certifications' },
  { q: 'active directory attacks course full tutorial',         level: 'Intermediate', category: 'Penetration Testing' },
  { q: 'OSINT techniques course open source intelligence',      level: 'Intermediate', category: 'Fundamentals' },
  // ── Advanced ─────────────────────────────────────────────────────────────────
  { q: 'advanced penetration testing course red team 2024',     level: 'Advanced',     category: 'Penetration Testing' },
  { q: 'exploit development buffer overflow course advanced',    level: 'Advanced',     category: 'Penetration Testing' },
  { q: 'advanced web hacking course SQL injection XSS SSRF',    level: 'Advanced',     category: 'Web Hacking' },
  { q: 'advanced malware reverse engineering course IDA Pro',   level: 'Advanced',     category: 'Malware Analysis' },
  { q: 'red team operations course adversary simulation',       level: 'Advanced',     category: 'Penetration Testing' },
  { q: 'threat hunting course MITRE ATT&CK advanced',           level: 'Advanced',     category: 'Blue Team' },
  { q: 'advanced bug bounty hunting P1 vulnerabilities course', level: 'Advanced',     category: 'Bug Bounty' },
  { q: 'cloud security hacking AWS Azure GCP course advanced',  level: 'Advanced',     category: 'Penetration Testing' },
];

function levelOf(title: string, queryLevel: Level): Level {
  const t = title.toLowerCase();
  if (/beginner|intro|start|basic|fundamentals|101|crash.course|getting.started|zero.to/.test(t)) return 'Beginner';
  if (/advanced|expert|professional|red.team|exploit.dev|senior/.test(t)) return 'Advanced';
  if (/intermediate|medium|practical|methodology/.test(t)) return 'Intermediate';
  return queryLevel;
}

function categoryOf(title: string, desc: string, queryCategory: CourseCategory): CourseCategory {
  const text = (title + ' ' + desc).toLowerCase();
  if (/ctf|hackthebox|tryhackme|capture.the.flag|challenge|wargame|room/.test(text)) return 'CTF Training';
  if (/bug.bounty|hacker.one|responsible.disclosure|bounty.hunting/.test(text)) return 'Bug Bounty';
  if (/malware|reverse.engin|ida.pro|ghidra|binary/.test(text)) return 'Malware Analysis';
  if (/blue.team|soc.analyst|defense|detection|siem|splunk|defender/.test(text)) return 'Blue Team';
  if (/certif|cissp|ceh|oscp|security\+|comptia|cism|sans/.test(text)) return 'Certifications';
  if (/web|burp|owasp|xss|sqli|csrf|ssrf|api.hack/.test(text)) return 'Web Hacking';
  if (/pentest|penetration|kali|metasploit|exploit|red.team|nmap|recon/.test(text)) return 'Penetration Testing';
  return queryCategory;
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

  const queryObj = COURSE_QUERIES[Math.floor(Math.random() * COURSE_QUERIES.length)];

  const params = new URLSearchParams({
    part: 'snippet',
    q: queryObj.q,
    type: 'video',
    maxResults: '20',
    key: apiKey,
    videoEmbeddable: 'true',
    relevanceLanguage: 'en',
    safeSearch: 'moderate',
    videoDuration: 'long',
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
    const courses = (data.items ?? []).map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      description: (item.snippet.description ?? '').slice(0, 220) || 'No description available.',
      thumbnail:
        item.snippet.thumbnails?.high?.url ??
        item.snippet.thumbnails?.medium?.url ??
        `https://i.ytimg.com/vi/${item.id.videoId}/hqdefault.jpg`,
      level: levelOf(item.snippet.title, queryObj.level),
      category: categoryOf(item.snippet.title, item.snippet.description ?? '', queryObj.category),
    }));

    return NextResponse.json({ courses, topic: queryObj.q, focusLevel: queryObj.level });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to reach YouTube API' },
      { status: 500 },
    );
  }
}
