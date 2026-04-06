import { Trophy, Medal } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  address: string;
  score: number;
  reward?: string;
}

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, address: "0xAb3...F21a", score: 48320, reward: "40%" },
  { rank: 2, address: "0x7cD...9e4B", score: 41080, reward: "20%" },
  { rank: 3, address: "0x1fE...3c8D", score: 36540, reward: "10%" },
  { rank: 4, address: "0x92A...7b1C", score: 31200, reward: "10%" },
  { rank: 5, address: "0xdB8...4a2F", score: 28900, reward: "5%" },
  { rank: 6, address: "0x5eC...8d3A", score: 24100, reward: "4%" },
  { rank: 7, address: "0x3aF...1e7B", score: 21500, reward: "3.5%" },
  { rank: 8, address: "0xc4D...6f2E", score: 19800, reward: "3%" },
  { rank: 9, address: "0x8bE...2a9C", score: 17200, reward: "2.5%" },
  { rank: 10, address: "0x6fA...5d4B", score: 15600, reward: "2%" },
];

function rankIcon(rank: number) {
  if (rank === 1) return <Trophy className="w-5 h-5 text-secondary" />;
  if (rank <= 3) return <Medal className="w-5 h-5 text-primary" />;
  return <span className="text-muted-foreground text-sm font-bold w-5 text-center">{rank}</span>;
}

export default function Leaderboard() {
  return (
    <div className="glass-card rounded-lg p-4 sm:p-5 glow-shadow">
      <h2 className="text-lg font-bold gradient-text mb-4 flex items-center gap-2">
        <Trophy className="w-5 h-5" /> Live Leaderboard
      </h2>
      <div className="space-y-2">
        {MOCK_LEADERBOARD.map((entry) => (
          <div
            key={entry.rank}
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
              entry.rank <= 3 ? "bg-muted/40" : "hover:bg-muted/20"
            }`}
          >
            {rankIcon(entry.rank)}
            <span className="font-mono text-sm text-foreground flex-1 truncate">
              {entry.address}
            </span>
            <span className="font-bold text-sm text-foreground tabular-nums">
              {entry.score.toLocaleString()}
            </span>
            {entry.reward && (
              <span className="text-xs font-semibold bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                {entry.reward}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
