import { Gift, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RewardsClaimProps {
  onClaim: () => void;
  onEndGame: () => void;
  isActive: boolean;
  isConnected: boolean;
  isBusy: boolean;
}

export default function RewardsClaim({ onClaim, onEndGame, isActive, isConnected, isBusy }: RewardsClaimProps) {
  return (
    <div className="glass-card rounded-lg p-4 sm:p-5 glow-shadow">
      <h2 className="text-lg font-bold gradient-text mb-3 flex items-center gap-2">
        <Gift className="w-5 h-5" /> Season Rewards
      </h2>
      <div className="space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Prize Pool</span>
          <span className="font-bold text-foreground">2.5 ETH</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Season Ends</span>
          <span className="font-bold text-foreground">12d 4h</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Your Rank</span>
          <span className="font-bold text-primary">#—</span>
        </div>

        {isConnected && isActive && (
          <Button
            onClick={onEndGame}
            disabled={isBusy}
            variant="outline"
            className="w-full font-bold mt-2"
          >
            {isBusy ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : null}
            End Current Game
          </Button>
        )}

        <Button
          onClick={onClaim}
          className="w-full bg-gradient-to-r from-primary to-secondary text-secondary-foreground font-bold glow-shadow hover:glow-shadow-intense transition-shadow mt-2"
          disabled={!isConnected || isBusy}
        >
          {isBusy ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : null}
          Claim Rewards <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
        <p className="text-[10px] text-muted-foreground text-center">
          {isConnected ? "Finish a game to be eligible for rewards" : "Connect wallet & finish a game to be eligible"}
        </p>
      </div>
    </div>
  );
}
