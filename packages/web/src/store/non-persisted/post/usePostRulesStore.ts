import { createTrackedStore } from "@/store/createTrackedStore";

interface State {
  followersOnly: boolean;
  followingOnly: boolean;
  groupGate?: string;
  setFollowersOnly: (followersOnly: boolean) => void;
  setFollowingOnly: (followingOnly: boolean) => void;
  setGroupGate: (groupGate?: string) => void;
}

const { useStore: usePostRulesStore } = createTrackedStore<State>((set) => ({
  followersOnly: false,
  followingOnly: false,
  groupGate: undefined,
  setFollowersOnly: (followersOnly: boolean) => set(() => ({ followersOnly })),
  setFollowingOnly: (followingOnly: boolean) => set(() => ({ followingOnly })),
  setGroupGate: (groupGate?: string) => set(() => ({ groupGate }))
}));

export { usePostRulesStore };
