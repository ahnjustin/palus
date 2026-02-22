import { Menu, MenuButton, MenuItems } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import type { GroupFragment, GroupMemberFragment } from "@palus/indexer";
import { Fragment, useState } from "react";
import BanMember from "@/components/Group/Members/Actions/Ban";
import Loader from "@/components/Shared/Loader";
import MenuTransition from "@/components/Shared/MenuTransition";
import stopEventPropagation from "@/helpers/stopEventPropagation";
import { useAccountStore } from "@/store/persisted/useAccountStore";

interface Props {
  member: GroupMemberFragment;
  group: GroupFragment;
}

const AdminActions = ({ member, group }: Props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentAccount } = useAccountStore();

  if (
    group.owner !== currentAccount?.address ||
    group.owner === member.account.address
  ) {
    return null;
  }

  if (isSubmitting) {
    return <Loader small />;
  }

  return (
    <Menu as="div" className="relative">
      <MenuButton as={Fragment}>
        <button
          aria-label="More"
          className="rounded-full p-1.5 hover:bg-gray-300/20"
          onClick={stopEventPropagation}
          type="button"
        >
          <EllipsisVerticalIcon className="size-5 text-gray-500 dark:text-gray-200" />
        </button>
      </MenuButton>
      <MenuTransition>
        <MenuItems
          anchor="bottom end"
          className="mt-2 w-48 origin-top-right rounded-xl border border-gray-200 bg-white shadow-xs focus:outline-hidden dark:border-gray-800 dark:bg-gray-900"
          static
        >
          <BanMember
            group={group}
            isSubmitting={isSubmitting}
            member={member}
            setIsSubmitting={setIsSubmitting}
          />
        </MenuItems>
      </MenuTransition>
    </Menu>
  );
};

export default AdminActions;
