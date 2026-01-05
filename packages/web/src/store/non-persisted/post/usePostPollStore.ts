import { createTrackedStore } from "@/store/createTrackedStore";

interface State {
  pollConfig: {
    length: number;
    options: string[];
  };
  resetPollConfig: () => void;
  setPollConfig: (pollConfig: { length: number; options: string[] }) => void;
  setShowPollEditor: (showPollEditor: boolean) => void;
  showPollEditor: boolean;
}

const { useStore: usePostPollStore } = createTrackedStore<State>((set) => ({
  pollConfig: { length: 7, options: ["", ""] },
  resetPollConfig: () =>
    set(() => ({ pollConfig: { length: 7, options: ["", ""] } })),
  setPollConfig: (pollConfig) => set(() => ({ pollConfig })),
  setShowPollEditor: (showPollEditor) => set(() => ({ showPollEditor })),
  showPollEditor: false
}));

export { usePostPollStore };
