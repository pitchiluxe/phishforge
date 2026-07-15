// Keyless YouTube fetch — no API key, no Google Cloud Console required.
//
// Strategy: scrape YouTube's public search results HTML and parse the embedded
// `ytInitialData` JSON. If that is ever blocked (e.g. a datacenter IP gets a
// consent interstitial), we fall back to a curated pool of real, embeddable
// cybersecurity videos so the UI always has playable content.

export interface KeylessVideo {
  id: string;
  title: string;
  channel: string;
  description: string;
  thumbnail: string;
  durationSec: number;
}

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36';

function parseDurationToSec(len?: string): number {
  if (!len) return 0;
  const parts = len.split(':').map((n) => parseInt(n, 10));
  if (parts.some(isNaN)) return 0;
  return parts.reduce((acc, n) => acc * 60 + n, 0);
}

// Recursively collect `videoRenderer` nodes out of the ytInitialData tree.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function collectRenderers(node: any, out: any[]): void {
  if (!node || typeof node !== 'object') return;
  if (node.videoRenderer) out.push(node.videoRenderer);
  for (const key of Object.keys(node)) collectRenderers(node[key], out);
}

/**
 * Search YouTube without an API key by parsing the public results page.
 * Returns an empty array on any failure so callers can fall back gracefully.
 */
export async function searchYouTubeKeyless(query: string, limit = 20): Promise<KeylessVideo[]> {
  try {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&hl=en&gl=US`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': UA,
        'Accept-Language': 'en-US,en;q=0.9',
        // Skip the EU cookie-consent interstitial that otherwise replaces results.
        Cookie: 'CONSENT=YES+1; SOCS=CAI;',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) return [];
    const html = await res.text();

    const match = html.match(/ytInitialData\s*=\s*(\{[\s\S]+?\})\s*;\s*<\/script>/);
    if (!match) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let data: any;
    try { data = JSON.parse(match[1]); } catch { return []; }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const renderers: any[] = [];
    collectRenderers(data, renderers);

    const seen = new Set<string>();
    const videos: KeylessVideo[] = [];
    for (const v of renderers) {
      const id: string | undefined = v.videoId;
      const title: string | undefined = v.title?.runs?.[0]?.text;
      if (!id || !title || seen.has(id)) continue;
      const channel: string =
        v.ownerText?.runs?.[0]?.text ?? v.longBylineText?.runs?.[0]?.text ?? 'YouTube';
      const description: string =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (v.detailedMetadataSnippets?.[0]?.snippetText?.runs ?? []).map((r: any) => r.text).join('') ||
        `A cybersecurity lesson from ${channel}.`;
      seen.add(id);
      videos.push({
        id,
        title: title.trim(),
        channel: channel.trim(),
        description: description.slice(0, 220),
        thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        durationSec: parseDurationToSec(v.lengthText?.simpleText),
      });
      if (videos.length >= limit) break;
    }
    return videos;
  } catch {
    return [];
  }
}

// ── Curated verified fallback pool (real, embeddable, English) ─────────────────
// Each entry was confirmed live. Used when scraping is unavailable so the tabs
// still fill with real playable content instead of an error/setup wall.
interface PoolItem { id: string; title: string; channel: string; sec: number }

export const FALLBACK_POOL: PoolItem[] = [
  { id: 'fNzpcB7ODxQ', title: 'Ethical Hacking in 12 Hours - Full Course - Learn to Hack!', channel: 'The Cyber Mentor', sec: 44214 },
  { id: '3FNYvj2U0HM', title: 'Ethical Hacking in 15 Hours - 2023 Edition - Learn to Hack! (Part 1)', channel: 'The Cyber Mentor', sec: 26070 },
  { id: 'ug8W0sFiVJo', title: 'Hands-On Cybersecurity and Ethical Hacking – Full Course', channel: 'freeCodeCamp.org', sec: 12945 },
  { id: '3Kq1MIfTWCE', title: 'Full Ethical Hacking Course - Network Penetration Testing for Beginners', channel: 'freeCodeCamp.org', sec: 53474 },
  { id: '1hvVcEhcbLM', title: 'Linux Essentials for Ethical Hackers - Full InfoSec Course', channel: 'freeCodeCamp.org', sec: 16884 },
  { id: 'U1w4T03B30I', title: 'Linux for Ethical Hackers (2022 - Full Kali Linux Course)', channel: 'The Cyber Mentor', sec: 7206 },
  { id: 'lZAoFs75_cs', title: 'Linux for Ethical Hackers (Kali Linux Tutorial)', channel: 'freeCodeCamp.org', sec: 7260 },
  { id: 'VbEx7B_PTOE', title: 'Linux for Hackers // EP 1 (FREE Linux course for beginners)', channel: 'NetworkChuck', sec: 693 },
  { id: 'YJUVNlmIO6E', title: 'Linux for Hackers Tutorial (And Free Courses)', channel: 'David Bombal', sec: 4310 },
  { id: '25iMrJDyIDk', title: 'Beginners Guide to Hacking (Start to Finish)', channel: 'Privacy Matters', sec: 705 },
  { id: 'u0NdJwAw94Q', title: 'How To Start Ethical Hacking in 2026 (FULL COURSE)', channel: 'Privacy Matters', sec: 1353 },
  { id: 'B7tTQ272OHE', title: 'Simple Penetration Testing Tutorial for Beginners!', channel: 'Loi Liang Yang', sec: 925 },
  { id: 'wlqUO09J-nw', title: 'Penetration Testing with Nmap: A Comprehensive Tutorial', channel: 'Nielsen Networking', sec: 2290 },
  { id: 'W013Y3UInoQ', title: 'Full Hands-On Ethical Hacking Course with Kali Linux for Beginners', channel: 'Sunny Dimalu The Cyborg', sec: 12921 },
  { id: 'csxy3LQB4X0', title: 'Ultimate Kali Linux Basics Tutorial for Beginners', channel: 'Declan Middleton', sec: 2816 },
  { id: 'wS2z5lt34Cc', title: 'Practical Bug Bounty', channel: 'The Cyber Mentor', sec: 17152 },
  { id: 'wMO_My5gsDI', title: 'Beginner Bug Bounty Course | Web Application Hacking', channel: 'Ryan John', sec: 17532 },
  { id: 'G3t1JkCqfVg', title: 'Wiz Bug Bounty Masterclass | Complete Ethical Hacking Course (Free)', channel: 'Wiz', sec: 13200 },
  { id: 'TTw-EY7F1rM', title: 'Bug Bounty Course 2024 Updated', channel: 'Ryan John', sec: 40864 },
  { id: 'AMQq06WUMVk', title: 'The No BS Bug Bounty & Web Hacking Roadmap', channel: 'NahamSec', sec: 875 },
  { id: 'QqrK294l_oI', title: 'Bug Bounty bootcamp // Get paid to hack websites', channel: 'David Bombal', sec: 2539 },
  { id: 'XWuP5Yf5ILI', title: 'Python for Hackers FULL Course | Bug Bounty & Ethical Hacking', channel: 'Ryan John', sec: 39090 },
  { id: 'qA0YcYMRWyI', title: 'Malware Analysis In 5+ Hours - Full Course - Learn Practical Malware Analysis!', channel: 'HuskyHacks', sec: 21163 },
  { id: '-cIxKeJp4xo', title: 'An Introduction to Malware Analysis', channel: 'crow', sec: 4201 },
  { id: 'f-fMdnUW4X4', title: 'Introduction to Malware Analysis', channel: 'SANS Institute', sec: 3404 },
  { id: 'ElqmQDySy48', title: 'Snip3 Crypter/RAT Loader - DcRat MALWARE ANALYSIS', channel: 'John Hammond', sec: 6124 },
  { id: 'UtMMjXOlRQc', title: "i created malware with Python (it's SCARY easy!!)", channel: 'NetworkChuck', sec: 1518 },
  { id: '8vk5z9VAaBQ', title: 'Every Level of Reverse Engineering Explained', channel: 'Low Level', sec: 1471 },
  { id: 'USNOmFcebcU', title: 'Analyzing the Zeus Banking Trojan - Malware Analysis Project 101', channel: 'Grant Collins', sec: 6076 },
  { id: 'jQ194vU4Qkk', title: 'Tier 0: HackTheBox Starting Point - 5 Machines - Full Walkthrough', channel: 'CryptoCat', sec: 2790 },
  { id: '0oTuH_xY3mw', title: 'SQLi, SSTI & Docker Escapes - HackTheBox University CTF "GoodGame"', channel: 'John Hammond', sec: 2207 },
  { id: 'rCH71ovUoB8', title: 'HackTheBox Sauna Walkthrough - Active Directory Hacking (OSCP)', channel: 'InfoSec Pat', sec: 2764 },
];

/** Curated fallback as ready-to-use KeylessVideo objects. */
export function fallbackVideos(): KeylessVideo[] {
  return FALLBACK_POOL.map((p) => ({
    id: p.id,
    title: p.title,
    channel: p.channel,
    description: `A hands-on cybersecurity lesson from ${p.channel}.`,
    thumbnail: `https://i.ytimg.com/vi/${p.id}/hqdefault.jpg`,
    durationSec: p.sec,
  }));
}
