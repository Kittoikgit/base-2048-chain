import { http, createConfig } from "wagmi";
import { base } from "wagmi/chains";
import { injected, coinbaseWallet } from "@wagmi/connectors";

export const config = createConfig({
  chains: [base],
  connectors: [
    injected(),
    coinbaseWallet({ appName: "2048 On-Chain" }),
  ],
  transports: {
    [base.id]: http(),
  },
});
