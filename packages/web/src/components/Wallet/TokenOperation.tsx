import type { AnyBalance, Erc20Amount, NativeAmount } from "@palus/indexer";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button, Input, Modal, Select } from "@/components/Shared/UI";
import { CONTRACTS } from "@/data/contracts";
import { TOKENS } from "@/data/tokens";
import errorToast from "@/helpers/errorToast";
import useTransactionLifecycle from "@/hooks/useTransactionLifecycle";
import type { ApolloClientError } from "@/types/errors";

interface TokenOperationProps {
  useMutationHook: any;
  resultKey: string;
  title: string;
  successMessage: string;
  balances: AnyBalance[];
  refetch: () => void;
  showModal: boolean;
  setShowModal: (show: boolean) => void;
}

const TokenOperation = ({
  useMutationHook,
  resultKey,
  title,
  successMessage,
  balances,
  refetch,
  showModal,
  setShowModal
}: TokenOperationProps) => {
  const [selectedToken, setSelectedToken] = useState<string>(
    TOKENS[0].contractAddress
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [maxValue, setMaxValue] = useState<string>("0");
  const [inputValue, setInputValue] = useState<string>("");
  const handleTransactionLifecycle = useTransactionLifecycle();

  useEffect(() => {
    const balance = balances?.find(
      (balance) =>
        (balance.__typename === "NativeAmount" ||
          balance.__typename === "Erc20Amount") &&
        balance.asset.contract.address.toLowerCase() ===
          selectedToken.toLowerCase()
    ) as NativeAmount | Erc20Amount | undefined;
    const value = balance?.value ?? "0";
    setMaxValue(value || "0");
  }, [selectedToken, balances]);

  const onCompleted = () => {
    setShowModal(false);
    setIsSubmitting(false);
    refetch();
    toast.success(successMessage);
  };

  const onError = useCallback((error: ApolloClientError) => {
    setIsSubmitting(false);
    errorToast(error);
  }, []);

  const [mutate] = useMutationHook({
    onCompleted: async (data: any) => {
      const result = data?.[resultKey];
      if (result?.__typename === "InsufficientFunds") {
        return onError({
          message: "Insufficient funds",
          name: "InsufficientFunds"
        });
      }

      return await handleTransactionLifecycle({
        onCompleted,
        onError,
        transactionData: result
      });
    },
    onError
  });

  const handleSubmit = () => {
    if (!inputValue || Number(inputValue) <= 0) {
      return;
    }

    setIsSubmitting(true);

    return mutate({
      variables: {
        request:
          resultKey === "withdraw"
            ? selectedToken === CONTRACTS.wrappedNativeToken
              ? { erc20: { currency: selectedToken, value: inputValue } }
              : { native: inputValue }
            : { amount: inputValue }
      }
    });
  };

  return (
    <Modal
      onClose={() => setShowModal(false)}
      show={showModal}
      size="xs"
      title={title}
    >
      <div className="space-y-2 p-5">
        {resultKey === "withdraw" && (
          <Select
            onChange={setSelectedToken}
            options={TOKENS.map((token) => ({
              label: token.symbol,
              selected: selectedToken === token.contractAddress,
              value: token.contractAddress
            }))}
          />
        )}
        <div className="mb-5 flex items-center gap-2">
          <Input
            autoFocus
            inputMode="decimal"
            min={0}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="0.5"
            type="number"
            value={inputValue}
          />
          <Button onClick={() => setInputValue(maxValue)} size="lg">
            Max
          </Button>
        </div>
        <Button
          className="w-full"
          disabled={isSubmitting || !inputValue || Number(inputValue) <= 0}
          loading={isSubmitting}
          onClick={handleSubmit}
          size="lg"
        >
          {title}
        </Button>
      </div>
    </Modal>
  );
};

export default TokenOperation;
