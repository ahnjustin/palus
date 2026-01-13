import { useNotificationIndicatorQuery } from "@palus/indexer";
import { useAccountStore } from "@/store/persisted/useAccountStore";
import { useNotificationStore } from "@/store/persisted/useNotificationStore";
import { usePreferencesStore } from "@/store/persisted/usePreferencesStore";

const useHasNewNotifications = () => {
  const { currentAccount } = useAccountStore();
  const { lastSeenNotificationId } = useNotificationStore();
  const { includeLowScore } = usePreferencesStore();

  const { data } = useNotificationIndicatorQuery({
    skip: !currentAccount,
    variables: { request: { filter: { includeLowScore } } }
  });

  const latestNotificationWithId = data?.notifications?.items?.find(
    (notification) => "id" in notification
  );
  const latestId = latestNotificationWithId?.id;

  if (!latestId || !currentAccount) {
    return false;
  }

  return latestId !== lastSeenNotificationId;
};

export default useHasNewNotifications;
