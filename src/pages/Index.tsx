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

  // Session key hook
  const { isActive: hasSessionKey, isActivating, activate: activateSession, moveWithSession, deactivate: deactivateSession } = useSessionKey();

  // Local fallback game for non-connected users
  const [localGame, setLocalGame] = useState<GameState>(initGame());

  const [bestScore, setBestScore] = useState(0);

  // Optimistic state for connected users
  const [optimisticGame, setOptimisticGame] = useState<GameState | null>(null);
  const [pendingMoves, setPendingMoves] = useState(0);

  // Refetch on-chain state after transaction
  useEffect(() => {
    if (!isPending && !isConfirming && isConnected) {
      refetchGame();
      refetchLeaderboard();
    }
  }, [isPending, isConfirming, isConnected, refetchGame, refetchLeaderboard]);

  // Sync optimistic state when on-chain updates
  useEffect(() => {
    if (onChainBoard && !isPending && !isConfirming) {
      setOptimisticGame(null);
      setPendingMoves(0);
    }
  }, [onChainBoard, onChainScore, isPending, isConfirming]);

  // Rollback on error
  useEffect(() => {
    if (txError) {
      setOptimisticGame(null);
      setPendingMoves(0);
      refetchGame();
    }
  }, [txError, refetchGame]);

  // Main move handler – works with AND without session key
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

        // Only proceed if the board actually changed
        if (JSON.stringify(nextState.board) !== JSON.stringify(currentState.board)) {
          // Optimistic update
          setOptimisticGame(nextState);
          setPendingMoves((prev) => prev + 1);

          try {
            if (hasSessionKey) {
              // No wallet popup – session key move
              await moveWithSession(dir);
            } else {
              // Normal on-chain move (shows MetaMask)
              contractMove(dir);
            }
          } catch (error) {
            console.error("Move failed:", error);
            toast.error("Move failed");
            // Rollback optimistic state
            setOptimisticGame(null);
            setPendingMoves(0);
          }
        }
      } else {
        // Offline / local game
        setLocalGame((prev) => {
          if (prev.gameOver) return prev;
          const next = move(prev, dir);
          if (next.score > bestScore) setBestScore(next.score);
          return next;
        });
      }
    },
    [
      isConnected,
      isActive,
      hasSessionKey,
      optimisticGame,
      onChainBoard,
      onChainScore,
      contractMove,
      moveWithSession,
      bestScore,
    ]
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

  // Display logic: optimistic → on-chain → local
  const displayBoard = isConnected
    ? (optimisticGame?.board ?? onChainBoard ?? localGame.board)
    : localGame.board;

  const displayScore = isConnected
    ? (optimisticGame?.score ?? onChainScore ?? 0)
    : localGame.score;

  const txBusy = isPending || isConfirming;

  return (
    <div className="w-full max-w-md mx-auto px-2 pt-2 pb-8 flex flex-col gap-3">
      <GameHeader
        score={displayScore}
        bestScore={isConnected ? playerHighScore : bestScore}
        onRestart={handleRestart}
        isConnected={isConnected}
        isActive={isActive}
        won={displayBoard?.flat().some((v) => v >= 2048)}
      />

      <GameBoard
        board={displayBoard}
        onMove={handleMove}
        disabled={txBusy && pendingMoves === 0}
      />

      {/* Pending moves indicator */}
      {pendingMoves > 0 && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin" />
          {pendingMoves} move{pendingMoves > 1 ? "s" : ""} confirming on-chain...
        </div>
      )}

      {/* Transaction status */}
      {txBusy && pendingMoves === 0 && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          {isPending ? "Confirm in wallet..." : "Waiting for on-chain confirmation..."}
        </div>
      )}

      {/* Session Key Button */}
      {isConnected && isActive && (
        <div className="flex justify-center">
          {!hasSessionKey ? (
            <button
              onClick={activateSession}
              disabled={isActivating}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-colors"
            >
              {isActivating ? "Activating..." : "⚡ Enable Auto-Sign (1 hour)"}
            </button>
          ) : (
            <button
              onClick={deactivateSession}
              className="px-4 py-2 rounded-lg bg-muted text-muted-foreground text-sm font-medium hover:opacity-90 transition-colors"
            >
              🔒 Disable Auto-Sign
            </button>
          )}
        </div>
      )}

      <p className="text-center text-xs text-muted-foreground">
        {isConnected
          ? isActive
            ? "Every swipe is an on-chain transaction on Base."
            : "Press Start / New Game to begin an on-chain session."
          : "Connect wallet to play on-chain. Playing locally for now."}
      </p>

      <Leaderboard entries={leaderboardEntries} isLoading={lbLoading} />

      <RewardsClaim
        onClaim={claimReward}
        onEnd={endGame}
        isActive={isActive}
        hasHighScore={playerHighScore > 0}
        poolBalance={poolBalance}
      />
    </div>
  );
}
