import { formatEther } from "viem";
import { NATIVE_TOKEN_SYMBOL } from "@/data/constants";
import { CONTRACTS } from "@/data/contracts";
import type { DecodedTransaction } from "@/helpers/decodeTransaction";
import type { Transaction } from "./types";

export const camelToCapitalized = (str: string): string => {
  return str
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase())
    .trim();
};

export const getTransactionLabel = (
  decodedTx: DecodedTransaction | null,
  tx: Transaction,
  isReceived: boolean,
  value: bigint
): { label: string; detail?: string } => {
  if (!decodedTx && value) {
    let action: string | undefined;
    if (tx.from === CONTRACTS.simpleCollectAction) {
      action = "Post collected";
    } else if (tx.from === CONTRACTS.tippingPostAction) {
      action = "Post tip";
    } else if (tx.to === CONTRACTS.actionHub) {
      action = "Acted on a post";
    }
    if (!action) {
      return isReceived
        ? { label: `Received ${NATIVE_TOKEN_SYMBOL}` }
        : { label: `Sent ${NATIVE_TOKEN_SYMBOL}` };
    }
    return isReceived
      ? { detail: `Received ${NATIVE_TOKEN_SYMBOL}`, label: action }
      : { detail: `Sent ${NATIVE_TOKEN_SYMBOL}`, label: action };
  }

  const firstAction = decodedTx?.decodedActions[0];
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
    } else if (postActionContract === CONTRACTS.tippingAccountAction) {
      action = "Tipped an account";
    }
  }

  if (value > 0n && !action) {
    return isReceived
      ? { label: `Received ${NATIVE_TOKEN_SYMBOL}` }
      : { label: `Sent ${NATIVE_TOKEN_SYMBOL}` };
  }

  return firstAction && contractType && action
    ? { detail: contractType, label: camelToCapitalized(action) }
    : {
        label: decodedTx ? "Contract interaction" : "Internal transaction"
      };
};

export const getTransactionStatus = (tx: Transaction) => {
  const isInternalTx = !tx.input || tx.type === "call";
  return (isInternalTx && tx.isError === "0") || Number(tx.confirmations) > 0
    ? "Confirmed"
    : "Pending";
};

export const getTransactionValueDisplay = (
  txValue: string,
  isReceived: boolean
) => {
  const value = BigInt(txValue);
  if (value === 0n) {
    return "$0.00";
  }
  const formatted = formatEther(value);
  const prefix = isReceived ? "+" : "-";
  return `${prefix}$${Number.parseFloat(formatted).toFixed(2)}`;
};
