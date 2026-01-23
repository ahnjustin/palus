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
      setIsLoading(false);
      setCanRepost(false);
      setCanQuote(false);
      return;
    }

    const canRepostOperation = post.operations.canRepost;
    const canQuoteOperation = post.operations.canQuote;

    const repostPassed =
      canRepostOperation.__typename === "PostOperationValidationPassed";
    const repostFailed =
      canRepostOperation.__typename === "PostOperationValidationFailed";
    const quotePassed =
      canQuoteOperation.__typename === "PostOperationValidationPassed";
    const quoteFailed =
      canQuoteOperation.__typename === "PostOperationValidationFailed";

    if ((repostPassed || repostFailed) && (quotePassed || quoteFailed)) {
      setIsLoading(false);
      setCanRepost(repostPassed);
      setCanQuote(quotePassed);
      return;
    }

    const repostUnknown =
      canRepostOperation.__typename === "PostOperationValidationUnknown";
    const quoteUnknown =
      canQuoteOperation.__typename === "PostOperationValidationUnknown";

    if (!repostUnknown && !quoteUnknown) {
      setIsLoading(false);
      setCanRepost(repostPassed);
      setCanQuote(quotePassed);
      return;
    }

    const isFollowingOnlyRule =
      repostUnknown &&
      canRepostOperation.extraChecksRequired.find(
        (rule) => rule.address === CONTRACTS.followingOnlyPostRule
      );
    const isCollectorOnlyRule =
      repostUnknown &&
      canRepostOperation.extraChecksRequired.find(
        (rule) => rule.address === CONTRACTS.collectorOnlyPostRule
      );

    if (!isFollowingOnlyRule && !isCollectorOnlyRule) {
      setIsLoading(false);
      setCanRepost(false);
      setCanQuote(false);
      return;
    }

    setIsLoading(true);
    try {
      const contracts = [];
      const args = [
        post.feed.address,
        post.id,
        currentAccount.address
      ] as const;

      if (isFollowingOnlyRule) {
        contracts.push(
          {
            ...followingOnlyPostRuleContract,
            args,
            functionName: "validateCanRepost"
          } as const,
          {
            ...followingOnlyPostRuleContract,
            args,
            functionName: "validateCanQuote"
          } as const
        );
      }

      if (isCollectorOnlyRule) {
        contracts.push(
          {
            ...collectorOnlyPostRuleContract,
            args,
            functionName: "validateCanRepost"
          } as const,
          {
            ...collectorOnlyPostRuleContract,
            args,
            functionName: "validateCanQuote"
          } as const
        );
      }

      const res = await readContracts(config, { contracts });

      let canRepostResult: boolean;
      let canQuoteResult: boolean;

      if (isFollowingOnlyRule && isCollectorOnlyRule) {
        // Indices: 0,1 = following (repost, quote), 2,3 = collector (repost, quote)
        canRepostResult = Boolean(res[0].result) && Boolean(res[2].result);
        canQuoteResult = Boolean(res[1].result) && Boolean(res[3].result);
      } else if (isFollowingOnlyRule) {
        canRepostResult = Boolean(res[0].result);
        canQuoteResult = Boolean(res[1].result);
      } else {
        canRepostResult = Boolean(res[0].result);
        canQuoteResult = Boolean(res[1].result);
      }

      setCanRepost(canRepostResult);
      setCanQuote(canQuoteResult);
    } catch {
      setCanRepost(false);
      setCanQuote(false);
    } finally {
      setIsLoading(false);
    }
  }, [post, config, currentAccount]);

  useEffect(() => {
    validateCanReference();
  }, [validateCanReference]);

  return {
    canQuote,
    canRepost,
    isLoading
  };
};

export default useCanShare;
