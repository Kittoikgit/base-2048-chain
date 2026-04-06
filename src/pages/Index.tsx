import { useState, useCallback, useEffect } from "react";
import { useAccount } from "wagmi";
import { initGame, move, type Direction, type GameState } from "@/lib/game2048";
import { useGameState, useGameActions, useLeaderboard, usePlayerHighScore, useRewardPoolBalance } from "@/hooks/useGameContract";
import GameBoard from "@/components/GameBoard";
import GameHeader from "@/components/GameHeader";
import Leaderboard from "@/components/Leaderboard";
import RewardsClaim from "@/components/RewardsClaim";
import { Loader2 } from "lucide-react";
import { useSessionKey } from "@/hooks/useSessionKey";
import { toast } from "sonner";

export default function Index() {
  const { isConnected } = useAccount();

  const { board: onChainBoard, score: onChainScore, isActive, refetch: refetchGame } = useGameState();
  const {
    startGame,
    restartGame,
    makeMove: contractMove,
    endGame,
    claimReward,
    isPending,
    isConfirming,
    txError,
  } = useGameActions();

  const { entries: leaderboardEntries, refetch: refetchLeaderboard, isLoading: lbLoading } = useLeaderboard();
  const playerHighScore = usePlayerHighScore();
  const poolBalance = useRewardPoolBalance();

  const { isActive: hasSessionKey, isActivating, activate: activateSession, moveWithSession, deactivate: deactivateSession } = useSessionKey();

  const [localGame, setLocalGame] = useState<GameState>(initGame());
  const [bestScore, setBestScore] = useState(0);

  const [optimisticGame, setOptimisticGame] = useState<GameState | null>(null);
  const [pendingMoves, setPendingMoves] = useState(0);

  useEffect(() => {
    if (!isPending && !isConfirming && isConnected) {
      refetchGame();
      refetchLeaderboard();
    }
  }, [isPending, isConfirming, isConnected, refetchGame, refetchLeaderboard]);

  useEffect(() => {
    if (onChainBoard && !isPending && !isConfirming) {
      setOptimisticGame(null);
      setPendingMoves(0);
    }
  }, [onChainBoard, onChainScore, isPending, isConfirming]);

  useEffect(() => {
    if (txError) {
      setOptimisticGame(null);
      setPendingMoves(0);
      refetchGame();
    }
  }, [txError, refetchGame]);

  const handleMove = useCallback(
    async (dir: Direction) => {
      if (isConnected && isActive) {
        const currentBoard = optimisticGame?.board ?? onChainBoard;
        const currentScore = optimisticGame?.score ?? onChainScore;

        if (!currentBoard) return;

        const currentState: GameState = {
          board: currentBoard,
          score: currentScore,
          gameOver: false,
          won: false,
        };

        const nextState = move(currentState, dir);

        if (JSON.stringify(nextState.board) !== JSON.stringify(currentState.board)) {
          setOptimisticGame(nextState);
          setPendingMoves((prev) => prev + 1);

          try {
            if (hasSessionKey) {
              await moveWithSession(dir);
            } else {
              contractMove(dir);
            }
          } catch (error) {
            console.error("Move failed:", error);
            toast.error("Move failed");
            setOptimisticGame(null);
            setPendingMoves(0);
          }
        }
      } else {
        setLocalGame((prev) => {
          if (prev.gameOver) return prev;
          const next = move(prev, dir);
          if (next.score > bestScore) setBestScore(next.score);
          return next;
        });
      }
    },
    [isConnected, isActive, hasSessionKey, optimisticGame, onChainBoard, onChainScore, contractMove, moveWithSession, bestScore]
  );

  const handleRestart = () => {
    setOptimisticGame(null);
    setPendingMoves(0);

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

  const displayBoard = isConnected
    ? (optimisticGame?.board ?? onChainBoard ?? localGame.board)
    : localGame.board;

  const displayScore = isConnected
    ? (optimisticGame?.score ?? onChainScore ?? 0)
    : localGame.score;

  const txBusy = isPending || isConfirming;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 gap-4" style={{ backgroundColor: "#1a1a2e" }}>
      <GameHeader
        score={displayScore}
        bestScore={isConnected ? playerHighScore : bestScore}
        onRestart={handleRestart}
        onEndGame={isConnected && isActive ? endGame : undefined}
        isConnected={isConnected}
        isActive={isActive}
        won={displayBoard?.some((r) => r.some((v) => v >= 2048))}
      />

      <GameBoard board={displayBoard} onMove={handleMove} />

      {/* Pending moves indicator */}
      {pendingMoves > 0 && (
        <div className="flex items-center gap-2 text-sm" style={{ color: "#facc15" }}>
          <Loader2 className="animate-spin w-4 h-4" />
          <span>
            {pendingMoves} move{pendingMoves > 1 ? "s" : ""} confirming on-chain...
          </span>
        </div>
      )}

      {/* Transaction status */}
      {txBusy && pendingMoves === 0 && (
        <div className="flex items-center gap-2 text-sm" style={{ color: "#a0a0c0" }}>
          <Loader2 className="animate-spin w-4 h-4" />
          <span>{isPending ? "Confirm in wallet..." : "Waiting for on-chain confirmation..."}</span>
        </div>
      )}

      {/* Session Key Button */}
      {isConnected && isActive && (
        <div className="flex items-center gap-2">
          {!hasSessionKey ? (
            <button
              onClick={activateSession}
              disabled={isActivating}
              className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
              style={{ backgroundColor: "#4ade80", color: "#1a1a2e" }}
            >
              {isActivating ? "Activating..." : "⚡ Enable Auto-Sign (1 hour)"}
            </button>
          ) : (
            <button
              onClick={deactivateSession}
              className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{ backgroundColor: "#e2725b", color: "#fff" }}
            >
              🔒 Disable Auto-Sign
            </button>
          )}
        </div>
      )}

      <p className="text-sm text-center max-w-md" style={{ color: "#a0a0c0" }}>
        {isConnected
          ? isActive
            ? hasSessionKey
              ? "⚡ Auto-sign active — moves execute instantly without wallet popups."
              : "Every swipe is an on-chain transaction on Base."
            : "Press Start / New Game to begin an on-chain session."
          : "Connect wallet to play on-chain. Playing locally for now."}
      </p>

      <Leaderboard entries={leaderboardEntries} isLoading={lbLoading} />
      <RewardsClaim
        onClaim={claimReward}
        hasHighScore={playerHighScore > 0}
        poolBalance={poolBalance}
      />
    </div>
  );
}
