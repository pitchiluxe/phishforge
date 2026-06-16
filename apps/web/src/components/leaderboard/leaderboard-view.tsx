'use client';

import { useEffect, useState } from 'react';
import { Shield, Zap, BookOpen, Terminal, Briefcase, Star, Award, TrendingUp, Clock } from 'lucide-react';
import { getTotalXP, getCompletedModuleCount, getLevelForXP, getXPProgress, type ClassroomProgress } from '@/lib/classroom';

const MONO = { fontFamily: 'var(--font-fira-code), monospace' } as const;

interface ActivityItem {
  type: 'module' | 'lab' | 'training' | 'interview';
  title: string;
  score?: number;
  verdict?: string;
  completedAt: string;
}

interface Stats {
  xp: number;
  modules: number;
  labs: number;
  trainingSessions: number;
  interviews: number;
  badges: number;
  avgScore: number;
  classroomXP: number;
  recentActivity: ActivityItem[];
  badgeList: string[];
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: React.ElementType; color: string }) {
  return (
    <div style={{ padding: '18px 16px', background: 'rgba(0,255,65,0.02)', border: '1px solid rgba(0,255,65,0.1)', borderRadius: 10, textAlign: 'center' }}>
      <Icon size={16} style={{ color, marginBottom: 10, opacity: 0.8 }} />
      <div style={{ ...MONO, fontSize: 22, fontWeight: 700, color }}>{value}</div>
      <div style={{ ...MONO, fontSize: 9, color: '#00ff41', opacity: 0.35, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>{label}</div>
    </div>
  );
}

const ACTIVITY_ICONS: Record<string, React.ElementType> = {
  module: BookOpen,
  lab: Terminal,
  training: Shield,
  interview: Briefcase,
};

const ACTIVITY_COLOR: Record<string, string> = {
  module: '#00ff41',
  lab: '#60a5fa',
  training: '#fb923c',
  interview: '#a78bfa',
};

export function LeaderboardView() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    try {
      const progress: ClassroomProgress = JSON.parse(localStorage.getItem('pf_classroom_progress') ?? '{}');
      const xp = getTotalXP(progress);
      const modules = getCompletedModuleCount(progress);
      const badgeList: string[] = JSON.parse(localStorage.getItem('pf_classroom_badges') ?? '[]');

      const scores: number[] = [];
      for (const course of Object.values(progress)) {
        for (const mod of Object.values(course)) {
          if (mod.score !== undefined) scores.push(mod.score);
        }
      }

      const labSessions: { id: string; labId: string; labTitle: string; completedAt: string }[] =
        JSON.parse(localStorage.getItem('pf_lab_sessions') ?? '[]');

      const trainingSessions: { id: string; scenarioId: string; scenarioTitle: string; score: number; verdict: string; completedAt: string }[] =
        JSON.parse(localStorage.getItem('pf_training_sessions') ?? '[]');

      const ivSessions: { id: string; role: string; interviewType: string; scores: { knowledge: number; communication: number; problemSolving: number }; verdict: string; completedAt: string }[] =
        JSON.parse(localStorage.getItem('pf_interview_sessions') ?? '[]');

      trainingSessions.forEach(s => { if (s.score !== undefined) scores.push(s.score); });
      ivSessions.forEach(s => {
        const avg = Math.round((s.scores.knowledge + s.scores.communication + s.scores.problemSolving) / 3) * 10;
        scores.push(avg);
      });

      const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

      const activity: ActivityItem[] = [];

      for (const [, course] of Object.entries(progress)) {
        for (const [, mod] of Object.entries(course)) {
          if (mod.completed && mod.completedAt) {
            activity.push({ type: 'module', title: 'Completed classroom module', score: mod.score, completedAt: mod.completedAt });
          }
        }
      }

      labSessions.forEach(s => activity.push({ type: 'lab', title: s.labTitle, completedAt: s.completedAt }));
      trainingSessions.forEach(s => activity.push({ type: 'training', title: s.scenarioTitle, score: s.score, verdict: s.verdict, completedAt: s.completedAt }));
      ivSessions.forEach(s => activity.push({ type: 'interview', title: `${s.role} Interview`, verdict: s.verdict, completedAt: s.completedAt }));

      activity.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

      setStats({
        xp,
        modules,
        labs: labSessions.length,
        trainingSessions: trainingSessions.length,
        interviews: ivSessions.length,
        badges: badgeList.length,
        avgScore,
        classroomXP: xp,
        recentActivity: activity.slice(0, 15),
        badgeList,
      });
    } catch {}
  }, []);

  if (!stats) return null;

  const level = getLevelForXP(stats.xp);
  const xpProg = getXPProgress(stats.xp);
  const hasActivity = stats.modules > 0 || stats.labs > 0 || stats.trainingSessions > 0 || stats.interviews > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Level / XP card */}
      <div style={{
        padding: '24px 28px', background: 'rgba(0,255,65,0.03)',
        border: `1px solid ${level.color}30`, borderRadius: 12,
        boxShadow: `0 0 24px ${level.color}10`,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: `${level.color}12`, border: `2px solid ${level.color}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 0 16px ${level.color}40`,
              }}>
                <span style={{ ...MONO, fontSize: 20, fontWeight: 700, color: level.color }}>{level.level}</span>
              </div>
              <div>
                <div style={{ ...MONO, fontSize: 18, fontWeight: 700, color: level.color }}>{level.title}</div>
                <div style={{ ...MONO, fontSize: 11, color: '#00ff41', opacity: 0.4, marginTop: 2 }}>Level {level.level} · {stats.xp.toLocaleString()} XP total</div>
              </div>
            </div>
            {/* XP progress bar */}
            <div style={{ marginTop: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ ...MONO, fontSize: 9, color: '#00ff41', opacity: 0.35 }}>{xpProg.current.toLocaleString()} / {(xpProg.max - xpProg.min).toLocaleString()} XP to next level</span>
                <span style={{ ...MONO, fontSize: 9, color: level.color }}>{xpProg.pct}%</span>
              </div>
              <div style={{ height: 6, background: 'rgba(0,255,65,0.08)', borderRadius: 3, width: 300, maxWidth: '100%' }}>
                <div style={{ height: '100%', width: `${xpProg.pct}%`, background: level.color, borderRadius: 3, boxShadow: `0 0 8px ${level.color}60`, transition: 'width 600ms ease' }} />
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ ...MONO, fontSize: 9, color: '#00ff41', opacity: 0.35, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Your Record</div>
            <div style={{ ...MONO, fontSize: 11, color: '#c8ffd4' }}>
              {hasActivity ? `${stats.recentActivity.length} activities logged` : 'No activity yet'}
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12 }}>
        <StatCard label="Modules"   value={stats.modules}          icon={BookOpen}  color="#00ff41" />
        <StatCard label="Labs"      value={stats.labs}             icon={Terminal}  color="#60a5fa" />
        <StatCard label="Training"  value={stats.trainingSessions} icon={Shield}    color="#fb923c" />
        <StatCard label="Interviews" value={stats.interviews}      icon={Briefcase} color="#a78bfa" />
        <StatCard label="Avg Score" value={stats.avgScore > 0 ? `${stats.avgScore}%` : '—'} icon={TrendingUp} color="#facc15" />
        <StatCard label="Badges"    value={stats.badges}           icon={Award}     color="#f87171" />
      </div>

      {/* Badges earned */}
      {stats.badgeList.length > 0 && (
        <div style={{ padding: '16px 20px', background: 'rgba(248,113,113,0.03)', border: '1px solid rgba(248,113,113,0.12)', borderRadius: 10 }}>
          <div style={{ ...MONO, fontSize: 9, color: '#f87171', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
            <Award size={11} style={{ display: 'inline', marginRight: 5 }} />Badges Earned ({stats.badges})
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {stats.badgeList.map(b => (
              <span key={b} style={{ ...MONO, fontSize: 10, color: '#f87171', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 4, padding: '4px 10px' }}>
                <Star size={9} style={{ display: 'inline', marginRight: 4 }} />{b}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recent activity */}
      <div>
        <div style={{ ...MONO, fontSize: 9, color: '#00ff41', opacity: 0.35, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 14 }}>
          <Clock size={10} style={{ display: 'inline', marginRight: 5 }} />// Recent Activity
        </div>

        {!hasActivity ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', background: 'rgba(0,255,65,0.02)', border: '1px solid rgba(0,255,65,0.08)', borderRadius: 10 }}>
            <Zap size={32} style={{ color: '#00ff41', opacity: 0.2, marginBottom: 14 }} />
            <div style={{ ...MONO, fontSize: 13, color: '#00ff41', opacity: 0.4, marginBottom: 8 }}>No activity recorded yet</div>
            <div style={{ ...MONO, fontSize: 11, color: '#00ff41', opacity: 0.25 }}>Complete classroom modules, labs, training scenarios, or interviews to build your record</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {stats.recentActivity.map((item, i) => {
              const Icon = ACTIVITY_ICONS[item.type];
              const color = ACTIVITY_COLOR[item.type];
              const scoreColor = item.score !== undefined
                ? (item.score >= 80 ? '#00ff41' : item.score >= 60 ? '#facc15' : '#f87171')
                : color;
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px',
                    background: 'rgba(0,255,65,0.015)', border: '1px solid rgba(0,255,65,0.07)',
                    borderRadius: 8, transition: 'all 150ms',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,255,65,0.04)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,255,65,0.015)'; }}
                >
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: `${color}10`, border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={13} style={{ color }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ ...MONO, fontSize: 11, color: '#c8ffd4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
                    <div style={{ ...MONO, fontSize: 9, color, opacity: 0.45, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>{item.type}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                    {item.score !== undefined && (
                      <span style={{ ...MONO, fontSize: 11, fontWeight: 700, color: scoreColor }}>{item.score}%</span>
                    )}
                    {item.verdict && !item.score && (
                      <span style={{ ...MONO, fontSize: 10, color, opacity: 0.7 }}>{item.verdict}</span>
                    )}
                    <span style={{ ...MONO, fontSize: 9, color: '#00ff41', opacity: 0.25 }}>{timeAgo(item.completedAt)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ ...MONO, fontSize: 10, color: '#00ff41', opacity: 0.2, textAlign: 'center', padding: '8px 0', borderTop: '1px solid rgba(0,255,65,0.07)' }}>
        // Stats update in real time as you complete modules, labs, training sessions, and interviews
      </div>
    </div>
  );
}
