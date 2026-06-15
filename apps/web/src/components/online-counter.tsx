'use client';
import { useEffect, useState } from 'react';

function getSessionId(): string {
  try {
    let sid = sessionStorage.getItem('pf_sid');
    if (!sid) {
      sid = crypto.randomUUID();
      sessionStorage.setItem('pf_sid', sid);
    }
    return sid;
  } catch {
    return 'anon';
  }
}

export function OnlineCounter({ className }: { className?: string }) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const sid = getSessionId();
    const es = new EventSource(`/api/online?sid=${sid}`);
    es.onmessage = (e) => setCount(Number(e.data));
    es.onerror = () => es.close();
    return () => es.close();
  }, []);

  if (count === null) return null;

  return (
    <span className={className} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: '#00ff41', boxShadow: '0 0 6px #00ff41',
        display: 'inline-block', animation: 'onlinePulse 2s ease-in-out infinite',
      }} />
      <style>{`@keyframes onlinePulse { 0%,100%{opacity:1;} 50%{opacity:0.4;} }`}</style>
      <span style={{ fontFamily: 'var(--font-fira-code), monospace', fontSize: 11, color: '#00ff41', opacity: 0.75 }}>
        {count} {count === 1 ? 'online' : 'online'}
      </span>
    </span>
  );
}
