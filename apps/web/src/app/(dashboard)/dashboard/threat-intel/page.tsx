import { getSafeClient } from '@/lib/supabase/safe';
import { Header } from '@/components/layout/header';
import { AlertTriangle, ExternalLink, Cpu } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

const SEV: Record<string, { color: string; bg: string; border: string }> = {
  critical: { color: '#ff4444', bg: 'rgba(255,68,68,0.08)',  border: 'rgba(255,68,68,0.3)' },
  high:     { color: '#ff8c00', bg: 'rgba(255,140,0,0.08)',  border: 'rgba(255,140,0,0.3)' },
  medium:   { color: '#facc15', bg: 'rgba(250,204,21,0.08)', border: 'rgba(250,204,21,0.3)' },
  low:      { color: '#00ff41', bg: 'rgba(0,255,65,0.07)',   border: 'rgba(0,255,65,0.25)' },
  info:     { color: '#60a5fa', bg: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.25)' },
};

const SAMPLE_THREATS = [
  {
    id: '1', title: 'LockBit 3.0 ransomware surge targeting healthcare and finance sectors',
    severity: 'critical', category: 'ransomware',
    description: 'LockBit 3.0 operators are exploiting unpatched Citrix Bleed (CVE-2023-4966) and ScreenConnect vulnerabilities to gain initial access. Average dwell time before encryption is 4 days. Victims face $500k–$2M demands with exfiltration-before-encryption double extortion.',
    industries: ['healthcare', 'finance'], published_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    mitre: 'T1486, T1490, T1041',
  },
  {
    id: '2', title: 'Business Email Compromise targeting Finance teams via AI-crafted emails',
    severity: 'critical', category: 'bec',
    description: 'Sophisticated BEC attacks impersonating CFOs to authorise wire transfers. AI-generated emails are personalised from LinkedIn data and bypass legacy email filters. Average loss per incident: $132,000. New variant uses voice cloning for phone confirmation calls.',
    industries: ['finance', 'healthcare', 'retail'], published_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    mitre: 'T1566.002, T1534',
  },
  {
    id: '3', title: 'Midnight Blizzard (APT29) targeting cloud environments via OAuth abuse',
    severity: 'critical', category: 'apt',
    description: 'Russian APT29 (Cozy Bear) compromising cloud tenants through stolen OAuth tokens and device code phishing. Targets include government, defence contractors, and technology companies. Threat actors maintain persistent access by abusing legitimate cloud API features.',
    industries: ['government', 'defence', 'tech'], published_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    mitre: 'T1528, T1550.001, T1078.004',
  },
  {
    id: '4', title: 'QR Code Phishing (Quishing) surge bypassing enterprise email security',
    severity: 'high', category: 'quishing',
    description: 'Threat actors embedding malicious QR codes in PDF attachments and printed materials to bypass email scanning. QR codes redirect to EvilProxy-hosted Microsoft 365 credential harvesters. Mobile devices used to scan are typically unmanaged and unprotected.',
    industries: ['all'], published_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    mitre: 'T1566.001, T1111',
  },
  {
    id: '5', title: 'Okta cross-tenant impersonation attacks on support systems',
    severity: 'high', category: 'identity-attack',
    description: 'Threat actors using stolen credentials to access Okta customer support portals and export session tokens. Allows impersonation of any user in affected tenants without password. Organisations using Okta for SSO to cloud apps are at high risk of full tenant compromise.',
    industries: ['tech', 'finance', 'saas'], published_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    mitre: 'T1556, T1606.001',
  },
  {
    id: '6', title: 'Credential harvesting via cloned SSO portals (Microsoft 365, Okta)',
    severity: 'high', category: 'credential-theft',
    description: 'Cloned Microsoft 365 and Okta login pages served through legitimate cloud hosting providers (Cloudflare Pages, Azure Static Apps) to evade blocklists. EvilProxy and Evilginx2 reverse-proxy kits bypass MFA by relaying session cookies in real time.',
    industries: ['tech', 'finance', 'all'], published_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    mitre: 'T1557, T1185',
  },
  {
    id: '7', title: 'Agent Tesla infostealer delivered via shipping notification lures',
    severity: 'high', category: 'malware',
    description: 'Agent Tesla keylogger campaigns using shipping/invoice lures with macro-enabled XLSM and OneNote attachments. Steals credentials from 55+ applications including browsers, email clients, VPN tools, and FTP clients. Exfiltrates via Telegram bot API to avoid C2 detection.',
    industries: ['logistics', 'retail', 'manufacturing'], published_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    mitre: 'T1566.001, T1555, T1071.001',
  },
  {
    id: '8', title: 'AI-generated spear phishing using LinkedIn and corporate data',
    severity: 'medium', category: 'spear-phishing',
    description: 'Attackers scraping professional networks to craft hyper-personalised phishing emails using LLMs. Campaigns reference real projects, colleagues, and recent events to increase credibility. Detection rate by users drops 60% compared to generic phishing templates.',
    industries: ['all'], published_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    mitre: 'T1598.003, T1566.002',
  },
  {
    id: '9', title: 'Scattered Spider social engineering targeting IT helpdesks',
    severity: 'high', category: 'social-engineering',
    description: 'UNC3944 (Scattered Spider) calling IT helpdesks to reset MFA and gain initial access. Uses OSINT on employees to answer verification questions. Recently targeted MGM, Caesars, and multiple cloud providers. Fluent English-speaking operators make calls highly convincing.',
    industries: ['hospitality', 'finance', 'tech'], published_at: new Date(Date.now() - 12 * 86400000).toISOString(),
    mitre: 'T1078, T1656',
  },
  {
    id: '10', title: 'SQL injection campaigns targeting unpatched web applications (OWASP A03)',
    severity: 'medium', category: 'web-attack',
    description: 'Automated SQLi scanning campaigns targeting e-commerce and healthcare web apps running outdated frameworks. Attackers using sqlmap automation to extract PII, payment card data, and credentials. WAF bypass techniques using encoding and time-based blind injection.',
    industries: ['ecommerce', 'healthcare', 'saas'], published_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    mitre: 'T1190, T1005',
  },
  {
    id: '11', title: 'Insider threat: departing employees exfiltrating IP via cloud storage',
    severity: 'medium', category: 'insider-threat',
    description: 'Increase in data exfiltration cases involving employees uploading proprietary source code, customer lists, and trade secrets to personal Google Drive, Dropbox, or GitHub repos before resignation. DLP policies often fail to catch gradual, low-volume transfers over 2–4 weeks.',
    industries: ['tech', 'finance', 'pharma'], published_at: new Date(Date.now() - 18 * 86400000).toISOString(),
    mitre: 'T1052, T1567.002',
  },
  {
    id: '12', title: 'Zerologon and noPac privilege escalation in unpatched Active Directory',
    severity: 'critical', category: 'privilege-escalation',
    description: 'Active exploitation of CVE-2020-1472 (Zerologon) and CVE-2021-42278/42287 (noPac) giving attackers instant Domain Admin from any domain user account. Organisations that skipped November 2020 DC patches remain vulnerable. Used as post-exploitation step after initial foothold.',
    industries: ['all'], published_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    mitre: 'T1210, T1078.002',
  },
  {
    id: '13', title: 'Cloud misconfiguration: publicly exposed S3 buckets and storage accounts',
    severity: 'high', category: 'cloud-misconfiguration',
    description: 'Automated scanners continuously enumerate cloud storage for misconfigured public access. Common exposures: customer PII, database backups, API keys in config files, CI/CD secrets, and source code. GDPR/HIPAA breach notification requirements triggered in 40% of cases.',
    industries: ['all'], published_at: new Date(Date.now() - 25 * 86400000).toISOString(),
    mitre: 'T1530',
  },
  {
    id: '14', title: 'Supply chain attack via compromised npm packages (dependency confusion)',
    severity: 'high', category: 'supply-chain',
    description: 'Threat actors publishing malicious npm/PyPI packages with names mimicking internal packages (dependency confusion) or legitimate libraries (typosquatting). Malicious packages contain preinstall scripts that steal CI/CD secrets, AWS credentials, and SSH keys.',
    industries: ['tech', 'fintech', 'saas'], published_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    mitre: 'T1195.001, T1176',
  },
  {
    id: '15', title: 'Volt Typhoon (China) pre-positioning in US critical infrastructure',
    severity: 'critical', category: 'apt',
    description: 'Chinese state-sponsored APT Volt Typhoon conducting "living off the land" attacks against US energy, water, and transportation sectors. Using built-in Windows tools (WMIC, netsh, PowerShell) to avoid detection. Goal: pre-positioning for disruption in geopolitical conflict scenarios.',
    industries: ['energy', 'utilities', 'transport', 'government'], published_at: new Date(Date.now() - 35 * 86400000).toISOString(),
    mitre: 'T1078, T1059.001, T1105',
  },
];

const MONO = { fontFamily: 'var(--font-fira-code), monospace' } as const;

export default async function ThreatIntelPage() {
  const supabase = await getSafeClient();
  const dbThreats = supabase
    ? (await supabase.from('threat_intelligence').select('*').eq('is_active', true).order('published_at', { ascending: false })).data ?? []
    : [];

  const threats = dbThreats.length > 0 ? dbThreats : SAMPLE_THREATS;
  const isLive = dbThreats.length > 0;

  return (
    <div className="animate-in">
      <Header title="Threat Intel" subtitle="Latest cyber threats, TTPs, and MITRE ATT&CK mappings — click Analyze in CyberLM to generate an IR plan" />
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {!isLive && (
          <div style={{
            ...MONO, fontSize: 10, color: '#00ff41', opacity: 0.4,
            padding: '8px 14px',
            border: '1px solid rgba(0,255,65,0.12)',
            borderRadius: 4, background: 'rgba(0,255,65,0.02)',
          }}>
            // Showing curated threat intelligence feed — connect Supabase to load live data
          </div>
        )}

        {threats.map((threat) => {
          const s = SEV[threat.severity] ?? SEV.info;
          return (
            <div key={threat.id} style={{
              background: 'rgba(0,255,65,0.025)',
              border: `1px solid rgba(0,255,65,0.12)`,
              borderLeft: `3px solid ${s.color}`,
              borderRadius: '0 6px 6px 0',
              padding: '18px 20px',
              boxShadow: '0 0 20px rgba(0,255,65,0.03)',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1 }}>
                  <AlertTriangle size={14} style={{ color: s.color, flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <h3 style={{ ...MONO, fontSize: 13, fontWeight: 600, color: '#c8ffd4', marginBottom: 6 }}>
                      {threat.title}
                    </h3>
                    {threat.description && (
                      <p style={{ fontSize: 12, color: '#00ff41', opacity: 0.55, lineHeight: 1.65 }}>
                        {threat.description}
                      </p>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <Link
                    href="/dashboard/cyberlm"
                    title="Analyze this threat in CyberLM"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      ...MONO, fontSize: 9, fontWeight: 700,
                      color: '#00ff41', background: 'rgba(0,255,65,0.08)',
                      border: '1px solid rgba(0,255,65,0.25)', borderRadius: 4,
                      padding: '4px 8px', textDecoration: 'none',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <Cpu size={10} />
                    Analyze in CyberLM
                  </Link>
                  {threat.source_url && (
                    <a href={threat.source_url} target="_blank" rel="noopener noreferrer"
                      style={{ color: '#00ff41', opacity: 0.4, flexShrink: 0, display: 'flex' }}>
                      <ExternalLink size={13} />
                    </a>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{
                  ...MONO, fontSize: 9, fontWeight: 700,
                  color: s.color, background: s.bg, border: `1px solid ${s.border}`,
                  borderRadius: 3, padding: '2px 8px',
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                }}>
                  {threat.severity}
                </span>
                <span style={{ ...MONO, fontSize: 10, color: '#00ff41', opacity: 0.4 }}>
                  {threat.category}
                </span>
                {threat.mitre && (
                  <span style={{
                    ...MONO, fontSize: 9, color: '#60a5fa',
                    background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)',
                    borderRadius: 3, padding: '1px 6px',
                  }}>
                    MITRE: {threat.mitre}
                  </span>
                )}
                {(threat.industries ?? []).map((ind: string) => (
                  <span key={ind} style={{
                    ...MONO, fontSize: 9, color: '#00ff41', opacity: 0.35,
                    border: '1px solid rgba(0,255,65,0.15)', borderRadius: 3, padding: '1px 6px',
                  }}>
                    {ind}
                  </span>
                ))}
                {threat.published_at && (
                  <span style={{ ...MONO, fontSize: 10, color: '#00ff41', opacity: 0.3, marginLeft: 'auto' }}>
                    {formatDate(threat.published_at)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
