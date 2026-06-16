import { getSafeClient } from '@/lib/supabase/safe';
import { Header } from '@/components/layout/header';
import { ThreatIntelClient, type ThreatItem } from '@/components/threat-intel/threat-intel-client';

const STATIC_THREATS: ThreatItem[] = [
  {
    id: 'st-001', title: 'LockBit 3.0 ransomware surge targeting healthcare and finance sectors',
    severity: 'critical', category: 'ransomware',
    description: 'LockBit 3.0 operators are exploiting unpatched Citrix Bleed (CVE-2023-4966) and ScreenConnect vulnerabilities to gain initial access. Average dwell time before encryption is 4 days. Victims face $500k–$2M demands with exfiltration-before-encryption double extortion.',
    industries: ['healthcare', 'finance'], published_at: new Date(Date.now() - 1 * 86400000).toISOString(), mitre: 'T1486, T1490, T1041',
  },
  {
    id: 'st-002', title: 'Business Email Compromise targeting Finance teams via AI-crafted emails',
    severity: 'critical', category: 'bec',
    description: 'Sophisticated BEC attacks impersonating CFOs to authorise wire transfers. AI-generated emails are personalised from LinkedIn data and bypass legacy email filters. Average loss per incident: $132,000. New variant uses voice cloning for phone confirmation calls.',
    industries: ['finance', 'healthcare', 'retail'], published_at: new Date(Date.now() - 2 * 86400000).toISOString(), mitre: 'T1566.002, T1534',
  },
  {
    id: 'st-003', title: 'Midnight Blizzard (APT29) targeting cloud environments via OAuth abuse',
    severity: 'critical', category: 'apt',
    description: 'Russian APT29 (Cozy Bear) compromising cloud tenants through stolen OAuth tokens and device code phishing. Targets include government, defence contractors, and technology companies. Threat actors maintain persistent access by abusing legitimate cloud API features.',
    industries: ['government', 'defence', 'tech'], published_at: new Date(Date.now() - 3 * 86400000).toISOString(), mitre: 'T1528, T1550.001, T1078.004',
  },
  {
    id: 'st-004', title: 'QR Code Phishing (Quishing) surge bypassing enterprise email security',
    severity: 'high', category: 'quishing',
    description: 'Threat actors embedding malicious QR codes in PDF attachments and printed materials to bypass email scanning. QR codes redirect to EvilProxy-hosted Microsoft 365 credential harvesters. Mobile devices used to scan are typically unmanaged and unprotected.',
    industries: ['all'], published_at: new Date(Date.now() - 4 * 86400000).toISOString(), mitre: 'T1566.001, T1111',
  },
  {
    id: 'st-005', title: 'Okta cross-tenant impersonation attacks on support systems',
    severity: 'high', category: 'identity-attack',
    description: 'Threat actors using stolen credentials to access Okta customer support portals and export session tokens. Allows impersonation of any user in affected tenants without password. Organisations using Okta for SSO to cloud apps are at high risk of full tenant compromise.',
    industries: ['tech', 'finance', 'saas'], published_at: new Date(Date.now() - 5 * 86400000).toISOString(), mitre: 'T1556, T1606.001',
  },
  {
    id: 'st-006', title: 'Credential harvesting via cloned SSO portals (Microsoft 365, Okta)',
    severity: 'high', category: 'credential-theft',
    description: 'Cloned Microsoft 365 and Okta login pages served through legitimate cloud hosting providers (Cloudflare Pages, Azure Static Apps) to evade blocklists. EvilProxy and Evilginx2 reverse-proxy kits bypass MFA by relaying session cookies in real time.',
    industries: ['tech', 'finance', 'all'], published_at: new Date(Date.now() - 6 * 86400000).toISOString(), mitre: 'T1557, T1185',
  },
  {
    id: 'st-007', title: 'Agent Tesla infostealer delivered via shipping notification lures',
    severity: 'high', category: 'malware',
    description: 'Agent Tesla keylogger campaigns using shipping/invoice lures with macro-enabled XLSM and OneNote attachments. Steals credentials from 55+ applications including browsers, email clients, VPN tools, and FTP clients. Exfiltrates via Telegram bot API to avoid C2 detection.',
    industries: ['logistics', 'retail', 'manufacturing'], published_at: new Date(Date.now() - 8 * 86400000).toISOString(), mitre: 'T1566.001, T1555, T1071.001',
  },
  {
    id: 'st-008', title: 'AI-generated spear phishing using LinkedIn and corporate data',
    severity: 'medium', category: 'spear-phishing',
    description: 'Attackers scraping professional networks to craft hyper-personalised phishing emails using LLMs. Campaigns reference real projects, colleagues, and recent events to increase credibility. Detection rate by users drops 60% compared to generic phishing templates.',
    industries: ['all'], published_at: new Date(Date.now() - 10 * 86400000).toISOString(), mitre: 'T1598.003, T1566.002',
  },
  {
    id: 'st-009', title: 'Scattered Spider social engineering targeting IT helpdesks',
    severity: 'high', category: 'social-engineering',
    description: 'UNC3944 (Scattered Spider) calling IT helpdesks to reset MFA and gain initial access. Uses OSINT on employees to answer verification questions. Recently targeted MGM, Caesars, and multiple cloud providers. Fluent English-speaking operators make calls highly convincing.',
    industries: ['hospitality', 'finance', 'tech'], published_at: new Date(Date.now() - 12 * 86400000).toISOString(), mitre: 'T1078, T1656',
  },
  {
    id: 'st-010', title: 'SQL injection campaigns targeting unpatched web applications (OWASP A03)',
    severity: 'medium', category: 'web-attack',
    description: 'Automated SQLi scanning campaigns targeting e-commerce and healthcare web apps running outdated frameworks. Attackers using sqlmap automation to extract PII, payment card data, and credentials. WAF bypass techniques using encoding and time-based blind injection.',
    industries: ['ecommerce', 'healthcare', 'saas'], published_at: new Date(Date.now() - 14 * 86400000).toISOString(), mitre: 'T1190, T1005',
  },
  {
    id: 'st-011', title: 'Insider threat: departing employees exfiltrating IP via cloud storage',
    severity: 'medium', category: 'insider-threat',
    description: 'Increase in data exfiltration cases involving employees uploading proprietary source code, customer lists, and trade secrets to personal Google Drive, Dropbox, or GitHub repos before resignation. DLP policies often fail to catch gradual, low-volume transfers over 2–4 weeks.',
    industries: ['tech', 'finance', 'pharma'], published_at: new Date(Date.now() - 18 * 86400000).toISOString(), mitre: 'T1052, T1567.002',
  },
  {
    id: 'st-012', title: 'Zerologon and noPac privilege escalation in unpatched Active Directory',
    severity: 'critical', category: 'privilege-escalation',
    description: 'Active exploitation of CVE-2020-1472 (Zerologon) and CVE-2021-42278/42287 (noPac) giving attackers instant Domain Admin from any domain user account. Organisations that skipped November 2020 DC patches remain vulnerable. Used as post-exploitation step after initial foothold.',
    industries: ['all'], published_at: new Date(Date.now() - 20 * 86400000).toISOString(), mitre: 'T1210, T1078.002',
  },
  {
    id: 'st-013', title: 'Cloud misconfiguration: publicly exposed S3 buckets and storage accounts',
    severity: 'high', category: 'cloud-misconfiguration',
    description: 'Automated scanners continuously enumerate cloud storage for misconfigured public access. Common exposures: customer PII, database backups, API keys in config files, CI/CD secrets, and source code. GDPR/HIPAA breach notification requirements triggered in 40% of cases.',
    industries: ['all'], published_at: new Date(Date.now() - 25 * 86400000).toISOString(), mitre: 'T1530',
  },
  {
    id: 'st-014', title: 'Supply chain attack via compromised npm packages (dependency confusion)',
    severity: 'high', category: 'supply-chain',
    description: 'Threat actors publishing malicious npm/PyPI packages with names mimicking internal packages (dependency confusion) or legitimate libraries (typosquatting). Malicious packages contain preinstall scripts that steal CI/CD secrets, AWS credentials, and SSH keys.',
    industries: ['tech', 'fintech', 'saas'], published_at: new Date(Date.now() - 30 * 86400000).toISOString(), mitre: 'T1195.001, T1176',
  },
  {
    id: 'st-015', title: 'Volt Typhoon (China) pre-positioning in US critical infrastructure',
    severity: 'critical', category: 'apt',
    description: 'Chinese state-sponsored APT Volt Typhoon conducting living-off-the-land attacks against US energy, water, and transportation sectors. Using built-in Windows tools (WMIC, netsh, PowerShell) to avoid detection. Goal: pre-positioning for disruption in geopolitical conflict scenarios.',
    industries: ['energy', 'utilities', 'transport', 'government'], published_at: new Date(Date.now() - 35 * 86400000).toISOString(), mitre: 'T1078, T1059.001, T1105',
  },
  {
    id: 'st-016', title: 'FIN7 POWERTRASH fileless malware targeting POS systems via spear phishing',
    severity: 'critical', category: 'apt',
    description: 'FIN7 threat actor deploying POWERTRASH PowerShell-based backdoor via targeted phishing against retail and hospitality POS operators. Malware lives entirely in memory, defeating most AV solutions. Group nets $1B+ annually from stolen payment card data sold on dark web forums.',
    industries: ['retail', 'hospitality', 'finance'], published_at: new Date(Date.now() - 7 * 86400000).toISOString(), mitre: 'T1059.001, T1027, T1566.001',
  },
  {
    id: 'st-017', title: 'Lazarus Group targeting crypto exchanges with fake job offers (Dream Job)',
    severity: 'critical', category: 'apt',
    description: 'North Korean Lazarus Group (UNC4899) sending fake recruitment packages to crypto developers containing trojanised coding tests. Malware grants full access to developer workstations and eventually cryptocurrency wallets. Operation Dream Job has stolen $3B+ in crypto assets to date.',
    industries: ['finance', 'tech', 'defi'], published_at: new Date(Date.now() - 9 * 86400000).toISOString(), mitre: 'T1204.002, T1566.002, T1059.007',
  },
  {
    id: 'st-018', title: 'Kubernetes misconfiguration allowing container escape to host node',
    severity: 'high', category: 'cloud-misconfiguration',
    description: 'Attackers exploiting privileged containers and host path volume mounts to escape Kubernetes pods and access underlying nodes. Compromised nodes allow lateral movement to other pods, secrets, and the control plane. RBAC misconfigurations are the root cause in 78% of incidents.',
    industries: ['tech', 'saas', 'fintech'], published_at: new Date(Date.now() - 11 * 86400000).toISOString(), mitre: 'T1611, T1552.007',
  },
  {
    id: 'st-019', title: 'Deepfake audio and video used in executive impersonation fraud',
    severity: 'high', category: 'ai-threat',
    description: 'Cybercriminals using AI-generated deepfake audio and video to impersonate CEOs and CFOs in video conference calls, successfully authorising fraudulent bank transfers. Average loss per incident exceeds $500K. Attackers clone voice from public earnings calls and conference recordings.',
    industries: ['finance', 'all'], published_at: new Date(Date.now() - 13 * 86400000).toISOString(), mitre: 'T1598, T1534',
  },
  {
    id: 'st-020', title: 'MOVEit Transfer zero-day mass exploitation (CVE-2023-34362) still active',
    severity: 'critical', category: 'zero-day',
    description: 'Cl0p ransomware gang continues mass exploitation of SQL injection vulnerabilities in MOVEit Transfer and MOVEit Cloud. Over 2,600 organisations affected globally, including government agencies and major financial institutions. Stolen data appears on dark web extortion portals months after initial breach.',
    industries: ['government', 'finance', 'healthcare', 'education'], published_at: new Date(Date.now() - 16 * 86400000).toISOString(), mitre: 'T1190, T1505.003, T1041',
  },

  // ── CrowdStrike / Falcon Sensor / EDR ────────────────────────────────────
  {
    id: 'st-cs-001', title: 'CrowdStrike Falcon Sensor kernel driver exploitation via CVE-2024-6197',
    severity: 'critical', category: 'edr-bypass',
    description: 'Threat actors are reverse-engineering the CrowdStrike Falcon sensor kernel driver to identify memory corruption primitives. Exploiting a race condition in the Falcon content-update pipeline (similar to the July 2024 BSOD incident) allows attackers to load unsigned kernel modules on Windows hosts, bypassing Falcon\'s tamper-protection and achieving kernel-level persistence.',
    industries: ['all'], published_at: new Date(Date.now() - 2 * 86400000).toISOString(), mitre: 'T1014, T1547.006, T1562.001',
  },
  {
    id: 'st-cs-002', title: 'Falcon Sensor tampering: attackers disabling EDR via WMI event subscriptions',
    severity: 'high', category: 'edr-bypass',
    description: 'Post-compromise actors with local admin rights are using WMI permanent event subscriptions to monitor for the CrowdStrike CSFalconService and terminate it before executing ransomware payloads. The technique avoids direct process termination (which Falcon blocks) by chaining WMI consumer scripts that delay execution until Falcon\'s driver call hooks are temporarily suspended during service restart windows.',
    industries: ['all'], published_at: new Date(Date.now() - 4 * 86400000).toISOString(), mitre: 'T1562.001, T1546.003, T1489',
  },
  {
    id: 'st-cs-003', title: 'CrowdStrike Identity Protection gap: Kerberoasting in air-gapped sensor deployments',
    severity: 'high', category: 'identity-attack',
    description: 'In environments where Falcon Identity Threat Protection sensors are not deployed on all domain controllers, Kerberoasting attacks against service accounts remain undetected. Red teams are deliberately targeting DCs without Falcon coverage to extract TGS tickets for offline cracking, exploiting the visibility gap created by partial sensor deployments.',
    industries: ['finance', 'government', 'healthcare'], published_at: new Date(Date.now() - 6 * 86400000).toISOString(), mitre: 'T1558.003, T1078.002',
  },
  {
    id: 'st-cs-004', title: 'Bring-Your-Own-Vulnerable-Driver (BYOVD) attack bypassing Falcon\'s kernel protections',
    severity: 'critical', category: 'edr-bypass',
    description: 'BlackCat/ALPHV affiliates are deploying signed but vulnerable Windows kernel drivers (e.g., RTCore64.sys, gdrv.sys) to achieve ring-0 code execution and blind CrowdStrike Falcon before dropping ransomware. Falcon\'s vulnerable driver blocklist requires manual updates and may lag behind newly discovered BYOVD candidates by days to weeks.',
    industries: ['finance', 'healthcare', 'manufacturing'], published_at: new Date(Date.now() - 8 * 86400000).toISOString(), mitre: 'T1068, T1562.001, T1486',
  },
  {
    id: 'st-cs-005', title: 'CrowdStrike Falcon RTR (Real Time Response) sessions abused by insiders',
    severity: 'high', category: 'insider-threat',
    description: 'Security engineers with CrowdStrike Falcon console access are abusing Real Time Response sessions to exfiltrate files and execute commands on endpoints outside their authorized scope. Falcon RTR sessions are not always logged to external SIEM, creating audit blind spots. Organisations should enforce RTR session approval workflows and forward all RTR audit logs to a separate immutable log store.',
    industries: ['tech', 'finance', 'saas'], published_at: new Date(Date.now() - 10 * 86400000).toISOString(), mitre: 'T1059, T1052, T1078',
  },
  {
    id: 'st-cs-006', title: 'Falcon Sensor update pipeline supply chain risk: content channel poisoning',
    severity: 'critical', category: 'supply-chain',
    description: 'Security researchers have demonstrated that the rapid content update mechanism CrowdStrike uses to push new detection rules (channel files) can be weaponised if an attacker compromises CrowdStrike\'s update signing infrastructure. A malformed channel file similar to the July 2024 incident could be weaponised to trigger a global sensor crash as a coordinated denial-of-service, or to deliver malicious logic to millions of endpoints simultaneously.',
    industries: ['all'], published_at: new Date(Date.now() - 12 * 86400000).toISOString(), mitre: 'T1195.002, T1499, T1485',
  },
  {
    id: 'st-cs-007', title: 'EDR telemetry evasion: process hollowing in signed Windows binaries defeats Falcon',
    severity: 'high', category: 'edr-bypass',
    description: 'Ransomware operators targeting Falcon-protected environments are using process hollowing within signed Microsoft binaries (msiexec.exe, svchost.exe) to execute malicious shellcode inside trusted processes. When combined with direct syscall invocation to bypass Falcon\'s user-mode hooks, this technique achieves full code execution without triggering behavioural detections.',
    industries: ['all'], published_at: new Date(Date.now() - 14 * 86400000).toISOString(), mitre: 'T1055.012, T1106, T1562.001',
  },
  {
    id: 'st-cs-008', title: 'CrowdStrike Falcon for Cloud: container escape detection gap in privileged pods',
    severity: 'high', category: 'cloud-misconfiguration',
    description: 'Falcon for Containers sensor coverage gaps exist in Kubernetes clusters running privileged pods. Container escape techniques using hostPath volume mounts and host network namespaces are inconsistently detected when the node-level Falcon sensor is running in a compatibility mode required by older kernel versions. Organisations should validate Falcon coverage with a container escape simulation before production deployment.',
    industries: ['tech', 'saas', 'fintech'], published_at: new Date(Date.now() - 17 * 86400000).toISOString(), mitre: 'T1611, T1552.007, T1612',
  },
];

export default async function ThreatIntelPage() {
  const supabase = await getSafeClient();
  const dbThreats = supabase
    ? (await supabase.from('threat_intelligence').select('*').eq('is_active', true).order('published_at', { ascending: false })).data ?? []
    : [];

  const initialThreats = dbThreats.length > 0
    ? dbThreats.map((t: any) => ({ ...t, isAI: false }))
    : STATIC_THREATS;

  return (
    <div className="animate-in">
      <Header
        title="Threat Intel"
        subtitle="AI-generated live threat feed — randomised on every visit. Click Analyze to generate an IR plan in CyberLM."
      />
      <ThreatIntelClient initialThreats={initialThreats} />
    </div>
  );
}
