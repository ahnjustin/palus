import { ArrowsRightLeftIcon, CpuChipIcon } from "@heroicons/react/24/outline";
import { useInfiniteQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useCallback } from "react";
import { Link } from "react-router";
import { formatEther, type Hex } from "viem";
import { Virtualizer } from "virtua";
import {
  EmptyState,
  ErrorMessage,
  Spinner,
  Tooltip
} from "@/components/Shared/UI";
import {
  BLOCK_EXPLORER_API_URL,
  BLOCK_EXPLORER_URL,
  NATIVE_TOKEN_SYMBOL
} from "@/data/constants";
import { CONTRACTS } from "@/data/contracts";
import cn from "@/helpers/cn";
import formatRelativeOrAbsolute from "@/helpers/datetime/formatRelativeOrAbsolute";
import {
  type DecodedTransaction,
  decodeDelegatedTransaction
} from "@/helpers/decodeTransaction";
import useLoadMoreOnIntersect from "@/hooks/useLoadMoreOnIntersect";

const GET_TRANSACTIONS_QUERY_KEY = "getTransactions";
const PAGE_SIZE = 20;

interface Transaction {
  timeStamp: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  isError: string;
  input: string;
  confirmations: string;
  functionName: string;
}

interface TransactionsResponse {
  status: string;
  message: string;
  result: Transaction[];
}

interface ActivityProps {
  account: string;
}

const Activity = ({ account }: ActivityProps) => {
  const getTransactions = async (
    page: number
  ): Promise<{ transactions: Transaction[]; nextPage: number | null }> => {
    try {
      const response = await fetch(
        `${BLOCK_EXPLORER_API_URL}?module=account&action=txlist&page=${page}&offset=${PAGE_SIZE}&address=${account}`
      );

      if (!response.ok) {
        return { nextPage: null, transactions: [] };
      }

      const data: TransactionsResponse = await response.json();

      if (data.status !== "1" || !Array.isArray(data.result)) {
        return { nextPage: null, transactions: [] };
      }

      return {
        nextPage: data.result.length === PAGE_SIZE ? page + 1 : null,
        transactions: data.result
      };
    } catch {
      return { nextPage: null, transactions: [] };
    }
  };

  const { data, error, fetchNextPage, hasNextPage, isFetching, isLoading } =
    useInfiniteQuery<
      { transactions: Transaction[]; nextPage: number | null },
      Error
    >({
      enabled: Boolean(account),
      getNextPageParam: (lastPage) => lastPage.nextPage,
      initialPageParam: 1,
      queryFn: ({ pageParam }) => getTransactions(pageParam as number),
      queryKey: [GET_TRANSACTIONS_QUERY_KEY, account]
    });

  const transactions = data?.pages.flatMap((page) => page.transactions) ?? [];

  const handleEndReached = useCallback(async () => {
    if (hasNextPage) {
      await fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage]);

  const loadMoreRef = useLoadMoreOnIntersect(handleEndReached);

  const camelToCapitalized = (str: string): string => {
    return str
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (char) => char.toUpperCase())
      .trim();
  };

  const getTransactionLabel = (
    decodedTx: DecodedTransaction,
    isReceived: boolean
  ): { label: string; detail?: string } => {
    const value = BigInt(decodedTx.value ?? 0);
    if (value > 0n) {
      return isReceived
        ? { label: `Received ${NATIVE_TOKEN_SYMBOL}` }
        : { label: `Sent ${NATIVE_TOKEN_SYMBOL}` };
    }

    const firstAction = decodedTx.decodedActions[0];
    const contractType = firstAction?.contractType;

    let action = firstAction?.action;
    if (firstAction?.action === "executePostAction") {
      const postActionContract = firstAction.parameters?.action;
      if (postActionContract === CONTRACTS.pollVoteAction) {
        action = "Voted on a poll";
      } else if (postActionContract === CONTRACTS.simpleCollectAction) {
        action = "Collected a post";
      } else if (postActionContract === CONTRACTS.tippingPostAction) {
        action = "Tipped a post";
      }
    }

    return firstAction && contractType
      ? { detail: contractType, label: camelToCapitalized(action) }
      : { label: "Contract interaction" };
  };

  const getTransactionStatus = (tx: Transaction) => {
    return Number(tx.confirmations) > 0 ? "Confirmed" : "Pending";
  };

  const getTransactionValue = (tx: DecodedTransaction, isReceived: boolean) => {
    const value = BigInt(tx.value ?? 0);
    if (value === 0n) {
      return "$0.00";
    }
    const formatted = formatEther(value);
    const prefix = isReceived ? "+" : "-";
    return `${prefix}$${Number.parseFloat(formatted).toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-5">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage
        className="m-5"
        error={error}
        title="Failed to load transactions"
      />
    );
  }

  if (!transactions.length) {
    return (
      <div className="p-5">
        <EmptyState
          hideCard
          icon={<ArrowsRightLeftIcon className="size-8" />}
          message="No transactions."
        />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <Virtualizer>
        {transactions.map((tx) => {
          const decodedTx = decodeDelegatedTransaction(tx.input as Hex);
          const firstAction = decodedTx.decodedActions[0];
          const isReceived =
            firstAction?.target?.toLowerCase() === account.toLowerCase();

          const label = getTransactionLabel(decodedTx, isReceived);
          const status = getTransactionStatus(tx);
          const value = getTransactionValue(decodedTx, isReceived);
          const date = dayjs(Number(tx.timeStamp) * 1000);

          return (
            <Link
              className={
                "mb-1 flex items-center justify-between rounded-lg px-3 py-2 hover:bg-gray-300/20"
              }
              key={tx.hash}
              rel="noreferrer noopener"
              target="_blank"
              to={`${BLOCK_EXPLORER_URL}/tx/${tx.hash}`}
            >
              <div className="flex min-w-0 items-center gap-x-2">
                {BigInt(decodedTx.value ?? 0) > 0n ? (
                  <ArrowsRightLeftIcon className="size-7 rounded-full bg-gray-200 p-1 text-gray-600 dark:bg-gray-700 dark:text-gray-400" />
                ) : label.detail ? (
                  <svg
                    className="size-7 rounded-full bg-gray-200 p-1.5 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                    fill="none"
                    viewBox="0 0 204 130"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <title>Lens Logo</title>
                    <path
                      clipRule="evenodd"
                      d="M140.236 34.2127C148.585 27.1958 157.901 24.5261 166.835 25.201C176.365 25.9209 185.184 30.4204 191.77 36.956C198.357 43.492 202.881 52.2342 203.606 61.6691C204.336 71.19 201.172 81.1618 192.828 89.9136C192.064 90.7192 191.284 91.5148 190.488 92.3003C152.642 129.852 102.368 129.951 101.854 129.951H101.851C101.595 129.951 51.1619 129.949 13.2174 92.2951L13.2091 92.2868C12.4258 91.5047 11.6543 90.7177 10.8946 89.9256L10.8884 89.9192C2.54038 81.175 -0.627422 71.2055 0.101149 61.6848C0.823023 52.2515 5.3448 43.5082 11.9292 36.9699C18.5132 30.432 27.3314 25.929 36.8631 25.206C45.7966 24.5283 55.1141 27.1948 63.4682 34.2084C64.3665 23.3909 69.0465 14.9717 75.8401 9.1837C83.0857 3.0105 92.5278 0 101.852 0C111.176 0 120.618 3.0105 127.864 9.1837C134.658 14.9725 139.338 23.3931 140.236 34.2127Z"
                      fill="currentColor"
                      fillRule="evenodd"
                    />
                  </svg>
                ) : (
                  <CpuChipIcon className="size-7 rounded-full bg-gray-200 p-1 text-gray-600 dark:bg-gray-700 dark:text-gray-400" />
                )}
                <div className="flex min-w-0 flex-col">
                  {label.detail ? (
                    <div className="flex min-w-0 items-center gap-x-1 truncate">
                      <span className="truncate font-medium">
                        {label.detail}
                      </span>
                      <span className="flex-none rounded-md bg-gray-200 px-1 text-secondary text-sm dark:bg-gray-800">
                        {label.label}
                      </span>
                    </div>
                  ) : (
                    <span className="truncate font-medium">{label.label}</span>
                  )}
                  {tx.isError === "1" ? (
                    <span className="text-red-600 text-sm">Failed</span>
                  ) : (
                    <span
                      className={cn(
                        "text-sm",
                        status === "Confirmed"
                          ? "text-green-600"
                          : "text-yellow-600"
                      )}
                    >
                      {status}
                    </span>
                  )}
                </div>
              </div>
              <div className="ml-4 flex flex-none flex-col items-end">
                <span>
                  <Tooltip
                    content={date.format("MMM D, YYYY h:mm A")}
                    placement="left"
                  >
                    <div className="text-secondary text-sm">
                      {formatRelativeOrAbsolute(date.toISOString())}
                    </div>
                  </Tooltip>
                </span>
                <Tooltip
                  content={formatEther(
                    BigInt(decodedTx.value ?? "0")
                  ).toString()}
                >
                  <span
                    className={cn(
                      "font-medium",
                      BigInt(decodedTx.value ?? 0) === 0n
                        ? "text-on-surface"
                        : isReceived
                          ? "text-green-600"
                          : "text-red-600"
                    )}
                  >
                    {value}
                  </span>
                </Tooltip>
              </div>
            </Link>
          );
        })}
        {hasNextPage && <span ref={loadMoreRef} />}
        {isFetching && !isLoading && (
          <div className="flex justify-center p-5">
            <Spinner size="sm" />
          </div>
        )}
      </Virtualizer>
    </div>
  );
};

export default Activity;
