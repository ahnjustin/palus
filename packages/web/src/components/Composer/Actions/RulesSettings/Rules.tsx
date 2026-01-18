import type { Dispatch, SetStateAction } from "react";
import ToggleWithHelper from "@/components/Shared/ToggleWithHelper";
import { Button } from "@/components/Shared/UI";
import { usePostRulesStore } from "@/store/non-persisted/post/usePostRulesStore";

interface RulesProps {
  setShowModal: Dispatch<SetStateAction<boolean>>;
  groupAddress?: string;
}

const Rules = ({ setShowModal, groupAddress }: RulesProps) => {
  const {
    followersOnly,
    followingOnly,
    groupGate,
    setFollowersOnly,
    setFollowingOnly,
    setGroupGate
  } = usePostRulesStore();

  return (
    <>
      <div className="m-5 space-y-5">
        <ToggleWithHelper
          description="Only people who follow you can reply, quote, or repost"
          heading={
            <span className="font-semibold">
              Restrict to <span className="font-bold">my followers</span>
            </span>
          }
          on={!!followersOnly}
          setOn={() => setFollowersOnly(!followersOnly)}
        />
        <ToggleWithHelper
          description="Only people who you follow can reply, quote, or repost"
          heading={
            <span className="font-semibold">
              Restrict to <span className="font-bold">accounts I follow</span>
            </span>
          }
          on={!!followingOnly}
          setOn={() => setFollowingOnly(!followingOnly)}
        />
        {groupAddress ? (
          <ToggleWithHelper
            description="Only members of the group can reply"
            heading={
              <span className="font-semibold">
                Restrict to <span className="font-bold">group members</span>
              </span>
            }
            on={!!groupGate}
            setOn={() => setGroupGate(groupGate ? undefined : groupAddress)}
          />
        ) : null}
      </div>
      <div className="divider" />
      <div className="flex space-x-2 px-5 py-3">
        <Button
          className="ml-auto"
          onClick={() => {
            setFollowersOnly(false);
            setFollowingOnly(false);
            setGroupGate(undefined);
            setShowModal(false);
          }}
          outline
        >
          Reset
        </Button>
        <Button onClick={() => setShowModal(false)}>Save</Button>
      </div>
    </>
  );
};

export default Rules;
