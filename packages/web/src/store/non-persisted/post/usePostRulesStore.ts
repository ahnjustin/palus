import { createTrackedStore } from "@/store/createTrackedStore";

interface State {
  followersOnly: boolean;
  followingOnly: boolean;
  setFollowersOnly: (followersOnly: boolean) => void;
  setFollowingOnly: (followingOnly: boolean) => void;
}

const { useStore: usePostRulesStore } = createTrackedStore<State>((set) => ({
  followersOnly: false,
  followingOnly: false,
  setFollowersOnly: (followersOnly: boolean) => set(() => ({ followersOnly })),
  setFollowingOnly: (followingOnly: boolean) => set(() => ({ followingOnly }))
}));

export { usePostRulesStore };
