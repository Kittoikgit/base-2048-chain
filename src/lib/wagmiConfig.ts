import { http, createConfig } from "wagmi";
import { base } from "wagmi/chains";
import { injected, coinbaseWallet } from "@wagmi/connectors";
import { Attribution } from "ox/erc8021";

// Base Builder Code for transaction attribution
const DATA_SUFFIX = Attribution.toDataSuffix({
  codes: ["bc_qy8hylsq"],
});

export const config = createConfig({
  chains: [base],
  connectors: [
    injected(),
    coinbaseWallet({ appName: "2048 On-Chain" }),
  ],
  transports: {
    [base.id]: http(),
  },
  dataSuffix: DATA_SUFFIX,
});
