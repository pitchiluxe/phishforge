export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

declare global {
  // eslint-disable-next-line no-var
  var __pf_sessions: Map<string, Set<ReadableStreamDefaultController<Uint8Array>>>;
}

// sessionId → set of SSE controllers (same session can have multiple tabs)
globalThis.__pf_sessions ??= new Map();
const sessions = globalThis.__pf_sessions;

function uniqueCount() {
  return sessions.size;
}

function broadcast() {
  const chunk = new TextEncoder().encode(`data: ${uniqueCount()}\n\n`);
  for (const ctrls of sessions.values()) {
    for (const ctrl of ctrls) {
      try { ctrl.enqueue(chunk); } catch { ctrls.delete(ctrl); }
    }
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sid = searchParams.get('sid') ?? 'anon';

  let ctrl!: ReadableStreamDefaultController<Uint8Array>;

  const stream = new ReadableStream<Uint8Array>({
    start(c) {
      ctrl = c;
      if (!sessions.has(sid)) sessions.set(sid, new Set());
      sessions.get(sid)!.add(ctrl);
      // Send current unique count immediately
      ctrl.enqueue(new TextEncoder().encode(`data: ${uniqueCount()}\n\n`));
      broadcast();
    },
    cancel() {
      const ctrls = sessions.get(sid);
      if (ctrls) {
        ctrls.delete(ctrl);
        if (ctrls.size === 0) sessions.delete(sid); // all tabs for this session closed
      }
      broadcast();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
