import {
  EllipsisVerticalIcon,
  ExclamationTriangleIcon,
  Square2StackIcon
} from "@heroicons/react/24/outline";
import { type AnyBalance, useBalancesBulkQuery } from "@palus/indexer";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import NotLoggedIn from "@/components/Shared/NotLoggedIn";
import PageLayout from "@/components/Shared/PageLayout";
import Skeleton from "@/components/Shared/Skeleton";
import { Card, CardHeader, Tabs, Tooltip } from "@/components/Shared/UI";
import ActivityShimmer from "@/components/Wallet/Activity/Shimmer";
import TokensShimmer from "@/components/Wallet/Tokens/Shimmer";
import { CONTRACTS } from "@/data/contracts";
import type { AccountFeedType } from "@/data/enums";
import formatAddress from "@/helpers/formatAddress";
import useCopyToClipboard from "@/hooks/useCopyToClipboard";
import { useAccountStore } from "@/store/persisted/useAccountStore";
import Activity from "./Activity";
import Deposit from "./Deposit";
import Send from "./Send";
import Tokens from "./Tokens";
import Withdraw from "./Withdraw";

enum WalletTab {
  Tokens = "TOKENS",
  Activity = "ACTIVITY"
}

const Wallet = () => {
  const [activeTab, setActiveTab] = useState<string>(WalletTab.Tokens);

  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab");

  const { currentAccount } = useAccountStore();

  useEffect(() => {
    if (!tab) {
      setActiveTab(WalletTab.Tokens);
      return;
    }
    setActiveTab(tab.toUpperCase() as AccountFeedType);
  }, [tab]);

  const { data, refetch, loading, error } = useBalancesBulkQuery({
    pollInterval: 10000,
    skip: !currentAccount?.address,
    variables: {
      request: {
        address: currentAccount?.address,
        includeNative: true,
        tokens: [CONTRACTS.wrappedNativeToken]
      }
    }
  });

  const copyAddress = useCopyToClipboard(
    currentAccount?.address,
    "Address copied to clipboard!"
  );

  const totalBalance =
    data?.balancesBulk?.reduce((acc, balance) => {
      if (
        balance.__typename === "NativeAmount" ||
        balance.__typename === "Erc20Amount"
      ) {
        return acc + Number.parseFloat(balance.value);
      }
      return acc;
    }, 0) || 0;

  const tabs = [
    { name: "Tokens", type: WalletTab.Tokens },
    { name: "Activity", type: WalletTab.Activity }
  ];

  if (!currentAccount) {
    return <NotLoggedIn />;
  }

  return (
    <PageLayout zeroTopMargin>
      <Card>
        <CardHeader title="Account Wallet" />
        <div className="flex items-center justify-between px-5 pt-4">
          <div className="flex items-center gap-x-1 text-sm">
            {formatAddress(currentAccount.address)}
            <Square2StackIcon
              className="size-4 cursor-pointer hover:text-brand-500"
              onClick={copyAddress}
            />
          </div>
          <button
            aria-label="More"
            className="rounded-full p-1.5 hover:bg-gray-300/20"
            type="button"
          >
            <EllipsisVerticalIcon className="size-5 text-on-surface" />
          </button>
        </div>
        {loading ? (
          <div className="center flex p-3">
            <Skeleton className="h-12 w-48 rounded-lg" />
          </div>
        ) : error ? (
          <div className="center flex flex-col p-3">
            <ExclamationTriangleIcon className="size-8" />
            Error loading balance
          </div>
        ) : (
          <div className="center flex p-3 font-semibold text-5xl">
            <Tooltip content={totalBalance} placement="top">
              ${totalBalance.toFixed(2)}
            </Tooltip>
          </div>
        )}
        <div className="flex justify-center gap-x-4 px-5 py-2">
          <Deposit disabled={loading || !!error} />
          <Send
            balances={data?.balancesBulk as AnyBalance[]}
            disabled={loading || !!error}
          />
          <Withdraw
            balances={data?.balancesBulk as AnyBalance[]}
            disabled={loading || !!error}
            refetch={refetch}
          />
        </div>
        <div className="flex flex-col gap-y-2 pt-4 sm:p-5">
          <Tabs
            active={activeTab}
            className="border-border border-y py-2 sm:px-0"
            layoutId="wallet-tabs"
            setActive={(type) => {
              setActiveTab(type);
              setSearchParams(
                type !== WalletTab.Tokens ? { tab: type.toLowerCase() } : {}
              );
            }}
            tabs={tabs}
          />
          {activeTab === WalletTab.Tokens ? (
            loading ? (
              <TokensShimmer />
            ) : error ? (
              <div className="p-5">Error loading tokens.</div>
            ) : (
              <Tokens
                balances={data?.balancesBulk as AnyBalance[]}
                refetch={refetch}
              />
            )
          ) : null}
          {activeTab === WalletTab.Activity ? (
            loading ? (
              <ActivityShimmer />
            ) : (
              <Activity account={currentAccount.address} />
            )
          ) : null}
        </div>
      </Card>
    </PageLayout>
  );
};

export default Wallet;
