import { useState } from "react";
import { Wallet, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WalletConnect() {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState("");

  const handleConnect = () => {
    // Stub: replace with actual wallet connection (ethers / wagmi / Base SDK)
    const mockAddr = "0x" + Array.from({ length: 8 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("") + "...";
    setAddress(mockAddr);
    setConnected(true);
  };

  const handleDisconnect = () => {
    setConnected(false);
    setAddress("");
  };

  if (connected) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-mono text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-full">
          {address}
        </span>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleDisconnect}
          className="text-muted-foreground hover:text-foreground"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={handleConnect}
      className="bg-gradient-to-r from-primary to-secondary text-secondary-foreground font-bold glow-shadow hover:glow-shadow-intense transition-shadow"
    >
      <Wallet className="w-4 h-4 mr-2" />
      Connect Wallet
    </Button>
  );
}
