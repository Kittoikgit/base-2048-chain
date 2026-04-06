import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { base } from "wagmi/chains";
import { GAME_CONTRACT_ADDRESS, GAME_ABI, DIRECTION_MAP, decodeBoardFromUint256 } from "@/lib/contract";
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import type { Direction } from "@/lib/game2048";

export function useLeaderboard() {
  const { data, refetch, isLoading } = useReadContract({
    address: GAME_CONTRACT_ADDRESS,
    abi: GAME_ABI,
    functionName: "getLeaderboard",
  });

  const entries = data
    ? Array.from(data as readonly { player: string; score: bigint }[])
        .map((e, i) => ({
          rank: i + 1,
          address: e.player,
          score: Number(e.score),
        }))
        .filter((e) => e.score > 0 && e.address !== "0x0000000000000000000000000000000000000000")
    : [];

  return { entries, refetch, isLoading };
}

export function useGameState() {
  const { address } = useAccount();

  const { data, refetch, isLoading } = useReadContract({
    address: GAME_CONTRACT_ADDRESS,
    abi: GAME_ABI,
    functionName: "getGameState",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const board = data ? decodeBoardFromUint256(data[0] as bigint) : null;
  const score = data ? Number(data[1] as bigint) : 0;
  const isActive = data ? (data[2] as boolean) : false;

  return { board, score, isActive, refetch, isLoading };
}

export function useGameActions() {
  const { address } = useAccount();
  const { writeContract, data: txHash, isPending, reset } = useWriteContract();
  const [action, setAction] = useState<string>("");

  const { isSuccess, isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (isSuccess && action) {
      toast.success(`${action} confirmed on-chain!`);
      setAction("");
      reset();
    }
  }, [isSuccess, action, reset]);

  const baseArgs = {
    address: GAME_CONTRACT_ADDRESS,
    abi: GAME_ABI,
    chain: base,
    account: address,
  } as const;

  const startGame = useCallback(() => {
    if (!address) return;
    setAction("Start Game");
    writeContract({ ...baseArgs, account: address, functionName: "startGame" });
  }, [writeContract, address]);

  const restartGame = useCallback(() => {
    if (!address) return;
    setAction("Restart Game");
    writeContract({ ...baseArgs, account: address, functionName: "restartGame" });
  }, [writeContract, address]);

  const makeMove = useCallback(
    (dir: Direction) => {
      if (!address) return;
      setAction("Move");
      writeContract({ ...baseArgs, account: address, functionName: "makeMove", args: [DIRECTION_MAP[dir]] });
    },
    [writeContract, address]
  );

  const endGame = useCallback(() => {
    if (!address) return;
    setAction("End Game");
    writeContract({ ...baseArgs, account: address, functionName: "endGame" });
  }, [writeContract, address]);

  const claimReward = useCallback(() => {
    if (!address) return;
    setAction("Claim Reward");
    writeContract({ ...baseArgs, account: address, functionName: "claimReward" });
  }, [writeContract, address]);

  return {
    startGame,
    restartGame,
    makeMove,
    endGame,
    claimReward,
    isPending,
    isConfirming,
    txHash,
  };
}
