import { familyAccountsConnector } from "family";
import type { ReactNode } from "react";
import { http } from "viem";
import { createConfig, WagmiProvider } from "wagmi";
import { injected, metaMask, walletConnect } from "wagmi/connectors";
import {
  CHAIN,
  INFURA_API_KEY,
  IS_TESTNET,
  WALLETCONNECT_PROJECT_ID
} from "@/data/constants";

const connectors = [
  metaMask({ enableAnalytics: false, infuraAPIKey: INFURA_API_KEY }),
  familyAccountsConnector(),
  walletConnect({ projectId: WALLETCONNECT_PROJECT_ID }),
  injected()
];

const config = createConfig({
  chains: [CHAIN],
  connectors,
  transports: {
    [CHAIN.id]: IS_TESTNET
      ? http("https://rpc.testnet.lens.xyz")
      : http("https://rpc.lens.xyz")
  }
});

interface Web3ProviderProps {
  children: ReactNode;
}

const Web3Provider = ({ children }: Web3ProviderProps) => {
  return <WagmiProvider config={config}>{children}</WagmiProvider>;
};

export default Web3Provider;
