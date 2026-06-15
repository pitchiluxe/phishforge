import { getSafeClient } from '@/lib/supabase/safe';
import { Header } from '@/components/layout/header';
import { TemplateGrid } from '@/components/templates/template-grid';
import { Plus } from 'lucide-react';
import Link from 'next/link';

const MONO = { fontFamily: 'var(--font-fira-code), monospace' } as const;

const T = (id: string, name: string, subject: string, industry: string, difficulty: number, safety_score: number, description: string, ai_generated = false) =>
  ({ id, name, subject, industry, difficulty, safety_score, ai_generated, is_public: true, created_at: new Date().toISOString(), description });

const SAMPLE_TEMPLATES = [
  // ── IT / Credential Harvest ──────────────────────────────────────
  T('t01', 'IT Password Reset', 'Action Required: Reset Your Password', 'technology', 2, 92, 'Standard IT password reset notification. Redirects to a credential-harvesting portal.'),
  T('t02', 'Microsoft 365 Suspension', 'Your Microsoft account has been suspended', 'technology', 3, 85, 'Fake M365 account suspension email with urgent call to verify credentials.'),
  T('t03', 'Google Workspace Login Alert', 'New sign-in to your Google account', 'technology', 2, 90, 'Spoofed Google security alert claiming suspicious login from unknown device.'),
  T('t04', 'Okta MFA Required', 'Enroll in new MFA method by Friday', 'technology', 3, 88, 'Fake Okta push targeting SSO-heavy orgs to capture MFA seed codes.'),
  T('t05', 'VPN Certificate Expired', 'VPN access will be terminated — action needed', 'technology', 3, 86, 'IT notice claiming the user VPN certificate has expired and must be renewed.'),
  T('t06', 'Slack Account Locked', 'Your Slack workspace access has been revoked', 'technology', 2, 91, 'Fake Slack security notice requiring re-authentication through a phishing link.'),
  T('t07', 'Zoom Security Update', 'Critical security update — re-authenticate now', 'technology', 2, 89, 'Spoofed Zoom account notice targeting remote workers to harvest credentials.'),
  T('t08', 'IT Helpdesk Ticket', 'Your helpdesk ticket #HD-49821 requires your input', 'technology', 2, 93, 'Fake IT ticket reply with embedded link to a credential harvesting page.'),
  T('t09', 'Software License Renewal', 'Your Adobe license expires in 3 days', 'technology', 2, 90, 'License expiry notice requiring re-verification of account credentials.'),
  T('t10', 'Two-Factor Disable Alert', 'Someone disabled 2FA on your account', 'technology', 3, 84, 'Urgent security alert claiming 2FA was disabled, prompting immediate login.'),

  // ── Finance / BEC ────────────────────────────────────────────────
  T('t11', 'CEO Wire Transfer', 'Urgent — Confidential Wire Transfer', 'finance', 5, 78, 'BEC scenario: CEO impersonation requesting urgent wire transfer to external account.', true),
  T('t12', 'CFO Invoice Approval', 'Invoice #INV-20241 requires your immediate approval', 'finance', 4, 82, 'Fake CFO request for urgent invoice approval targeting AP staff.', true),
  T('t13', 'Vendor Bank Account Change', 'Important: Updated banking details for vendor payments', 'finance', 4, 80, 'Fraudulent vendor notice requesting payment routing to a new bank account.'),
  T('t14', 'ACH Payment Confirmation', 'ACH transfer of $47,500 has been initiated', 'finance', 3, 85, 'Spoofed bank alert about a large ACH transfer requiring immediate confirmation.'),
  T('t15', 'Payroll Direct Deposit Change', 'Direct Deposit Change Confirmation Required', 'finance', 3, 87, 'HR/payroll phish targeting employees to redirect their salary to attacker-controlled accounts.'),
  T('t16', 'Tax Document Available', 'Your W-2 / P60 is ready to download', 'finance', 2, 91, 'Seasonal tax document delivery targeting employees during tax season.'),
  T('t17', 'Expense Report Rejection', 'Your expense report was rejected — login to review', 'finance', 2, 92, 'Finance system notification with a malicious link to a fake expense portal.'),
  T('t18', 'Investment Account Alert', 'Unusual activity detected on your trading account', 'finance', 3, 83, 'Fake brokerage security alert requiring immediate credential verification.'),
  T('t19', 'Acquisition NDA Request', 'Confidential: NDA required for pending acquisition', 'finance', 5, 76, 'Highly targeted BEC — executive impersonation in context of M&A activity.', true),
  T('t20', 'Audit Preparation Request', 'Q4 audit — financial data submission required by EOD', 'finance', 4, 81, 'Fake internal audit request creating urgency to submit sensitive financial data.'),

  // ── HR / Payroll ─────────────────────────────────────────────────
  T('t21', 'Benefits Open Enrollment', 'Open Enrollment closes this Friday — take action now', 'hr', 2, 95, 'Annual benefits enrollment deadline with a phishing link to a fake HR portal.'),
  T('t22', 'Employee Handbook Update', 'New employee handbook — acknowledgment required', 'hr', 1, 96, 'Low-sophistication HR policy update requiring digital signature via malicious link.'),
  T('t23', 'Performance Review Portal', 'Your annual review is available — submit by Friday', 'hr', 2, 93, 'Fake performance review portal link designed to harvest corporate credentials.'),
  T('t24', 'Background Check Required', 'Action required: complete background re-verification', 'hr', 3, 86, 'Fake compliance re-verification request targeting new and existing employees.'),
  T('t25', 'PTO Balance Expiry', 'Your unused PTO expires December 31 — act now', 'hr', 2, 94, 'HR-themed urgency message exploiting PTO anxiety to drive credential submission.'),
  T('t26', 'Termination Notice', 'Confidential: Employment termination procedure initiated', 'hr', 4, 79, 'High-impact BEC scenario using fear of job loss to force immediate action.', true),
  T('t27', 'New Hire Welcome', 'Welcome to the team — complete your IT onboarding', 'hr', 2, 91, 'Onboarding phish targeting new employees unfamiliar with IT processes.'),
  T('t28', 'Remote Work Policy Change', 'Updated remote work policy requires your signature', 'hr', 2, 92, 'Policy change notification requiring acknowledgment via a phishing portal.'),
  T('t29', 'Benefits Overpayment', 'Benefits overpayment — repayment required within 7 days', 'hr', 3, 83, 'Financial urgency phish claiming HR overpaid benefits and requesting repayment.'),
  T('t30', 'Salary Review Notification', 'Your salary review results are available', 'hr', 2, 90, 'Exploits curiosity about compensation to drive credential harvesting.'),

  // ── Cloud Services ───────────────────────────────────────────────
  T('t31', 'SharePoint File Shared', 'Your colleague shared a confidential document', 'technology', 2, 90, 'Fake SharePoint sharing notification — a classic lure for credential theft.'),
  T('t32', 'OneDrive Storage Full', 'Your OneDrive storage is 99% full', 'technology', 2, 91, 'Storage-full notification prompting sign-in to a fake OneDrive portal.'),
  T('t33', 'Dropbox File Request', 'Someone requested files from your Dropbox', 'technology', 2, 91, 'Fake Dropbox file request requiring credential verification.'),
  T('t34', 'AWS Billing Anomaly', 'Unusual AWS spend detected — $12,400 in 24 hours', 'technology', 3, 84, 'Cloud billing alert targeting DevOps/engineers to harvest AWS credentials.'),
  T('t35', 'GitHub Security Alert', 'A dependency vulnerability was found in your repo', 'technology', 3, 87, 'Fake GitHub Dependabot alert with malicious action link targeting developers.'),
  T('t36', 'Salesforce Login Warning', 'Your Salesforce account was accessed from a new location', 'technology', 2, 89, 'CRM security alert targeting sales teams for credential theft.'),
  T('t37', 'DocuSign Pending Signature', 'You have a document waiting for your signature', 'technology', 2, 93, 'DocuSign lure — one of the most effective enterprise phishing templates.'),
  T('t38', 'Notion Workspace Invite', 'You have been added to a confidential workspace', 'technology', 2, 91, 'Fake collaboration platform invite targeting productivity tool users.'),
  T('t39', 'Jira Ticket Escalation', 'Critical P1 ticket assigned to you — immediate action needed', 'technology', 3, 86, 'Fake JIRA ticket targeting developers and project managers.'),
  T('t40', 'Azure AD Password Expiry', 'Your Azure AD password expires in 24 hours', 'technology', 2, 90, 'Azure/Entra ID password expiry notice with credential harvesting link.'),

  // ── Healthcare ───────────────────────────────────────────────────
  T('t41', 'EHR Access Suspended', 'Epic/Cerner: Your EHR access has been temporarily suspended', 'healthcare', 3, 85, 'Targets clinical staff with fake EHR system access suspension requiring re-auth.'),
  T('t42', 'HIPAA Compliance Training', 'Mandatory HIPAA training due by end of month', 'healthcare', 2, 93, 'Compliance training phish targeting healthcare workers with malicious LMS link.'),
  T('t43', 'Insurance Portal Update', 'Patient insurance verification portal has moved', 'healthcare', 2, 91, 'Fake insurance portal migration notice targeting billing and admin staff.'),
  T('t44', 'Patient Data Breach Notice', 'Confidential: potential PHI exposure — review required', 'healthcare', 4, 80, 'Data breach notification exploiting regulatory fear to drive immediate action.'),
  T('t45', 'Medical Records Request', 'Urgent records request from referring physician', 'healthcare', 3, 85, 'Clinical workflow phish targeting nurses and records staff.'),
  T('t46', 'DEA License Renewal', 'DEA controlled substance license renewal required', 'healthcare', 3, 84, 'Regulatory renewal notice targeting prescribing physicians and pharmacists.'),
  T('t47', 'Hospital VPN Downtime', 'Scheduled VPN maintenance — use backup portal', 'healthcare', 3, 83, 'Fake maintenance notice redirecting staff to a credential-harvesting backup portal.'),
  T('t48', 'Payroll System Migration', 'Payroll system migrating — verify your banking details', 'healthcare', 3, 82, 'Finance/HR hybrid phish targeting hospital payroll staff.'),

  // ── Legal / Compliance ───────────────────────────────────────────
  T('t49', 'Contract Review Required', 'Contract requires your review and e-signature', 'legal', 3, 87, 'Urgent contract signing lure targeting legal, procurement, and executive staff.'),
  T('t50', 'Regulatory Inquiry Notice', 'GDPR audit: data subject request response required', 'legal', 4, 81, 'Regulatory compliance urgency phish targeting data protection officers.'),
  T('t51', 'Court Summons Notification', 'You are required to appear — document attached', 'legal', 4, 78, 'High-fear legal notice designed to prompt immediate click-through.', true),
  T('t52', 'NDA Violation Warning', 'Potential NDA breach detected — legal review required', 'legal', 4, 79, 'Fear-based legal threat targeting employees involved in sensitive projects.', true),
  T('t53', 'IP Infringement Claim', 'Cease and desist: intellectual property violation', 'legal', 4, 80, 'Legal threat lure designed to cause panic and drive credential submission.'),
  T('t54', 'Compliance Certificate Expiry', 'Your SOC 2 attestation requires renewal', 'legal', 3, 86, 'Compliance certification urgency targeting IT and security teams.'),

  // ── Delivery / Logistics ─────────────────────────────────────────
  T('t55', 'FedEx Delivery Failed', 'Package delivery failed — reschedule required', 'retail', 1, 95, 'Classic delivery failed lure — effective across all industries and demographics.'),
  T('t56', 'DHL Customs Hold', 'Your shipment is held at customs — pay release fee', 'retail', 2, 89, 'Customs fee phish exploiting international shipping workflows.'),
  T('t57', 'UPS Signature Required', 'Signature required for high-value delivery today', 'retail', 2, 91, 'Delivery urgency creating time-pressure to click through.'),
  T('t58', 'Amazon Order Problem', 'Problem with your recent Amazon order — verify payment', 'retail', 2, 88, 'E-commerce order issue targeting employees who shop on work email.'),
  T('t59', 'Supply Chain Delay Notice', 'Critical component delayed — revised PO required', 'retail', 3, 85, 'B2B supply chain lure targeting procurement and operations staff.'),
  T('t60', 'Vendor Invoice Payment', 'Invoice #4921 is 30 days overdue — immediate payment required', 'retail', 3, 84, 'AP-targeted invoice fraud with payment link to attacker-controlled page.'),

  // ── Social Engineering / Executive ───────────────────────────────
  T('t61', 'LinkedIn Connection Request', 'A key executive wants to connect with you', 'technology', 2, 90, 'Fake LinkedIn notification targeting professionals to harvest credentials.'),
  T('t62', 'Executive Briefing Request', 'The CEO needs a briefing document by 3 PM', 'all', 4, 81, 'Time-pressured executive request exploiting authority and urgency.', true),
  T('t63', 'Board Meeting Prep', 'Confidential board materials — access required', 'all', 4, 80, 'High-trust lure targeting senior management with fake board document access.', true),
  T('t64', 'Reference Check Email', 'Employment reference check for former employee', 'hr', 3, 86, 'Social engineering lure targeting HR to disclose sensitive employee information.'),
  T('t65', 'Media Inquiry', 'Press inquiry about your company — response needed', 'all', 3, 85, 'Fake journalist inquiry creating reputational urgency for executives.'),
  T('t66', 'Conference Invitation', 'VIP invitation to speak at industry summit', 'all', 2, 91, 'Flattery-based phish exploiting professional ambition.'),

  // ── Security Alerts ──────────────────────────────────────────────
  T('t67', 'Security Incident Response', 'Active breach detected on your network — act now', 'technology', 4, 79, 'Fake SOC/SIEM alert creating panic to drive immediate credential entry.', true),
  T('t68', 'Ransomware Warning', 'Files on your device have been encrypted', 'technology', 4, 77, 'Ransomware notification lure targeting IT and executive staff.', true),
  T('t69', 'Antivirus Expired', 'Your antivirus license has expired — renew now', 'technology', 1, 94, 'Low-sophistication but highly effective security software expiry lure.'),
  T('t70', 'Firewall Policy Change', 'Firewall rule update requires your approval', 'technology', 3, 85, 'IT/network admin phish requiring approval via a spoofed management portal.'),
  T('t71', 'Dark Web Credential Alert', 'Your credentials were found on the dark web', 'technology', 3, 82, 'Credential exposure alert creating urgency to reset via phishing link.'),
  T('t72', 'Failed Login Lockout', 'Your account has been locked due to failed attempts', 'all', 2, 90, 'Account lockout notification targeting any employee for credential reset.'),

  // ── Remote Work / Collaboration ──────────────────────────────────
  T('t73', 'Teams Meeting Missed', 'You missed an urgent Teams meeting — recording available', 'technology', 2, 91, 'Fake missed meeting notification exploiting FOMO among remote workers.'),
  T('t74', 'Zoom Webinar Confirmation', 'Your registration for the all-hands is confirmed', 'all', 1, 95, 'Simple conference confirmation lure effective against all employee types.'),
  T('t75', 'Home Office Equipment Form', 'Complete your remote work equipment reimbursement form', 'hr', 2, 92, 'Expense form phish targeting remote workers with financial incentive.'),
  T('t76', 'VPN Access Expiry', 'Your remote access certificate expires in 48 hours', 'technology', 3, 86, 'VPN access urgency targeting remote workers to submit credentials.'),
  T('t77', 'IT Support Chat', 'IT Support: We detected an issue on your device', 'technology', 3, 85, 'Proactive IT support lure using chat/help format to build trust.'),
  T('t78', 'Digital Signature Required', 'Remote work agreement renewal — sign by Friday', 'hr', 2, 92, 'Policy compliance phish targeting remote workers for credential theft.'),

  // ── Government / Regulatory ──────────────────────────────────────
  T('t79', 'IRS Tax Refund', 'You are eligible for a $2,840 tax refund — claim now', 'government', 3, 81, 'IRS tax refund lure — highly effective during and after tax season.'),
  T('t80', 'Customs & Border Notice', 'Customs hold: duties owed on inbound shipment', 'government', 3, 83, 'Government customs notice targeting finance and procurement teams.'),
  T('t81', 'OSHA Compliance Notice', 'OSHA workplace safety audit scheduled for next week', 'government', 3, 84, 'Regulatory compliance fear targeting operations and safety managers.'),
  T('t82', 'Business License Renewal', 'Your business operating license expires in 14 days', 'government', 2, 88, 'Government business registration urgency targeting business owners and admins.'),
  T('t83', 'Grant Application Approved', 'Your government grant application has been conditionally approved', 'government', 3, 82, 'Positive lure exploiting excitement about financial grants.'),

  // ── Education ────────────────────────────────────────────────────
  T('t84', 'Student Financial Aid', 'Your financial aid requires re-verification', 'education', 2, 90, 'Financial aid re-verification phish targeting students and administrators.'),
  T('t85', 'LMS Password Expiry', 'Your Canvas/Blackboard password expires tomorrow', 'education', 2, 91, 'LMS credential phish targeting students and faculty.'),
  T('t86', 'Research Grant Approval', 'NSF grant application status update', 'education', 3, 85, 'Research funding lure targeting academic researchers and faculty.'),
  T('t87', 'Tuition Payment Overdue', 'Tuition payment is overdue — register for next semester is at risk', 'education', 2, 87, 'Payment urgency lure targeting students to harvest banking credentials.'),

  // ── Cryptocurrency / Fintech ──────────────────────────────────────
  T('t88', 'Crypto Account Freeze', 'Your Coinbase account has been temporarily frozen', 'finance', 3, 82, 'Crypto exchange security lure targeting digital asset holders.'),
  T('t89', 'DeFi Wallet Drain Alert', 'Unauthorized transaction detected on your wallet', 'finance', 4, 79, 'Wallet draining lure exploiting fear of crypto theft.', true),
  T('t90', 'NFT Royalty Payment', 'You have an unclaimed NFT royalty payment of 2.3 ETH', 'finance', 3, 80, 'Crypto incentive lure targeting NFT creators and collectors.'),

  // ── Retail / E-Commerce ──────────────────────────────────────────
  T('t91', 'Account Hacked Alert', 'Someone changed your password and email — verify identity', 'retail', 3, 83, 'Account takeover alert creating urgency for retail/e-commerce users.'),
  T('t92', 'Loyalty Points Expiry', 'Your 24,800 reward points expire in 7 days', 'retail', 2, 90, 'Loyalty program expiry lure exploiting loss aversion.'),
  T('t93', 'Flash Sale Access', 'Exclusive early access to Black Friday sale — verify now', 'retail', 2, 88, 'Sales incentive lure targeting e-commerce customers.'),

  // ── Hybrid / Advanced ────────────────────────────────────────────
  T('t94', 'M&A Due Diligence Request', 'Confidential due diligence documents require your review', 'finance', 5, 75, 'Highly targeted executive phish exploiting M&A confidentiality.', true),
  T('t95', 'AI Tool Access Granted', 'Your ChatGPT Enterprise / Copilot seat is ready', 'technology', 2, 88, 'AI tool onboarding lure exploiting demand for AI platforms.'),
  T('t96', 'Insurance Claim Required', 'Submit your cyber incident insurance claim by EOD', 'all', 3, 83, 'Post-incident claim urgency phish targeting risk/finance staff.'),
  T('t97', 'Partner Portal Migration', 'Partner portal has migrated — reset your credentials', 'technology', 3, 85, 'B2B partner phish targeting external-facing staff managing vendor relationships.'),
  T('t98', 'Payroll Tax Withholding', 'Update your W-4 withholding — tax law changed', 'hr', 2, 89, 'Tax law change urgency targeting all employees to submit financial info.'),
  T('t99', 'Fake Security Assessment', 'Third-party security audit requires your cooperation', 'technology', 4, 80, 'Social engineering: posing as a legitimate security vendor to extract credentials.', true),
  T('t100', 'Supply Chain Compromise', 'Critical update to shared library used by your team', 'technology', 5, 74, 'Developer-targeted supply chain phish mimicking a legitimate dependency update.', true),
  T('t101', 'Physical Access Card Reset', 'Your building access card has been deactivated', 'all', 2, 90, 'Physical security convergence phish targeting office access systems.'),
  T('t102', 'Whistleblower Retaliation', 'Anonymous HR complaint filed against you — review required', 'hr', 4, 78, 'High-fear personal threat lure targeting employees with HR access.', true),
  T('t103', 'Travel Itinerary Changed', 'Your booked flight has been cancelled — rebook now', 'all', 2, 89, 'Business travel disruption lure targeting frequent travelers.'),
  T('t104', 'Software Audit Notice', 'License compliance audit: unauthorized software detected', 'technology', 3, 84, 'IT compliance fear phish targeting employees to remove or verify software.'),
  T('t105', 'Pension Fund Update', 'Your pension contribution allocation requires updating', 'hr', 2, 91, 'Long-term savings urgency phish targeting employees nearing retirement.'),
];

export default async function TemplatesPage() {
  const supabase = await getSafeClient();
  let dbTemplates: typeof SAMPLE_TEMPLATES = [];

  if (supabase) {
    const { data: user } = await supabase.from('users').select('organization_id').single();
    const { data } = await supabase
      .from('templates').select('*')
      .or(`organization_id.eq.${user?.organization_id ?? 'none'},is_public.eq.true`)
      .order('created_at', { ascending: false });
    dbTemplates = (data ?? []) as typeof SAMPLE_TEMPLATES;
  }

  const templates = dbTemplates.length > 0 ? dbTemplates : SAMPLE_TEMPLATES;
  const publicTemplates = templates.filter((t) => t.is_public);
  const ownTemplates = templates.filter((t) => !t.is_public);
  const isLive = dbTemplates.length > 0;

  return (
    <div className="animate-in">
      <Header title="Templates" subtitle={`${templates.length} simulation templates across all industries`}>
        <Link href="/dashboard/campaigns/new" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontFamily: 'var(--font-fira-code), monospace', fontSize: 11, fontWeight: 600,
          color: '#000', background: '#00ff41',
          padding: '6px 14px', borderRadius: 3, textDecoration: 'none',
          boxShadow: '0 0 12px rgba(0,255,65,0.4)',
        }}>
          <Plus size={13} /> generate_custom
        </Link>
      </Header>
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {ownTemplates.length > 0 && (
          <section>
            <div style={{ ...MONO, fontSize: 10, color: '#00ff41', opacity: 0.5, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>
              // Your Generated Templates ({ownTemplates.length})
            </div>
            <TemplateGrid templates={ownTemplates} />
          </section>
        )}

        <section>
          <div style={{ ...MONO, fontSize: 10, color: '#00ff41', opacity: 0.5, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>
            // Template Library ({publicTemplates.length})
          </div>
          <TemplateGrid templates={publicTemplates} />
        </section>
      </div>
    </div>
  );
}

