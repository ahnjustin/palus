import {
  type GroupFragment,
  useGroupMembershipRequestsQuery
} from "@palus/indexer";
import plur from "plur";
import { useState } from "react";
import GraphStatsShimmer from "@/components/Shared/Shimmer/GraphStatsShimmer";
import { Modal } from "@/components/Shared/UI";
import humanize from "@/helpers/humanize";
import MembershipRequests from "./MembershipRequests";

interface Props {
  group: GroupFragment;
}

const MembershipRequestsCount = ({ group }: Props) => {
  const [showMemberRequestsModal, setShowMemberRequestsModal] = useState(false);

  const { data, loading } = useGroupMembershipRequestsQuery({
    variables: { request: { group: group.address } }
  });

  if (loading) {
    return <GraphStatsShimmer count={1} />;
  }

  if (!data) {
    return null;
  }

  const count = data?.groupMembershipRequests.items.length;
  const hasMore = data?.groupMembershipRequests.pageInfo.next;

  return (
    <div className="flex gap-8">
      <button
        className="flex gap-x-1"
        onClick={() => setShowMemberRequestsModal(true)}
        type="button"
      >
        <b>
          {humanize(count)}
          {hasMore && "+"}
        </b>
        <span className="text-gray-500 dark:text-gray-200">
          {plur("Request", count)}
        </span>
      </button>
      <Modal
        onClose={() => setShowMemberRequestsModal(false)}
        show={showMemberRequestsModal}
        size="xs"
        title="Membership Requests"
      >
        <MembershipRequests group={group} />
      </Modal>
    </div>
  );
};

export default MembershipRequestsCount;
