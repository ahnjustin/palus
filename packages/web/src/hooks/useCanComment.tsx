import type { PostFragment } from "@palus/indexer";
import { readContract } from "@wagmi/core";
import { useCallback, useEffect, useState } from "react";
import { useConfig } from "wagmi";
import { collectorOnlyPostRuleAbi } from "@/data/abis/colletorOnlyPostRuleAbi";
import { followingOnlyPostRuleAbi } from "@/data/abis/followingOnlyPostRuleAbi";
import { groupGatedPostRuleAbi } from "@/data/abis/groupGatedPostRuleAbi";
import { CONTRACTS } from "@/data/contracts";
import { useAccountStore } from "@/store/persisted/useAccountStore";

interface PostRuleValidationProps {
  post: PostFragment | undefined;
}

const followingOnlyPostRuleContract = {
  abi: followingOnlyPostRuleAbi,
  address: CONTRACTS.followingOnlyPostRule
};

const groupGatedPostRuleContract = {
  abi: groupGatedPostRuleAbi,
  address: CONTRACTS.groupGatedPostRule
};

const collectorOnlyPostRuleContract = {
  abi: collectorOnlyPostRuleAbi,
  address: CONTRACTS.collectorOnlyPostRule
};

const useCanComment = ({ post }: PostRuleValidationProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [canComment, setCanComment] = useState(false);
  const [reason, setReason] = useState<string | null>(null);

  const config = useConfig();
  const { currentAccount } = useAccountStore();

  const validateCanComment = useCallback(async () => {
    if (!currentAccount || !post || !post.operations) {
      setIsLoading(false);
      setCanComment(false);
      setReason(null);
      return;
    }

    const canCommentOperation = post.operations.canComment;

    if (canCommentOperation.__typename === "PostOperationValidationFailed") {
      setIsLoading(false);
      setCanComment(false);
      setReason(
        canCommentOperation.unsatisfiedRules?.required?.[0].message ?? null
      );
      return;
    }

    if (canCommentOperation.__typename === "PostOperationValidationPassed") {
      setIsLoading(false);
      setCanComment(true);
      setReason(null);
      return;
    }

    if (canCommentOperation.__typename === "PostOperationValidationUnknown") {
      const isFollowingOnlyRule = canCommentOperation.extraChecksRequired.find(
        (rule) => rule.address === CONTRACTS.followingOnlyPostRule
      );
      const isGroupGatedRule = canCommentOperation.extraChecksRequired.find(
        (rule) => rule.address === CONTRACTS.groupGatedPostRule
      );
      const isCollectorOnlyRule = canCommentOperation.extraChecksRequired.find(
        (rule) => rule.address === CONTRACTS.collectorOnlyPostRule
      );

      if (!isFollowingOnlyRule && !isGroupGatedRule && !isCollectorOnlyRule) {
        setIsLoading(false);
        setCanComment(false);
        setReason(null);
        return;
      }

      setReason(null);
      setIsLoading(true);
      try {
        const args = [
          post.feed.address,
          post.id,
          currentAccount.address
        ] as const;
        let canCommentResult = true;
        let failureReason: string | null = null;

        if (isGroupGatedRule && canCommentResult) {
          canCommentResult = await readContract(config, {
            ...groupGatedPostRuleContract,
            args,
            functionName: "validateCanReply"
          });
          if (!canCommentResult) {
            failureReason = "You must be a member of the Group to comment";
          }
        }

        if (isCollectorOnlyRule && canCommentResult) {
          canCommentResult = await readContract(config, {
            ...collectorOnlyPostRuleContract,
            args,
            functionName: "validateCanReply"
          });
          if (!canCommentResult) {
            failureReason = "You must collect the root Post to comment";
          }
        }

        // Check following only rule
        if (isFollowingOnlyRule && canCommentResult) {
          canCommentResult = await readContract(config, {
            ...followingOnlyPostRuleContract,
            args,
            functionName: "validateCanReply"
          });
          if (!canCommentResult) {
            failureReason =
              "You must be followed by the author of the root post to comment";
          }
        }

        setCanComment(canCommentResult);
        setReason(failureReason);
      } catch {
        setCanComment(false);
        setReason(null);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    setIsLoading(false);
    setCanComment(false);
    setReason(null);
  }, [post, config, currentAccount]);

  useEffect(() => {
    validateCanComment();
  }, [validateCanComment]);

  return {
    data: canComment,
    isLoading,
    reason
  };
};

export default useCanComment;
