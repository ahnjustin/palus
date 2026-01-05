import type { UnknownActionConfigInput } from "@palus/indexer";
import { encodeAbiParameters, keccak256, stringToBytes } from "viem";
import { CONTRACTS } from "@/data/contracts";

const pollActionParams = (pollConfig: {
  length: number;
  options: string[];
}) => {
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
              [
                BigInt(
                  Math.floor(Date.now() / 1000) + pollConfig.length * 86400
                )
              ]
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
