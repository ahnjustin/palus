import { ArrowRightIcon } from "@heroicons/react/24/solid";
import type { AnyBalance, Erc20Amount, NativeAmount } from "@palus/indexer";
import { accountAbi } from "lens-modules/abis";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { type Hex, isAddress, parseEther } from "viem";
import { useWriteContract } from "wagmi";
import SearchAccounts from "@/components/Shared/Account/SearchAccounts";
import { Button, Input, Modal, Select } from "@/components/Shared/UI";
import { ADDRESS_PLACEHOLDER } from "@/data/constants";
import { TOKENS } from "@/data/tokens";
import useUmami from "@/hooks/useUmami";
import { useAccountStore } from "@/store/persisted/useAccountStore";

interface SendProps {
  balances: AnyBalance[];
  disabled: boolean;
}

const Send = ({ balances, disabled }: SendProps) => {
  const [showModal, setShowModal] = useState(false);
  const [inputValue, setInputValue] = useState<string>("");
  const [recipient, setRecipient] = useState<string>("");
  const [selectedToken, setSelectedToken] = useState<string>(
    TOKENS[0].contractAddress
  );

  const { currentAccount } = useAccountStore();
  const { track } = useUmami();

  const { mutateAsync: writeContractAsync, isPending } = useWriteContract();

  const balance = useMemo(() => {
    return balances?.find(
      (balance) =>
        (balance.__typename === "NativeAmount" ||
          balance.__typename === "Erc20Amount") &&
        balance.asset.contract.address.toLowerCase() ===
          selectedToken.toLowerCase()
    ) as NativeAmount | Erc20Amount | undefined;
  }, [selectedToken, balances]);

  const handleSubmit = async () => {
    if (!currentAccount || !isAddress(recipient)) return;

    try {
      await writeContractAsync({
        abi: accountAbi,
        address: currentAccount.address,
        args: [recipient as Hex, parseEther(inputValue), "0x"],
        functionName: "executeTransaction"
      });
    } catch (e) {
      console.error("handleSubmit: executeTransaction error=", e);
      toast.error("Failed to send tokens.");
      return;
    }

    toast.success("Tokens sent successfully!");
    setShowModal(false);
    setInputValue("");
    setRecipient("");
    track("Token operation", {
      sendTokens: TOKENS.find(
        (token) =>
          token.contractAddress.toLowerCase() === selectedToken.toLowerCase()
      )?.symbol
    });
  };

  return (
    <>
      <Button
        disabled={disabled}
        onClick={() => setShowModal(true)}
        outline
        size="lg"
      >
        <ArrowRightIcon
          className="size-6 rounded-full border border-border bg-gray-50 p-1 dark:bg-gray-700"
          stroke="currentColor"
          strokeWidth={2}
        />
        Send
      </Button>
      <Modal onClose={() => setShowModal(false)} show={showModal} title="Send">
        <div className="flex flex-col gap-y-3 p-5">
          <SearchAccounts
            error={recipient.length > 0 && !isAddress(recipient)}
            hideDropdown={isAddress(recipient)}
            onAccountSelected={(account) => setRecipient(account.address)}
            onChange={(event) => setRecipient(event.target.value)}
            placeholder={`${ADDRESS_PLACEHOLDER} or wagmi`}
            value={recipient}
          />
          <div className="flex items-center gap-x-3">
            <Input
              inputMode="decimal"
              min={0}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="0.5"
              type="number"
              value={inputValue}
            />
            <Select
              onChange={setSelectedToken}
              options={TOKENS.map((token) => ({
                label: token.symbol,
                selected: selectedToken === token.contractAddress,
                value: token.contractAddress
              }))}
            />
          </div>
          <div>
            Balance: {balance ? Number(balance.value).toFixed(4) : "0"}{" "}
            {balance && "asset" in balance ? balance.asset.symbol : ""}
          </div>
          <Button
            className="w-full"
            disabled={
              isPending ||
              !inputValue ||
              Number(inputValue) <= 0 ||
              !isAddress(recipient)
            }
            loading={isPending}
            onClick={handleSubmit}
            size="lg"
          >
            Send
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default Send;
