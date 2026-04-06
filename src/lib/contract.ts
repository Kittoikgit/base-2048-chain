import { type Abi } from "viem";

export const GAME_CONTRACT_ADDRESS = "0x9c7550f8b79c5707d7fce08d2c7d3b7cb92fa7bc" as const;

export const GAME_ABI = [
  { inputs: [{ internalType: "address", name: "_key", type: "address" }, { internalType: "uint256", name: "_duration", type: "uint256" }], name: "addSessionKey", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [], name: "claimReward", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [], name: "endGame", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ internalType: "uint8", name: "direction", type: "uint8" }], name: "makeMove", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ internalType: "address", name: "_player", type: "address" }, { internalType: "uint8", name: "_direction", type: "uint8" }], name: "moveOnBehalf", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [], name: "restartGame", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ internalType: "address", name: "_key", type: "address" }], name: "revokeSessionKey", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ internalType: "address", name: "_token", type: "address" }], name: "setRewardToken", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [], name: "startGame", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ internalType: "address", name: "_token", type: "address" }, { internalType: "uint256", name: "_amount", type: "uint256" }], name: "withdrawTokens", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ internalType: "address", name: "player", type: "address" }], name: "getGameState", outputs: [{ internalType: "uint256", name: "board", type: "uint256" }, { internalType: "uint256", name: "score", type: "uint256" }, { internalType: "bool", name: "isActive", type: "bool" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "getLeaderboard", outputs: [{ components: [{ internalType: "address", name: "player", type: "address" }, { internalType: "uint256", name: "score", type: "uint256" }], internalType: "struct Game2048.LeaderboardEntry[10]", name: "", type: "tuple[10]" }], stateMutability: "view", type: "function" },
  { inputs: [{ internalType: "address", name: "", type: "address" }], name: "highScores", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ internalType: "address", name: "player", type: "address" }], name: "isGameOver", outputs: [{ internalType: "bool", name: "", type: "bool" }], stateMutability: "view", type: "function" },
  { inputs: [{ internalType: "address", name: "", type: "address" }], name: "lastClaimedScore", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ internalType: "uint256", name: "", type: "uint256" }], name: "leaderboard", outputs: [{ internalType: "address", name: "player", type: "address" }, { internalType: "uint256", name: "score", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "owner", outputs: [{ internalType: "address", name: "", type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [{ internalType: "address", name: "", type: "address" }], name: "playerGames", outputs: [{ internalType: "uint256", name: "board", type: "uint256" }, { internalType: "uint256", name: "score", type: "uint256" }, { internalType: "bool", name: "isActive", type: "bool" }, { internalType: "uint256", name: "nonce", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "rewardToken", outputs: [{ internalType: "address", name: "", type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [{ internalType: "address", name: "", type: "address" }, { internalType: "address", name: "", type: "address" }], name: "sessionKeys", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "totalGamesPlayed", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  // Events
  { anonymous: false, inputs: [{ indexed: true, internalType: "address", name: "player", type: "address" }, { indexed: false, internalType: "uint256", name: "finalScore", type: "uint256" }], name: "GameEnded", type: "event" },
  { anonymous: false, inputs: [{ indexed: true, internalType: "address", name: "player", type: "address" }], name: "GameStarted", type: "event" },
  { anonymous: false, inputs: [{ indexed: true, internalType: "address", name: "player", type: "address" }, { indexed: false, internalType: "uint8", name: "direction", type: "uint8" }, { indexed: false, internalType: "uint256", name: "newBoard", type: "uint256" }, { indexed: false, internalType: "uint256", name: "newScore", type: "uint256" }], name: "MoveMade", type: "event" },
  { anonymous: false, inputs: [{ indexed: true, internalType: "address", name: "player", type: "address" }, { indexed: false, internalType: "uint256", name: "amount", type: "uint256" }], name: "RewardClaimed", type: "event" },
  { anonymous: false, inputs: [{ indexed: true, internalType: "address", name: "player", type: "address" }, { indexed: true, internalType: "address", name: "key", type: "address" }, { indexed: false, internalType: "uint256", name: "expiry", type: "uint256" }], name: "SessionKeyAdded", type: "event" },
  { anonymous: false, inputs: [{ indexed: true, internalType: "address", name: "player", type: "address" }, { indexed: true, internalType: "address", name: "key", type: "address" }], name: "SessionKeyRevoked", type: "event" },
] as const satisfies Abi;
export const ERC20_BALANCE_ABI = [
  { inputs: [{ internalType: "address", name: "account", type: "address" }], name: "balanceOf", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" },
] as const satisfies Abi;

// Direction mapping: contract uses uint8 (0=up, 1=down, 2=left, 3=right)
export const DIRECTION_MAP: Record<string, number> = {
  up: 0,
  down: 1,
  left: 2,
  right: 3,
};

// Decode a uint256 board into a 4x4 grid. Each cell is 4 bits (nibble) representing power of 2.
export function decodeBoardFromUint256(boardUint: bigint): number[][] {
  const board: number[][] = Array.from({ length: 4 }, () => Array(4).fill(0));
  for (let i = 0; i < 16; i++) {
    const nibble = Number((boardUint >> BigInt(i * 4)) & 0xFn);
    const row = Math.floor(i / 4);
    const col = i % 4;
    board[row][col] = nibble === 0 ? 0 : Math.pow(2, nibble);
  }
  return board;
}
export const CDP_PAYMASTER_URL = "https://api.developer.coinbase.com/rpc/v1/base/GeDbXNmpt0XTRT2eUchUx9TW54zx1k1z";
