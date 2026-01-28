import { ArrowDownIcon } from "@heroicons/react/24/solid";
import { Button } from "@/components/Shared/UI";
import { useFundModalStore } from "@/store/non-persisted/modal/useFundModalStore";

interface Props {
  disabled: boolean;
}

const Deposit = ({ disabled }: Props) => {
  const { setShowFundModal } = useFundModalStore();

  return (
    <Button
      disabled={disabled}
      onClick={() =>
        setShowFundModal({
          showFundModal: true
        })
      }
      outline
      size="lg"
    >
      <ArrowDownIcon
        className="size-6 rounded-full border border-border bg-gray-50 p-1 dark:bg-gray-700"
        stroke="currentColor"
        strokeWidth={2}
      />
      Deposit
    </Button>
  );
};

export default Deposit;
