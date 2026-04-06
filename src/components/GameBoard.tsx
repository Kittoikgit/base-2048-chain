import { useCallback, useEffect, useRef } from "react";
import type { Board } from "@/lib/game2048";

const TILE_COLORS: Record<number, string> = {
  2: "bg-tile-2 text-card",
  4: "bg-tile-4 text-card",
  8: "bg-tile-8 text-primary-foreground",
  16: "bg-tile-16 text-primary-foreground",
  32: "bg-tile-32 text-primary-foreground",
  64: "bg-tile-64 text-primary-foreground",
  128: "bg-tile-128 text-card",
  256: "bg-tile-256 text-card",
  512: "bg-tile-512 text-primary-foreground",
  1024: "bg-tile-1024 text-primary-foreground",
  2048: "bg-tile-2048 text-primary-foreground",
};

function tileClass(value: number) {
  return TILE_COLORS[value] || "bg-primary text-primary-foreground";
}

function fontSize(value: number) {
  if (value >= 1024) return "text-lg sm:text-xl font-black";
  if (value >= 128) return "text-xl sm:text-2xl font-extrabold";
  return "text-2xl sm:text-3xl font-extrabold";
}

interface GameBoardProps {
  board: Board;
  onMove: (dir: "up" | "down" | "left" | "right") => void;
  disabled?: boolean;
}

export default function GameBoard({ board, onMove, disabled }: GameBoardProps) {
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (disabled) return;
      const map: Record<string, "up" | "down" | "left" | "right"> = {
        ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
        w: "up", s: "down", a: "left", d: "right",
      };
      const dir = map[e.key];
      if (dir) { e.preventDefault(); onMove(dir); }
    },
    [onMove, disabled]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current || disabled) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    const absDx = Math.abs(dx), absDy = Math.abs(dy);
    if (Math.max(absDx, absDy) < 30) return;
    if (absDx > absDy) onMove(dx > 0 ? "right" : "left");
    else onMove(dy > 0 ? "down" : "up");
    touchStart.current = null;
  };

  return (
    <div
      ref={boardRef}
      className="glass-card rounded-lg p-3 sm:p-4 glow-shadow select-none touch-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {board.flat().map((val, i) => (
          <div
            key={i}
            className={`aspect-square rounded-md flex items-center justify-center transition-all duration-150 ${
              val === 0
                ? "bg-muted/40"
                : `${tileClass(val)} ${fontSize(val)} animate-tile-pop`
            }`}
            style={{ minWidth: 0 }}
          >
            {val > 0 ? val : ""}
          </div>
        ))}
      </div>
    </div>
  );
}
