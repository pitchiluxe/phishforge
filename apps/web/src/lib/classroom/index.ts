export type ModuleType = 'LESSON' | 'LAB' | 'SIMULATION';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type CourseCategory =
  | 'foundations'
  | 'email-security'
  | 'incident-response'
  | 'social-engineering'
  | 'advanced-threats'
  | 'compliance'
  | 'network-security'
  | 'endpoint-security'
  | 'iam-zero-trust'
  | 'web-app-security'
  | 'devsecops'
  | 'cloud-security'
  | 'soc-siem'
  | 'threat-intelligence'
  | 'forensics-ir'
  | 'cryptography'
  | 'physical-security'
  | 'mobile-security'
  | 'data-loss-prevention';
export type BadgeCategory = 'completion' | 'streak' | 'score' | 'specialty';

export interface XPLevel {
  level: number;
  title: string;
  minXP: number;
  maxXP: number | null;
  color: string;
  glowColor: string;
}

export interface CourseModule {
  id: string;
  title: string;
  type: ModuleType;
  durationMin: number;
  xpReward: number;
  content?: string;
  labPrompt?: string;
  labKeywords?: string[];
  scenarioContext?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: CourseCategory;
  difficulty: Difficulty;
  accentColor: string;
  modules: CourseModule[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  category: BadgeCategory;
  xpBonus: number;
  requiredModuleCount?: number;
  requiredCourseIds?: string[];
  requiresMinXP?: number;
}

export const XP_LEVELS: XPLevel[] = [
  { level: 1, title: 'Rookie',           minXP: 0,     maxXP: 499,   color: '#888888', glowColor: 'rgba(136,136,136,0.4)' },
  { level: 2, title: 'Trainee',          minXP: 500,   maxXP: 1499,  color: '#00ff41', glowColor: 'rgba(0,255,65,0.4)' },
  { level: 3, title: 'Security Analyst', minXP: 1500,  maxXP: 2999,  color: '#60a5fa', glowColor: 'rgba(96,165,250,0.4)' },
  { level: 4, title: 'Threat Hunter',    minXP: 3000,  maxXP: 4999,  color: '#facc15', glowColor: 'rgba(250,204,21,0.4)' },
  { level: 5, title: 'SOC Analyst',      minXP: 5000,  maxXP: 7999,  color: '#fb923c', glowColor: 'rgba(251,146,60,0.4)' },
  { level: 6, title: 'Security Lead',    minXP: 8000,  maxXP: 11999, color: '#a78bfa', glowColor: 'rgba(167,139,250,0.4)' },
  { level: 7, title: 'Cyber Guardian',   minXP: 12000, maxXP: null,  color: '#f87171', glowColor: 'rgba(248,113,113,0.4)' },
];

export function getLevelForXP(xp: number): XPLevel {
  for (let i = XP_LEVELS.length - 1; i >= 0; i--) {
    if (xp >= XP_LEVELS[i].minXP) return XP_LEVELS[i];
  }
  return XP_LEVELS[0];
}

export function getXPProgress(xp: number): { current: number; min: number; max: number; pct: number } {
  const level = getLevelForXP(xp);
  const min = level.minXP;
  const max = level.maxXP ?? level.minXP + 5000;
  const current = xp - min;
  const range = max - min;
  return { current, min, max, pct: Math.min(100, Math.round((current / range) * 100)) };
}

export { EXTRA_COURSES } from './extra-courses';
export { STANDALONE_LABS, searchLabs, getLabCategories } from './standalone-labs';
export type { StandaloneLab } from './standalone-labs';

import { EXTRA_COURSES } from './extra-courses';

export const COURSES: Course[] = [
  {
    id: 'phishing-fundamentals',
    title: 'Phishing Fundamentals',
    description: 'Master the basics of phishing: how attacks work, red flags to spot, and the attacker\'s mindset.',
    category: 'foundations',
    difficulty: 'beginner',
    accentColor: '#00ff41',
    modules: [
      {
        id: 'pf-lesson-1',
        title: 'What Is Phishing?',
        type: 'LESSON',
        durationMin: 15,
        xpReward: 50,
        content: `## What Is Phishing?

Phishing is a cyberattack where criminals disguise themselves as trusted entities to trick victims into revealing sensitive information—credentials, credit cards, or personal data.

### How It Works

1. **Lure** — The attacker crafts a convincing message (email, SMS, call) that mimics a trusted source like your bank, IT department, or a colleague.
2. **Hook** — The message contains a malicious link, attachment, or request that seems urgent or legitimate.
3. **Catch** — The victim clicks, downloads, or replies, giving the attacker what they need.

### Why It Works

- **Authority**: Messages appear to come from executives, IT, or trusted brands.
- **Urgency**: "Your account will be suspended in 24 hours!"
- **Fear**: "Unauthorized login detected—verify immediately."
- **Curiosity**: "You have an unclaimed package."

### Scale of the Problem

Over 3.4 billion phishing emails are sent daily. 90% of data breaches start with a phishing attack. The average cost of a phishing breach exceeds $4.9 million.

**Remember:** Attackers only need to succeed once. You need to be vigilant every time.`,
      },
      {
        id: 'pf-lesson-2',
        title: 'Types of Phishing Attacks',
        type: 'LESSON',
        durationMin: 20,
        xpReward: 75,
        content: `## Types of Phishing Attacks

### Email Phishing (Mass Phishing)
The most common type. Attackers send bulk emails impersonating banks, streaming services, or IT helpdesks. Cast wide nets hoping someone clicks.

**Indicators:** Generic greeting ("Dear Customer"), mismatched sender domain, grammar errors, suspicious links.

### Spear Phishing
Targeted attacks against specific individuals or organizations. Attackers research their targets on LinkedIn, company websites, and social media to craft personalized, believable messages.

**Indicators:** Uses your real name, mentions your company/role, references recent events, appears from known colleague.

### Whaling
Spear phishing targeting executives (CEO, CFO, CISO). High-value targets, high-effort attacks.

**Example:** "CFO—I need you to approve a wire transfer urgently. I'm in a meeting and can't call."

### Vishing (Voice Phishing)
Phone-based phishing. Attackers impersonate tech support, bank fraud departments, or government agencies.

### Smishing (SMS Phishing)
Text message attacks. "Your package is held at customs—click to release: bit.ly/..."

### Quishing (QR Code Phishing)
Malicious QR codes embedded in emails, PDFs, or printed materials. Bypasses email link scanners.

### Clone Phishing
Attackers take a legitimate email you received and replace its links/attachments with malicious ones, then re-send it appearing to be a "resend."`,
      },
      {
        id: 'pf-lab-1',
        title: 'Spot the Red Flags',
        type: 'LAB',
        durationMin: 25,
        xpReward: 100,
        labPrompt: `You receive this email:

---
**From:** support@micros0ft-helpdesk.com
**Subject:** URGENT: Your Microsoft 365 account will be SUSPENDED

Dear Valued Customer,

We have detected suspicious activity on you account. Your Microsoft 365 license will be suspend in 24 hours unless you verify your identity immediately.

Click here to verify: http://secure-ms365-verify.net/login

Regards,
Microsoft Support Team
---

**List every phishing indicator you can identify in this email. Be as specific as possible.**`,
        labKeywords: ['domain', 'sender', 'micros0ft', 'urgency', 'grammar', 'typo', 'generic', 'link', 'http', 'verify', 'suspended', 'misspell'],
      },
      {
        id: 'pf-sim-1',
        title: 'Live Phishing Scenario',
        type: 'SIMULATION',
        durationMin: 40,
        xpReward: 150,
        scenarioContext: 'Email phishing simulation — IT helpdesk impersonation requesting password reset via suspicious link.',
      },
    ],
  },
  {
    id: 'social-engineering',
    title: 'Social Engineering Defense',
    description: 'Understand manipulation tactics attackers use and build psychological defenses against them.',
    category: 'social-engineering',
    difficulty: 'beginner',
    accentColor: '#f87171',
    modules: [
      {
        id: 'se-lesson-1',
        title: 'The Psychology of Manipulation',
        type: 'LESSON',
        durationMin: 20,
        xpReward: 75,
        content: `## The Psychology of Manipulation

Social engineering exploits fundamental human psychology rather than technical vulnerabilities. Understanding these principles makes you immune to them.

### Cialdini's 6 Principles (Weaponized by Attackers)

**1. Authority**
People defer to figures of authority. Attackers impersonate executives, IT staff, auditors, law enforcement, or well-known brands.
> "This is your CEO. I need you to process a wire transfer immediately."

**2. Urgency / Scarcity**
Time pressure disables careful thinking. "Act now or lose access." Real systems rarely require immediate action that bypasses normal processes.

**3. Social Proof**
"Everyone else has already updated their credentials." Creates false normalcy.

**4. Liking / Familiarity**
Attackers research targets to build rapport. Mentioning shared interests, mutual contacts, or recent company events creates trust.

**5. Reciprocity**
Giving a small favor creates obligation. "I fixed your IT ticket, now I just need your employee ID to close the case."

**6. Commitment & Consistency**
Once you agree to something small, you're more likely to agree to larger requests. Foot-in-the-door technique.

### The Golden Rule

**Slow down.** Attackers want you to act fast. Any communication that creates urgency, fear, or excitement and requires immediate action is a red flag—regardless of who it appears to be from.`,
      },
      {
        id: 'se-lesson-2',
        title: 'Pretexting & Impersonation',
        type: 'LESSON',
        durationMin: 15,
        xpReward: 50,
        content: `## Pretexting & Impersonation

**Pretexting** is creating a fabricated scenario (pretext) to extract information. It's storytelling with malicious intent.

### Common Pretexts

**IT Support**
"Hi, I'm from the IT helpdesk. We're doing mandatory security updates and need your login credentials to push the patch."
> *IT will NEVER ask for your password.*

**New Employee / Vendor**
"I'm starting next week and need access to the shared drive. My manager said you could help."

**Auditor / Compliance**
"We're conducting a PCI compliance audit. I need a list of all users with admin access."

**Delivery / Facilities**
"I have a package for your department—can you buzz me in? I'll leave it at your desk."

### Verification Protocol

Always verify through a **separate, trusted channel**:
1. Hang up / close the email
2. Look up the person/company's official number independently
3. Call back through the official channel
4. Never use contact info provided in the suspicious message itself

### Reporting

If you suspect a social engineering attempt:
- Do NOT engage further
- Document what happened (time, medium, what was asked)
- Report to your security team immediately
- Do NOT be embarrassed—attackers are professionals`,
      },
      {
        id: 'se-lab-1',
        title: 'Pretext Recognition Lab',
        type: 'LAB',
        durationMin: 30,
        xpReward: 100,
        labPrompt: `A colleague approaches you at the printer and says:

*"Hey! I'm Alex from the London office, just visiting for the week. My laptop is in the shop and I have a crucial board presentation in 20 minutes. Could I borrow your login to access the shared drive? I promise I'll only be 5 minutes. My manager Sarah authorized it—you can check with her but she's in the meeting already."*

**Describe:**
1. What manipulation techniques is this person using?
2. What should you do right now?
3. How do you verify if this is legitimate?`,
        labKeywords: ['urgency', 'authority', 'pressure', 'verify', 'report', 'refuse', 'credentials', 'password', 'manager', 'confirm', 'official', 'channel', 'IT'],
      },
      {
        id: 'se-sim-1',
        title: 'Vishing Simulation',
        type: 'SIMULATION',
        durationMin: 35,
        xpReward: 150,
        scenarioContext: 'Vishing simulation — caller impersonates IT support requesting remote access and credentials for "emergency maintenance."',
      },
    ],
  },
  {
    id: 'password-mfa',
    title: 'Password & MFA Security',
    description: 'Build unbreakable authentication habits and understand how MFA protects you—even when passwords leak.',
    category: 'foundations',
    difficulty: 'beginner',
    accentColor: '#60a5fa',
    modules: [
      {
        id: 'pm-lesson-1',
        title: 'Password Security Fundamentals',
        type: 'LESSON',
        durationMin: 20,
        xpReward: 75,
        content: `## Password Security Fundamentals

### How Attackers Crack Passwords

**Credential Stuffing**: Attackers buy leaked username/password pairs from previous breaches (billions exist) and try them on other services. If you reuse passwords, one breach exposes everything.

**Brute Force**: Systematic guessing of all combinations. Modern GPUs can test billions of combinations per second.

**Dictionary Attacks**: Trying common words, phrases, and predictable patterns ("Password1!", "Summer2024!").

**Phishing**: Simply tricking you into typing your password on a fake site.

### What Makes a Password Strong?

| Factor | Bad | Good |
|--------|-----|------|
| Length | 8 chars | 16+ chars |
| Complexity | password123 | Tr0ub4dor&3 |
| Uniqueness | Same everywhere | Unique per site |
| Pattern | Company+Year! | Random passphrase |

### Passphrases

Long random phrases are both memorable and strong:
- **"correct-horse-battery-staple"** — 44 bits of entropy, easy to type
- Attackers can't dictionary-attack 4 random common words combined

### Password Manager

Use a password manager (Bitwarden, 1Password, Dashlane) to:
- Generate unique random passwords for every site
- Store them securely (you only remember one master password)
- Alert you when a saved password appears in a breach

**Never store passwords in:** browser notes, sticky notes, spreadsheets, or plaintext files.`,
      },
      {
        id: 'pm-lesson-2',
        title: 'Multi-Factor Authentication (MFA)',
        type: 'LESSON',
        durationMin: 15,
        xpReward: 50,
        content: `## Multi-Factor Authentication (MFA)

MFA requires two or more of:
- **Something you know**: Password, PIN
- **Something you have**: Phone (TOTP app, SMS), hardware key (YubiKey)
- **Something you are**: Fingerprint, Face ID

### Why MFA Is Critical

Even if your password is stolen via phishing or breach, an attacker can't log in without your second factor. MFA blocks 99.9% of automated attacks.

### MFA Types (Best → Worst)

**1. Hardware Security Key (Best)**
YubiKey, Google Titan Key. Physical device plugged into USB or tapped to NFC. Resistant to phishing because the key cryptographically verifies the domain.

**2. Authenticator App (TOTP)**
Google Authenticator, Authy, Microsoft Authenticator. 6-digit time-based codes. Much better than SMS. Can be phished by real-time relay attacks, but stops most attacks.

**3. SMS / Email Code**
Weakest MFA. SIM-swapping attacks can intercept SMS codes. Better than nothing, but upgrade when possible.

### MFA Fatigue Attacks

Attackers send repeated MFA push notifications hoping the user accidentally approves. Defense:
- Number matching (approve only if the number matches)
- Never approve a push you didn't initiate
- Report unexpected MFA requests immediately

### Passkeys (The Future)

Passkeys replace passwords entirely using public-key cryptography. Phishing-resistant by design. Enabled on most major platforms now.`,
      },
      {
        id: 'pm-lab-1',
        title: 'Authentication Security Audit',
        type: 'LAB',
        durationMin: 25,
        xpReward: 100,
        labPrompt: `Your company's IT policy review shows:

- 60% of employees use SMS-based MFA
- Average password length across the organization is 9 characters
- 15% of employees report they use the same password for work and personal accounts
- 8 accounts with admin privileges have no MFA enabled
- The password policy requires only 8 characters and a symbol

**As the security awareness lead, write your top 5 recommendations to improve the company's authentication security. Explain why each matters and what the risk is if left unaddressed.**`,
        labKeywords: ['MFA', 'password', 'length', 'reuse', 'admin', 'authenticator', 'hardware', 'policy', 'breach', 'credential', 'manager', 'passkey'],
      },
      {
        id: 'pm-sim-1',
        title: 'MFA Bypass Scenario',
        type: 'SIMULATION',
        durationMin: 35,
        xpReward: 150,
        scenarioContext: 'MFA fatigue / real-time phishing relay scenario — attacker attempts to capture TOTP codes through a fake login portal while social engineering MFA approval.',
      },
    ],
  },
  {
    id: 'email-security-pro',
    title: 'Email Security Pro',
    description: 'Deep dive into email authentication protocols (SPF, DKIM, DMARC) and advanced header analysis.',
    category: 'email-security',
    difficulty: 'intermediate',
    accentColor: '#facc15',
    modules: [
      {
        id: 'esp-lesson-1',
        title: 'Email Authentication Protocols',
        type: 'LESSON',
        durationMin: 25,
        xpReward: 100,
        content: `## Email Authentication Protocols

### The Problem: Email Spoofing

Email was designed in the 1970s without authentication. Anyone can send an email claiming to be from any address. SPF, DKIM, and DMARC fix this—but only if properly configured.

### SPF (Sender Policy Framework)

A DNS record that specifies which mail servers are authorized to send email for your domain.

**Example SPF Record:**
\`v=spf1 include:_spf.google.com ~all\`

- Receiving servers look up the sending domain's SPF record
- If the sending server IP isn't listed → fail
- \`~all\` = softfail (still deliver but mark), \`-all\` = hardfail (reject)

**Limitation:** SPF only checks the envelope sender, not the From: header the user sees.

### DKIM (DomainKeys Identified Mail)

Adds a cryptographic signature to outgoing emails. The receiving server verifies the signature using a public key in DNS.

- Proves the email wasn't modified in transit
- Proves it came from a server with the private key (which only the real domain owner has)
- Survives email forwarding (unlike SPF)

### DMARC (Domain-based Message Authentication)

Builds on SPF and DKIM. Tells receiving servers what to do when emails fail authentication:

\`v=DMARC1; p=reject; rua=mailto:dmarc@company.com\`

- \`p=none\`: Monitor only (do nothing)
- \`p=quarantine\`: Send to spam
- \`p=reject\`: Reject the email entirely

**DMARC also requires alignment** — the From: header domain must match the SPF or DKIM domain.

### BIMI (Brand Indicators for Message Identification)

Displays your verified logo in email clients for authenticated emails. Visual trust signal for recipients.`,
      },
      {
        id: 'esp-lesson-2',
        title: 'Reading Email Headers',
        type: 'LESSON',
        durationMin: 20,
        xpReward: 75,
        content: `## Reading Email Headers

Email headers contain the full routing history and authentication results of a message. They're invisible in normal mail clients but critical for investigating suspicious emails.

### How to Access Headers

- **Gmail**: Click ⋮ → "Show original"
- **Outlook**: File → Properties → Internet headers
- **Apple Mail**: View → Message → All Headers

### Key Headers to Analyze

**Return-Path**
The actual bounce address. If this differs significantly from the From: address, suspicious.

**Received**
Tracks every server the email passed through (bottom = first hop, top = final delivery). Examine IP addresses—do they match the claimed sender's infrastructure?

**Authentication-Results**
The receiving server's verdict on SPF/DKIM/DMARC:
\`\`\`
Authentication-Results: mx.google.com;
  dkim=pass header.d=company.com;
  spf=pass smtp.mailfrom=company.com;
  dmarc=pass action=none
\`\`\`
All three passing = legitimate. Any failures = investigate.

**X-Originating-IP**
The IP of the original sender. Look up the IP's geolocation and organization—does it match?

**Message-ID**
Unique identifier. Should match the sender's domain: \`<random@sender-domain.com>\`

### Red Flags in Headers

- Authentication results showing fail/softfail
- Received hops through unexpected countries
- Message-ID domain doesn't match From: domain
- Missing DKIM signature
- Multiple Received headers with suspicious IPs`,
      },
      {
        id: 'esp-lab-1',
        title: 'Header Analysis Lab',
        type: 'LAB',
        durationMin: 30,
        xpReward: 125,
        labPrompt: `Analyze this email header excerpt and report your findings:

\`\`\`
From: CEO Jane Smith <ceo@company-corp.com>
Return-Path: <noreply@bulk-mailer-247.ru>
Reply-To: <urgent.wire@protonmail.com>
Received: from mail.bulk-mailer-247.ru (45.156.23.88)
  by mx.company.com; Mon, 9 Jun 2026 14:23:11 +0000

Authentication-Results: mx.company.com;
  dkim=fail (signature verification failed)
  spf=softfail (company-corp.com: 45.156.23.88 is not permitted)
  dmarc=fail action=none

Message-ID: <20260609-18291@bulk-mailer-247.ru>
Subject: URGENT: Wire Transfer Required — Confidential
\`\`\`

**Answer:**
1. What does the authentication results section tell you?
2. What's suspicious about the Return-Path and Reply-To headers?
3. What's the country of origin indicator and why does it matter?
4. What action should you take with this email?`,
        labKeywords: ['dkim', 'spf', 'dmarc', 'fail', 'return-path', 'reply-to', 'russia', 'ru', 'authentication', 'suspicious', 'delete', 'report', 'phishing', 'wire', 'transfer'],
      },
      {
        id: 'esp-sim-1',
        title: 'CEO Fraud / BEC Email',
        type: 'SIMULATION',
        durationMin: 40,
        xpReward: 175,
        scenarioContext: 'Business Email Compromise simulation — sophisticated BEC attack targeting finance employee with fake CEO wire transfer request. Tests header analysis skills and proper escalation.',
      },
    ],
  },
  {
    id: 'spear-phishing-bec',
    title: 'Spear Phishing & BEC Defense',
    description: 'Learn to recognize and counter the most targeted, high-stakes phishing attacks facing organizations today.',
    category: 'email-security',
    difficulty: 'intermediate',
    accentColor: '#fb923c',
    modules: [
      {
        id: 'spb-lesson-1',
        title: 'Anatomy of a Spear Phishing Attack',
        type: 'LESSON',
        durationMin: 25,
        xpReward: 100,
        content: `## Anatomy of a Spear Phishing Attack

### What Makes Spear Phishing Dangerous

Unlike mass phishing, spear phishing is personalized and researched. Attackers spend hours or days studying their target before sending a single email. Success rates are 65% compared to 3% for generic phishing.

### The Intelligence Gathering Phase

**Open Source Intelligence (OSINT) sources attackers use:**

- **LinkedIn**: Your name, title, department, colleagues, manager, projects, technologies used
- **Company website**: Org chart, executive names, vendor partnerships, press releases
- **Social media**: Personal interests, recent activities, vacation schedules
- **Job postings**: Technology stack, security tools, processes
- **Public filings**: Financial information, board members, M&A activity

### Crafting the Attack

With this intelligence, attackers build:

1. **Sender spoofing** — Email appears from your manager, a known vendor, or a trusted partner
2. **Contextual relevance** — References real projects, meetings, or events you're involved in
3. **Believable pretext** — "Following up on our Q4 budget discussion from yesterday's call"
4. **Targeted request** — Specific action that fits your role (approve invoice, share document, reset credentials)

### Red Flags Despite Personalization

Even highly targeted attacks have tells:
- **Urgency** that bypasses normal process ("Don't go through procurement—I need this today")
- **Secrecy** requests ("Keep this between us for now")
- **Domain mismatch** — From: vs. Reply-To domains differ
- **Unusual request** for your role or relationship with sender
- **Out-of-character** communication style`,
      },
      {
        id: 'spb-lesson-2',
        title: 'Business Email Compromise (BEC)',
        type: 'LESSON',
        durationMin: 20,
        xpReward: 75,
        content: `## Business Email Compromise (BEC)

BEC is the most financially damaging cybercrime, costing organizations $2.9 billion annually (FBI IC3 2023). It requires no malware—just deception.

### BEC Attack Patterns

**CEO Fraud**
Attacker impersonates the CEO and emails finance requesting urgent wire transfer:
> "I'm in a meeting—need you to process $85,000 to a new vendor by EOD. Don't discuss with anyone until complete."

**Account Takeover BEC**
Attacker compromises a real email account (via credential phishing) and uses it to request fraudulent payments or data from within a trusted email chain.

**Vendor/Invoice Fraud**
Attacker impersonates a vendor and sends updated banking details: "Our bank changed—please update your records and send the next payment to..."

**Payroll Diversion**
Attacker contacts HR impersonating an employee: "I recently changed banks. Can you update my direct deposit to: [attacker account]?"

**Legal/Attorney Impersonation**
"As counsel for [Company], we require immediate wire transfer for pending litigation settlement. Confidentiality required."

### Defense Framework

**Verification**: Any payment, credential change, or sensitive data request—verify via phone call using a number from your records, not provided in the email.

**Dual Authorization**: Financial transactions over $X require two approvals from two people via two different channels.

**Out-of-Band Confirmation**: Never confirm wire transfers via email alone. Call the requester directly.

**Domain Monitoring**: Monitor for lookalike domains (company-corp.com, cornpany.com) targeting your organization.`,
      },
      {
        id: 'spb-sim-1',
        title: 'Spear Phishing Defense',
        type: 'SIMULATION',
        durationMin: 45,
        xpReward: 200,
        scenarioContext: 'Advanced spear phishing simulation — AI uses OSINT-style personalization to craft a realistic targeted attack. Trainee must identify indicators and respond appropriately despite convincing personalization.',
      },
    ],
  },
  {
    id: 'ransomware-response',
    title: 'Ransomware Response',
    description: 'Understand ransomware attacks end-to-end and master your role in detection, containment, and recovery.',
    category: 'incident-response',
    difficulty: 'intermediate',
    accentColor: '#f87171',
    modules: [
      {
        id: 'rr-lesson-1',
        title: 'How Ransomware Works',
        type: 'LESSON',
        durationMin: 25,
        xpReward: 100,
        content: `## How Ransomware Works

### The Ransomware Kill Chain

**Stage 1: Initial Access**
Usually via phishing email with malicious attachment or link. Could also be exploited public-facing service, RDP brute-force, or supply chain compromise.

**Stage 2: Execution**
User opens malicious attachment (macro-enabled Word doc, PDF with exploit, ISO file). Malware executes and establishes foothold.

**Stage 3: Persistence**
Attacker installs backdoor, creates new admin accounts, schedules tasks to survive reboots.

**Stage 4: Privilege Escalation**
Attackers dump credentials (Mimikatz), exploit local vulnerabilities, move laterally to gain domain admin.

**Stage 5: Discovery & Lateral Movement**
Map the network, identify critical systems, backup servers, and high-value data. Compromise as many systems as possible before triggering encryption.

**Stage 6: Exfiltration (Double Extortion)**
Modern ransomware groups exfiltrate data before encrypting it. This enables a second ransom threat: "Pay or we publish your data."

**Stage 7: Encryption**
Ransomware deploys to all compromised hosts simultaneously, encrypting files and dropping ransom notes.

### Average Dwell Time

Attackers spend an average of **21 days** in a network before triggering ransomware. That's 21 days of opportunity to detect and evict them.

### Ransomware-as-a-Service (RaaS)

Criminal groups sell ransomware kits to affiliates who conduct attacks and split ransoms. Lowered the barrier to entry dramatically.`,
      },
      {
        id: 'rr-lab-1',
        title: 'Ransomware Response Checklist',
        type: 'LAB',
        durationMin: 35,
        xpReward: 150,
        labPrompt: `**Scenario:** It's 2:47 PM on a Thursday. An employee calls IT in a panic—their screen shows a ransom note. All their files have been renamed to .encrypted. They can't open anything. Other employees are starting to report similar issues.

**Write your immediate response actions (first 30 minutes):**

1. What do you tell the employee to do RIGHT NOW with their computer?
2. What systems/services do you isolate or take offline immediately?
3. Who do you notify and in what order?
4. What evidence do you preserve and how?
5. Do you pay the ransom? Explain your reasoning.

Cover containment, communication, and evidence preservation in your answer.`,
        labKeywords: ['isolate', 'disconnect', 'network', 'notify', 'CISO', 'management', 'backup', 'evidence', 'logs', 'legal', 'FBI', 'ransom', 'preserve', 'forensic', 'IR team', 'incident'],
      },
      {
        id: 'rr-sim-1',
        title: 'Active Ransomware Incident',
        type: 'SIMULATION',
        durationMin: 45,
        xpReward: 200,
        scenarioContext: 'Ransomware incident simulation — trainee receives initial alert and must navigate triage, escalation, and containment decisions under time pressure.',
      },
    ],
  },
  {
    id: 'osint-threat-hunting',
    title: 'OSINT & Threat Hunting',
    description: 'Use open-source intelligence techniques to investigate threats, verify identities, and hunt for attackers.',
    category: 'advanced-threats',
    difficulty: 'advanced',
    accentColor: '#a78bfa',
    modules: [
      {
        id: 'oth-lesson-1',
        title: 'OSINT Fundamentals',
        type: 'LESSON',
        durationMin: 30,
        xpReward: 125,
        content: `## OSINT Fundamentals for Defenders

Open Source Intelligence (OSINT) is the collection and analysis of publicly available information. Defenders use it to investigate threats, verify suspicious communications, and understand attacker infrastructure.

### OSINT Sources

**Domain & IP Investigation**
- \`whois\` — Registration details, registrar, creation date
- \`nslookup / dig\` — DNS records, mail servers, SPF/DKIM configs
- **Shodan** (shodan.io) — Internet-connected devices, open ports, banners
- **VirusTotal** — Domain/IP/file reputation across 70+ security engines
- **URLscan.io** — Screenshots and analysis of URLs without visiting them

**Email Verification**
- **MXToolbox** — Email header analysis, blacklist checks, SPF/DKIM/DMARC validation
- **Hunter.io** — Verify if an email address exists at a domain
- **HaveIBeenPwned** — Check if an email appears in known breach databases

**Social & Web**
- **LinkedIn / Twitter** — Verify employee identities, company connections
- **Wayback Machine** (web.archive.org) — Historical snapshots of websites
- **Google Dorking** — Advanced Google operators to find exposed information

### Investigating a Suspicious Email

1. Extract the sender domain → check WHOIS for registration date (new domain = red flag)
2. Analyze the email header → check originating IP in VirusTotal
3. Hover the link (don't click) → paste in URLscan.io
4. Check if sender email appears in HaveIBeenPwned breach data

### Building an IOC (Indicators of Compromise) Report

Document all artifacts:
- IP addresses
- Domain names
- Email addresses
- File hashes (if attachments)
- URLs
- TTPs observed (MITRE ATT&CK framework)`,
      },
      {
        id: 'oth-sim-1',
        title: 'Threat Investigation Scenario',
        type: 'SIMULATION',
        durationMin: 50,
        xpReward: 225,
        scenarioContext: 'OSINT investigation simulation — trainee receives suspicious email and must use OSINT techniques to investigate the sender, validate the threat, build IOCs, and report findings.',
      },
    ],
  },
  {
    id: 'incident-response',
    title: 'Incident Response Playbook',
    description: 'Master the NIST incident response lifecycle and your role in detection, analysis, containment, and recovery.',
    category: 'incident-response',
    difficulty: 'intermediate',
    accentColor: '#34d399',
    modules: [
      {
        id: 'ir-lesson-1',
        title: 'NIST Incident Response Lifecycle',
        type: 'LESSON',
        durationMin: 25,
        xpReward: 100,
        content: `## NIST Incident Response Lifecycle

The NIST SP 800-61 framework defines a 4-phase approach to handling security incidents.

### Phase 1: Preparation

Before incidents happen:
- Establish an Incident Response Team (IRT) with defined roles
- Create and test IR playbooks for common scenarios
- Deploy detection tools (SIEM, EDR, email security)
- Train employees on reporting procedures
- Establish communication templates and escalation paths
- Identify critical assets and their owners

### Phase 2: Detection & Analysis

**Detection Sources:**
- SIEM alerts, EDR detections
- User reports ("I clicked something suspicious")
- SOC monitoring, threat intelligence feeds
- Automated scanning tools

**Analysis Steps:**
1. Triage — is this a real incident or false positive?
2. Scope — how many systems/users are affected?
3. Classify — incident category, severity, potential business impact
4. Prioritize — based on data sensitivity, system criticality, spread rate

**Severity Levels:**
- **P1 Critical**: Active breach, ransomware spreading, executive compromise
- **P2 High**: Confirmed malware, credential theft, data exfiltration suspected
- **P3 Medium**: Suspicious activity, policy violation, isolated compromise
- **P4 Low**: Phishing attempt (not clicked), failed attack

### Phase 3: Containment, Eradication & Recovery

**Short-term containment**: Stop the bleeding (isolate affected systems)
**Long-term containment**: Implement temporary workarounds, monitor for re-infection
**Eradication**: Remove malware, close attack vectors, patch vulnerabilities
**Recovery**: Restore systems from clean backups, verify integrity, monitor closely

### Phase 4: Post-Incident Activity

- Document everything (timeline, actions taken, lessons learned)
- Conduct blameless post-mortem
- Update playbooks based on what worked / didn't
- Brief leadership and stakeholders
- Share relevant IOCs with industry partners`,
      },
      {
        id: 'ir-lab-1',
        title: 'Incident Triage Lab',
        type: 'LAB',
        durationMin: 35,
        xpReward: 150,
        labPrompt: `Your SIEM generated these 5 alerts at 3:15 AM. You're on call. Triage each one:

1. **[HIGH]** 15 failed login attempts on admin account from IP 45.152.67.231 (Russia), then 1 success
2. **[MEDIUM]** Employee account sending 2,400 emails in 10 minutes to external domains
3. **[LOW]** Antivirus detected and quarantined "Trojan.GenericKD.47892" on a single workstation
4. **[HIGH]** Large data transfer (8.7GB) to Dropbox from the CFO's laptop at 2:58 AM
5. **[INFO]** New user account "svc_backup2" created with Domain Admin privileges

**For each alert:**
- Assign priority (P1/P2/P3/P4)
- Describe your immediate action
- Identify what additional information you need
- Specify who you escalate to`,
        labKeywords: ['P1', 'P2', 'priority', 'isolate', 'investigate', 'escalate', 'CISO', 'SOC', 'contain', 'revoke', 'block', 'forensic', 'admin', 'credentials', 'data', 'exfil'],
      },
      {
        id: 'ir-sim-1',
        title: 'Full Incident Response Drill',
        type: 'SIMULATION',
        durationMin: 50,
        xpReward: 225,
        scenarioContext: 'Multi-stage incident simulation — starts with initial phishing report and escalates through credential theft to lateral movement detection. Trainee must triage, contain, and communicate effectively.',
      },
    ],
  },
  {
    id: 'cloud-security',
    title: 'Cloud Security Awareness',
    description: 'Understand cloud-specific threats: misconfigured buckets, IAM abuse, cloud phishing, and SaaS hijacking.',
    category: 'advanced-threats',
    difficulty: 'intermediate',
    accentColor: '#38bdf8',
    modules: [
      {
        id: 'cs-lesson-1',
        title: 'Cloud Threat Landscape',
        type: 'LESSON',
        durationMin: 25,
        xpReward: 100,
        content: `## Cloud Security Threat Landscape

### Why Cloud Changes the Attack Surface

Cloud environments introduce new attack vectors that didn't exist on-premises:
- **Identity is the new perimeter** — No network boundary; IAM controls access
- **Misconfigurations** are the #1 cloud breach cause
- **Shared responsibility model** — The cloud provider secures infrastructure; you secure your data and configurations
- **SaaS proliferation** — Shadow IT and unmanaged cloud apps

### Top Cloud Attack Patterns

**1. S3 / Blob Storage Misconfiguration**
Attackers scan for publicly exposed cloud storage buckets. In 2023, over 2,000 misconfigured buckets exposed sensitive data weekly. Customer PII, source code, credentials, and backups are frequent finds.

**2. IAM Privilege Escalation**
Attacker gains initial access via phishing, then abuses overly permissive IAM roles to escalate to admin access. Cloud IAM should follow least-privilege principle.

**3. Cloud Phishing (OAuth Attacks)**
"Consent phishing" — Attacker sends link requesting OAuth permissions to a malicious app. Victim grants app access to email, calendar, files. No password needed.

**4. Compromised Cloud Credentials**
API keys, access tokens, and service account credentials committed to public GitHub repos. Attackers scan GitHub continuously for exposed credentials.

**5. Kubernetes Cluster Misconfiguration**
Exposed Kubernetes dashboards, weak RBAC policies, and container escape vulnerabilities.

### Defense Priorities

- Enable CloudTrail / audit logging for all cloud services
- Use CSPM (Cloud Security Posture Management) tools
- Enforce MFA on all cloud accounts
- Review and remove unused IAM permissions quarterly
- Never commit credentials to source control`,
      },
      {
        id: 'cs-sim-1',
        title: 'OAuth Consent Phishing',
        type: 'SIMULATION',
        durationMin: 40,
        xpReward: 175,
        scenarioContext: 'Cloud phishing simulation — OAuth consent phishing attack requesting overly broad permissions to a malicious third-party app disguised as a productivity tool.',
      },
    ],
  },
  {
    id: 'security-compliance',
    title: 'Security Compliance & Policy',
    description: 'Navigate GDPR, HIPAA, SOC 2, and ISO 27001 from a security awareness perspective.',
    category: 'compliance',
    difficulty: 'intermediate',
    accentColor: '#e879f9',
    modules: [
      {
        id: 'sc-lesson-1',
        title: 'Key Compliance Frameworks',
        type: 'LESSON',
        durationMin: 30,
        xpReward: 100,
        content: `## Key Security Compliance Frameworks

### GDPR (General Data Protection Regulation)

**Scope**: Any organization processing EU residents' personal data
**Key Requirements**:
- Lawful basis for data processing
- Data minimization (collect only what's needed)
- Right to erasure ("right to be forgotten")
- 72-hour breach notification to supervisory authority
- Data Protection Officer (DPO) for certain organizations
- Privacy by design

**Your role**: Don't share personal data unnecessarily. Report suspected breaches immediately (time limit is 72 hours from discovery).

### HIPAA (Health Insurance Portability and Accountability Act)

**Scope**: US healthcare entities and their business associates
**PHI (Protected Health Information)**: Any individually identifiable health information
**Key Requirements**:
- Technical safeguards (encryption, access controls)
- Physical safeguards (workstation security)
- Administrative safeguards (training, policies)
- Breach notification within 60 days

**Your role**: Never access patient records you don't need for treatment. Encrypt all PHI at rest and in transit.

### SOC 2

**Scope**: Service organizations handling customer data
**Trust Service Criteria**: Security, Availability, Processing Integrity, Confidentiality, Privacy
**Types**: Type I (point-in-time design) vs Type II (operational effectiveness over 6-12 months)

**Your role**: Follow documented access controls, change management processes, and security training requirements—auditors will ask.

### ISO 27001

**International standard** for Information Security Management Systems (ISMS)
- Risk-based approach to security controls
- 114 controls across 14 domains
- Requires management commitment, internal audits, continuous improvement

### PCI DSS

**Scope**: Organizations that process, store, or transmit payment card data
**12 Requirements**: Network security, access control, monitoring, testing, security policy
**Your role**: Never store CVV codes, use separate networks for card processing, report card data exposures immediately.`,
      },
      {
        id: 'sc-lab-1',
        title: 'Compliance Scenario Analysis',
        type: 'LAB',
        durationMin: 30,
        xpReward: 125,
        labPrompt: `**Scenario**: A developer at your healthcare company accidentally pushed a configuration file to a public GitHub repository. The file contained database connection strings and an API key for your patient portal. The repository was public for 3 hours before being discovered and made private.

**Answer these questions:**

1. Which compliance frameworks are potentially implicated? (List all that apply and why)
2. What's the notification timeline under each applicable framework?
3. Who needs to be notified (internal and external)?
4. What immediate technical steps should be taken?
5. What documentation must be created for compliance purposes?`,
        labKeywords: ['HIPAA', 'GDPR', 'breach', 'PHI', '72 hours', '60 days', 'notification', 'revoke', 'rotate', 'credentials', 'DPO', 'legal', 'CISO', 'documentation', 'incident'],
      },
    ],
  },
  {
    id: 'remote-mobile-security',
    title: 'Mobile & Remote Work Security',
    description: 'Secure your remote workspace: home networks, mobile devices, public Wi-Fi, and BYOD risks.',
    category: 'foundations',
    difficulty: 'beginner',
    accentColor: '#4ade80',
    modules: [
      {
        id: 'rms-lesson-1',
        title: 'Remote Work Threat Landscape',
        type: 'LESSON',
        durationMin: 20,
        xpReward: 75,
        content: `## Remote Work Security

### The Remote Work Attack Surface

Working from home expands your attack surface beyond the corporate perimeter:
- **Home network** — Shared with family devices, often unpatched routers, default credentials
- **Personal devices** — BYOD risks, no corporate EDR, potential malware
- **Physical security** — Shoulder surfing, family members seeing sensitive screens
- **Public networks** — Coffee shops, airports, hotels
- **Video conferencing** — Meeting bombing, recording risks, background information exposure

### Home Network Security

**Router security checklist:**
- Change default admin password
- Update firmware regularly
- Use WPA3 or WPA2 encryption (never WEP or open)
- Disable WPS (Wi-Fi Protected Setup — exploitable)
- Create a separate guest network for IoT devices and visitors
- Disable remote management unless needed

**What attackers do on your home network:**
- ARP spoofing to intercept traffic
- Exploit unpatched router vulnerabilities
- Compromise connected IoT devices as jumping points
- Monitor DNS queries to understand your activity

### VPN Usage

Always use the corporate VPN when accessing company resources remotely. VPN:
- Encrypts traffic from your device to the corporate network
- Prevents local network eavesdropping
- Provides corporate-grade DNS resolution (blocks malicious domains)
- Maintains audit trail of access

### Public Wi-Fi

**Never trust public Wi-Fi for sensitive work without VPN.** Attacks:
- **Evil twin access points** — Fake Starbucks Wi-Fi that captures all your traffic
- **Man-in-the-middle** — Intercepts unencrypted connections
- **Packet sniffing** — Passive capture of network traffic

### Mobile Device Security

- Enable full-disk encryption
- Use PIN/biometric with short auto-lock
- Keep OS and apps updated
- Use mobile threat defense (MTD) apps for corporate devices
- Report lost/stolen devices immediately for remote wipe`,
      },
      {
        id: 'rms-sim-1',
        title: 'Remote Work Attack Scenario',
        type: 'SIMULATION',
        durationMin: 35,
        xpReward: 150,
        scenarioContext: 'Remote work security simulation — attacker exploits home network vulnerabilities and targets remote worker with tailored phishing. Trainee must identify risks and apply secure remote work practices.',
      },
    ],
  },
  {
    id: 'advanced-persistent-threats',
    title: 'Advanced Persistent Threats',
    description: 'Study nation-state and APT group tactics, techniques, and procedures (TTPs) via the MITRE ATT&CK framework.',
    category: 'advanced-threats',
    difficulty: 'advanced',
    accentColor: '#f43f5e',
    modules: [
      {
        id: 'apt-lesson-1',
        title: 'Understanding APT Groups',
        type: 'LESSON',
        durationMin: 30,
        xpReward: 125,
        content: `## Advanced Persistent Threats (APTs)

### What Defines an APT

APTs are highly sophisticated, well-funded threat actors—usually nation-states or state-sponsored groups—conducting long-term, targeted campaigns against specific organizations.

**Characteristics:**
- **Advanced**: Use zero-days, custom malware, sophisticated evasion
- **Persistent**: Maintain access for months or years
- **Threat**: Motivated by espionage, sabotage, or IP theft—not quick financial gain

### Notable APT Groups

**APT28 (Fancy Bear / Russia / GRU)**
- Targets: NATO governments, defense contractors, political parties
- TTPs: Spear phishing, credential theft, X-Agent malware
- Notable: DNC breach (2016), Olympic Destroyer

**APT41 (China / dual nexus: state + criminal)**
- Targets: Healthcare, telecom, technology, gaming
- TTPs: Supply chain attacks, SQL injection, living off the land
- Notable: SolarWinds adjacent activity, healthcare data theft during COVID

**Lazarus Group (North Korea / DPRK)**
- Targets: Financial institutions, cryptocurrency exchanges, defense
- TTPs: Social engineering, SWIFT banking system attacks
- Notable: Bangladesh Bank heist ($81M), WannaCry attribution

**Sandworm (Russia / GRU)**
- Targets: Critical infrastructure (power grids, water treatment)
- TTPs: Destructive malware (NotPetya, Industroyer)

### MITRE ATT&CK Framework

A knowledge base of adversary tactics and techniques based on real-world observations. 14 tactics, 200+ techniques:

**Initial Access → Execution → Persistence → Privilege Escalation → Defense Evasion → Credential Access → Discovery → Lateral Movement → Collection → Exfiltration → Impact**

Use ATT&CK to:
- Map detections to known APT TTPs
- Identify gaps in your security coverage
- Threat-hunt based on known group behaviors`,
      },
      {
        id: 'apt-sim-1',
        title: 'APT Attack Chain Simulation',
        type: 'SIMULATION',
        durationMin: 55,
        xpReward: 250,
        scenarioContext: 'Advanced APT simulation — multi-stage attack chain starting with initial spear phishing, progressing through lateral movement indicators. Trainee must identify TTPs at each stage and coordinate response.',
      },
    ],
  },
];

export const BADGES: Badge[] = [
  // Completion badges
  { id: 'first-lesson', name: 'First Step', description: 'Complete your first lesson', category: 'completion', xpBonus: 25, requiredModuleCount: 1 },
  { id: 'first-simulation', name: 'Trial by Fire', description: 'Complete your first simulation', category: 'completion', xpBonus: 50 },
  { id: 'first-course', name: 'Graduate', description: 'Complete your first full course', category: 'completion', xpBonus: 100 },
  { id: 'five-courses', name: 'Scholar', description: 'Complete 5 courses', category: 'completion', xpBonus: 250 },
  { id: 'all-courses', name: 'Grand Slam', description: 'Complete all 12 courses', category: 'completion', xpBonus: 1000 },
  { id: 'foundations-complete', name: 'Security Foundation', description: 'Complete all foundations courses', category: 'completion', xpBonus: 300, requiredCourseIds: ['phishing-fundamentals', 'password-mfa', 'remote-mobile-security'] },
  { id: 'incident-complete', name: 'First Responder', description: 'Complete all incident response courses', category: 'completion', xpBonus: 350, requiredCourseIds: ['incident-response', 'ransomware-response'] },

  // Score badges
  { id: 'perfect-lab', name: 'Precision Strike', description: 'Score 100% on any lab exercise', category: 'score', xpBonus: 75 },
  { id: 'perfect-sim', name: 'Zero Defect', description: 'Score 90+ on any simulation', category: 'score', xpBonus: 100 },
  { id: 'consistent-scorer', name: 'Consistent Defender', description: 'Score 80+ on 5 consecutive exercises', category: 'score', xpBonus: 200 },

  // Specialty badges
  { id: 'phishing-detector', name: 'Phishing Detector', description: 'Complete all Phishing Fundamentals modules with 80+ score', category: 'specialty', xpBonus: 150 },
  { id: 'bec-buster', name: 'BEC Buster', description: 'Correctly identify and respond to a BEC simulation', category: 'specialty', xpBonus: 150 },
  { id: 'ransomware-defender', name: 'Ransomware Defender', description: 'Contain a simulated ransomware incident with perfect escalation', category: 'specialty', xpBonus: 200 },
  { id: 'osint-investigator', name: 'OSINT Investigator', description: 'Complete the OSINT & Threat Hunting course', category: 'specialty', xpBonus: 200, requiredCourseIds: ['osint-threat-hunting'] },
  { id: 'compliance-expert', name: 'Compliance Expert', description: 'Complete the Security Compliance course with 85+ score', category: 'specialty', xpBonus: 175 },
  { id: 'apt-analyst', name: 'APT Analyst', description: 'Complete the Advanced Persistent Threats course', category: 'specialty', xpBonus: 250, requiredCourseIds: ['advanced-persistent-threats'] },
  { id: 'social-engineer-proof', name: 'SE Proof', description: 'Complete all Social Engineering modules', category: 'specialty', xpBonus: 150, requiredCourseIds: ['social-engineering'] },

  // Level badges
  { id: 'level-2', name: 'Trainee', description: 'Reach Level 2: Trainee', category: 'completion', xpBonus: 50, requiresMinXP: 500 },
  { id: 'level-3', name: 'Security Analyst', description: 'Reach Level 3: Security Analyst', category: 'completion', xpBonus: 100, requiresMinXP: 1500 },
  { id: 'level-4', name: 'Threat Hunter', description: 'Reach Level 4: Threat Hunter', category: 'completion', xpBonus: 150, requiresMinXP: 3000 },
  { id: 'level-5', name: 'SOC Analyst', description: 'Reach Level 5: SOC Analyst', category: 'completion', xpBonus: 200, requiresMinXP: 5000 },
  { id: 'level-6', name: 'Security Lead', description: 'Reach Level 6: Security Lead', category: 'completion', xpBonus: 300, requiresMinXP: 8000 },
  { id: 'level-7', name: 'Cyber Guardian', description: 'Reach Level 7: Cyber Guardian', category: 'completion', xpBonus: 500, requiresMinXP: 12000 },

  // Streak badges
  { id: 'streak-3', name: 'On Track', description: '3-day training streak', category: 'streak', xpBonus: 50 },
  { id: 'streak-7', name: 'Week Warrior', description: '7-day training streak', category: 'streak', xpBonus: 150 },
  { id: 'streak-14', name: 'Fortnight Defender', description: '14-day training streak', category: 'streak', xpBonus: 300 },
  { id: 'streak-30', name: 'Iron Discipline', description: '30-day training streak', category: 'streak', xpBonus: 750 },
];

export interface ProgressEntry {
  completed: boolean;
  xpEarned: number;
  score?: number;
  completedAt?: string;
}

export type ClassroomProgress = Record<string, Record<string, ProgressEntry>>;

export function getTotalXP(progress: ClassroomProgress): number {
  let total = 0;
  for (const course of Object.values(progress)) {
    for (const mod of Object.values(course)) {
      total += mod.xpEarned;
    }
  }
  return total;
}

export function getCompletedModuleCount(progress: ClassroomProgress): number {
  let count = 0;
  for (const course of Object.values(progress)) {
    for (const mod of Object.values(course)) {
      if (mod.completed) count++;
    }
  }
  return count;
}

export function getCourseProgress(courseId: string, progress: ClassroomProgress): number {
  const course = COURSES.find((c) => c.id === courseId);
  if (!course) return 0;
  const courseProgress = progress[courseId] ?? {};
  const completed = course.modules.filter((m) => courseProgress[m.id]?.completed).length;
  return Math.round((completed / course.modules.length) * 100);
}

export const TRAINING_SCENARIOS = [
  // ── Beginner ──────────────────────────────────────────────────────────────
  {
    id: 'email-phishing',
    title: 'Email Phishing Response',
    description: 'An employee received a suspicious email. Practice identifying it and taking the correct action.',
    difficulty: 'beginner' as Difficulty,
    category: 'Phishing',
    xpReward: 100,
    context: 'You are a security-aware employee. The AI will present you with a suspicious email scenario and ask you to respond as you would in real life.',
  },
  {
    id: 'smishing-bank',
    title: 'Bank SMS Phishing (Smishing)',
    description: 'You receive an urgent SMS from "your bank" warning of a frozen account with a link.',
    difficulty: 'beginner' as Difficulty,
    category: 'Phishing',
    xpReward: 100,
    context: 'You receive an alarming text message that appears to be from your bank. The AI will present the smishing scenario—recognize the attack, avoid the trap, and protect your credentials.',
  },
  {
    id: 'qr-code-phishing',
    title: 'Malicious QR Code in Office',
    description: 'A QR code poster appears in the break room claiming to link to a benefits portal.',
    difficulty: 'beginner' as Difficulty,
    category: 'Phishing',
    xpReward: 100,
    context: 'You notice a new QR code poster on the office notice board. The AI presents the quishing scenario—identify the red flags and respond safely.',
  },
  {
    id: 'usb-drop',
    title: 'USB Drop Attack',
    description: 'You find a USB drive labelled "Q4 Salary Data" in the parking lot.',
    difficulty: 'beginner' as Difficulty,
    category: 'Social Engineering',
    xpReward: 100,
    context: 'You discover a USB drive in the company parking lot. The AI will walk you through the scenario—what you do next determines whether you compromise the network.',
  },

  // ── Intermediate ──────────────────────────────────────────────────────────
  {
    id: 'bec-finance',
    title: 'CEO Fraud / BEC Attack',
    description: 'A finance employee receives a wire transfer request appearing from the CEO.',
    difficulty: 'intermediate' as Difficulty,
    category: 'BEC',
    xpReward: 150,
    context: 'You are an accounts payable specialist. The AI will roleplay a BEC attack scenario where you must identify the fraud and respond correctly.',
  },
  {
    id: 'it-support-vishing',
    title: 'IT Support Vishing',
    description: 'A caller impersonates IT support and requests remote access credentials.',
    difficulty: 'intermediate' as Difficulty,
    category: 'Social Engineering',
    xpReward: 150,
    context: 'You receive a phone call from someone claiming to be IT support. Respond as you would in real life—the AI will escalate the social engineering attempt.',
  },
  {
    id: 'oauth-cloud-phishing',
    title: 'OAuth Consent Phishing',
    description: 'A cloud phishing attack requests OAuth permissions to a malicious third-party app.',
    difficulty: 'intermediate' as Difficulty,
    category: 'Cloud Security',
    xpReward: 150,
    context: 'You receive a link requesting permission for a third-party app. The AI presents the scenario—you must identify the threat and respond appropriately.',
  },
  {
    id: 'vendor-invoice-fraud',
    title: 'Vendor Invoice Fraud',
    description: 'A trusted vendor sends updated banking details just before a large payment is due.',
    difficulty: 'intermediate' as Difficulty,
    category: 'BEC',
    xpReward: 150,
    context: 'You are in Accounts Payable. An email from your regular supplier asks to update their bank details before the $120K monthly payment. The AI plays the fraudster—catch the fraud before it\'s too late.',
  },
  {
    id: 'helpdesk-reset-fraud',
    title: 'Helpdesk Password Reset Fraud',
    description: 'An attacker social-engineers the helpdesk into resetting an executive\'s password.',
    difficulty: 'intermediate' as Difficulty,
    category: 'Social Engineering',
    xpReward: 150,
    context: 'You are on the IT helpdesk. A caller claims to be the CTO, stranded abroad, locked out of their account, and under deadline pressure. The AI plays the attacker—follow correct verification procedures.',
  },
  {
    id: 'teams-meeting-hijack',
    title: 'Teams / Zoom Meeting Infiltration',
    description: 'An unknown participant joins a confidential M&A planning call and starts asking probing questions.',
    difficulty: 'intermediate' as Difficulty,
    category: 'Social Engineering',
    xpReward: 150,
    context: 'You are hosting a confidential strategy call. An unfamiliar name joins and starts asking detailed questions about the M&A target. The AI plays the attacker—detect the intrusion and respond.',
  },

  // ── Advanced ──────────────────────────────────────────────────────────────
  {
    id: 'ransomware-triage',
    title: 'Ransomware Alert Triage',
    description: 'You receive alerts indicating an active ransomware infection spreading across endpoints.',
    difficulty: 'advanced' as Difficulty,
    category: 'Incident Response',
    xpReward: 200,
    context: 'You are a SOC analyst receiving alerts. The AI will feed you incident data—triage, prioritize, and respond correctly under time pressure.',
  },
  {
    id: 'spear-phishing-exec',
    title: 'Executive Spear Phishing',
    description: 'Highly targeted spear phishing attack using personalized OSINT data about you.',
    difficulty: 'advanced' as Difficulty,
    category: 'Spear Phishing',
    xpReward: 200,
    context: 'A meticulously crafted spear phishing attack targets you with personal details. Identify the indicators despite the convincing personalization.',
  },
  {
    id: 'supply-chain-attack',
    title: 'Supply Chain Compromise Alert',
    description: 'A widely-used npm package your team depends on has been backdoored in its latest release.',
    difficulty: 'advanced' as Difficulty,
    category: 'Incident Response',
    xpReward: 225,
    context: 'You are a DevSecOps engineer. A threat intel alert flags that a popular npm dependency has been tampered with. The AI walks you through the discovery—assess impact, scope the blast radius, and respond.',
  },
  {
    id: 'insider-threat-detection',
    title: 'Insider Threat Investigation',
    description: 'UEBA alerts flag unusual bulk data downloads by a recently-resigned employee.',
    difficulty: 'advanced' as Difficulty,
    category: 'Incident Response',
    xpReward: 225,
    context: 'A resigning senior engineer triggered UEBA alerts. You must investigate the activity, determine if data exfiltration occurred, and handle the situation correctly—legally and procedurally.',
  },
  {
    id: 'azure-ad-takeover',
    title: 'Azure AD Identity Attack',
    description: 'An attacker compromises an Azure AD account and begins escalating privileges via Entra ID.',
    difficulty: 'advanced' as Difficulty,
    category: 'Cloud Security',
    xpReward: 225,
    context: 'Logs show impossible travel and new OAuth app registrations under a global admin account. You are the cloud security engineer on call. The AI feeds you real-time alerts—contain and remediate.',
  },
  {
    id: 'data-exfil-alert',
    title: 'Data Exfiltration via DLP Alert',
    description: 'DLP triggers on 14GB being uploaded to a personal Dropbox over corporate Wi-Fi.',
    difficulty: 'advanced' as Difficulty,
    category: 'Incident Response',
    xpReward: 200,
    context: 'Your DLP system triggered a critical alert. The AI presents the data exfiltration scenario—investigate, determine intent, escalate appropriately, and apply the right containment actions.',
  },
];

export const ALL_COURSES: Course[] = [...COURSES, ...EXTRA_COURSES];
