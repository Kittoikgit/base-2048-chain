import { Trophy, Medal, Loader2 } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  address: string;
  score: number;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  isLoading: boolean;
}

const REWARD_PERCENTS = ["40%", "20%", "10%", "10%", "5%", "4%", "3.5%", "3%", "2.5%", "2%"];

function rankIcon(rank: number) {
  if (rank === 1) return <Trophy className="w-5 h-5 text-secondary" />;
  if (rank <= 3) return <Medal className="w-5 h-5 text-primary" />;
  return <span className="text-muted-foreground text-sm font-bold w-5 text-center">{rank}</span>;
}

function shortAddr(addr: string) {
  if (addr.length <= 10) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function Leaderboard({ entries, isLoading }: LeaderboardProps) {
  return (
    <div className="glass-card rounded-lg p-4 sm:p-5 glow-shadow">
      <h2 className="text-lg font-bold gradient-text mb-4 flex items-center gap-2">
        <Trophy className="w-5 h-5" /> Live Leaderboard
      </h2>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : entries.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">No scores yet. Be the first!</p>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <div
              key={entry.rank}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                entry.rank <= 3 ? "bg-muted/40" : "hover:bg-muted/20"
              }`}
            >
              {rankIcon(entry.rank)}
              <span className="font-mono text-sm text-foreground flex-1 truncate">
                {shortAddr(entry.address)}
              </span>
              <span className="font-bold text-sm text-foreground tabular-nums">
                {entry.score.toLocaleString()}
              </span>
              <span className="text-xs font-semibold bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                {REWARD_PERCENTS[entry.rank - 1] ?? "—"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
