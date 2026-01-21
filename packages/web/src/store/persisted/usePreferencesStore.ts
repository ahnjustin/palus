import { Localstorage } from "@/data/storage";
import { createPersistedTrackedStore } from "@/store/createTrackedStore";

interface State {
  includeCommentsInTimeline: boolean;
  includeLowScore: boolean;
  replaceLensLinks: boolean;
  setIncludeCommentsInTimeline: (includeCommentsInTimeline: boolean) => void;
  setIncludeLowScore: (includeLowScore: boolean) => void;
  setReplaceLensLinks: (replaceLensLinks: boolean) => void;
}

const { useStore: usePreferencesStore } = createPersistedTrackedStore<State>(
  (set) => ({
    includeCommentsInTimeline: true,
    includeLowScore: false,
    replaceLensLinks: true,
    setIncludeCommentsInTimeline: (includeCommentsInFeed) =>
      set(() => ({ includeCommentsInTimeline: includeCommentsInFeed })),
    setIncludeLowScore: (includeLowScore) => set(() => ({ includeLowScore })),
    setReplaceLensLinks: (replaceLensLinks) => set(() => ({ replaceLensLinks }))
  }),
  { name: Localstorage.PreferencesStore }
);

export { usePreferencesStore };
