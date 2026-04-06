import { RotateCcw, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import WalletConnect from "./WalletConnect";

interface GameHeaderProps {
  score: number;
  bestScore: number;
  onRestart: () => void;
  gameOver: boolean;
  won: boolean;
}

export default function GameHeader({ score, bestScore, onRestart, gameOver, won }: GameHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black gradient-text tracking-tight">
            2048
          </h1>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <Zap className="w-3 h-3 text-primary" /> On-Chain on Base
          </p>
        </div>
        <WalletConnect />
      </div>

      <div className="flex items-center gap-3">
        <div className="glass-card rounded-lg px-4 py-2 text-center min-w-[80px]">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Score</div>
          <div className="text-xl font-black text-foreground tabular-nums">{score.toLocaleString()}</div>
        </div>
        <div className="glass-card rounded-lg px-4 py-2 text-center min-w-[80px]">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Best</div>
          <div className="text-xl font-black text-foreground tabular-nums">{bestScore.toLocaleString()}</div>
        </div>
        <div className="flex-1" />
        <Button
          onClick={onRestart}
          size="sm"
          className="bg-gradient-to-r from-primary to-secondary text-secondary-foreground font-bold glow-shadow hover:glow-shadow-intense transition-shadow"
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          {gameOver || won ? "New Game" : "Restart"}
        </Button>
      </div>

      {gameOver && (
        <div className="glass-card rounded-lg p-3 text-center animate-slide-up border border-destructive/30">
          <p className="text-destructive font-bold">Game Over!</p>
          <p className="text-xs text-muted-foreground mt-1">Your score has been recorded on-chain</p>
        </div>
      )}
      {won && !gameOver && (
        <div className="glass-card rounded-lg p-3 text-center animate-slide-up border border-secondary/30">
          <p className="text-secondary font-bold">🎉 You reached 2048!</p>
          <p className="text-xs text-muted-foreground mt-1">Keep going for a higher score!</p>
        </div>
      )}
    </div>
  );
}
