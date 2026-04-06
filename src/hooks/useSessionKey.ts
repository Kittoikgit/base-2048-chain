import { useState, useCallback, useEffect } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { createWalletClient, http, encodeFunctionData } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import { createBundlerClient, createPaymasterClient } from "viem/account-abstraction";
import { toSimpleSmartAccount } from "permissionless/accounts";
import { createSmartAccountClient } from "permissionless";
import { GAME_CONTRACT_ADDRESS, GAME_ABI, DIRECTION_MAP, CDP_PAYMASTER_URL } from "@/lib/contract";
import type { Direction } from "@/lib/game2048";
import { toast } from "sonner";

const STORAGE_KEY = "session_key_2048";
const SESSION_DURATION = 3600;

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

  const activate = useCallback(async () => {
    if (!walletClient || !address || !publicClient) return;
    setIsActivating(true);
    try {
      const randomBytes = crypto.getRandomValues(new Uint8Array(32));
      const privateKey = `0x${Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('')}` as `0x${string}`;
      const tempAccount = privateKeyToAccount(privateKey);

      // Register session key on contract (user signs once)
      const hash = await walletClient.writeContract({
        address: GAME_CONTRACT_ADDRESS,
        abi: GAME_ABI,
        functionName: "addSessionKey",
        args: [tempAccount.address, BigInt(SESSION_DURATION)],
        chain: base,
        account: address,
      });

      await publicClient.waitForTransactionReceipt({ hash });

      const data: SessionData = {
        privateKey,
        address: tempAccount.address,
        expiresAt: Math.floor(Date.now() / 1000) + SESSION_DURATION,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setSession(data);
      toast.success("⚡ Auto-sign activated for 1 hour!");
    } catch (e) {
      console.error("Session key activation failed:", e);
      toast.error("Failed to activate auto-sign");
    } finally {
      setIsActivating(false);
    }
  }, [walletClient, address, publicClient]);

  // Gasless move via session key + Coinbase Paymaster
  const moveWithSession = useCallback(
    async (dir: Direction) => {
      if (!session || !address || !publicClient) {
        throw new Error("No active session");
      }

      const tempAccount = privateKeyToAccount(session.privateKey);
      
      // Create smart account from session key
      const smartAccount = await toSimpleSmartAccount({
        client: publicClient,
        owner: tempAccount,
      });

      const paymasterClient = createPaymasterClient({
        transport: http(CDP_PAYMASTER_URL),
      });

      const bundlerClient = createBundlerClient({
        client: publicClient,
        transport: http(CDP_PAYMASTER_URL),
        paymaster: paymasterClient,
      });

      const smartAccountClient = createSmartAccountClient({
        account: smartAccount,
        chain: base,
        bundlerTransport: http(CDP_PAYMASTER_URL),
        paymaster: paymasterClient,
      });

      const txHash = await smartAccountClient.sendTransaction({
        to: GAME_CONTRACT_ADDRESS,
        data: encodeFunctionData({
          abi: GAME_ABI,
          functionName: "moveOnBehalf",
          args: [address, DIRECTION_MAP[dir]],
        }),
      });

      await publicClient.waitForTransactionReceipt({ hash: txHash });
    },
    [session, address, publicClient]
  );

  const deactivate = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
    toast.info("Auto-sign disabled");
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
