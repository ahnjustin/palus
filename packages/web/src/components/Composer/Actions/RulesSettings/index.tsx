import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { Modal, Tooltip } from "@/components/Shared/UI";
import cn from "@/helpers/cn";
import { usePostRulesStore } from "@/store/non-persisted/post/usePostRulesStore";
import Rules from "./Rules";

const RulesSettings = () => {
  const [showModal, setShowModal] = useState(false);
  const { followersOnly, followingOnly } = usePostRulesStore();
  const hasRules = followersOnly || followingOnly;

  return (
    <>
      <Tooltip content="Rules" placement="top" withDelay>
        <button
          aria-label="Rules"
          className="flex items-center rounded-full outline-offset-8"
          onClick={() => setShowModal(!showModal)}
          type="button"
        >
          <AdjustmentsHorizontalIcon
            className={cn(hasRules && "text-brand-500", "size-5")}
          />
        </button>
      </Tooltip>
      <Modal onClose={() => setShowModal(false)} show={showModal} title="Rules">
        <Rules setShowModal={setShowModal} />
      </Modal>
    </>
  );
};

export default RulesSettings;
