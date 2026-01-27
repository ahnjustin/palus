import type { AnyBalance } from "@palus/indexer";
import type { Address } from "viem";
import { Image } from "@/components/Shared/UI";
import { NATIVE_TOKEN_SYMBOL } from "@/data/constants";
import getTokenImage from "@/helpers/getTokenImage";

interface TokenBalanceProps {
  value: string;
  symbol: string;
  currency?: Address;
}

const TokenBalance = ({ value, symbol }: TokenBalanceProps) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-5">
      <div className="flex items-center gap-2">
        <Image
          alt={symbol}
          className="size-8 rounded-full"
          src={getTokenImage(symbol)}
        />
        <span className="font-bold">{symbol}</span>
      </div>
      <b>${Number.parseFloat(value).toFixed(2)} </b>
    </div>
  );
};

interface TokenBalancesProps {
  balances: AnyBalance[] | undefined;
  refetch: () => void;
}

const TokenBalances = ({ balances }: TokenBalancesProps) => {
  if (!balances || balances.length === 0) {
    return <div className="p-5">No tokens found.</div>;
  }

  return (
    <div className="space-y-5">
      {balances.map((balance) => {
        if (!("asset" in balance)) {
          return null;
        }

        const address = balance.asset.contract.address;

        return (
          <div key={address}>
            {balance.__typename === "NativeAmount" && (
              <TokenBalance
                symbol={NATIVE_TOKEN_SYMBOL}
                value={balance.value}
              />
            )}
            {balance.__typename === "Erc20Amount" && (
              <TokenBalance
                symbol={balance.asset.symbol}
                value={balance.value}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TokenBalances;
