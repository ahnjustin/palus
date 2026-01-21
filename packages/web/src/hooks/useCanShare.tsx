import type { PostFragment } from "@palus/indexer";
import { readContracts } from "@wagmi/core";
import { useCallback, useEffect, useState } from "react";
import { useConfig } from "wagmi";
import { collectorOnlyPostRuleAbi } from "@/data/abis/colletorOnlyPostRuleAbi";
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

const collectorOnlyPostRuleContract = {
  abi: collectorOnlyPostRuleAbi,
  address: CONTRACTS.collectorOnlyPostRule
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
      const isCollectorOnlyRule = canRepostOperation.extraChecksRequired.find(
        (rule) => rule.address === CONTRACTS.collectorOnlyPostRule
      );
      if ((!isFollowingOnlyRule && !isCollectorOnlyRule) || isLoading) {
        setCanRepost(false);
        setCanQuote(false);
        return;
      }

      setIsLoading(true);
      try {
        let result: { canRepost: boolean; canQuote: boolean };
        if (isCollectorOnlyRule) {
          const res = await readContracts(config, {
            contracts: [
              {
                ...collectorOnlyPostRuleContract,
                args: [post.feed.address, post.id, currentAccount.address],
                functionName: "validateCanRepost"
              },
              {
                ...collectorOnlyPostRuleContract,
                args: [post.feed.address, post.id, currentAccount.address],
                functionName: "validateCanQuote"
              }
            ]
          });
          result = {
            canQuote: res[1].result ?? false,
            canRepost: res[0].result ?? false
          };
        } else {
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
          result = {
            canQuote: res[1].result ?? false,
            canRepost: res[0].result ?? false
          };
        }
        setCanRepost(result.canRepost);
        setCanQuote(result.canQuote);
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
