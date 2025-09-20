// Monad chain config for wagmi/viem (env-driven)
import type { Chain } from "viem/chains";

const MONAD_CHAIN_ID = Number(import.meta.env.VITE_MONAD_CHAIN_ID ?? 10143);
const MONAD_NAME = import.meta.env.VITE_MONAD_CHAIN_NAME ?? "Monad Testnet";
const MONAD_RPC_URL =
  import.meta.env.VITE_MONAD_RPC_URL ?? "https://testnet-rpc.monad.xyz/";
const MONAD_EXPLORER =
  import.meta.env.VITE_MONAD_EXPLORER ?? "https://testnet.monadexplorer.com/";

export const monadTestnet: Chain = {
  id: MONAD_CHAIN_ID,
  name: MONAD_NAME,
  nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
  rpcUrls: {
    default: { http: [MONAD_RPC_URL] },
    public: { http: [MONAD_RPC_URL] },
  },
  blockExplorers: {
    default: { name: "Monad Explorer", url: MONAD_EXPLORER },
  },
} as const;
