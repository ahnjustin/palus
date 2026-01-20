import type { PostFragment } from "@palus/indexer";
import { readContracts } from "@wagmi/core";
import { useCallback, useEffect, useState } from "react";
import { useConfig } from "wagmi";
import { followingOnlyPostRuleAbi } from "@/data/abis/followingOnlyPostRuleAbi";
import { CONTRACTS } from "@/data/contracts";
import { useAccountStore } from "@/store/persisted/useAccountStore";

interface PostRuleValidationProps {
  post: PostFragment | undefined;
}

const followingOnlyPostRuleContract = {
  abi: followingOnlyPostRuleAbi,
  address: CONTRACTS.followingOnlyPostRule
};

const useCanShare = ({ post }: PostRuleValidationProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [canRepost, setCanRepost] = useState(false);
  const [canQuote, setCanQuote] = useState(false);

  const config = useConfig();
  const { currentAccount } = useAccountStore();

  const validateCanReference = useCallback(async () => {
    if (!currentAccount || !post || !post.operations) {
      setCanRepost(false);
      setCanQuote(false);
      return;
    }

    const canRepostOperation = post.operations.canRepost;
    if (canRepostOperation.__typename === "PostOperationValidationFailed") {
      setCanRepost(false);
    } else if (
      canRepostOperation?.__typename === "PostOperationValidationPassed"
    ) {
      setCanRepost(true);
    }

    const canQuoteOperation = post.operations.canQuote;
    if (canQuoteOperation.__typename === "PostOperationValidationFailed") {
      setCanQuote(false);
    } else if (
      canQuoteOperation?.__typename === "PostOperationValidationPassed"
    ) {
      setCanQuote(true);
    }

    if (
      canRepostOperation.__typename === "PostOperationValidationUnknown" &&
      canQuoteOperation.__typename === "PostOperationValidationUnknown"
    ) {
      const isFollowingOnlyRule = canRepostOperation.extraChecksRequired.find(
        (rule) => rule.address === CONTRACTS.followingOnlyPostRule
      );
      if (!isFollowingOnlyRule || isLoading) {
        setCanRepost(false);
        setCanQuote(false);
        return;
      }

      setIsLoading(true);
      try {
        const res = await readContracts(config, {
          contracts: [
            {
              ...followingOnlyPostRuleContract,
              args: [post.feed.address, post.id, currentAccount.address],
              functionName: "validateCanRepost"
            },
            {
              ...followingOnlyPostRuleContract,
              args: [post.feed.address, post.id, currentAccount.address],
              functionName: "validateCanQuote"
            }
          ]
        });
        setCanRepost(res[0].result ?? false);
        setCanQuote(res[1].result ?? false);
      } catch {
        setCanRepost(false);
        setCanQuote(false);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    setCanRepost(false);
    setCanQuote(false);
  }, [post]);

  useEffect(() => {
    validateCanReference();
  }, [post]);

  return {
    canQuote,
    canRepost,
    isLoading
  };
};

export default useCanShare;
