import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { base } from "wagmi/chains";
import { GAME_CONTRACT_ADDRESS, GAME_ABI, ERC20_BALANCE_ABI, DIRECTION_MAP, decodeBoardFromUint256 } from "@/lib/contract";
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import type { Direction } from "@/lib/game2048";
import { Attribution } from "ox/erc8021";

// Base Builder Code attribution suffix for EOA transactions
const DATA_SUFFIX = Attribution.toDataSuffix({
  codes: ["bc_qy8hylsq"],
});

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

export function usePlayerHighScore() {
  const { address } = useAccount();

  const { data } = useReadContract({
    address: GAME_CONTRACT_ADDRESS,
    abi: GAME_ABI,
    functionName: "highScores",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  return Number(data ?? 0n);
}

export function useRewardPoolBalance() {
  const { data: tokenAddress } = useReadContract({
    address: GAME_CONTRACT_ADDRESS,
    abi: GAME_ABI,
    functionName: "rewardToken",
  });

  const { data: balance } = useReadContract({
    address: tokenAddress as `0x${string}` | undefined,
    abi: ERC20_BALANCE_ABI,
    functionName: "balanceOf",
    args: [GAME_CONTRACT_ADDRESS],
    query: { enabled: !!tokenAddress },
  });

  return Number(balance ?? 0n);
}
export function useGameActions() {
  const { address } = useAccount();
  const { writeContract, data: txHash, isPending, reset } = useWriteContract();
  const [action, setAction] = useState("");
  const [txError, setTxError] = useState(false);

  const { isSuccess, isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (isSuccess && action) {
      toast.success(`${action} confirmed on-chain!`);
      setAction("");
      setTxError(false);
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
    setTxError(false);
    writeContract({ ...baseArgs, account: address, functionName: "startGame" });
  }, [writeContract, address]);

  const restartGame = useCallback(() => {
    if (!address) return;
    setAction("Restart Game");
    setTxError(false);
    writeContract({ ...baseArgs, account: address, functionName: "restartGame" });
  }, [writeContract, address]);

  const makeMove = useCallback(
    (dir: Direction) => {
      if (!address) return;
      setAction("Move");
      setTxError(false);
      writeContract(
        { ...baseArgs, account: address, functionName: "makeMove", args: [DIRECTION_MAP[dir]] },
        {
          onError: (err) => {
            toast.error("Move failed — rolling back");
            setTxError(true);
          },
        }
      );
    },
    [writeContract, address]
  );

  const endGame = useCallback(() => {
    if (!address) return;
    setAction("End Game");
    setTxError(false);
    writeContract({ ...baseArgs, account: address, functionName: "endGame" });
  }, [writeContract, address]);

  const claimReward = useCallback(() => {
    if (!address) return;
    setAction("Claim Reward");
    setTxError(false);
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
    txError,        // <-- НОВЕ
  };
}
