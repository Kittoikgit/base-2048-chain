import { useState, useCallback, useEffect } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { createWalletClient, http, parseAbi } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import { GAME_CONTRACT_ADDRESS, GAME_ABI, DIRECTION_MAP } from "@/lib/contract";
import type { Direction } from "@/lib/game2048";
import { toast } from "sonner";

const STORAGE_KEY = "session_key_2048";
const SESSION_DURATION = 3600; // 1 година

interface SessionData {
  privateKey: `0x${string}`;
  address: string;
  expiresAt: number;
}

export function useSessionKey() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const [session, setSession] = useState<SessionData | null>(null);
  const [isActivating, setIsActivating] = useState(false);

  // Завантажити збережений ключ
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: SessionData = JSON.parse(stored);
      if (parsed.expiresAt > Date.now() / 1000) {
        setSession(parsed);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Активація (одноразовий підпис MetaMask)
  const activate = useCallback(async () => {
    if (!walletClient || !address || !publicClient) return;
    setIsActivating(true);
    try {
      // Генеруємо тимчасовий ключ
      const randomBytes = crypto.getRandomValues(new Uint8Array(32));
      const privateKey = `0x${Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('')}` as `0x${string}`;
      const tempAccount = privateKeyToAccount(privateKey);

      // Реєструємо на контракті (єдиний попап MetaMask)
      const hash = await walletClient.writeContract({
        address: GAME_CONTRACT_ADDRESS,
        abi: GAME_ABI,
        functionName: "addSessionKey",
        args: [tempAccount.address, BigInt(SESSION_DURATION)],
      });

      await publicClient.waitForTransactionReceipt({ hash });

      const data: SessionData = {
        privateKey,
        address: tempAccount.address,
        expiresAt: Math.floor(Date.now() / 1000) + SESSION_DURATION,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setSession(data);
      toast.success("⚡ Автопідпис активовано на 1 годину!");
    } catch (e) {
      console.error("Session key activation failed:", e);
      toast.error("Не вдалося активувати автопідпис");
    } finally {
      setIsActivating(false);
    }
  }, [walletClient, address, publicClient]);

  // Хід через session key (БЕЗ попапу)
  const moveWithSession = useCallback(
    async (dir: Direction) => {
      if (!session || !address || !publicClient) {
        throw new Error("No active session");
      }

      const tempAccount = privateKeyToAccount(session.privateKey);
      const tempClient = createWalletClient({
        account: tempAccount,
        chain: base,
        transport: http(),
      });

      const hash = await tempClient.writeContract({
        address: GAME_CONTRACT_ADDRESS,
        abi: GAME_ABI,
        functionName: "moveOnBehalf",
        args: [address, DIRECTION_MAP[dir]],
      });

      await publicClient.waitForTransactionReceipt({ hash });
    },
    [session, address, publicClient]
  );

  // Деактивація
  const deactivate = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
    toast.info("Автопідпис вимкнено");
  }, []);

  const isActive = !!session && session.expiresAt > Date.now() / 1000;

  return {
    isActive,
    isActivating,
    sessionAddress: session?.address ?? null,
    activate,
    moveWithSession,
    deactivate,
  };
}
