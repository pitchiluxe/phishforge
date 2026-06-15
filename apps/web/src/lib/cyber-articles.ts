export interface CyberArticle {
  id: string;
  title: string;
  category: string;
  url: string;
  summary: string;
  keyTopics: string[];
  source: string;
}

export const CYBER_ARTICLES: CyberArticle[] = [
  // ── PHISHING & SOCIAL ENGINEERING ────────────────────────────────────────
  {
    id: 'art-001',
    title: 'Phishing and Other Online Scams | CISA',
    category: 'Phishing & Social Engineering',
    url: 'https://www.cisa.gov/topics/cyber-threats-and-advisories/phishing',
    summary: 'CISA\'s official guidance on recognizing and avoiding phishing attacks, including email, SMS, and voice phishing techniques used by threat actors.',
    keyTopics: ['phishing', 'smishing', 'vishing', 'spear phishing', 'awareness', 'CISA'],
    source: 'CISA',
  },
  {
    id: 'art-002',
    title: 'OWASP Top 10 — A07: Identification and Authentication Failures',
    category: 'Phishing & Social Engineering',
    url: 'https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/',
    summary: 'OWASP\'s detailed breakdown of authentication vulnerabilities, covering credential stuffing, brute force, session fixation, and weak password storage.',
    keyTopics: ['authentication', 'credential stuffing', 'brute force', 'session management', 'OWASP'],
    source: 'OWASP',
  },
  {
    id: 'art-003',
    title: 'Business Email Compromise: The $50 Billion Scam | FBI IC3',
    category: 'Phishing & Social Engineering',
    url: 'https://www.ic3.gov/PSA/2023/PSA230609',
    summary: 'FBI Internet Crime Complaint Center (IC3) advisory on Business Email Compromise attacks, statistics, and prevention measures for organizations.',
    keyTopics: ['BEC', 'wire fraud', 'email compromise', 'social engineering', 'FBI'],
    source: 'FBI IC3',
  },
  {
    id: 'art-004',
    title: 'How to Recognize and Avoid Phishing Scams | FTC',
    category: 'Phishing & Social Engineering',
    url: 'https://consumer.ftc.gov/articles/how-recognize-and-avoid-phishing-scams',
    summary: 'FTC guide for identifying phishing attempts, with practical examples of real phishing emails and steps to take if you clicked a malicious link.',
    keyTopics: ['phishing recognition', 'email security', 'consumer protection', 'FTC', 'reporting'],
    source: 'FTC',
  },

  // ── MALWARE & RANSOMWARE ─────────────────────────────────────────────────
  {
    id: 'art-005',
    title: 'CISA Ransomware Guide | StopRansomware.gov',
    category: 'Malware & Ransomware',
    url: 'https://www.cisa.gov/stopransomware/ransomware-guide',
    summary: 'Comprehensive CISA guide on ransomware prevention, detection, and response. Covers backup strategies, network segmentation, and incident response for ransomware attacks.',
    keyTopics: ['ransomware', 'backup', 'incident response', 'CISA', 'prevention', 'recovery'],
    source: 'CISA',
  },
  {
    id: 'art-006',
    title: 'MITRE ATT&CK — Ransomware Technique Mapping',
    category: 'Malware & Ransomware',
    url: 'https://attack.mitre.org/techniques/T1486/',
    summary: 'MITRE ATT&CK documentation for T1486 — Data Encrypted for Impact. Covers how ransomware encrypts files and the detection data sources available.',
    keyTopics: ['ransomware', 'T1486', 'MITRE ATT&CK', 'data encryption', 'detection'],
    source: 'MITRE ATT&CK',
  },
  {
    id: 'art-007',
    title: 'Understanding Malware | SANS Reading Room',
    category: 'Malware & Ransomware',
    url: 'https://www.sans.org/reading-room/whitepapers/malicious/',
    summary: 'SANS Institute whitepapers on malware analysis techniques, covering static and dynamic analysis, behavioral indicators, and malware classification.',
    keyTopics: ['malware analysis', 'static analysis', 'dynamic analysis', 'SANS', 'behavioral indicators'],
    source: 'SANS',
  },
  {
    id: 'art-008',
    title: 'LockBit Ransomware Threat Actor Profile | CISA Advisory',
    category: 'Malware & Ransomware',
    url: 'https://www.cisa.gov/news-events/cybersecurity-advisories/aa23-165a',
    summary: 'Joint CISA advisory on LockBit ransomware-as-a-service operations, TTPs, and recommended defenses. Includes IOCs and MITRE ATT&CK mapping.',
    keyTopics: ['LockBit', 'ransomware-as-a-service', 'TTPs', 'IOCs', 'CISA advisory'],
    source: 'CISA',
  },

  // ── NETWORK SECURITY ─────────────────────────────────────────────────────
  {
    id: 'art-009',
    title: 'NIST SP 800-41 Rev 1 — Guidelines on Firewalls and Firewall Policy',
    category: 'Network Security',
    url: 'https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-41r1.pdf',
    summary: 'NIST guidelines on firewall types, architectures, and policies. Covers packet filtering, stateful inspection, and application-layer firewalls with rule design principles.',
    keyTopics: ['firewall', 'firewall policy', 'stateful inspection', 'NIST', 'network security'],
    source: 'NIST',
  },
  {
    id: 'art-010',
    title: 'Zero Trust Architecture | NIST SP 800-207',
    category: 'Network Security',
    url: 'https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-207.pdf',
    summary: 'NIST\'s definitive guide to Zero Trust Architecture. Defines core ZTA tenets, logical components, deployment models, and migration strategies from perimeter-based security.',
    keyTopics: ['Zero Trust', 'ZTA', 'micro-segmentation', 'identity-centric', 'NIST SP 800-207'],
    source: 'NIST',
  },
  {
    id: 'art-011',
    title: 'DNS Best Practices, Network Protections, and Attack Identification | CISA',
    category: 'Network Security',
    url: 'https://www.cisa.gov/news-events/alerts/2019/01/16/dns-infrastructure-tampering',
    summary: 'CISA advisory on DNS infrastructure tampering attacks, including DNS hijacking, BGP route manipulation, and recommended protective controls.',
    keyTopics: ['DNS security', 'DNS hijacking', 'DNSSEC', 'BGP', 'CISA'],
    source: 'CISA',
  },
  {
    id: 'art-012',
    title: 'Understanding DDoS Attacks | Cloudflare Learning Center',
    category: 'Network Security',
    url: 'https://www.cloudflare.com/learning/ddos/what-is-a-ddos-attack/',
    summary: 'Comprehensive guide to DDoS attack types (volumetric, protocol, application-layer), amplification attacks, and mitigation strategies including anycast and scrubbing centers.',
    keyTopics: ['DDoS', 'volumetric attack', 'amplification', 'anycast', 'mitigation'],
    source: 'Cloudflare',
  },

  // ── IDENTITY & ACCESS MANAGEMENT ─────────────────────────────────────────
  {
    id: 'art-013',
    title: 'NIST Digital Identity Guidelines | NIST SP 800-63B',
    category: 'Identity & Access Management',
    url: 'https://pages.nist.gov/800-63-3/sp800-63b.html',
    summary: 'NIST guidelines for authenticator types and assurance levels. The authoritative reference for password policies, MFA requirements, and authenticator lifecycle management.',
    keyTopics: ['digital identity', 'password', 'MFA', 'authenticator', 'NIST SP 800-63B', 'IAL'],
    source: 'NIST',
  },
  {
    id: 'art-014',
    title: 'Implementing Phishing-Resistant MFA | CISA',
    category: 'Identity & Access Management',
    url: 'https://www.cisa.gov/sites/default/files/publications/fact-sheet-implementing-phishing-resistant-mfa-508c.pdf',
    summary: 'CISA fact sheet explaining phishing-resistant MFA options (FIDO2, smart cards), the weakness of SMS/TOTP under advanced attacks, and implementation guidance.',
    keyTopics: ['phishing-resistant MFA', 'FIDO2', 'WebAuthn', 'MFA fatigue', 'CISA'],
    source: 'CISA',
  },
  {
    id: 'art-015',
    title: 'Active Directory Security Best Practices | Microsoft',
    category: 'Identity & Access Management',
    url: 'https://docs.microsoft.com/en-us/windows-server/identity/ad-ds/plan/security-best-practices/best-practices-for-securing-active-directory',
    summary: 'Microsoft\'s official Active Directory hardening guide covering privileged access workstations, tiered administration model, credential theft prevention, and attack path reduction.',
    keyTopics: ['Active Directory', 'privileged access', 'tier model', 'credential theft', 'PAW'],
    source: 'Microsoft',
  },
  {
    id: 'art-016',
    title: 'CIS Control 5: Account Management',
    category: 'Identity & Access Management',
    url: 'https://www.cisecurity.org/controls/account-management',
    summary: 'CIS Control 5 implementation guidance for account lifecycle management, covering provisioning, MFA, service accounts, and privileged account monitoring.',
    keyTopics: ['account management', 'lifecycle', 'MFA', 'service account', 'CIS Controls'],
    source: 'CIS',
  },

  // ── INCIDENT RESPONSE ────────────────────────────────────────────────────
  {
    id: 'art-017',
    title: 'NIST SP 800-61 Rev 2 — Computer Security Incident Handling Guide',
    category: 'Incident Response',
    url: 'https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-61r2.pdf',
    summary: 'The gold standard reference for incident response. Covers the IR lifecycle (preparation, detection, containment, eradication, recovery), IR team structures, and communication guidelines.',
    keyTopics: ['incident response', 'IR lifecycle', 'containment', 'eradication', 'NIST SP 800-61'],
    source: 'NIST',
  },
  {
    id: 'art-018',
    title: 'SANS Incident Response Process | SANS Institute',
    category: 'Incident Response',
    url: 'https://www.sans.org/blog/incident-response-plan/',
    summary: 'SANS six-step incident response framework: Preparation, Identification, Containment, Eradication, Recovery, and Lessons Learned. Includes templates and best practices.',
    keyTopics: ['PICERL', 'incident response', 'SANS', 'preparation', 'lessons learned', 'playbook'],
    source: 'SANS',
  },
  {
    id: 'art-019',
    title: 'Data Breach Response — FTC Guidance',
    category: 'Incident Response',
    url: 'https://www.ftc.gov/business-guidance/resources/data-breach-response-guide-business',
    summary: 'FTC guide for business data breach response, covering immediate steps, notification requirements, consumer protection measures, and working with law enforcement.',
    keyTopics: ['data breach', 'breach notification', 'FTC', 'consumer protection', 'law enforcement'],
    source: 'FTC',
  },
  {
    id: 'art-020',
    title: 'Cloud Forensics & Incident Response | AWS Security Blog',
    category: 'Incident Response',
    url: 'https://aws.amazon.com/blogs/security/category/security-identity-compliance/incident-response/',
    summary: 'AWS Security Blog articles on cloud incident response techniques, including evidence collection from cloud services, containment strategies, and automated response using Lambda.',
    keyTopics: ['cloud IR', 'AWS', 'forensics', 'CloudTrail', 'automated response', 'Lambda'],
    source: 'AWS',
  },

  // ── CLOUD SECURITY ───────────────────────────────────────────────────────
  {
    id: 'art-021',
    title: 'CIS AWS Foundations Benchmark',
    category: 'Cloud Security',
    url: 'https://www.cisecurity.org/benchmark/amazon_web_services',
    summary: 'CIS Benchmark for AWS covering 49 security controls across IAM, logging, networking, and monitoring. The industry-standard baseline for AWS account security.',
    keyTopics: ['CIS benchmark', 'AWS', 'IAM', 'CloudTrail', 'security baseline', 'compliance'],
    source: 'CIS',
  },
  {
    id: 'art-022',
    title: 'AWS Security Best Practices Whitepaper',
    category: 'Cloud Security',
    url: 'https://docs.aws.amazon.com/whitepapers/latest/aws-security-best-practices/welcome.html',
    summary: 'AWS comprehensive security best practices covering IAM, data protection, infrastructure security, detective controls, and incident response in the AWS cloud.',
    keyTopics: ['AWS security', 'IAM', 'data protection', 'detective controls', 'Well-Architected'],
    source: 'AWS',
  },
  {
    id: 'art-023',
    title: 'Google Cloud Security Foundations Guide',
    category: 'Cloud Security',
    url: 'https://services.google.com/fh/files/misc/google-cloud-security-foundations-guide.pdf',
    summary: 'Google\'s prescriptive security foundations for GCP, covering organization structure, IAM, network security, logging, and detective controls.',
    keyTopics: ['GCP', 'Google Cloud', 'security foundations', 'IAM', 'logging', 'VPC'],
    source: 'Google Cloud',
  },
  {
    id: 'art-024',
    title: 'Container Security | NIST SP 800-190',
    category: 'Cloud Security',
    url: 'https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-190.pdf',
    summary: 'NIST guidance on application container security, covering image risks, registry threats, orchestrator security, container runtime vulnerabilities, and host OS hardening.',
    keyTopics: ['containers', 'Docker', 'Kubernetes', 'container security', 'registry', 'NIST'],
    source: 'NIST',
  },
  {
    id: 'art-025',
    title: 'Securing the Software Supply Chain | CISA/NSA Joint Guide',
    category: 'Cloud Security',
    url: 'https://www.cisa.gov/resources-tools/resources/securing-software-supply-chain-recommended-practices-developers',
    summary: 'Joint CISA/NSA/ODNI guidance on software supply chain security, covering secure development practices, SBOM requirements, vendor assessment, and open-source risks.',
    keyTopics: ['supply chain', 'SBOM', 'secure development', 'open source', 'vendor risk', 'CISA'],
    source: 'CISA/NSA',
  },

  // ── VULNERABILITY MANAGEMENT ─────────────────────────────────────────────
  {
    id: 'art-026',
    title: 'CISA Known Exploited Vulnerabilities Catalog',
    category: 'Vulnerability Management',
    url: 'https://www.cisa.gov/known-exploited-vulnerabilities-catalog',
    summary: 'CISA\'s living catalog of vulnerabilities that are actively exploited in the wild. All federal agencies must patch KEV vulnerabilities within 2 weeks. Essential prioritization resource for any security team.',
    keyTopics: ['KEV', 'known exploited vulnerabilities', 'patching', 'CISA', 'prioritization'],
    source: 'CISA',
  },
  {
    id: 'art-027',
    title: 'NVD — National Vulnerability Database',
    category: 'Vulnerability Management',
    url: 'https://nvd.nist.gov/',
    summary: 'NIST National Vulnerability Database — the U.S. government repository of standards-based vulnerability management data. Search CVEs, CVSS scores, and remediation guidance.',
    keyTopics: ['CVE', 'CVSS', 'NVD', 'vulnerability', 'patch', 'NIST'],
    source: 'NIST NVD',
  },
  {
    id: 'art-028',
    title: 'CVSS v3.1 Specification | FIRST',
    category: 'Vulnerability Management',
    url: 'https://www.first.org/cvss/specification-document',
    summary: 'Official CVSS v3.1 specification. Covers base, temporal, and environmental metrics for vulnerability scoring. Essential for understanding how vulnerabilities are prioritized.',
    keyTopics: ['CVSS', 'vulnerability scoring', 'base score', 'temporal', 'environmental', 'FIRST'],
    source: 'FIRST',
  },

  // ── WEB APPLICATION SECURITY ─────────────────────────────────────────────
  {
    id: 'art-029',
    title: 'OWASP Top 10 — Web Application Security Risks',
    category: 'Web Application Security',
    url: 'https://owasp.org/www-project-top-ten/',
    summary: 'OWASP Top 10 2021 — the most critical web application security risks. Essential reading for developers and security teams. Includes CWE mappings, example attack scenarios, and prevention guidance.',
    keyTopics: ['OWASP Top 10', 'web security', 'injection', 'broken access control', 'XSS', 'cryptographic failures'],
    source: 'OWASP',
  },
  {
    id: 'art-030',
    title: 'OWASP API Security Top 10',
    category: 'Web Application Security',
    url: 'https://owasp.org/www-project-api-security/',
    summary: 'OWASP API Security Top 10 2023 — critical API security risks including BOLA, broken authentication, mass assignment, and SSRF. Includes attack scenarios and prevention.',
    keyTopics: ['API security', 'BOLA', 'IDOR', 'mass assignment', 'SSRF', 'OWASP'],
    source: 'OWASP',
  },
  {
    id: 'art-031',
    title: 'SQL Injection Prevention Cheat Sheet | OWASP',
    category: 'Web Application Security',
    url: 'https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html',
    summary: 'OWASP cheat sheet covering SQL injection attack types, parameterized query examples in multiple languages, stored procedure safety, and additional defense layers.',
    keyTopics: ['SQL injection', 'parameterized query', 'prepared statement', 'ORM', 'OWASP', 'prevention'],
    source: 'OWASP',
  },
  {
    id: 'art-032',
    title: 'Content Security Policy (CSP) | MDN Web Docs',
    category: 'Web Application Security',
    url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP',
    summary: 'Mozilla MDN comprehensive guide to Content Security Policy — the HTTP header that prevents XSS attacks. Covers directives, nonces, hashes, and reporting.',
    keyTopics: ['CSP', 'Content Security Policy', 'XSS prevention', 'nonce', 'script-src', 'MDN'],
    source: 'MDN',
  },

  // ── THREAT INTELLIGENCE ──────────────────────────────────────────────────
  {
    id: 'art-033',
    title: 'MITRE ATT&CK Enterprise Matrix',
    category: 'Threat Intelligence',
    url: 'https://attack.mitre.org/matrices/enterprise/',
    summary: 'The MITRE ATT&CK Enterprise Matrix — the comprehensive knowledge base of adversary tactics and techniques. Covers 14 tactic categories and 200+ techniques with real-world examples.',
    keyTopics: ['MITRE ATT&CK', 'TTPs', 'tactics', 'techniques', 'adversary behavior', 'detection'],
    source: 'MITRE',
  },
  {
    id: 'art-034',
    title: 'Diamond Model of Intrusion Analysis',
    category: 'Threat Intelligence',
    url: 'https://www.threatintel.academy/wp-content/uploads/2020/07/diamond-model.pdf',
    summary: 'The Diamond Model framework for analyzing intrusion events, relating adversary, capability, infrastructure, and victim in a structured intelligence model.',
    keyTopics: ['Diamond Model', 'threat intelligence', 'intrusion analysis', 'adversary', 'infrastructure'],
    source: 'Threat Intel Academy',
  },
  {
    id: 'art-035',
    title: 'Structured Threat Information Expression (STIX) | OASIS',
    category: 'Threat Intelligence',
    url: 'https://oasis-open.github.io/cti-documentation/stix/intro',
    summary: 'Introduction to STIX 2.1 — the standard format for expressing cyber threat intelligence. Covers objects, relationships, and TAXII transport for sharing intelligence.',
    keyTopics: ['STIX', 'TAXII', 'threat sharing', 'IOC format', 'intelligence standard', 'OASIS'],
    source: 'OASIS',
  },
  {
    id: 'art-036',
    title: 'Krebs on Security — Latest Threat Research',
    category: 'Threat Intelligence',
    url: 'https://krebsonsecurity.com/',
    summary: 'Brian Krebs\'s investigative security journalism covering cybercrime operations, data breaches, threat actor profiles, and emerging attack campaigns.',
    keyTopics: ['cybercrime', 'threat actor', 'data breach', 'investigative journalism', 'Krebs'],
    source: 'Krebs on Security',
  },
  {
    id: 'art-037',
    title: 'Bleeping Computer — Security News & Ransomware Tracker',
    category: 'Threat Intelligence',
    url: 'https://www.bleepingcomputer.com/tag/ransomware/',
    summary: 'Bleeping Computer\'s ransomware coverage — the most comprehensive public tracker of ransomware attacks, new variants, negotiation details, and decryptor releases.',
    keyTopics: ['ransomware', 'threat news', 'decryptor', 'ransomware tracker', 'incident news'],
    source: 'Bleeping Computer',
  },

  // ── COMPLIANCE & GOVERNANCE ───────────────────────────────────────────────
  {
    id: 'art-038',
    title: 'NIST Cybersecurity Framework 2.0',
    category: 'Compliance & Governance',
    url: 'https://www.nist.gov/cyberframework',
    summary: 'NIST CSF 2.0 — the most widely adopted cybersecurity framework. Covers Govern, Identify, Protect, Detect, Respond, and Recover functions with implementation examples.',
    keyTopics: ['NIST CSF', 'cybersecurity framework', 'GRC', 'risk management', 'implementation tiers'],
    source: 'NIST',
  },
  {
    id: 'art-039',
    title: 'PCI DSS v4.0 Quick Reference Guide',
    category: 'Compliance & Governance',
    url: 'https://www.pcisecuritystandards.org/document_library/',
    summary: 'PCI Security Standards Council resources including the PCI DSS v4.0 standard, SAQ types, implementation guidance, and FAQs for merchants and service providers.',
    keyTopics: ['PCI DSS', 'cardholder data', 'compliance', 'SAQ', 'QSA', 'tokenization'],
    source: 'PCI SSC',
  },
  {
    id: 'art-040',
    title: 'GDPR Compliance Guide | ICO (UK)',
    category: 'Compliance & Governance',
    url: 'https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/',
    summary: 'UK ICO\'s comprehensive GDPR compliance guide for organizations, covering lawful basis for processing, data subject rights, breach notification, DPIAs, and international transfers.',
    keyTopics: ['GDPR', 'data protection', 'breach notification', 'DPIA', 'data subject rights', 'ICO'],
    source: 'ICO',
  },
  {
    id: 'art-041',
    title: 'HIPAA Security Rule Summary | HHS',
    category: 'Compliance & Governance',
    url: 'https://www.hhs.gov/hipaa/for-professionals/security/laws-regulations/index.html',
    summary: 'HHS summary of the HIPAA Security Rule, covering required and addressable implementation specifications for administrative, physical, and technical safeguards for ePHI.',
    keyTopics: ['HIPAA', 'PHI', 'Security Rule', 'administrative safeguards', 'technical safeguards', 'HHS'],
    source: 'HHS',
  },

  // ── SECURE DEVELOPMENT ────────────────────────────────────────────────────
  {
    id: 'art-042',
    title: 'OWASP Secure Coding Practices Quick Reference',
    category: 'Secure Development',
    url: 'https://owasp.org/www-project-secure-coding-practices-quick-reference-guide/',
    summary: 'OWASP quick reference for secure coding, covering input validation, output encoding, authentication, session management, access control, and cryptography best practices.',
    keyTopics: ['secure coding', 'input validation', 'output encoding', 'OWASP', 'developer security'],
    source: 'OWASP',
  },
  {
    id: 'art-043',
    title: 'NIST Secure Software Development Framework (SSDF)',
    category: 'Secure Development',
    url: 'https://csrc.nist.gov/projects/ssdf',
    summary: 'NIST SP 800-218 SSDF — framework for integrating security practices into software development. Covers preparation, protection, production, and response practices.',
    keyTopics: ['SSDF', 'SSDLC', 'secure development', 'DevSecOps', 'NIST SP 800-218'],
    source: 'NIST',
  },
  {
    id: 'art-044',
    title: 'GitHub Advanced Security | Code Scanning Documentation',
    category: 'Secure Development',
    url: 'https://docs.github.com/en/code-security/code-scanning/introduction-to-code-scanning/about-code-scanning',
    summary: 'GitHub documentation on automated code scanning using CodeQL and third-party tools. Covers SAST setup, custom queries, and CI/CD integration for pull request security checks.',
    keyTopics: ['code scanning', 'CodeQL', 'SAST', 'GitHub Actions', 'DevSecOps', 'CI/CD'],
    source: 'GitHub',
  },

  // ── CRYPTOGRAPHY ──────────────────────────────────────────────────────────
  {
    id: 'art-045',
    title: 'Cryptographic Standards & Guidelines | NIST',
    category: 'Cryptography',
    url: 'https://csrc.nist.gov/projects/cryptographic-standards-and-guidelines',
    summary: 'NIST\'s approved cryptographic standards including AES, SHA-3, ECDSA, RSA, and post-quantum cryptography candidates. Essential reference for cryptographic algorithm selection.',
    keyTopics: ['AES', 'SHA-3', 'RSA', 'ECDSA', 'post-quantum', 'NIST cryptography'],
    source: 'NIST',
  },
  {
    id: 'art-046',
    title: 'TLS 1.3 Configuration Guide | Mozilla',
    category: 'Cryptography',
    url: 'https://ssl-config.mozilla.org/',
    summary: 'Mozilla\'s SSL/TLS configuration generator with modern, intermediate, and old profiles. Provides server configurations for nginx, Apache, HAProxy with correct cipher suites.',
    keyTopics: ['TLS 1.3', 'cipher suite', 'SSL configuration', 'nginx', 'Mozilla', 'HTTPS'],
    source: 'Mozilla',
  },

  // ── ENDPOINT SECURITY ─────────────────────────────────────────────────────
  {
    id: 'art-047',
    title: 'CIS Benchmarks — Windows 11 Enterprise',
    category: 'Endpoint Security',
    url: 'https://www.cisecurity.org/benchmark/microsoft_windows_desktop',
    summary: 'CIS Benchmark for Windows 11 with 400+ security configuration recommendations covering account policies, audit policy, user rights, security options, and Windows Defender settings.',
    keyTopics: ['CIS benchmark', 'Windows hardening', 'Group Policy', 'Windows Defender', 'endpoint security'],
    source: 'CIS',
  },
  {
    id: 'art-048',
    title: 'Microsoft Security Baselines | Microsoft Learn',
    category: 'Endpoint Security',
    url: 'https://learn.microsoft.com/en-us/windows/security/operating-system-security/device-management/windows-security-configuration-framework/windows-security-baselines',
    summary: 'Microsoft\'s official security configuration baselines for Windows, Windows Server, Microsoft 365, and Azure. Importable GPO packages for rapid deployment.',
    keyTopics: ['security baseline', 'GPO', 'Windows Server', 'Microsoft 365', 'hardening'],
    source: 'Microsoft',
  },
  {
    id: 'art-049',
    title: 'LOLBAS Project — Living Off the Land Binaries',
    category: 'Endpoint Security',
    url: 'https://lolbas-project.github.io/',
    summary: 'Comprehensive community-maintained catalog of Windows binaries and scripts that can be used by attackers to execute, download, bypass, or persist. Essential for defenders building detection rules.',
    keyTopics: ['LOLBins', 'living off the land', 'defense evasion', 'Windows binaries', 'AppLocker bypass'],
    source: 'LOLBAS Project',
  },
  {
    id: 'art-050',
    title: 'Threat Hunting with Sysmon | SANS',
    category: 'Endpoint Security',
    url: 'https://www.sans.org/blog/sysmon-threat-hunting/',
    summary: 'SANS guide to deploying Sysmon for enhanced Windows endpoint visibility. Covers event ID reference, recommended configuration, and threat hunting use cases.',
    keyTopics: ['Sysmon', 'threat hunting', 'Windows telemetry', 'process creation', 'SANS'],
    source: 'SANS',
  },

  // ── SOC & DETECTION ──────────────────────────────────────────────────────
  {
    id: 'art-051',
    title: 'Sigma — Generic SIEM Rule Language',
    category: 'SOC & Detection',
    url: 'https://sigmahq.io/',
    summary: 'Official Sigma project documentation and rule repository. Sigma is the standard generic detection rule language that compiles to Splunk SPL, KQL, Elastic DSL, and others.',
    keyTopics: ['Sigma', 'SIEM rules', 'detection engineering', 'KQL', 'SPL', 'Elastic'],
    source: 'SigmaHQ',
  },
  {
    id: 'art-052',
    title: 'Splunk Security Essentials App',
    category: 'SOC & Detection',
    url: 'https://splunkbase.splunk.com/app/3435',
    summary: 'Splunk Security Essentials provides 300+ security content detections mapped to MITRE ATT&CK. Includes maturity scoring, data source requirements, and guided onboarding.',
    keyTopics: ['Splunk', 'detection content', 'MITRE ATT&CK', 'security operations', 'data sources'],
    source: 'Splunk',
  },
  {
    id: 'art-053',
    title: 'Microsoft Sentinel — Detection Templates',
    category: 'SOC & Detection',
    url: 'https://github.com/Azure/Azure-Sentinel/tree/master/Detections',
    summary: 'Microsoft\'s open-source Sentinel detection rule library with 500+ KQL queries covering Azure AD, Office 365, Sysmon, AWS, and more. Mapped to MITRE ATT&CK.',
    keyTopics: ['Microsoft Sentinel', 'KQL', 'detection rules', 'Azure', 'MITRE ATT&CK'],
    source: 'Microsoft',
  },
  {
    id: 'art-054',
    title: 'The Pyramid of Pain — David Bianco',
    category: 'SOC & Detection',
    url: 'http://detect-respond.blogspot.com/2013/03/the-pyramid-of-pain.html',
    summary: 'The foundational blog post on the Pyramid of Pain — explaining why TTPs are more valuable for detection than file hashes or IPs, and how to make life harder for attackers.',
    keyTopics: ['Pyramid of Pain', 'IOC', 'TTP', 'detection strategy', 'threat intelligence'],
    source: 'David Bianco',
  },

  // ── OSINT ─────────────────────────────────────────────────────────────────
  {
    id: 'art-055',
    title: 'OSINT Framework | osintframework.com',
    category: 'OSINT',
    url: 'https://osintframework.com/',
    summary: 'Comprehensive OSINT tool and resource taxonomy organized by intelligence category — usernames, email, domain, IP, images, social networks, and more.',
    keyTopics: ['OSINT', 'intelligence gathering', 'reconnaissance', 'domain research', 'social media'],
    source: 'OSINT Framework',
  },
  {
    id: 'art-056',
    title: 'Shodan — The Search Engine for IoT/Exposed Services',
    category: 'OSINT',
    url: 'https://www.shodan.io/explore',
    summary: 'Shodan indexes internet-connected devices and services. Used by security researchers to identify exposed industrial systems, vulnerable services, and attack surface mapping.',
    keyTopics: ['Shodan', 'attack surface', 'IoT', 'exposed services', 'internet scanning', 'recon'],
    source: 'Shodan',
  },
  {
    id: 'art-057',
    title: 'Have I Been Pwned | Troy Hunt',
    category: 'OSINT',
    url: 'https://haveibeenpwned.com/',
    summary: 'Have I Been Pwned (HIBP) allows individuals and organizations to check if their email addresses appear in known data breaches. Also provides notification and API services.',
    keyTopics: ['data breach', 'credential exposure', 'HIBP', 'email lookup', 'breach notification'],
    source: 'Have I Been Pwned',
  },

  // ── PHYSICAL SECURITY ─────────────────────────────────────────────────────
  {
    id: 'art-058',
    title: 'Physical Security Controls | NIST SP 800-116',
    category: 'Physical Security',
    url: 'https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-116.pdf',
    summary: 'NIST guidance on physical access control systems using PIV credentials, covering reader types, door hardware, visitor management, and credential lifecycle.',
    keyTopics: ['physical security', 'access control', 'PIV', 'badge', 'visitor management', 'NIST'],
    source: 'NIST',
  },

  // ── EMERGING THREATS ─────────────────────────────────────────────────────
  {
    id: 'art-059',
    title: 'AI Security Risks & Best Practices | OWASP LLM Top 10',
    category: 'Emerging Threats',
    url: 'https://owasp.org/www-project-top-10-for-large-language-model-applications/',
    summary: 'OWASP Top 10 for Large Language Model Applications — covering prompt injection, insecure output handling, training data poisoning, and LLM-specific vulnerabilities.',
    keyTopics: ['LLM security', 'prompt injection', 'AI security', 'OWASP LLM Top 10', 'GenAI'],
    source: 'OWASP',
  },
  {
    id: 'art-060',
    title: 'Defending Against Prompt Injection in AI Systems | NIST',
    category: 'Emerging Threats',
    url: 'https://airc.nist.gov/Docs/1',
    summary: 'NIST AI Risk Management Framework covering risks specific to AI systems including adversarial attacks, model evasion, data poisoning, and AI security controls.',
    keyTopics: ['AI security', 'prompt injection', 'adversarial ML', 'NIST AI RMF', 'model security'],
    source: 'NIST',
  },
  {
    id: 'art-061',
    title: 'Post-Quantum Cryptography Standards | NIST',
    category: 'Emerging Threats',
    url: 'https://csrc.nist.gov/projects/post-quantum-cryptography',
    summary: 'NIST\'s post-quantum cryptography standardization project. CRYSTALS-Kyber (key encapsulation) and CRYSTALS-Dilithium (signatures) are the primary new standards replacing RSA/ECC.',
    keyTopics: ['post-quantum', 'CRYSTALS-Kyber', 'quantum computing', 'cryptography migration', 'NIST PQC'],
    source: 'NIST',
  },
  {
    id: 'art-062',
    title: 'Volt Typhoon — Chinese APT Threat to Critical Infrastructure | CISA',
    category: 'Emerging Threats',
    url: 'https://www.cisa.gov/news-events/cybersecurity-advisories/aa23-144a',
    summary: 'CISA/NSA/FBI joint advisory on Volt Typhoon (state-sponsored Chinese APT) tactics targeting U.S. critical infrastructure using LOLBins and living-off-the-land techniques.',
    keyTopics: ['Volt Typhoon', 'APT', 'critical infrastructure', 'LOLBins', 'China', 'CISA advisory'],
    source: 'CISA',
  },
];

export function searchCyberArticles(query: string, category?: string): CyberArticle[] {
  const q = query.toLowerCase();
  return CYBER_ARTICLES.filter(a => {
    const matchesQuery = !query ||
      a.title.toLowerCase().includes(q) ||
      a.summary.toLowerCase().includes(q) ||
      a.keyTopics.some(t => t.toLowerCase().includes(q)) ||
      a.category.toLowerCase().includes(q) ||
      a.source.toLowerCase().includes(q);
    const matchesCategory = !category || a.category === category;
    return matchesQuery && matchesCategory;
  });
}

export function getArticleCategories(): string[] {
  return [...new Set(CYBER_ARTICLES.map(a => a.category))];
}
