import type {
  AccountMentionFragment,
  PostMentionFragment
} from "@palus/indexer";
import { Regex } from "@/data/regex";

const getMentions = (text: string): PostMentionFragment[] => {
  if (!text) return [];

  const mentions = text.match(Regex.accountMention) ?? [];

  return mentions.map((mention) => {
    const hasSeparator = mention.includes("/");
    let namespace = "";
    let handle = "";

    if (hasSeparator) {
      // Format: @namespace/handle
      const parts = mention.substring(1).split("/"); // Remove @ and split
      namespace = parts[0].toLowerCase();
      handle = parts[1].toLowerCase();
    } else {
      // Format: @handle
      handle = mention.substring(1).toLowerCase(); // Remove @ 
      namespace = handle; // Use handle as namespace for simple mentions
    }

    return {
      account: handle,
      namespace: namespace,
      replace: { from: mention, to: mention }
    } as AccountMentionFragment;
  });
};

export default getMentions;