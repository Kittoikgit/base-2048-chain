import { Gift, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RewardsClaim() {
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
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Claimable</span>
          <span className="font-bold text-secondary">0.00 ETH</span>
        </div>
        <Button
          className="w-full bg-gradient-to-r from-primary to-secondary text-secondary-foreground font-bold glow-shadow hover:glow-shadow-intense transition-shadow mt-2"
          disabled
        >
          Claim Rewards <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
        <p className="text-[10px] text-muted-foreground text-center">
          Connect wallet & finish a game to be eligible
        </p>
      </div>
    </div>
  );
}
