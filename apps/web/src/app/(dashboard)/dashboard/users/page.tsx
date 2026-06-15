import { getSafeClient } from '@/lib/supabase/safe';
import { Header } from '@/components/layout/header';
import { Shield } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { InviteUserModal } from '@/components/users/invite-user-modal';

const MONO = { fontFamily: 'var(--font-fira-code), monospace' } as const;

const ROLE_STYLE: Record<string, { color: string; bg: string; border: string }> = {
  owner:   { color: '#a78bfa', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.25)' },
  admin:   { color: '#818cf8', bg: 'rgba(129,140,248,0.08)', border: 'rgba(129,140,248,0.25)' },
  manager: { color: '#60a5fa', bg: 'rgba(96,165,250,0.08)',  border: 'rgba(96,165,250,0.25)' },
  analyst: { color: '#00ff41', bg: 'rgba(0,255,65,0.07)',    border: 'rgba(0,255,65,0.2)' },
  viewer:  { color: '#888',    bg: 'rgba(136,136,136,0.07)', border: 'rgba(136,136,136,0.2)' },
};

export default async function UsersPage() {
  const supabase = await getSafeClient();
  const users = supabase
    ? (() => {
        // We can't get session in demo mode, so just return empty
        return supabase.from('users').select('id,email,full_name,role,mfa_enabled,last_sign_in_at,created_at').order('created_at', { ascending: true }).then(r => r.data ?? []);
      })()
    : Promise.resolve([]);

  const resolvedUsers = await users;

  return (
    <div className="animate-in">
      <Header title="Users" subtitle="Manage team members and permissions">
        <InviteUserModal />
      </Header>
      <div style={{ padding: 24 }}>
        <div style={{
          background: 'rgba(0,255,65,0.025)', border: '1px solid rgba(0,255,65,0.15)',
          borderRadius: 6, overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(0,255,65,0.1)', background: 'rgba(0,255,65,0.03)' }}>
                {['User', 'Role', 'MFA', 'Last active', 'Joined'].map(h => (
                  <th key={h} style={{ ...MONO, fontSize: 9, color: '#00ff41', opacity: 0.45, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', textAlign: 'left', padding: '10px 14px' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {resolvedUsers.map((user, i) => {
                const r = ROLE_STYLE[user.role] ?? ROLE_STYLE.viewer;
                return (
                  <tr key={user.id} style={{ borderBottom: i < resolvedUsers.length - 1 ? '1px solid rgba(0,255,65,0.07)' : 'none' }}>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ ...MONO, fontSize: 12, color: '#c8ffd4', marginBottom: 2 }}>{user.full_name ?? 'Unknown'}</div>
                      <div style={{ ...MONO, fontSize: 10, color: '#00ff41', opacity: 0.4 }}>{user.email}</div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ ...MONO, fontSize: 9, fontWeight: 600, color: r.color, background: r.bg, border: `1px solid ${r.border}`, borderRadius: 3, padding: '2px 8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, ...MONO, fontSize: 11, color: user.mfa_enabled ? '#00ff41' : '#888' }}>
                        {user.mfa_enabled && <Shield size={11} />}
                        {user.mfa_enabled ? 'Enabled' : 'Disabled'}
                      </div>
                    </td>
                    <td style={{ ...MONO, padding: '12px 14px', fontSize: 10, color: '#00ff41', opacity: 0.4 }}>
                      {user.last_sign_in_at ? formatDate(user.last_sign_in_at) : 'Never'}
                    </td>
                    <td style={{ ...MONO, padding: '12px 14px', fontSize: 10, color: '#00ff41', opacity: 0.4 }}>
                      {formatDate(user.created_at)}
                    </td>
                  </tr>
                );
              })}
              {resolvedUsers.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ ...MONO, padding: '32px 14px', textAlign: 'center', fontSize: 11, color: '#00ff41', opacity: 0.35 }}>
                    no users yet — connect Supabase to manage your team
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
