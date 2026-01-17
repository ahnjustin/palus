import { PostRuleExecuteOn, type PostRulesConfigInput } from "@palus/indexer";
import { CONTRACTS } from "@/data/contracts";
import { toKeyValueInput } from "@/helpers/keyValueInput";

const postRuleParams = ({
  followersOnly,
  followingOnly
}: {
  followersOnly: boolean;
  followingOnly: boolean;
}): PostRulesConfigInput | undefined => {
  if (!followingOnly && !followingOnly) {
    return undefined;
  }

  const rules: PostRulesConfigInput = {};
  rules.required = [];
  if (followersOnly) {
    rules.required.push({
      followersOnlyRule: {
        quotesRestricted: true,
        repliesRestricted: true,
        repostRestricted: true
      }
    });
  }
  if (followingOnly) {
    rules.required.push({
      unknownRule: {
        address: CONTRACTS.followingOnlyPostRule,
        executeOn: [PostRuleExecuteOn.CreatingPost],
        params: [
          toKeyValueInput(
            "lens.param.graph",
            "address",
            CONTRACTS.lensGlobalGraph
          ),
          toKeyValueInput("lens.param.repliesRestricted", "bool", true),
          toKeyValueInput("lens.param.repostsRestricted", "bool", true),
          toKeyValueInput("lens.param.quotesRestricted", "bool", true)
        ]
      }
    });
  }
  return rules;
};

export default postRuleParams;
