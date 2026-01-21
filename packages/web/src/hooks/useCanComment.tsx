import type { PostFragment } from "@palus/indexer";
import { readContract } from "@wagmi/core";
import { useCallback, useEffect, useState } from "react";
import { useConfig } from "wagmi";
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

const useCanComment = ({ post }: PostRuleValidationProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [canComment, setCanComment] = useState(false);
  const [reason, setReason] = useState<string | null>(null);

  const config = useConfig();
  const { currentAccount } = useAccountStore();

  const validateCanComment = useCallback(async () => {
    const canCommentOperation = post?.operations?.canComment;
    if (!currentAccount || !post || !canCommentOperation) {
      setCanComment(false);
      setReason(null);
      return;
    }
    if (canCommentOperation.__typename === "PostOperationValidationFailed") {
      setCanComment(false);
      setReason(
        canCommentOperation.unsatisfiedRules?.required?.[0].message ?? null
      );
      return;
    }

    if (canCommentOperation.__typename === "PostOperationValidationPassed") {
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
      if ((!isFollowingOnlyRule && !isGroupGatedRule) || isLoading) {
        setCanComment(false);
        setReason(null);
        return;
      }

      setIsLoading(true);
      try {
        let canComment: boolean;
        if (isGroupGatedRule) {
          canComment = await readContract(config, {
            ...groupGatedPostRuleContract,
            args: [post.feed.address, post.id, currentAccount.address],
            functionName: "validateCanReply"
          });
        } else {
          canComment = await readContract(config, {
            ...followingOnlyPostRuleContract,
            args: [post.feed.address, post.id, currentAccount.address],
            functionName: "validateCanReply"
          });
        }
        setCanComment(canComment);
        setReason(
          canComment
            ? null
            : isGroupGatedRule
              ? "You must be a member of the Group to comment"
              : "You must be followed by the author of the root post to comment."
        );
      } catch {
        setCanComment(false);
        setReason(null);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    setCanComment(false);
  }, [post]);

  useEffect(() => {
    validateCanComment();
  }, [post]);

  return {
    data: canComment,
    isLoading,
    reason
  };
};

export default useCanComment;
