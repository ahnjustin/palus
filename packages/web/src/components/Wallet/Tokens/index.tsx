import {
  type AnyBalance,
  useUnwrapTokensMutation,
  useWrapTokensMutation
} from "@palus/indexer";
import { useState } from "react";
import { Button, Image, Tooltip } from "@/components/Shared/UI";
import { IS_TESTNET, NATIVE_TOKEN_SYMBOL } from "@/data/constants";
import getTokenImage from "@/helpers/getTokenImage";
import TokenOperation from "../TokenOperation";

interface TokenBalanceProps {
  value: string;
  symbol: string;
  onClick: () => void;
  buttonLabel: string;
}

const TokenBalance = ({
  value,
  symbol,
  onClick,
  buttonLabel
}: TokenBalanceProps) => {
  return (
    <div className="group flex flex-wrap items-center justify-between gap-5">
      <div className="flex items-center gap-2">
        <Image
          alt={symbol}
          className="size-7 rounded-full"
          src={getTokenImage(IS_TESTNET ? undefined : symbol)}
        />
        <span className="font-bold">{symbol}</span>
      </div>
      <div className="flex items-center gap-x-3">
        <Button
          disabled={Number(value) === 0}
          onClick={onClick}
          outline
          size="sm"
        >
          {buttonLabel}
        </Button>
        <Tooltip content={value}>
          <span className="font-bold">
            ${Number.parseFloat(value).toFixed(2)}{" "}
          </span>
        </Tooltip>
      </div>
    </div>
  );
};

interface TokenProps {
  balances: AnyBalance[] | undefined;
  refetch: () => void;
}

const Tokens = ({ balances, refetch }: TokenProps) => {
  const [showWrapModal, setShowWrapModal] = useState(false);
  const [showUnwrapModal, setShowUnwrapModal] = useState(false);

  if (!balances || balances.length === 0) {
    return <div className="p-5">No tokens found.</div>;
  }

  return (
    <>
      <div className="space-y-5 px-5 pt-2 pb-4 sm:px-0 sm:pb-0">
        {balances.map((balance) => {
          if (!("asset" in balance)) {
            return null;
          }

          const address = balance.asset.contract.address;

          return (
            <div key={address}>
              {balance.__typename === "NativeAmount" && (
                <TokenBalance
                  buttonLabel="Wrap"
                  onClick={() => setShowWrapModal(true)}
                  symbol={NATIVE_TOKEN_SYMBOL}
                  value={balance.value}
                />
              )}
              {balance.__typename === "Erc20Amount" && (
                <TokenBalance
                  buttonLabel="Unwrap"
                  onClick={() => setShowUnwrapModal(true)}
                  symbol={balance.asset.symbol}
                  value={balance.value}
                />
              )}
            </div>
          );
        })}
      </div>
      <TokenOperation
        balances={balances}
        refetch={refetch}
        resultKey="wrapTokens"
        setShowModal={setShowWrapModal}
        showModal={showWrapModal}
        successMessage="Wrap Successful"
        title="Wrap"
        useMutationHook={useWrapTokensMutation}
      />
      <TokenOperation
        balances={balances}
        refetch={refetch}
        resultKey="unwrapTokens"
        setShowModal={setShowUnwrapModal}
        showModal={showUnwrapModal}
        successMessage="Unwrap Successful"
        title="Unwrap"
        useMutationHook={useUnwrapTokensMutation}
      />
    </>
  );
};

export default Tokens;
