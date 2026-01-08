import type { UnknownActionConfigInput } from "@palus/indexer";
import dayjs from "dayjs";
import { encodeAbiParameters, keccak256, stringToBytes } from "viem";
import { CONTRACTS } from "@/data/contracts";
import type { PollConfig } from "@/store/non-persisted/post/usePostPollStore";

const pollActionParams = (pollConfig: PollConfig) => {
  return {
    unknown: {
      address: CONTRACTS.pollVoteAction,
      params: [
        {
          raw: {
            data: encodeAbiParameters(
              [{ name: "options", type: "string[]" }],
              [pollConfig.options]
            ),
            key: keccak256(stringToBytes("lens.param.options"))
          }
        },
        {
          raw: {
            data: encodeAbiParameters(
              [{ name: "endTimestamp", type: "uint72" }],
              [BigInt(dayjs().add(pollConfig.durationInDays, "day").unix())]
            ),
            key: keccak256(stringToBytes("lens.param.endTimestamp"))
          }
        },
        {
          raw: {
            data: encodeAbiParameters(
              [{ name: "allowMultipleAnswers", type: "bool" }],
              [false]
            ),
            key: keccak256(stringToBytes("lens.param.allowMultipleAnswers"))
          }
        }
      ]
    } satisfies UnknownActionConfigInput
  };
};

export default pollActionParams;
