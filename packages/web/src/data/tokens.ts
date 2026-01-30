import { CONTRACTS } from "./contracts";

export const IS_TESTNET = import.meta.env.VITE_USE_TESTNET === "true";

export const TOKENS = [
  {
    contractAddress: CONTRACTS.nativeToken,
    decimals: 18,
    name: IS_TESTNET ? "GRASS" : "GHO",
    symbol: IS_TESTNET ? "GRASS" : "GHO"
  },
  {
    contractAddress: CONTRACTS.wrappedNativeToken,
    decimals: 18,
    name: IS_TESTNET ? "Wrapped GRASS" : "Wrapped GHO",
    symbol: IS_TESTNET ? "WGRASS" : "WGHO"
  }
];

export const NATIVE_TOKEN_SYMBOL = IS_TESTNET ? "GRASS" : "GHO";
