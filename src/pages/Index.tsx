import { useState, useCallback, useEffect } from "react";
import { useAccount } from "wagmi";
import { initGame, move, type Direction, type GameState } from "@/lib/game2048";
import { useGameState, useGameActions, useLeaderboard } from "@/hooks/useGameContract";
import GameBoard from "@/components/GameBoard";
import GameHeader from "@/components/GameHeader";
import Leaderboard from "@/components/Leaderboard";
import RewardsClaim from "@/components/RewardsClaim";
import { Loader2 } from "lucide-react";

export default function Index() {
  const { isConnected } = useAccount();
  const { board: onChainBoard, score: onChainScore, isActive, refetch: refetchGame } = useGameState();
  const { startGame, restartGame, makeMove: contractMove, endGame, claimReward, isPending, isConfirming } = useGameActions();
  const { entries: leaderboardEntries, refetch: refetchLeaderboard, isLoading: lbLoading } = useLeaderboard();

  // Local fallback game for non-connected users
  const [localGame, setLocalGame] = useState<GameState>(initGame);
  const [bestScore, setBestScore] = useState(0);

  // Refetch on-chain state after tx confirms
  useEffect(() => {
    if (!isPending && !isConfirming && isConnected) {
      refetchGame();
      refetchLeaderboard();
    }
  }, [isPending, isConfirming, isConnected, refetchGame, refetchLeaderboard]);

  const handleMove = useCallback(
    (dir: Direction) => {
      if (isConnected && isActive) {
        contractMove(dir);
      } else {
        setLocalGame((prev) => {
          if (prev.gameOver) return prev;
          const next = move(prev, dir);
          if (next.score > bestScore) setBestScore(next.score);
          return next;
        });
      }
    },
    [isConnected, isActive, contractMove, bestScore]
  );

  const handleRestart = () => {
    if (isConnected) {
      if (isActive) {
        restartGame();
      } else {
        startGame();
      }
    } else {
      setLocalGame(initGame());
    }
  };

  // Determine display state
  const displayBoard = isConnected && onChainBoard ? onChainBoard : localGame.board;
  const displayScore = isConnected ? onChainScore : localGame.score;
  const txBusy = isPending || isConfirming;

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 container max-w-6xl mx-auto px-4 py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 lg:gap-8 items-start">
          <div className="space-y-5 max-w-md mx-auto lg:mx-0 lg:max-w-none w-full">
            <GameHeader
              score={displayScore}
              bestScore={bestScore}
              onRestart={handleRestart}
              gameOver={!isActive && isConnected && onChainBoard !== null}
              won={displayBoard.some((r) => r.some((v) => v >= 2048))}
            />

            {txBusy && (
              <div className="glass-card rounded-lg p-3 text-center animate-slide-up border border-primary/30 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">
                  {isPending ? "Confirm in wallet..." : "Waiting for on-chain confirmation..."}
                </span>
              </div>
            )}

            <GameBoard
              board={displayBoard}
              onMove={handleMove}
              disabled={txBusy || (!isConnected && localGame.gameOver)}
            />

            <p className="text-xs text-center text-muted-foreground">
              {isConnected
                ? isActive
                  ? "Every swipe is an on-chain transaction on Base."
                  : "Press Start / New Game to begin an on-chain session."
                : "Connect wallet to play on-chain. Playing locally for now."}
            </p>
          </div>

          <div className="space-y-5 animate-slide-up">
            <Leaderboard entries={leaderboardEntries} isLoading={lbLoading} />
            <RewardsClaim
              onClaim={claimReward}
              onEndGame={endGame}
              isActive={isActive}
              isConnected={isConnected}
              isBusy={txBusy}
            />
          </div>
        </div>
      </div>

      <footer className="text-center py-4 text-[10px] text-muted-foreground tracking-wide">
        Built on Base · Every move on-chain · Season 1
      </footer>
    </div>
  );
}
