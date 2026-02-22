import type { ApolloCache, NormalizedCacheObject } from "@apollo/client";
import { MenuItem } from "@headlessui/react";
import { NoSymbolIcon } from "@heroicons/react/24/outline";
import {
  type GroupFragment,
  type GroupMemberFragment,
  useBanGroupAccountsMutation
} from "@palus/indexer";
import { type MouseEvent, useCallback } from "react";
import Loader from "@/components/Shared/Loader";
import cn from "@/helpers/cn";
import errorToast from "@/helpers/errorToast";
import stopEventPropagation from "@/helpers/stopEventPropagation";
import useTransactionLifecycle from "@/hooks/useTransactionLifecycle";
import type { ApolloClientError } from "@/types/errors";

interface Props {
  member: GroupMemberFragment;
  group: GroupFragment;
  setIsSubmitting: (isSubmitting: boolean) => void;
  isSubmitting: boolean;
}

const menuItemClassName = ({ focus }: { focus: boolean }) =>
  cn(
    { "dropdown-active": focus },
    "m-2 flex cursor-pointer items-center space-x-2 rounded-lg px-2 py-1.5 text-sm text-red-500"
  );

const BanMember = ({ member, group, setIsSubmitting, isSubmitting }: Props) => {
  const handleTransactionLifecycle = useTransactionLifecycle();

  const onError = useCallback((error: ApolloClientError) => {
    setIsSubmitting(false);
    errorToast(error);
  }, []);

  const onCompleted = (hash: string) => {
    setIsSubmitting(false);
  };

  const [banAccounts] = useBanGroupAccountsMutation({
    onCompleted: async ({ banGroupAccounts }) => {
      if (banGroupAccounts.__typename === "BanGroupAccountsResponse") {
        return onCompleted(banGroupAccounts.hash);
      }

      return await handleTransactionLifecycle({
        onCompleted,
        onError,
        transactionData: banGroupAccounts
      });
    },
    onError
  });

  const updateCache = (cache: ApolloCache<NormalizedCacheObject>) => {
    cache.modify({
      fields: {
        groupMembers(existing, { readField }) {
          if (!existing) return existing;
          return {
            ...existing,
            items: existing.items.filter(
              (itemRef: any) =>
                readField("address", readField("account", itemRef)) !==
                member.account.address
            )
          };
        },
        groupStats(existing, { readField }) {
          if (!existing) return existing;
          const currentTotal = readField("totalMembers", existing) as number;
          return {
            ...existing,
            totalMembers: currentTotal - 1
          };
        }
      }
    });
  };

  const handleClick = useCallback(
    async (event: MouseEvent) => {
      stopEventPropagation(event);
      setIsSubmitting(true);
      await banAccounts({
        update: updateCache,
        variables: {
          request: {
            accounts: [member.account.address],
            group: group.address
          }
        }
      });
    },
    [member.account]
  );

  return (
    <MenuItem
      as="div"
      className={menuItemClassName}
      disabled={isSubmitting}
      onClick={handleClick}
    >
      {isSubmitting ? <Loader small /> : <NoSymbolIcon className="size-4" />}
      <div>Ban account</div>
    </MenuItem>
  );
};

export default BanMember;
