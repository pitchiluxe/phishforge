import { Header } from '@/components/layout/header';
import { LeaderboardView } from '@/components/leaderboard/leaderboard-view';

export default function LeaderboardPage() {
  return (
    <div className="animate-in">
      <Header title="Leaderboard" subtitle="Security awareness training rankings — earn XP, badges, and climb the board" />
      <div style={{ padding: 24 }}>
        <LeaderboardView />
      </div>
    </div>
  );
}
