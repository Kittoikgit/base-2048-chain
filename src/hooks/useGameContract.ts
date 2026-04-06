import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
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
    ? (data as readonly { player: string; score: bigint }[])
        .map((e, i) => ({
          rank: i + 1,
          address: e.player,
          score: Number(e.score),
        }))
        .filter((e) => e.score > 0)
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

  const startGame = useCallback(() => {
    setAction("Start Game");
    writeContract({
      address: GAME_CONTRACT_ADDRESS,
      abi: GAME_ABI,
      functionName: "startGame",
    });
  }, [writeContract]);

  const restartGame = useCallback(() => {
    setAction("Restart Game");
    writeContract({
      address: GAME_CONTRACT_ADDRESS,
      abi: GAME_ABI,
      functionName: "restartGame",
    });
  }, [writeContract]);

  const makeMove = useCallback(
    (dir: Direction) => {
      setAction("Move");
      writeContract({
        address: GAME_CONTRACT_ADDRESS,
        abi: GAME_ABI,
        functionName: "makeMove",
        args: [DIRECTION_MAP[dir]],
      });
    },
    [writeContract]
  );

  const endGame = useCallback(() => {
    setAction("End Game");
    writeContract({
      address: GAME_CONTRACT_ADDRESS,
      abi: GAME_ABI,
      functionName: "endGame",
    });
  }, [writeContract]);

  const claimReward = useCallback(() => {
    setAction("Claim Reward");
    writeContract({
      address: GAME_CONTRACT_ADDRESS,
      abi: GAME_ABI,
      functionName: "claimReward",
    });
  }, [writeContract]);

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
