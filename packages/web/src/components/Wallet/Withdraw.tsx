import { ArrowUpIcon } from "@heroicons/react/24/solid";
import { type AnyBalance, useWithdrawMutation } from "@palus/indexer";
import { useState } from "react";
import { Button } from "@/components/Shared/UI";
import TokenOperation from "./TokenOperation";

interface WithdrawProps {
  balances: AnyBalance[];
  refetch: () => void;
}

const Withdraw = ({ balances, refetch }: WithdrawProps) => {
  const [showModal, setShowModal] = useState(false);
  return (
    <>
      <Button onClick={() => setShowModal(true)} outline size="lg">
        <ArrowUpIcon
          className="size-6 rounded-full border border-border p-1"
          stroke="currentColor"
          strokeWidth={2}
        />
        Withdraw
      </Button>
      <TokenOperation
        balances={balances}
        refetch={refetch}
        resultKey="withdraw"
        setShowModal={setShowModal}
        showModal={showModal}
        successMessage="Withdrawal Successful"
        title="Withdraw"
        useMutationHook={useWithdrawMutation}
      />
    </>
  );
};

export default Withdraw;
