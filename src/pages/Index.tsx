import { useState, useCallback } from "react";
import { initGame, move, type Direction, type GameState } from "@/lib/game2048";
import GameBoard from "@/components/GameBoard";
import GameHeader from "@/components/GameHeader";
import Leaderboard from "@/components/Leaderboard";
import RewardsClaim from "@/components/RewardsClaim";

export default function Index() {
  const [game, setGame] = useState<GameState>(initGame);
  const [bestScore, setBestScore] = useState(0);

  const handleMove = useCallback(
    (dir: Direction) => {
      setGame((prev) => {
        if (prev.gameOver) return prev;
        const next = move(prev, dir);
        if (next.score > bestScore) setBestScore(next.score);
        return next;
      });
    },
    [bestScore]
  );

  const handleRestart = () => setGame(initGame());

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 container max-w-6xl mx-auto px-4 py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 lg:gap-8 items-start">
          {/* Main game column */}
          <div className="space-y-5 max-w-md mx-auto lg:mx-0 lg:max-w-none w-full">
            <GameHeader
              score={game.score}
              bestScore={bestScore}
              onRestart={handleRestart}
              gameOver={game.gameOver}
              won={game.won}
            />
            <GameBoard
              board={game.board}
              onMove={handleMove}
              disabled={game.gameOver}
            />
            <p className="text-xs text-center text-muted-foreground">
              Use arrow keys or swipe to move tiles. Each move is an on-chain transaction.
            </p>
          </div>

          {/* Sidebar */}
          <div className="space-y-5 animate-slide-up">
            <Leaderboard />
            <RewardsClaim />
          </div>
        </div>
      </div>

      <footer className="text-center py-4 text-[10px] text-muted-foreground tracking-wide">
        Built on Base · Every move on-chain · Season 1
      </footer>
    </div>
  );
}
