import { ArrowDownIcon } from "@heroicons/react/24/solid";
import { Button } from "@/components/Shared/UI";
import { useFundModalStore } from "@/store/non-persisted/modal/useFundModalStore";

const Deposit = () => {
  const { setShowFundModal } = useFundModalStore();

  return (
    <Button
      onClick={() =>
        setShowFundModal({
          showFundModal: true
        })
      }
      outline
      size="lg"
    >
      <ArrowDownIcon
        className="size-6 rounded-full border border-border p-1"
        stroke="currentColor"
        strokeWidth={2}
      />
      Deposit
    </Button>
  );
};

export default Deposit;
