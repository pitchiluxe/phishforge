'use client';

import { useEffect, useState } from 'react';
import { Trophy, Medal, Award, Shield, Zap, Target } from 'lucide-react';
import { getTotalXP, getCompletedModuleCount, getLevelForXP, type ClassroomProgress } from '@/lib/classroom';

const MONO = { fontFamily: 'var(--font-fira-code), monospace' } as const;

interface LeaderboardEntry {
  rank: number;
  name: string;
  level: number;
  levelTitle: string;
  xp: number;
  badges: number;
  completedModules: number;
  avgScore: number;
  isCurrentUser?: boolean;
}

const DEMO_ENTRIES: Omit<LeaderboardEntry, 'rank'>[] = [
  { name: 'Sarah Chen',          level: 7, levelTitle: 'Cyber Guardian',   xp: 14820, badges: 23, completedModules: 47, avgScore: 97 },
  { name: 'Marcus Rodriguez',    level: 6, levelTitle: 'Security Lead',    xp: 10340, badges: 18, completedModules: 39, avgScore: 94 },
  { name: 'Priya Patel',         level: 6, levelTitle: 'Security Lead',    xp: 9870,  badges: 17, completedModules: 37, avgScore: 92 },
  { name: 'Alex Kim',            level: 5, levelTitle: 'SOC Analyst',      xp: 7230,  badges: 14, completedModules: 31, avgScore: 88 },
  { name: 'Jordan Taylor',       level: 5, levelTitle: 'SOC Analyst',      xp: 6890,  badges: 12, completedModules: 28, avgScore: 85 },
  { name: 'Morgan Liu',          level: 4, levelTitle: 'Threat Hunter',    xp: 4210,  badges: 9,  completedModules: 22, avgScore: 81 },
  { name: 'Casey Williams',      level: 4, levelTitle: 'Threat Hunter',    xp: 3980,  badges: 8,  completedModules: 20, avgScore: 79 },
  { name: 'Riley Johnson',       level: 3, levelTitle: 'Security Analyst', xp: 2750,  badges: 6,  completedModules: 15, avgScore: 76 },
  { name: 'Sam Torres',          level: 3, levelTitle: 'Security Analyst', xp: 2190,  badges: 5,  completedModules: 13, avgScore: 72 },
  { name: 'Jamie Reeves',        level: 2, levelTitle: 'Trainee',          xp: 890,   badges: 3,  completedModules: 7,  avgScore: 68 },
];

const RANK_STYLE: Record<number, { color: string; icon: React.ElementType }> = {
  1: { color: '#facc15', icon: Trophy },
  2: { color: '#94a3b8', icon: Medal },
  3: { color: '#fb923c', icon: Award },
};

export function LeaderboardView() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [filter, setFilter] = useState<'all' | 'xp' | 'modules' | 'score'>('all');

  useEffect(() => {
    // Build current user entry from localStorage progress
    let userXP = 0;
    let userModules = 0;
    let userBadges = 0;
    let userAvgScore = 0;

    try {
      const progress: ClassroomProgress = JSON.parse(localStorage.getItem('pf_classroom_progress') ?? '{}');
      userXP = getTotalXP(progress);
      userModules = getCompletedModuleCount(progress);
      userBadges = JSON.parse(localStorage.getItem('pf_classroom_badges') ?? '[]').length;

      const scores: number[] = [];
      for (const course of Object.values(progress)) {
        for (const mod of Object.values(course)) {
          if (mod.score !== undefined) scores.push(mod.score);
        }
      }
      userAvgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    } catch {}

    const userLevel = getLevelForXP(userXP);
    const userEntry: Omit<LeaderboardEntry, 'rank'> = {
      name: 'You',
      level: userLevel.level,
      levelTitle: userLevel.title,
      xp: userXP,
      badges: userBadges,
      completedModules: userModules,
      avgScore: userAvgScore,
      isCurrentUser: true,
    };

    const allEntries = [...DEMO_ENTRIES, userEntry]
      .sort((a, b) => b.xp - a.xp)
      .map((e, i) => ({ ...e, rank: i + 1 }));

    setEntries(allEntries);
  }, []);

  const sorted = [...entries].sort((a, b) => {
    if (filter === 'xp') return b.xp - a.xp;
    if (filter === 'modules') return b.completedModules - a.completedModules;
    if (filter === 'score') return b.avgScore - a.avgScore;
    return a.rank - b.rank;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top 3 podium */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {sorted.slice(0, 3).map((entry) => {
          const rs = RANK_STYLE[entry.rank];
          const Icon = rs?.icon ?? Award;
          return (
            <div
              key={entry.rank}
              style={{
                padding: entry.rank === 1 ? '24px 20px' : '18px 20px',
                background: `${rs?.color ?? '#00ff41'}08`,
                border: `1px solid ${rs?.color ?? '#00ff41'}25`,
                borderRadius: 10, textAlign: 'center',
                boxShadow: entry.rank === 1 ? `0 0 20px ${rs?.color}20` : 'none',
                transition: 'all 200ms',
              }}
            >
              <Icon size={entry.rank === 1 ? 26 : 20} style={{ color: rs?.color, marginBottom: 10 }} />
              <div style={{ ...MONO, fontSize: entry.rank === 1 ? 14 : 12, fontWeight: 700, color: '#c8ffd4', marginBottom: 4 }}>{entry.name}</div>
              <div style={{ ...MONO, fontSize: 9, color: rs?.color, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{entry.levelTitle}</div>
              <div style={{ ...MONO, fontSize: 16, fontWeight: 700, color: rs?.color }}>{entry.xp.toLocaleString()}</div>
              <div style={{ ...MONO, fontSize: 9, color: '#00ff41', opacity: 0.35, textTransform: 'uppercase' }}>XP</div>
            </div>
          );
        })}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid rgba(0,255,65,0.1)' }}>
        {([['all', 'All'], ['xp', 'By XP'], ['modules', 'By Modules'], ['score', 'By Score']] as const).map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            style={{
              ...MONO, fontSize: 10, padding: '7px 14px', background: 'none', border: 'none',
              cursor: 'pointer', color: '#00ff41', opacity: filter === val ? 1 : 0.4,
              borderBottom: `2px solid ${filter === val ? '#00ff41' : 'transparent'}`,
              textTransform: 'uppercase', letterSpacing: '0.08em', transition: 'all 150ms', marginBottom: -1,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Full leaderboard table */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {/* Header row */}
        <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 80px 80px 80px 80px', gap: 12, padding: '8px 16px' }}>
          {['#', 'Name', 'XP', 'Modules', 'Badges', 'Avg Score'].map((h) => (
            <div key={h} style={{ ...MONO, fontSize: 9, color: '#00ff41', opacity: 0.35, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</div>
          ))}
        </div>

        {sorted.map((entry) => {
          const rs = RANK_STYLE[entry.rank];
          const isUser = entry.isCurrentUser;
          const scoreColor = entry.avgScore >= 80 ? '#00ff41' : entry.avgScore >= 60 ? '#facc15' : '#f87171';
          return (
            <div
              key={entry.rank}
              style={{
                display: 'grid', gridTemplateColumns: '40px 1fr 80px 80px 80px 80px', gap: 12,
                padding: '12px 16px', borderRadius: 8,
                background: isUser ? 'rgba(0,255,65,0.06)' : rs ? `${rs.color}06` : 'rgba(0,255,65,0.015)',
                border: isUser ? '1px solid rgba(0,255,65,0.3)' : `1px solid ${rs ? rs.color + '18' : 'rgba(0,255,65,0.07)'}`,
                transition: 'all 150ms',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = isUser ? 'rgba(0,255,65,0.09)' : 'rgba(0,255,65,0.04)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = isUser ? 'rgba(0,255,65,0.06)' : rs ? `${rs.color}06` : 'rgba(0,255,65,0.015)'; }}
            >
              {/* Rank */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {rs ? (
                  <span style={{ ...MONO, fontSize: 12, fontWeight: 700, color: rs.color }}>{entry.rank}</span>
                ) : (
                  <span style={{ ...MONO, fontSize: 11, color: '#00ff41', opacity: 0.5 }}>{entry.rank}</span>
                )}
              </div>

              {/* Name + level */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: isUser ? 'rgba(0,255,65,0.15)' : 'rgba(0,255,65,0.06)', border: '1px solid rgba(0,255,65,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ ...MONO, fontSize: 10, fontWeight: 700, color: '#00ff41' }}>{entry.level}</span>
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ ...MONO, fontSize: 12, fontWeight: isUser ? 700 : 500, color: isUser ? '#00ff41' : '#c8ffd4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {entry.name} {isUser && <span style={{ fontSize: 9, opacity: 0.5 }}>(you)</span>}
                  </div>
                  <div style={{ ...MONO, fontSize: 9, color: '#00ff41', opacity: 0.35, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{entry.levelTitle}</div>
                </div>
              </div>

              {/* XP */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ ...MONO, fontSize: 11, fontWeight: 700, color: '#00ff41' }}>{entry.xp.toLocaleString()}</span>
              </div>

              {/* Modules */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ ...MONO, fontSize: 11, color: '#00ff41', opacity: 0.7 }}>{entry.completedModules}</span>
              </div>

              {/* Badges */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Shield size={10} style={{ color: '#00ff41', opacity: 0.4 }} />
                <span style={{ ...MONO, fontSize: 11, color: '#00ff41', opacity: 0.7 }}>{entry.badges}</span>
              </div>

              {/* Avg score */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {entry.avgScore > 0 ? (
                  <span style={{ ...MONO, fontSize: 11, fontWeight: 600, color: scoreColor }}>{entry.avgScore}%</span>
                ) : (
                  <span style={{ ...MONO, fontSize: 11, color: '#00ff41', opacity: 0.2 }}>—</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ ...MONO, fontSize: 10, color: '#00ff41', opacity: 0.3, textAlign: 'center', padding: '8px 0', borderTop: '1px solid rgba(0,255,65,0.07)' }}>
        // Leaderboard updates as you complete modules and training sessions
      </div>
    </div>
  );
}
