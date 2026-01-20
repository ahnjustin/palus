import type { PostFragment } from "@palus/indexer";
import { readContract } from "@wagmi/core";
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

const useCanComment = ({ post }: PostRuleValidationProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [canComment, setCanComment] = useState(false);
  const [reason, setReason] = useState<string | null>(null);

  const config = useConfig();
  const { currentAccount } = useAccountStore();

  const validateCanComment = useCallback(async () => {
    const canCommentOperation = post?.operations?.canComment;
    if (
      !currentAccount ||
      !post ||
      !canCommentOperation ||
      canCommentOperation.__typename === "PostOperationValidationFailed"
    ) {
      setCanComment(false);
      setReason(
        "You must be following the author of the root post to comment."
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
      if (!isFollowingOnlyRule || isLoading) {
        setCanComment(false);
        setReason(null);
        return;
      }

      setIsLoading(true);
      try {
        const canComment = await readContract(config, {
          ...followingOnlyPostRuleContract,
          args: [post.feed.address, post.id, currentAccount.address],
          functionName: "validateCanReply"
        });
        setCanComment(canComment);
        setReason(
          canComment
            ? null
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
