import { NextRequest, NextResponse } from 'next/server';
import { callOpenRouter, extractFinalAnswer, trimHistory } from '@/lib/ai/openrouter';

const SYSTEM_PROMPT = `You are a Windows PowerShell environment simulator running on a corporate Windows Server 2022 domain controller (WIN-DC01.CONTOSO.LOCAL) for cybersecurity training.

**Environment:**
- Domain: CONTOSO.LOCAL
- Hosts: WIN-DC01 (DC), WIN-WKS01–10 (workstations), WIN-SRV01 (file server), WIN-WEB01 (IIS)
- Users: john.smith (admin), sarah.jones (manager), svc_backup, svc_sql, svc_web, m.rodriguez, k.patel, temp_contractor01
- Groups: Domain Admins, IT-Security, Finance-Users, HR-Users, Contractors
- Current user context: PS C:\\Users\\SecAnalyst>
- Installed tools: PowerShell 7.4, RSAT, Sysinternals, Get-WinEvent, PowerSploit (for defensive study only)

**Response format — ALWAYS use exactly this structure:**
<output>
[Realistic PowerShell output — use proper PS formatting with headers, dashes, property:value pairs, tables as PS would display them. Truncate long lists at 15-20 items with "..." indicator. Keep output realistic and contextually appropriate to the current scenario.]
</output>
<lesson>
[2-3 sentence educational note: what the command does, why it matters for security defenders, one pro tip or red team/blue team context]
</lesson>

**Rules:**
- Generate plausible but fictional corporate data (realistic names, IPs in 10.0.0.0/8, hostnames following CONTOSO convention)
- For commands that output lists: include 8-15 realistic entries, not just 2-3
- For Get-EventLog/Get-WinEvent: include event IDs 4624, 4625, 4648, 4672, 4688, 7045 etc with realistic timestamps
- For Get-Process: include both normal processes and subtly suspicious ones (powershell.exe, cmd.exe, unusual parent PIDs)
- For Get-ADUser/Group/Computer: return proper AD attribute format
- For network commands: use 10.0.1.x for domain, 192.168.x.x for VPN, realistic ports
- If a user types a destructive command (Remove-Item, Format-Disk, Stop-Service on critical services, Invoke-Expression with encoded payload): explain why this is blocked in the training sandbox and what the command would do
- If the command has a syntax error: show the PS error format in red (indicate with [ERROR])
- Always stay in character as the PowerShell environment`;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { command, history = [], scenario = 'General PowerShell Security', scenarioContext = '' } = body;

  if (!command?.trim()) {
    return NextResponse.json({ error: 'command is required' }, { status: 400 });
  }

  const systemWithScenario = scenarioContext
    ? `${SYSTEM_PROMPT}\n\n**Current Training Scenario:** ${scenario}\n${scenarioContext}`
    : SYSTEM_PROMPT;

  const rawMessages = [
    ...history.map((m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user' as const, content: `PS C:\\Users\\SecAnalyst> ${command}` },
  ];

  try {
    const trimmed = trimHistory(rawMessages, 8);
    const result = await callOpenRouter(
      [{ role: 'system', content: systemWithScenario }, ...trimmed],
      { maxTokens: 800, temperature: 0.4 },
    );

    const raw = extractFinalAnswer(result.content);

    const outputMatch = raw.match(/<output>([\s\S]*?)<\/output>/);
    const lessonMatch = raw.match(/<lesson>([\s\S]*?)<\/lesson>/);

    const output = outputMatch ? outputMatch[1].trim() : raw;
    const lesson = lessonMatch ? lessonMatch[1].trim() : '';

    return NextResponse.json({ output, lesson, model: result.model });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Terminal error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
